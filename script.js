const API_KEY = "AIzaSyDO38mSIu6VJzTW3v_Rh0A4a0zTiGJ6Ssg";
const SHEET_ID = "1FWWZGmQWkaarAm0YJOKe7yI5kRB0YhiH";
const SHEET_NAME = "GENERAL";

const PERITOS_ORDENADOS = [
  "Cptn. Ramirez Velasteguí Santiago Ruben",
  "Sgos. Barcenes Ramirez Fredy Eduardo",
  "Sgos. Cruz Calderon Danilo Fabricio",
  "Cbop. Gavilanez Azogue Lenin Orlando",
  "Cbop. Arias Guishcasho Victor Damian",
  "Cbop. Sarango Rosado Roberto Fabricio",
  "Cbos. Guaman Freire Jefferson Guillermo",
  "Cbos. Jimenez Jimenez Jorge Luis"
];

async function cargarResumen() {
  const resumenDiv = document.getElementById("resumenPeritos");

  try {
    const resp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?alt=json&key=${API_KEY}`);
    if (!resp.ok) throw new Error("Error al consultar la hoja.");
    const json = await resp.json();
    const rows = json.values || [];
    const data = rows.slice(1); // Saltar encabezados

    const peritos = {};
    data.forEach(row => {
      const perito = row[17]?.trim() || "";
      const estado = (row[21] || "").toUpperCase();
      const tipo = row[8] || "";
      if (
        PERITOS_ORDENADOS.includes(perito) &&
        perito !== "RECEPTOR /GRADO Y NOMBRES COMPLETOS" &&
        tipo.includes("Solicitud de Informe Investigativo") &&
        estado === "PENDIENTE"
      ) {
        if (!peritos[perito]) peritos[perito] = 0;
        peritos[perito]++;
      }
    });

    const tabla = `
      <div class="table-responsive mt-4">
        <table class="table table-bordered table-sm text-center align-middle">
          <thead class="table-secondary">
            <tr><th colspan="3">INVESTIGACIONES PENDIENTES</th></tr>
            <tr>
              <th>#</th>
              <th>PERITO</th>
              <th>PENDIENTES</th>
            </tr>
          </thead>
          <tbody>
            ${PERITOS_ORDENADOS.map((nombre, i) => `
              <tr style="background-color:${nombre === "Cptn. Ramirez Velasteguí Santiago Ruben" ? '#d4edda' : '#f8d7da'}">
                <td>${i + 1}</td>
                <td>${nombre}</td>
                <td>${peritos[nombre] || 0}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
    resumenDiv.innerHTML = tabla;

  } catch (e) {
    resumenDiv.innerHTML = `<div class="text-danger">Error: ${e.message}</div>`;
  }
}

async function buscar() {
  const valor = document.getElementById("inputValor").value.trim();
  const tbody = document.getElementById("resultado");
  tbody.innerHTML = "";

  if (!valor) {
    tb
