document.getElementById('searchButton').addEventListener('click', realizarBusqueda);
document.getElementById('medidaInput').addEventListener('keydown', function(event) {
    if (event.key === "Enter") {
        realizarBusqueda();
    }
});

document.getElementById("cleanButton").addEventListener("click", function() {
    let input = document.getElementById("medidaInput");
    input.value = ""; // Limpia el input
    input.focus();    // Hace focus en el input
});

const scrollButton = document.getElementById("scrollButton");
scrollButton.addEventListener("click", function () {
    if (window.scrollY >= document.body.scrollHeight - window.innerHeight - 10) {
        window.scrollTo({ top: 0, behavior: "instant" });
        scrollButton.innerHTML = "Ir al final";
    } else {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" });
        scrollButton.innerHTML = "Ir al inicio";
    }
});

function realizarBusqueda() {
    const medidaBuscada = document.getElementById('medidaInput').value.trim();
    if (!medidaBuscada) {
        alert("Por favor, ingresa una medida válida.");
        return;
    }
    cargarArchivoDesdeCSV(medidaBuscada);
}

function cargarArchivoDesdeCSV(medidaBuscada) {
  fetch(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSvX_EPW0NwRZS69n3dKorHfYERGXaHeQyuJZacQCNUIHzFXZ36Tuu6ry03DeWjfQ/pub?gid=726633073&single=true&output=csv"
  )
    .then((response) => response.text())
    .then((csvText) => {
      const rows = Papa.parse(csvText, { header: true }).data;
      const variantes = GenerarVariantesMedida(medidaBuscada);
      const resultados = rows.filter((row) =>
        variantes.some(
          (vari) =>
            row["MEDIDA"] &&
            row["MEDIDA"].toUpperCase().includes(vari.toUpperCase())
        )
      );
      mostrarResultados(resultados, medidaBuscada);
    })
    .catch((error) => console.error("Error al cargar los datos:", error));
}

function GenerarVariantesMedida(medida) {
    medida = medida.toString().trim();
    
    // Verificar si la medida tiene una longitud de 7 (común para medidas estándar)
    if (medida.length === 7) {
        const ancho = medida.substring(0, 3);
        const perfil = medida.substring(3, 5);
        const diametro = medida.substring(5);
        return [
            `${ancho}/${perfil}R${diametro}`, `${ancho}/${perfil}ZR${diametro}`, 
            `${ancho}/${perfil}ZRZ${diametro}`, `${ancho}/${perfil}RZR${diametro}`,
            `${ancho}/${perfil}R${diametro}C`, `${ancho}/${perfil}ZR${diametro}C`,
            `${ancho}/${perfil}ZRF${diametro}`, `${ancho}/${perfil}ZRXL${diametro}`,
            `${ancho}/${perfil}ZRF${diametro}C`
        ];
    }

    // Verificar si la medida tiene una longitud de 5 (puede ser común para algunos casos)
    if (medida.length === 5) {
        const ancho = medida.substring(0, 3);
        const diametro = medida.substring(3);
        return [
            `${ancho}R${diametro}`, `${ancho}R${diametro}C`,
            `${ancho}ZR${diametro}`, `${ancho}ZR${diametro}C`,
            `${ancho}ZRF${diametro}`
        ];
    }
    
    // Caso donde la medida incluye caracteres como "/" o "R" o "Z", que son comunes en medidas
    if (medida.includes("/") || medida.includes("R") || medida.includes("Z")) {
        return [medida];
    }    

    // Para cualquier otro formato, simplemente devolver la medida original
    return [medida];
}


function mostrarResultados(resultados, medidaBuscada) {
    const resultadosDiv = document.getElementById('resultados');
    resultadosDiv.innerHTML = '';

    const encabezado = document.createElement('h3');
    encabezado.textContent = "Tenemos lo siguiente:";
    resultadosDiv.appendChild(encabezado);

    if (resultados.length > 0) {
        resultados.forEach(fila => {
            const medida = fila["MEDIDA"] || '';
            const marca = fila["MARCA"] || '';
            const modelo = fila["MODELO"] || '';
            const precioUnidad = fila["UNIDAD"] || '';
            const precioX2 = fila["X2"] || '';
            const precioX4 = fila["X4"] || '';

            function formatearPrecio(precio) {
                if (!precio) return '';
                return precio.toLocaleString('es-ES');
            }

            const precioUnidadFormateado = formatearPrecio(precioUnidad);
            const precioX2Formateado = formatearPrecio(precioX2);
            const precioX4Formateado = formatearPrecio(precioX4);

            let resultadoTexto = '';

            // Caso 1: Los tres precios están disponibles
            if (precioUnidad && precioX2 && precioX4) {
                resultadoTexto = `
                    Medida: ${medida}<br>
                    Marca: ${marca}<br>
                    Modelo: ${modelo}<br>
                    Precio unidad: $${precioUnidadFormateado}<br>
                    Precio por par (X2): $${precioX2Formateado}<br>
                    Precio por juego (X4): $${precioX4Formateado}<br>`;  
            }
            // Caso 2: Precio por unidad y precio por juego (X4) están disponibles
            else if (precioUnidad && !precioX2 && precioX4) {
                resultadoTexto = `
                    Medida: ${medida}<br>
                    Marca: ${marca}<br>
                    Modelo: ${modelo}<br>
                    Precio unidad: $${precioUnidadFormateado}<br>
                    Precio por juego (X4): $${precioX4Formateado}<br>`;
            }
            // Caso 3: Precio por unidad y precio por par (X2) están disponibles
            else if (precioUnidad && precioX2 && !precioX4) {
                resultadoTexto = `
                    Medida: ${medida}<br>
                    Marca: ${marca}<br>
                    Modelo: ${modelo}<br>
                    Precio unidad: $${precioUnidadFormateado}<br>
                    Precio por par (X2): $${precioX2Formateado}<br>`;
            }
            // Caso 4: Solo precio por par (X2) y precio por juego (X4) está disponible
            else if (precioX2 && precioX4) {
                resultadoTexto = `
                    Medida: ${medida}<br>
                    Marca: ${marca}<br>
                    Modelo: ${modelo}<br>
                    Precio por par (X2): $${precioX2Formateado}<br>
                    Precio por juego (X4): $${precioX4Formateado}<br>`;
            }
            // Caso 5: Solo precio por juego (X4) está disponible
            else if (!precioUnidad && !precioX2 && precioX4) {
                resultadoTexto = `
                    Medida: ${medida}<br>
                    Marca: ${marca}<br>
                    Modelo: ${modelo}<br>
                    Precio por juego (X4): $${precioX4Formateado}<br>`;
            }
            // Caso 6: Solo precio por par (X2) está disponible
            else if (!precioUnidad && precioX2 && !precioX4) {
                resultadoTexto = `
                    Medida: ${medida}<br>
                    Marca: ${marca}<br>
                    Modelo: ${modelo}<br>
                    Precio por par (X2): $${precioX2Formateado}<br>`; 
            }
            // Caso 7: Solo precio por unidad está disponible
            else if (precioUnidad && !precioX2 && !precioX4) {
                resultadoTexto = `
                    Neumático ${medida} ${marca} ${modelo}. Valor Unitario: $${precioUnidadFormateado} <br>`;
                    // Neumatico 205/60R15 SUMAXX AT $75.000 valor unitario
            }

            // Crear el elemento del resultado
            const resultadoElemento = document.createElement('div');
            resultadoElemento.classList.add('alert', 'alert-info');

            // Crear el checkbox
            const checkbox = document.createElement('input');
            checkbox.dataset.instalacion = (fila["INSTALACION"] || '').toString().trim().toLowerCase();
            checkbox.type = 'checkbox';
            checkbox.classList.add('resultado-checkbox');
            checkbox.style.marginRight = '10px';

            // Añadir el checkbox al resultado
            resultadoElemento.appendChild(checkbox);
            resultadoElemento.innerHTML += resultadoTexto;

            // Añadir el resultado a la vista
            resultadosDiv.appendChild(resultadoElemento);
            
        });

        const bajada1 = document.createElement('p');
        bajada1.textContent = "Incluye instalación, balanceo y válvula normal.";
        resultadosDiv.appendChild(bajada1);

        /*const bajada2 = document.createElement('p');
        bajada2.innerHTML = "<strong>*No aplica para válvulas con sensor.</strong>";
        resultadosDiv.appendChild(bajada2);*/

        // Mostrar botones si hay resultados
        document.getElementById('copyButton').style.display = 'block';
        document.getElementById('copySelectedButton').style.display = 'block';
    } else {
        // Mostrar mensaje si no hay resultados
        const resultadoElemento = document.createElement('p');
        resultadoElemento.classList.add('alert', 'alert-warning');
        resultadoElemento.textContent = `No se encontraron neumáticos que contengan la medida "${medidaBuscada}".`;
        resultadosDiv.appendChild(resultadoElemento);

        // Ocultar botones si no hay resultados
        document.getElementById('copyButton').style.display = 'none';
        document.getElementById('copySelectedButton').style.display = 'none';
    }
}

// Función para copiar todos los resultados
document.getElementById('copyButton').addEventListener('click', function() {
    const resultadosDiv = document.getElementById('resultados');
    let resultadosTexto = '';
    let incluirMensajesInstalacion = false;

    const encabezado = resultadosDiv.querySelector('h3');
    if (encabezado) {
        resultadosTexto += encabezado.innerText + '\n\n';
    }

    const alertElements = resultadosDiv.querySelectorAll('.alert');
    alertElements.forEach(alert => {
        const checkbox = alert.querySelector('.resultado-checkbox');
        if (checkbox && checkbox.dataset.instalacion === 'sí') {
            incluirMensajesInstalacion = true;
        }

        const lines = alert.innerText.split('\n').map(line => line.trim()).filter(line => line !== '');
        resultadosTexto += lines.join('\n') + '\n\n';
    });

    if (incluirMensajesInstalacion) {
        const bajada1 = "Incluye instalación, balanceo y válvula normal.";
        //const bajada2 = "*No aplica para válvulas con sensor.";
        resultadosTexto += bajada1;
        //resultadosTexto += bajada1 + "\n\n" + bajada2;
    }

    navigator.clipboard.writeText(resultadosTexto.trim());
});

// Función para copiar solo los resultados seleccionados
document.getElementById('copySelectedButton').addEventListener('click', function() {
    const resultadosDiv = document.getElementById('resultados');
    let resultadosTexto = '';
    let incluirMensajesInstalacion = false;

    const encabezado = resultadosDiv.querySelector('h3');
    if (encabezado) {
        resultadosTexto += encabezado.innerText + '\n\n';
    }

    const checkboxes = resultadosDiv.querySelectorAll('.resultado-checkbox:checked');

    if (checkboxes.length === 0) {
        alert("Selecciona al menos un resultado para copiar.");
        return;
    }

    checkboxes.forEach(checkbox => {
        const resultadoElemento = checkbox.closest('.alert');
        if (checkbox.dataset.instalacion === 'sí') {
            incluirMensajesInstalacion = true;
        }

        const lines = resultadoElemento.innerText.split('\n').map(line => line.trim()).filter(line => line !== '');
        resultadosTexto += lines.join('\n') + '\n\n';
    });

    if (incluirMensajesInstalacion) {
        const bajada1 = "Incluye instalación, balanceo y válvula normal.";
        //const bajada2 = "*No aplica para válvulas con sensor.";
        resultadosTexto += bajada1;
        //resultadosTexto += bajada1 + "\n\n" + bajada2;
    }

    navigator.clipboard.writeText(resultadosTexto.trim());
});
