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

      // Solo contar si columna I == "Solicitud de Informe Investigativo"
      if (tipoPericia === "Solicitud de Informe Investigativo") {
        if (!peritos[perito]) peritos[perito] = { total: 0, pendientes: 0 };
        peritos[perito].total += 1;
        if (estado.includes("PENDIENTE")) peritos[perito].pendientes += 1;
      }
    });

    // Construir tabla con peritos en orden específico
    const peritosFiltrados = ordenPeritos
      .filter(nombre => peritos[nombre])
      .map(nombre => ({ nombre, ...peritos[nombre] }));

    const tabla = `
      <table class="table table-sm table-bordered table-striped">
        <thead class="table-secondary">
          <tr>
            <th>Perito</th>
            <th>Total Pericias</th>
            <th>Pendientes</th>
          </tr>
        </thead>
        <tbody>
          ${peritosFiltrados.map(p => `
            <tr>
              <td>${p.nombre}</td>
              <td>${p.total}</td>
              <td>${p.pendientes}</td>
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
