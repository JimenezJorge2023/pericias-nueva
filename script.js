
document.getElementById("buscarBtn").addEventListener("click", function () {
    const input = document.getElementById("detalleInput").value.trim();
    const tablaResultados = document.getElementById("tablaResultados").getElementsByTagName("tbody")[0];
    tablaResultados.innerHTML = "";

    fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vQOxoOXcazz-nHspoTmwz6LWlNoC-Oq9eSguEhQDkQG6F5l2PzQ2U4wrnpJdMsMtQ/pub?gid=162047597&single=true&output=csv")
        .then(response => response.text())
        .then(csv => {
            const rows = csv.split("\n").map(row => row.split(","));
            const header = rows[0];
            const data = rows.slice(1);

            const detalleIndex = header.findIndex(h => h.toUpperCase().includes("DETALLE INVENTARIO"));
            const peritoIndex = header.findIndex(h => h.toUpperCase().includes("GRADO") || h.toUpperCase().includes("PERITO"));
            const estadoIndex = header.findIndex(h => h.toUpperCase().includes("ESTADO"));
            const sumillaIndex = header.findIndex(h => h.toUpperCase().includes("ASUNTO"));
            const documentoIndex = header.findIndex(h => h.toUpperCase().includes("DOCUMENTO") && !h.toUpperCase().includes("N"));

            const encontrados = data.filter(row =>
                row[detalleIndex] && row[detalleIndex].includes(input)
            );

            if (encontrados.length === 0) {
                const fila = tablaResultados.insertRow();
                const celda = fila.insertCell();
                celda.colSpan = 5;
                celda.textContent = "No se encontraron datos.";
            } else {
                encontrados.forEach(row => {
                    const fila = tablaResultados.insertRow();
                    fila.insertCell().textContent = row[detalleIndex] || "";
                    fila.insertCell().textContent = row[peritoIndex] || "";
                    fila.insertCell().textContent = row[estadoIndex] || "";
                    fila.insertCell().textContent = row[sumillaIndex] || "";
                    fila.insertCell().textContent = row[documentoIndex] || "";
                });
            }
        })
        .catch(error => {
            console.error("Error al cargar el CSV:", error);
        });
});
