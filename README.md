# Sistemas contables · Swissôtel Lima

Sitio en Firebase Hosting con inicio de sesión y un menú para elegir el sistema:

| Ruta | Sistema |
| --- | --- |
| `/` | Acceso y menú de sistemas |
| `/liquidacion/` | **Liquidación VISA → SAP**: convierte el Excel de liquidación de tarjetas de Izipay en la pestaña SAP lista para importar a SAP Business One |
| `/impresoras/` | **Alquiler de Impresoras**: cuadro de consumo Reprodata (creado por Olinda Orellana). Importa el PDF mensual del proveedor, valida los contadores contra el mes anterior, mantiene el maestro de impresoras y genera el asiento SAP |

Todas las páginas comparten el acceso (`public/comun/acceso.js`): sin sesión muestran la
pantalla de inicio de sesión y, al entrar, montan su sistema. Los botones **Menú** y **Salir**
están en la barra superior de cada sistema.

El sistema de impresoras guarda el histórico de meses y el maestro de impresoras en el
navegador (`localStorage`), igual que el archivo original: cada equipo tiene su propio
histórico; use *Exportar maestro* para respaldarlo o pasarlo a otra PC.

## Agregar un sistema nuevo al menú

1. Crear su carpeta en `public/`, por ejemplo `public/horarios/`, con:
   - `index.html` mínimo: copiar el de `public/impresoras/` y cambiar el título y su `app.js`.
     Debe cargar `/comun/acceso.js` al final para tener el mismo inicio de sesión.
   - `app.js` que defina `window.montarApp = function(){ ... }`: inyecta sus estilos y su
     interfaz y arranca su lógica. Para tener **← Menú** y **Salir**, incluir en su barra un
     enlace a `/` y un botón con `id="salirBtn"` (y opcionalmente `<span id="userMail">`).
2. Añadir una entrada a `SISTEMAS` en `public/menu.js` con nombre, ruta, descripción, color
   (amarillo, turquesa, rosa, celeste, naranja, morado) e ícono. La tarjeta aparece sola.
3. Si usa librerías externas, copiarlas a `public/vendor/` (la política de seguridad solo
   permite scripts del propio sitio).

## Liquidación VISA → SAP

## Acceso

La aplicación pide iniciar sesión con correo y contraseña (Firebase Authentication del
proyecto `liquidacion-sap`). No hay registro público: las cuentas las crea el administrador.

1. Consola de Firebase → **Authentication** → **Método de acceso** → habilitar
   **Correo electrónico/contraseña** (una sola vez).
2. **Authentication** → **Usuarios** → **Agregar usuario** con el correo y una contraseña
   inicial para cada persona.

En la pantalla de acceso, «¿Olvidó su contraseña?» envía un enlace de restablecimiento al
correo escrito, y «Mantener la sesión iniciada» guarda la sesión en ese navegador. El botón
**Salir** cierra la sesión y limpia la pantalla. La configuración de Firebase la entrega
Hosting en `/__/firebase/init.json`, por eso el acceso solo funciona publicado en Firebase o
con `firebase serve`, no abriendo el archivo directamente.

## Seguridad

- **Solo cuentas creadas en Firebase.** La interfaz y la lógica de la aplicación se montan en
  la página únicamente después de iniciar sesión; antes solo existe la pantalla de acceso.
- **Sin registro abierto.** Firebase permite, por defecto, que cualquiera cree una cuenta con
  la clave pública del proyecto. Hay que desactivarlo en la consola: Authentication →
  Configuración → Acciones del usuario → desmarcar «Habilitar creación (registro)». Si la
  opción no aparece, está en Google Cloud → Identity Platform → Configuración.
- **Cierre por inactividad.** La sesión se cierra a los 20 minutos sin uso
  (`INACTIVIDAD_MIN` en `comun/acceso.js`), y al salir se recarga la página para borrar los datos.
- **Sin dependencias de CDN.** La librería de Excel y el SDK de Firebase se sirven desde
  `public/vendor/` (ver `LICENCIAS.txt`), así que solo se ejecuta código de este sitio.
- **Cabeceras de seguridad** en `firebase.json`: Content-Security-Policy (`script-src 'self'`,
  conexiones solo a los servicios de acceso de Google), prohibición de mostrarse dentro de
  otro sitio (`frame-ancestors 'none'`, `X-Frame-Options`), HSTS, `nosniff` y `noindex` para
  que los buscadores no la indexen.
- **Firestore cerrado.** `firestore.rules` niega toda lectura y escritura; se publica con
  `firebase deploy --only firestore:rules --project liquidacion-sap`.
- **Los datos de la liquidación nunca salen del navegador**: el Excel se procesa en el equipo
  del usuario y no se sube a ningún servidor.

Límite a tener en cuenta: un sitio de Firebase Hosting no puede exigir sesión para entregar
sus archivos, así que el código de los sistemas sigue siendo descargable por quien conozca la dirección (y el
repositorio de GitHub es público). Lo que contiene es la herramienta, las cuentas contables
por defecto y, en el sistema de impresoras, el maestro original (ubicaciones, IP internas,
cuentas y centros de costo); no contiene datos de liquidaciones ni PDFs. Para ocultar el
código, poner el repositorio como privado en GitHub.

## Qué hace

1. **Lee el Excel.** Detecta sola la hoja que contiene la columna `COMERCIO/CADENA` y usa
   la hoja `Datos` como catálogo de cuentas para los nombres.
2. **Agrupa las liquidaciones** por comercio y fecha de abono, separadas por las filas en
   blanco del reporte.
3. **Arma el asiento** de cada liquidación: crédito del importe bruto, débito de la comisión
   con su centro de costo y débito del neto a la cuenta del banco.
4. **Convierte a moneda local** con un tipo de cambio por cada fecha de abono.
5. **Exporta** un `.xlsx` con dos hojas:
   - `SAP`: las 22 columnas para importar, importes como texto con prefijo de moneda
     (`USD 990.00`, `SOL 3,514.50`). Encabezado azul, cada asiento en su propio color de
     banda, débitos en azul y créditos en morado. Los estilos no cambian ningún valor.
   - `Resumen`: un asiento por fila con número, fecha de abono en formato de fecha,
     comercio, importes con separador de miles, tipo de cambio, estado de cuadre y totales
     con fórmulas.

## Cómo decide la cuenta de crédito

| Caso | Cuenta |
| --- | --- |
| El grupo trae la etiqueta `ANTICIPO RECIBIDO` | cuenta de anticipo (121111101 por defecto) |
| La etiqueta es un nombre con documento, ej. `MARTA FRUCTOS 01-F005-0004434` | cuenta de cliente (102111101 por defecto) |
| El grupo no trae etiqueta | cuenta configurada para ese comercio |

Las etiquetas se emparejan por posición con las transacciones del grupo, y las líneas que
comparten cuenta y glosa se consolidan en una sola.

## Cálculo de la comisión

La comisión del asiento es **importe bruto − importe neto**, no `COMISIÓN TOTAL + IGV`.

Ambas fórmulas coinciden en las liquidaciones normales. Se separan cuando el grupo incluye
una devolución: ahí el reporte revierte la comisión cobrada sin declararla en ninguna
columna, y solo la diferencia bruto − neto deja el asiento cuadrado. La aplicación avisa en
esos grupos y muestra las dos cifras.

Los importes en moneda local se redondean a dos decimales. La opción *Ajustar el redondeo en
la línea del banco* traslada a esa línea la diferencia de céntimos para que débitos y
créditos cuadren exactamente.

## Copiar un asiento para pegarlo en SAP

Cada asiento del paso 4 tiene el botón **Copiar**: copia sus líneas sin encabezado, con las
mismas columnas y valores que la hoja `SAP`, separadas por tabulador como al copiar desde
Excel. El asiento copiado queda en verde; si después cambia (tipo de cambio, importes,
cuentas), vuelve a su color normal para indicar que hay que copiarlo de nuevo. El botón se
desactiva mientras falte el tipo de cambio de esa fecha.

## Opciones de exportación

- Fila en blanco entre asientos.
- Separar socio de negocios y documento en sus propias columnas.
- Llenar `Fecha Registro Ventas` con la fecha de abono.
- Filtrar por fecha de abono o comercio y exportar solo los asientos marcados.

## Tecnología

HTML, CSS y JavaScript sin framework. Dependencias, servidas desde `public/vendor/`:
[xlsx-js-style](https://github.com/gitbrent/xlsx-js-style) 1.2.0 (SheetJS 0.18.5 con
soporte de colores y formatos) para leer y escribir el `.xlsx`, y el SDK web de Firebase
12.19.0 (`firebase-app` y `firebase-auth`) para el acceso.
Ningún dato sale del navegador: todo el procesamiento es local.

## Estructura

```
.firebaserc           proyecto de Firebase por defecto (liquidacion-sap)
firebase.json         Firebase Hosting (carpeta public/ y cabeceras de seguridad) y reglas de Firestore
firestore.rules       reglas de Firestore: niegan todo acceso
public/index.html     menú de sistemas (página mínima, carga menu.js y el acceso)
public/menu.js        estilos y tarjetas del menú
public/comun/acceso.js  inicio de sesión, cierre por inactividad y salida, compartidos
public/liquidacion/   Liquidación VISA → SAP: index.html mínimo y app.js con estilos, interfaz y lógica
public/impresoras/    Alquiler de Impresoras: index.html mínimo y app.js con estilos, interfaz y lógica
public/img/           logo animado de Swissôtel Lima 30 años (.gif), su versión fija (.png) y la foto del hotel para el acceso
public/vendor/        librería de Excel, PDF.js y SDK de Firebase, con sus licencias
public/favicon.ico    íconos de la pestaña (16, 32 y 48 px), más favicon-32.png y apple-touch-icon.png
```

## Publicar en Firebase

Requiere [Firebase CLI](https://firebase.google.com/docs/cli) (`npm install -g firebase-tools`).

```
firebase login
firebase deploy --only hosting
```

La página queda en https://liquidacion-sap.web.app. `firebase.json` fija el sitio `liquidacion-sap`: si la
CLI apunta a otro proyecto, el deploy falla en lugar de publicar en un sitio ajeno.
Para ver el proyecto activo: `firebase use`; para corregirlo: `firebase use liquidacion-sap`. Para probar en local antes de publicar:
`firebase serve --only hosting`.

---

Leider Tisnado Mego · Soluciones Digitales
