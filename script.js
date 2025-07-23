const API_KEY = 'AIzaSyA8-FgSL0cbyX6ErwD37xY10zNUb0h2PTs';
const SPREADSHEET_ID = '1FWWZGmQWkaarAm0YJOKe7yI5kRB0YhiH';
const SHEET_NAME = 'GENERAL';
const SHEET_RANGE = `${SHEET_NAME}!A1:Z1000`;

document.addEventListener("DOMContentLoaded", function () {
  document.querySelector("button").addEventListener("click", buscar);
});

function buscar() {
  const valorBusqueda = document.getElementById("inputValor").value.trim();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_RANGE}?key=${API_KEY}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const rows = data.values;
      if (!rows || rows.length === 0) {
        mostrarMensaje("No se encontraron datos.");
        return;
      }

      const encabezados = rows[0];
      const resultados = rows.slice(1).filter(row => {
        const valorInventario = limpiarValor(row[9]); // Columna J
        return valorInventario.includes(valorBusqueda);
      });

      mostrarResultados(resultados, encabezados);
      mostrarResumen(rows.slice(1), encabezados);
    })
    .catch(error => {
      console.error('Error:', error);
      mostrarMensaje("Error al consultar los datos.");
    });
}

function limpiarValor(texto) {
  if (!texto) return '';
  return texto.replace(/[^0-9]/g, ''); // solo deja números
}

function mostrarResultados(filas, encabezados) {
  const cuerpo = document.getElementById("resultado");
  cuerpo.innerHTML = "";

  if (filas.length === 0) {
    cuerpo.innerHTML = `<tr><td colspan="5">No hay datos disponibles.</td></tr>`;
    return;
  }

  const colPerito = encabezados.indexOf("RECEPTOR /GRADO Y NOMBRES COMPLETOS");
  const colEstado = encabezados.indexOf("ESTADO");
  const colSumilla = encabezados.indexOf("FECHA DE SUMILLA");
  const colDocumento = encabezados.indexOf("DOCUMENTO DE SALIDA");
  const colAsunto = encabezados.indexOf("ASUNTO");

  filas.forEach(fila => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${fila[9] || ''}</td>
      <td>${fila[colPerito] || ''}</td>
      <td>${fila[colEstado] || ''}</td>
      <td>${fila[colSumilla] || ''}</td>
      <td>${fila[colDocumento] || ''}</td>
    `;
    cuerpo.appendChild(tr);
  });
}

function mostrarResumen(filas, encabezados) {
  const resumenDiv = document.getElementById("resumenPeritos");
  resumenDiv.innerHTML = "";

  const colPerito = encabezados.indexOf("RECEPTOR /GRADO Y NOMBRES COMPLETOS");
  const colEstado = encabezados.indexOf("ESTADO");
  const colFechaSumilla = encabezados.indexOf("FECHA DE SUMILLA");
  const colAsunto = encabezados.indexOf("ASUNTO");

  const pendientesPorPerito = {};
  const totalPorPerito = {};

  const hoy = new Date();

  filas.forEach(fila => {
    const perito = fila[colPerito]?.trim() || '';
    const estado = fila[colEstado]?.toUpperCase() || '';
    const asunto = fila[colAsunto]?.toUpperCase() || '';
    const fechaStr = fila[colFechaSumilla];

    if (!perito) return;

    totalPorPerito[perito] = (totalPorPerito[perito] || 0) + 1;

    if (
      asunto.includes("SOLICITUD DE INFORME INVESTIGATIVO") &&
      estado.includes("PENDIENTE") &&
      fechaStr
    ) {
      const partes = fechaStr.split('/');
      if (partes.length === 3) {
        const fechaSumilla = new Date(`${partes[2]}-${partes[1]}-${partes[0]}`);
        const diasTranscurridos = Math.floor((hoy - fechaSumilla) / (1000 * 60 * 60 * 24));
        if (diasTranscurridos > 30) {
          pendientesPorPerito[perito] = (pendientesPorPerito[perito] || 0) + 1;
        }
      }
    }
  });

  const tablaPendientes = generarTablaResumen(pendientesPorPerito, "INVESTIGACIONES PENDIENTES", "Pendientes");
  const tablaTotales = generarTablaResumen(totalPorPerito, "Total de pericias por perito", "Total");

  resumenDiv.appendChild(tablaPendientes);
  resumenDiv.appendChild(tablaTotales);
}

function generarTablaResumen(data, titulo, columnaValor) {
  const div = document.createElement("div");
  div.classList.add("mt-5");

  const encabezado = document.createElement("h4");
  encabezado.textContent = titulo;
  div.appendChild(encabezado);

  const tabla = document.createElement("table");
  tabla.classList.add("table", "table-bordered");

  tabla.innerHTML = `
    <thead class="table-secondary">
      <tr><th>#</th><th>Perito</th><th>${columnaValor}</th></tr>
    </thead>
    <tbody>
      ${Object.entries(data).map(([perito, valor], i) =>
        `<tr><td>${i + 1}</td><td>${perito}</td><td>${valor}</td></tr>`).join("")}
    </tbody>
  `;

  div.appendChild(tabla);
  return div;
}

function mostrarMensaje(mensaje) {
  const cuerpo = document.getElementById("resultado");
  cuerpo.innerHTML = `<tr><td colspan="5">${mensaje}</td></tr>`;
}
