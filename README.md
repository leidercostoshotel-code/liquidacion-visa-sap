# Liquidación VISA → SAP

Convierte el Excel de liquidación de tarjetas de Izipay en la pestaña **SAP** lista para
importar a SAP Business One. Una sola página, sin servidor ni instalación: se publica en
Firebase Hosting.

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

## Opciones de exportación

- Fila en blanco entre asientos.
- Separar socio de negocios y documento en sus propias columnas.
- Llenar `Fecha Registro Ventas` con la fecha de abono.
- Filtrar por fecha de abono o comercio y exportar solo los asientos marcados.

## Tecnología

HTML, CSS y JavaScript sin framework. La única dependencia es
[xlsx-js-style](https://github.com/gitbrent/xlsx-js-style) 1.2.0 (SheetJS 0.18.5 con
soporte de colores y formatos), cargada desde CDN, para leer y escribir el `.xlsx`.
Ningún dato sale del navegador: todo el procesamiento es local.

## Estructura

```
.firebaserc           proyecto de Firebase por defecto (liquidacion-sap)
firebase.json         configuración de Firebase Hosting (publica la carpeta public/)
public/index.html     página mínima: carga SheetJS y app.js
public/app.js         la aplicación completa: estilos, interfaz y lógica
public/img/           logo animado de Swissôtel Lima 30 años (.gif) y su versión fija (.png)
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
