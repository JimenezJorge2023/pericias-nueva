const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQOxoOXcazz-nHspoTmwz6LWlNoC-Oq9eSguEhQDkQG6F5l2PzQ2U4wrnpJdMsMtQ/pub?gid=735900757&single=true&output=csv";

const PERITOS_ORDENADOS = [
  "Sgos. Barcenes Ramirez Fredy Eduardo",
  "Sgos. Cruz Calderon Danilo Fabricio",
  "Cbop. Gavilanez Azogue Lenin Orlando",
  "Cbop. Arias Guishcasho Victor Damian",
  "Cbop. Sarango Rosado Roberto Fabricio",
  "Cbos. Guaman Freire Jefferson Guillermo",
  "Cbos. Jimenez Jimenez Jorge Luis"
];

let datosGlobales = [];

function cargarResumen(data) {
  const resumenDiv = document.getElementById("resumenPeritos");
  const peritos = {};

  data.forEach(row => {
    const tipo = row[8] || "";
    const estado = (row[21] || "").toUpperCase();
    const perito = (row[17] || "").trim();

    if (
      PERITOS_ORDENADOS.includes(perito) &&
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
            <tr>
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
}

function buscar(data) {
  const valor = document.getElementById("inputValor").value.trim();
  const tbody = document.getElementById("resultado");
  tbody.innerHTML = "";

  if (!valor) {
    tbody.innerHTML = "<tr><td colspan='5'>Ingrese un valor de búsqueda.</td></tr>";
    return;
  }

  const filtrados = data.filter(r =>
    (r[6] && r[6].toString().includes(valor)) || // G: Número de inventario
    (r[9] && r[9].toString().includes(valor))    // J: Documento
  );

  if (filtrados.length === 0) {
    tbody.innerHTML = "<tr><td colspan='5' class='text-danger'>No se encontraron datos.</td></tr>";
    return;
  }

  tbody.innerHTML = filtrados.map(r => {
    const estado = (r[21] || "").trim().toUpperCase();
    const claseEstado = estado === "PENDIENTE" ? "estado-pendiente" : estado === "CUMPLIDO" ? "estado-cumplido" : "";
    return `
      <tr>
        <td>${r[8] || ""}</td>   <!-- Pericias Relacionadas -->
        <td>${r[17] || ""}</td>  <!-- Perito Asignado -->
        <td class="${claseEstado}">${r[21] || ""}</td> <!-- Estado -->
        <td>${r[19] || ""}</td>  <!-- Sumilla -->
        <td>${r[20] || ""}</td>  <!-- Documento Salida -->
      </tr>
    `;
  }).join("");
}

window.addEventListener("DOMContentLoaded", () => {
  Papa.parse(CSV_URL, {
    download: true,
    complete: function(results) {
      const data = results.data.slice(1); // Omitir encabezado
      datosGlobales = data;
      cargarResumen(data);
    },
    error: function(err) {
      document.getElementById("resumenPeritos").innerHTML = `<div class="text-danger">Error al cargar CSV: ${err.message}</div>`;
    }
  });
});

window.buscar = () => buscar(datosGlobales);
