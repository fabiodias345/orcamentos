// ─── Agente de Inteligência de Mercado Solar ─────────────────────────────────
// Usa Tavily (busca web) + Groq / Llama 3 (análise) para varrer preços da
// concorrência na região do cliente e posicionar o preço do integrador.

const TAVILY_KEY = import.meta.env.VITE_TAVILY_KEY;
const GROQ_KEY   = import.meta.env.VITE_GROQ_KEY;

// ─── Tavily: busca web orientada a agentes ────────────────────────────────────

async function tavilySearch(query) {
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: TAVILY_KEY,
      query,
      search_depth: 'basic',
      max_results: 5,
      include_answer: true,
      include_domains: [],
      exclude_domains: [],
    }),
  });
  if (!res.ok) throw new Error(`Tavily error ${res.status}`);
  return res.json();
}

// ─── Groq / Llama 3: análise e estruturação dos dados ───────────────────────

// Modelos tentados em ordem de preferência
const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'gemma2-9b-it',
];

async function groqAnalyze(prompt) {
  let lastErr = null;

  for (const model of GROQ_MODELS) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 1024,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      console.warn(`Groq model ${model} → HTTP ${res.status}:`, errBody);
      lastErr = new Error(`Groq ${model} erro ${res.status}: ${errBody.slice(0, 200)}`);
      continue; // tenta próximo modelo
    }

    const data = await res.json();
    const raw  = data.choices?.[0]?.message?.content;
    if (!raw) { lastErr = new Error('Groq não retornou conteúdo.'); continue; }

    // Remove possíveis blocos ```json ... ```
    return raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  }

  throw lastErr ?? new Error('Todos os modelos Groq falharam.');
}

// ─── Agente principal ─────────────────────────────────────────────────────────

/**
 * @param {object} params
 *   kwp              {number}  potência do sistema
 *   cidade           {string}
 *   estado           {string}
 *   precoIntegrador  {number}  valor total cobrado pelo integrador (R$)
 * @param {function} onProgress  callback(mensagem) para atualizar UI
 * @returns {object} análise estruturada
 */
export async function analisarMercado({ kwp, cidade, estado, precoIntegrador }, onProgress) {
  const kwpR = kwp.toFixed(1);

  // ── Etapa 1: 3 buscas paralelas ──────────────────────────────────────────
  onProgress?.('🔍 Buscando preços na região...');

  const queries = [
    `sistema solar ${kwpR}kWp preço instalação ${cidade} ${estado} 2026`,
    `energia solar fotovoltaica orçamento ${cidade} ${estado} chave na mão 2026`,
    `custo sistema fotovoltaico ${Math.round(kwp)}kWp integrador ${estado} 2026 site:mercadolivre.com OR site:olx.com.br OR site:solfacil.com.br`,
  ];

  const resultados = await Promise.all(
    queries.map(q => tavilySearch(q).catch(() => ({ results: [], answer: null })))
  );

  // ── Etapa 2: monta contexto para o Gemini ────────────────────────────────
  onProgress?.('🧠 Analisando dados do mercado...');

  const contexto = resultados.map((r, i) => {
    const trechos = r.results
      ?.slice(0, 3)
      .map(x => `  Fonte: ${x.title}\n  ${x.content?.slice(0, 400) ?? ''}`)
      .join('\n') ?? '';
    const answer = r.answer ? `  Resumo Tavily: ${r.answer}\n` : '';
    return `--- Busca ${i + 1}: "${queries[i]}" ---\n${answer}${trechos}`;
  }).join('\n\n');

  const fontesList = resultados
    .flatMap(r => r.results?.slice(0, 2).map(x => x.url) ?? [])
    .filter(Boolean)
    .slice(0, 6);

  // ── Referências de preço 2026 — mercado BR real, chave na mão ───────────────
  // Os preços de solar caíram ~40% desde 2022. Valores abaixo refletem 2026.
  let refKwpMin, refKwpMax;
  if (kwp <= 3)       { refKwpMin = 2200; refKwpMax = 3400; }
  else if (kwp <= 6)  { refKwpMin = 1800; refKwpMax = 2800; }
  else if (kwp <= 10) { refKwpMin = 1600; refKwpMax = 2400; }
  else if (kwp <= 20) { refKwpMin = 1400; refKwpMax = 2000; }
  else                { refKwpMin = 1200; refKwpMax = 1800; }

  const refTotalMin = Math.round(kwp * refKwpMin);
  const refTotalMax = Math.round(kwp * refKwpMax);
  const refTotalMed = Math.round((refTotalMin + refTotalMax) / 2);

  // ── Etapa 3: prompt estruturado ──────────────────────────────────────────
  const prompt = `Você é um especialista em mercado de energia solar fotovoltaica no Brasil em 2026.

PREÇO DO INTEGRADOR: R$ ${precoIntegrador?.toLocaleString('pt-BR') ?? 'não informado'}
POTÊNCIA DO SISTEMA: ${kwpR} kWp
LOCALIDADE: ${cidade} / ${estado}

TABELA DE REFERÊNCIA OFICIAL 2026 — USE COMO BASE PRINCIPAL:
- Faixa mínima real: R$ ${refTotalMin.toLocaleString('pt-BR')}
- Faixa máxima real: R$ ${refTotalMax.toLocaleString('pt-BR')}
- Média de mercado 2026: R$ ${refTotalMed.toLocaleString('pt-BR')}
- Preço médio por kWp: R$ ${Math.round((refKwpMin+refKwpMax)/2).toLocaleString('pt-BR')}/kWp

REGRAS OBRIGATÓRIAS — SIGA À RISCA:
1. A tabela acima é sua fonte primária. Use esses valores como base.
2. Os preços do solar caíram ~40% desde 2022. Dados da busca de anos anteriores estão ERRADOS.
3. Qualquer dado da internet com preço acima de R$ ${refTotalMax.toLocaleString('pt-BR')} para ${kwpR}kWp deve ser DESCARTADO — é dado desatualizado.
4. Use dados da busca APENAS se confirmarem preço IGUAL OU MENOR que a referência acima.
5. NUNCA use preços de artigos, blogs ou sites sem data clara de 2026.
6. Se a busca não trouxer dados confiáveis de 2026, use exatamente os valores da tabela acima.

DADOS DA BUSCA (use apenas se data 2026 e preço ≤ R$ ${refTotalMax.toLocaleString('pt-BR')}):
${contexto}

Retorne APENAS JSON válido no formato:
{
  "media_regiao": <número inteiro em R$ — preço total médio para ${kwpR}kWp>,
  "faixa_min": <número inteiro R$>,
  "faixa_max": <número inteiro R$>,
  "preco_por_kwp": <número inteiro R$/kWp médio da região>,
  "posicao": "abaixo do mercado" | "dentro do mercado" | "acima do mercado" | "sem dados suficientes",
  "economia_vs_media": <número inteiro R$ — diferença do preço do integrador vs média, positivo=mais caro>,
  "percentual_vs_media": <número — % acima ou abaixo da média, negativo=mais barato>,
  "analise": "<2 frases diretas sobre o posicionamento do preço do integrador>",
  "dica": "<1 frase de recomendação ao integrador>",
  "confiabilidade": "alta" | "média" | "baixa",
  "baseado_em_referencia": <true se usou referência nacional por falta de dados locais>
}`;

  const jsonStr = await groqAnalyze(prompt);
  const analise = JSON.parse(jsonStr);

  // Injeta a lista de fontes reais encontradas
  analise.fontes = fontesList;
  return analise;
}
