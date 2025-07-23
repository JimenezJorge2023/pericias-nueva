
const API_KEY = "AIzaSyDO38mSIu6VJzTW3v_Rh0A4a0zTiGJ6Ssg";
const SHEET_ID = "1wXFoAHPPmviwPhziYbYqrKdHVQTd_O2Dfix1BHkAfmA";
const SHEET_NAME = "GENERAL";

async function cargarResumen() {
  const resumenDiv = document.getElementById("resumenPeritos");

  const ordenPeritos = [
    "Cptn. Ramirez Velasteguí Santiago Ruben",
    "Sgos. Barcenes Ramirez Fredy Eduardo",
    "Sgos. Cruz Calderon Danilo Fabricio",
    "Cbop. Gavilanez Azogue Lenin Orlando",
    "Cbop. Arias Guishcasho Victor Damian",
    "Cbop. Sarango Rosado Roberto Fabricio",
    "Cbos. Guaman Freire Jefferson Guillermo",
    "Cbos. Jimenez Jimenez Jorge Luis"
  ];

  try {
    const resp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?alt=json&key=${API_KEY}`);
    if (!resp.ok) throw new Error("Error al consultar la hoja.");
    const json = await resp.json();

    const rows = json.values || [];
    const data = rows.slice(1); // Saltar encabezados

    const peritos = {};

    data.forEach(row => {
      const perito = row[17] || "SIN NOMBRE"; // Columna R
      const estado = (row[21] || "").toUpperCase(); // Columna V
      const tipoPericia = row[8] || ""; // Columna I

      if (perito === "RECEPTOR /GRADO Y NOMBRES COMPLETOS") return;

      if (tipoPericia === "Solicitud de Informe Investigativo") {
        if (!peritos[perito]) peritos[perito] = { total: 0, pendientes: 0 };
        peritos[perito].total += 1;
        if (estado.includes("PENDIENTE")) peritos[perito].pendientes += 1;
      }
    });

    const peritosFiltrados = ordenPeritos
      .filter(nombre => peritos[nombre])
      .map(nombre => ({ nombre, ...peritos[nombre] }));

    const maxPendientes = Math.max(...peritosFiltrados.map(p => p.pendientes));
    const minPendientes = Math.min(...peritosFiltrados.map(p => p.pendientes));

    const getColor = (val) => {
      if (maxPendientes === minPendientes) return "#cccccc"; // caso borde
      const ratio = (val - minPendientes) / (maxPendientes - minPendientes);
      const r = Math.round(255 * ratio);
      const g = Math.round(255 * (1 - ratio));
      return `rgb(${r},${g},0)`; // De verde a rojo
    };

    const tabla = `
      
    <div class="text-center fw-bold text-uppercase mb-2">Investigaciones Pendientes</div>
    <table class="table table-sm table-bordered table-striped">
    
        <thead class="table-secondary">
          <tr>
            <th>#</th><th>Perito</th>
            <th>Total Pericias</th>
            <th>Pendientes</th>
          </tr>
        </thead>
        <tbody>
          ${peritosFiltrados.map((p, i) => `
            <tr>
              <td>${i + 1}</td><td>${p.nombre}</td>
              <td>${p.total}</td>
              <td style="background-color: ${getColor(p.pendientes)}">${p.pendientes}</td>
            </tr>
          `).join("")}
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
      (r[6] && r[6].toString().includes(valor)) ||
      (r[9] && r[9].toString().includes(valor))
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
