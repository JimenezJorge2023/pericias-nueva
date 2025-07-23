const API_KEY = 'AIzaSyDg3T4rpL0rAVgq0UO7xBGRz1KURbBvOdk';
const SHEET_ID = '1FWWZGmQWkaarAm0YJOKe7yI5kRB0YhiH';
const SHEET_NAME = 'GENERAL';

const PERITOS_ORDENADOS = [
  'Cptn. Ramirez Velasteguí Santiago Ruben',
  'Sgos. Barcenes Ramirez Fredy Eduardo',
  'Sgos. Cruz Calderon Danilo Fabricio',
  'Cbop. Gavilanez Azogue Lenin Orlando',
  'Cbop. Arias Guishcasho Victor Damian',
  'Cbop. Sarango Rosado Roberto Fabricio',
  'Cbos. Guaman Freire Jefferson Guillermo',
  'Cbos. Jimenez Jimenez Jorge Luis'
];

async function cargarDatos() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?alt=json&key=${API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.values;
}

function diasTranscurridos(fechaTexto) {
  const [dia, mes, anio] = fechaTexto.split('/');
  const fecha = new Date(`${anio}-${mes}-${dia}`);
  const hoy = new Date();
  const diferencia = hoy - fecha;
  return Math.floor(diferencia / (1000 * 60 * 60 * 24));
}

function buscar() {
  const valor = document.getElementById("inputValor").value.toLowerCase().trim();
  const resultado = document.getElementById("resultado");
  resultado.innerHTML = "Cargando...";

  cargarDatos().then(filas => {
    const encabezado = filas[3]; // fila de encabezados (índice 3)
    const datos = filas.slice(4); // datos desde fila 5

    const coincidencias = datos.filter(fila => {
      const valorG = (fila[6] || '').toLowerCase();
      const valorJ = (fila[9] || '').toLowerCase();
      return valorG.includes(valor) || valorJ.includes(valor);
    });

    resultado.innerHTML = "";

    coincidencias.forEach(fila => {
      const filaHTML = `
        <tr>
          <td>${fila[9] || ''}</td>
          <td>${fila[3] || ''}</td>
          <td>${fila[21] || ''}</td>
          <td>${fila[19] || ''}</td>
          <td>${fila[20] || ''}</td>
        </tr>`;
      resultado.innerHTML += filaHTML;
    });

    mostrarResumen(datos);
  });
}

function mostrarResumen(datos) {
  const resumenContainer = document.getElementById("resumenPeritos");
  resumenContainer.innerHTML = "";

  const conteo = PERITOS_ORDENADOS.map(nombre => {
    const total = datos.filter(fila => (fila[3] || '') === nombre).length;
    const pendientes = datos.filter(fila => {
      const perito = fila[3] || '';
      const asunto = fila[8] || '';
      const estado = (fila[21] || '').toUpperCase();
      const fechaSumilla = fila[19] || '';
      const dias = fechaSumilla ? diasTranscurridos(fechaSumilla) : 0;

      return (
        perito === nombre &&
        asunto === "Solicitud de Informe Investigativo" &&
        estado.includes("PENDIENTE") &&
        dias > 30
      );
    }).length;
    return { nombre, pendientes, total };
  });

  const maxPendientes = Math.max(...conteo.map(p => p.pendientes || 0));
  const minPendientes = Math.min(...conteo.map(p => p.pendientes || 0));

  const getColor = (valor) => {
    if (maxPendientes === minPendientes) return "#e0e0e0";
    const ratio = (valor - minPendientes) / (maxPendientes - minPendientes);
    const r = Math.round(255 * ratio);
    const g = Math.round(255 * (1 - ratio));
    return `rgb(${r},${g},100)`;
  };

  let html = `<h4 class="text-center text-uppercase mb-3">Investigaciones Pendientes</h4>`;
  html += `<table class="table table-bordered"><thead class="table-light"><tr><th>#</th><th>Perito</th><th>Pendientes</th><th>Total</th></tr></thead><tbody>`;

  conteo.forEach((item, i) => {
    html += `
      <tr>
        <td>${i + 1}</td>
        <td>${item.nombre}</td>
        <td style="background-color: ${getColor(item.pendientes)}">${item.pendientes}</td>
        <td>${item.total}</td>
      </tr>`;
  });

  html += `</tbody></table>`;
  resumenContainer.innerHTML = html;
}
