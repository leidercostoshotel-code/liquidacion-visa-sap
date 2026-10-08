/* Menú de sistemas: después de iniciar sesión, el usuario elige a qué sistema entrar.
   El acceso lo maneja /comun/acceso.js, que llama a window.montarApp() con la sesión iniciada. */
const ESTILOS_MENU = `
*{box-sizing:border-box}
body{
  margin:0; min-height:100vh; background:#f3f5f8; color:#1a2533;
  font-family:"IBM Plex Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  font-size:14.5px; line-height:1.5;
}
.m-top{background:#0b2e59; color:#fff}
.m-top-in{max-width:1040px; margin:0 auto; padding:10px 16px; display:flex; align-items:center; gap:14px; flex-wrap:wrap}
.m-brand{font-weight:600; font-size:15.5px; letter-spacing:-.015em}
.m-brand span{font-weight:400; color:#a9bdd6; font-size:12px; margin-left:8px}
.m-sp{flex:1 1 auto}
.userchip{font-size:12px; color:#a9bdd6; max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap}
.m-btn{
  font:inherit; font-size:12.5px; font-weight:500; color:#fff; cursor:pointer;
  background:transparent; border:1px solid rgba(255,255,255,.4); border-radius:7px; padding:5px 12px;
}
.m-btn:hover{border-color:#fff}
.m-main{max-width:1040px; margin:0 auto; padding:36px 16px 56px}
.m-head{display:flex; align-items:center; justify-content:space-between; gap:20px 32px; flex-wrap:wrap; margin-bottom:28px}
.m-head h1{font-size:clamp(26px,4vw,34px); line-height:1.15; letter-spacing:-.025em; font-weight:600; margin:0 0 6px}
.m-head p{margin:0; color:#4f5d6e; font-size:15px}
.m-logo{flex:0 1 340px; margin:0; background:#f6f0e9; border:1px solid #d6dde6; border-radius:12px; overflow:hidden;
  box-shadow:0 1px 2px rgba(20,34,42,.07), 0 6px 18px -12px rgba(20,34,42,.28)}
.m-logo img{display:block; width:100%; height:auto; clip-path:inset(0 3px)}
.m-grid{display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:18px}
.m-card{
  display:flex; flex-direction:column; gap:10px; text-decoration:none; color:inherit;
  background:#fff; border:1px solid #d6dde6; border-radius:14px; padding:24px 24px 20px;
  box-shadow:0 1px 2px rgba(20,34,42,.07), 0 6px 18px -12px rgba(20,34,42,.28);
  transition:transform .15s, box-shadow .15s, border-color .15s;
}
.m-card:hover, .m-card:focus-visible{transform:translateY(-3px); border-color:#a3c1e6;
  box-shadow:0 2px 4px rgba(20,34,42,.08), 0 18px 34px -16px rgba(11,46,89,.45); outline:none}
.m-ico{width:46px; height:46px; border-radius:12px; display:grid; place-items:center; background:#e4eef9; color:#0b4f9c}
.m-ico svg{width:24px; height:24px}
.m-card h2{margin:4px 0 0; font-size:19px; letter-spacing:-.015em; font-weight:600}
.m-card p{margin:0; color:#4f5d6e; font-size:14px; flex:1}
.m-card .ir{margin-top:6px; font-weight:600; font-size:14px; color:#0b4f9c}
.m-pie{margin-top:36px; font-size:11.5px; color:#7d8a9a}
@media (max-width:640px){ .m-logo{flex-basis:100%; order:-1} .userchip{display:none} }
@media (prefers-reduced-motion: reduce){ .m-card{transition:none} }
`;

const MENU = `
<header class="m-top">
  <div class="m-top-in">
    <div class="m-brand">Sistemas contables<span>Swissôtel Lima</span></div>
    <div class="m-sp"></div>
    <span class="userchip" id="userMail"></span>
    <button class="m-btn" id="salirBtn" type="button" title="Cerrar sesión">Salir</button>
  </div>
</header>
<main class="m-main">
  <div class="m-head">
    <div>
      <h1>Bienvenido nuevamente</h1>
      <p>¿A qué sistema desea ingresar?</p>
    </div>
    <picture class="m-logo">
      <source srcset="/img/logo-swissotel-30.png" media="(prefers-reduced-motion: reduce)">
      <img src="/img/logo-swissotel-30.gif" width="750" height="155" alt="Swissôtel Lima · 30 años">
    </picture>
  </div>
  <nav class="m-grid" aria-label="Sistemas">
    <a class="m-card" href="/liquidacion/">
      <span class="m-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6.5 15h4"/></svg></span>
      <h2>Liquidación VISA → SAP</h2>
      <p>Convierte la liquidación de tarjetas de Izipay en los asientos de SAP Business One, con Excel y copia por asiento.</p>
      <span class="ir">Ingresar →</span>
    </a>
    <a class="m-card" href="/impresoras/">
      <span class="m-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 8V3.5h10V8"/><rect x="3" y="8" width="18" height="9" rx="2"/><path d="M7 14h10v6.5H7z"/><path d="M17.5 11h.01"/></svg></span>
      <h2>Alquiler de Impresoras</h2>
      <p>Cuadro de consumo Reprodata: importa el PDF del proveedor, valida contadores contra el mes anterior y genera el asiento SAP.</p>
      <span class="ir">Ingresar →</span>
    </a>
  </nav>
  <p class="m-pie">Leider Tisnado Mego · Soluciones Digitales · Versión 10</p>
</main>
`;

window.montarApp = function(){
  document.head.appendChild(Object.assign(document.createElement('style'), { textContent: ESTILOS_MENU }));
  document.body.insertAdjacentHTML('afterbegin', MENU);
};
