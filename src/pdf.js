import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { AppState } from './ui.js';
import { Data } from './data.js';
import { HSP_CIDADES } from './sizing.js';
import { supabase } from './supabase.js';

// ─── SVGs inline ────────────────────────────────────────────────────────────

const SVG_PAINEIS = `
<svg viewBox="0 0 520 220" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:520px;">
  <!-- Sol -->
  <circle cx="260" cy="38" r="28" fill="#f39c12" opacity="0.95"/>
  <g stroke="#f39c12" stroke-width="3" opacity="0.7">
    <line x1="260" y1="2" x2="260" y2="14"/><line x1="260" y1="62" x2="260" y2="74"/>
    <line x1="224" y1="14" x2="232" y2="22"/><line x1="288" y1="54" x2="296" y2="62"/>
    <line x1="212" y1="38" x2="224" y2="38"/><line x1="296" y1="38" x2="308" y2="38"/>
    <line x1="224" y1="62" x2="232" y2="54"/><line x1="288" y1="14" x2="296" y2="22"/>
  </g>
  <!-- Raios de luz -->
  <line x1="200" y1="75" x2="130" y2="120" stroke="#f39c12" stroke-width="2" stroke-dasharray="6,4" opacity="0.5"/>
  <line x1="240" y1="70" x2="200" y2="120" stroke="#f39c12" stroke-width="2" stroke-dasharray="6,4" opacity="0.5"/>
  <line x1="260" y1="68" x2="260" y2="118" stroke="#f39c12" stroke-width="2" stroke-dasharray="6,4" opacity="0.5"/>
  <line x1="280" y1="70" x2="320" y2="120" stroke="#f39c12" stroke-width="2" stroke-dasharray="6,4" opacity="0.5"/>
  <line x1="320" y1="75" x2="390" y2="120" stroke="#f39c12" stroke-width="2" stroke-dasharray="6,4" opacity="0.5"/>
  <!-- Painel 1 -->
  <rect x="30" y="118" width="200" height="85" rx="4" fill="#1a3a5c" stroke="#0d2340" stroke-width="1.5"/>
  <line x1="30" y1="146" x2="230" y2="146" stroke="#0d2340" stroke-width="1"/><line x1="30" y1="175" x2="230" y2="175" stroke="#0d2340" stroke-width="1"/>
  <line x1="96" y1="118" x2="96" y2="203" stroke="#0d2340" stroke-width="1"/><line x1="163" y1="118" x2="163" y2="203" stroke="#0d2340" stroke-width="1"/>
  <rect x="33" y="121" width="60" height="22" rx="2" fill="#2563a8" opacity="0.6"/><rect x="99" y="121" width="61" height="22" rx="2" fill="#2563a8" opacity="0.6"/><rect x="166" y="121" width="61" height="22" rx="2" fill="#2563a8" opacity="0.6"/>
  <rect x="33" y="149" width="60" height="22" rx="2" fill="#2563a8" opacity="0.6"/><rect x="99" y="149" width="61" height="22" rx="2" fill="#2563a8" opacity="0.6"/><rect x="166" y="149" width="61" height="22" rx="2" fill="#2563a8" opacity="0.6"/>
  <rect x="33" y="178" width="60" height="22" rx="2" fill="#2563a8" opacity="0.6"/><rect x="99" y="178" width="61" height="22" rx="2" fill="#2563a8" opacity="0.6"/><rect x="166" y="178" width="61" height="22" rx="2" fill="#2563a8" opacity="0.6"/>
  <!-- Painel 2 -->
  <rect x="290" y="118" width="200" height="85" rx="4" fill="#1a3a5c" stroke="#0d2340" stroke-width="1.5"/>
  <line x1="290" y1="146" x2="490" y2="146" stroke="#0d2340" stroke-width="1"/><line x1="290" y1="175" x2="490" y2="175" stroke="#0d2340" stroke-width="1"/>
  <line x1="356" y1="118" x2="356" y2="203" stroke="#0d2340" stroke-width="1"/><line x1="423" y1="118" x2="423" y2="203" stroke="#0d2340" stroke-width="1"/>
  <rect x="293" y="121" width="60" height="22" rx="2" fill="#2563a8" opacity="0.6"/><rect x="359" y="121" width="61" height="22" rx="2" fill="#2563a8" opacity="0.6"/><rect x="426" y="121" width="61" height="22" rx="2" fill="#2563a8" opacity="0.6"/>
  <rect x="293" y="149" width="60" height="22" rx="2" fill="#2563a8" opacity="0.6"/><rect x="359" y="149" width="61" height="22" rx="2" fill="#2563a8" opacity="0.6"/><rect x="426" y="149" width="61" height="22" rx="2" fill="#2563a8" opacity="0.6"/>
  <rect x="293" y="178" width="60" height="22" rx="2" fill="#2563a8" opacity="0.6"/><rect x="359" y="178" width="61" height="22" rx="2" fill="#2563a8" opacity="0.6"/><rect x="426" y="178" width="61" height="22" rx="2" fill="#2563a8" opacity="0.6"/>
  <!-- Base/chão -->
  <rect x="120" y="203" width="20" height="14" fill="#555"/><rect x="380" y="203" width="20" height="14" fill="#555"/>
  <rect x="0" y="217" width="520" height="3" fill="#ddd" rx="2"/>
</svg>`;

const SVG_COMO_FUNCIONA = `
<svg viewBox="0 0 700 120" xmlns="http://www.w3.org/2000/svg" style="width:100%;">
  <!-- passo 1: Sol -->
  <circle cx="58" cy="50" r="26" fill="#fff8e1" stroke="#f39c12" stroke-width="2"/>
  <circle cx="58" cy="50" r="16" fill="#f39c12"/>
  <g stroke="#f39c12" stroke-width="2"><line x1="58" y1="18" x2="58" y2="26"/><line x1="58" y1="74" x2="58" y2="82"/><line x1="26" y1="50" x2="34" y2="50"/><line x1="82" y1="50" x2="90" y2="50"/><line x1="35" y1="27" x2="41" y2="33"/><line x1="75" y1="67" x2="81" y2="73"/><line x1="81" y1="27" x2="75" y2="33"/><line x1="41" y1="67" x2="35" y2="73"/></g>
  <text x="58" y="95" text-anchor="middle" font-size="9" fill="#555" font-family="Arial">1. Fonte Solar</text>
  <!-- seta -->
  <path d="M92 50 L118 50" stroke="#e67e22" stroke-width="2" marker-end="url(#arr)"/>
  <!-- passo 2: Painéis -->
  <rect x="122" y="28" width="22" height="16" rx="2" fill="#1a3a5c"/><line x1="133" y1="28" x2="133" y2="44" stroke="#fff" stroke-width="0.8"/><line x1="122" y1="36" x2="144" y2="36" stroke="#fff" stroke-width="0.8"/>
  <rect x="148" y="28" width="22" height="16" rx="2" fill="#1a3a5c"/><line x1="159" y1="28" x2="159" y2="44" stroke="#fff" stroke-width="0.8"/><line x1="148" y1="36" x2="170" y2="36" stroke="#fff" stroke-width="0.8"/>
  <rect x="122" y="48" width="22" height="16" rx="2" fill="#1a3a5c"/><line x1="133" y1="48" x2="133" y2="64" stroke="#fff" stroke-width="0.8"/><line x1="122" y1="56" x2="144" y2="56" stroke="#fff" stroke-width="0.8"/>
  <rect x="148" y="48" width="22" height="16" rx="2" fill="#1a3a5c"/><line x1="159" y1="48" x2="159" y2="64" stroke="#fff" stroke-width="0.8"/><line x1="148" y1="56" x2="170" y2="56" stroke="#fff" stroke-width="0.8"/>
  <text x="146" y="95" text-anchor="middle" font-size="9" fill="#555" font-family="Arial">2. Painéis FV</text>
  <!-- seta -->
  <path d="M174 50 L200 50" stroke="#e67e22" stroke-width="2" marker-end="url(#arr)"/>
  <!-- passo 3: String Box -->
  <rect x="204" y="30" width="32" height="38" rx="3" fill="#34495e"/>
  <rect x="208" y="34" width="24" height="8" rx="1" fill="#2ecc71" opacity="0.8"/>
  <rect x="208" y="46" width="24" height="6" rx="1" fill="#3498db" opacity="0.8"/>
  <rect x="208" y="56" width="24" height="8" rx="1" fill="#e74c3c" opacity="0.8"/>
  <text x="220" y="95" text-anchor="middle" font-size="9" fill="#555" font-family="Arial">3. String Box</text>
  <!-- seta -->
  <path d="M240 50 L266 50" stroke="#e67e22" stroke-width="2" marker-end="url(#arr)"/>
  <!-- passo 4: Inversor -->
  <rect x="270" y="25" width="50" height="50" rx="5" fill="#2c3e50"/>
  <rect x="276" y="31" width="38" height="28" rx="2" fill="#1a252f"/>
  <text x="295" y="50" text-anchor="middle" font-size="8" fill="#2ecc71" font-family="Arial" font-weight="bold">INV</text>
  <rect x="280" y="62" width="6" height="8" rx="1" fill="#f39c12"/><rect x="290" y="62" width="6" height="8" rx="1" fill="#3498db"/>
  <text x="295" y="95" text-anchor="middle" font-size="9" fill="#555" font-family="Arial">4. Inversor</text>
  <!-- seta -->
  <path d="M324 50 L350 50" stroke="#e67e22" stroke-width="2" marker-end="url(#arr)"/>
  <!-- passo 5: Medidor Bidirecional -->
  <rect x="354" y="25" width="46" height="50" rx="4" fill="#7f8c8d"/>
  <circle cx="377" cy="50" r="16" fill="#ecf0f1"/>
  <path d="M363 50 A14 14 0 0 1 391 50" stroke="#27ae60" stroke-width="3" fill="none"/>
  <path d="M363 50 A14 14 0 0 0 391 50" stroke="#e67e22" stroke-width="3" fill="none"/>
  <text x="377" y="95" text-anchor="middle" font-size="9" fill="#555" font-family="Arial">5. Medidor Bidirecional</text>
  <!-- seta -->
  <path d="M404 50 L430 50" stroke="#e67e22" stroke-width="2" marker-end="url(#arr)"/>
  <!-- passo 6: Casa / Rede -->
  <polygon points="490,25 520,48 480,48" fill="#e67e22"/>
  <rect x="483" y="48" width="34" height="27" fill="#e67e22" opacity="0.85"/>
  <rect x="494" y="58" width="12" height="17" rx="1" fill="#fff" opacity="0.7"/>
  <text x="497" y="95" text-anchor="middle" font-size="9" fill="#555" font-family="Arial">6. Consumo / Rede</text>
  <!-- marker -->
  <defs>
    <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#e67e22"/>
    </marker>
  </defs>
</svg>`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtR = (v) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtN = (v) => v.toLocaleString('pt-BR');

function svgToBase64(svg) {
  return `data:image/svg+xml;base64,${btoa(encodeURIComponent(svg).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))))}`;
}

function calcEconomia30Anos(economiaMensal) {
  let total = 0, v = economiaMensal * 12;
  for (let i = 0; i < 30; i++) { total += v; v *= 1.07; }
  return Math.round(total * 100) / 100;
}

function gerarBarras(economiaAnual) {
  const vals = [];
  let v = economiaAnual;
  for (let i = 0; i < 10; i++) { vals.push(v); v *= 1.07; }
  const max = vals[vals.length - 1];
  return `
    <div style="display:flex;align-items:flex-end;gap:8px;height:130px;padding:0 4px;margin-bottom:4px;">
      ${vals.map((val) => {
        const h = Math.max(20, Math.round((val / max) * 110));
        return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;">
          <span style="font-size:7px;color:#555;white-space:nowrap;">R$${Math.round(val/1000)}k</span>
          <div style="width:100%;height:${h}px;background:linear-gradient(to top,#e67e22,#f39c12);border-radius:3px 3px 0 0;"></div>
        </div>`;
      }).join('')}
    </div>
    <div style="display:flex;gap:8px;border-top:2px solid #e67e22;padding-top:4px;">
      ${vals.map((_,i)=>`<div style="flex:1;text-align:center;font-size:8px;color:#888;">Ano ${i+1}</div>`).join('')}
    </div>`;
}

function cabecalho(logoHtml, empresa) {
  return `
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
      <tr>
        <td style="padding:0 0 14px 0;vertical-align:middle;">${logoHtml}</td>
        <td style="padding:0 0 14px 0;text-align:right;vertical-align:middle;">
          <div style="font-size:11px;font-weight:800;color:#0d1f36;letter-spacing:0.3px;">${empresa.nome||''}</div>
          <div style="font-size:9px;color:#94a3b8;margin-top:2px;line-height:1.6;">${empresa.tel||''}</div>
          <div style="font-size:9px;color:#94a3b8;line-height:1.6;">${empresa.email||''}</div>
        </td>
      </tr>
      <tr><td colspan="2" style="padding:0;">
        <div style="height:3px;background:linear-gradient(90deg,#0d1f36 0%,#1a3a5c 40%,#e67e22 80%,#f39c12 100%);border-radius:2px;"></div>
      </td></tr>
    </table>`;
}

function rodape(empresa, num) {
  return `
    <div style="border-top:1px solid #e2e8f0;margin-top:28px;padding-top:10px;display:flex;justify-content:space-between;align-items:center;font-size:8px;color:#b0b8c4;">
      <span style="letter-spacing:0.3px;">${empresa.nome||''} | CNPJ: ${empresa.cnpj||''}</span>
      <div style="width:22px;height:22px;background:#1a3a5c;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:9px;font-weight:800;">${num}</div>
    </div>`;
}

// ─── Renderização canvas ──────────────────────────────────────────────────────

async function htmlToCanvas(htmlStr) {
  const wrapper = document.createElement('div');
  // position:absolute evita interferência do viewport; sem min-height aqui,
  // cada seção controla sua própria altura via seu HTML interno
  wrapper.style.cssText = 'position:absolute;left:-10000px;top:0;width:794px;background:#fff;';
  wrapper.innerHTML = htmlStr;
  document.body.appendChild(wrapper);

  // Aguarda renderização completa (fontes, imagens, layout)
  await new Promise(r => setTimeout(r, 600));

  let canvas;
  try {
    canvas = await html2canvas(wrapper, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      windowWidth: 794,
      backgroundColor: '#ffffff'
    });
  } catch (err) {
    console.error('html2canvas error:', err);
    throw err;
  }

  document.body.removeChild(wrapper);
  return canvas;
}

function addCanvasToDoc(doc, canvas, isFirst) {
  const cW = canvas.width;
  const cH = canvas.height;
  const pxPerMm = cW / 210;                         // pixels por mm (escala 2×)
  const pageH = Math.round(297 * pxPerMm);           // altura A4 em pixels
  const minSlice = Math.round(pageH * 0.20);         // fatia mínima: 20% de A4 ≈ 60mm

  let pageNum = 0;
  let startPx = 0;

  while (startPx < cH) {
    const remaining = cH - startPx;

    // Pula fatia residual (só para páginas 2+): overflow pequeno de margin/padding
    if (pageNum > 0 && remaining < minSlice) break;

    if (!isFirst || pageNum > 0) doc.addPage();

    const sliceH = Math.min(pageH, remaining);

    // Canvas sempre no tamanho A4 exato, excesso preenchido com branco
    const tmp = document.createElement('canvas');
    tmp.width = cW;
    tmp.height = pageH;
    const ctx = tmp.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cW, pageH);
    ctx.drawImage(canvas, 0, startPx, cW, sliceH, 0, 0, cW, sliceH);

    doc.addImage(tmp.toDataURL('image/jpeg', 0.93), 'JPEG', 0, 0, 210, 297);

    startPx += pageH;
    pageNum++;
  }
}

// ─── Builders de seção ───────────────────────────────────────────────────────

function buildCover(empresa, cliente, kwpTxt, kwpN, logoHtml, hoje, coverPhoto = null) {
  const heroContent = coverPhoto
    ? `<img src="${coverPhoto}" style="width:100%;height:100%;object-fit:cover;display:block;">
       <div style="position:absolute;inset:0;background:linear-gradient(160deg,rgba(13,31,54,0.72) 0%,rgba(26,58,92,0.45) 50%,rgba(13,31,54,0.55) 100%);"></div>`
    : `<div style="position:absolute;inset:0;background:linear-gradient(145deg,#0d1f36 0%,#1a3a5c 55%,#1e4a6e 100%);"></div>
       <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);">
         <img src="${svgToBase64(SVG_PAINEIS)}" style="width:480px;display:block;opacity:0.88;">
       </div>`;
  return `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;color:#0d1f36;width:794px;background:#fff;">
    <div style="width:794px;min-height:1122px;display:flex;flex-direction:column;">

      <!-- Hero -->
      <div style="height:300px;position:relative;overflow:hidden;">
        ${heroContent}
        <!-- Orange diagonal accent shapes (always visible) -->
        <div style="position:absolute;bottom:-40px;right:-80px;width:360px;height:130px;background:#e67e22;transform:rotate(-14deg);opacity:0.75;border-radius:8px;"></div>
        <div style="position:absolute;bottom:-65px;right:-120px;width:360px;height:130px;background:#f39c12;transform:rotate(-14deg);opacity:0.35;border-radius:8px;"></div>
        <!-- Top label -->
        <div style="position:absolute;top:26px;left:0;right:0;text-align:center;">
          <span style="font-size:10px;letter-spacing:7px;color:rgba(255,255,255,0.65);text-transform:uppercase;font-weight:500;text-shadow:0 1px 4px rgba(0,0,0,0.5);">Energia Solar Fotovoltaica</span>
        </div>
      </div>

      <!-- Gradient stripe -->
      <div style="height:6px;background:linear-gradient(90deg,#e67e22,#f39c12,#e67e22);"></div>

      <!-- Body -->
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:44px 76px 32px;">

        <!-- Logo / company name -->
        <div style="text-align:center;margin-bottom:26px;">
          ${logoHtml}
        </div>

        <!-- Main title -->
        <h1 style="margin:0 0 8px 0;font-size:40px;font-weight:900;color:#0d1f36;letter-spacing:4px;text-transform:uppercase;text-align:center;line-height:1.1;">PROPOSTA COMERCIAL</h1>
        <div style="width:64px;height:4px;background:linear-gradient(90deg,#e67e22,#f39c12);border-radius:2px;margin:0 auto 14px auto;"></div>
        <p style="margin:0 0 36px 0;font-size:13px;color:#64748b;letter-spacing:3px;text-transform:uppercase;text-align:center;font-weight:400;">Sistema de Energia Solar Fotovoltaico</p>

        <!-- Client card -->
        <div style="background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:20px;padding:32px 72px;text-align:center;margin-bottom:40px;min-width:460px;position:relative;overflow:hidden;">
          <div style="position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#0d1f36,#1a3a5c,#e67e22,#f39c12);"></div>
          <p style="margin:0 0 10px 0;font-size:8px;color:#94a3b8;text-transform:uppercase;letter-spacing:4px;font-weight:700;">Proposta destinada a</p>
          <p style="margin:0 0 14px 0;font-size:32px;font-weight:900;color:#0d1f36;line-height:1.1;">${cliente.nome}</p>
          ${kwpN>0?`<div style="display:inline-block;background:#1a3a5c;padding:6px 20px;border-radius:24px;">
            <span style="font-size:13px;font-weight:700;color:#f39c12;letter-spacing:0.5px;">Sistema ${kwpTxt} kWp</span>
          </div>`:''}
        </div>

        <!-- Meta info row -->
        <table style="border-collapse:collapse;text-align:center;">
          <tr>
            <td style="padding:0 32px;">
              <p style="margin:0 0 5px 0;font-size:8px;text-transform:uppercase;letter-spacing:2.5px;color:#94a3b8;font-weight:700;">Elaborada por</p>
              <p style="margin:0;font-size:12px;font-weight:900;color:#0d1f36;">${empresa.nome||'–'}</p>
            </td>
            <td style="border-left:2px solid #e2e8f0;padding:0 32px;">
              <p style="margin:0 0 5px 0;font-size:8px;text-transform:uppercase;letter-spacing:2.5px;color:#94a3b8;font-weight:700;">Data</p>
              <p style="margin:0;font-size:12px;font-weight:900;color:#0d1f36;">${hoje}</p>
            </td>
            <td style="border-left:2px solid #e2e8f0;padding:0 32px;">
              <p style="margin:0 0 5px 0;font-size:8px;text-transform:uppercase;letter-spacing:2.5px;color:#94a3b8;font-weight:700;">Validade</p>
              <p style="margin:0;font-size:12px;font-weight:900;color:#e67e22;">15 dias</p>
            </td>
          </tr>
        </table>
      </div>

      <!-- Footer bar -->
      <div style="background:#0d1f36;padding:14px 48px;display:flex;justify-content:space-between;align-items:center;">
        <span style="color:rgba(255,255,255,0.45);font-size:9px;letter-spacing:0.8px;">${empresa.tel||''}</span>
        <span style="color:rgba(255,255,255,0.45);font-size:9px;letter-spacing:0.8px;">${empresa.email||''}</span>
        <span style="color:rgba(255,255,255,0.45);font-size:9px;letter-spacing:0.8px;">CNPJ: ${empresa.cnpj||''}</span>
      </div>
    </div>
  </div>`;
}

function buildComoFunciona(logoHtml, empresa) {
  return `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;color:#0d1f36;width:794px;background:#fff;padding:48px 54px 36px 54px;">
    ${cabecalho(logoHtml, empresa)}

    <!-- Section: Como Funciona -->
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
      <div style="width:4px;height:28px;background:linear-gradient(180deg,#0d1f36,#1a3a5c);border-radius:2px;"></div>
      <h2 style="margin:0;font-size:15px;font-weight:800;color:#0d1f36;letter-spacing:0.5px;">Como Funciona o Sistema Solar</h2>
    </div>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 18px 12px 18px;margin-bottom:24px;">
      <img src="${svgToBase64(SVG_COMO_FUNCIONA)}" style="width:100%;">
      <div style="display:flex;gap:8px;margin-top:14px;">
        ${[
          ['1','#e67e22','Fonte Solar','O sol é a fonte primária de energia — a luz incide sobre os painéis fotovoltaicos.'],
          ['2','#1a3a5c','Painéis FV','Os painéis convertem a luz solar em corrente contínua (CC).'],
          ['3','#e67e22','String Box','Dispositivo de proteção e combinação dos strings de painéis.'],
          ['4','#1a3a5c','Inversor','Converte a corrente contínua em corrente alternada (CA) utilizável na rede.'],
          ['5','#e67e22','Medidor Bidirecional','Mede energia consumida e a excedente injetada na rede, gerando créditos.'],
          ['6','#1a3a5c','Consumo / Rede','A energia abastece a residência/empresa; o excedente gera créditos por até 60 meses.'],
        ].map(([n,cor,t,d])=>`
          <div style="flex:1;background:#fff;border-radius:8px;padding:10px;border-top:3px solid ${cor};border:1px solid #e2e8f0;border-top:3px solid ${cor};">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;">
              <span style="background:${cor};color:#fff;border-radius:50%;min-width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;font-size:8px;font-weight:800;">${n}</span>
              <span style="font-weight:800;color:#0d1f36;font-size:10px;">${t}</span>
            </div>
            <p style="margin:0;font-size:8.5px;color:#64748b;line-height:1.55;">${d}</p>
          </div>`).join('')}
      </div>
    </div>

    <!-- Section: Benefícios -->
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
      <div style="width:4px;height:28px;background:linear-gradient(180deg,#e67e22,#f39c12);border-radius:2px;"></div>
      <h2 style="margin:0;font-size:15px;font-weight:800;color:#0d1f36;letter-spacing:0.5px;">Benefícios do Sistema Fotovoltaico</h2>
    </div>

    <!-- Benefits grid: 3 columns x 2 rows -->
    <div style="display:flex;gap:10px;flex-wrap:wrap;">
      ${[
        ['#e67e22','95%','Economia na Conta','Reduza drasticamente sua conta de energia e proteja-se contra o aumento tarifário.'],
        ['#1a3a5c','$','Valoriza o Imóvel','Propriedades com sistema solar têm valor de mercado até 10% superior.'],
        ['#16a34a','CO2','Energia Limpa','Zero emissões de CO2 durante a operação. Contribua com o planeta.'],
        ['#e67e22','ROI','Excelente Retorno','Retorno do investimento comprovado. Geração de renda por 25+ anos.'],
        ['#1a3a5c','R$','Financiamento Fácil','Linhas de crédito especiais com parcelas que cabem no bolso.'],
        ['#16a34a','60m','Creditos de Energia','Energia excedente gera creditos utilizaveis em ate 60 meses.'],
      ].map(([cor,badge,t,d])=>`
        <div style="flex:1;min-width:200px;max-width:32%;background:#fff;border-radius:12px;padding:16px;border:1px solid #e2e8f0;border-left:4px solid ${cor};margin-bottom:8px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <div style="background:${cor};color:#fff;border-radius:8px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:900;flex-shrink:0;">${badge}</div>
            <div style="font-weight:800;color:#0d1f36;font-size:11px;line-height:1.2;">${t}</div>
          </div>
          <p style="margin:0;font-size:9px;color:#64748b;line-height:1.55;">${d}</p>
        </div>`).join('')}
    </div>

    ${rodape(empresa, 2)}
  </div>`;
}

function buildProjeto(logoHtml, empresa, cliente, kwh, kwpTxt, geracaoMens, geracaoAnual, hsp, cidade, estado, itensHtml) {
  return `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;color:#0d1f36;width:794px;background:#fff;padding:48px 54px 36px 54px;">
    ${cabecalho(logoHtml, empresa)}

    <!-- Page title -->
    <div style="background:linear-gradient(135deg,#0d1f36,#1a3a5c);color:#fff;padding:10px 16px;border-radius:8px;margin-bottom:18px;display:flex;align-items:center;gap:10px;">
      <div style="width:3px;height:20px;background:#f39c12;border-radius:2px;"></div>
      <h2 style="margin:0;font-size:14px;font-weight:800;letter-spacing:0.5px;">Projeto e Instalação</h2>
    </div>

    <!-- Client data -->
    <h3 style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:3px;font-weight:700;margin:0 0 10px 0;padding-bottom:6px;border-bottom:1.5px solid #e2e8f0;">Dados do Cliente</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:22px;font-size:11px;">
      <tr>
        <td style="padding:9px 14px;font-weight:700;color:#94a3b8;width:26%;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Cliente</td>
        <td style="padding:9px 14px;font-weight:800;color:#0d1f36;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:13px;">${cliente.nome}</td>
      </tr>
      <tr>
        <td style="padding:9px 14px;font-weight:700;color:#94a3b8;background:#fff;border-bottom:1px solid #e2e8f0;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Endereço</td>
        <td style="padding:9px 14px;color:#374151;background:#fff;border-bottom:1px solid #e2e8f0;">${cliente.endereco||'–'}</td>
      </tr>
      <tr>
        <td style="padding:9px 14px;font-weight:700;color:#94a3b8;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Telefone</td>
        <td style="padding:9px 14px;color:#374151;background:#f8fafc;border-bottom:1px solid #e2e8f0;">${cliente.tel||'–'}</td>
      </tr>
      ${cliente.email?`<tr>
        <td style="padding:9px 14px;font-weight:700;color:#94a3b8;background:#fff;font-size:10px;text-transform:uppercase;letter-spacing:1px;">E-mail</td>
        <td style="padding:9px 14px;color:#374151;background:#fff;">${cliente.email}</td>
      </tr>`:''}
    </table>

    <!-- Project characteristics -->
    <h3 style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:3px;font-weight:700;margin:0 0 10px 0;padding-bottom:6px;border-bottom:1.5px solid #e2e8f0;">Características do Projeto</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:22px;font-size:11px;">
      <thead>
        <tr style="background:#0d1f36;color:#fff;">
          <th style="padding:10px 14px;text-align:left;font-weight:700;font-size:10px;letter-spacing:0.5px;">Característica</th>
          <th style="padding:10px 14px;text-align:center;font-weight:700;font-size:10px;letter-spacing:0.5px;">Valor</th>
          <th style="padding:10px 14px;text-align:center;font-weight:700;font-size:10px;letter-spacing:0.5px;">Unidade</th>
        </tr>
      </thead>
      <tbody>
        <tr><td style="padding:9px 14px;border-bottom:1px solid #e2e8f0;color:#374151;">Consumo Médio Mensal</td><td style="padding:9px 14px;text-align:center;border-bottom:1px solid #e2e8f0;font-weight:700;">${fmtN(kwh)}</td><td style="padding:9px 14px;text-align:center;border-bottom:1px solid #e2e8f0;color:#94a3b8;font-size:10px;">kWh/Mês</td></tr>
        <tr style="background:#fffbf5;">
          <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#374151;font-weight:700;">Potência do Sistema</td>
          <td style="padding:10px 14px;text-align:center;border-bottom:1px solid #e2e8f0;font-weight:900;color:#e67e22;font-size:18px;">${kwpTxt}</td>
          <td style="padding:10px 14px;text-align:center;border-bottom:1px solid #e2e8f0;color:#94a3b8;font-size:10px;">kWp</td>
        </tr>
        <tr><td style="padding:9px 14px;border-bottom:1px solid #e2e8f0;color:#374151;">Geração Mensal Estimada</td><td style="padding:9px 14px;text-align:center;border-bottom:1px solid #e2e8f0;font-weight:700;">${fmtN(geracaoMens)}</td><td style="padding:9px 14px;text-align:center;border-bottom:1px solid #e2e8f0;color:#94a3b8;font-size:10px;">kWh/Mês</td></tr>
        <tr style="background:#f8fafc;"><td style="padding:9px 14px;border-bottom:1px solid #e2e8f0;color:#374151;">Geração Anual Estimada</td><td style="padding:9px 14px;text-align:center;border-bottom:1px solid #e2e8f0;font-weight:700;">${fmtN(geracaoAnual)}</td><td style="padding:9px 14px;text-align:center;border-bottom:1px solid #e2e8f0;color:#94a3b8;font-size:10px;">kWh/Ano</td></tr>
        <tr><td style="padding:9px 14px;border-bottom:1px solid #e2e8f0;color:#374151;">Irradiação Solar Local (HSP)</td><td style="padding:9px 14px;text-align:center;border-bottom:1px solid #e2e8f0;font-weight:700;">${hsp}</td><td style="padding:9px 14px;text-align:center;border-bottom:1px solid #e2e8f0;color:#94a3b8;font-size:10px;">kWh/m²/dia</td></tr>
        <tr style="background:#f8fafc;"><td style="padding:9px 14px;color:#374151;">Local de Instalação</td><td colspan="2" style="padding:9px 14px;text-align:center;font-weight:800;color:#0d1f36;">${cidade} / ${estado}</td></tr>
      </tbody>
    </table>

    <!-- Equipment list -->
    <h3 style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:3px;font-weight:700;margin:0 0 10px 0;padding-bottom:6px;border-bottom:1.5px solid #e2e8f0;">Lista de Equipamentos</h3>
    <table style="width:100%;border-collapse:collapse;font-size:11px;">
      <thead>
        <tr style="background:#0d1f36;color:#fff;">
          <th style="padding:10px 14px;width:70px;text-align:center;font-weight:700;font-size:10px;letter-spacing:0.5px;">Qtd</th>
          <th style="padding:10px 14px;text-align:left;font-weight:700;font-size:10px;letter-spacing:0.5px;">Descrição do Equipamento</th>
        </tr>
      </thead>
      <tbody>${itensHtml}</tbody>
    </table>

    ${rodape(empresa, 3)}
  </div>`;
}

function buildServicos(logoHtml, empresa, conta, geracaoMens, economiaMens, economiaAnual, total) {
  const servicos = [
    'Vistoria Técnica no local de instalação',
    'Projeto Elétrico Fotovoltaico',
    'Anotação de Responsabilidade Técnica (ART)',
    'Obtenção das Licenças junto à Concessionária',
    'Montagem dos Módulos com Estrutura Adequada',
    'Instalação e Montagem Elétrica do Sistema',
    'Gestão, Supervisão e Fiscalização da Obra',
    'Frete Incluso',
    'Documentação Personalizada do Projeto',
    'Configuração de Monitoramento via Aplicativo',
    'Limpeza e Inspeção (Até 12 Meses Após Comissionamento)',
  ];
  const col1 = servicos.slice(0, 6);
  const col2 = servicos.slice(6);
  return `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;color:#0d1f36;width:794px;background:#fff;padding:48px 54px 36px 54px;">
    ${cabecalho(logoHtml, empresa)}

    <!-- Page title -->
    <div style="background:linear-gradient(135deg,#e67e22,#f39c12);color:#fff;padding:10px 16px;border-radius:8px;margin-bottom:18px;display:flex;align-items:center;gap:10px;">
      <div style="width:3px;height:20px;background:rgba(255,255,255,0.6);border-radius:2px;"></div>
      <h2 style="margin:0;font-size:14px;font-weight:800;letter-spacing:0.5px;">Serviços e Análise Financeira</h2>
    </div>

    <!-- Services checklist -->
    <h3 style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:3px;font-weight:700;margin:0 0 10px 0;padding-bottom:6px;border-bottom:1.5px solid #e2e8f0;">Serviços Inclusos</h3>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px 18px;margin-bottom:18px;">
      <div style="display:flex;gap:16px;">
        <div style="flex:1;">
          ${col1.map(s=>`
            <div style="display:flex;align-items:flex-start;gap:9px;padding:6px 0;border-bottom:1px solid #e2e8f0;">
              <span style="background:#16a34a;color:#fff;border-radius:50%;min-width:17px;height:17px;display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:900;margin-top:1px;">✓</span>
              <span style="font-size:10px;color:#374151;line-height:1.4;">${s}</span>
            </div>`).join('')}
        </div>
        <div style="flex:1;">
          ${col2.map(s=>`
            <div style="display:flex;align-items:flex-start;gap:9px;padding:6px 0;border-bottom:1px solid #e2e8f0;">
              <span style="background:#16a34a;color:#fff;border-radius:50%;min-width:17px;height:17px;display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:900;margin-top:1px;">✓</span>
              <span style="font-size:10px;color:#374151;line-height:1.4;">${s}</span>
            </div>`).join('')}
        </div>
      </div>
      <p style="margin:10px 0 0 0;font-size:9px;color:#dc2626;font-weight:700;display:flex;align-items:center;gap:6px;">
        <span style="background:#dc2626;color:#fff;border-radius:50%;width:14px;height:14px;display:inline-flex;align-items:center;justify-content:center;font-size:8px;">!</span>
        OBS: Nao estao inclusas obras civis, eventuais reformas no telhado/laje e no padrao de entrada.
      </p>
    </div>

    <!-- Financial summary -->
    <h3 style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:3px;font-weight:700;margin:0 0 10px 0;padding-bottom:6px;border-bottom:1.5px solid #e2e8f0;">Resumo Financeiro</h3>
    <table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:18px;">
      <thead><tr style="background:#0d1f36;color:#fff;">
        <th style="padding:10px 14px;text-align:left;font-weight:700;font-size:10px;letter-spacing:0.5px;">Fator</th>
        <th style="padding:10px 14px;text-align:right;font-weight:700;font-size:10px;letter-spacing:0.5px;">Valor</th>
        <th style="padding:10px 14px;text-align:center;font-weight:700;font-size:10px;letter-spacing:0.5px;">Unidade</th>
      </tr></thead>
      <tbody>
        ${conta>0?`<tr><td style="padding:9px 14px;border-bottom:1px solid #e2e8f0;color:#374151;">Valor Médio da Conta de Energia</td><td style="padding:9px 14px;text-align:right;border-bottom:1px solid #e2e8f0;font-weight:700;">R$ ${fmtR(conta)}</td><td style="padding:9px 14px;text-align:center;border-bottom:1px solid #e2e8f0;color:#94a3b8;font-size:10px;">R$/Mês</td></tr>`:''}
        <tr style="background:#f8fafc;"><td style="padding:9px 14px;border-bottom:1px solid #e2e8f0;color:#374151;">Geração Média Mensal Estimada</td><td style="padding:9px 14px;text-align:right;border-bottom:1px solid #e2e8f0;font-weight:700;">${fmtN(geracaoMens)}</td><td style="padding:9px 14px;text-align:center;border-bottom:1px solid #e2e8f0;color:#94a3b8;font-size:10px;">kWh/Mês</td></tr>
        ${economiaMens>0?`
        <tr><td style="padding:9px 14px;border-bottom:1px solid #e2e8f0;color:#374151;">Economia Média Mensal Estimada (1º ano)</td><td style="padding:9px 14px;text-align:right;border-bottom:1px solid #e2e8f0;font-weight:800;color:#16a34a;">R$ ${fmtR(economiaMens)}</td><td style="padding:9px 14px;text-align:center;border-bottom:1px solid #e2e8f0;color:#94a3b8;font-size:10px;">R$/Mês</td></tr>
        <tr style="background:#f0fdf4;"><td style="padding:9px 14px;color:#374151;font-weight:700;">Economia Total Estimada (1º ano)</td><td style="padding:9px 14px;text-align:right;font-weight:900;color:#16a34a;font-size:13px;">R$ ${fmtR(economiaAnual)}</td><td style="padding:9px 14px;text-align:center;color:#94a3b8;font-size:10px;">R$/Ano</td></tr>`:''}
      </tbody>
    </table>

    <!-- Investment total -->
    <div style="background:linear-gradient(135deg,#0d1f36 0%,#1a3a5c 100%);border-radius:14px;padding:20px 28px;text-align:center;margin-bottom:18px;color:#fff;position:relative;overflow:hidden;">
      <div style="position:absolute;top:-20px;right:-20px;width:100px;height:100px;background:rgba(243,156,18,0.15);border-radius:50%;"></div>
      <div style="position:absolute;bottom:-30px;left:-10px;width:80px;height:80px;background:rgba(230,126,34,0.1);border-radius:50%;"></div>
      <p style="margin:0 0 6px 0;font-size:9px;text-transform:uppercase;letter-spacing:4px;color:#94a3b8;font-weight:600;">Investimento Total — Projeto Chave na Mao</p>
      <div style="font-size:42px;font-weight:900;color:#f39c12;letter-spacing:1px;line-height:1;">R$ ${fmtR(total)}</div>
      <p style="margin:8px 0 0 0;font-size:9px;color:#64748b;">Impostos inclusos: PIS/COFINS, IPI, ICMS e ISS</p>
    </div>

    <!-- Guarantees -->
    <h3 style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:3px;font-weight:700;margin:0 0 10px 0;padding-bottom:6px;border-bottom:1.5px solid #e2e8f0;">Garantias</h3>
    <div style="display:flex;gap:10px;margin-bottom:16px;">
      ${[
        ['#e67e22','Sol','Modulos Fotovoltaicos (N-Type)','12 anos mecanica / 30 anos eficiencia'],
        ['#1a3a5c','Inv','Inversor','5 anos'],
        ['#64748b','Est','Estrutura Metalica','12 anos'],
        ['#16a34a','OK','Instalacao','Garantia contratual'],
      ].map(([cor,badge,n,g])=>`
        <div style="flex:1;background:#f8fafc;border-radius:10px;padding:12px;text-align:center;border:1px solid #e2e8f0;border-top:3px solid ${cor};">
          <div style="background:${cor};color:#fff;border-radius:8px;width:32px;height:32px;margin:0 auto 8px auto;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:900;">${badge}</div>
          <div style="font-weight:800;color:#0d1f36;font-size:10px;margin-bottom:4px;">${n}</div>
          <div style="color:#64748b;font-size:9px;line-height:1.4;">${g}</div>
        </div>`).join('')}
    </div>

    <div style="background:#fefce8;border:1px solid #fde047;border-radius:8px;padding:10px 14px;font-size:9px;color:#713f12;line-height:1.55;">
      <b>Importante:</b> As estimativas de geracao de energia sao baseadas nos dados de irradiacao solar do CRESESB/INPE e representam medias mensais/anuais. Para o dimensionamento foram consideradas 22% de perdas (cabeamento, temperatura, poeira, sombreamento). Os modulos fotovoltaicos utilizados sao tecnologia <b>N-Type</b>, com garantia de eficiencia de <b>30 anos</b>. Proposta valida por <b>15 dias</b>.
    </div>

    ${rodape(empresa, 4)}
  </div>`;
}

function buildAnalise(logoHtml, empresa, total, economiaAnual, payback, eco30) {
  return `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;color:#0d1f36;width:794px;background:#fff;padding:48px 54px 36px 54px;">
    ${cabecalho(logoHtml, empresa)}

    <!-- Page title -->
    <div style="background:linear-gradient(135deg,#0d1f36,#1a3a5c);color:#fff;padding:10px 16px;border-radius:8px;margin-bottom:20px;display:flex;align-items:center;gap:10px;">
      <div style="width:3px;height:20px;background:#f39c12;border-radius:2px;"></div>
      <h2 style="margin:0;font-size:14px;font-weight:800;letter-spacing:0.5px;">Análise de Viabilidade Financeira</h2>
    </div>

    <!-- KPI cards row -->
    <div style="display:flex;gap:12px;margin-bottom:18px;">
      <!-- Payback KPI -->
      <div style="flex:1;background:linear-gradient(135deg,#16a34a,#15803d);border-radius:14px;padding:18px 20px;text-align:center;color:#fff;position:relative;overflow:hidden;">
        <div style="position:absolute;top:-15px;right:-15px;width:70px;height:70px;background:rgba(255,255,255,0.1);border-radius:50%;"></div>
        <p style="margin:0 0 6px 0;font-size:8px;text-transform:uppercase;letter-spacing:3px;color:rgba(255,255,255,0.7);font-weight:600;">Payback</p>
        <div style="font-size:38px;font-weight:900;line-height:1;color:#fff;">${payback}</div>
        <p style="margin:4px 0 0 0;font-size:10px;color:rgba(255,255,255,0.8);font-weight:500;">anos para retorno</p>
      </div>
      <!-- Eco 30 anos KPI -->
      <div style="flex:2;background:linear-gradient(135deg,#f8fafc,#f0fdf4);border:2px solid #bbf7d0;border-radius:14px;padding:18px 24px;text-align:center;position:relative;overflow:hidden;">
        <div style="position:absolute;top:-10px;right:-10px;width:60px;height:60px;background:rgba(22,163,74,0.08);border-radius:50%;"></div>
        <p style="margin:0 0 6px 0;font-size:8px;text-transform:uppercase;letter-spacing:3px;color:#64748b;font-weight:600;">Economia Total Acumulada em 30 Anos</p>
        <div style="font-size:34px;font-weight:900;color:#16a34a;line-height:1;">R$ ${fmtR(eco30)}</div>
        <p style="margin:6px 0 0 0;font-size:9px;color:#64748b;">Com reajuste anual estimado de 7% ao ano</p>
      </div>
    </div>

    <!-- Viability table -->
    <h3 style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:3px;font-weight:700;margin:0 0 10px 0;padding-bottom:6px;border-bottom:1.5px solid #e2e8f0;">Indicadores do Projeto</h3>
    <table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:18px;">
      <thead><tr style="background:#0d1f36;color:#fff;">
        <th style="padding:10px 14px;text-align:left;font-weight:700;font-size:10px;letter-spacing:0.5px;">Fator</th>
        <th style="padding:10px 14px;text-align:right;font-weight:700;font-size:10px;letter-spacing:0.5px;">Valor</th>
      </tr></thead>
      <tbody>
        <tr><td style="padding:9px 14px;border-bottom:1px solid #e2e8f0;color:#374151;font-weight:600;">Valor do Investimento</td><td style="padding:9px 14px;text-align:right;border-bottom:1px solid #e2e8f0;font-weight:800;color:#0d1f36;">R$ ${fmtR(total)}</td></tr>
        <tr style="background:#f8fafc;"><td style="padding:9px 14px;border-bottom:1px solid #e2e8f0;color:#374151;">Reajuste Anual de Energia (estimado)</td><td style="padding:9px 14px;text-align:right;border-bottom:1px solid #e2e8f0;font-weight:600;">7,00%</td></tr>
        <tr><td style="padding:9px 14px;border-bottom:1px solid #e2e8f0;color:#374151;">Vida Útil do Sistema Fotovoltaico</td><td style="padding:9px 14px;text-align:right;border-bottom:1px solid #e2e8f0;font-weight:600;">30 anos</td></tr>
        <tr style="background:#f0fdf4;"><td style="padding:9px 14px;color:#374151;font-weight:700;">Payback (Retorno do Investimento)</td><td style="padding:9px 14px;text-align:right;font-weight:900;color:#16a34a;font-size:15px;">${payback} anos</td></tr>
      </tbody>
    </table>

    <!-- Bar chart -->
    <h3 style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:3px;font-weight:700;margin:0 0 10px 0;padding-bottom:6px;border-bottom:1.5px solid #e2e8f0;">Evolução da Economia Anual (R$/Ano)</h3>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:18px;">
      ${gerarBarras(economiaAnual)}
    </div>

    <!-- Payment options -->
    <h3 style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:3px;font-weight:700;margin:0 0 12px 0;padding-bottom:6px;border-bottom:1.5px solid #e2e8f0;">Formas de Pagamento</h3>
    <div style="display:flex;gap:14px;">
      <!-- À Vista -->
      <div style="flex:1;background:linear-gradient(135deg,#fffbf0,#fef3c7);border:1.5px solid #fde68a;border-radius:12px;padding:18px;text-align:center;">
        <div style="font-size:9px;font-weight:800;color:#92400e;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;">A Vista</div>
        <div style="font-size:26px;font-weight:900;color:#e67e22;line-height:1;">R$ ${fmtR(total)}</div>
        <div style="margin-top:8px;font-size:9px;color:#92400e;background:rgba(217,119,6,0.12);padding:5px 12px;border-radius:20px;display:inline-block;font-weight:700;">Desconto negociavel</div>
      </div>
      <!-- Financiamento -->
      <div style="flex:2;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:12px;padding:16px;">
        <div style="font-size:9px;font-weight:800;color:#0d1f36;text-transform:uppercase;letter-spacing:2px;text-align:center;margin-bottom:12px;">Financiamento</div>
        <table style="width:100%;font-size:10px;border-collapse:collapse;">
          <thead><tr style="background:#0d1f36;color:#fff;">
            <th style="padding:8px 12px;text-align:left;font-size:9px;font-weight:700;letter-spacing:0.5px;">Parcelas</th>
            <th style="padding:8px 12px;text-align:right;font-size:9px;font-weight:700;letter-spacing:0.5px;">Valor da Parcela*</th>
          </tr></thead>
          <tbody>
            ${[12,24,36,48,60].map((n,i)=>{
              const taxa=0.0149, pmt=total*(taxa*Math.pow(1+taxa,n))/(Math.pow(1+taxa,n)-1);
              return `<tr style="${i%2===0?'background:#fff;':'background:#f8fafc;'}">
                <td style="padding:7px 12px;border-bottom:1px solid #e2e8f0;color:#374151;font-weight:600;">${n}x</td>
                <td style="padding:7px 12px;text-align:right;border-bottom:1px solid #e2e8f0;font-weight:800;color:#0d1f36;">R$ ${fmtR(pmt)}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
        <div style="font-size:8px;color:#94a3b8;margin-top:8px;text-align:right;">* Simulacao com taxa de 1,49% a.m. Sujeito a analise de credito.</div>
      </div>
    </div>

    ${rodape(empresa, 5)}
  </div>`;
}

// ─── Carrega foto da capa ─────────────────────────────────────────────────────

async function loadCoverPhoto() {
  try {
    const res = await fetch('/solar-cover.jpg');
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// ─── Função interna principal ─────────────────────────────────────────────────

async function generateAndDownload(empresa, cliente, params, orcId) {
  const { kwh, kwpTxt, kwpN, cidade, estado, conta, total, items } = params;

  const hsp          = (HSP_CIDADES[estado]?.[cidade]) || 4.5;
  const geracaoMens  = Math.round(kwpN * hsp * 30 * 0.78);
  const geracaoAnual = geracaoMens * 12;
  const tarifa       = kwh > 0 && conta > 0 ? conta / kwh : 0.98;
  const economiaMens = Math.round(geracaoMens * tarifa * 100) / 100;
  const economiaAnual= economiaMens * 12;
  const payback      = economiaAnual > 0 ? (total / economiaAnual).toFixed(1) : '–';
  const eco30        = calcEconomia30Anos(economiaMens);
  const hoje         = new Date().toLocaleDateString('pt-BR');
  const coverPhoto   = await loadCoverPhoto();

  const logoHtml = empresa.logo
    ? `<img src="${empresa.logo}" style="max-height:60px;object-fit:contain;">`
    : `<span style="font-size:20px;font-weight:900;color:#e67e22;">${empresa.nome||'Solar Pro'}</span>`;

  const itensHtml = items.map((it, i) => `
    <tr style="${i%2===0?'background:#f8fafc;':'background:#fff;'}">
      <td style="padding:9px 14px;text-align:center;font-weight:800;width:70px;color:#0d1f36;border-bottom:1px solid #e2e8f0;">${it.qtd}</td>
      <td style="padding:9px 14px;color:#374151;border-bottom:1px solid #e2e8f0;font-size:10.5px;">${it.desc}</td>
    </tr>`).join('');

  const sections = [
    buildCover(empresa, cliente, kwpTxt, kwpN, logoHtml, hoje, coverPhoto),
    buildComoFunciona(logoHtml, empresa),
    buildProjeto(logoHtml, empresa, cliente, kwh, kwpTxt, geracaoMens, geracaoAnual, hsp, cidade, estado, itensHtml),
    buildServicos(logoHtml, empresa, conta, geracaoMens, economiaMens, economiaAnual, total),
  ];
  if (economiaMens > 0) {
    sections.push(buildAnalise(logoHtml, empresa, total, economiaAnual, payback, eco30));
  }

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

  for (let i = 0; i < sections.length; i++) {
    const canvas = await htmlToCanvas(sections[i]);
    addCanvasToDoc(doc, canvas, i === 0);
  }

  const nomeArquivo = `Proposta_Solar_${cliente.nome.replace(/\s+/g,'_')}.pdf`;
  const blob = doc.output('blob');

  // Upload para o Supabase Storage
  let pdfUrl = null;
  try {
    pdfUrl = await Data.uploadPDF(blob, nomeArquivo);
  } catch (uploadErr) {
    console.error('Erro ao fazer upload do PDF:', uploadErr);
  }

  // Atualiza pdf_url no orçamento se tiver id
  if (orcId && pdfUrl) {
    await supabase.from('orcamentos').update({ pdf_url: pdfUrl }).eq('id', orcId);
  }

  // Dispara download local
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = nomeArquivo;
  a.click();
  URL.revokeObjectURL(blobUrl);

  return pdfUrl;
}

// ─── Exportações ──────────────────────────────────────────────────────────────

export async function salvarOrcamento() {
  const clienteId = document.getElementById('prop-cliente-select').value;
  if (!clienteId) return alert('Selecione um cliente primeiro.');
  if (!AppState.propostaItems || AppState.propostaItems.length === 0) return alert('Adicione pelo menos um item.');
  const total = AppState.propostaTotal || 0;
  if (total <= 0) return alert('Informe os custos para calcular o valor total.');

  const btn = document.getElementById('btn-salvar-orc');
  btn.innerText = 'SALVANDO...';
  btn.disabled = true;

  try {
    const cliente  = AppState.clientes.find(c => c.id === clienteId);
    const kwh      = parseFloat(document.getElementById('calc-kwh').value) || 0;
    const kwpTxt   = document.getElementById('res-kwp').innerText;
    const cidadeEl = document.getElementById('calc-cidade');
    const cidade   = cidadeEl.options[cidadeEl.selectedIndex]?.text || '';
    const estado   = document.getElementById('calc-estado').value;
    const conta    = parseFloat(document.getElementById('prop-conta-energia').value) || 0;

    const { data: inserted, error } = await supabase.from('orcamentos').insert([{
      user_id:      Data.user.id,
      cliente_id:   cliente.id,
      cliente_nome: cliente.nome,
      potencia_kwp: kwpTxt,
      valor_total:  total,
      pdf_url:      null,
      dados_proposta: {
        consumo_kwh: kwh, cidade, estado,
        conta_energia: conta,
        itens: AppState.propostaItems,
        custos: {
          kit:   document.getElementById('prop-custo-kit').value,
          mo:    document.getElementById('prop-custo-mo').value,
          eng:   document.getElementById('prop-custo-eng').value,
          extra: document.getElementById('prop-custo-extra').value
        }
      }
    }]).select('id').single();

    if (error) throw error;

    // Gera PDF automaticamente após salvar
    btn.innerText = 'GERANDO PDF...';
    try {
      const empresa  = await Data.getEmpresa();
      const kwpN     = parseFloat(kwpTxt) || 0;
      const items    = AppState.propostaItems;
      const pdfUrl   = await generateAndDownload(empresa, cliente, {
        kwh, kwpTxt, kwpN, cidade, estado, conta, total, items
      }, inserted.id);

      if (pdfUrl) {
        alert('Orçamento salvo e PDF gerado com sucesso!');
      } else {
        alert('Orçamento salvo! O PDF não pôde ser gerado agora, tente pela aba Orçamentos.');
      }
    } catch (pdfErr) {
      console.error('Erro ao gerar PDF automático:', pdfErr);
      alert('Orçamento salvo! O PDF não pôde ser gerado agora, tente pela aba Orçamentos.');
    }

    const { Router } = await import('./ui.js');
    Router.to('orcamentos');
  } catch (e) {
    alert('Erro ao salvar orçamento: ' + e.message);
    console.error(e);
  } finally {
    btn.innerText = 'SALVAR ORÇAMENTO';
    btn.disabled = false;
  }
}

// Gera PDF e retorna a URL sem tocar no DOM — usada pelo fluxo de e-mail
export async function gerarPdfUrl(orcamentoId) {
  try {
    console.log('[gerarPdfUrl] iniciando para', orcamentoId);

    const { data: orcData, error: orcErr } = await supabase
      .from('orcamentos').select('*').eq('id', orcamentoId).single();
    if (orcErr) throw orcErr;
    console.log('[gerarPdfUrl] orçamento carregado, pdf_url atual:', orcData.pdf_url);

    // Se já tem URL salva no banco, retorna direto sem regerar
    if (orcData.pdf_url) return orcData.pdf_url;

    const empresa = await Data.getEmpresa();
    if (!empresa) throw new Error('Empresa não encontrada');
    console.log('[gerarPdfUrl] empresa:', empresa.nome);

    const { data: clienteData, error: cliErr } = await supabase
      .from('clientes').select('*').eq('id', orcData.cliente_id).single();
    if (cliErr) throw cliErr;
    console.log('[gerarPdfUrl] cliente:', clienteData.nome);

    const dp     = orcData.dados_proposta || {};
    const kwh    = parseFloat(dp.consumo_kwh) || 0;
    const kwpTxt = orcData.potencia_kwp || '0.00';
    const kwpN   = parseFloat(kwpTxt) || 0;
    const cidade = dp.cidade || '';
    const estado = dp.estado || '';
    const conta  = parseFloat(dp.conta_energia) || 0;
    const total  = parseFloat(orcData.valor_total) || 0;
    const items  = dp.itens || [];

    const url = await generateAndDownload(empresa, clienteData, {
      kwh, kwpTxt, kwpN, cidade, estado, conta, total, items
    }, orcData.id);
    console.log('[gerarPdfUrl] resultado upload:', url);
    return url;
  } catch (e) {
    console.error('[gerarPdfUrl] ERRO:', e);
    alert('Erro ao gerar PDF: ' + e.message);
    return null;
  }
}

export async function gerarPDFDeOrcamento(orcamentoId) {
  const btn = document.querySelector(`[data-gerar="${orcamentoId}"]`);
  if (!btn) {
    console.error('Botão não encontrado para ID:', orcamentoId);
    return;
  }
  
  const textoOriginal = btn.innerHTML;
  btn.innerText = 'Gerando...';
  btn.disabled = true;

  try {
    // Busca dados do orçamento
    const orc = await supabase
      .from('orcamentos')
      .select('*')
      .eq('id', orcamentoId)
      .single();
    
    if (orc.error) throw orc.error;
    if (!orc.data) throw new Error('Orçamento não encontrado');

    const { data: orcData } = orc;
    const empresa = await Data.getEmpresa();
    if (!empresa) throw new Error('Empresa não encontrada');
    
    const { data: clienteData, error: cliErr } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', orcData.cliente_id)
      .single();
    
    if (cliErr) throw cliErr;
    if (!clienteData) throw new Error('Cliente não encontrado');

    const dp     = orcData.dados_proposta || {};
    const kwh    = parseFloat(dp.consumo_kwh) || 0;
    const kwpTxt = orcData.potencia_kwp || '0.00';
    const kwpN   = parseFloat(kwpTxt) || 0;
    const cidade = dp.cidade || '';
    const estado = dp.estado || '';
    const conta  = parseFloat(dp.conta_energia) || 0;
    const total  = parseFloat(orcData.valor_total) || 0;
    const items  = dp.itens || [];

    const pdfUrl = await generateAndDownload(empresa, clienteData, {
      kwh, kwpTxt, kwpN, cidade, estado, conta, total, items
    }, orcData.id);

    if (pdfUrl) {
      btn.outerHTML = `<a href="${pdfUrl}" target="_blank" class="flex items-center gap-1 px-3 py-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 text-xs font-bold transition-all">📄 PDF</a>`;
    } else {
      btn.innerHTML = textoOriginal;
      btn.disabled = false;
    }

    // Recarrega lista
    const { UI } = await import('./ui.js');
    UI.renderOrcamentos();

    return pdfUrl;
  } catch (e) {
    alert('Erro ao gerar PDF: ' + e.message);
    console.error(e);
    if (btn) {
      btn.innerHTML = textoOriginal;
      btn.disabled = false;
    }
    return null;
  }
}
