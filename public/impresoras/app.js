/* Alquiler de Impresoras — Cuadro de Consumo Reprodata (creado por Olinda Orellana).
   Importa el PDF mensual del proveedor, valida los contadores contra el mes anterior, mantiene el
   maestro de impresoras y el histórico en este navegador, y genera el asiento SAP en Excel.
   El acceso lo maneja /comun/acceso.js, que llama a window.montarApp() con la sesión iniciada. */
/* ---------------- estilos ---------------- */
const ESTILOS = `
  :root{
    --azul:#1f3864;
    --azul-oscuro:#12244a;
    --azul-medio:#2f5496;
    --azul-claro:#4b6fa8;
    --amarillo:#f5b300;
    --amarillo-claro:#fff4cf;
    --rojo:#c0392b;
    --verde:#0e8a5f;
    --ambar:#b37400;
    --texto:#0f172a;
    --texto-suave:#475569;
    --texto-mas-suave:#94a3b8;
    --borde:#e2e8f0;
    --borde-tabla:#cbd5e1;
    --bg:#f1f5f9;
    --bg-card:#ffffff;
    --bg-sutil:#f8fafc;
    --bg-zebra:#f9fbff;
    --bg-header-tabla:linear-gradient(180deg, #1f3864 0%, #17294a 100%);
    --sombra-sm:0 1px 2px rgba(15,23,42,.06), 0 1px 3px rgba(15,23,42,.04);
    --sombra-md:0 2px 4px rgba(15,23,42,.06), 0 4px 12px rgba(15,23,42,.06);
    --sombra-lg:0 4px 8px rgba(15,23,42,.06), 0 12px 28px rgba(15,23,42,.08);
    --radio:10px;
    --radio-sm:6px;
    --transicion:all 160ms cubic-bezier(.4,0,.2,1);
  }
  *{box-sizing:border-box}
  html,body{height:100%}
  body{
    font-family:'Inter','Segoe UI',system-ui,-apple-system,Arial,sans-serif;
    margin:0;padding:0;
    color:var(--texto);
    font-size:13px;
    line-height:1.45;
    -webkit-font-smoothing:antialiased;
    -moz-osx-font-smoothing:grayscale;
    background-color:#eef3fa;
    background-image:
      radial-gradient(at 12% 8%,  rgba(47,84,150,.18) 0%, transparent 42%),
      radial-gradient(at 88% 6%,  rgba(245,179,0,.10) 0%, transparent 40%),
      radial-gradient(at 92% 92%, rgba(75,111,168,.16) 0%, transparent 45%),
      radial-gradient(at 8% 96%,  rgba(31,56,100,.10) 0%, transparent 42%),
      linear-gradient(180deg, #f3f7fc 0%, #e7eef8 100%);
    background-attachment:fixed;
    background-repeat:no-repeat;
    position:relative;
  }
  body::before{
    content:'';position:fixed;inset:0;pointer-events:none;z-index:0;
    background-image: radial-gradient(circle at 1px 1px, rgba(31,56,100,.045) 1px, transparent 0);
    background-size: 22px 22px;
    mask-image: radial-gradient(ellipse at center, #000 30%, transparent 80%);
    -webkit-mask-image: radial-gradient(ellipse at center, #000 30%, transparent 80%);
  }
  .app{position:relative;z-index:1}
  .app{max-width:1600px;margin:0 auto;padding:24px 28px 48px}

  /* Header */
  .appbar{
    background:linear-gradient(135deg, #1f3864 0%, #2f5496 100%);
    color:#fff;
    border-radius:var(--radio);
    padding:18px 24px;
    box-shadow:var(--sombra-md);
    display:flex;align-items:center;justify-content:space-between;gap:16px;
    margin-bottom:20px;
    position:relative;overflow:hidden;
  }
  .appbar::after{
    content:'';position:absolute;right:-60px;top:-60px;width:220px;height:220px;
    background:radial-gradient(circle, rgba(245,179,0,.18) 0%, transparent 65%);
    pointer-events:none;
  }
  .appbar h1{
    font-size:19px;font-weight:700;margin:0;letter-spacing:-.01em;
    display:flex;align-items:center;gap:10px;
  }
  .appbar h1 .dot{width:10px;height:10px;border-radius:50%;background:var(--amarillo);box-shadow:0 0 0 4px rgba(245,179,0,.25)}
  .appbar .subtitulo{font-size:12px;opacity:.85;margin-top:2px;font-weight:400}
  .appbar .chip{
    background:rgba(255,255,255,.12);padding:6px 12px;border-radius:999px;
    font-size:11px;font-weight:500;letter-spacing:.02em;backdrop-filter:blur(6px);
    border:1px solid rgba(255,255,255,.15);
  }

  /* Toolbar */
  .toolbar{
    display:flex;gap:8px;align-items:center;flex-wrap:wrap;
    margin-bottom:16px;padding:14px 16px;
    background:var(--bg-card);
    border:1px solid var(--borde);
    border-radius:var(--radio);
    box-shadow:var(--sombra-sm);
  }
  .toolbar button,.toolbar label.btn{
    padding:8px 14px;border:1px solid transparent;
    background:var(--azul);color:#fff;cursor:pointer;
    border-radius:var(--radio-sm);font-size:12px;font-weight:500;font-family:inherit;
    transition:var(--transicion);
    display:inline-flex;align-items:center;gap:6px;
    box-shadow:0 1px 0 rgba(0,0,0,.04);
    letter-spacing:.01em;
  }
  .toolbar button:hover,.toolbar label.btn:hover{background:var(--azul-oscuro);transform:translateY(-1px);box-shadow:var(--sombra-sm)}
  .toolbar button:active,.toolbar label.btn:active{transform:translateY(0)}
  .toolbar button.secundario,.toolbar label.btn.secundario{
    background:#fff;color:var(--azul);border:1px solid var(--borde);
  }
  .toolbar button.secundario:hover,.toolbar label.btn.secundario:hover{background:var(--bg-sutil);border-color:var(--azul-claro);color:var(--azul)}
  .toolbar input[type=file]{display:none}
  .status{
    font-size:12px;color:var(--texto-suave);margin-left:auto;
    display:inline-flex;align-items:center;gap:6px;
  }
  .status::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--verde);box-shadow:0 0 0 3px rgba(14,138,95,.18)}
  .status.error{color:var(--rojo);font-weight:600}
  .status.error::before{background:var(--rojo);box-shadow:0 0 0 3px rgba(192,57,43,.18)}

  /* Resumen (KPIs) */
  .resumen{
    margin-bottom:16px;padding:0;background:transparent;border:none;
    display:grid;gap:12px;
    grid-template-columns:repeat(auto-fit,minmax(200px,1fr));
  }
  .resumen .kpi{
    background:var(--bg-card);
    border:1px solid var(--borde);
    border-radius:var(--radio);
    padding:14px 16px;
    box-shadow:var(--sombra-sm);
    transition:var(--transicion);
    position:relative;overflow:hidden;
  }
  .resumen .kpi::before{
    content:'';position:absolute;left:0;top:0;bottom:0;width:3px;
    background:linear-gradient(180deg,var(--azul-medio),var(--azul));
  }
  .resumen .kpi:hover{transform:translateY(-2px);box-shadow:var(--sombra-md)}
  .resumen .kpi .lbl{
    font-size:10.5px;color:var(--texto-mas-suave);text-transform:uppercase;
    letter-spacing:.08em;font-weight:600;margin-bottom:4px;
  }
  .resumen .kpi .val{
    font-size:22px;font-weight:700;color:var(--azul);letter-spacing:-.01em;
    font-family:'Inter',sans-serif;
  }

  /* Panels */
  .panel{
    margin-top:16px;padding:16px 18px;
    background:var(--bg-card);
    border:1px solid var(--borde);
    border-radius:var(--radio);
    box-shadow:var(--sombra-sm);
  }
  .panel h3{
    margin:0 0 12px 0;font-size:13px;color:var(--azul);
    font-weight:600;letter-spacing:-.01em;
    display:flex;align-items:center;gap:8px;
  }
  .panel h3::before{
    content:'';width:4px;height:14px;background:var(--amarillo);border-radius:2px;
  }

  /* Banners */
  .banner{
    padding:11px 14px;margin-top:10px;border-radius:var(--radio-sm);
    font-size:12.5px;font-weight:500;
    border-left:3px solid;
    display:flex;gap:8px;align-items:flex-start;
  }
  .banner.info{background:#eaf2fb;border-color:var(--azul-medio);color:#15305c}
  .banner.warn{background:#fff4dd;border-color:#e0921b;color:#7a4a00}
  .banner.err{background:#fde8e6;border-color:var(--rojo);color:#8a1e12}
  .banner.ok{background:#e5f6ec;border-color:var(--verde);color:#0b5a3d}

  /* Histórico — badges */
  .mes-item{
    display:inline-flex;align-items:center;gap:6px;margin:2px 6px 2px 0;
    padding:5px 10px 5px 12px;
    background:linear-gradient(180deg,#fff,#f6f9ff);
    border:1px solid var(--borde);border-radius:999px;font-size:11.5px;
    box-shadow:0 1px 2px rgba(15,23,42,.04);
    color:var(--azul);font-weight:500;
    transition:var(--transicion);
    cursor:pointer;
  }
  .mes-item:hover{
    border-color:var(--azul-medio);
    box-shadow:var(--sombra-md);
    background:linear-gradient(180deg,#eaf2fb,#dfe9f7);
    transform:translateY(-1px);
  }
  .mes-item:active{transform:translateY(0)}
  .mes-item b{color:var(--azul-oscuro);font-weight:600}
  .mes-item button{
    background:transparent;border:none;color:var(--texto-mas-suave);cursor:pointer;
    padding:2px 4px;font-size:14px;line-height:1;border-radius:50%;
    transition:var(--transicion);
  }
  .mes-item button:hover{color:var(--rojo);background:#fde8e6}

  details{margin-top:8px}
  details summary{
    cursor:pointer;color:var(--azul);font-size:12px;font-weight:500;
    padding:4px 0;user-select:none;
  }
  details summary:hover{color:var(--azul-oscuro)}
  .discrepancias{max-height:240px;overflow:auto;margin-top:8px;font-size:11.5px;border-radius:var(--radio-sm);border:1px solid var(--borde)}

  /* Tablas */
  .wrap{
    overflow:auto;background:var(--bg-card);
    border:1px solid var(--borde);border-radius:var(--radio);
    box-shadow:var(--sombra-sm);
  }
  table{
    border-collapse:separate;border-spacing:0;
    font-size:11.5px;white-space:nowrap;width:100%;
  }
  th,td{
    border-bottom:1px solid var(--borde);
    border-right:1px solid var(--borde);
    padding:7px 9px;text-align:center;vertical-align:middle;
  }
  th:last-child,td:last-child{border-right:none}
  thead th{
    background:var(--bg-header-tabla);color:#fff;
    font-weight:600;position:sticky;top:0;z-index:2;
    font-size:11px;letter-spacing:.02em;
    padding:10px 9px;
    border-bottom:2px solid var(--azul-oscuro);
    border-right:1px solid rgba(255,255,255,.12);
    text-transform:uppercase;
  }
  thead th:last-child{border-right:none}
  tbody tr{transition:background 120ms ease}
  tbody tr:hover td{background:#f0f6ff !important}
  tbody tr:hover td.fecha{background:#f5c942 !important}
  tbody tr:hover td.ci-ok{background:#bce7be !important}
  tbody tr:hover td.ci-err{background:#ffc3c3 !important}
  td.fecha{background:linear-gradient(180deg,#f5b300,#e8a400);color:#3a2400;font-weight:700;letter-spacing:.02em}
  td.obs{text-align:left;max-width:340px;white-space:normal;line-height:1.35;color:var(--texto-suave)}
  td.neg{color:var(--rojo);font-weight:600}
  td.excedente-hl{
    background:linear-gradient(180deg,#ffe0e0,#ffd0d0)!important;
    color:#8a1e12;font-weight:700;
    box-shadow:inset 0 0 0 1px rgba(192,57,43,.18);
  }
  td.total-rojo{
    background:linear-gradient(180deg,#ffe0e0,#ffd0d0)!important;
    color:#8a1e12;font-weight:700;
    box-shadow:inset 0 0 0 1px rgba(192,57,43,.18);
  }
  tr.tiene-excedente td.obs{
    border-left:3px solid var(--rojo);
    color:var(--rojo);font-weight:600;
  }
  td.num{text-align:right;font-variant-numeric:tabular-nums;font-family:'JetBrains Mono','Inter',monospace;font-size:11px}
  tr.sep td{border-top:2px solid var(--borde-tabla)}
  tr.sep:first-child td{border-top:none}
  tr.pend td{background:#fff4dd}
  tr.editado td{background:#fff7cf !important}
  tr.fila-total td{
    background:linear-gradient(180deg,#fff4cf,#ffe88a) !important;
    border-top:2.5px solid var(--azul-oscuro) !important;
    border-bottom:2.5px solid var(--azul-oscuro) !important;
    font-weight:700;color:var(--azul-oscuro);
    font-size:12px;letter-spacing:.01em;
    padding:9px 9px;
  }
  tr.fila-total:hover td{background:linear-gradient(180deg,#fff4cf,#ffe88a) !important}
  tr.fila-total td.num{font-family:'JetBrains Mono','Inter',monospace}
  td.ci-ok{background:#d8f5dc}
  td.ci-err{background:#ffd6d6}
  .ci-badge{
    display:inline-block;margin-left:5px;font-weight:700;font-size:11px;
    padding:1px 5px;border-radius:4px;
  }
  .ci-badge.ok{color:#065f3f;background:#c6f0d0}
  .ci-badge.err{color:#7a1b10;background:#ffc3c3}

  /* Edición in-line */
  td.editable{
    background:#fffdf0;cursor:text;
    position:relative;
  }
  td.editable::after{
    content:'✎';position:absolute;right:4px;top:50%;transform:translateY(-50%);
    font-size:9px;color:#d0a400;opacity:0;transition:var(--transicion);pointer-events:none;
  }
  td.editable:hover::after{opacity:1}
  td.editable:focus{outline:2px solid var(--azul-medio);outline-offset:-2px;background:#fff}
  td.editable:hover{background:#fff4c2}

  /* Input tipo texto */
  input[type=text]{
    padding:7px 10px;border:1px solid var(--borde);border-radius:var(--radio-sm);
    font-size:12px;font-family:inherit;color:var(--texto);
    transition:var(--transicion);background:#fff;
  }
  input[type=text]:focus{outline:none;border-color:var(--azul-medio);box-shadow:0 0 0 3px rgba(47,84,150,.15)}

  label.inline{
    display:inline-flex;align-items:center;gap:8px;font-size:11.5px;
    color:var(--texto-suave);font-weight:500;
  }

  kbd{
    background:#fff;border:1px solid var(--borde);border-bottom-width:2px;
    border-radius:4px;padding:1px 6px;font-family:'JetBrains Mono',monospace;
    font-size:10.5px;color:var(--texto);
  }

  .leyenda{font-size:11.5px;color:var(--texto-suave);margin-top:10px;line-height:1.55}
  .leyenda b{color:var(--azul)}
  .hint-edit{
    font-size:11.5px;color:var(--texto-suave);margin-top:10px;line-height:1.55;
    padding:10px 12px;background:#fffbec;border:1px solid #f5e2a8;border-radius:var(--radio-sm);
  }
  .hint-edit b{color:var(--ambar)}

  /* Scroll */
  ::-webkit-scrollbar{width:10px;height:10px}
  ::-webkit-scrollbar-track{background:#f0f4f9}
  ::-webkit-scrollbar-thumb{background:#c6d0dd;border-radius:8px;border:2px solid #f0f4f9}
  ::-webkit-scrollbar-thumb:hover{background:#9fadbf}

  @media (max-width: 720px){
    .app{padding:14px}
    .appbar{flex-direction:column;align-items:flex-start}
    .appbar h1{font-size:16px}
  }

  .creditos{
    margin:32px auto 12px;text-align:center;font-size:11px;color:var(--texto-suave);
    padding:14px 16px;
    border-top:1px solid var(--borde);
  }
  .creditos .nombre{
    font-size:13px;font-weight:600;color:var(--azul);letter-spacing:.01em;
    display:inline-flex;align-items:center;gap:8px;
  }
  .creditos .nombre::before, .creditos .nombre::after{
    content:'';display:inline-block;width:24px;height:1px;background:var(--borde);
  }
  .creditos .rol{
    font-size:10.5px;text-transform:uppercase;letter-spacing:.14em;
    color:var(--texto-mas-suave);font-weight:500;margin-top:2px;
  }
  .creditos .marca{
    font-size:10px;color:var(--texto-mas-suave);margin-top:6px;font-weight:400;
  }

  /* ====== Modal Maestro de impresoras ====== */
  .modal-fondo{
    position:fixed;inset:0;z-index:1000;display:none;
    background:rgba(15,23,42,.45);backdrop-filter:blur(2px);
    align-items:flex-start;justify-content:center;padding:32px 16px;overflow:auto;
  }
  .modal-fondo.abierto{display:flex}
  .modal-caja{
    background:var(--bg-card);border-radius:var(--radio);box-shadow:var(--sombra-lg);
    width:100%;max-width:1400px;border:1px solid var(--borde);
  }
  .modal-cab{
    background:linear-gradient(135deg, #1f3864 0%, #2f5496 100%);color:#fff;
    padding:14px 20px;border-radius:var(--radio) var(--radio) 0 0;
    display:flex;align-items:center;justify-content:space-between;gap:12px;
  }
  .modal-cab h2{margin:0;font-size:16px;font-weight:600}
  .modal-cab .cerrar{background:transparent;border:0;color:#fff;font-size:20px;cursor:pointer;line-height:1}
  .modal-cuerpo{padding:16px 20px}
  .modal-ayuda{font-size:12px;color:var(--texto-suave);margin-bottom:12px}
  .maestro-wrap{overflow-x:auto;border:1px solid var(--borde);border-radius:var(--radio-sm)}
  table.maestro{border-collapse:collapse;width:100%;font-size:12px}
  table.maestro th{
    background:var(--azul);color:#fff;font-weight:600;text-align:left;
    padding:8px 6px;white-space:nowrap;position:sticky;top:0;
  }
  table.maestro td{padding:4px 6px;border-top:1px solid var(--borde);vertical-align:middle}
  table.maestro tr:nth-child(even) td{background:var(--bg-zebra)}
  table.maestro tr.cambiada td{background:var(--amarillo-claro)}
  table.maestro tr.nueva td{background:#e8f6ef}
  table.maestro input{
    width:100%;padding:5px 7px;border:1px solid var(--borde);border-radius:var(--radio-sm);
    font-size:12px;font-family:inherit;background:#fff;color:var(--texto);
  }
  table.maestro input:focus{outline:none;border-color:var(--azul-medio);box-shadow:0 0 0 2px rgba(47,84,150,.15)}
  table.maestro input.num{text-align:right;font-family:'JetBrains Mono',monospace}
  table.maestro input.sn{font-family:'JetBrains Mono',monospace;font-weight:600}
  table.maestro input.error{border-color:var(--rojo);background:#fde8e6}
  table.maestro button.quitar{
    background:transparent;border:1px solid var(--borde);color:var(--rojo);
    border-radius:var(--radio-sm);padding:4px 8px;cursor:pointer;font-size:12px;
  }
  table.maestro button.quitar:hover{background:#fde8e6;border-color:var(--rojo)}
  .modal-pie{
    display:flex;gap:8px;align-items:center;flex-wrap:wrap;
    padding:12px 20px 16px;border-top:1px solid var(--borde);
  }
  .modal-pie .espacio{flex:1}
  .modal-pie button,.modal-pie label.btn{
    padding:8px 14px;border:1px solid transparent;background:var(--azul);color:#fff;cursor:pointer;
    border-radius:var(--radio-sm);font-size:12px;font-weight:500;font-family:inherit;
    display:inline-flex;align-items:center;gap:6px;
  }
  .modal-pie button:hover,.modal-pie label.btn:hover{background:var(--azul-oscuro)}
  .modal-pie button.secundario,.modal-pie label.btn.secundario{background:#fff;color:var(--azul);border-color:var(--borde)}
  .modal-pie button.secundario:hover,.modal-pie label.btn.secundario:hover{background:var(--bg-sutil);border-color:var(--azul-claro)}
  .modal-pie button.peligro{background:#fff;color:var(--rojo);border-color:var(--borde)}
  .modal-pie button.peligro:hover{background:#fde8e6;border-color:var(--rojo)}
  .modal-pie input[type=file]{display:none}
  table.maestro tr.retirada td{background:#f1f5f9}
  table.maestro tr.retirada input:not([data-campo=salida]){color:var(--texto-mas-suave);text-decoration:line-through}
  table.maestro input[type=date]{min-width:130px}
  .tag-fecha{display:block;margin-top:4px;font-size:10.5px;font-weight:600;padding:1px 6px;border-radius:4px;width:max-content}
  .tag-fecha.in{background:#e8f6ef;color:var(--verde)}
  .tag-fecha.out{background:#fdecea;color:var(--rojo)}
  .aviso-maestro{
    margin:0 0 16px;padding:12px 16px;border-radius:var(--radio);border:1px solid #f0c36d;
    background:#fff8e6;color:#7a4b00;font-size:12.5px;box-shadow:var(--sombra-sm)
  }
  .aviso-maestro.grave{border-color:#e8a29b;background:#fdecea;color:#8a1c12}
  .aviso-maestro b{font-weight:700}
  .aviso-maestro ul{margin:6px 0 0 18px;padding:0}
  .modal-msg{font-size:12px;color:var(--texto-suave)}
  .modal-msg.error{color:var(--rojo);font-weight:600}
  .modal-msg.ok{color:var(--verde);font-weight:600}
  /* Sesión (menú, usuario, salir) en la barra superior */
  .appbar .sesion{display:flex;align-items:center;gap:10px;flex-wrap:wrap;position:relative;z-index:1}
  .appbar .nav-btn{
    font:inherit;font-size:12px;font-weight:500;color:#fff;text-decoration:none;cursor:pointer;
    background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.3);border-radius:var(--radio-sm);padding:6px 12px;
  }
  .appbar .nav-btn:hover{background:rgba(255,255,255,.22)}
  .appbar .userchip{font-size:11.5px;opacity:.85;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  @media (max-width:720px){ .appbar .userchip{display:none} }
`;

/* ---------------- interfaz ---------------- */
const INTERFAZ = `
<div class="app">

<header class="appbar">
  <div>
    <h1><span class="dot"></span>Cuadro de Consumo — Reprodata</h1>
    <div class="subtitulo">Contrato 276580 · HOTELERA COSTA DEL PACIFICO S.A.</div>
  </div>
  <div class="sesion">
    <div class="chip" id="chipEstado">Importador mensual de facturación</div>
    <a class="nav-btn" href="/" title="Volver al menú de sistemas">← Menú</a>
    <span class="userchip" id="userMail"></span>
    <button class="nav-btn" id="salirBtn" type="button" title="Cerrar sesión">Salir</button>
  </div>
</header>

<div class="toolbar">
  <label for="fileInput" class="btn">📁 Importar PDF</label>
  <input type="file" id="fileInput" accept="application/pdf">
  <button id="btnGuardarMes">💾 Guardar este mes</button>
  <button class="secundario" id="btnMaestro" title="Modificar ubicación, IP, cuenta o centro de costo de las impresoras">🖨 Maestro de impresoras</button>
  <button class="secundario" id="btnLimpiar" title="Vacía la pantalla. El histórico local se mantiene.">🔄 Limpiar</button>
  <span class="status" id="status">Listo. Cargue el PDF para procesar.</span>
</div>

<div class="resumen" id="resumen" style="display:none">
  <div class="kpi"><div class="lbl">Período</div><div class="val" id="kpiPeriodo">—</div></div>
  <div class="kpi"><div class="lbl">Equipos</div><div class="val" id="kpiEquipos">0</div></div>
  <div class="kpi"><div class="lbl">Total Renta Mensual</div><div class="val" id="kpiRenta">S/ 0.00</div></div>
  <div class="kpi"><div class="lbl">Total Excedente</div><div class="val" id="kpiExcedente">S/ 0.00</div></div>
  <div class="kpi"><div class="lbl">Validación CI vs Mes Anterior</div><div class="val" id="kpiValidacion">—</div></div>
</div>

<div id="bannerCompara"></div>
<div id="avisoMaestro"></div>

<div class="panel" id="panelSelectorMes" style="display:none">
  <h3>El PDF contiene varios meses</h3>
  <div style="font-size:12px;color:var(--texto-suave);margin-bottom:8px">Seleccione qué mes procesar (cada mes se calcula con sus propios datos):</div>
  <div id="botonesMes" style="display:flex;gap:6px;flex-wrap:wrap"></div>
</div>

<div class="panel" id="panelHistorico">
  <h3>Histórico local (navegador)</h3>
  <div id="listaMeses" style="min-height:24px">— sin meses guardados —</div>
  <details id="detalleDiscrepancias" style="display:none">
    <summary id="sumDiscrepancias">Ver discrepancias</summary>
    <div class="discrepancias" id="tablaDiscrepancias"></div>
  </details>
</div>

<div class="wrap">
  <table id="tabla">
    <thead>
      <tr>
        <th>Fecha</th>
        <th>Marca</th>
        <th>Modelo</th>
        <th>S/N</th>
        <th>IP</th>
        <th>Observación</th>
        <th>Cantidad<br>Impresoras</th>
        <th>Bolsa</th>
        <th>Formatos</th>
        <th>Contador<br>Inicial</th>
        <th id="thCfAnt" style="display:none;background:linear-gradient(180deg,#3a5c97,#27406a)">CF<br><span id="thCfAntMes">mes ant.</span></th>
        <th id="thDelta" style="display:none;background:linear-gradient(180deg,#3a5c97,#27406a)">Δ<br>vs CI</th>
        <th>Contador<br>Final</th>
        <th>Consumo<br>del Mes</th>
        <th>Volumen Máximo<br>Establecido</th>
        <th>Volumen<br>Excedente</th>
        <th>Precio</th>
        <th>Total</th>
        <th>alquiler<br>fijo</th>
        <th>Cuenta</th>
        <th>Centro<br>Costo</th>
      </tr>
    </thead>
    <tbody id="tbody">
      <tr><td colspan="21" style="padding:20px;color:#888">— Sin datos. Importe un PDF para ver la tabla —</td></tr>
    </tbody>
  </table>
</div>

<div class="panel" id="panelSAP">
  <h3>Asiento contable SAP</h3>
  <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:12px">
    <label class="inline">N° Factura
      <input type="text" id="inpFactura" value="01-F020-00027840" style="width:200px">
    </label>
    <button id="btnGenSAP">⚙ Generar asiento SAP</button>
    <button class="secundario" id="btnCopiarSAP">📋 Copiar (TSV)</button>
    <button class="secundario" id="btnDescargarXLSX">⬇ Descargar .xlsx</button>
    <span id="statusSAP" style="font-size:11.5px;color:var(--texto-suave);font-weight:500"></span>
  </div>
  <div class="wrap" style="max-height:340px">
    <table id="tablaSAP">
      <thead>
        <tr>
          <th>Datos</th><th>Monto</th><th>Modelo</th><th>S/N</th><th>IP</th>
          <th>CECO</th><th>Monto USD</th><th>Cuenta</th><th>Débito<br>(ME)</th>
          <th>Crédito<br>(ME)</th><th>Débito</th><th>Crédito</th>
          <th>Comentarios</th><th>Referencia 2</th><th>Centro<br>Costo</th>
        </tr>
      </thead>
      <tbody id="tbodySAP">
        <tr><td colspan="15" style="padding:16px;color:#888">— Cargue un PDF y presione <b>Generar asiento SAP</b> —</td></tr>
      </tbody>
    </table>
  </div>
  <div class="hint-edit">
    💡 Las celdas en <b>amarillo claro</b> (Monto USD, Débito (ME), Crédito (ME), Comentarios) son <b>editables</b>: haga click sobre la celda, corrija el valor y presione <kbd>Enter</kbd> (o <kbd>Esc</kbd> para cancelar). Las filas modificadas quedan marcadas y el total se recalcula automáticamente. Los cambios se reflejan al <b>Copiar</b> y al <b>Descargar .xlsx</b>. El <b>.xlsx</b> exporta las <b>30 columnas</b> exactas del formato SAP (incluye <i>Cuenta de mayor, Cuenta asociada, Referencia 1, Posición, Cuenta destino, Cuenta patrimonial, Socio Negocios</i>, etc.).
  </div>
</div>

<div class="leyenda">
  <b>Marca, IP, Observación, Cuenta, Centro Costo y Volumen Máximo</b> se autocompletan desde el maestro interno. Las filas con fondo naranja indican un S/N del PDF que aún no existe en el maestro.<br>
  <b>Validación mensual:</b> al importar un PDF se compara cada <i>Contador Inicial</i> del PDF contra el <i>Contador Final</i> del mes anterior guardado. <span class="ci-badge ok">✓</span> fondo verde = cuadra. <span class="ci-badge err">✗</span> fondo rojo = discrepancia (posible error de facturación). Use <b>Guardar este mes</b> para ir armando el histórico y <b>Exportar histórico</b> para respaldar (los datos viven en el navegador; si cambia de equipo, impórtelos con <b>Importar histórico</b>).
</div>
<!-- ====== Modal: Maestro de impresoras ====== -->
<div class="modal-fondo" id="modalMaestro">
  <div class="modal-caja" role="dialog" aria-labelledby="tituloMaestro">
    <div class="modal-cab">
      <h2 id="tituloMaestro">🖨 Maestro de impresoras</h2>
      <button class="cerrar" id="btnCerrarMaestro" title="Cerrar sin guardar">✕</button>
    </div>
    <div class="modal-cuerpo">
      <div class="modal-ayuda">
        Cuando una impresora se mueva, cambie aquí su <b>Ubicación</b>, <b>IP</b>, <b>Cuenta</b> o <b>Centro de Costo</b> y presione <b>Guardar cambios</b>.
        Las filas en <span style="background:var(--amarillo-claro);padding:0 4px">amarillo</span> tienen cambios sin guardar y las filas en <span style="background:#e8f6ef;padding:0 4px">verde</span> son equipos nuevos.<br>
        <b>Cuando una impresora salga no la borre</b>: ponga el día exacto en <b>Fecha salida</b> (y en <b>Fecha ingreso</b> el día en que llega una nueva). Así los meses anteriores conservan su cuenta y centro de costo. El proveedor factura el mes completo, por lo que un equipo se espera en el PDF hasta el mes de su salida; si aparece en meses posteriores, el sistema le avisará.
        El maestro se guarda en este navegador. Use <b>Exportar maestro</b> para respaldarlo o pasarlo a otra PC.
      </div>
      <div class="maestro-wrap">
        <table class="maestro">
          <thead>
            <tr>
              <th style="width:120px">S/N</th>
              <th style="width:90px">Marca</th>
              <th style="width:100px">Modelo</th>
              <th style="width:120px">IP</th>
              <th>Ubicación / Observación</th>
              <th style="width:110px">Cuenta</th>
              <th style="width:80px">C. Costo</th>
              <th style="width:70px">Cant.</th>
              <th style="width:90px">Alq. fijo</th>
              <th style="width:140px" title="Día en que la impresora llegó / se instaló">Fecha ingreso</th>
              <th style="width:140px" title="Día en que la impresora salió">Fecha salida</th>
              <th style="width:44px"></th>
            </tr>
          </thead>
          <tbody id="tbodyMaestro"></tbody>
        </table>
      </div>
    </div>
    <div class="modal-pie">
      <button class="secundario" id="btnAgregarImpresora">➕ Agregar impresora</button>
      <button class="secundario" id="btnExportarMaestro">⬇ Exportar maestro</button>
      <label for="fileMaestro" class="btn secundario">⬆ Importar maestro</label>
      <input type="file" id="fileMaestro" accept="application/json,.json">
      <button class="peligro" id="btnRestaurarMaestro" title="Vuelve al maestro original que viene dentro del archivo">↺ Restaurar original</button>
      <span class="modal-msg" id="msgMaestro"></span>
      <span class="espacio"></span>
      <button class="secundario" id="btnCancelarMaestro">Cancelar</button>
      <button id="btnGuardarMaestro">💾 Guardar cambios</button>
    </div>
  </div>
</div>

<footer class="creditos">
  <div>Creado por</div>
  <div class="nombre">Olinda Orellana</div>
  <div class="rol">Accountant</div>
</footer>

</div><!-- /.app -->
`;

/* ---------------- lógica (solo con sesión iniciada) ---------------- */
window.montarApp = function(){
document.head.appendChild(Object.assign(document.createElement('style'), { textContent: ESTILOS }));
document.body.insertAdjacentHTML('afterbegin', INTERFAZ);

if (typeof pdfjsLib === 'undefined') {
  document.getElementById('status').textContent = 'Error: no se pudo cargar PDF.js. Recargue la página.';
  document.getElementById('status').classList.add('error');
} else {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/vendor/pdf.worker-3.11.174.min.js';
}

const MAESTRO = {
  "RJQ00596":{marca:"Canon",modelo:"IR-C3330",ip:"10.72.8.203",observacion:"2do Piso - Seguridad",cantidad:1,cuenta:941231308,centroCosto:408,alquilerFijo:51.68,salida:"2026-08-20"},
  "QFX06245":{marca:"Canon",modelo:"IR-1730",ip:"10.72.8.215",observacion:"2do Piso - Oficina Auditor de Ingresos",cantidad:1,cuenta:941231308,centroCosto:403,alquilerFijo:51.68},
  "35E33608":{marca:"Canon",modelo:"IR-1643",ip:"10.72.8.211",observacion:"1er Piso - Front Desk - Recepción",cantidad:1,cuenta:931221108,centroCosto:101,alquilerFijo:51.68},
  "35E33607":{marca:"Canon",modelo:"IR-1643",ip:"10.72.8.153",observacion:"1er Piso - Front Desk - Recepción",cantidad:1,cuenta:931221108,centroCosto:101,alquilerFijo:51.68},
  "X3B7002433":{marca:"Epson",modelo:"WF-C5790",ip:"10.72.8.191",observacion:"2do Piso - Oficina Banquetes",cantidad:1,cuenta:932341308,centroCosto:207,alquilerFijo:51.68},
  "X3B7003659":{marca:"Epson",modelo:"WF-C5790",ip:"10.72.8.197",observacion:"3er Piso - Reservas",cantidad:1,cuenta:943331308,centroCosto:406,alquilerFijo:51.68},
  "X3B7003660":{marca:"Epson",modelo:"WF-C5790",ip:"10.72.8.204",observacion:"1er Piso - Room Service",cantidad:1,cuenta:932341308,centroCosto:206,alquilerFijo:51.68},
  "X3B7003661":{marca:"Epson",modelo:"WF-C5790",ip:"10.72.8.132",observacion:"1er Sótano - Steward - Limpieza",cantidad:1,cuenta:932341308,centroCosto:200,alquilerFijo:51.68},
  "X3B7003671":{marca:"Epson",modelo:"WF-C5790",ip:"10.72.8.208",observacion:"1er Piso - Caja Lobby Bar",cantidad:1,cuenta:932341308,centroCosto:204,alquilerFijo:51.68},
  "X3B7003703":{marca:"Epson",modelo:"WF-C5790",ip:"10.9.10.153",observacion:"1er Piso Gym",cantidad:1,cuenta:933441108,centroCosto:304,alquilerFijo:51.68},
  "X3B7003711":{marca:"Epson",modelo:"WF-C5790",ip:"10.72.8.205",observacion:"1er Piso - Recepción - Back Office",cantidad:1,cuenta:931221108,centroCosto:101,alquilerFijo:51.68},
  "X3B7003739":{marca:"Epson",modelo:"WF-C5790",ip:"10.72.10.43",observacion:"1er Piso Compras",cantidad:1,cuenta:941231308,centroCosto:402,alquilerFijo:51.68,salida:"2026-09-28"},
  "X3B7003876":{marca:"Epson",modelo:"WF-C5790",ip:"10.72.8.220",observacion:"1er Piso - Oficina AyB",cantidad:1,cuenta:932341308,centroCosto:200,alquilerFijo:51.68},
  "XBJZ017266":{marca:"Epson",modelo:"WF-C5890",ip:"10.72.8.229",observacion:"1er Sótano - Housekeeping",cantidad:1,cuenta:931221108,centroCosto:102,alquilerFijo:51.68},
  "XBJZ017602":{marca:"Epson",modelo:"WF-C5890",ip:"10.72.8.206",observacion:"1er Piso - Compras",cantidad:1,cuenta:941231308,centroCosto:402,alquilerFijo:51.68},
  "XBJZ017603":{marca:"Epson",modelo:"WF-C5890",ip:"10.72.8.196",observacion:"1er Piso - Conserge",cantidad:1,cuenta:931221108,centroCosto:103,alquilerFijo:51.68},
  "XBJZ021745":{marca:"Epson",modelo:"WF-C5890",ip:"10.72.8.219",observacion:"1er Piso - Oficina Chef",cantidad:1,cuenta:932341308,centroCosto:200,alquilerFijo:51.68},
  "XBJZ021772":{marca:"Epson",modelo:"WF-C5890",ip:"10.72.8.151",observacion:"3er Piso - Gerencia General",cantidad:1,cuenta:941231308,centroCosto:401,alquilerFijo:51.68},
  "XBJZ027512":{marca:"Epson",modelo:"WF-C5890",ip:"10.72.8.210",observacion:"3er Piso - Ventas",cantidad:1,cuenta:943331308,centroCosto:406,alquilerFijo:51.68},
  "35009304":{marca:"Sharp",modelo:"MX-3070",ip:"10.72.8.200",observacion:"1er Sótano - RRHH - Sistemas",cantidad:1,cuenta:942331307,centroCosto:404,alquilerFijo:51.68},
  "9502370Y":{marca:"Sharp",modelo:"MX-M3070",ip:"10.72.8.207",observacion:"3er Piso - Contabilidad",cantidad:1,cuenta:941231308,centroCosto:403,alquilerFijo:51.68},
  "15064216":{marca:"Sharp",modelo:"MX-3070",ip:"",observacion:"Oficina de Gerencia de Control y Monitoreo",cantidad:1,cuenta:941231308,centroCosto:403,alquilerFijo:51.68,ingreso:"2026-09-01"},
  "2BY02028":{marca:"Canon",modelo:"MF-429",ip:"",observacion:"Oficina de Bodega",cantidad:1,cuenta:941231308,centroCosto:403,alquilerFijo:51.68,ingreso:"2026-09-01"}
};
// Fechas de ingreso/salida de cada equipo (formato AAAA-MM-DD).
// El proveedor factura el MES COMPLETO: un equipo se cobra desde el mes de su
// fecha de ingreso hasta el mes de su fecha de salida (inclusive).
function mesDeFecha(f){ return f ? String(f).slice(0,7) : null; }
function fmtFecha(f){
  if(!f) return '';
  const [a,m,d] = String(f).split('-');
  return d ? `${d}/${m}/${a}` : `${m}/${a}`;
}
// Convierte el formato anterior (alta/retiro por mes) a fechas exactas.
function normalizarFechasMaestro(m){
  for(const d of Object.values(m)){
    if(d.alta && !d.ingreso) d.ingreso = d.alta + '-01';
    if(d.retiro && !d.salida){
      const [a,mm] = d.retiro.split('-').map(Number);
      const ult = new Date(a, mm-1, 0);   // último día del mes anterior al retiro
      d.salida = `${ult.getFullYear()}-${String(ult.getMonth()+1).padStart(2,'0')}-${String(ult.getDate()).padStart(2,'0')}`;
    }
    delete d.alta; delete d.retiro;
  }
  return m;
}
// Subir este número cada vez que se edite el MAESTRO de arriba en el código,
// para que reemplace a la copia guardada en el navegador.
const MAESTRO_VERSION = 5;

// Volumen Máximo POR EQUIPO (no el total de la bolsa).
// Esta es la convención que usa Olinda en su Excel (Ejemplo.html):
// cada equipo tiene su propio volumen contractual, y al exceder se
// genera un cobro y al consumir bajo el volumen se genera un crédito
// (consumo - volMax negativo).
// Bolsa 1 son sólo B/N (Canon IR-*, MX-M3070): 3250 A4BN, 0 color.
// Bolsas 2..5 (multifuncionales color): 188 A4BN + 563 A4CL por equipo.
const VOL_MAX_BOLSA_FALLBACK = {
  "Bolsa 1":{A4BN:3250,A3BN:0,A4CL:0,A3CL:0},
  "Bolsa 2":{A4BN:188,A3BN:0,A4CL:563,A3CL:0},
  "Bolsa 3":{A4BN:188,A3BN:0,A4CL:563,A3CL:0},
  "Bolsa 4":{A4BN:188,A3BN:0,A4CL:563,A3CL:0},
  "Bolsa 5":{A4BN:188,A3BN:0,A4CL:563,A3CL:0},
  "SIN BOLSA":{A4BN:0,A3BN:0,A4CL:0,A3CL:0}
};

// VOL_MAX_BOLSA dinámico: leído del PDF al importar. Cae al fallback
// si el PDF no tiene los bloques esperados.
let VOL_MAX_BOLSA = JSON.parse(JSON.stringify(VOL_MAX_BOLSA_FALLBACK));
let PRECIOS_BOLSA = null; // se llena al importar el PDF

// Lee los bloques "BOLSA N° #X" del PDF y devuelve {[bolsa]: {[fmt]: {volMax, precio}}}.
// Estos bloques aparecen al final del cuadro con el resumen agregado por bolsa.
function extraerVolumenesPDF(lines){
  const result = {};
  const FMTS = ['A4BN','A3BN','A4CL','A3CL'];
  const isNum = t => /^-?\d+(\.\d+)?$/.test(String(t).replace(/,/g,''));
  for(let i=0;i<lines.length;i++){
    const txt = lines[i].items.map(it=>it.text).join(' ').replace(/\s+/g,' ').trim();
    // Estricto: requiere "N°" + "#" para distinguir del header de sección
    const bm = txt.match(/BOLSA\s+N°\s*#\s*(\d+)/i);
    if(!bm) continue;
    const bolsa = `Bolsa ${bm[1]}`;
    if(!result[bolsa]) result[bolsa] = {};
    // Buscar las 4 líneas siguientes con formato A4BN/A3BN/A4CL/A3CL
    let vistos = 0;
    for(let j=i+1; j<Math.min(lines.length, i+18) && vistos<4; j++){
      const tokens = [];
      for(const it of lines[j].items) for(const t of String(it.text).split(/\s+/)) if(t) tokens.push(t);
      const fmtIdx = tokens.findIndex(t => FMTS.includes(t));
      if(fmtIdx < 0) continue;
      const fmt = tokens[fmtIdx];
      const nums = [];
      for(let k=fmtIdx+1; k<tokens.length && nums.length<5; k++){
        if(isNum(tokens[k])) nums.push(parseFloat(tokens[k].replace(/,/g,'')));
        else break;
      }
      // Bloque BOLSA tiene 5 números: cons, volMax, exc, precio, cobro
      if(nums.length >= 5){
        if(!result[bolsa][fmt]){
          result[bolsa][fmt] = { volMax: nums[1], precio: nums[3] };
        }
        vistos++;
      }
    }
  }
  return result;
}

// Calcula excedentes AGREGADOS por bolsa+formato (método del proveedor)
// y reparte el cobro entre los equipos proporcional a su consumo.
function calcularBolsasAgregadas(equipos){
  const FMTS = ['A4BN','A3BN','A4CL','A3CL'];
  const bolsas = {};
  for(const eq of equipos){
    const b = eq.bolsaPdf || 'SIN BOLSA';
    if(!bolsas[b]){
      bolsas[b] = {};
      for(const f of FMTS) bolsas[b][f] = {consTotal:0, equipos:[], precio:0};
    }
    for(const f of FMTS){
      const d = eq.formatos[f] || {};
      const c = d.consumo || 0;
      bolsas[b][f].consTotal += c;
      bolsas[b][f].equipos.push({sn: eq.sn, consumo: c});
      if((d.precio||0) > 0) bolsas[b][f].precio = d.precio;
    }
  }
  // Excedente y cobro por bolsa+formato
  for(const b of Object.keys(bolsas)){
    for(const f of FMTS){
      const data = bolsas[b][f];
      const volMax = (VOL_MAX_BOLSA[b] && VOL_MAX_BOLSA[b][f] != null) ? VOL_MAX_BOLSA[b][f] : 0;
      // Precio: prefiere el del bloque BOLSA del PDF (más confiable que
      // el de cada equipo individual). Fallback al de los equipos.
      const precioPdf = (PRECIOS_BOLSA && PRECIOS_BOLSA[b] && PRECIOS_BOLSA[b][f]) || data.precio;
      data.precio = precioPdf;
      const exc = Math.max(0, data.consTotal - volMax);
      data.volMax = volMax;
      data.excedente = exc;
      data.cobroTotal = Math.round(exc * precioPdf * 10000) / 10000;
      // Repartir cobro entre equipos proporcional al consumo
      for(const e of data.equipos){
        e.excAsignado = (data.consTotal > 0) ? (e.consumo / data.consTotal) * exc : 0;
        e.cobroAsignado = (data.consTotal > 0) ? (e.consumo / data.consTotal) * data.cobroTotal : 0;
      }
    }
  }
  return bolsas;
}

// Devuelve el monto que el proveedor cobra al equipo (suma de cobros
// asignados de los 4 formatos según el agregado por bolsa).
function calcularCobroEquipo(eq, bolsasCalc){
  const FMTS = ['A4BN','A3BN','A4CL','A3CL'];
  const b = eq.bolsaPdf || 'SIN BOLSA';
  let total = 0;
  if(!bolsasCalc[b]) return 0;
  for(const f of FMTS){
    const data = bolsasCalc[b][f];
    if(!data) continue;
    const eqData = data.equipos.find(x => x.sn === eq.sn);
    if(eqData) total += eqData.cobroAsignado || 0;
  }
  return Math.round(total * 10000) / 10000;
}

const statusEl = document.getElementById('status');
function setStatus(msg, error=false){
  statusEl.textContent = msg;
  statusEl.classList.toggle('error', !!error);
}

document.getElementById('fileInput').addEventListener('change', async (ev) => {
  const f = ev.target.files[0];
  if(!f) return;
  try{
    resetearEstadoPdf({procesando:true});
    setStatus('Leyendo '+f.name+'…');
    const buf = await f.arrayBuffer();
    await procesarPdf(buf, f.name);
    ev.target.value = '';
  }catch(e){
    setStatus('Error: '+e.message, true);
  }
});

function detectarMesesPDF(lines){
  // Devuelve [{periodo:'MARZO 2026', startIdx:0}, ...] con todas las
  // ocurrencias de "PERIODO YYYY MES DE X" en el PDF, ordenadas por
  // posición. Sirve para PDFs acumulativos.
  const meses = [];
  for(let i=0;i<lines.length;i++){
    const txt = lines[i].items.map(it=>it.text).join(' ');
    const pm = txt.match(/PERIODO\s+(\d{4})\s+MES\s+DE\s+(\w+)/i);
    if(pm){
      meses.push({periodo: `${pm[2]} ${pm[1]}`.toUpperCase(), startIdx: i});
    }
  }
  // Asignar endIdx: hasta el inicio del siguiente mes o el final del PDF
  for(let i=0;i<meses.length;i++){
    meses[i].endIdx = (i+1 < meses.length) ? meses[i+1].startIdx : lines.length;
  }
  return meses;
}

async function procesarPdf(buf, nombre){
  // Reset completo del estado anterior antes de procesar el PDF nuevo
  resetearEstadoPdf({procesando:true});
  setStatus('Procesando PDF…');
  const pdf = await pdfjsLib.getDocument({data:buf, isEvalSupported:false}).promise;
  const lines = await extraerLineas(pdf);
  // Guardar para poder re-procesar si el usuario cambia de mes
  window._lineasPdf = lines;
  // Detectar todos los meses (PDF acumulativo)
  const mesesEnPdf = detectarMesesPDF(lines);
  const panelSel = document.getElementById('panelSelectorMes');
  const botMes = document.getElementById('botonesMes');
  if(mesesEnPdf.length > 1){
    panelSel.style.display = '';
    botMes.innerHTML = '';
    mesesEnPdf.forEach((m, idx) => {
      const btn = document.createElement('button');
      btn.textContent = m.periodo;
      btn.dataset.idx = idx;
      btn.className = idx === 0 ? '' : 'secundario';
      btn.addEventListener('click', () => seleccionarMes(idx));
      botMes.appendChild(btn);
    });
    window._mesesPdf = mesesEnPdf;
    return procesarRango(lines.slice(mesesEnPdf[0].startIdx, mesesEnPdf[0].endIdx));
  } else {
    panelSel.style.display = 'none';
    return procesarRango(lines);
  }
}

function seleccionarMes(idx){
  const lines = window._lineasPdf;
  const meses = window._mesesPdf;
  if(!lines || !meses || !meses[idx]) return;
  // Resetear visual pero mantener el PDF en memoria
  resetearEstadoPdf({procesando:true});
  // Actualizar estilos de botones
  const botMes = document.getElementById('botonesMes');
  Array.from(botMes.querySelectorAll('button')).forEach((b,i) => {
    b.className = (i === idx) ? '' : 'secundario';
  });
  document.getElementById('panelSelectorMes').style.display = '';
  procesarRango(lines.slice(meses[idx].startIdx, meses[idx].endIdx));
}

async function procesarRango(lines){
  const meta = detectarMeta(lines);
  // Si el mes ya está en el histórico, avisar y preguntar antes de procesar
  const claveMesActual = claveMes(meta.periodo);
  if(claveMesActual){
    const existeRaw = localStorage.getItem(STORAGE_PREFIX + claveMesActual);
    if(existeRaw){
      let fechaGuardado = '';
      try{
        const data = JSON.parse(existeRaw);
        fechaGuardado = data.guardadoEn ? new Date(data.guardadoEn).toLocaleString('es-PE') : '';
      } catch(e){}
      const msg =
        `⚠ El mes ${meta.periodo} ya está guardado en el histórico` +
        (fechaGuardado ? ` (guardado el ${fechaGuardado}).` : '.') +
        `\n\n¿Deseas REEMPLAZARLO con los datos del PDF actual?\n\n` +
        `• Aceptar: continuar y, al presionar "Guardar este mes", sobrescribir el anterior.\n` +
        `• Cancelar: no procesar este mes (puedes eliminarlo del histórico antes ✕).`;
      if(!confirm(msg)){
        resetearEstadoPdf();
        setStatus(`✋ Importación cancelada. ${meta.periodo} ya está en el histórico — no se modificó. Use ✕ en el badge para eliminarlo si quiere reimportar.`, true);
        return;
      }
    }
  }

  // Parsear equipos primero para poder contar cuántos hay por bolsa
  const equipos = parsearEquipos(lines);

  // Lectura dinámica de volúmenes y precios DESDE EL PDF.
  // El PDF da los volúmenes TOTALES por bolsa (Bolsa 2 A4BN = 1504,
  // Bolsa 1 A4BN = 13000). Los guardamos así (sin dividir): el cálculo
  // del cobro es AGREGADO por bolsa (suma de consumos de todos los
  // equipos vs vol total) y luego se reparte el cobro entre los
  // equipos proporcional a su consumo. Si la bolsa total NO excede,
  // ningún equipo paga aunque alguno individualmente haya pasado de
  // su porción 188/equipo.
  const volsPdf = extraerVolumenesPDF(lines);
  if(Object.keys(volsPdf).length){
    VOL_MAX_BOLSA = JSON.parse(JSON.stringify(VOL_MAX_BOLSA_FALLBACK));
    PRECIOS_BOLSA = {};
    // Convertir el FALLBACK por equipo a totales por bolsa (multiplicar por cant. equipos)
    const contadorBolsa = {};
    for(const eq of equipos){
      const b = eq.bolsaPdf || 'SIN BOLSA';
      contadorBolsa[b] = (contadorBolsa[b] || 0) + 1;
    }
    for(const bolsa of Object.keys(volsPdf)){
      VOL_MAX_BOLSA[bolsa] = VOL_MAX_BOLSA[bolsa] || {A4BN:0,A3BN:0,A4CL:0,A3CL:0};
      PRECIOS_BOLSA[bolsa] = {};
      for(const fmt of Object.keys(volsPdf[bolsa])){
        // VOLUMEN TOTAL (no dividido) — para cálculo agregado
        VOL_MAX_BOLSA[bolsa][fmt] = volsPdf[bolsa][fmt].volMax;
        PRECIOS_BOLSA[bolsa][fmt] = volsPdf[bolsa][fmt].precio;
      }
    }
    // El FALLBACK por equipo ahora se usa solo para mostrar "vol max por
    // equipo" en la tabla (referencia visual). El cálculo del cobro real
    // usa los totales por bolsa de VOL_MAX_BOLSA.
  } else {
    VOL_MAX_BOLSA = JSON.parse(JSON.stringify(VOL_MAX_BOLSA_FALLBACK));
    // Convertir fallback por equipo a totales por bolsa
    const contadorBolsa = {};
    for(const eq of equipos){
      const b = eq.bolsaPdf || 'SIN BOLSA';
      contadorBolsa[b] = (contadorBolsa[b] || 0) + 1;
    }
    for(const b of Object.keys(VOL_MAX_BOLSA)){
      const n = contadorBolsa[b] || 1;
      for(const f of Object.keys(VOL_MAX_BOLSA[b])){
        VOL_MAX_BOLSA[b][f] = VOL_MAX_BOLSA[b][f] * n;
      }
    }
    PRECIOS_BOLSA = null;
  }
  renderizar(equipos, meta);
  const dups = window._dupAvisoPdf || 0;
  const aviso = dups > 0 ? ` (PDF acumulativo: ${dups} S/N duplicados omitidos, se mantuvo la primera ocurrencia)` : '';
  setStatus(`Listo. ${equipos.length} equipos detectados.${aviso}`);
}

function resetearEstadoPdf(opts){
  const procesando = !!(opts && opts.procesando);
  // Tabla principal
  const tbody = document.getElementById('tbody');
  if(tbody) tbody.innerHTML = `<tr><td colspan="21" style="padding:20px;color:#888">— ${procesando ? 'Procesando…' : 'Sin datos. Importe un PDF para ver la tabla'} —</td></tr>`;
  // Resumen / KPIs: ocultar el bloque entero hasta tener datos del PDF nuevo
  const resumen = document.getElementById('resumen');
  if(resumen) resumen.style.display = 'none';
  ['kpiPeriodo','kpiEquipos','kpiRenta','kpiExcedente','kpiValidacion'].forEach(id => {
    const el = document.getElementById(id);
    if(el){ el.textContent = '—'; el.style.color = ''; }
  });
  // Banner / panel de discrepancias
  const banner = document.getElementById('bannerCompara');
  if(banner) banner.innerHTML = '';
  const detalle = document.getElementById('detalleDiscrepancias');
  if(detalle) detalle.style.display = 'none';
  const tablaDisc = document.getElementById('tablaDiscrepancias');
  if(tablaDisc) tablaDisc.innerHTML = '';
  // Tabla SAP — limpiar y borrar el asiento previo
  const tbodySAP = document.getElementById('tbodySAP');
  if(tbodySAP) tbodySAP.innerHTML = '<tr><td colspan="15" style="padding:16px;color:#888">— Cargue un PDF y presione <b>Generar asiento SAP</b> —</td></tr>';
  const statusSAP = document.getElementById('statusSAP');
  if(statusSAP){ statusSAP.textContent = ''; statusSAP.style.color = ''; }
  // Selector de mes (PDF acumulativo)
  const panelSel = document.getElementById('panelSelectorMes');
  if(panelSel) panelSel.style.display = 'none';
  // Estado en memoria
  window._ultimosEquipos = null;
  window._ultimaMeta = null;
  window._ultimasDiscrepancias = null;
  window._ultimoSAP = null;
  window._dupAvisoPdf = 0;
  // Status global
  if(!procesando) setStatus('Listo. Cargue el PDF para procesar.');
}

async function extraerLineas(pdf){
  const buckets = [];
  for(let i=1;i<=pdf.numPages;i++){
    const page = await pdf.getPage(i);
    const tc = await page.getTextContent();
    const items = tc.items.map(it => ({
      page: i,
      y: it.transform[5],
      x: it.transform[4],
      text: (it.str || '').trim()
    })).filter(it => it.text.length);

    items.sort((a,b) => (b.y - a.y) || (a.x - b.x));

    for(const it of items){
      let bucket = buckets.find(b => b.page === i && Math.abs(b.y - it.y) <= 2);
      if(!bucket){
        bucket = {page:i, y:it.y, items:[]};
        buckets.push(bucket);
      }
      bucket.items.push(it);
    }
  }
  for(const b of buckets) b.items.sort((a,b)=>a.x-b.x);
  buckets.sort((a,b) => (a.page - b.page) || (b.y - a.y));
  return buckets;
}

function detectarMeta(lines){
  // Toma:
  //  - periodo: PRIMER "PERIODO YYYY MES DE X" (si el PDF acumula meses,
  //             nos quedamos con el más reciente, que aparece arriba).
  //  - totalRenta y totalExcedente: del bloque resumen FINAL del PDF
  //    ("TOTAL RENTA MENSUAL  $ 1092.96" sin colon), si existe; sino
  //    del primer match con colon (compatibilidad con PDFs viejos).
  //  - totalFacturacion: del bloque final.
  const meta = {periodo:'', totalRenta:0, totalExcedente:0, totalFacturacion:0};
  // Primera pasada: período (primero) + totales con colon (primero)
  for(const l of lines){
    const txt = l.items.map(i=>i.text).join(' ');
    if(!meta.periodo){
      const pm = txt.match(/PERIODO\s+(\d{4})\s+MES\s+DE\s+(\w+)/i);
      if(pm) meta.periodo = `${pm[2]} ${pm[1]}`.toUpperCase();
    }
    if(!meta.totalRenta){
      const rm = txt.match(/TOTAL RENTA MENSUAL:\s*\$?\s*([\d,.]+)/i);
      if(rm) meta.totalRenta = parseFloat(rm[1].replace(/,/g,''));
    }
    if(!meta.totalExcedente){
      const em = txt.match(/TOTAL EXCEDENTE:\s*\$?\s*([\d,.]+)/i);
      if(em) meta.totalExcedente = parseFloat(em[1].replace(/,/g,''));
    }
  }
  // Segunda pasada: bloque FINAL del PDF (sin colon, son los totales reales).
  // Sólo asignar si los valores aún no se detectaron arriba (PDF acumulativo
  // tiene varios bloques; nos quedamos con el primero -> el mes más reciente).
  let rentaFinal = 0, excedenteFinal = 0;
  for(const l of lines){
    const txt = l.items.map(i=>i.text).join(' ').replace(/\s+/g,' ');
    let m;
    if(rentaFinal === 0 && (m = txt.match(/TOTAL RENTA MENSUAL\s+\$?\s*([\d,.]+)\s*$/i))){
      rentaFinal = parseFloat(m[1].replace(/,/g,''));
    }
    if(excedenteFinal === 0 && (m = txt.match(/TOTAL EXCEDENTES\s+\$?\s*([\d,.]+)\s*$/i))){
      excedenteFinal = parseFloat(m[1].replace(/,/g,''));
    }
    if(meta.totalFacturacion === 0 && (m = txt.match(/TOTAL FACTURACI[ÓO]N\s+\$?\s*([\d,.]+)\s*$/i))){
      meta.totalFacturacion = parseFloat(m[1].replace(/,/g,''));
    }
  }
  // El bloque final, cuando existe, tiene los totales OFICIALES (incluye
  // bolsas adicionales como "SIN BOLSA" sumadas). Solo si difiere y no hay
  // riesgo de venir de otro mes acumulativo, lo preferimos.
  if(rentaFinal > 0 && (meta.totalRenta === 0 || rentaFinal >= meta.totalRenta)){
    meta.totalRenta = rentaFinal;
  }
  if(excedenteFinal > 0 && meta.totalExcedente === 0){
    meta.totalExcedente = excedenteFinal;
  }
  return meta;
}

function parsearEquipos(lines){
  const equipos = [];
  const porSn = new Map();
  let duplicados = 0;
  let actual = null;
  const FMTS = ['A4BN','A3BN','A4CL','A3CL'];
  const reEquip = /^([A-Z0-9]+)\s*[-–]\s*([A-Z0-9][A-Z0-9-]*)(?:\s*[-–]\s*(Bolsa\s*\d+))?/i;
  const esNum = (t) => /^-?[\d]{1,3}(,\d{3})*(\.\d+)?$|^-?\d+(\.\d+)?$/.test(t);
  const aNum = (t) => parseFloat(String(t).replace(/,/g,'')) || 0;

  for(const line of lines){
    const tokens = [];
    for(const it of line.items){
      for(const t of String(it.text).split(/\s+/)){
        if(t) tokens.push({t, x: it.x});
      }
    }
    if(!tokens.length) continue;

    let fmtIdx = -1, fmt = null;
    for(let i=0;i<tokens.length;i++){
      if(FMTS.includes(tokens[i].t)){ fmtIdx = i; fmt = tokens[i].t; break; }
    }
    if(fmtIdx < 0) continue;

    const nums = [];
    for(let i=fmtIdx+1; i<tokens.length && nums.length<7; i++){
      if(esNum(tokens[i].t)) nums.push(aNum(tokens[i].t));
      else break;
    }
    if(nums.length < 7) continue;

    const [ci, cf, cons, volEst, cantExc, precio, total] = nums;

    const leftText = tokens.slice(0, fmtIdx).map(t=>t.t).join(' ').replace(/\s+/g,' ').trim();

    if(fmt === 'A4BN'){
      const em = leftText.match(reEquip);
      if(em){
        const sn = em[1];
        if(porSn.has(sn)){
          // S/N repetido en el PDF (cuadro acumulativo de varios meses).
          // Mantenemos sólo la primera ocurrencia de cada equipo.
          duplicados++;
          actual = null;
          continue;
        }
        actual = {
          sn,
          modeloPdf: em[2],
          bolsaPdf: em[3] ? em[3].replace(/\s+/,' ').trim() : 'SIN BOLSA',
          direccion: '',
          formatos: {}
        };
        porSn.set(sn, actual);
        equipos.push(actual);
      }else{
        actual = null;
        continue;
      }
    }
    if(!actual) continue;

    actual.formatos[fmt] = { ci, cf, consumo:cons, volEst, cantExc, precio, total };

    if(fmt === 'A3BN' && leftText && !actual.direccion){
      actual.direccion = leftText;
    }
  }

  if(duplicados > 0){
    window._dupAvisoPdf = duplicados;
  } else {
    window._dupAvisoPdf = 0;
  }
  return equipos;
}

function fmtNum(v, dec=2){
  if(v===null||v===undefined||isNaN(v)) return '';
  return v.toLocaleString('es-PE',{minimumFractionDigits:dec,maximumFractionDigits:dec});
}
function fmtInt(v){
  if(v===null||v===undefined||isNaN(v)) return '';
  return Math.round(v).toLocaleString('es-PE');
}

function renderizar(equipos, meta){
  const tbody = document.getElementById('tbody');
  tbody.innerHTML = '';

  const FORMATOS = ['A4BN','A3BN','A4CL','A3CL'];
  const fechaStr = meta.periodo ? meta.periodo.replace(/\s+/,' ') : '';

  const mesAnterior = obtenerMesAnterior(meta.periodo);
  const discrepancias = [];
  let totalCI = 0, okCI = 0;

  // Mostrar/ocultar columnas extra "CF mes anterior" + "Δ"
  const thCfAnt = document.getElementById('thCfAnt');
  const thDelta = document.getElementById('thDelta');
  const thCfAntMes = document.getElementById('thCfAntMes');
  if(thCfAnt && thDelta){
    if(mesAnterior){
      thCfAnt.style.display = '';
      thDelta.style.display = '';
      if(thCfAntMes) thCfAntMes.textContent = mesAnterior.meta.periodo || 'mes ant.';
    } else {
      thCfAnt.style.display = 'none';
      thDelta.style.display = 'none';
    }
  }

  let totalExcedenteCalc = 0;
  let totalRentaCalc = 0;
  // Pre-calcular agregado por bolsa para el cobro real (proveedor)
  const bolsasCalc = calcularBolsasAgregadas(equipos);
  window._bolsasCalc = bolsasCalc;
  // Cantidad de equipos por bolsa (para mostrar volMax individual = total/n)
  const contadorBolsaR = {};
  for(const eqq of equipos){
    const b = eqq.bolsaPdf || 'SIN BOLSA';
    contadorBolsaR[b] = (contadorBolsaR[b] || 0) + 1;
  }
  // Acumuladores para la fila TOTAL al pie de la tabla
  const sums = {
    cantidad:0, consumo:0, volMax:0,
    excPositivo:0, excNegativo:0,
    importeBruto:0, importeNegativo:0,
    alquiler:0
  };

  for(const eq of equipos){
    const m = MAESTRO[eq.sn] || {};
    const sinMaestro = !MAESTRO[eq.sn];
    const marca = m.marca || '';
    const modelo = m.modelo || eq.modeloPdf || '';
    const ip = m.ip || '';
    const observacion = m.observacion || eq.direccion || '';
    const cantidad = m.cantidad || 1;
    const bolsa = eq.bolsaPdf || m.bolsa || '';
    const cuenta = m.cuenta || '';
    const centroCosto = m.centroCosto || '';
    const alquilerFijo = m.alquilerFijo || 51.68;
    totalRentaCalc += alquilerFijo;
    sums.cantidad += cantidad;
    sums.alquiler += alquilerFijo;

    // ¿El equipo aporta cobro en algún formato? -> resaltar la fila
    // (Usa el cobro REAL agregado, que es el que cobra el proveedor)
    let equipoTieneExcedente = false;
    for(const f of FORMATOS){
      const bi = bolsasCalc[bolsa] && bolsasCalc[bolsa][f];
      const ei = bi && bi.equipos.find(x => x.sn === eq.sn);
      if(ei && (ei.cobroAsignado || 0) > 0.005){ equipoTieneExcedente = true; break; }
    }

    const numEqBolsa = contadorBolsaR[bolsa] || 1;
    for(let i=0;i<FORMATOS.length;i++){
      const fmt = FORMATOS[i];
      const d = eq.formatos[fmt] || {ci:0,cf:0,consumo:0,volEst:0,cantExc:0,precio:0,total:0};
      const volMaxTotal = (VOL_MAX_BOLSA[bolsa] && VOL_MAX_BOLSA[bolsa][fmt] != null) ? VOL_MAX_BOLSA[bolsa][fmt] : null;
      // Volumen máximo POR EQUIPO (referencia visual): total / cantidad de equipos
      const volMax = (volMaxTotal != null) ? volMaxTotal / numEqBolsa : null;
      const consumo = d.consumo;
      // Excedente individual (info): consumo - volMax_individual.
      // Puede ser negativo (consumió bajo su porción), pero si la bolsa
      // total no excede, ese "negativo" no representa un crédito real.
      const excedenteInd = (volMax !== null) ? (consumo === 0 ? 0 : consumo - volMax) : (d.cantExc || 0);
      // Total REAL del equipo: parte proporcional del cobro AGREGADO
      // de la bolsa para ese formato (siempre >= 0).
      const bolsaInfo = bolsasCalc[bolsa] && bolsasCalc[bolsa][fmt];
      const eqInfo = bolsaInfo && bolsaInfo.equipos.find(x => x.sn === eq.sn);
      const totalCalc = eqInfo ? Math.round(eqInfo.cobroAsignado * 10000) / 10000 : 0;
      // Para visualizar el Excedente, mostramos el individual (info) si la
      // bolsa NO excede (negativo gris); o la parte proporcional del
      // excedente agregado si SÍ excede.
      const excedenteReal = eqInfo ? Math.round(eqInfo.excAsignado * 100) / 100 : excedenteInd;
      if(totalCalc > 0) totalExcedenteCalc += totalCalc;

      sums.consumo += consumo || 0;
      sums.volMax  += (volMax !== null) ? volMax : 0;
      // Para no sumar el excedente y cobro agregado N veces, los acumulamos
      // sólo en el primer equipo de la bolsa por formato.
      if(bolsaInfo && bolsaInfo.equipos[0] && bolsaInfo.equipos[0].sn === eq.sn){
        if((bolsaInfo.excedente || 0) > 0) sums.excPositivo += bolsaInfo.excedente;
        if((bolsaInfo.cobroTotal || 0) > 0) sums.importeBruto += bolsaInfo.cobroTotal;
      }

      const tr = document.createElement('tr');
      if(i===0) tr.classList.add('sep');
      if(sinMaestro) tr.classList.add('pend');
      if(equipoTieneExcedente) tr.classList.add('tiene-excedente');

      let html = '';
      if(i===0){
        html += `<td class="fecha" rowspan="4">${fechaStr||'—'}</td>`;
        html += `<td rowspan="4">${marca}</td>`;
        html += `<td rowspan="4"><b>${modelo}</b></td>`;
        html += `<td rowspan="4">${eq.sn}</td>`;
        html += `<td rowspan="4">${ip}</td>`;
        const fechasEq = [
          m.ingreso && mesDeFecha(m.ingreso) === claveMes(meta.periodo) ? `<span class="tag-fecha in">Ingresó ${fmtFecha(m.ingreso)}</span>` : '',
          m.salida  && mesDeFecha(m.salida)  === claveMes(meta.periodo) ? `<span class="tag-fecha out">Salió ${fmtFecha(m.salida)}</span>` : ''
        ].join('');
        html += `<td class="obs" rowspan="4">${observacion}${fechasEq}</td>`;
        html += `<td rowspan="4">${cantidad}</td>`;
        html += `<td rowspan="4">${bolsa}</td>`;
      }
      html += `<td>${fmt}</td>`;

      let ciClass = 'num';
      let ciBadge = '';
      let cfAntCellHtml = '';
      let deltaCellHtml = '';
      if(mesAnterior){
        const equipoAnt = (mesAnterior.equipos || []).find(x => x.sn === eq.sn);
        const cfAnt = equipoAnt && equipoAnt.formatos && equipoAnt.formatos[fmt] ? equipoAnt.formatos[fmt].cf : null;
        if(cfAnt !== null && cfAnt !== undefined){
          totalCI++;
          const dif = d.ci - cfAnt;
          if(cfAnt === d.ci){
            ciClass += ' ci-ok';
            ciBadge = `<span class="ci-badge ok" title="Coincide con CF de ${mesAnterior.meta.periodo}">✓</span>`;
            okCI++;
            cfAntCellHtml = `<td class="num ci-ok">${fmtInt(cfAnt)}</td>`;
            deltaCellHtml = `<td class="num ci-ok"><b>0</b></td>`;
          } else {
            ciClass += ' ci-err';
            ciBadge = `<span class="ci-badge err" title="Esperado ${fmtInt(cfAnt)} (CF de ${mesAnterior.meta.periodo}), diferencia ${dif>0?'+':''}${fmtInt(dif)}">✗</span>`;
            discrepancias.push({
              sn: eq.sn, modelo: MAESTRO[eq.sn]?.modelo || eq.modeloPdf, obs: MAESTRO[eq.sn]?.observacion || '',
              formato: fmt, ciPdf: d.ci, cfAnterior: cfAnt, diferencia: dif
            });
            cfAntCellHtml = `<td class="num ci-err">${fmtInt(cfAnt)}</td>`;
            const signo = dif > 0 ? '+' : '';
            deltaCellHtml = `<td class="num ci-err" title="${dif>0?'El proveedor le cobra MÁS de lo esperado':'El proveedor le cobra MENOS / hubo retroceso'}"><b>${signo}${fmtInt(dif)}</b></td>`;
          }
        } else {
          cfAntCellHtml = `<td class="num" style="color:#94a3b8">—</td>`;
          deltaCellHtml = `<td class="num" style="color:#94a3b8">—</td>`;
        }
      }
      html += `<td class="${ciClass}">${fmtInt(d.ci)}${ciBadge}</td>`;
      html += cfAntCellHtml;
      html += deltaCellHtml;
      html += `<td class="num">${fmtInt(d.cf)}</td>`;
      // Resaltado: rojo si el formato del equipo aporta excedente al cobro
      const consumoExcede = (volMax !== null) && (consumo > volMax);
      const consumoClass = consumoExcede ? 'excedente-hl' : '';
      html += `<td class="num ${consumoClass}">${fmtInt(consumo)}</td>`;
      html += `<td class="num">${volMax!==null?fmtInt(volMax):''}</td>`;
      const excClass = totalCalc > 0.005 ? 'excedente-hl' : (excedenteReal < 0 ? 'neg' : '');
      html += `<td class="num ${excClass}" title="${totalCalc>0.005?'Esta área se pasó del volumen contratado — ver acción correctiva':''}">${fmtNum(excedenteReal)}</td>`;
      html += `<td class="num">${fmtNum(d.precio,4)}</td>`;
      const totalClass = totalCalc > 0.005 ? 'total-rojo' : (totalCalc<0?'neg':'');
      html += `<td class="num ${totalClass}">${fmtNum(totalCalc)}</td>`;
      if(i===0){
        html += `<td rowspan="4" class="num">${fmtNum(alquilerFijo)}</td>`;
        html += `<td rowspan="4">${cuenta}</td>`;
        html += `<td rowspan="4"><b>${centroCosto}</b></td>`;
      }
      tr.innerHTML = html;
      tbody.appendChild(tr);
    }
  }

  // Fila TOTAL al pie de la tabla
  if(equipos.length){
    const trTotal = document.createElement('tr');
    trTotal.classList.add('fila-total');
    const colsExtras = mesAnterior ? '<td></td><td></td>' : '';
    // Renta: usar el valor OFICIAL del PDF (más exacto que 21 × 51.68
    // que pierde 4 centavos por redondeo). Si no hay PDF, fallback a la suma.
    const rentaOficial = meta.totalRenta || sums.alquiler;
    // En algunos PDFs (ej. abril) el parser puede leer un excedente menor
    // al real; en ese caso conservamos el mayor entre PDF y cálculo detallado.
    const excedenteCalculado = sums.importeBruto;
    const excedenteOficial = (meta.totalExcedente !== undefined && meta.totalExcedente > 0)
      ? Math.max(meta.totalExcedente, excedenteCalculado)
      : excedenteCalculado;
    const totalFacturado = (meta.totalFacturacion && meta.totalFacturacion > 0)
      ? meta.totalFacturacion
      : (rentaOficial + excedenteOficial);
    const tipCred = sums.importeNegativo < 0
      ? ` title="El proveedor sólo cobra excedentes positivos. Hay ${fmtNum(Math.abs(sums.importeNegativo))} en créditos por consumo bajo que NO se descuentan de esta factura."`
      : '';
    trTotal.innerHTML = `
      <td colspan="5" style="text-align:right;letter-spacing:.04em">TOTAL DEL MES</td>
      <td style="text-align:left">${equipos.length} equipos</td>
      <td class="num">${fmtInt(sums.cantidad)}</td>
      <td></td>
      <td></td>
      <td></td>
      ${colsExtras}
      <td></td>
      <td class="num">${fmtInt(sums.consumo)}</td>
      <td class="num">${fmtInt(sums.volMax)}</td>
      <td class="num"${tipCred}>${fmtInt(sums.excPositivo)}${sums.excNegativo<0?` <span style="color:#94a3b8;font-weight:500">(${fmtInt(sums.excNegativo)})</span>`:''}</td>
      <td></td>
      <td class="num"${tipCred}>S/ ${fmtNum(excedenteOficial)}</td>
      <td class="num">S/ ${fmtNum(rentaOficial)}</td>
      <td colspan="2" style="text-align:right">Total facturado: <b>S/ ${fmtNum(totalFacturado)}</b></td>
    `;
    tbody.appendChild(trTotal);
  }

  document.getElementById('resumen').style.display = 'grid';
  document.getElementById('kpiPeriodo').textContent = meta.periodo || '—';
  document.getElementById('kpiEquipos').textContent = equipos.length;
  document.getElementById('kpiRenta').textContent = 'S/ '+fmtNum(meta.totalRenta || totalRentaCalc);
  document.getElementById('kpiExcedente').textContent = 'S/ '+fmtNum(Math.max(meta.totalExcedente || 0, sums.importeBruto || totalExcedenteCalc || 0));

  const kpiVal = document.getElementById('kpiValidacion');
  const banner = document.getElementById('bannerCompara');
  const detalle = document.getElementById('detalleDiscrepancias');
  const sumDisc = document.getElementById('sumDiscrepancias');
  const tablaDisc = document.getElementById('tablaDiscrepancias');

  if(!mesAnterior){
    kpiVal.textContent = 'Sin base previa';
    kpiVal.style.color = '#999';
    banner.innerHTML = '<div class="banner info">💡 No hay un mes anterior guardado. Presione <b>Guardar este mes</b> para que al importar el próximo PDF se valide automáticamente que los contadores iniciales cuadren con los finales de este período.</div>';
    detalle.style.display = 'none';
  } else if(totalCI === 0){
    kpiVal.textContent = 'Sin coincidencias';
    kpiVal.style.color = '#999';
    banner.innerHTML = `<div class="banner warn">⚠ Se detectó un mes anterior (${mesAnterior.meta.periodo}) pero ningún S/N del PDF actual tiene datos comparables.</div>`;
    detalle.style.display = 'none';
  } else if(discrepancias.length === 0){
    kpiVal.textContent = `✓ ${okCI}/${totalCI} OK`;
    kpiVal.style.color = '#1a7a1a';
    banner.innerHTML = `<div class="banner ok">✅ Todos los contadores iniciales del PDF coinciden con los finales del ${mesAnterior.meta.periodo}. La facturación está consistente.</div>`;
    detalle.style.display = 'none';
  } else {
    kpiVal.textContent = `${okCI}/${totalCI} OK — ${discrepancias.length} ✗`;
    kpiVal.style.color = '#b00000';
    banner.innerHTML = `<div class="banner err">⚠ <b>${discrepancias.length} discrepancia(s)</b> entre el Contador Inicial del PDF actual (${meta.periodo}) y el Contador Final de ${mesAnterior.meta.periodo}. Revisar antes de pagar la factura — la columna <b>Δ vs CI</b> en la tabla muestra la diferencia.</div>`;
    sumDisc.textContent = `Ver ${discrepancias.length} discrepancia(s) detectada(s)`;
    let h = `<table>
      <thead><tr>
        <th>S/N</th><th>Modelo</th><th>Observación</th><th>Formato</th>
        <th>CF ${mesAnterior.meta.periodo}<br>(esperado)</th>
        <th>CI ${meta.periodo}<br>(facturado)</th>
        <th>Δ</th>
      </tr></thead><tbody>`;
    for(const d of discrepancias){
      const signo = d.diferencia>0 ? '+' : '';
      h += `<tr><td><b>${d.sn}</b></td><td>${d.modelo||''}</td><td style="text-align:left">${d.obs||''}</td><td>${d.formato}</td><td class="num">${fmtInt(d.cfAnterior)}</td><td class="num">${fmtInt(d.ciPdf)}</td><td class="num neg"><b>${signo}${fmtInt(d.diferencia)}</b></td></tr>`;
    }
    h += '</tbody></table>';
    tablaDisc.innerHTML = h;
    detalle.style.display = 'block';
    detalle.open = true;
  }

  window._ultimosEquipos = equipos;
  window._ultimaMeta = meta;
  window._ultimasDiscrepancias = discrepancias;
}

// ====== Histórico local ======
const STORAGE_PREFIX = 'reprodata_mes_';
const MESES_ES = {ENERO:1,FEBRERO:2,MARZO:3,ABRIL:4,MAYO:5,JUNIO:6,JULIO:7,AGOSTO:8,SEPTIEMBRE:9,SETIEMBRE:9,OCTUBRE:10,NOVIEMBRE:11,DICIEMBRE:12};

function claveMes(periodo){
  if(!periodo) return null;
  const parts = periodo.trim().split(/\s+/);
  if(parts.length !== 2) return null;
  const mes = MESES_ES[parts[0].toUpperCase()];
  const anio = parseInt(parts[1]);
  if(!mes || !anio) return null;
  return `${anio}-${String(mes).padStart(2,'0')}`;
}

function guardarMes(equipos, meta){
  const k = claveMes(meta && meta.periodo);
  if(!k){ setStatus('No se puede guardar: período del PDF no detectado.', true); return; }
  const existe = localStorage.getItem(STORAGE_PREFIX + k);
  if(existe && !confirm(`Ya existe un respaldo de ${meta.periodo}. ¿Sobrescribir?`)) return;
  const payload = {
    guardadoEn: new Date().toISOString(),
    meta,
    equipos: equipos.map(e => ({sn:e.sn, modeloPdf:e.modeloPdf, bolsaPdf:e.bolsaPdf, direccion:e.direccion, formatos:e.formatos})),
    // Guardar también los volúmenes y precios contractuales del período
    // para que al recargar el mes desde el histórico los cálculos sean
    // exactos aunque cambien las tarifas en el futuro.
    volMaxBolsa: VOL_MAX_BOLSA,
    preciosBolsa: PRECIOS_BOLSA
  };
  localStorage.setItem(STORAGE_PREFIX + k, JSON.stringify(payload));
  actualizarListaMeses();
  setStatus(`✓ Guardado ${meta.periodo} (${equipos.length} equipos) en este navegador.`);
}

function cargarMesGuardado(clave){
  const raw = localStorage.getItem(STORAGE_PREFIX + clave);
  if(!raw){ setStatus('No se encontró el mes guardado: '+clave, true); return; }
  let data;
  try{ data = JSON.parse(raw); } catch(e){ setStatus('Error leyendo el mes guardado.', true); return; }
  // Reset visual sin tocar el histórico
  resetearEstadoPdf({procesando:true});
  setStatus(`📂 Cargando ${data.meta.periodo} desde el histórico…`);
  // Restaurar volúmenes y precios del período guardado
  if(data.volMaxBolsa) VOL_MAX_BOLSA = data.volMaxBolsa;
  else VOL_MAX_BOLSA = JSON.parse(JSON.stringify(VOL_MAX_BOLSA_FALLBACK));
  PRECIOS_BOLSA = data.preciosBolsa || null;
  // Renderizar (asume que data.equipos viene en formato igual a parsearEquipos)
  renderizar(data.equipos, data.meta);
  setStatus(`📂 Mostrando ${data.meta.periodo} (guardado el ${new Date(data.guardadoEn).toLocaleString('es-PE')}). Sin PDF cargado — use "Importar otro PDF" para procesar uno nuevo.`);
}

function listarMeses(){
  const meses = [];
  for(let i=0;i<localStorage.length;i++){
    const k = localStorage.key(i);
    if(!k.startsWith(STORAGE_PREFIX)) continue;
    try{
      const v = JSON.parse(localStorage.getItem(k));
      meses.push({clave: k.slice(STORAGE_PREFIX.length), periodo: v.meta.periodo, equipos: v.equipos.length, guardadoEn: v.guardadoEn});
    }catch(e){}
  }
  meses.sort((a,b)=>a.clave.localeCompare(b.clave));
  return meses;
}

function obtenerMesAnterior(periodoActual){
  const claveActual = claveMes(periodoActual);
  if(!claveActual) return null;
  const meses = listarMeses();
  let anterior = null;
  for(const m of meses){
    if(m.clave < claveActual && (!anterior || m.clave > anterior.clave)) anterior = m;
  }
  if(!anterior) return null;
  return JSON.parse(localStorage.getItem(STORAGE_PREFIX + anterior.clave));
}

function eliminarMes(clave){
  if(!confirm(`¿Eliminar el respaldo de ${clave}?`)) return;
  localStorage.removeItem(STORAGE_PREFIX + clave);
  actualizarListaMeses();
  setStatus(`Eliminado ${clave}`);
}

function actualizarListaMeses(){
  const cont = document.getElementById('listaMeses');
  const meses = listarMeses();
  if(!meses.length){ cont.innerHTML = '<span style="color:#888">— sin meses guardados —</span>'; return; }
  cont.innerHTML = meses.map(m =>
    `<span class="mes-item" data-clave="${m.clave}" title="Click para cargar este mes (guardado el ${new Date(m.guardadoEn).toLocaleString('es-PE')})"><b>${m.periodo}</b> · ${m.equipos} equipos <button type="button" data-eliminar title="Eliminar">✕</button></span>`
  ).join('');
  // Hacer clickable cada badge para cargar el mes
  cont.querySelectorAll('.mes-item').forEach(el => {
    el.querySelector('button[data-eliminar]').addEventListener('click', (ev) => {
      ev.stopPropagation();
      eliminarMes(el.dataset.clave);
    });
    el.addEventListener('click', (ev) => {
      // Si el click vino del botón ✕ (eliminar), no cargamos
      if(ev.target.tagName === 'BUTTON') return;
      cargarMesGuardado(el.dataset.clave);
    });
  });
}

document.getElementById('btnGuardarMes').addEventListener('click', () => {
  if(!window._ultimosEquipos || !window._ultimosEquipos.length){
    setStatus('Cargue un PDF antes de guardar.', true); return;
  }
  guardarMes(window._ultimosEquipos, window._ultimaMeta);
});

actualizarListaMeses();

document.getElementById('btnLimpiar').addEventListener('click', () => {
  resetearEstadoPdf();
  document.getElementById('fileInput').value = '';
  document.getElementById('avisoMaestro').innerHTML = '';
  setStatus('✓ Pantalla limpia. Listo para importar otro PDF.');
});

// ====== Asiento SAP ======
const SAP_HEADERS = [
  'Datos','Monto','Modelo','S/N','IP','CECO','Monto USD','Cuenta',
  'Cuenta de mayor/Nombre SN','Cuenta asociada','Débito (ME)','Crédito (ME)',
  'Débito','Crédito','Débito (MS)','Crédito (MS)','Comentarios',
  'Referencia 1','Referencia 2','Centro de Costo','Posición del formulario principal',
  'Cuenta destino','Cuenta patrimonial','Comp. destino','Procesado DC',
  'Info socio de negocios','Info de terceros','Tipo doc. - Serie - Numero',
  'Socio Negocios','Fecha Registro Ventas'
];

function montoConsumoEquipo(eq, bolsasCalc){
  // Cálculo INTELIGENTE: primero se verifica si la bolsa total excede;
  // si excede, el cobro de la bolsa se reparte entre los equipos
  // proporcional al consumo. Si la bolsa NO excede, ningún equipo paga
  // (aunque individualmente haya consumido más que su porción).
  if(!bolsasCalc) bolsasCalc = window._bolsasCalc;
  if(!bolsasCalc) return 0;
  return calcularCobroEquipo(eq, bolsasCalc);
}

function generarAsientoSAP(equipos, meta, numFactura){
  const clave = claveMes(meta.periodo);
  if(!clave) throw new Error('No se pudo determinar el período');
  const [anio, mes] = clave.split('-').map(Number);
  const ultDia = new Date(anio, mes, 0).getDate();
  const pad2 = (n) => String(n).padStart(2,'0');
  const fechaFac = `${pad2(ultDia)}/${pad2(mes)}/${anio}`;
  const rangoFechas = `01-${pad2(mes)}-${anio} AL ${pad2(ultDia)}-${pad2(mes)}-${anio}`;
  const refFactura = `Factura N° ${numFactura}`;

  const totalRenta = meta.totalRenta || (equipos.length * 51.6819047619048);
  const alquiler = totalRenta / equipos.length;
  const bolsasCalc = calcularBolsasAgregadas(equipos);
  const totalExc = equipos.reduce((s,e) => s + montoConsumoEquipo(e, bolsasCalc), 0);
  const montoTotal = Math.round((totalRenta + totalExc) * 100) / 100;

  const ordenados = [...equipos].sort((a,b) => {
    const ca = (MAESTRO[a.sn] && MAESTRO[a.sn].centroCosto) || 9999;
    const cb = (MAESTRO[b.sn] && MAESTRO[b.sn].centroCosto) || 9999;
    if(ca !== cb) return ca - cb;
    return String(a.sn).localeCompare(String(b.sn));
  });

  const filas = [];
  let idx = 0;
  for(const eq of ordenados){
    const m = MAESTRO[eq.sn] || {};
    const modelo = m.modelo || eq.modeloPdf || '';
    const ip = m.ip || '';
    const ceco = m.centroCosto || '';
    const cuenta = m.cuenta || '';

    const rowAlquiler = {
      Datos: '',
      Monto: '',
      Modelo: modelo, 'S/N': eq.sn, IP: ip, CECO: ceco,
      'Monto USD': round4(alquiler),
      Cuenta: cuenta,
      'Débito (ME)': round4(alquiler), 'Crédito (ME)': 0,
      'Débito': '', 'Crédito': '',
      'Débito (MS)': '', 'Crédito (MS)': '',
      Comentarios: `FOTOCOPIAS POR ALQUILER EQUIPO MULTIFUNCIONAL DEL ${rangoFechas}`,
      'Referencia 2': refFactura,
      'Centro de Costo': ceco,
      _tipo: 'alquiler'
    };
    filas.push(rowAlquiler);
    idx++;

    const consumo = montoConsumoEquipo(eq, bolsasCalc);
    const rowConsumo = {
      Datos: '',
      Monto: '',
      Modelo: modelo, 'S/N': eq.sn, IP: ip, CECO: ceco,
      'Monto USD': round4(consumo),
      Cuenta: cuenta,
      // Patrón del Ejemplo.html del usuario:
      //   Monto USD positivo -> Débito (ME) = monto,  Crédito (ME) = 0
      //   Monto USD negativo -> Débito (ME) = 0,      Crédito (ME) = |monto|
      'Débito (ME)':  consumo >= 0 ? round4(consumo) : 0,
      'Crédito (ME)': consumo <  0 ? round4(Math.abs(consumo)) : 0,
      'Débito': '', 'Crédito': '',
      'Débito (MS)': '', 'Crédito (MS)': '',
      Comentarios: `CONSUMO DE COPIAS ${eq.sn}`,
      'Referencia 2': refFactura,
      'Centro de Costo': ceco,
      _tipo: 'consumo'
    };
    filas.push(rowConsumo);
    idx++;
  }

  // Cuadre con cuenta 421111101: balancea Σ Débito (ME) = Σ Crédito (ME).
  // (Como el negativo se absorbe AL alquiler en Débito Y también queda
  //  en Crédito ME en su propia fila, las dos columnas suman lo mismo
  //  pero por encima del monto facturado en |negativos|; el cuadre
  //  iguala el lado más bajo al más alto, NO al monto facturado.)
  const debPre = filas.reduce((s,r) => s + (Number(r['Débito (ME)']) || 0), 0);
  const credPre = filas.reduce((s,r) => s + (Number(r['Crédito (ME)']) || 0), 0);
  const dif = round4(debPre - credPre);
  if(Math.abs(dif) > 0.001){
    filas.push({
      Datos:'', Monto:'', Modelo:'', 'S/N':'', IP:'', CECO:'',
      'Monto USD': round4(Math.abs(dif)),
      Cuenta: 421111101,
      'Débito (ME)':  dif < 0 ? round4(Math.abs(dif)) : 0,
      'Crédito (ME)': dif > 0 ? round4(dif) : 0,
      'Débito':'', 'Crédito':'',
      'Débito (MS)':'', 'Crédito (MS)':'',
      Comentarios: 'CUADRE - DIFERENCIA POR TIPO DE CAMBIO',
      'Referencia 2': refFactura,
      'Centro de Costo':'',
      _cuadre: true
    });
  }

  const totalDebME = filas.reduce((s,r) => s + (Number(r['Débito (ME)']) || 0), 0);
  const totalCredME = filas.reduce((s,r) => s + (Number(r['Crédito (ME)']) || 0), 0);
  filas.push({
    'Débito (ME)': round4(totalDebME),
    'Crédito (ME)': round4(totalCredME),
    'Débito': '', 'Crédito': '',
    'Débito (MS)': '', 'Crédito (MS)': '',
    Comentarios: 'TOTAL'
  });

  return filas;
}

function round4(v){ return Math.round(v * 10000) / 10000; }

// Absorbe los consumos con Monto USD negativo al Débito (ME) del
// alquiler del mismo equipo, Y también deja el valor absoluto en la
// columna Crédito (ME) de la propia fila de consumo. La columna
// Débito (ME) de esa fila queda vacía (no 0).
function absorberNegativosAlAlquiler(filas){
  // Reset previo: limpiar absorciones anteriores para que el cálculo
  // sea idempotente al regenerar/recalcular.
  for(const f of filas){
    if(f._tipo === 'alquiler'){
      f['Débito (ME)'] = round4(Number(f._alquilerBase) || Number(f['Monto USD']) || 0);
      f._alquilerBase = f['Débito (ME)'];
    }
  }
  const alquilerPorSn = new Map();
  for(const f of filas){
    if(f._tipo === 'alquiler' && f['S/N']) alquilerPorSn.set(f['S/N'], f);
  }
  for(const f of filas){
    if(f._tipo !== 'consumo' || !f['S/N']) continue;
    const monto = Number(f['Monto USD']);
    if(isNaN(monto)) continue;
    if(monto < 0){
      // Sumar el valor absoluto al alquiler del mismo equipo
      const filaAlq = alquilerPorSn.get(f['S/N']);
      if(filaAlq){
        filaAlq['Débito (ME)'] = round4((Number(filaAlq['Débito (ME)']) || 0) + Math.abs(monto));
      }
      // En la fila de consumo negativo: Débito (ME) = 0, Crédito (ME) = |monto|
      f['Débito (ME)']  = 0;
      f['Crédito (ME)'] = round4(Math.abs(monto));
    } else if(monto > 0){
      // Consumo positivo: Débito (ME) = monto, Crédito (ME) = 0
      f['Débito (ME)']  = round4(monto);
      f['Crédito (ME)'] = 0;
    } else {
      // Cero: ambos en 0 (mostrar USD 0.00, no vacío)
      f['Débito (ME)']  = 0;
      f['Crédito (ME)'] = 0;
    }
  }
}

function renderSAPPreview(filas){
  const tbody = document.getElementById('tbodySAP');
  tbody.innerHTML = '';
  const cols = ['Datos','Monto','Modelo','S/N','IP','CECO','Monto USD','Cuenta','Débito (ME)','Crédito (ME)','Débito','Crédito','Comentarios','Referencia 2','Centro de Costo'];
  const COLS_INT = new Set(['CECO','Cuenta','Centro de Costo','Posición del formulario principal','Cuenta destino','Cuenta patrimonial']);
  const fmtCell = (v, col) => {
    if(v===null||v===undefined||v==='') return '';
    if(typeof v === 'number'){
      if(COLS_INT.has(col)) return String(Math.round(v));
      const n = v.toLocaleString('en-US',{minimumFractionDigits:2, maximumFractionDigits:2});
      return COLS_USD.has(col) ? `USD ${n}` : v.toLocaleString('es-PE',{minimumFractionDigits:2, maximumFractionDigits:4});
    }
    return v;
  };
  const EDITABLES_NUM = new Set(['Monto USD','Débito (ME)','Crédito (ME)']);
  const COLS_USD = new Set(['Débito (ME)','Crédito (ME)']);
  const EDITABLES_TXT = new Set(['Comentarios']);
  filas.forEach((r, idx) => {
    const esTotal = r.Comentarios === 'TOTAL';
    const esCuadre = !!r._cuadre;
    const tr = document.createElement('tr');
    tr.dataset.row = idx;
    if(esTotal) tr.dataset.total = '1';
    if(esCuadre) tr.dataset.cuadre = '1';
    if(r._editado) tr.classList.add('editado');
    cols.forEach(c => {
      const td = document.createElement('td');
      const v = r[c];
      if(['Monto','Monto USD','Débito (ME)','Crédito (ME)','Débito','Crédito'].includes(c)) td.classList.add('num');
      if(c === 'Comentarios') td.classList.add('obs');
      td.textContent = fmtCell(v, c);
      if(!esTotal && (EDITABLES_NUM.has(c) || EDITABLES_TXT.has(c))){
        td.classList.add('editable');
        td.contentEditable = 'true';
        td.dataset.col = c;
        td.title = 'Click para editar';
      }
      tr.appendChild(td);
    });
    if(esTotal){
      tr.style.fontWeight = 'bold';
      tr.style.background = '#ffeb00';
      tr.style.borderTop = '2px solid #000';
    } else if(esCuadre){
      tr.style.fontWeight = 'bold';
      tr.style.background = '#ffeb00';
    }
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('td.editable').forEach(td => {
    td.addEventListener('focus', () => { td._prev = td.textContent; });
    td.addEventListener('keydown', (ev) => {
      if(ev.key === 'Enter'){ ev.preventDefault(); td.blur(); }
      if(ev.key === 'Escape'){ td.textContent = td._prev ?? ''; td.blur(); }
    });
    td.addEventListener('blur', () => {
      const tr = td.closest('tr');
      const rowIdx = parseInt(tr.dataset.row, 10);
      const col = td.dataset.col;
      const fila = window._ultimoSAP[rowIdx];
      const esNumerico = EDITABLES_NUM.has(col);
      let nuevoVal;
      if(esNumerico){
        const txt = td.textContent.trim().replace(/USD/gi,'').replace(/,/g,'').replace(/\s+/g,'');
        nuevoVal = txt === '' ? 0 : (isNaN(parseFloat(txt)) ? fila[col] : parseFloat(txt));
      } else {
        nuevoVal = td.textContent.trim();
      }
      if(nuevoVal === fila[col]) return;
      fila[col] = nuevoVal;
      fila._editado = true;
      tr.classList.add('editado');
      td.textContent = fmtCell(nuevoVal, col);

      // Sincronización entre Monto USD <-> Débito (ME) / Crédito (ME)
      // Reglas contables:
      //   Monto USD positivo  ->  Débito (ME) = monto,  Crédito (ME) = 0
      //   Monto USD negativo  ->  Débito (ME) = 0,      Crédito (ME) = |monto|
      // Si el usuario edita Débito (ME) o Crédito (ME) directamente, se
      // ajusta el Monto USD (con signo) y la celda contraria se pone en 0.
      const sincronizar = (sourceCol) => {
        if(sourceCol === 'Monto USD'){
          const v = Number(fila['Monto USD']) || 0;
          fila['Débito (ME)']  = v >= 0 ? Math.round(v * 10000) / 10000 : 0;
          fila['Crédito (ME)'] = v <  0 ? Math.round(Math.abs(v) * 10000) / 10000 : 0;
        } else if(sourceCol === 'Débito (ME)'){
          const v = Number(fila['Débito (ME)']) || 0;
          fila['Monto USD']    = Math.round(v * 10000) / 10000;
          fila['Crédito (ME)'] = 0;
        } else if(sourceCol === 'Crédito (ME)'){
          const v = Number(fila['Crédito (ME)']) || 0;
          fila['Monto USD']    = -Math.round(v * 10000) / 10000;
          fila['Débito (ME)']  = 0;
        }
        // Refrescar visualmente las celdas hermanas
        const cols = ['Monto USD','Débito (ME)','Crédito (ME)'];
        for(const c of cols){
          if(c === sourceCol) continue;
          const otraTd = tr.querySelector(`td[data-col="${c.replace(/"/g,'\\"')}"]`);
          if(otraTd) otraTd.textContent = fmtCell(fila[c], c);
        }
      };
      if(['Monto USD','Débito (ME)','Crédito (ME)'].includes(col)){
        sincronizar(col);
      }

      // Si la edición es de Monto USD (puede afectar al alquiler del
      // mismo equipo por absorción de negativos) o de Débito/Crédito (ME),
      // re-renderizamos toda la preview con el cuadre re-calculado.
      recalcularTotalSAP();
      if(['Monto USD','Débito (ME)','Crédito (ME)'].includes(col)){
        renderSAPPreview(window._ultimoSAP);
      }
      const s = document.getElementById('statusSAP');
      s.textContent = `✎ Editado: ${fila['S/N']||''} ${col}. ${(window._ultimoSAP.filter(x=>x._editado).length)} fila(s) modificada(s).`;
      s.style.color = '#b57700';
    });
  });
}

function recalcularTotalSAP(){
  const filas = window._ultimoSAP;
  if(!filas || !filas.length) return;
  const totalFila = filas[filas.length - 1];
  if(totalFila.Comentarios !== 'TOTAL') return;

  // Recalcular cuadre (antes del TOTAL) si existe
  const cuadreFila = filas[filas.length - 2];
  const tieneCuadre = cuadreFila && cuadreFila._cuadre;
  if(tieneCuadre){
    let debSinCuadre = 0, credSinCuadre = 0;
    for(let i=0;i<filas.length-2;i++){
      debSinCuadre += (Number(filas[i]['Débito (ME)']) || 0);
      credSinCuadre += (Number(filas[i]['Crédito (ME)']) || 0);
    }
    // Cuadre balancea Σ Débito (ME) = Σ Crédito (ME) (no apunta al monto
    // facturado: si hay negativos absorbidos al alquiler, ambas sumas
    // quedan por encima del monto facturado en |negativos|, lo cual es
    // contablemente correcto).
    if(!cuadreFila._editado){
      const dif = Math.round((debSinCuadre - credSinCuadre) * 10000) / 10000;
      cuadreFila['Débito (ME)']  = dif < 0 ? Math.abs(dif) : 0;
      cuadreFila['Crédito (ME)'] = dif > 0 ? dif : 0;
      cuadreFila['Monto USD']    = Math.round(Math.abs(dif) * 10000) / 10000;
    }
  }

  let tCred = 0, tDeb = 0;
  for(let i=0;i<filas.length-1;i++){
    const f = filas[i];
    tDeb  += (Number(f['Débito (ME)']) || 0);
    tCred += (Number(f['Crédito (ME)']) || 0);
  }
  totalFila['Débito (ME)'] = Math.round(tDeb * 10000) / 10000;
  totalFila['Crédito (ME)'] = Math.round(tCred * 10000) / 10000;

  // Actualizar celdas visuales de la fila cuadre si no fue editada manualmente
  if(tieneCuadre && !cuadreFila._editado){
    const tbody = document.getElementById('tbodySAP');
    const trCuadre = tbody.querySelector('tr[data-cuadre="1"]');
    if(trCuadre){
      const colsHdr = ['Datos','Monto','Modelo','S/N','IP','CECO','Monto USD','Cuenta','Débito (ME)','Crédito (ME)','Débito','Crédito','Comentarios','Referencia 2','Centro de Costo'];
      const COLS_USD_CUA = new Set(['Débito (ME)','Crédito (ME)']);
      const COLS_INT_CUA = new Set(['CECO','Cuenta','Centro de Costo']);
      const tds = trCuadre.querySelectorAll('td');
      const fmtC = (v, c) => {
        if(v===null||v===undefined||v==='') return '';
        if(typeof v === 'number'){
          if(COLS_INT_CUA.has(c)) return String(Math.round(v));
          const n = v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
          return COLS_USD_CUA.has(c) ? `USD ${n}` : v.toLocaleString('es-PE',{minimumFractionDigits:2,maximumFractionDigits:4});
        }
        return v;
      };
      colsHdr.forEach((c, i) => { tds[i].textContent = fmtC(cuadreFila[c], c); });
    }
  }
  const tbody = document.getElementById('tbodySAP');
  const trTotal = tbody.querySelector('tr[data-total="1"]');
  if(!trTotal) return;
  const tds = trTotal.querySelectorAll('td');
  const colsHdr = ['Datos','Monto','Modelo','S/N','IP','CECO','Monto USD','Cuenta','Débito (ME)','Crédito (ME)','Débito','Crédito','Comentarios','Referencia 2','Centro de Costo'];
  const COLS_USD_TOT = new Set(['Débito (ME)','Crédito (ME)']);
  const COLS_INT_TOT = new Set(['CECO','Cuenta','Centro de Costo']);
  const fmt = (v, c) => {
    if(v===null||v===undefined||v==='') return '';
    if(typeof v === 'number'){
      if(COLS_INT_TOT.has(c)) return String(Math.round(v));
      const n = v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
      return COLS_USD_TOT.has(c) ? `USD ${n}` : v.toLocaleString('es-PE',{minimumFractionDigits:2,maximumFractionDigits:4});
    }
    return v;
  };
  colsHdr.forEach((c, i) => { tds[i].textContent = fmt(totalFila[c], c); });
}

document.getElementById('btnGenSAP').addEventListener('click', () => {
  const s = document.getElementById('statusSAP');
  if(!window._ultimosEquipos || !window._ultimosEquipos.length){
    s.textContent = 'Cargue un PDF primero.'; s.style.color = 'var(--rojo)'; return;
  }
  const numFactura = document.getElementById('inpFactura').value.trim() || 'SIN-FACTURA';
  try{
    const filas = generarAsientoSAP(window._ultimosEquipos, window._ultimaMeta, numFactura);
    window._ultimoSAP = filas;
    renderSAPPreview(filas);
    s.textContent = `Generadas ${filas.length - 1} líneas + total.`;
    s.style.color = '#1a7a1a';
  }catch(e){
    s.textContent = 'Error: '+e.message; s.style.color = 'var(--rojo)';
  }
});

document.getElementById('btnCopiarSAP').addEventListener('click', async () => {
  const filas = window._ultimoSAP;
  const s = document.getElementById('statusSAP');
  if(!filas){ s.textContent = 'Genere el asiento primero.'; s.style.color = 'var(--rojo)'; return; }
  const lines = [SAP_HEADERS.join('\t')];
  for(const r of filas){
    lines.push(SAP_HEADERS.map(h => {
      const v = r[h];
      if(v===undefined||v===null) return '';
      return String(v).replace(/\t/g,' ').replace(/\n/g,' ');
    }).join('\t'));
  }
  try{
    await navigator.clipboard.writeText(lines.join('\n'));
    s.textContent = '✓ Copiado al portapapeles. Pegue en Excel/SAP.';
    s.style.color = '#1a7a1a';
  }catch(e){
    const ta = document.createElement('textarea');
    ta.value = lines.join('\n');
    document.body.appendChild(ta); ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    s.textContent = '✓ Copiado (método legacy).';
    s.style.color = '#1a7a1a';
  }
});

document.getElementById('btnDescargarXLSX').addEventListener('click', () => {
  const filas = window._ultimoSAP;
  const s = document.getElementById('statusSAP');
  if(!filas){ s.textContent = 'Genere el asiento primero.'; s.style.color = 'var(--rojo)'; return; }
  if(typeof XLSX === 'undefined'){ s.textContent = 'Error: la librería XLSX no cargó.'; s.style.color = 'var(--rojo)'; return; }

  const meta = window._ultimaMeta || {};
  const wb = XLSX.utils.book_new();

  const NCOLS = SAP_HEADERS.length;
  const vacia = () => Array(NCOLS).fill('');
  const periodo = meta.periodo || '';
  const numFac = (document.getElementById('inpFactura').value.trim() || '');

  const titulo = `CUADRO DE CONSUMO - REPRODATA  ·  ${periodo}`;
  const subtitulo = `Contrato 276580 — HOTELERA COSTA DEL PACIFICO S.A. (C20297885538)` + (numFac ? `   |   Factura N° ${numFac}` : '');

  // Fila 0: título; Fila 1: subtítulo; Fila 2: espacio; Fila 3: encabezados; 4+: datos.
  const aoaSAP = [
    [titulo, ...vacia().slice(1)],
    [subtitulo, ...vacia().slice(1)],
    vacia(),
    [...SAP_HEADERS]
  ];
  for(const r of filas){
    aoaSAP.push(SAP_HEADERS.map(h => {
      const v = r[h];
      if(v !== undefined && v !== '') return v;
      // Débito (ME) y Crédito (ME) siempre llevan número (0 -> "USD 0.00")
      // para que las celdas no queden en blanco. Las otras columnas
      // (Débito, Crédito, Débito MS, Crédito MS) sí quedan vacías.
      if(h === 'Débito (ME)' || h === 'Crédito (ME)') return 0;
      return '';
    }));
  }
  const wsSAP = XLSX.utils.aoa_to_sheet(aoaSAP);

  // Merges: título y subtítulo ocupan toda la fila.
  wsSAP['!merges'] = [
    {s:{r:0, c:0}, e:{r:0, c:NCOLS-1}},
    {s:{r:1, c:0}, e:{r:1, c:NCOLS-1}}
  ];

  // Altos de filas (título grande, subtítulo mediano, encabezado grande).
  wsSAP['!rows'] = [
    {hpt: 30}, {hpt: 22}, {hpt: 8}, {hpt: 38}
  ];

  // Formatos numéricos
  const fmtUSD = '"USD" #,##0.00';
  const fmtInt = '0';

  // Estilos
  const borderAll = {
    top:{style:'thin',color:{rgb:'8AA4C8'}},
    bottom:{style:'thin',color:{rgb:'8AA4C8'}},
    left:{style:'thin',color:{rgb:'8AA4C8'}},
    right:{style:'thin',color:{rgb:'8AA4C8'}}
  };
  const borderMed = {
    top:{style:'medium',color:{rgb:'000000'}},
    bottom:{style:'medium',color:{rgb:'000000'}},
    left:{style:'thin',color:{rgb:'000000'}},
    right:{style:'thin',color:{rgb:'000000'}}
  };
  const styleTitle = {
    font:{name:'Segoe UI', sz:16, bold:true, color:{rgb:'FFFFFF'}},
    fill:{patternType:'solid', fgColor:{rgb:'1F3864'}},
    alignment:{horizontal:'center', vertical:'center'},
    border: borderMed
  };
  const styleSubtitle = {
    font:{name:'Segoe UI', sz:11, bold:true, color:{rgb:'FFFFFF'}},
    fill:{patternType:'solid', fgColor:{rgb:'2F5496'}},
    alignment:{horizontal:'center', vertical:'center'}
  };
  const styleHeader = {
    font:{name:'Segoe UI', sz:11, bold:true, color:{rgb:'000000'}},
    fill:{patternType:'solid', fgColor:{rgb:'FFC000'}},
    alignment:{horizontal:'center', vertical:'center', wrapText:true},
    border: borderMed
  };
  const styleCell = {
    font:{name:'Segoe UI', sz:10, color:{rgb:'1F3864'}},
    alignment:{vertical:'center', horizontal:'center'},
    border: borderAll
  };
  const styleCellLeft = { ...styleCell, alignment:{vertical:'center', horizontal:'left', wrapText:true} };
  const styleCellNum  = { ...styleCell, alignment:{vertical:'center', horizontal:'right'} };
  const styleZebra = { ...styleCell, fill:{patternType:'solid', fgColor:{rgb:'F7FAFF'}} };
  const styleZebraLeft = { ...styleCellLeft, fill:{patternType:'solid', fgColor:{rgb:'F7FAFF'}} };
  const styleZebraNum  = { ...styleCellNum,  fill:{patternType:'solid', fgColor:{rgb:'F7FAFF'}} };
  const styleCuadre = {
    font:{name:'Segoe UI', sz:10, bold:true, color:{rgb:'000000'}},
    fill:{patternType:'solid', fgColor:{rgb:'FFEB00'}},
    alignment:{vertical:'center', horizontal:'center'},
    border: borderAll
  };
  const styleCuadreNum = { ...styleCuadre, alignment:{vertical:'center', horizontal:'right'} };
  const styleCuadreLeft = { ...styleCuadre, alignment:{vertical:'center', horizontal:'left', wrapText:true} };
  const styleTotal = {
    font:{name:'Segoe UI', sz:11, bold:true, color:{rgb:'000000'}},
    fill:{patternType:'solid', fgColor:{rgb:'FFEB00'}},
    alignment:{vertical:'center', horizontal:'center'},
    border: borderMed
  };
  const styleTotalNum = { ...styleTotal, alignment:{vertical:'center', horizontal:'right'} };
  const styleTotalLeft = { ...styleTotal, alignment:{vertical:'center', horizontal:'left', wrapText:true} };

  // Columnas por tipo
  const COL_INT = new Set([5, 7, 19, 20, 21, 22]);         // F,H,T,U,V,W -> sin separador
  const COL_USD = new Set([10, 11]);                        // K, L
  const COL_LEFT_ALIGN = new Set([16, 17, 18]);             // Q, R, S (comentarios, refs)

  // Aplicar estilos y formatos
  const totalIdxInAoa = aoaSAP.length - 1;
  const cuadreIdxInAoa = (filas[filas.length - 2] && filas[filas.length - 2]._cuadre) ? aoaSAP.length - 2 : -1;

  // Título
  wsSAP[XLSX.utils.encode_cell({r:0,c:0})].s = styleTitle;
  // Rellenar el merge con estilo (algunos motores requieren celdas reales)
  for(let c=1;c<NCOLS;c++){
    const a = XLSX.utils.encode_cell({r:0,c});
    if(!wsSAP[a]) wsSAP[a] = {t:'s', v:''};
    wsSAP[a].s = styleTitle;
  }
  wsSAP[XLSX.utils.encode_cell({r:1,c:0})].s = styleSubtitle;
  for(let c=1;c<NCOLS;c++){
    const a = XLSX.utils.encode_cell({r:1,c});
    if(!wsSAP[a]) wsSAP[a] = {t:'s', v:''};
    wsSAP[a].s = styleSubtitle;
  }
  // Encabezados (fila 3 en aoa, r=3)
  for(let c=0;c<NCOLS;c++){
    const a = XLSX.utils.encode_cell({r:3,c});
    if(!wsSAP[a]) wsSAP[a] = {t:'s', v: SAP_HEADERS[c]};
    wsSAP[a].s = styleHeader;
  }
  // Datos: r de 4 a totalIdxInAoa
  for(let R = 4; R <= totalIdxInAoa; R++){
    const esCuadre = (R === cuadreIdxInAoa);
    const esTotal = (R === totalIdxInAoa);
    const zebra = ((R - 4) % 2 === 0);
    for(let C = 0; C < NCOLS; C++){
      const a = XLSX.utils.encode_cell({r:R,c:C});
      if(!wsSAP[a]) wsSAP[a] = {t:'s', v:''};
      // Formato numérico
      if(COL_USD.has(C)){
        wsSAP[a].z = fmtUSD;
        if(typeof wsSAP[a].v === 'number') wsSAP[a].t = 'n';
      } else if(COL_INT.has(C) && typeof wsSAP[a].v === 'number'){
        wsSAP[a].z = fmtInt;
        wsSAP[a].t = 'n';
      }
      // Estilo
      let sty;
      if(esTotal){
        sty = COL_LEFT_ALIGN.has(C) ? styleTotalLeft : (COL_USD.has(C) ? styleTotalNum : styleTotal);
      } else if(esCuadre){
        sty = COL_LEFT_ALIGN.has(C) ? styleCuadreLeft : (COL_USD.has(C) ? styleCuadreNum : styleCuadre);
      } else if(zebra){
        sty = COL_LEFT_ALIGN.has(C) ? styleZebraLeft : (COL_USD.has(C) ? styleZebraNum : styleZebra);
      } else {
        sty = COL_LEFT_ALIGN.has(C) ? styleCellLeft : (COL_USD.has(C) ? styleCellNum : styleCell);
      }
      wsSAP[a].s = sty;
    }
  }

  // Anchos
  wsSAP['!cols'] = SAP_HEADERS.map((h) => {
    if(h === 'Comentarios') return {wch: 68};
    if(h === 'Referencia 2') return {wch: 28};
    if(h === 'Cuenta de mayor/Nombre SN') return {wch: 20};
    if(['Débito (ME)','Crédito (ME)','Débito','Crédito','Débito (MS)','Crédito (MS)'].includes(h)) return {wch: 13};
    if(h === 'Cuenta' || h === 'CECO' || h === 'Centro de Costo') return {wch: 11};
    if(h === 'Modelo' || h === 'S/N' || h === 'IP') return {wch: 14};
    if(h === 'Datos' || h === 'Monto') return {wch: 18};
    if(h === 'Monto USD') return {wch: 11};
    return {wch: 14};
  });
  XLSX.utils.book_append_sheet(wb, wsSAP, 'SAP');

  const FORMATOS = ['A4BN','A3BN','A4CL','A3CL'];
  const equipos = window._ultimosEquipos || [];
  const mesAnterior = obtenerMesAnterior(meta.periodo);
  const cabMes = [
    meta.periodo||'', 'Marca', 'Modelo', 'S/N', 'IP', 'Observación',
    'Cantidad Impresoras', 'Bolsa', 'Formatos', 'Contador Inicial'
  ];
  if(mesAnterior){
    cabMes.push('CF ' + mesAnterior.meta.periodo);
    cabMes.push('Δ vs CI');
  }
  cabMes.push('Contador Final', 'Consumo del Mes', 'Volumen Maximo Establecido',
              'Volumen Excedente', 'Precio', 'Total', 'alquiler fijo',
              'Cuenta', 'Centro Costo');

  const aoaMes = [cabMes];
  const sumas = {cantidad:0, consumo:0, volMax:0, exc:0, tot:0, alquiler:0};
  const bolsasCalcMes = calcularBolsasAgregadas(equipos);
  // Cantidad de equipos por bolsa (para mostrar volMax_individual)
  const numEqMes = {};
  for(const eq of equipos){
    const b = eq.bolsaPdf || 'SIN BOLSA';
    numEqMes[b] = (numEqMes[b] || 0) + 1;
  }
  // Marcadores para no contar dos veces cada bolsa
  const bolsaContada = new Set();

  for(const eq of equipos){
    const m = MAESTRO[eq.sn] || {};
    const cant = m.cantidad || 1;
    const alq = m.alquilerFijo || 51.68;
    sumas.cantidad += cant;
    sumas.alquiler += alq;
    const equipoAnt = mesAnterior ? (mesAnterior.equipos||[]).find(x => x.sn === eq.sn) : null;
    const numEqBolsa = numEqMes[eq.bolsaPdf] || 1;
    for(let i=0;i<FORMATOS.length;i++){
      const fmt = FORMATOS[i];
      const d = eq.formatos[fmt] || {};
      const volMaxTotal = (VOL_MAX_BOLSA[eq.bolsaPdf] && VOL_MAX_BOLSA[eq.bolsaPdf][fmt] != null) ? VOL_MAX_BOLSA[eq.bolsaPdf][fmt] : null;
      const volMax = (volMaxTotal != null) ? volMaxTotal / numEqBolsa : null;
      const consFmt = d.consumo || 0;
      // Cobro REAL agregado proporcional (siempre >= 0)
      const bolsaInfo = bolsasCalcMes[eq.bolsaPdf] && bolsasCalcMes[eq.bolsaPdf][fmt];
      const eqInfo = bolsaInfo && bolsaInfo.equipos.find(x => x.sn === eq.sn);
      const exc = eqInfo ? Math.round(eqInfo.excAsignado * 100) / 100 : 0;
      const tot = eqInfo ? Math.round(eqInfo.cobroAsignado * 10000) / 10000 : 0;
      sumas.consumo += consFmt;
      // Acumular volMax sólo del primer equipo de la bolsa (es el TOTAL)
      const claveBF = (eq.bolsaPdf||'') + '|' + fmt;
      if(!bolsaContada.has(claveBF)){
        sumas.volMax += (volMaxTotal || 0);
        if(bolsaInfo){
          sumas.exc += (bolsaInfo.excedente || 0);
          if((bolsaInfo.cobroTotal || 0) > 0) sumas.tot += bolsaInfo.cobroTotal;
        }
        bolsaContada.add(claveBF);
      }

      let cfAnt = '';
      let delta = '';
      if(equipoAnt && equipoAnt.formatos && equipoAnt.formatos[fmt]){
        cfAnt = equipoAnt.formatos[fmt].cf;
        delta = (d.ci||0) - (cfAnt || 0);
      }

      const fila = [
        i===0 ? (meta.periodo||'') : '',
        i===0 ? (m.marca||'') : '',
        i===0 ? (m.modelo||eq.modeloPdf||'') : '',
        i===0 ? eq.sn : '',
        i===0 ? (m.ip||'') : '',
        i===0 ? (m.observacion||eq.direccion||'') : '',
        i===0 ? cant : '',
        i===0 ? (eq.bolsaPdf||'') : '',
        fmt,
        d.ci || 0
      ];
      if(mesAnterior){
        fila.push(cfAnt === '' ? '' : cfAnt);
        fila.push(delta === '' ? '' : delta);
      }
      fila.push(
        d.cf || 0, d.consumo || 0,
        volMax!=null ? volMax : '', exc,
        d.precio || 0, Math.round(tot*100)/100,
        i===0 ? alq : '',
        i===0 ? (m.cuenta||'') : '',
        i===0 ? (m.centroCosto||'') : ''
      );
      aoaMes.push(fila);
    }
  }

  // Fila TOTAL al pie
  if(equipos.length){
    const filaTotal = [
      'TOTAL DEL MES', '', '', equipos.length + ' equipos', '', '',
      sumas.cantidad, '', '', ''
    ];
    if(mesAnterior){ filaTotal.push(''); filaTotal.push(''); }
    filaTotal.push(
      '', sumas.consumo, sumas.volMax, sumas.exc,
      '', Math.round(sumas.tot * 100) / 100,
      Math.round(sumas.alquiler * 100) / 100, '', ''
    );
    aoaMes.push(filaTotal);
  }
  const wsMes = aplicarEstiloHojaMes(aoaMes, meta, equipos.length, !!mesAnterior);
  XLSX.utils.book_append_sheet(wb, wsMes, meta.periodo ? meta.periodo.replace(/\s+/,'-') : 'Mes');

  const nombre = `Reprodata_${(meta.periodo||'export').replace(/\s+/g,'_')}.xlsx`;
  XLSX.writeFile(wb, nombre);
  s.textContent = `✓ Descargado con formato: ${nombre}`;
  s.style.color = '#1a7a1a';
});

function aplicarEstiloHojaMes(aoaBase, meta, numEquipos, conMesAnterior){
  const NCOLS = aoaBase[0].length;
  const vacia = () => Array(NCOLS).fill('');
  const titulo = `REPORTE DE CONSUMO MENSUAL — REPRODATA  ·  ${meta.periodo||''}`;
  const aoa = [
    [titulo, ...vacia().slice(1)],
    vacia(),
    aoaBase[0],
    ...aoaBase.slice(1)
  ];
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Merges: título de toda la fila + celdas con rowspan 4 para los datos
  // comunes del equipo (Fecha, Marca, Modelo, S/N, IP, Observación,
  // Cantidad, Bolsa, alquiler fijo, Cuenta, Centro Costo).
  const merges = [{s:{r:0,c:0}, e:{r:0,c:NCOLS-1}}];
  // Columnas que se mergean cada 4 filas (índices base sin contar CF/Δ)
  // 0=Fecha 1=Marca 2=Modelo 3=S/N 4=IP 5=Observación 6=Cantidad 7=Bolsa
  const colsMergeIzq = [0,1,2,3,4,5,6,7];
  // Para las últimas 3 columnas (alquiler fijo, Cuenta, Centro Costo)
  // los índices dependen de si hay columnas CF/Δ
  const offsetExtra = conMesAnterior ? 2 : 0;
  const idxAlquiler = 16 + offsetExtra;
  const idxCuenta   = 17 + offsetExtra;
  const idxCeco     = 18 + offsetExtra;
  const colsMergeDer = [idxAlquiler, idxCuenta, idxCeco];
  for(let i = 0; i < numEquipos; i++){
    const filaInicio = 3 + i*4;
    const filaFin = filaInicio + 3;
    for(const c of colsMergeIzq) merges.push({s:{r:filaInicio,c}, e:{r:filaFin,c}});
    for(const c of colsMergeDer) merges.push({s:{r:filaInicio,c}, e:{r:filaFin,c}});
  }
  // Fila TOTAL (la última si numEquipos > 0): merge de columnas iniciales
  const filaTotalIdx = 3 + numEquipos*4;
  if(numEquipos > 0 && aoa[filaTotalIdx]){
    merges.push({s:{r:filaTotalIdx,c:0}, e:{r:filaTotalIdx,c:2}});
  }
  ws['!merges'] = merges;
  ws['!rows'] = [{hpt:28}, {hpt:8}, {hpt:34}];

  const brd = {top:{style:'thin',color:{rgb:'8AA4C8'}}, bottom:{style:'thin',color:{rgb:'8AA4C8'}}, left:{style:'thin',color:{rgb:'8AA4C8'}}, right:{style:'thin',color:{rgb:'8AA4C8'}}};
  const stTitle = {font:{name:'Segoe UI',sz:14,bold:true,color:{rgb:'FFFFFF'}}, fill:{patternType:'solid', fgColor:{rgb:'1F3864'}}, alignment:{horizontal:'center',vertical:'center'}};
  const stHdr = {font:{name:'Segoe UI',sz:11,bold:true,color:{rgb:'000000'}}, fill:{patternType:'solid', fgColor:{rgb:'FFC000'}}, alignment:{horizontal:'center',vertical:'center',wrapText:true}, border:{top:{style:'medium',color:{rgb:'000000'}},bottom:{style:'medium',color:{rgb:'000000'}},left:{style:'thin',color:{rgb:'000000'}},right:{style:'thin',color:{rgb:'000000'}}}};
  const stCell = {font:{name:'Segoe UI',sz:10,color:{rgb:'1F3864'}}, alignment:{horizontal:'center',vertical:'center'}, border:brd};
  const stLeft = {...stCell, alignment:{horizontal:'left',vertical:'center',wrapText:true}};
  const stNum  = {...stCell, alignment:{horizontal:'right',vertical:'center'}};
  const stFecha = {...stCell, fill:{patternType:'solid', fgColor:{rgb:'F5B300'}}, font:{name:'Segoe UI',sz:10,bold:true,color:{rgb:'3A2400'}}};
  const stTotal = {font:{name:'Segoe UI',sz:11,bold:true,color:{rgb:'000000'}}, fill:{patternType:'solid', fgColor:{rgb:'FFEB00'}}, alignment:{horizontal:'center',vertical:'center'}, border:{top:{style:'medium',color:{rgb:'000000'}},bottom:{style:'medium',color:{rgb:'000000'}},left:{style:'thin',color:{rgb:'000000'}},right:{style:'thin',color:{rgb:'000000'}}}};
  const stTotalNum = {...stTotal, alignment:{horizontal:'right',vertical:'center'}};
  const stTotalLeft = {...stTotal, alignment:{horizontal:'left',vertical:'center'}};

  // Título
  for(let c=0;c<NCOLS;c++){
    const a = XLSX.utils.encode_cell({r:0,c});
    if(!ws[a]) ws[a] = {t:'s',v: c===0? titulo : ''};
    ws[a].s = stTitle;
  }
  // Encabezados (r=2)
  for(let c=0;c<NCOLS;c++){
    const a = XLSX.utils.encode_cell({r:2,c});
    if(!ws[a]) ws[a] = {t:'s',v: aoaBase[0][c]};
    ws[a].s = stHdr;
  }

  const COL_OBS = 5;
  const COL_FECHA = 0;
  // Columnas numéricas: contadores (9..15+ext) y precios/total/alq/cuenta/ceco
  const colsNumIniciales = [9, 10 + offsetExtra, 11 + offsetExtra,
                             12 + offsetExtra, 13 + offsetExtra,
                             14 + offsetExtra, 15 + offsetExtra,
                             16 + offsetExtra, 17 + offsetExtra,
                             18 + offsetExtra];
  if(conMesAnterior){
    colsNumIniciales.push(10, 11); // CF anterior y Δ
  }
  const COL_NUM = new Set(colsNumIniciales);
  const fmtUSD2 = '#,##0.00';
  const fmtInt = '0';
  const range = XLSX.utils.decode_range(ws['!ref']);

  for(let R = 3; R <= range.e.r; R++){
    const esTotal = (numEquipos > 0 && R === filaTotalIdx);
    for(let C = 0; C < NCOLS; C++){
      const a = XLSX.utils.encode_cell({r:R,c:C});
      if(!ws[a]) ws[a] = {t:'s',v:''};
      // Formato numérico
      if([9, idxAlquiler, idxCuenta, idxCeco].includes(C) && typeof ws[a].v === 'number'){
        if(C === idxAlquiler) { ws[a].z = fmtUSD2; }
        else { ws[a].z = fmtInt; }
        ws[a].t = 'n';
      }
      // Contadores y consumos: enteros
      const idxCF = 10 + offsetExtra;
      const idxConsumo = 11 + offsetExtra;
      const idxVolMax = 12 + offsetExtra;
      const idxExc = 13 + offsetExtra;
      const idxPrecio = 14 + offsetExtra;
      const idxTotal = 15 + offsetExtra;
      if([idxCF, idxConsumo, idxVolMax].includes(C) && typeof ws[a].v === 'number'){
        ws[a].z = fmtInt; ws[a].t = 'n';
      }
      if(C === idxExc && typeof ws[a].v === 'number'){
        ws[a].z = fmtUSD2; ws[a].t = 'n';
      }
      if(C === idxPrecio && typeof ws[a].v === 'number'){
        ws[a].z = '0.0000'; ws[a].t = 'n';
      }
      if(C === idxTotal && typeof ws[a].v === 'number'){
        ws[a].z = fmtUSD2; ws[a].t = 'n';
      }
      // Columnas CF anterior / Δ
      if(conMesAnterior && (C === 10 || C === 11) && typeof ws[a].v === 'number'){
        ws[a].z = fmtInt; ws[a].t = 'n';
      }
      // Estilo
      let sty;
      if(esTotal){
        sty = COL_NUM.has(C) ? stTotalNum : (C <= 5 ? stTotalLeft : stTotal);
      } else if(C === COL_FECHA){
        sty = stFecha;
      } else if(C === COL_OBS){
        sty = stLeft;
      } else if(COL_NUM.has(C)){
        sty = stNum;
      } else {
        sty = stCell;
      }
      ws[a].s = sty;
    }
  }

  ws['!cols'] = aoaBase[0].map((h) => {
    if(h === 'Observación') return {wch: 40};
    if(h === 'S/N' || h === 'IP') return {wch: 14};
    if(h === 'Modelo' || h === 'Marca') return {wch: 12};
    if(h && h.startsWith && h.startsWith('CF ')) return {wch: 14};
    if(h === 'Δ vs CI') return {wch: 10};
    if(h === 'Contador Inicial' || h === 'Contador Final' || h === 'Volumen Maximo Establecido') return {wch: 14};
    if(h === 'Consumo del Mes' || h === 'Volumen Excedente') return {wch: 13};
    if(h === 'Cuenta' || h === 'Centro Costo' || h === 'Cantidad Impresoras') return {wch: 12};
    if(h === 'alquiler fijo') return {wch: 12};
    if(h === 'Total') return {wch: 12};
    return {wch: 11};
  });
  return ws;
}

// ====== Maestro de impresoras editable ======
// El maestro original vive en el código (const MAESTRO). Si el usuario lo
// modifica desde el botón "Maestro de impresoras", la versión editada se
// guarda en localStorage y reemplaza al original cada vez que se abre el archivo.
(function(){
  const CLAVE_MAESTRO = 'reprodata_maestro_v1';
  const MAESTRO_ORIGINAL = JSON.parse(JSON.stringify(MAESTRO));
  const CAMPOS = ['marca','modelo','ip','observacion','cuenta','centroCosto','cantidad','alquilerFijo','ingreso','salida'];
  const FECHAS_CAMPO = ['ingreso','salida'];
  const NUMERICOS = ['cuenta','centroCosto','cantidad','alquilerFijo'];

  function reemplazarMaestro(nuevo){
    for(const k of Object.keys(MAESTRO)) delete MAESTRO[k];
    for(const [k,v] of Object.entries(nuevo)) MAESTRO[k] = v;
  }

  function validarEstructura(obj){
    if(!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
    return Object.values(obj).every(v => v && typeof v === 'object' && 'observacion' in v && 'centroCosto' in v);
  }

  // Cargar maestro guardado (si existe) al abrir el archivo.
  // Si el maestro del código es más nuevo (MAESTRO_VERSION mayor), manda el del
  // código y la copia anterior del navegador se respalda.
  try{
    const raw = localStorage.getItem(CLAVE_MAESTRO);
    if(raw){
      const guardado = JSON.parse(raw);
      if((guardado.version || 1) < MAESTRO_VERSION){
        localStorage.setItem(CLAVE_MAESTRO + '_respaldo', raw);
        localStorage.removeItem(CLAVE_MAESTRO);
      } else if(validarEstructura(guardado.maestro)){
        reemplazarMaestro(normalizarFechasMaestro(guardado.maestro));
      }
    }
  }catch(e){ console.warn('No se pudo leer el maestro guardado:', e); }

  const modal = document.getElementById('modalMaestro');
  const tbody = document.getElementById('tbodyMaestro');
  const msg = document.getElementById('msgMaestro');

  function setMsg(texto, tipo){
    msg.textContent = texto || '';
    msg.className = 'modal-msg' + (tipo ? ' ' + tipo : '');
  }

  function esc(v){
    return String(v == null ? '' : v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
  }

  function filaHTML(sn, d, nueva){
    const celda = (campo, clase='') =>
      `<td><input data-campo="${campo}" class="${clase}" value="${esc(d[campo])}"${NUMERICOS.includes(campo) ? ' inputmode="decimal"' : ''}${FECHAS_CAMPO.includes(campo) ? ' type="date"' : ''}></td>`;
    const clases = [nueva ? 'nueva' : '', d.salida ? 'retirada' : ''].join(' ');
    return `<tr data-sn-original="${nueva ? '' : esc(sn)}" class="${clases}">
      <td><input data-campo="sn" class="sn" value="${esc(sn)}" placeholder="S/N"></td>
      ${celda('marca')}${celda('modelo')}${celda('ip')}${celda('observacion')}
      ${celda('cuenta','num')}${celda('centroCosto','num')}${celda('cantidad','num')}${celda('alquilerFijo','num')}
      ${celda('ingreso')}${celda('salida')}
      <td><button class="quitar" title="Quitar impresora (salió del contrato)">🗑</button></td>
    </tr>`;
  }

  function pintarTabla(){
    const filas = Object.entries(MAESTRO).sort((a,b) =>
      (a[1].salida ? 1 : 0) - (b[1].salida ? 1 : 0) ||
      (a[1].centroCosto||0) - (b[1].centroCosto||0) || a[0].localeCompare(b[0]));
    tbody.innerHTML = filas.map(([sn,d]) => filaHTML(sn,d,false)).join('');
  }

  function abrir(){
    pintarTabla();
    setMsg(`${Object.keys(MAESTRO).length} impresoras en el maestro.`);
    modal.classList.add('abierto');
  }
  function cerrar(){ modal.classList.remove('abierto'); }

  document.getElementById('btnMaestro').addEventListener('click', abrir);
  document.getElementById('btnCerrarMaestro').addEventListener('click', cerrar);
  document.getElementById('btnCancelarMaestro').addEventListener('click', cerrar);
  document.addEventListener('keydown', ev => { if(ev.key === 'Escape' && modal.classList.contains('abierto')) cerrar(); });

  // Marcar filas modificadas
  tbody.addEventListener('input', ev => {
    const tr = ev.target.closest('tr');
    ev.target.classList.remove('error');
    if(!tr) return;
    if(!tr.classList.contains('nueva')) tr.classList.add('cambiada');
    if(ev.target.dataset.campo === 'salida') tr.classList.toggle('retirada', !!ev.target.value);
  });

  // Quitar fila
  tbody.addEventListener('click', ev => {
    const btn = ev.target.closest('button.quitar');
    if(!btn) return;
    const tr = btn.closest('tr');
    const sn = tr.querySelector('[data-campo=sn]').value.trim() || '(sin S/N)';
    if(confirm(`¿Borrar DEFINITIVAMENTE la impresora ${sn} del maestro?\n\nSi solo salió del contrato, es mejor NO borrarla: cancele y ponga la fecha en "Fecha salida". Si la borra, los meses en que sí se facturó quedarán sin cuenta ni centro de costo.\n\nEl cambio se aplica al presionar "Guardar cambios".`)){
      tr.remove();
      setMsg(`Se quitará ${sn} al guardar.`);
    }
  });

  document.getElementById('btnAgregarImpresora').addEventListener('click', () => {
    const base = {marca:'',modelo:'',ip:'',observacion:'',cuenta:941231308,centroCosto:'',cantidad:1,alquilerFijo:51.68};
    tbody.insertAdjacentHTML('beforeend', filaHTML('', base, true));
    const ult = tbody.lastElementChild.querySelector('[data-campo=sn]');
    ult.scrollIntoView({block:'nearest'}); ult.focus();
  });

  // Leer la tabla y validar
  function leerTabla(){
    const nuevo = {};
    const errores = [];
    for(const tr of tbody.querySelectorAll('tr')){
      const get = c => tr.querySelector(`[data-campo="${c}"]`);
      const snInput = get('sn');
      const sn = snInput.value.trim().toUpperCase();
      if(!sn){ snInput.classList.add('error'); errores.push('Hay una fila sin S/N.'); continue; }
      if(nuevo[sn]){ snInput.classList.add('error'); errores.push(`S/N repetido: ${sn}`); continue; }
      const d = {};
      for(const c of CAMPOS){
        const inp = get(c);
        const v = inp.value.trim();
        if(FECHAS_CAMPO.includes(c)){
          if(v) d[c] = v;           // solo se guarda si tiene fecha
          continue;
        }
        if(NUMERICOS.includes(c)){
          const n = parseFloat(v.replace(/,/g,''));
          if(v === '' || isNaN(n)){ inp.classList.add('error'); errores.push(`${sn}: "${c}" debe ser un número.`); }
          d[c] = isNaN(n) ? 0 : n;
        } else d[c] = v;
      }
      if(d.ingreso && d.salida && d.salida < d.ingreso){
        get('salida').classList.add('error');
        errores.push(`${sn}: la fecha de salida es anterior a la de ingreso.`);
      }
      nuevo[sn] = d;
    }
    return {nuevo, errores};
  }

  function persistir(maestro){
    localStorage.setItem(CLAVE_MAESTRO, JSON.stringify({guardadoEn:new Date().toISOString(), version:MAESTRO_VERSION, maestro}));
  }

  function refrescarPantalla(){
    if(window._ultimosEquipos && window._ultimosEquipos.length){
      renderizar(window._ultimosEquipos, window._ultimaMeta);
      setStatus('✓ Maestro actualizado y cuadro recalculado. Si ya generó el asiento SAP, vuelva a presionar "Generar asiento SAP".');
    } else {
      setStatus('✓ Maestro de impresoras actualizado.');
    }
  }


  // ====== Validación automática: maestro vs equipos del PDF ======
  // Se ejecuta cada vez que se dibuja el cuadro (PDF importado o mes del histórico).
  function validarContraMaestro(equipos, meta){
    const cont = document.getElementById('avisoMaestro');
    if(!cont) return;
    const k = (typeof claveMes === 'function') ? claveMes(meta && meta.periodo) : null;
    const enPdf = new Set((equipos||[]).map(e => e.sn));
    const sinMaestro = [], retiradasCobradas = [], faltantes = [], antesDeAlta = [], movimientos = [];
    for(const sn of enPdf){
      const m = MAESTRO[sn];
      if(!m){ sinMaestro.push(sn); continue; }
      if(k && m.salida && k > mesDeFecha(m.salida)) retiradasCobradas.push(`${sn} (${m.observacion}, salió el ${fmtFecha(m.salida)})`);
      if(k && m.ingreso && k < mesDeFecha(m.ingreso)) antesDeAlta.push(`${sn} (${m.observacion}, ingresó el ${fmtFecha(m.ingreso)})`);
    }
    if(k){
      for(const [sn,m] of Object.entries(MAESTRO)){
        const activa = (!m.ingreso || k >= mesDeFecha(m.ingreso)) && (!m.salida || k <= mesDeFecha(m.salida));
        if(activa && !enPdf.has(sn)) faltantes.push(`${sn} (${m.observacion})`);
        if(m.ingreso && mesDeFecha(m.ingreso) === k) movimientos.push(`<b>Ingresó</b> el ${fmtFecha(m.ingreso)}: ${sn} – ${m.marca} ${m.modelo} (${m.observacion})`);
        if(m.salida && mesDeFecha(m.salida) === k) movimientos.push(`<b>Salió</b> el ${fmtFecha(m.salida)}: ${sn} – ${m.marca} ${m.modelo} (${m.observacion})`);
      }
    }
    const lista = arr => '<ul>' + arr.map(x => `<li>${x}</li>`).join('') + '</ul>';
    let html = '';
    if(sinMaestro.length || retiradasCobradas.length){
      html += '<div class="aviso-maestro grave">';
      if(sinMaestro.length) html += `<b>⚠ ${sinMaestro.length} equipo(s) del PDF no están en el maestro</b> (quedarán sin cuenta ni centro de costo en el asiento SAP). Agréguelos con <b>🖨 Maestro de impresoras</b>:${lista(sinMaestro)}`;
      if(retiradasCobradas.length) html += `<b>⚠ El proveedor está cobrando equipos en meses posteriores a su salida</b>. Verifique con el proveedor o corrija la fecha de salida:${lista(retiradasCobradas)}`;
      html += '</div>';
    }
    if(faltantes.length || antesDeAlta.length){
      html += '<div class="aviso-maestro">';
      if(faltantes.length) html += `<b>ℹ Equipos activos en el maestro que no aparecen en el PDF</b>. Si salieron del contrato, ponga su mes en "Retirada desde":${lista(faltantes)}`;
      if(antesDeAlta.length) html += `<b>ℹ Equipos facturados antes de su fecha de ingreso</b>:${lista(antesDeAlta)}`;
      html += '</div>';
    }
    if(movimientos.length){
      html += `<div class="aviso-maestro" style="border-color:var(--borde);background:#f8fafc;color:var(--texto)"><b>Movimientos de impresoras en este mes</b> (el proveedor factura el mes completo):${lista(movimientos)}</div>`;
    }
    cont.innerHTML = html;
  }

  const _renderizarOriginal = renderizar;
  renderizar = function(equipos, meta){
    const r = _renderizarOriginal.apply(this, arguments);
    try{ validarContraMaestro(equipos, meta); }catch(e){ console.warn('Validación maestro:', e); }
    return r;
  };
  window._validarContraMaestro = validarContraMaestro;

  document.getElementById('btnGuardarMaestro').addEventListener('click', () => {
    const {nuevo, errores} = leerTabla();
    if(errores.length){ setMsg('Corrija los campos en rojo: ' + errores[0], 'error'); return; }
    try{
      reemplazarMaestro(nuevo);
      persistir(nuevo);
    }catch(e){
      setMsg('No se pudo guardar en el navegador: ' + e.message, 'error'); return;
    }
    cerrar();
    refrescarPantalla();
  });

  document.getElementById('btnRestaurarMaestro').addEventListener('click', () => {
    if(!confirm('¿Volver al maestro original del archivo? Se perderán los cambios guardados en este navegador.')) return;
    tbody.innerHTML = '';
    try{ localStorage.removeItem(CLAVE_MAESTRO); }catch(e){}
    reemplazarMaestro(JSON.parse(JSON.stringify(MAESTRO_ORIGINAL)));
    pintarTabla();
    setMsg('Maestro original restaurado.', 'ok');
    refrescarPantalla();
  });

  document.getElementById('btnExportarMaestro').addEventListener('click', () => {
    const data = JSON.stringify({exportadoEn:new Date().toISOString(), maestro:MAESTRO}, null, 2);
    const blob = new Blob([data], {type:'application/json'});
    const a = document.createElement('a');
    const hoy = new Date().toISOString().slice(0,10);
    a.href = URL.createObjectURL(blob);
    a.download = `maestro_impresoras_${hoy}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    setMsg('Maestro exportado.', 'ok');
  });

  document.getElementById('fileMaestro').addEventListener('change', async ev => {
    const file = ev.target.files[0];
    ev.target.value = '';
    if(!file) return;
    try{
      const obj = JSON.parse(await file.text());
      const m = obj.maestro || obj;
      if(!validarEstructura(m)) throw new Error('El archivo no tiene el formato del maestro.');
      normalizarFechasMaestro(m);
      reemplazarMaestro(m);
      persistir(m);
      pintarTabla();
      setMsg(`Maestro importado: ${Object.keys(m).length} impresoras.`, 'ok');
      refrescarPantalla();
    }catch(e){
      setMsg('No se pudo importar: ' + e.message, 'error');
    }
  });
})();
};
