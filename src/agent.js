// ─── Agente de Inteligência de Mercado Solar ─────────────────────────────────
// Usa Tavily (busca web) + Google Gemini Flash (análise) para varrer preços da
// concorrência na região do cliente e posicionar o preço do integrador.

const TAVILY_KEY  = import.meta.env.VITE_TAVILY_KEY;
const GEMINI_KEY  = import.meta.env.VITE_GEMINI_KEY;

// ─── Tavily: busca web orientada a agentes ────────────────────────────────────

async function tavilySearch(query, options = {}) {
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: TAVILY_KEY,
      query,
      search_depth: options.depth ?? 'basic',
      max_results: options.maxResults ?? 5,
      include_answer: true,
      days: options.days ?? 180,
      include_domains: options.domains ?? [],
      exclude_domains: options.exclude ?? [],
    }),
  });
  if (!res.ok) throw new Error(`Tavily error ${res.status}`);
  return res.json();
}

// ─── Google Gemini Flash: análise e estruturação dos dados ───────────────────

async function geminiAnalyze(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_KEY}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',  // força JSON puro, sem markdown
      },
      systemInstruction: {
        parts: [{ text: 'Você é um analista de mercado de energia solar no Brasil. Responda SEMPRE com JSON válido, sem texto adicional, sem blocos de código markdown.' }]
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`Gemini erro ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const raw  = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error('Gemini não retornou conteúdo.');

  return raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
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

  // Busca 1: anúncios reais em marketplaces — preços praticados hoje
  // Busca 2: integradores locais com preço explícito na cidade/estado
  // Busca 3: distribuidoras e cotações recentes do estado
  const searches = [
    tavilySearch(
      `sistema solar ${kwpR}kWp instalado ${cidade} preço R$`,
      { domains: ['olx.com.br', 'mercadolivre.com.br', 'getninjas.com.br', 'habitissimo.com.br'], days: 180, maxResults: 6 }
    ),
    tavilySearch(
      `orçamento sistema fotovoltaico ${kwpR}kWp chave na mão ${cidade} ${estado}`,
      { depth: 'advanced', days: 180, maxResults: 5 }
    ),
    tavilySearch(
      `energia solar ${Math.round(kwp)}kWp instalação completa preço ${estado}`,
      { domains: ['solfacil.com.br', 'aldo.com.br', 'portal.solar'], days: 270, maxResults: 5 }
    ),
  ];

  const resultados = await Promise.all(searches.map(p => p.catch(() => ({ results: [], answer: null }))));

  // ── Etapa 2: monta contexto para o Gemini ────────────────────────────────
  onProgress?.('🧠 Analisando dados do mercado...');

  const contexto = resultados.map((r, i) => {
    const trechos = r.results
      ?.slice(0, 3)
      .map(x => `  Fonte: ${x.title} | URL: ${x.url}\n  ${x.content?.slice(0, 400) ?? ''}`)
      .join('\n') ?? '';
    const answer = r.answer ? `  Resumo: ${r.answer}\n` : '';
    return `--- Busca ${i + 1} ---\n${answer}${trechos}`;
  }).join('\n\n');

  const fontesList = resultados
    .flatMap(r => r.results?.slice(0, 2).map(x => x.url) ?? [])
    .filter(Boolean)
    .slice(0, 6);

  // ── Etapa 3: prompt estruturado ──────────────────────────────────────────
  const prompt = `Você é um especialista em mercado de energia solar fotovoltaica no Brasil.

SISTEMA ANALISADO:
- Potência: ${kwpR} kWp | Localidade: ${cidade}/${estado}
- Preço do integrador: R$ ${precoIntegrador?.toLocaleString('pt-BR') ?? 'não informado'}

DADOS REAIS COLETADOS DA INTERNET (anúncios e cotações recentes):
${contexto}

INSTRUÇÕES PARA ANÁLISE DE PREÇOS:
- Use SOMENTE os preços encontrados nos dados acima — esses são preços reais praticados
- Priorize anúncios de OLX, MercadoLivre, GetNinjas e Habitissimo pois têm preços de mercado real
- Preços de instalação completa (chave na mão) incluem: equipamentos + mão de obra + projeto + homologação
- Se encontrar apenas preços de equipamentos (sem instalação), adicione 40-60% para estimar chave na mão
- Se os dados forem insuficientes ou contraditórios, indique confiabilidade "baixa" e use sua estimativa fundamentada
- NÃO invente preços. Se não há dados, diga que não há dados suficientes na região

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

  const jsonStr = await geminiAnalyze(prompt);
  const analise = JSON.parse(jsonStr);

  // Injeta a lista de fontes reais encontradas
  analise.fontes = fontesList;
  return analise;
}
