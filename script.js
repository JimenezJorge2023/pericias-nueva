const sheetId = '1FWWZGmQWkaarAm0YJOKe7yI5kRB0YhiH';
const sheetName = 'GENERAL';
const apiKey = 'AIzaSyDqRQRGRG4FzGn1oOeEbMBcYVh7xUoFdms';

const peritosFiltrados = [
  'Cptn. Ramirez Velasteguí Santiago Ruben',
  'Sgos. Barcenes Ramirez Fredy Eduardo',
  'Sgos. Cruz Calderon Danilo Fabricio',
  'Cbop. Gavilanez Azogue Lenin Orlando',
  'Cbop. Arias Guishcasho Victor Damian',
  'Cbop. Sarango Rosado Roberto Fabricio',
  'Cbos. Guaman Freire Jefferson Guillermo',
  'Cbos. Jimenez Jimenez Jorge Luis'
];

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('button').addEventListener('click', buscar);
});

async function buscar() {
  const input = document.getElementById('inputValor').value.trim();
  const resultadoBody = document.getElementById('resultado');
  const resumenDiv = document.getElementById('resumenPeritos');
  resultadoBody.innerHTML = '';
  resumenDiv.innerHTML = '';

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    const rows = data.values;

    if (!rows || rows.length === 0) {
      resultadoBody.innerHTML = '<tr><td colspan="5">No se encontraron datos</td></tr>';
      return;
    }

    const headers = rows[0];
    const dataRows = rows.slice(1);

    const idx = {
      detalle: headers.findIndex(h => h.includes('DETALLE INVENTARIO')),
      perito: headers.findIndex(h => h.includes('GRADO Y NOMBRES')),
      estado: headers.findIndex(h => h.includes('ESTADO')),
      sumilla: headers.findIndex(h => h.includes('FECHA DE SUMILLA')),
      asunto: headers.findIndex(h => h.includes('ASUNTO')),
      docSalida: headers.findIndex(h => h.includes('N° DOCUMENTO')),
    };

    // Mostrar resultados de búsqueda
    const resultados = dataRows.filter(row =>
      row[idx.detalle]?.toString().includes(input)
    );

    resultados.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row[idx.detalle] || ''}</td>
        <td>${row[idx.perito] || ''}</td>
        <td>${row[idx.estado] || ''}</td>
        <td>${row[idx.sumilla] || ''}</td>
        <td>${row[idx.docSalida] || ''}</td>
      `;
      resultadoBody.appendChild(tr);
    });

    // Resumen por perito
    const hoy = new Date();
    const pendientesYTotales = peritosFiltrados.map(nombre => ({ nombre, pendientes: 0, total: 0 }));

    dataRows.forEach(row => {
      const perito = row[idx.perito]?.trim();
      const estado = row[idx.estado]?.toUpperCase();
      const asunto = row[idx.asunto]?.trim();
      const fechaSumilla = row[idx.sumilla];

      if (!peritosFiltrados.includes(perito)) return;

      const registro = pendientesYTotales.find(p => p.nombre === perito);
      if (registro) {
        registro.total++;
        const diasTranscurridos = calcularDias(fechaSumilla);
        if (
          asunto === 'Solicitud de Informe Investigativo' &&
          estado.includes('PENDIENTE') &&
          diasTranscurridos > 30
        ) {
          registro.pendientes++;
        }
      }
    });

    // Renderizar resumen
    const tabla = document.createElement('table');
    tabla.className = 'table table-bordered mt-4';
    tabla.innerHTML = `
      <thead>
        <tr><th colspan="4" class="text-center text-uppercase">Investigaciones Pendientes</th></tr>
        <tr>
          <th>#</th>
          <th>Perito</th>
          <th>Pendientes</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${pendientesYTotales.map((p, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${p.nombre}</td>
            <td style="background-color:${getColor(p.pendientes)}">${p.pendientes}</td>
            <td>${p.total}</td>
          </tr>`).join('')}
      </tbody>
    `;

    resumenDiv.appendChild(tabla);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    resultadoBody.innerHTML = '<tr><td colspan="5">Error al cargar los datos.</td></tr>';
  }
}

function calcularDias(fechaStr) {
  if (!fechaStr) return 0;
  const partes = fechaStr.split('/');
  if (partes.length !== 3) return 0;
  const [dd, mm, aa] = partes.map(p => parseInt(p));
  const fecha = new Date(2000 + aa, mm - 1, dd); // Asume formato dd/mm/aa
  const hoy = new Date();
  const diferencia = hoy - fecha;
  return Math.floor(diferencia / (1000 * 60 * 60 * 24));
}

function getColor(valor) {
  if (valor >= 10) return '#ff9999'; // rojo
  if (valor >= 5) return '#ffd966'; // amarillo
  if (valor >= 1) return '#d9ead3'; // verde claro
  return '#f2f2f2'; // gris claro
}
