const API_KEY = "AIzaSyAv7U..."; // Tu API Key válida aquí
const SHEET_ID = "1FWWZGmQWkaarAm0YJOKe7yI5kRB0YhiH";
const SHEET_NAME = "GENERAL";

async function buscar() {
  const valor = document.getElementById("inputValor").value.trim();
  const tabla = document.getElementById("resultado");
  tabla.innerHTML = "";

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const rows = data.values;
    if (!rows || rows.length === 0) {
      tabla.innerHTML = "<tr><td colspan='5'>No hay datos disponibles.</td></tr>";
      return;
    }

    const valorLimpio = valor.replace(/[^\w\d]/g, "").toLowerCase();

    let encontrados = rows.filter((row, index) => {
      if (index < 1) return false; // omitir encabezado

      const detalle = (row[9] || "").toString().replace(/[^\w\d]/g, "").toLowerCase();
      const otroCampo = (row[6] || "").toString().replace(/[^\w\d]/g, "").toLowerCase(); // columna G

      return detalle.includes(valorLimpio) || otroCampo.includes(valorLimpio);
    });

    if (encontrados.length === 0) {
      tabla.innerHTML = "<tr><td colspan='5'>No se encontraron datos</td></tr>";
    } else {
      encontrados.forEach(row => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${row[9] || ""}</td>
          <td>${row[17] || ""}</td>
          <td>${row[21] || ""}</td>
          <td>${row[19] || ""}</td>
          <td>${row[20] || ""}</td>
        `;
        tabla.appendChild(fila);
      });
    }

    mostrarResumen(rows);
  } catch (error) {
    console.error("Error al obtener los datos:", error);
    tabla.innerHTML = "<tr><td colspan='5'>Error al cargar los datos</td></tr>";
  }
}

function mostrarResumen(rows) {
  const resumen = document.getElementById("resumenPeritos");
  resumen.innerHTML = "";

  const hoy = new Date();
  const pendientesPorPerito = {};
  const totalesPorPerito = {};

  rows.slice(1).forEach(row => {
    const asunto = row[8] || "";
    const estado = (row[21] || "").toUpperCase();
    const perito = row[17] || "";
    const fechaStr = row[19] || ""; // columna T
    const fecha = new Date(fechaStr);
    const diasDiferencia = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24));

    if (perito) {
      totalesPorPerito[perito] = (totalesPorPerito[perito] || 0) + 1;
    }

    if (
      asunto === "Solicitud de Informe Investigativo" &&
      estado.includes("PENDIENTE") &&
      !isNaN(fecha) &&
      diasDiferencia > 30
    ) {
      pendientesPorPerito[perito] = (pendientesPorPerito[perito] || 0) + 1;
    }
  });

  // Crear tabla de pendientes
  const peritosPendientes = Object.keys(totalesPorPerito);
  const maxPend = Math.max(...Object.values(pendientesPorPerito));
  const minPend = Math.min(...Object.values(pendientesPorPerito));

  let htmlPendientes = `
    <h4 class="text-center mt-5 mb-3">INVESTIGACIONES PENDIENTES</h4>
    <table class="table table-sm table-bordered">
      <thead><tr><th>#</th><th>Perito</th><th>Pendientes</th></tr></thead>
      <tbody>
  `;

  peritosPendientes.forEach((perito, index) => {
    const pendientes = pendientesPorPerito[perito] || 0;
    const color = calcularColor(pendientes, minPend, maxPend);
    htmlPendientes += `
      <tr>
        <td>${index + 1}</td>
        <td>${perito}</td>
        <td style="background-color:${color}">${pendientes}</td>
      </tr>
    `;
  });

  htmlPendientes += "</tbody></table>";

  // Tabla de totales
  let htmlTotales = `
    <h6 class="mt-4">Total de pericias por perito</h6>
    <table class="table table-sm table-bordered">
      <thead><tr><th>#</th><th>Perito</th><th>Total</th></tr></thead>
      <tbody>
  `;

  peritosPendientes.forEach((perito, index) => {
    htmlTotales += `
      <tr>
        <td>${index + 1}</td>
        <td>${perito}</td>
        <td>${totalesPorPerito[perito]}</td>
      </tr>
    `;
  });

  htmlTotales += "</tbody></table>";
  resumen.innerHTML = htmlPendientes + htmlTotales;
}

function calcularColor(valor, min, max) {
  if (max === min) return "#ffffff"; // blanco si todos son iguales
  const porcentaje = (valor - min) / (max - min);
  const r = Math.floor(255 * porcentaje);
  const g = Math.floor(255 * (1 - porcentaje));
  return `rgb(${r},${g},0)`;
}
