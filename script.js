const API_KEY = "AIzaSyDO38mSIu6VJzTW3v_Rh0A4a0zTiGJ6Ssg";
const SHEET_ID = "1wXFoAHPPmviwPhziYbYqrKdHVQTd_O2Dfix1BHkAfmA";
const SHEET_NAME = "GENERAL";

// Lista de peritos que se deben mostrar, en orden
const peritosPermitidos = [
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
    const data = rows.slice(1);

    const peritos = {};

    data.forEach(row => {
      const detalle = (row[8] || "").toUpperCase(); // Columna I
      const estado = (row[21] || "").toUpperCase(); // Columna V
      const perito = row[17] || "SIN NOMBRE"; // Columna R

      if (!peritosPermitidos.includes(perito)) return;
      if (perito.includes("RECEPTOR /GRADO Y NOMBRES COMPLETOS")) return;

      if (!peritos[perito]) peritos[perito] = { total: 0, pendientes: 0 };
      if (detalle === "SOLICITUD DE INFORME INVESTIGATIVO") {
        peritos[perito].total += 1;
        if (estado.includes("PENDIENTE")) {
          peritos[perito].pendientes += 1;
        }
      }
    });

    const tabla = `
      <table class="table table-sm table-bordered table-striped">
        <thead class="table-secondary text-center text-uppercase">
          <tr>
            <th colspan="3">Investigaciones Pendientes</th>
          </tr>
          <tr>
            <th>#</th>
            <th>Perito</th>
            <th>Pendientes</th>
          </tr>
        </thead>
        <tbody>
          ${peritosPermitidos.map((nombre, index) => {
            const datos = peritos[nombre] || { pendientes: 0 };
            const color = datos.pendientes >= 5 ? 'table-danger' :
                          datos.pendientes === 0 ? 'table-success' : 'table-warning';
            return `
              <tr class="${color}">
                <td>${index + 1}</td>
                <td>${nombre}</td>
                <td>${datos.pendientes}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    `;
    resumenDiv.innerHTML = tabla;

  } catch (e) {
    resumenDiv.innerHTML = `<div class="text-danger">Error: ${e.message}</div>`;
  }
}

async function buscar() {
  const valor = document.getElementById("inputValor").value.trim();
  const tbody = document.getElementById("resultado");

  if (!valor) {
    tbody.innerHTML = "<tr><td colspan='5'>Ingrese un valor de búsqueda.</td></tr>";
    return;
  }

  try {
    const resp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?alt=json&key=${API_KEY}`);
    if (!resp.ok) throw new Error("Error al consultar la hoja.");
    const json = await resp.json();

    const rows = json.values || [];
    const data = rows.slice(1);

    const filtrados = data.filter(r =>
      (r[6] && r[6].toString().includes(valor)) ||  // N° Documento (col G)
      (r[9] && r[9].toString().includes(valor))     // Detalle Inventario (col J)
    );

    if (filtrados.length === 0) {
      tbody.innerHTML = "<tr><td colspan='5'>No se encontraron resultados.</td></tr>";
      return;
    }

    tbody.innerHTML = filtrados.map(r => `
      <tr>
        <td>${r[8] || ""}</td>
        <td>${r[17] || ""}</td>
        <td>${r[21] || ""}</td>
        <td>${r[19] || ""}</td>
        <td>${r[20] || ""}</td>
      </tr>
    `).join("");

  } catch (e) {
    tbody.innerHTML = `<tr><td colspan='5'>Error: ${e.message}</td></tr>`;
  }
}

window.addEventListener("DOMContentLoaded", cargarResumen);