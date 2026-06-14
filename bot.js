const fs = require('fs');

const ARCHIVO_PROGRESO = 'ultimo_id.txt';
const CANTIDAD_A_ESCANEAR = 10000; 

function obtenerUltimoId() {
    if (fs.existsSync(ARCHIVO_PROGRESO)) {
        const contenido = fs.readFileSync(ARCHIVO_PROGRESO, 'utf8');
        const id = parseInt(contenido.trim());
        if (!isNaN(id)) return id;
    }
    return 5001700; 
}

function guardarUltimoId(id) {
    fs.writeFileSync(ARCHIVO_PROGRESO, id.toString(), 'utf8');
}

async function iniciarCaceria() {
    const idInicial = obtenerUltimoId();
    const idFinal = idInicial + CANTIDAD_A_ESCANEAR;

    console.log(`=== Iniciando escaneo automático: Desde ${idInicial} hasta ${idFinal} ===`);
    
    // Aquí irá la lógica para revisar los grupos
    
    const siguienteId = idFinal + 1;
    guardarUltimoId(siguienteId);
    console.log(`=== Escaneo finalizado. Guardado para continuar en el ID: ${siguienteId} ===`);
}

iniciarCaceria();

