/* Liquidación VISA → SAP — estilos, interfaz y lógica de la aplicación. */
/* ---------------- estilos ---------------- */
const ESTILOS = `
:root{padding-top:env(safe-area-inset-top,0);padding-bottom:env(safe-area-inset-bottom,0)}
body{margin:0;font:14px/1.5 system-ui,sans-serif;background:#fafaf9}
img{max-width:100%}
[hidden]{display:none!important}
/* Layout: flujo en cuatro pasos apilados, cada paso una tarjeta sobre fondo; tablas con scroll propio. */
:root{
  --bg:#f3f5f8; --surface:#fff; --surface-2:#e8edf3; --surface-3:#f8fafc;
  --fg:#1a2533; --fg-dim:#4f5d6e; --fg-faint:#7d8a9a;
  --line:#d6dde6; --line-strong:#b4bfcc;
  --accent:#0b4f9c; --accent-fg:#fff; --accent-soft:#e4eef9; --accent-line:#a3c1e6;
  --brand:#0b2e59; --brand-fg:#fff; --brand-dim:#a9bdd6;
  --ok:#17764a; --ok-soft:#dbeee4;
  --warn:#8a5d00; --warn-soft:#f6ebd2;
  --crit:#a02f22; --crit-soft:#f7e0dc;
  --debito:#1d5fa8; --credito:#8a4a86;
  --shadow:0 1px 2px rgba(20,34,42,.07), 0 6px 18px -12px rgba(20,34,42,.28);
  --radius:10px;
  --sans:"IBM Plex Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --mono:"IBM Plex Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
}
:root[data-theme="dark"]{
  --bg:#0d1417; --surface:#152025; --surface-2:#1d2a31; --surface-3:#111b1f;
  --fg:#e3ebed; --fg-dim:#97a9b0; --fg-faint:#73858c;
  --line:#2b3b42; --line-strong:#3d5159;
  --accent:#5b9be6; --accent-fg:#08203f; --accent-soft:#12294a; --accent-line:#2c5486;
  --brand:#0a1a2e; --brand-fg:#e3ebf5; --brand-dim:#8ea3bd;
  --ok:#52c98c; --ok-soft:#10301f;
  --warn:#d9ab4a; --warn-soft:#332813;
  --crit:#e97f70; --crit-soft:#3a1d19;
  --debito:#6fb2e3; --credito:#c58dc0;
  --shadow:0 1px 2px rgba(0,0,0,.4), 0 8px 24px -14px rgba(0,0,0,.7);
  color-scheme:dark;
}
*{box-sizing:border-box}
html,body{min-height:100%}
body{
  margin:0; background:var(--bg); color:var(--fg);
  font-family:var(--sans); font-size:14.5px; line-height:1.5;
  -webkit-text-size-adjust:100%;
}
.wrap{max-width:1180px; margin:0 auto; padding-inline:16px; padding-block:0 56px}

/* ---------- barra superior ---------- */
.topbar{
  position:sticky; top:env(safe-area-inset-top, 0px); z-index:30;
  background:color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter:blur(10px);
  border-bottom:1px solid var(--line);
}
.topbar-in{
  max-width:1180px; margin:0 auto; padding:10px 16px;
  display:flex; align-items:center; gap:14px; flex-wrap:wrap;
}
.brand{display:flex; align-items:baseline; gap:9px; min-width:0}
.brand b{font-weight:600; letter-spacing:-.015em; font-size:15.5px; white-space:nowrap}
.brand span{font-size:11.5px; color:var(--fg-faint); font-family:var(--mono)}
.topbar-sp{flex:1 1 auto}
.filechip{
  display:none; align-items:center; gap:7px; min-width:0;
  font-family:var(--mono); font-size:11.5px; color:var(--fg-dim);
  background:var(--surface-2); border:1px solid var(--line);
  border-radius:999px; padding:4px 11px; max-width:100%;
}
.filechip.on{display:inline-flex}
.filechip em{font-style:normal; overflow:hidden; text-overflow:ellipsis; white-space:nowrap}
.topbar{background:var(--brand); border-bottom:0; backdrop-filter:none}
.topbar .brand b{color:var(--brand-fg)}
.topbar .brand span{color:var(--brand-dim)}
.topbar .filechip{background:rgba(255,255,255,.1); border-color:rgba(255,255,255,.25); color:var(--brand-fg)}
.topbar .btn{background:transparent; color:var(--brand-fg); border-color:rgba(255,255,255,.4)}
.topbar .btn:hover:not(:disabled){border-color:var(--brand-fg)}

/* ---------- encabezado ---------- */
header.hero{padding-block:30px 24px; max-width:62ch}
header.hero h1{
  font-size:clamp(25px,4.6vw,34px); line-height:1.12; letter-spacing:-.025em;
  font-weight:600; margin:0 0 10px; text-wrap:balance;
}
header.hero p{margin:0; color:var(--fg-dim); font-size:15px}

/* ---------- pasos ---------- */
.step{
  background:var(--surface); border:1px solid var(--line); border-radius:var(--radius);
  box-shadow:var(--shadow); margin-bottom:18px; overflow:hidden;
}
.step-head{
  display:flex; align-items:center; gap:13px; padding:14px 16px;
  border-bottom:1px solid var(--line); background:var(--surface-3);
}
.step.collapsed .step-head{border-bottom:0}
.step-n{
  flex:0 0 auto; width:25px; height:25px; border-radius:7px;
  display:grid; place-items:center;
  font-family:var(--mono); font-size:12px; font-weight:600;
  background:var(--accent-soft); color:var(--accent); border:1px solid var(--accent-line);
}
.step-t{flex:1 1 auto; min-width:0}
.step-t h2{margin:0; font-size:15px; font-weight:600; letter-spacing:-.01em}
.step-t p{margin:1px 0 0; font-size:12.5px; color:var(--fg-faint)}
.step-body{padding:16px}
.step.collapsed .step-body{display:none}
.step[data-locked="1"]{opacity:.5; pointer-events:none}
.toggle{
  flex:0 0 auto; background:none; border:1px solid var(--line); color:var(--fg-dim);
  border-radius:7px; width:28px; height:28px; cursor:pointer; font-family:var(--mono);
  font-size:13px; line-height:1; display:grid; place-items:center;
}
.toggle:hover{border-color:var(--line-strong); color:var(--fg)}

/* ---------- zona de carga ---------- */
.drop{
  border:1.5px dashed var(--line-strong); border-radius:var(--radius);
  background:var(--surface-3); padding:28px 20px; text-align:center;
  transition:border-color .15s, background .15s;
}
.drop.hot{border-color:var(--accent); background:var(--accent-soft)}
.drop h3{margin:0 0 5px; font-size:15px; font-weight:600}
.drop p{margin:0 0 14px; font-size:13px; color:var(--fg-dim)}
.drop .row{display:flex; gap:9px; justify-content:center; flex-wrap:wrap}

/* ---------- controles ---------- */
.btn{
  font-family:var(--sans); font-size:13.5px; font-weight:500;
  border-radius:8px; padding:8px 15px; cursor:pointer;
  border:1px solid var(--line-strong); background:var(--surface); color:var(--fg);
  transition:border-color .12s, background .12s;
}
.btn:hover:not(:disabled){border-color:var(--fg-faint)}
.btn:disabled{opacity:.45; cursor:not-allowed}
.btn.primary{background:var(--accent); border-color:var(--accent); color:var(--accent-fg); font-weight:600}
.btn.primary:hover:not(:disabled){filter:brightness(1.08)}
.btn.sm{font-size:12px; padding:5px 10px; border-radius:6px}
:is(.btn,input,select,textarea):focus-visible{outline:2px solid var(--accent); outline-offset:2px}

input[type=text],input[type=number],select{
  font-family:var(--mono); font-size:13px; color:var(--fg);
  background:var(--surface); border:1px solid var(--line); border-radius:7px;
  padding:7px 9px; width:100%; min-width:0;
}
input[type=text]:hover,input[type=number]:hover{border-color:var(--line-strong)}
label.fld{display:block; min-width:0}
label.fld > span{
  display:block; font-size:10.5px; font-weight:600; letter-spacing:.07em;
  text-transform:uppercase; color:var(--fg-faint); margin-bottom:5px;
}
.hint{font-family:var(--sans); font-size:11.5px; color:var(--fg-dim); margin-top:4px; min-height:1em}
.grid{display:grid; gap:14px}
.g2{grid-template-columns:repeat(auto-fit, minmax(220px,1fr))}
.g3{grid-template-columns:repeat(auto-fit, minmax(190px,1fr))}
.check{display:flex; align-items:flex-start; gap:9px; font-size:13px; cursor:pointer}
.check input{margin:2px 0 0; accent-color:var(--accent); flex:0 0 auto}
.check b{font-weight:500}
.check i{display:block; font-style:normal; font-size:11.5px; color:var(--fg-faint)}

fieldset{border:1px solid var(--line); border-radius:9px; padding:14px; margin:0 0 16px}
fieldset legend{
  font-size:10.5px; font-weight:700; letter-spacing:.09em; text-transform:uppercase;
  color:var(--accent); padding:0 7px;
}

/* ---------- resumen ---------- */
.sum{display:flex; flex-wrap:wrap; gap:10px; margin-bottom:16px}
.sum div{
  flex:1 1 130px; background:var(--surface-3); border:1px solid var(--line);
  border-radius:9px; padding:10px 12px; min-width:0;
}
.sum dt{
  font-size:10.5px; font-weight:600; letter-spacing:.07em; text-transform:uppercase;
  color:var(--fg-faint); margin:0 0 3px;
}
.sum dd{
  margin:0; font-family:var(--mono); font-size:16px; font-weight:500;
  font-variant-numeric:tabular-nums; letter-spacing:-.02em;
}

/* ---------- tablas ---------- */
.tscroll{overflow-x:auto; border:1px solid var(--line); border-radius:9px; background:var(--surface)}
table{border-collapse:collapse; width:100%; font-size:12.5px}
th,td{padding:7px 9px; text-align:left; border-bottom:1px solid var(--line); vertical-align:middle}
thead th{
  background:var(--surface-2); font-size:10px; font-weight:700; letter-spacing:.06em;
  text-transform:uppercase; color:var(--fg-dim); white-space:nowrap; position:sticky; top:0;
}
tbody tr:last-child :is(td,th){border-bottom:0}
td.num,th.num{text-align:right; font-family:var(--mono); font-variant-numeric:tabular-nums; white-space:nowrap}
td.mono{font-family:var(--mono)}
table input[type=text],table input[type=number]{padding:4px 6px; font-size:12px; border-radius:5px; background:transparent; border-color:transparent}
table input:hover{border-color:var(--line); background:var(--surface)}
table input:focus{border-color:var(--accent); background:var(--surface)}
table input.w-cta{width:94px}
table input.w-cc{width:62px}
table input.w-num{width:104px; text-align:right; font-variant-numeric:tabular-nums}
table input.w-txt{width:100%; min-width:200px}
td .nm{font-size:11.5px; color:var(--fg-dim); display:block; max-width:190px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap}
.dc{font-family:var(--mono); font-size:11px; font-weight:600; letter-spacing:.04em}
.dc.d{color:var(--debito)} .dc.c{color:var(--credito)}
tr.tot td{background:var(--surface-2); font-weight:600}

/* ---------- tipo de cambio ---------- */
.tcgrid{display:grid; grid-template-columns:repeat(auto-fill, minmax(146px,1fr)); gap:9px}
.tcell{
  display:flex; align-items:center; gap:7px; background:var(--surface-3);
  border:1px solid var(--line); border-radius:8px; padding:6px 8px; min-width:0;
}
.tcell span{
  font-family:var(--mono); font-size:11.5px; color:var(--fg-dim);
  flex:0 0 auto; font-variant-numeric:tabular-nums;
}
.tcell input{padding:4px 6px; font-size:12.5px; text-align:right}
.tcell.missing{border-color:var(--warn); background:var(--warn-soft)}

/* ---------- asientos ---------- */
.toolbar{
  display:flex; gap:9px; align-items:center; flex-wrap:wrap;
  padding-bottom:14px; margin-bottom:2px;
}
.toolbar .sp{flex:1 1 auto}
.toolbar label.fld{flex:0 0 auto; width:auto}
.toolbar select{width:auto; min-width:160px}
.asiento{border:1px solid var(--line); border-radius:9px; margin-bottom:10px; overflow:hidden; background:var(--surface)}
.asiento.off{opacity:.52}
.ah{
  display:flex; align-items:center; gap:11px; padding:9px 12px;
  background:var(--surface-3); cursor:pointer; flex-wrap:wrap;
}
.asiento.open .ah{border-bottom:1px solid var(--line)}
.ah input[type=checkbox]{accent-color:var(--accent); flex:0 0 auto; margin:0}
.ah-id{font-family:var(--mono); font-size:12px; font-weight:600; flex:0 0 auto}
.ah-sub{font-size:11.5px; color:var(--fg-faint); flex:1 1 130px; min-width:0}
.ah-fig{
  font-family:var(--mono); font-size:12px; font-variant-numeric:tabular-nums;
  color:var(--fg-dim); flex:0 0 auto;
}
.ah-fig b{color:var(--fg); font-weight:500}
.abody{padding:10px 12px 12px}
.asiento:not(.open) .abody{display:none}
.pill{
  flex:0 0 auto; font-family:var(--mono); font-size:10.5px; font-weight:600;
  letter-spacing:.04em; border-radius:999px; padding:2px 9px; white-space:nowrap;
}
.pill.ok{background:var(--ok-soft); color:var(--ok)}
.pill.warn{background:var(--warn-soft); color:var(--warn)}
.pill.crit{background:var(--crit-soft); color:var(--crit)}
.note{
  font-size:12px; color:var(--warn); background:var(--warn-soft);
  border:1px solid color-mix(in srgb, var(--warn) 35%, transparent);
  border-radius:7px; padding:7px 10px; margin-top:9px;
}
.note.crit{color:var(--crit); background:var(--crit-soft); border-color:color-mix(in srgb, var(--crit) 35%, transparent)}
.empty{text-align:center; color:var(--fg-faint); font-size:13px; padding:26px 12px}

/* ---------- exportar ---------- */
.exportrow{display:flex; gap:12px; align-items:center; flex-wrap:wrap}
.exportrow .btn.primary{font-size:14.5px; padding:10px 20px}
#status{font-size:12.5px; color:var(--fg-dim); min-height:1.4em; flex:1 1 200px; min-width:0}
#status.ok{color:var(--ok)} #status.bad{color:var(--crit)}

footer{margin-top:26px; font-size:11.5px; color:var(--fg-faint); line-height:1.6}
@media (prefers-reduced-motion: reduce){*{transition:none!important; animation:none!important}}
`;

/* ---------------- interfaz ---------------- */
const INTERFAZ = `
<div class="topbar">
  <div class="topbar-in">
    <div class="brand"><b>Liquidación VISA → SAP</b><span>Izipay · SAP B1</span></div>
    <div class="topbar-sp"></div>
    <div class="filechip" id="chip"><em id="chipName"></em></div>
    <button class="btn sm" id="themeBtn" type="button" title="Cambiar tema">Tema</button>
  </div>
</div>

<div class="wrap">
  <header class="hero">
    <h1>De la liquidación de tarjetas al asiento de SAP</h1>
    <p>Cargue el Excel de liquidación, confirme las cuentas y el tipo de cambio, y descargue la pestaña <strong>SAP</strong> lista para importar a SAP Business One.</p>
  </header>

  <!-- PASO 1 -->
  <section class="step" id="s1">
    <div class="step-head">
      <div class="step-n">1</div>
      <div class="step-t"><h2>Cargar la liquidación</h2><p id="s1sub">Archivo .xlsx con la hoja de liquidación de Izipay</p></div>
      <button class="toggle" type="button" data-fold="s1">−</button>
    </div>
    <div class="step-body">
      <div class="drop" id="drop">
        <h3>Arrastre el Excel aquí</h3>
        <p>Se detecta sola la hoja que contiene la columna COMERCIO/CADENA. La hoja <em>Datos</em>, si existe, se usa para los nombres de cuenta.</p>
        <div class="row">
          <button class="btn primary" type="button" id="pickBtn">Elegir archivo</button>
          <button class="btn" type="button" id="demoBtn">Cargar ejemplo</button>
        </div>
        <input type="file" id="file" accept=".xlsx,.xlsm,.xls" hidden>
      </div>
      <div id="s1res" hidden>
        <div class="grid g2" style="margin-top:14px">
          <label class="fld"><span>Hoja de liquidación</span>
            <select id="sheetSel"></select>
            <div class="hint" id="sheetHint"></div>
          </label>
          <label class="fld"><span>Catálogo de cuentas</span>
            <select id="catSel"></select>
            <div class="hint" id="catHint"></div>
          </label>
        </div>
        <dl class="sum" id="sum1" style="margin-top:16px"></dl>
      </div>
    </div>
  </section>

  <!-- PASO 2 -->
  <section class="step collapsed" id="s2" data-locked="1">
    <div class="step-head">
      <div class="step-n">2</div>
      <div class="step-t"><h2>Cuentas y formato</h2><p id="s2sub">Qué cuenta recibe cada línea del asiento</p></div>
      <button class="toggle" type="button" data-fold="s2">+</button>
    </div>
    <div class="step-body">
      <fieldset>
        <legend>Cuentas del asiento</legend>
        <div class="grid g2">
          <label class="fld"><span>Crédito · anticipo recibido</span>
            <input type="text" id="cAnticipo" value="121111101" inputmode="numeric">
            <div class="hint" id="hAnticipo"></div></label>
          <label class="fld"><span>Crédito · cliente con documento</span>
            <input type="text" id="cDocumento" value="102111101" inputmode="numeric">
            <div class="hint" id="hDocumento"></div></label>
          <label class="fld"><span>Débito · comisión de tarjetas</span>
            <input type="text" id="cComision" value="941231316" inputmode="numeric">
            <div class="hint" id="hComision"></div></label>
          <label class="fld"><span>Débito · banco (importe neto)</span>
            <input type="text" id="cBanco" value="104111201" inputmode="numeric">
            <div class="hint" id="hBanco"></div></label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Cuenta por comercio, cuando el grupo no trae etiqueta</legend>
        <div class="grid g3" id="comercioWrap"></div>
        <div class="hint">Si el grupo trae etiquetas (nombre y documento, o ANTICIPO RECIBIDO), manda la etiqueta. Esta cuenta aplica solo a los grupos sin etiqueta.</div>
      </fieldset>

      <fieldset>
        <legend>Moneda, glosa y centro de costo</legend>
        <div class="grid g3">
          <label class="fld"><span>Prefijo moneda extranjera</span><input type="text" id="pfME" value="USD"></label>
          <label class="fld"><span>Prefijo moneda local</span><input type="text" id="pfLoc" value="SOL"></label>
          <label class="fld"><span>Centro de costo · comisión</span><input type="text" id="ccCom" value="403"></label>
        </div>
        <label class="fld" style="margin-top:14px"><span>Glosa de comisión y banco</span>
          <input type="text" id="glosa" value="DEPOSITO TARJETA MCVISA USD" style="font-family:var(--sans)"></label>
      </fieldset>

      <fieldset style="margin-bottom:0">
        <legend>Opciones de la pestaña SAP</legend>
        <div class="grid g2">
          <label class="check"><input type="checkbox" id="optRound" checked>
            <b>Ajustar el redondeo en la línea del banco<i>Garantiza que débitos y créditos cuadren al céntimo en soles.</i></b></label>
          <label class="check"><input type="checkbox" id="optSep" checked>
            <b>Fila en blanco entre asientos<i>Separa cada liquidación, igual que en su hoja de trabajo.</i></b></label>
          <label class="check"><input type="checkbox" id="optSocio">
            <b>Separar socio de negocios y documento<i>Llena las columnas Socio Negocios y Tipo doc. - Serie - Numero.</i></b></label>
          <label class="check"><input type="checkbox" id="optFecha">
            <b>Llenar Fecha Registro Ventas<i>Usa la fecha de abono en formato DD/MM/AAAA.</i></b></label>
        </div>
      </fieldset>
    </div>
  </section>

  <!-- PASO 3 -->
  <section class="step collapsed" id="s3" data-locked="1">
    <div class="step-head">
      <div class="step-n">3</div>
      <div class="step-t"><h2>Tipo de cambio por fecha de abono</h2><p id="s3sub">Un tipo de cambio por cada fecha detectada</p></div>
      <button class="toggle" type="button" data-fold="s3">+</button>
    </div>
    <div class="step-body">
      <div class="toolbar" style="padding-bottom:12px">
        <label class="fld" style="width:140px"><span>Aplicar a todas</span><input type="number" id="tcAll" step="0.0001" min="0" placeholder="3.5500"></label>
        <button class="btn" type="button" id="tcApply" style="align-self:flex-end">Aplicar</button>
        <div class="sp"></div>
        <div class="hint" id="tcHint" style="text-align:right"></div>
      </div>
      <div class="tcgrid" id="tcGrid"></div>
    </div>
  </section>

  <!-- PASO 4 -->
  <section class="step collapsed" id="s4" data-locked="1">
    <div class="step-head">
      <div class="step-n">4</div>
      <div class="step-t"><h2>Revisar y exportar</h2><p id="s4sub">Edite cualquier línea antes de descargar</p></div>
      <button class="toggle" type="button" data-fold="s4">+</button>
    </div>
    <div class="step-body">
      <dl class="sum" id="sum4"></dl>
      <div class="toolbar">
        <label class="fld"><span>Filtrar por fecha de abono</span><select id="fFecha"></select></label>
        <label class="fld"><span>Comercio</span><select id="fComercio"></select></label>
        <div class="sp"></div>
        <button class="btn sm" type="button" id="selAll" style="align-self:flex-end">Marcar visibles</button>
        <button class="btn sm" type="button" id="selNone" style="align-self:flex-end">Desmarcar visibles</button>
        <button class="btn sm" type="button" id="expandAll" style="align-self:flex-end">Abrir / cerrar todo</button>
      </div>
      <div id="asientos"></div>
      <div class="exportrow" style="margin-top:18px">
        <button class="btn primary" type="button" id="dl">Descargar Excel con la pestaña SAP</button>
        <div id="status"></div>
      </div>
    </div>
  </section>

  <footer>
    Comisión del asiento = importe bruto − importe neto de la liquidación, que equivale a COMISIÓN TOTAL + COMISIÓN IGV y además absorbe las comisiones devueltas en las operaciones negativas.
    Los importes en soles se calculan al tipo de cambio de la fecha de abono y se redondean a dos decimales.<br>
    Leider Tisnado Mego · Soluciones Digitales
  </footer>
</div>
`;

document.head.appendChild(Object.assign(document.createElement('style'), { textContent: ESTILOS }));
document.body.innerHTML = INTERFAZ;

/* ---------------- lógica ---------------- */
(function(){
"use strict";
const $ = s => document.querySelector(s);
const el = (t,c,x) => { const n=document.createElement(t); if(c) n.className=c; if(x!=null) n.textContent=x; return n; };
const r2 = n => Math.round((Number(n)||0)*100)/100;
const money = n => (Number(n)||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});

/* ---------------- estado ---------------- */
const S = {
  fileName:'', wb:null, sheets:[], hoja:'', catHoja:'',
  catalogo:{},            // codigo -> nombre
  grupos:[],              // liquidaciones detectadas
  comercios:[],           // codigos de comercio detectados
  fechas:[],              // claves ISO de fecha de abono
  tc:{},                  // iso -> tipo de cambio
  ctaComercio:{},         // comercio -> cuenta por defecto
  asientos:[],            // modelo editable
  open:new Set(),
};

/* ---------------- utilidades de columnas ---------------- */
const norm = v => String(v==null?'':v).replace(/\s+/g,' ').trim().toUpperCase();
const COL = {
  comercio:['COMERCIO/CADENA','COMERCIO','COMERCIO / CADENA'],
  tarjeta:['TARJETA'],
  tipoTarjeta:['TIPO TARJETA'],
  fTrx:['FECHA TRANSACCION + HORA','FECHA TRANSACCION','FECHA TRANSACCIÓN + HORA'],
  fAbono:['FECHA ABONO'],
  importe:['IMPORTE TRANSACCION','IMPORTE TRANSACCIÓN'],
  comTotal:['COMISION TOTAL','COMISIÓN TOTAL'],
  comIgv:['COMISION IGV','COMISIÓN IGV'],
  neto:['IMPORTE NETO'],
};
function mapCols(hdr){
  const m={};
  hdr.forEach((c,i)=>{ const n=norm(c); if(n) m[n]=i; });
  const out={};
  for(const k in COL){ for(const name of COL[k]){ if(name in m){ out[k]=m[name]; break; } } }
  return out;
}
const num = v => { if(v==null||v==='') return null; const n=typeof v==='number'?v:parseFloat(String(v).replace(/,/g,'')); return Number.isFinite(n)?n:null; };
const isBlankRow = r => !r || r.every(c => c==null || String(c).trim()==='');

/* ---------------- fechas de abono (DMMAAAA / DDMMAAAA) ---------------- */
function parseAbono(v){
  if(v==null) return null;
  if(v instanceof Date) return {d:v.getDate(), m:v.getMonth()+1, y:v.getFullYear()};
  const s=String(v).replace(/\D/g,'');
  if(s.length===7) return {d:+s.slice(0,1), m:+s.slice(1,3), y:+s.slice(3)};
  if(s.length===8) return {d:+s.slice(0,2), m:+s.slice(2,4), y:+s.slice(4)};
  return null;
}
const p2 = n => String(n).padStart(2,'0');
const isoOf = f => f ? `${f.y}-${p2(f.m)}-${p2(f.d)}` : '';
const dmyOf = f => f ? `${p2(f.d)}/${p2(f.m)}/${f.y}` : '';
const shortOf = f => f ? `${p2(f.d)}/${p2(f.m)}` : '—';

/* ---------------- parseo de la liquidación ---------------- */
function parseLiquidacion(rows){
  let hi=-1;
  for(let i=0;i<Math.min(rows.length,40);i++){
    if((rows[i]||[]).some(c=>COL.comercio.includes(norm(c)))){ hi=i; break; }
  }
  if(hi<0) throw new Error('No se encontró la columna COMERCIO/CADENA en esta hoja.');
  const c = mapCols(rows[hi]);
  for(const req of ['comercio','importe','neto']){
    if(c[req]==null) throw new Error('Falta una columna obligatoria en la hoja de liquidación.');
  }
  const grupos=[]; let blk=[];
  const flush = () => {
    if(!blk.length) return;
    const det = blk.filter(r => num(r[c.comercio])!=null);
    if(det.length){
      const ann = blk.filter(r => num(r[c.comercio])==null);
      const etiquetas=[];
      for(const r of ann){
        const v = c.tarjeta!=null ? r[c.tarjeta] : null;
        if(typeof v==='string' && /[A-Za-zÁÉÍÓÚÑ]/.test(v) && v.trim()) etiquetas.push(v.replace(/\s+/g,' ').trim());
      }
      const bruto = r2(det.reduce((a,r)=>a+(num(r[c.importe])||0),0));
      const neto  = r2(det.reduce((a,r)=>a+(num(r[c.neto])||0),0));
      const refCom = r2(det.reduce((a,r)=>a+(num(r[c.comTotal])||0)+(c.comIgv!=null?(num(r[c.comIgv])||0):0),0));
      const fAb = c.fAbono!=null ? parseAbono(det[0][c.fAbono]) : null;
      grupos.push({
        comercio:String(num(det[0][c.comercio])),
        fecha:fAb, iso:isoOf(fAb),
        trx:det.map(r=>({
          importe:num(r[c.importe])||0,
          neto:num(r[c.neto])||0,
          tarjeta:c.tarjeta!=null?String(r[c.tarjeta]||'').trim():'',
          tipo:c.tipoTarjeta!=null?String(r[c.tipoTarjeta]||'').trim():'',
        })),
        etiquetas, bruto, neto, comision:r2(bruto-neto), refCom,
        devolucion: det.some(r=>(num(r[c.importe])||0)<0),
      });
    }
    blk=[];
  };
  for(let i=hi+1;i<rows.length;i++){
    if(isBlankRow(rows[i])) flush(); else blk.push(rows[i]);
  }
  flush();
  return grupos;
}

/* ---------------- catálogo de cuentas ---------------- */
function parseCatalogo(rows){
  const out={};
  for(const r of rows){
    if(!r) continue;
    const code=num(r[0]), name=r[1];
    if(code!=null && typeof name==='string' && name.trim()) out[String(code)]=name.trim();
  }
  return out;
}
const nombreCta = code => S.catalogo[String(code||'').trim()] || '';

/* ---------------- etiquetas: socio y documento ---------------- */
const RX_DOC = /\b(\d{2}-)?([A-Z]{1,2}\d{3,4})-?(\d{3,})\b/;
function partirEtiqueta(t){
  const s=(t||'').trim();
  const m=s.match(RX_DOC);
  if(!m) return {socio:s, doc:''};
  return {socio:s.slice(0,m.index).replace(/[-–\s]+$/,'').trim(), doc:m[0].trim()};
}
const esAnticipo = t => /ANTICIPO/i.test(t||'');

/* ---------------- construir asientos ---------------- */
function cfg(){
  return {
    anticipo:$('#cAnticipo').value.trim(), documento:$('#cDocumento').value.trim(),
    comision:$('#cComision').value.trim(), banco:$('#cBanco').value.trim(),
    pfME:$('#pfME').value.trim(), pfLoc:$('#pfLoc').value.trim(),
    cc:$('#ccCom').value.trim(), glosa:$('#glosa').value,
    round:$('#optRound').checked, sep:$('#optSep').checked,
    socio:$('#optSocio').checked, fecha:$('#optFecha').checked,
  };
}
function buildAsientos(){
  const k=cfg();
  S.asientos = S.grupos.map((g,gi)=>{
    const tc = Number(S.tc[g.iso])||0;
    const base = S.ctaComercio[g.comercio] || k.documento;
    // una línea de crédito por transacción, emparejada con su etiqueta por posición
    const raw = g.trx.map((t,i)=>{
      const et = g.etiquetas[i] || '';
      const cta = et ? (esAnticipo(et) ? k.anticipo : k.documento) : base;
      return { cta, comentario: et || k.glosa, me: t.importe };
    });
    // consolidar por cuenta + glosa
    const map=new Map();
    for(const l of raw){
      const key=l.cta+'\u0000'+l.comentario;
      if(map.has(key)) map.get(key).me = r2(map.get(key).me + l.me);
      else map.set(key, {...l});
    }
    const lineas=[];
    for(const l of map.values()){
      const p = partirEtiqueta(l.comentario===k.glosa ? '' : l.comentario);
      lineas.push({rol:'credito', dc:'C', cta:l.cta, me:r2(l.me), comentario:l.comentario, cc:'', socio:p.socio, doc:p.doc});
    }
    if(g.comision!==0) lineas.push({rol:'comision', dc:'D', cta:k.comision, me:r2(g.comision), comentario:k.glosa, cc:k.cc, socio:'', doc:''});
    lineas.push({rol:'banco', dc:'D', cta:k.banco, me:r2(g.neto), comentario:k.glosa, cc:'', socio:'', doc:''});
    return {id:gi+1, comercio:g.comercio, fecha:g.fecha, iso:g.iso, tc,
            nTrx:g.trx.length, bruto:g.bruto, comision:g.comision, neto:g.neto,
            refCom:g.refCom, devolucion:g.devolucion,
            incluir:true, lineas};
  });
}
/** soles de cada línea, con el ajuste de redondeo en la línea del banco */
function soles(a){
  const k=cfg(), tc=Number(a.tc)||0;
  const out=a.lineas.map(l=>r2((Number(l.me)||0)*tc));
  if(k.round && tc>0){
    let d=0,c=0; a.lineas.forEach((l,i)=>{ if(l.dc==='D') d=r2(d+out[i]); else c=r2(c+out[i]); });
    const dif=r2(c-d), bi=a.lineas.findIndex(l=>l.rol==='banco');
    if(bi>=0 && Math.abs(dif)>0 && Math.abs(dif)<=0.5*a.lineas.length+0.05) out[bi]=r2(out[bi]+dif);
  }
  return out;
}
function cuadre(a){
  const sol=soles(a);
  let dME=0,cME=0,dS=0,cS=0;
  a.lineas.forEach((l,i)=>{
    const m=Number(l.me)||0;
    if(l.dc==='D'){ dME=r2(dME+m); dS=r2(dS+sol[i]); } else { cME=r2(cME+m); cS=r2(cS+sol[i]); }
  });
  return {sol, dME, cME, dS, cS, difME:r2(dME-cME), difS:r2(dS-cS),
          ok: Math.abs(r2(dME-cME))<0.005 && Math.abs(r2(dS-cS))<0.005 && (Number(a.tc)||0)>0};
}

/* ---------------- render: paso 1 ---------------- */
function renderPaso1(){
  $('#s1res').hidden=false;
  const tot=S.grupos.reduce((a,g)=>a+g.bruto,0);
  const trx=S.grupos.reduce((a,g)=>a+g.trx.length,0);
  const fs=S.fechas;
  const d=$('#sum1'); d.innerHTML='';
  const add=(t,v)=>{ const w=el('div'); w.append(el('dt',null,t), el('dd',null,v)); d.append(w); };
  add('Liquidaciones', String(S.grupos.length));
  add('Transacciones', String(trx));
  add('Importe bruto', money(tot));
  add('Fechas de abono', String(fs.length));
  add('Periodo', fs.length ? `${shortOf(S.grupos.find(g=>g.iso===fs[0]).fecha)} – ${shortOf([...S.grupos].reverse().find(g=>g.iso===fs[fs.length-1]).fecha)}` : '—');
  $('#s1sub').textContent = `${S.grupos.length} liquidaciones · ${trx} transacciones`;
  $('#chipName').textContent = S.fileName;
  $('#chip').classList.add('on');
}

/* ---------------- render: paso 2 ---------------- */
function renderComercios(){
  const w=$('#comercioWrap'); w.innerHTML='';
  const def=$('#cDocumento').value.trim();
  S.comercios.forEach(cm=>{
    if(!(cm in S.ctaComercio)) S.ctaComercio[cm]=def;
    const n=S.grupos.filter(g=>g.comercio===cm).length;
    const sinEt=S.grupos.filter(g=>g.comercio===cm && !g.etiquetas.length).length;
    const lab=el('label','fld');
    const sp=el('span'); sp.textContent=`Comercio ${cm}`;
    const inp=el('input'); inp.type='text'; inp.value=S.ctaComercio[cm]; inp.inputMode='numeric';
    const h=el('div','hint');
    const upd=()=>{ h.textContent = (nombreCta(inp.value)||'—') + ` · ${sinEt} de ${n} sin etiqueta`; };
    inp.addEventListener('input',()=>{ S.ctaComercio[cm]=inp.value.trim(); upd(); rebuild(); });
    upd(); lab.append(sp,inp,h); w.append(lab);
  });
}
function wireCuentaHints(){
  [['#cAnticipo','#hAnticipo'],['#cDocumento','#hDocumento'],['#cComision','#hComision'],['#cBanco','#hBanco']].forEach(([i,h])=>{
    const inp=$(i), out=$(h);
    const upd=()=>{ out.textContent = nombreCta(inp.value) || (inp.value.trim()? 'No está en el catálogo' : '—'); };
    inp.addEventListener('input',()=>{ upd(); if(i==='#cDocumento') renderComercios(); rebuild(); });
    upd();
  });
  ['#pfME','#pfLoc','#ccCom','#glosa'].forEach(s=>$(s).addEventListener('input',rebuild));
  ['#optRound','#optSep','#optSocio','#optFecha'].forEach(s=>$(s).addEventListener('change',()=>{ renderAsientos(); renderSum4(); }));
}

/* ---------------- render: paso 3 ---------------- */
function renderTC(){
  const g=$('#tcGrid'); g.innerHTML='';
  S.fechas.forEach(iso=>{
    const f=S.grupos.find(x=>x.iso===iso).fecha;
    const c=el('div','tcell');
    const sp=el('span'); sp.textContent=dmyOf(f).slice(0,5);
    const inp=el('input'); inp.type='number'; inp.step='0.0001'; inp.min='0';
    inp.placeholder='0.0000'; inp.value=S.tc[iso]||'';
    inp.setAttribute('aria-label','Tipo de cambio '+dmyOf(f));
    inp.addEventListener('input',()=>{
      const v=parseFloat(inp.value);
      S.tc[iso]=Number.isFinite(v)&&v>0?v:0;
      c.classList.toggle('missing',!S.tc[iso]);
      S.asientos.forEach(a=>{ if(a.iso===iso) a.tc=S.tc[iso]; });
      renderAsientos(); renderSum4(); tcHint();
    });
    c.classList.toggle('missing',!S.tc[iso]);
    c.append(sp,inp); g.append(c);
  });
  tcHint();
}
function tcHint(){
  const faltan=S.fechas.filter(f=>!S.tc[f]).length;
  const h=$('#tcHint');
  h.textContent = faltan ? `Faltan ${faltan} de ${S.fechas.length} fechas` : `${S.fechas.length} fechas con tipo de cambio`;
  h.style.color = faltan ? 'var(--warn)' : 'var(--ok)';
  $('#s3sub').textContent = faltan ? `Faltan ${faltan} fechas por completar` : `${S.fechas.length} fechas completas`;
}

/* ---------------- render: paso 4 ---------------- */
function filtros(){
  const ff=$('#fFecha'), fc=$('#fComercio');
  const keepF=ff.value, keepC=fc.value;
  ff.innerHTML=''; fc.innerHTML='';
  ff.append(new Option('Todas las fechas',''));
  S.fechas.forEach(iso=>ff.append(new Option(dmyOf(S.grupos.find(g=>g.iso===iso).fecha), iso)));
  fc.append(new Option('Todos los comercios',''));
  S.comercios.forEach(cm=>fc.append(new Option(cm, cm)));
  ff.value = [...ff.options].some(o=>o.value===keepF)?keepF:'';
  fc.value = [...fc.options].some(o=>o.value===keepC)?keepC:'';
}
const visibles = () => {
  const f=$('#fFecha').value, c=$('#fComercio').value;
  return S.asientos.filter(a=>(!f||a.iso===f)&&(!c||a.comercio===c));
};
function renderSum4(){
  const inc=S.asientos.filter(a=>a.incluir);
  const bruto=r2(inc.reduce((a,x)=>a+x.bruto,0));
  const com=r2(inc.reduce((a,x)=>a+x.comision,0));
  const neto=r2(inc.reduce((a,x)=>a+x.neto,0));
  const nSol=r2(inc.reduce((a,x)=>a+cuadre(x).dS,0)/2);
  const malos=inc.filter(a=>!cuadre(a).ok).length;
  const d=$('#sum4'); d.innerHTML='';
  const add=(t,v,col)=>{ const w=el('div'); const dd=el('dd',null,v); if(col) dd.style.color=col; w.append(el('dt',null,t),dd); d.append(w); };
  const pf=cfg().pfME;
  add('Asientos marcados', `${inc.length} / ${S.asientos.length}`);
  add(`Bruto ${pf}`, money(bruto));
  add(`Comisión ${pf}`, money(com));
  add(`Neto ${pf}`, money(neto));
  add(`Total ${cfg().pfLoc}`, money(nSol));
  add('Cuadre', malos? `${malos} con diferencia` : 'Todo cuadra', malos? 'var(--crit)':'var(--ok)');
  $('#s4sub').textContent = malos ? `${malos} asientos necesitan revisión` : `${inc.length} asientos listos para exportar`;
  $('#dl').disabled = inc.length===0;
}
function renderAsientos(){
  const host=$('#asientos'); host.innerHTML='';
  const list=visibles();
  if(!list.length){ host.append(el('div','empty','Ningún asiento con esos filtros.')); return; }
  const k=cfg();
  for(const a of list){
    const q=cuadre(a);
    const card=el('div','asiento'+(S.open.has(a.id)?' open':'')+(a.incluir?'':' off'));

    const head=el('div','ah');
    const cb=el('input'); cb.type='checkbox'; cb.checked=a.incluir;
    cb.setAttribute('aria-label','Incluir asiento '+a.id);
    cb.addEventListener('click',e=>e.stopPropagation());
    cb.addEventListener('change',()=>{ a.incluir=cb.checked; card.classList.toggle('off',!a.incluir); renderSum4(); });
    head.append(cb);
    head.append(el('div','ah-id',`#${String(a.id).padStart(2,'0')} · ${dmyOf(a.fecha)}`));
    head.append(el('div','ah-sub',`Comercio ${a.comercio} · ${a.nTrx} ${a.nTrx===1?'transacción':'transacciones'} · ${a.lineas.length} líneas`));
    const fig=el('div','ah-fig');
    fig.innerHTML = `${k.pfME} <b>${money(a.bruto)}</b> − ${money(a.comision)} = <b>${money(a.neto)}</b>`;
    head.append(fig);
    const pill = el('div','pill '+(q.ok?'ok':((Number(a.tc)||0)>0?'crit':'warn')),
      q.ok ? 'cuadra' : ((Number(a.tc)||0)>0 ? 'dif '+money(q.difS) : 'sin TC'));
    head.append(pill);
    head.addEventListener('click',()=>{ if(S.open.has(a.id)) S.open.delete(a.id); else S.open.add(a.id); card.classList.toggle('open'); });
    card.append(head);

    const body=el('div','abody');
    const sc=el('div','tscroll'); const tb=el('table');
    const thead=el('thead'); const hr=el('tr');
    const cols=['Cuenta','Nombre de cuenta','','Débito '+k.pfME,'Crédito '+k.pfME,'Débito '+k.pfLoc,'Crédito '+k.pfLoc,'Comentarios','C. Costo'];
    if(k.socio) cols.push('Socio Negocios','Tipo doc. - Serie - Numero');
    cols.forEach((c,i)=>{ const th=el('th',(i>=3&&i<=6)?'num':null,c); hr.append(th); });
    thead.append(hr); tb.append(thead);
    const tbody=el('tbody');
    a.lineas.forEach((l,i)=>{
      const tr=el('tr');
      // cuenta
      const tdC=el('td'); const iC=el('input'); iC.type='text'; iC.className='w-cta'; iC.value=l.cta; iC.inputMode='numeric';
      iC.setAttribute('aria-label','Cuenta'); tdC.append(iC); tr.append(tdC);
      // nombre
      const tdN=el('td'); const nm=el('span','nm',nombreCta(l.cta)||'—'); tdN.append(nm); tr.append(tdN);
      iC.addEventListener('input',()=>{ l.cta=iC.value.trim(); nm.textContent=nombreCta(l.cta)||'—'; });
      // D/C
      const tdDC=el('td'); tdDC.append(el('span','dc '+(l.dc==='D'?'d':'c'), l.dc==='D'?'DEB':'CRE')); tr.append(tdDC);
      // importes ME
      const tdDM=el('td','num'), tdCM=el('td','num');
      const iM=el('input'); iM.type='text'; iM.className='w-num'; iM.value=money(l.me); iM.inputMode='decimal';
      iM.setAttribute('aria-label','Importe en '+k.pfME);
      (l.dc==='D'?tdDM:tdCM).append(iM);
      (l.dc==='D'?tdCM:tdDM).textContent='';
      tr.append(tdDM,tdCM);
      // importes soles
      const tdDS=el('td','num'), tdCS=el('td','num');
      const sv=money(q.sol[i]);
      if(l.dc==='D'){ tdDS.textContent=sv; } else { tdCS.textContent=sv; }
      tr.append(tdDS,tdCS);
      iM.addEventListener('change',()=>{
        const v=parseFloat(iM.value.replace(/,/g,''));
        l.me = Number.isFinite(v)?r2(v):0;
        renderAsientos(); renderSum4();
      });
      // comentario
      const tdX=el('td'); const iX=el('input'); iX.type='text'; iX.className='w-txt'; iX.value=l.comentario;
      iX.style.fontFamily='var(--sans)'; iX.setAttribute('aria-label','Comentarios');
      iX.addEventListener('input',()=>{ l.comentario=iX.value; });
      tdX.append(iX); tr.append(tdX);
      // centro de costo
      const tdCC=el('td'); const iCC=el('input'); iCC.type='text'; iCC.className='w-cc'; iCC.value=l.cc;
      iCC.setAttribute('aria-label','Centro de costo');
      iCC.addEventListener('input',()=>{ l.cc=iCC.value.trim(); });
      tdCC.append(iCC); tr.append(tdCC);
      if(k.socio){
        const tdS=el('td'); const iS=el('input'); iS.type='text'; iS.className='w-txt'; iS.value=l.socio;
        iS.style.fontFamily='var(--sans)'; iS.setAttribute('aria-label','Socio de negocios');
        iS.addEventListener('input',()=>{ l.socio=iS.value; }); tdS.append(iS); tr.append(tdS);
        const tdD=el('td'); const iD=el('input'); iD.type='text'; iD.className='w-cta'; iD.value=l.doc;
        iD.setAttribute('aria-label','Tipo doc serie numero');
        iD.addEventListener('input',()=>{ l.doc=iD.value.trim(); }); tdD.append(iD); tr.append(tdD);
      }
      tbody.append(tr);
    });
    const tr=el('tr','tot');
    tr.append(el('td'),el('td','', 'Totales'),el('td'));
    tr.append(el('td','num',money(q.dME)),el('td','num',money(q.cME)),el('td','num',money(q.dS)),el('td','num',money(q.cS)));
    tr.append(el('td','', a.tc? `TC ${Number(a.tc).toFixed(4)}` : 'sin tipo de cambio'), el('td'));
    if(k.socio){ tr.append(el('td'),el('td')); }
    tbody.append(tr);
    tb.append(tbody); sc.append(tb); body.append(sc);

    if(!(Number(a.tc)||0)) body.append(el('div','note','Falta el tipo de cambio del '+dmyOf(a.fecha)+'. Complételo en el paso 3 para obtener los importes en '+k.pfLoc+'.'));
    else if(!q.ok) body.append(el('div','note crit',`Los débitos y créditos no coinciden: ${money(q.difME)} en ${k.pfME} y ${money(q.difS)} en ${k.pfLoc}.`));
    if(a.devolucion) body.append(el('div','note',`Esta liquidación incluye una devolución. La comisión del asiento (${money(a.comision)}) ya descuenta la comisión devuelta; la suma de COMISIÓN TOTAL + IGV del reporte es ${money(a.refCom)}.`));
    card.append(body);
    host.append(card);
  }
}

/* ---------------- exportar ---------------- */
const HDR = ['Cuenta de mayor/Código SN','Cuenta de mayor/Nombre SN','Débito (ME)','Crédito (ME)','Débito','Crédito','Débito (MS)','Crédito (MS)','Comentarios','Centro de Costo','Bloqueo de pago','Motivo del bloqueo','Ejecución de orden de pago','Cuenta destino','Cuenta patrimonial','Comp. destino','Procesado DC','Info socio de negocios','Info de terceros','Tipo doc. - Serie - Numero','Socio Negocios','Fecha Registro Ventas'];

function buildAOA(){
  const k=cfg();
  const aoa=[ new Array(22).fill(null), HDR.slice() ];
  const inc=S.asientos.filter(a=>a.incluir);
  inc.forEach((a,ai)=>{
    const q=cuadre(a);
    a.lineas.forEach((l,i)=>{
      const me=`${k.pfME} ${money(l.me)}`, loc=`${k.pfLoc} ${money(q.sol[i])}`;
      const D=l.dc==='D';
      const row=new Array(22).fill(null);
      const cta=Number(l.cta); row[0]=Number.isFinite(cta)&&String(cta)===l.cta?cta:l.cta;
      row[1]=nombreCta(l.cta)||null;
      row[2]=D?me:null;  row[3]=D?null:me;
      row[4]=D?loc:null; row[5]=D?null:loc;
      row[6]=D?me:null;  row[7]=D?null:me;
      row[8]=l.comentario||null;
      row[9]=l.cc? (Number.isFinite(Number(l.cc))?Number(l.cc):l.cc) : null;
      row[10]='N'; row[12]='N'; row[16]='No';
      if(k.socio){ row[19]=l.doc||null; row[20]=l.socio||null; }
      if(k.fecha) row[21]=dmyOf(a.fecha);
      aoa.push(row);
    });
    if(k.sep && ai<inc.length-1) aoa.push(new Array(22).fill(null));
  });
  return aoa;
}
/* Estilos del Excel (xlsx-js-style): solo cambian el aspecto, no los valores que lee SAP. */
const XS = (()=>{
  const borde = c => { const b={style:'thin',color:{rgb:c}}; return {top:b,bottom:b,left:b,right:b}; };
  const fuente = (x={}) => Object.assign({name:'Calibri',sz:10,color:{rgb:'1A2533'}},x);
  return {
    borde, fuente,
    titulo:{font:fuente({sz:14,bold:true,color:{rgb:'FFFFFF'}}), fill:{fgColor:{rgb:'0B2E59'}}, alignment:{vertical:'center',indent:1}},
    subtitulo:{font:fuente({italic:true,color:{rgb:'4F5D6E'}})},
    encabezado:{font:fuente({bold:true,color:{rgb:'FFFFFF'}}), fill:{fgColor:{rgb:'0B2E59'}},
      alignment:{horizontal:'center',vertical:'center',wrapText:true}, border:borde('0B2E59')},
    total:{font:fuente({bold:true}), fill:{fgColor:{rgb:'DCE7F5'}}, border:borde('A3C1E6')},
    banda:['FFFFFF','EEF3FA'],
    debito:'1D5FA8', credito:'8A4A86',
    estado:{ok:['DBEEE4','17764A'], warn:['F6EBD2','8A5D00'], crit:['F7E0DC','A02F22']},
  };
})();
const celda = (r,c) => XLSX.utils.encode_cell({r,c});
// Número de serie de Excel para una fecha {d,m,y}, sin depender de la zona horaria.
const serialExcel = f => (Date.UTC(f.y,f.m-1,f.d) - Date.UTC(1899,11,30)) / 86400000;

function hojaSAP(){
  const k=cfg();
  const ws=XLSX.utils.aoa_to_sheet(buildAOA());
  ws['!cols']=[{wch:14},{wch:34},{wch:14},{wch:14},{wch:15},{wch:15},{wch:14},{wch:14},{wch:46},{wch:13},{wch:14},{wch:16},{wch:24},{wch:14},{wch:16},{wch:13},{wch:12},{wch:19},{wch:16},{wch:24},{wch:30},{wch:19}];
  ws['!rows']=[]; ws['!rows'][1]={hpt:30};
  for(let c=0;c<22;c++) ws[celda(1,c)].s=XS.encabezado;
  // Cada asiento con su propio color de banda; las filas de separación quedan vacías.
  const inc=S.asientos.filter(a=>a.incluir);
  let r=2;
  inc.forEach((a,ai)=>{
    const fill={fgColor:{rgb:XS.banda[ai%2]}};
    for(let n=0;n<a.lineas.length;n++,r++) for(let c=0;c<22;c++){
      const ref=celda(r,c);
      if(!ws[ref]) ws[ref]={t:'s',v:''};
      const deb=c===2||c===4||c===6, cre=c===3||c===5||c===7;
      ws[ref].s={
        fill, border:XS.borde('D6DDE6'),
        font:XS.fuente({bold:c===0, color:{rgb: deb?XS.debito : cre?XS.credito : '1A2533'}}),
        alignment:{horizontal: deb||cre ? 'right' : (c>=10&&c<=16 ? 'center' : 'left'), vertical:'center'},
      };
    }
    if(k.sep) r++;
  });
  return ws;
}

function hojaResumen(){
  const k=cfg(), inc=S.asientos.filter(a=>a.incluir);
  const H=['N°','Fecha de abono','Comercio','Transacciones',`Bruto ${k.pfME}`,`Comisión ${k.pfME}`,`Neto ${k.pfME}`,'Tipo de cambio',`Total ${k.pfLoc}`,'Estado'];
  const ahora=new Date();
  const gen=`${p2(ahora.getDate())}/${p2(ahora.getMonth()+1)}/${ahora.getFullYear()} ${p2(ahora.getHours())}:${p2(ahora.getMinutes())}`;
  const ws=XLSX.utils.aoa_to_sheet([
    ['Liquidación VISA → SAP · Resumen de asientos'],
    [`Archivo origen: ${S.fileName||'—'} · Generado el ${gen}`],
    [], H,
  ]);
  ws['!merges']=[{s:{r:0,c:0},e:{r:0,c:9}},{s:{r:1,c:0},e:{r:1,c:9}}];
  ws['!cols']=[{wch:6},{wch:15},{wch:14},{wch:14},{wch:16},{wch:16},{wch:16},{wch:15},{wch:16},{wch:18}];
  ws['!rows']=[{hpt:26},{hpt:16},{hpt:8},{hpt:30}];
  for(let c=0;c<10;c++){ ws[celda(0,c)]=ws[celda(0,c)]||{t:'s',v:''}; ws[celda(0,c)].s=XS.titulo; ws[celda(3,c)].s=XS.encabezado; }
  ws[celda(1,0)].s=XS.subtitulo;
  const fmt=['0','dd/mm/yyyy','@','0','#,##0.00','#,##0.00','#,##0.00','0.0000','#,##0.00','@'];
  const ini=4;
  inc.forEach((a,i)=>{
    const q=cuadre(a), tc=Number(a.tc)||0, r=ini+i;
    const est = q.ok ? ['Cuadra','ok'] : tc>0 ? [`Diferencia ${money(q.difS)}`,'crit'] : ['Sin tipo de cambio','warn'];
    const vals=[i+1, serialExcel(a.fecha), String(a.comercio), a.nTrx, a.bruto, a.comision, a.neto, tc||null, tc?q.dS:null, est[0]];
    const fill={fgColor:{rgb:XS.banda[i%2]}};
    vals.forEach((v,c)=>{
      const ref=celda(r,c);
      ws[ref] = v==null ? {t:'s',v:''} : typeof v==='number' ? {t:'n',v,z:fmt[c]} : {t:'s',v};
      ws[ref].s={fill, border:XS.borde('D6DDE6'), font:XS.fuente({bold:c===0}),
        alignment:{horizontal: c<=1||c===3 ? 'center' : (c===2 ? 'left' : 'right'), vertical:'center'}};
      if(c===9){
        const [bg,fg]=XS.estado[est[1]];
        ws[ref].s=Object.assign({},ws[ref].s,{fill:{fgColor:{rgb:bg}}, font:XS.fuente({bold:true,color:{rgb:fg}}), alignment:{horizontal:'center'}});
      }
    });
  });
  // Fila de totales con fórmulas, para que se recalculen si se edita el resumen.
  const rt=ini+inc.length; // en notación de Excel los datos van de la fila ini+1 a la rt
  const suma=(c,z)=>{ const col=XLSX.utils.encode_col(c);
    const v=inc.reduce((t,a)=>t+(c===3?a.nTrx:c===4?a.bruto:c===5?a.comision:c===6?a.neto:(Number(a.tc)?cuadre(a).dS:0)),0);
    return {t:'n', v:r2(v), f:inc.length?`SUM(${col}${ini+1}:${col}${rt})`:undefined, z}; };
  const tot=[{t:'s',v:''},{t:'s',v:''},{t:'s',v:'Totales'},suma(3,'0'),suma(4,'#,##0.00'),suma(5,'#,##0.00'),suma(6,'#,##0.00'),{t:'s',v:''},suma(8,'#,##0.00'),{t:'s',v:''}];
  tot.forEach((x,c)=>{ x.s=Object.assign({},XS.total,{alignment:{horizontal: c===2?'left':(c===3?'center':'right')}}); ws[celda(rt,c)]=x; });
  ws['!ref']=XLSX.utils.encode_range({s:{r:0,c:0},e:{r:rt,c:9}});
  return ws;
}

function xlsxBlob(){
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,hojaSAP(),'SAP');
  XLSX.utils.book_append_sheet(wb,hojaResumen(),'Resumen');
  const buf=XLSX.write(wb,{bookType:'xlsx',type:'array'});
  return new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
}
function nombreArchivo(){
  const inc=S.asientos.filter(a=>a.incluir);
  const f=$('#fFecha').value;
  if(f && inc.length && inc.every(a=>a.iso===f)) return `SAP_${f.replace(/-/g,'')}.xlsx`;
  const isos=[...new Set(inc.map(a=>a.iso))].sort();
  if(isos.length===1) return `SAP_${isos[0].replace(/-/g,'')}.xlsx`;
  const y=isos[0]?isos[0].slice(0,7).replace('-',''):'';
  return `SAP_VISA_${y||'export'}.xlsx`;
}
async function descargar(){
  const st=$('#status'); st.className=''; st.textContent='Generando el archivo…';
  const inc=S.asientos.filter(a=>a.incluir);
  const malos=inc.filter(a=>!cuadre(a).ok).length;
  try{
    const blob=xlsxBlob(), name=nombreArchivo();
    const dls = window.claude && claude.use ? await claude.use('downloads') : null;
    if(dls){
      await dls.save({filename:name, data:blob});
      st.className='ok';
      st.textContent=`${name} · ${inc.length} asientos` + (malos?` · ${malos} con diferencia de cuadre`:' · todos cuadran');
      return;
    }
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download=name;
    document.body.append(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),4000);
    st.className='ok'; st.textContent=`${name} · ${inc.length} asientos`;
  }catch(e){
    const code=e&&e.code;
    st.className='bad';
    st.textContent = code==='declined' ? 'Descarga cancelada.'
      : code==='rate_limited' ? 'Hay otra descarga pendiente de confirmar. Intente de nuevo en unos segundos.'
      : code==='too_large' ? 'El archivo excede el límite. Filtre por una fecha de abono y exporte por partes.'
      : 'No se pudo generar el archivo: ' + ((e&&e.message)||'error desconocido');
  }
}

/* ---------------- carga del libro ---------------- */
function rebuild(){
  const abiertos=new Set(S.open);
  buildAsientos();
  S.open=abiertos;
  renderAsientos(); renderSum4();
}
function cargarLibro(wb, nombre){
  S.wb=wb; S.fileName=nombre; S.sheets=wb.SheetNames.slice();
  const rowsOf = n => XLSX.utils.sheet_to_json(wb.Sheets[n],{header:1,raw:true,defval:null,blankrows:true});
  // hoja de liquidación: la que tiene COMERCIO/CADENA
  let hoja='';
  for(const n of S.sheets){
    const rs=rowsOf(n);
    if(rs.slice(0,40).some(r=>(r||[]).some(c=>COL.comercio.includes(norm(c))))){ hoja=n; break; }
  }
  if(!hoja) hoja=S.sheets[0];
  // catálogo: hoja cuyo encabezado habla de código/nombre de cuenta
  let cat='';
  for(const n of S.sheets){
    const rs=rowsOf(n); const h=(rs[0]||[]).map(norm).join(' ');
    if(/C[OÓ]DIGO DE CUENTA/.test(h) || /NOMBRE DE CUENTA/.test(h)){ cat=n; break; }
  }
  const sel=$('#sheetSel'); sel.innerHTML='';
  S.sheets.forEach(n=>sel.append(new Option(n,n)));
  sel.value=hoja;
  const csel=$('#catSel'); csel.innerHTML='';
  csel.append(new Option('Sin catálogo',''));
  S.sheets.forEach(n=>csel.append(new Option(n,n)));
  csel.value=cat;
  aplicarHojas();
}
function aplicarHojas(){
  const wb=S.wb;
  const rowsOf = n => XLSX.utils.sheet_to_json(wb.Sheets[n],{header:1,raw:true,defval:null,blankrows:true});
  S.hoja=$('#sheetSel').value; S.catHoja=$('#catSel').value;
  S.catalogo = S.catHoja ? parseCatalogo(rowsOf(S.catHoja).slice(1)) : {};
  $('#catHint').textContent = S.catHoja ? `${Object.keys(S.catalogo).length} cuentas cargadas` : 'Los nombres de cuenta quedarán en blanco';
  let grupos;
  try{ grupos = parseLiquidacion(rowsOf(S.hoja)); }
  catch(e){ $('#sheetHint').textContent=e.message; $('#sheetHint').style.color='var(--crit)'; return; }
  if(!grupos.length){ $('#sheetHint').textContent='No se detectó ninguna liquidación en esta hoja.'; $('#sheetHint').style.color='var(--crit)'; return; }
  $('#sheetHint').style.color=''; $('#sheetHint').textContent=`${grupos.length} liquidaciones detectadas`;
  S.grupos=grupos;
  S.comercios=[...new Set(grupos.map(g=>g.comercio))].sort();
  S.fechas=[...new Set(grupos.map(g=>g.iso))].filter(Boolean).sort();
  S.fechas.forEach(f=>{ if(!(f in S.tc)) S.tc[f]=0; });
  S.open=new Set();
  ['s2','s3','s4'].forEach(id=>{ $('#'+id).dataset.locked='0'; });
  renderPaso1(); renderComercios(); renderTC(); filtros(); rebuild();
  fold('s1',true); fold('s2',true); fold('s3',false); fold('s4',false);
  $('#s3').scrollIntoView({behavior:'smooth',block:'start'});
}

/* ---------------- ejemplo ---------------- */
function demo(){
  const H=['COMERCIO/CADENA','TARJETA','TIPO TARJETA','FECHA TRANSACCION + HORA','FECHA ABONO','IMPORTE TRANSACCION','COMISION TOTAL','COMISION IZIPAY','COMISION IGV','IMPORTE NETO'];
  const R=[];
  const det=(c,t,tp,f,imp,ct,ci,ig,nt)=>[c,t,tp,null,f,imp,ct,ci,ig,nt];
  const ann=(txt)=>[null,txt,null,null,null,null,null,null,null,null];
  R.push(det('4090001','492019******1055','VCI',1102026,990,41.66,21.86,3.93,944.41));
  R.push(ann('CLIENTE EJEMPLO S.A.C. 01-F006-0040001'));
  R.push([]);
  R.push(det('4090001','428076******4913','VCN',1102026,2265.60,63.62,0,0,2201.98));
  R.push(det('4090001','403351******0680','VCI',1102026,272.80,11.61,6.16,1.11,260.08));
  R.push(ann('HUESPED EJEMPLO 03-B006-0011001'));
  R.push(ann('ANTICIPO RECIBIDO'));
  R.push([]);
  R.push(det('6090002','417749******2203','VDI',2102026,253.00,10.60,5.92,1.07,241.33));
  R.push(det('6090002','455788******1222','VDN',2102026,876.00,24.44,0,0,851.56));
  R.push(det('6090002','421355******8864','VDN',2102026,1280.00,35.71,4.99,0.90,1243.39));
  R.push([]);
  const rows=[new Array(10).fill(null),H,...R.map(r=>r.length?r:new Array(10).fill(null))];
  const cuentas=[['Código de cuenta','Nombre de cuenta'],
    [102111101,'Administración'],[121111101,'Huespedes en Casa'],
    [941231316,'Comisiones de tarjetas de crédito'],[104111201,'Banco de Crédito - Cta. Dolares']];
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'VISA D');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(cuentas), 'Datos');
  cargarLibro(wb,'ejemplo-liquidacion.xlsx');
  S.fechas.forEach(f=>S.tc[f]=3.55);
  renderTC(); rebuild();
  $('#status').className=''; $('#status').textContent='Datos de ejemplo, no corresponden a ninguna liquidación real.';
}

/* ---------------- plegado y tema ---------------- */
function fold(id,collapse){
  const s=$('#'+id); s.classList.toggle('collapsed',collapse);
  const b=s.querySelector('.toggle'); if(b) b.textContent = collapse?'+':'−';
}
document.querySelectorAll('.toggle').forEach(b=>{
  b.addEventListener('click',()=>fold(b.dataset.fold, !$('#'+b.dataset.fold).classList.contains('collapsed')));
});
$('#themeBtn').addEventListener('click',()=>{
  const r=document.documentElement;
  const dark = r.getAttribute('data-theme')==='dark';
  r.setAttribute('data-theme', dark?'light':'dark');
});

/* ---------------- eventos ---------------- */
function leer(f){
  if(!f) return;
  const fr=new FileReader();
  fr.onload=e=>{
    try{ cargarLibro(XLSX.read(new Uint8Array(e.target.result),{type:'array'}), f.name); }
    catch(err){ $('#sheetHint').textContent='No se pudo leer el archivo: '+err.message; $('#s1res').hidden=false; }
  };
  fr.readAsArrayBuffer(f);
}
$('#pickBtn').addEventListener('click',()=>$('#file').click());
$('#file').addEventListener('change',e=>leer(e.target.files[0]));
$('#demoBtn').addEventListener('click',demo);
const dz=$('#drop');
['dragenter','dragover'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault(); dz.classList.add('hot');}));
['dragleave','drop'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault(); dz.classList.remove('hot');}));
dz.addEventListener('drop',e=>{ const f=e.dataTransfer.files&&e.dataTransfer.files[0]; if(f) leer(f); });
$('#sheetSel').addEventListener('change',aplicarHojas);
$('#catSel').addEventListener('change',aplicarHojas);
$('#tcApply').addEventListener('click',()=>{
  const v=parseFloat($('#tcAll').value);
  if(!Number.isFinite(v)||v<=0) return;
  S.fechas.forEach(f=>S.tc[f]=v);
  S.asientos.forEach(a=>a.tc=S.tc[a.iso]||0);
  renderTC(); renderAsientos(); renderSum4();
});
$('#fFecha').addEventListener('change',renderAsientos);
$('#fComercio').addEventListener('change',renderAsientos);
$('#selAll').addEventListener('click',()=>{ visibles().forEach(a=>a.incluir=true); renderAsientos(); renderSum4(); });
$('#selNone').addEventListener('click',()=>{ visibles().forEach(a=>a.incluir=false); renderAsientos(); renderSum4(); });
$('#expandAll').addEventListener('click',()=>{
  const v=visibles();
  if(v.some(a=>!S.open.has(a.id))) v.forEach(a=>S.open.add(a.id)); else v.forEach(a=>S.open.delete(a.id));
  renderAsientos();
});
$('#dl').addEventListener('click',descargar);
wireCuentaHints();
})();
