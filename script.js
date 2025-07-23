const SHEET_ID = '1FWWZGmQWkaarAm0YJOKe7yI5kRB0YhiH';
const SHEET_NAME = 'GENERAL';
const API_KEY = 'AIzaSyBXQe-3mrq64HssEUEeWMRqPZHklDHH2eQ';

const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;

let data = [];

fetch(url)
  .then(response => response.json())
  .then(json => {
    data = json.values;
    mostrarResumen();
  });

function buscar() {
  const input = document.getElementById("inputValor").value.trim();
  const resultados = data.filter((row, index) => {
    if (index === 0) return false;
    const colG = row[6] || "";
    const colJ = row[9] || "";
    return colG.includes(input) || colJ.includes(input);
  });

  const tabla = document.getElementById("resultado");
  tabla.innerHTML = "";

  resultados.forEach(row => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${row[9] || ""}</td>
      <td>${row[3] || ""}</td>
      <td>${row[21] || ""}</td>
      <td>${row[18] || ""}</td>
      <td>${row[6] || ""}</td>
    `;
    tabla.appendChild(fila);
  });
}

function mostrarResumen() {
  const nombresFiltrar = [
    "Cptn. Ramirez Velasteguí Santiago Ruben",
    "Sgos. Barcenes Ramirez Fredy Eduardo",
    "Sgos. Cruz Calderon Danilo Fabricio",
    "Cbop. Gavilanez Azogue Lenin Orlando",
    "Cbop. Arias Guishcasho Victor Damian",
    "Cbop. Sarango Rosado Roberto Fabricio",
    "Cbos. Guaman Freire Jefferson Guillermo",
    "Cbos. Jimenez Jimenez Jorge Luis"
  ];

  const resumenPendientes = {};
  const resumenTotales = {};

  const hoy = new Date();

  data.forEach((row, index) => {
    if (index === 0) return;

    const perito = row[3] || "";
    const tipo = row[8] || "";
    const estado = row[21] || "";
    const sumillaFechaTexto = row[19] || "";
    const sumillaFecha = new Date(sumillaFechaTexto);
    const diasTranscurridos = (hoy - sumillaFecha) / (1000 * 60 * 60 * 24);

    if (nombresFiltrar.includes(perito)) {
      resumenTotales[perito] = (resumenTotales[perito] || 0) + 1;

      if (
        tipo === "Solicitud de Informe Investigativo" &&
        estado.includes("PENDIENTE") &&
        !isNaN(sumillaFecha.getTime()) &&
        diasTranscurridos > 30
      ) {
        resumenPendientes[perito] = (resumenPendientes[perito] || 0) + 1;
      }
    }
  });

  const contenedor = document.getElementById("resumenPeritos");
  contenedor.innerHTML = "";

  const titulo = document.createElement("h4");
  titulo.textContent = "INVESTIGACIONES PENDIENTES";
  titulo.classList.add("text-center", "text-uppercase", "mb-3");
  contenedor.appendChild(titulo);

  const tabla = document.createElement("table");
  tabla.classList.add("table", "table-bordered");

  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr class="table-secondary">
      <th style="width: 50px;">#</th>
      <th>Perito</th>
      <th>Pendientes</th>
      <th>Total Asignadas</th>
    </tr>`;
  tabla.appendChild(thead);

  const tbody = document.createElement("tbody");

  const pendientesValores = Object.values(resumenPendientes);
  const max = Math.max(...pendientesValores);
  const min = Math.min(...pendientesValores);

  const escalaColor = valor => {
    if (max === min) return "#f8d7da";
    const ratio = (valor - min) / (max - min);
    const r = Math.round(255 - ratio * 155);
    const g = Math.round(255 - (1 - ratio) * 155);
    return `rgb(${r}, ${g}, 150)`;
  };

  nombresFiltrar.forEach((nombre, idx) => {
    const pendientes = resumenPendientes[nombre] || 0;
    const total = resumenTotales[nombre] || 0;
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${idx + 1}</td>
      <td>${nombre}</td>
      <td style="background-color:${escalaColor(pendientes)};">${pendientes}</td>
      <td>${total}</td>
    `;
    tbody.appendChild(fila);
  });

  tabla.appendChild(tbody);
  contenedor.appendChild(tabla);
}
