/* Acceso compartido por todas las páginas (menú y sistemas).
   Muestra la pantalla de inicio de sesión de Firebase Authentication y, cuando hay una sesión
   válida, llama una sola vez a window.montarApp(usuario), que cada página define. Antes de eso
   la página solo contiene el acceso. También cierra la sesión por inactividad.
   La configuración la entrega Firebase Hosting en /__/firebase/init.json (no se guarda en el código).
   Las cuentas se crean en la consola de Firebase → Authentication → Usuarios. */
(function(){
"use strict";
const $ = s => document.querySelector(s);

const ESTILOS_ACCESO = `
.login, .login *{box-sizing:border-box}
.login h1, .login h2, .login p{font-family:inherit}
body[data-acceso="dentro"] .login{display:none}
.login{
  position:fixed; inset:0; z-index:100; overflow:auto;
  display:grid; grid-template-columns:minmax(0,1fr) minmax(320px,460px); align-items:center;
  background:#0b2e59 url(/img/hotel.jpg) center/cover no-repeat;
  font-family:"IBM Plex Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; color:#1a2533;
}
.login::before{
  content:""; position:fixed; inset:0;
  background:linear-gradient(105deg, rgba(6,22,46,.86) 0%, rgba(6,22,46,.55) 52%, rgba(6,22,46,.72) 100%);
}
.login-hero{position:relative; align-self:end; padding:0 48px 56px; color:#fff; max-width:620px}
.login-hero .kicker{font-size:12px; letter-spacing:.18em; text-transform:uppercase; color:#c9d6e8; margin:0 0 10px}
.login-hero h2{font-size:clamp(26px,3.4vw,40px); line-height:1.12; letter-spacing:-.02em; font-weight:600; margin:0 0 12px; text-wrap:balance}
.login-hero p{margin:0; color:#dbe4f0; font-size:15px; max-width:46ch}
.login-card{
  position:relative; margin:32px 40px 32px 0; padding:28px 28px 22px;
  background:rgba(255,255,255,.97); border-radius:16px;
  box-shadow:0 24px 60px -20px rgba(0,0,0,.55), 0 2px 6px rgba(0,0,0,.12);
}
.login-logo{display:block; margin:0 0 22px; background:#f6f0e9; border-radius:10px; overflow:hidden; border:1px solid #e7ddd1}
.login-logo img{display:block; width:100%; height:auto; clip-path:inset(0 3px)}
.login-card h1{font-size:24px; letter-spacing:-.02em; font-weight:600; margin:0 0 4px}
.login-card .sub{margin:0 0 20px; color:#4f5d6e; font-size:14px}
.login-card fieldset{border:0; padding:0; margin:0; min-width:0}
.login-card label.f{display:block; font-size:12px; font-weight:600; color:#4f5d6e; margin:0 0 6px}
.login-card .campo{position:relative; margin-bottom:14px}
.login-card input[type=email], .login-card input[type=password], .login-card input[type=text]{
  width:100%; font:inherit; font-size:15px; color:#1a2533; background:#fff;
  border:1px solid #c9d2dd; border-radius:9px; padding:11px 12px; outline:none;
  transition:border-color .15s, box-shadow .15s;
}
.login-card input:focus{border-color:#0b4f9c; box-shadow:0 0 0 3px rgba(11,79,156,.16)}
.login-card .campo.pw input{padding-right:84px}
.login-card .ver{
  position:absolute; right:6px; bottom:6px; font:inherit; font-size:12.5px; font-weight:600;
  color:#0b4f9c; background:none; border:0; border-radius:6px; padding:6px 8px; cursor:pointer;
}
.login-card .fila{display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; margin:2px 0 18px}
.login-card .recordar{display:flex; align-items:center; gap:7px; font-size:13px; color:#4f5d6e; cursor:pointer}
.login-card .recordar input{accent-color:#0b4f9c; margin:0}
.login-card .link{font:inherit; font-size:13px; font-weight:600; color:#0b4f9c; background:none; border:0; padding:0; cursor:pointer}
.login-card .link:hover{text-decoration:underline}
.login-card .entrar{
  width:100%; font:inherit; font-size:15px; font-weight:600; color:#fff; cursor:pointer;
  background:#0b4f9c; border:0; border-radius:9px; padding:12px 16px; transition:filter .15s;
}
.login-card .entrar:hover:not(:disabled){filter:brightness(1.1)}
.login-card .entrar:disabled{opacity:.6; cursor:progress}
.login-msg{min-height:1.4em; margin:12px 0 0; font-size:13px; color:#a02f22}
.login-msg.ok{color:#17764a}
.login-pie{margin:16px 0 0; padding-top:14px; border-top:1px solid #e6eaef; font-size:11.5px; color:#7d8a9a; text-align:center}
@media (max-width:860px){
  .login{grid-template-columns:1fr; align-items:start}
  .login-hero{display:none}
  .login-card{margin:24px 16px; padding:22px 18px 18px}
}
`;
const ACCESO = `
<div class="login" id="login">
  <section class="login-hero">
    <p class="kicker">Swissôtel Lima · Contabilidad</p>
    <h2>Liquidación VISA → SAP</h2>
    <p>Convierta la liquidación de tarjetas de Izipay en asientos listos para SAP Business One, en minutos.</p>
  </section>
  <main class="login-card">
    <picture class="login-logo">
      <source srcset="/img/logo-swissotel-30.png" media="(prefers-reduced-motion: reduce)">
      <img src="/img/logo-swissotel-30.gif" width="750" height="155" alt="Swissôtel Lima · 30 años">
    </picture>
    <h1>Bienvenido nuevamente</h1>
    <p class="sub">Ingrese con su cuenta para continuar.</p>
    <form id="loginForm" novalidate>
      <fieldset id="loginCampos" disabled>
        <div class="campo">
          <label class="f" for="loginEmail">Correo</label>
          <input type="email" id="loginEmail" autocomplete="username" placeholder="nombre@empresa.com" required>
        </div>
        <div class="campo pw">
          <label class="f" for="loginClave">Contraseña</label>
          <input type="password" id="loginClave" autocomplete="current-password" required>
          <button class="ver" type="button" id="verClave" aria-label="Mostrar contraseña">Mostrar</button>
        </div>
        <div class="fila">
          <label class="recordar"><input type="checkbox" id="recordar" checked> Mantener la sesión iniciada</label>
          <button class="link" type="button" id="olvide">¿Olvidó su contraseña?</button>
        </div>
        <button class="entrar" type="submit" id="entrar">Verificando sesión…</button>
      </fieldset>
      <p class="login-msg" id="loginMsg" role="alert"></p>
    </form>
    <p class="login-pie">Acceso restringido al personal autorizado.</p>
  </main>
</div>`;

document.head.appendChild(Object.assign(document.createElement('style'), { textContent: ESTILOS_ACCESO }));
document.body.insertAdjacentHTML('beforeend', ACCESO);
document.body.dataset.acceso = 'cargando';

// SDK servido desde este mismo sitio (public/vendor), sin depender de un CDN externo.
const SDK = '/vendor/';
const INACTIVIDAD_MIN = 20;   // minutos sin usar la página antes de cerrar la sesión
const ERRORES = {
  'auth/invalid-credential':'Correo o contraseña incorrectos.',
  'auth/invalid-login-credentials':'Correo o contraseña incorrectos.',
  'auth/wrong-password':'Correo o contraseña incorrectos.',
  'auth/user-not-found':'Correo o contraseña incorrectos.',
  'auth/invalid-email':'El correo no es válido.',
  'auth/missing-password':'Escriba su contraseña.',
  'auth/user-disabled':'Esta cuenta está desactivada. Consulte con el administrador.',
  'auth/too-many-requests':'Demasiados intentos. Espere unos minutos e intente de nuevo.',
  'auth/network-request-failed':'Sin conexión. Revise su internet e intente de nuevo.',
  'auth/operation-not-allowed':'El acceso con correo y contraseña no está habilitado en Firebase.',
  'auth/configuration-not-found':'El acceso con correo y contraseña no está habilitado en Firebase.',
};
const msg = (t, ok) => { const m=$('#loginMsg'); m.textContent=t||''; m.className='login-msg'+(ok?' ok':''); };
const textoError = e => ERRORES[e && e.code] || 'No se pudo iniciar sesión. Intente de nuevo.';
const boton = $('#entrar');

$('#verClave').addEventListener('click', () => {
  const i=$('#loginClave'), ver=i.type==='password';
  i.type = ver ? 'text' : 'password';
  $('#verClave').textContent = ver ? 'Ocultar' : 'Mostrar';
  $('#verClave').setAttribute('aria-label', ver ? 'Ocultar contraseña' : 'Mostrar contraseña');
});

async function iniciar(){
  let auth, A;
  try{
    const [cfg, appMod, authMod] = await Promise.all([
      fetch('/__/firebase/init.json').then(r => { if(!r.ok) throw new Error('init'); return r.json(); }),
      import(SDK+'firebase-app-12.19.0.js'),
      import(SDK+'firebase-auth-12.19.0.js'),
    ]);
    A = authMod;
    auth = A.getAuth(appMod.initializeApp(cfg));
    auth.languageCode = 'es';
  }catch(e){
    document.body.dataset.acceso = 'fuera';
    boton.textContent = 'Ingresar';
    msg('No se pudo conectar con el servicio de acceso. Revise su conexión y recargue la página.');
    return;
  }

  let montada = false, saliendo = false;   // saliendo: botón Salir (vuelve al menú)
  const salir = motivo => {
    try{ if(motivo) sessionStorage.setItem('motivoSalida', motivo); }catch(e){}
    return A.signOut(auth);
  };
  try{
    if(sessionStorage.getItem('motivoSalida')==='inactividad') msg('Su sesión se cerró por inactividad. Ingrese de nuevo.');
    sessionStorage.removeItem('motivoSalida');
  }catch(e){}

  A.onAuthStateChanged(auth, u => {
    if(!u){
      // Sesión cerrada (Salir, inactividad, otra pestaña o cuenta desactivada): recargar borra los datos de la pantalla.
      if(montada){ if(saliendo) location.replace('/'); else location.reload(); return; }
      document.body.dataset.acceso = 'fuera';
      $('#loginCampos').disabled = false;
      boton.textContent = 'Ingresar';
      setTimeout(() => $('#loginEmail').focus(), 0);
      return;
    }
    if(!montada){
      if(typeof window.montarApp === 'function') window.montarApp(u);
      montada = true;
      const bSalir = $('#salirBtn');
      if(bSalir) bSalir.addEventListener('click', () => { saliendo = true; salir(); });
      vigilarInactividad(() => salir('inactividad'));
    }
    const mail = $('#userMail');
    if(mail){ mail.textContent = u.email || ''; mail.title = u.email || ''; }
    document.body.dataset.acceso = 'dentro';
  });

  $('#loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const email=$('#loginEmail').value.trim(), clave=$('#loginClave').value;
    if(!email){ msg('Escriba su correo.'); $('#loginEmail').focus(); return; }
    if(!clave){ msg('Escriba su contraseña.'); $('#loginClave').focus(); return; }
    msg(''); $('#loginCampos').disabled = true; boton.textContent = 'Ingresando…';
    try{
      await A.setPersistence(auth, $('#recordar').checked ? A.browserLocalPersistence : A.browserSessionPersistence);
      await A.signInWithEmailAndPassword(auth, email, clave);
      $('#loginClave').value = '';
    }catch(err){
      msg(textoError(err));
      $('#loginCampos').disabled = false; boton.textContent = 'Ingresar';
      $('#loginClave').select();
    }
  });

  $('#olvide').addEventListener('click', async () => {
    const email=$('#loginEmail').value.trim();
    if(!email){ msg('Escriba su correo y vuelva a pulsar «¿Olvidó su contraseña?».'); $('#loginEmail').focus(); return; }
    try{
      await A.sendPasswordResetEmail(auth, email);
      msg('Si el correo está registrado, recibirá un enlace para crear una nueva contraseña.', true);
    }catch(err){
      msg(err && err.code==='auth/invalid-email' ? ERRORES['auth/invalid-email'] : 'No se pudo enviar el correo. Intente de nuevo.');
    }
  });
}

// Cierra la sesión tras INACTIVIDAD_MIN minutos sin teclado, mouse ni toque. Se compara la hora
// en lugar de usar un solo temporizador, para que también funcione si el equipo se suspende.
function vigilarInactividad(alVencer){
  let ultimo = Date.now();
  const marcar = () => { ultimo = Date.now(); };
  ['pointerdown','keydown','wheel','touchstart','scroll'].forEach(ev => addEventListener(ev, marcar, {passive:true, capture:true}));
  const revisar = () => { if(Date.now() - ultimo > INACTIVIDAD_MIN*60000){ clearInterval(id); alVencer(); } };
  const id = setInterval(revisar, 30000);
  document.addEventListener('visibilitychange', () => { if(!document.hidden) revisar(); });
}
iniciar();
})();
