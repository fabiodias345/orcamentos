import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const FROM_EMAIL     = Deno.env.get('FROM_EMAIL') || 'propostas@solarpropostas.com.br';

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, nome, pdf_url, empresa_nome } = await req.json();

    if (!to || !nome || !pdf_url) {
      return new Response(JSON.stringify({ error: 'Parâmetros obrigatórios: to, nome, pdf_url' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Busca o PDF e converte para base64 em chunks (evita stack overflow em PDFs grandes)
    const pdfResp = await fetch(pdf_url);
    if (!pdfResp.ok) throw new Error('Não foi possível baixar o PDF do storage');
    const pdfBuffer = await pdfResp.arrayBuffer();
    const uint8 = new Uint8Array(pdfBuffer);
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < uint8.length; i += chunkSize) {
      binary += String.fromCharCode(...uint8.subarray(i, i + chunkSize));
    }
    const pdfBase64 = btoa(binary);

    const nomeEmpresa = empresa_nome || 'Equipe Comercial';

    const payload = {
      from: `${nomeEmpresa} <${FROM_EMAIL}>`,
      to:   [to],
      subject: `Proposta Comercial – Energia Solar Fotovoltaica | ${nome}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <div style="background: linear-gradient(135deg, #f59e0b, #ea580c); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">☀️ Proposta de Energia Solar</h1>
          </div>
          <div style="background: #f9fafb; padding: 32px; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px;">Olá, <strong>${nome}</strong>!</p>
            <p style="font-size: 15px; line-height: 1.6; color: #555;">
              É com satisfação que encaminhamos sua proposta personalizada de geração de energia solar fotovoltaica,
              elaborada com base no seu perfil de consumo e nas condições solares da sua região.
            </p>
            <p style="font-size: 15px; line-height: 1.6; color: #555;">
              Segue em anexo o documento completo com todos os detalhes técnicos e comerciais para sua avaliação.
            </p>
            <div style="background: #fff3cd; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
              <p style="margin: 0; color: #856404; font-weight: bold;">📄 Proposta em PDF anexada a este e-mail</p>
            </div>
            <p style="font-size: 15px; line-height: 1.6; color: #555;">
              Ficamos à inteira disposição para quaisquer dúvidas, ajustes ou para agendar uma apresentação.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
            <p style="font-size: 13px; color: #9ca3af; margin: 0;">
              ${nomeEmpresa} &nbsp;|&nbsp; Energia Solar Fotovoltaica
            </p>
          </div>
        </div>
      `,
      attachments: [{
        filename: `Proposta_Solar_${nome.replace(/\s+/g, '_')}.pdf`,
        content:  pdfBase64,
      }],
    };

    const resendResp = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await resendResp.json();

    if (!resendResp.ok) {
      throw new Error(result.message || 'Erro ao enviar pelo Resend');
    }

    return new Response(JSON.stringify({ success: true, id: result.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
