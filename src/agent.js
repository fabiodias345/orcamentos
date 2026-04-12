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
    `sistema solar ${kwpR}kWp preço instalação ${cidade} ${estado} 2024 2025`,
    `energia solar fotovoltaica orçamento ${cidade} ${estado} chave na mão`,
    `custo sistema fotovoltaico ${Math.round(kwp)}kWp integrador ${estado} site:mercadolivre.com OR site:olx.com.br OR site:solfacil.com.br OR site:getninjas.com.br`,
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

  // ── Etapa 3: prompt estruturado para o Gemini ────────────────────────────
  const prompt = `Você é um especialista em mercado de energia solar fotovoltaica no Brasil.

Analise os dados coletados da internet sobre preços de sistemas solares em ${cidade}/${estado} para um sistema de ${kwpR} kWp e retorne uma análise de posicionamento competitivo.

DADOS COLETADOS DA INTERNET:
${contexto}

PREÇO DO INTEGRADOR: R$ ${precoIntegrador?.toLocaleString('pt-BR') ?? 'não informado'}
POTÊNCIA DO SISTEMA: ${kwpR} kWp
LOCALIDADE: ${cidade} / ${estado}

Instruções:
- Extraia faixas de preço reais mencionados nos dados
- Calcule o preço médio por kWp da região (referência: R$ 3.500 a R$ 6.500/kWp para sistemas acima de 10kWp)
- Se não houver dados suficientes, use os valores de referência nacional ajustados pela região
- Compare o preço do integrador com o mercado

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
