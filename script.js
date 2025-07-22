
const API_KEY = "AIzaSyDO38mSIu6VJzTW3v_Rh0A4a0zTiGJ6Ssg";
const SHEET_ID = "1wXFoAHPPmviwPhziYbYqrKdHVQTd_O2Dfix1BHkAfmA";
const SHEET_NAME = "GENERAL";

async function buscar() {
  const valor = document.getElementById("inputValor").value.trim();
  const tbody = document.getElementById("resultado");

  if (!valor) {
    tbody.innerHTML = "<tr><td colspan='5'>Ingrese un valor de búsqueda.</td></tr>";
    return;
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?alt=json&key=${API_KEY}`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error("Error al consultar la hoja.");
    const json = await resp.json();

    const rows = json.values || [];
    const data = rows.slice(1); // saltar encabezado

    // Buscar coincidencia en columna G (índice 6) o J (índice 9)
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
        <td>${r[8] || ""}</td>   <!-- I: PERICIAS RELACIONADAS -->
        <td>${r[17] || ""}</td>  <!-- R: PERITO ASIGNADO -->
        <td>${r[21] || ""}</td>  <!-- V: ESTADO -->
        <td>${r[19] || ""}</td>  <!-- T: SUMILLA -->
        <td>${r[20] || ""}</td>  <!-- U: DOCUMENTO SALIDA -->
      </tr>
    `).join("");

  } catch (e) {
    tbody.innerHTML = `<tr><td colspan='5'>Error: ${e.message}</td></tr>`;
  }
}
