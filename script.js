const API_KEY = "AIzaSyDBaH3K0-RxZ-iqTxkkKsgC_QnRnmbYh6M";
const SHEET_ID = "1FWWZGmQWkaarAm0YJOKe7yI5kRB0YhiH";
const SHEET_NAME = "GENERAL";

const URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?alt=json&key=${API_KEY}`;

async function buscar() {
  const input = document.getElementById("inputValor").value.trim();
  const response = await fetch(URL);
  const data = await response.json();
  const rows = data.values || [];

  const header = rows[0];
  const results = rows.slice(1).filter((row) => {
    const colG = row[6] || "";
    const colJ = row[9] || "";
    return colG.includes(input) || colJ.includes(input);
  });

  const tabla = document.getElementById("resultado");
  tabla.innerHTML = "";

  results.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row[9] || ""}</td>
      <td>${row[3] || ""}</td>
      <td>${row[21] || ""}</td>
      <td>${row[19] || ""}</td>
      <td>${row[15] || ""}</td>
    `;
    tabla.appendChild(tr);
  });

  mostrarResumen(rows.slice(1));
}

function mostrarResumen(rows) {
  const container = document.getElementById("resumenPeritos");
  container.innerHTML = "";

  const peritosClave = [
    "Cptn. Ramirez Velasteguí Santiago Ruben",
    "Sgos. Barcenes Ramirez Fredy Eduardo",
    "Sgos. Cruz Calderon Danilo Fabricio",
    "Cbop. Gavilanez Azogue Lenin Orlando",
    "Cbop. Arias Guishcasho Victor Damian",
    "Cbop. Sarango Rosado Roberto Fabricio",
    "Cbos. Guaman Freire Jefferson Guillermo",
    "Cbos. Jimenez Jimenez Jorge Luis"
  ];

  const hoy = new Date();
  const pendientes = {};
  const totales = {};

  rows.forEach((row) => {
    const nombre = (row[3] || "").trim();
    const asunto = (row[8] || "").trim();
    const estado = (row[21] || "").toUpperCase();
    const sumilla = row[19] || "";

    const fechaSumilla = sumilla ? new Date(sumilla) : null;
    const diasTranscurridos =
      fechaSumilla && !isNaN(fechaSumilla) ? (hoy - fechaSumilla) / (1000 * 60 * 60 * 24) : 0;

    if (peritosClave.includes(nombre)) {
      totales[nombre] = (totales[nombre] || 0) + 1;

      if (
        asunto === "Solicitud de Informe Investigativo" &&
        estado.includes("PENDIENTE") &&
        diasTranscurridos > 30
      ) {
        pendientes[nombre] = (pendientes[nombre] || 0) + 1;
      }
    }
  });

  const titulo = document.createElement("h4");
  titulo.className = "text-center text-uppercase mb-3";
  titulo.textContent = "INVESTIGACIONES PENDIENTES";
  container.appendChild(titulo);

  const tabla = document.createElement("table");
  tabla.className = "table table-bordered";

  const thead = document.createElement("thead");
  thead.innerHTML = `<tr><th>#</th><th>Perito</th><th>Pendientes</th></tr>`;
  tabla.appendChild(thead);

  const tbody = document.createElement("tbody");

  peritosClave.forEach((nombre, index) => {
    const valor = pendientes[nombre] || 0;
    const color = obtenerColor(valor, pendientes);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${nombre}</td>
      <td style="background-color:${color};text-align:center">${valor}</td>
    `;
    tbody.appendChild(tr);
  });

  tabla.appendChild(tbody);
  container.appendChild(tabla);

  // Totales
  const resumenTotales = document.createElement("div");
  resumenTotales.className = "mt-4";
  resumenTotales.innerHTML = `<h5>Total de pericias por perito</h5>`;

  const tablaTotal = document.createElement("table");
  tablaTotal.className = "table table-bordered";
  tablaTotal.innerHTML = `
    <thead><tr><th>#</th><th>Perito</th><th>Total</th></tr></thead>
    <tbody>
      ${peritosClave
        .map((nombre, index) => {
          return `<tr>
            <td>${index + 1}</td>
            <td>${nombre}</td>
            <td style="text-align:center">${totales[nombre] || 0}</td>
          </tr>`;
        })
        .join("")}
    </tbody>
  `;

  resumenTotales.appendChild(tablaTotal);
  container.appendChild(resumenTotales);
}

function obtenerColor(valor, todos) {
  const valores = Object.values(todos);
  const max = Math.max(...valores);
  const min = Math.min(...valores);

  if (max === min) return "#ffffff"; // Todos iguales

  const porcentaje = (valor - min) / (max - min);
  const rojo = Math.floor(255 * porcentaje);
  const verde = Math.floor(255 * (1 - porcentaje));
  return `rgb(${rojo},${verde},0)`;
}
