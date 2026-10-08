/* Menú de sistemas: después de iniciar sesión, el usuario elige a qué sistema entrar.
   El acceso lo maneja /comun/acceso.js, que llama a window.montarApp() con la sesión iniciada.

   PARA AGREGAR UN SISTEMA NUEVO: crear su carpeta en public/ (index.html mínimo + app.js con
   window.montarApp) y añadir una entrada a SISTEMAS. La tarjeta aparece sola en el menú.
   Colores disponibles: amarillo, turquesa, rosa, celeste, naranja, morado.
   Íconos disponibles: tarjeta, impresora, reloj, documento, regalo, cronometro, basura, calendario. */
const SISTEMAS = [
  { nombre:'Liquidación VISA → SAP', ruta:'/liquidacion/', color:'amarillo', icono:'tarjeta',
    descripcion:'Liquidación de tarjetas de Izipay: asientos para SAP Business One, Excel y copia por asiento.' },
  { nombre:'Alquiler de Impresoras', ruta:'/impresoras/', color:'turquesa', icono:'impresora',
    descripcion:'Cuadro de consumo Reprodata: importa el PDF del proveedor, valida contadores y genera el asiento SAP.' },
];

const COLORES = {
  amarillo:'#ffd43b', turquesa:'#7fdcc5', rosa:'#f7a8d0', celeste:'#8ec9f0', naranja:'#f5a65b', morado:'#9d8cf7',
};
const ICONOS = {
  tarjeta:'<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6.5 15h4"/>',
  impresora:'<path d="M7 8V3.5h10V8"/><rect x="3" y="8" width="18" height="9" rx="2"/><path d="M7 14h10v6.5H7z"/><path d="M17.5 11h.01"/>',
  reloj:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  documento:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v2h6V3M9 10h6M9 14h6M9 18h4"/>',
  regalo:'<rect x="3.5" y="8" width="17" height="4" rx="1"/><path d="M5 12v8h14v-8M12 8v12M12 8c-2-3.5-6-3-5 0M12 8c2-3.5 6-3 5 0"/>',
  cronometro:'<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 1.5M10 2.5h4M12 2.5V6"/>',
  basura:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',
  calendario:'<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
};

const ESTILOS_MENU = `
*{box-sizing:border-box}
body{
  margin:0; min-height:100vh; color:#e6edf7;
  font-family:"IBM Plex Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  font-size:14.5px; line-height:1.5; background:#0b1730;
}
/* Foto fija detrás del contenido (un elemento fijo, porque iPhone ignora background-attachment:fixed). */
body::before{
  content:""; position:fixed; inset:0; z-index:0; pointer-events:none;
  background:
    linear-gradient(180deg, rgba(9,21,44,.72) 0%, rgba(9,21,44,.80) 45%, rgba(7,16,34,.92) 100%),
    url(/img/hotel.jpg) center/cover no-repeat;
}
.m-sesion{position:fixed; top:14px; right:16px; z-index:2; display:flex; align-items:center; gap:10px}
.userchip{font-size:12px; color:#b8c7dc; max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap}
.m-btn{
  font:inherit; font-size:12.5px; font-weight:600; color:#fff; cursor:pointer;
  background:rgba(255,255,255,.10); border:1px solid rgba(255,255,255,.28); border-radius:9px; padding:6px 14px;
  backdrop-filter:blur(6px);
}
.m-btn:hover{background:rgba(255,255,255,.2)}
.m-main{position:relative; z-index:1; max-width:1160px; margin:0 auto; padding:64px 20px 48px; text-align:center}
.m-logo{display:block; width:min(480px,100%); margin:0 auto 26px; background:#f6f0e9; border-radius:12px; overflow:hidden;
  box-shadow:0 18px 40px -18px rgba(0,0,0,.7)}
.m-logo img{display:block; width:100%; height:auto; clip-path:inset(0 3px)}
.m-kicker{margin:0 0 10px; font-size:12.5px; font-weight:600; letter-spacing:.28em; text-transform:uppercase; color:#c3d0e2;
  display:inline-flex; align-items:center; gap:12px}
.m-kicker::before{content:""; width:8px; height:8px; border-radius:50%; background:#ffd43b; box-shadow:0 0 0 4px rgba(255,212,59,.18)}
.m-main h1{margin:0 0 12px; font-size:clamp(32px,5.2vw,50px); line-height:1.08; letter-spacing:-.03em; font-weight:700; color:#fff}
.m-sub{margin:0 auto 44px; max-width:52ch; color:#b8c7dc; font-size:16px}
.m-grid{display:flex; flex-wrap:wrap; justify-content:center; gap:26px; text-align:left}
.m-card{
  --c:#ffd43b;
  flex:0 1 348px; display:flex; flex-direction:column; gap:12px; text-decoration:none; color:inherit;
  background:rgba(14,28,58,.74); border:1px solid rgba(255,255,255,.12); border-radius:20px; padding:32px 32px 30px;
  backdrop-filter:blur(8px); box-shadow:0 20px 40px -24px rgba(0,0,0,.8);
  transition:transform .18s, border-color .18s, background .18s;
}
.m-card:hover, .m-card:focus-visible{transform:translateY(-4px); border-color:color-mix(in srgb, var(--c) 55%, transparent);
  background:rgba(18,36,72,.84); outline:none}
.m-ico{width:58px; height:58px; border-radius:14px; display:grid; place-items:center; background:var(--c); color:#0b1730; margin-bottom:8px}
.m-ico svg{width:28px; height:28px}
.m-card h2{margin:0; font-size:22px; letter-spacing:-.02em; font-weight:700; color:#fff}
.m-card p{margin:0; color:#b8c7dc; font-size:15px; flex:1}
.m-card .ir{margin-top:8px; font-weight:700; font-size:13px; letter-spacing:.2em; text-transform:uppercase; color:var(--c)}
.m-pie{position:relative; z-index:1; margin:44px 0 0; font-size:11.5px; color:#8ea3bd}
.m-pie a{color:#cfe0f5; text-decoration:none; border-bottom:1px solid rgba(207,224,245,.35)}
.m-pie a:hover{color:#fff; border-bottom-color:#fff}
@media (max-width:640px){
  .m-main{padding-top:68px}
  .m-card{flex-basis:100%; padding:26px 24px 24px}
  .userchip{display:none}
}
@media (prefers-reduced-motion: reduce){ .m-card{transition:none} }
`;

const esc = t => String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const tarjeta = s => `
    <a class="m-card" href="${esc(s.ruta)}" style="--c:${COLORES[s.color] || COLORES.amarillo}">
      <span class="m-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${ICONOS[s.icono] || ICONOS.documento}</svg></span>
      <h2>${esc(s.nombre)}</h2>
      <p>${esc(s.descripcion)}</p>
      <span class="ir">Entrar →</span>
    </a>`;

const MENU = `
<div class="m-sesion">
  <span class="userchip" id="userMail"></span>
  <button class="m-btn" id="salirBtn" type="button" title="Cerrar sesión">Salir</button>
</div>
<main class="m-main">
  <picture class="m-logo">
    <img src="/img/logo-swissotel-30.gif" width="750" height="155" alt="Swissôtel Lima · 30 años">
  </picture>
  <p class="m-kicker">Swissôtel Lima</p>
  <h1>Sistemas internos</h1>
  <p class="m-sub">Elige a qué sistema quieres entrar.</p>
  <nav class="m-grid" aria-label="Sistemas">${SISTEMAS.map(tarjeta).join('')}
  </nav>
  <p class="m-pie">Powered by <a href="https://leidertisnado.com/" target="_blank" rel="noopener noreferrer">leidertisnado.com</a> · Versión 14</p>
</main>
`;

window.montarApp = function(){
  document.head.appendChild(Object.assign(document.createElement('style'), { textContent: ESTILOS_MENU }));
  document.body.insertAdjacentHTML('afterbegin', MENU);
};
