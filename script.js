const API_KEY = "AIzaSyDO38mSIu6VJzTW3v_Rh0A4a0zTiGJ6Ssg";
const SHEET_ID = "1wXFoAHPPmviwPhziYbYqrKdHVQTd_O2Dfix1BHkAfmA";
const SHEET_NAME = "GENERAL";

async function cargarResumen() {
  const resumenDiv = document.getElementById("resumenPeritos");

  try {
    const resp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?alt=json&key=${API_KEY}`);
    if (!resp.ok) throw new Error("Error al consultar la hoja.");
    const json = await resp.json();

    const rows = json.values || [];
    const data = rows.slice(1);

    const filtroNombres = [
      "Sgos. Barcenes Ramirez Fredy Eduardo",
      "Sgos. Cruz Calderon Danilo Fabricio",
      "Cbop. Gavilanez Azogue Lenin Orlando",
      "Cbop. Arias Guishcasho Victor Damian",
      "Cbop. Sarango Rosado Roberto Fabricio",
      "Cbos. Guaman Freire Jefferson Guillermo",
      "Cbos. Jimenez Jimenez Jorge Luis"
    ];

    const peritos = {};

    data.forEach(row => {
      const perito = row[17] || "";
      const detalle = row[9] || "";
      const estado = (row[21] || "").toUpperCase();

      if (detalle.includes("Solicitud de Informe Investigativo") && estado === "PENDIENTE") {
        if (filtroNombres.includes(perito)) {
          if (!peritos[perito]) peritos[perito] = 0;
          peritos[perito] += 1;
        }
      }
    });

    const tabla = `
      <table class="table table-bordered">
        <thead class="table-secondary text-center">
          <tr><th colspan="3">INVESTIGACIONES PENDIENTES</th></tr>
          <tr>
            <th>#</th>
            <th>PERITO</th>
            <th>PENDIENTES</th>
          </tr>
        </thead>
        <tbody>
          ${filtroNombres.map((nombre, i) => `
            <tr class="${nombre === 'Cptn. Ramirez Velasteguí Santiago Ruben' ? 'd-none' : ''}" style="background-color:${peritos[nombre] > 0 ? '#f8d7da' : '#d4edda'}">
              <td>${i + 1}</td>
              <td>${nombre}</td>
              <td>${peritos[nombre] || 0}</td>
            </tr>`).join("")}
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
      tbody.innerHTML = "<tr><td colspan='5' class='text-danger'>No se encontraron datos.</td></tr>";
      return;
    }

    tbody.innerHTML = filtrados.map(r => {
      const estado = (r[21] || "").toLowerCase();
      const estadoClass = estado.includes("pendiente") ? "estado-pendiente" : 
                          estado.includes("cumplido") ? "estado-cumplido" : "";
      return `
        <tr>
          <td>${r[8] || ""}</td>
          <td>${r[17] || ""}</td>
          <td class="${estadoClass}">${r[21] || ""}</td>
          <td>${r[19] || ""}</td>
          <td>${r[20] || ""}</td>
        </tr>`;
    }).join("");

  } catch (e) {
    tbody.innerHTML = `<tr><td colspan='5'>Error: ${e.message}</td></tr>`;
  }
}

window.addEventListener("DOMContentLoaded", cargarResumen);