
const API_KEY = "AIzaSyDO38mSIu6VJzTW3v_Rh0A4a0zTiGJ6Ssg";
const SHEET_ID = "1wXFoAHPPmviwPhziYbYqrKdHVQTd_O2Dfix1BHkAfmA";
const SHEET_NAME = "GENERAL";

async function buscar() {
  const input = document.getElementById("inputCedula").value.trim();
  const resultado = document.getElementById("resultado");
  if (!input) {
    resultado.innerHTML = "<tr><td colspan='5'>Ingrese un número de trámite.</td></tr>";
    return;
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?alt=json&key=${API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Error al consultar la hoja.");

    const data = await response.json();
    const rows = data.values;
    const headers = rows[0];
    const indexTramite = headers.findIndex(h => h.toLowerCase().includes("trámite") || h.toLowerCase().includes("cedula"));

    const coincidencias = rows.slice(1).filter(row => row[indexTramite] && row[indexTramite].includes(input));
    if (coincidencias.length === 0) {
      resultado.innerHTML = "<tr><td colspan='5'>No se encontraron resultados.</td></tr>";
      return;
    }

    resultado.innerHTML = coincidencias.map(row => `
      <tr>
        <td>${row[0] || ""}</td>
        <td>${row[1] || ""}</td>
        <td>${row[2] || ""}</td>
        <td>${row[3] || ""}</td>
        <td>${row[4] || ""}</td>
      </tr>
    `).join("");
  } catch (e) {
    resultado.innerHTML = `<tr><td colspan='5'>Error: ${e.message}</td></tr>`;
  }
}
