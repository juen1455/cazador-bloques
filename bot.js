const fs = require('fs');
const fetch = require('node-fetch');

// Configuración de archivos y rangos
const ARCHIVO_PROGRESO = 'ultimo_id.txt';
const CANTIDAD_A_ESCANEAR = 27500; 

// Tu Webhook de Discord vinculado
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1515199569686823113/eAtu7a0PbPN3xoIzhWB70wYdkUAxNSHyS1ZrylJRDSNnZ1Q-OcSrkuLRzebJrhYiJyNY";

function obtenerUltimoId() {
    if (fs.existsSync(ARCHIVO_PROGRESO)) {
        const contenido = fs.readFileSync(ARCHIVO_PROGRESO, 'utf8');
        const id = parseInt(contenido.trim());
        if (!isNaN(id)) return id;
    }
    // ID inicial por defecto
    return 5001700; 
}

function guardarUltimoId(id) {
    fs.writeFileSync(ARCHIVO_PROGRESO, id.toString(), 'utf8');
}

async function enviarADiscord(idGrupo, nombreGrupo, miembros) {
    const urlGrupo = `https://www.roblox.com/groups/${idGrupo}`;
    
    const embed = {
        title: "🎉 ¡GRUPO RECLAMABLE ENCONTRADO! 🎉",
        description: `El bot ha detectado un grupo abandonado listo para ser reclamado.`,
        color: 3066993, // Color verde llamativo
        fields: [
            { name: "📛 Nombre del Grupo:", value: nombreGrupo || "Sin nombre", inline: true },
            { name: "🆔 ID del Grupo:", value: idGrupo.toString(), inline: true },
            { name: "👥 Miembros:", value: miembros.toString(), inline: true },
            { name: "🔗 Enlace Directo:", value: `[Click aquí para ir al grupo](${urlGrupo})` }
        ],
        footer: { text: "Spidey Bot Cazador • GitHub Actions" },
        timestamp: new Date()
    };

    try {
        await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embed] })
        });
        console.log(`[Discord] Notificación enviada para el grupo ID: ${idGrupo}`);
    } catch (err) {
        console.error("Error al enviar el webhook a Discord:", err.message);
    }
}

async function verificarGrupo(id) {
    const urlRoblox = `https://groups.roblox.com/v1/groups/${id}`;
    
    try {
        const respuesta = await fetch(urlRoblox);
        
        // Si el grupo no existe (404) o Roblox da error temporal, pasamos de largo
        if (!respuesta.ok) return;

        const datos = JSON.stringify(await respuesta.json());
        const grupo = JSON.parse(datos);

        // CONDICIÓN CLAVE: El grupo debe existir, no tener dueño (owner es null), y tener 0 miembros
        if (grupo && grupo.owner === null && grupo.memberCount === 0) {
            // Asegurar que sea de entrada pública (si tiene la opción pública activa)
            if (grupo.isPubliclyJoinable === true) {
                console.log(`✨ ¡Grupo Libre Encontrado! ID: ${id} - Nombre: ${grupo.name}`);
                await enviarADiscord(id, grupo.name, grupo.memberCount);
            }
        }
    } catch (error) {
        // Evita que el bucle se rompa si la API de Roblox falla momentáneamente
        // console.error(`Error escaneando ID ${id}:`, error.message);
    }
}

async function iniciarCaceria() {
    const idInicial = obtenerUltimoId();
    const idFinal = idInicial + CANTIDAD_A_ESCANEAR;

    console.log(`=== Iniciando escaneo automático: Desde ${idInicial} hasta ${idFinal} ===`);

    // Escanea los 10,000 grupos uno por uno con una micro-pausa de 80ms para evitar bloqueos de Roblox
    for (let id = idInicial; id < idFinal; id++) {
        await verificarGrupo(id);
        await new Promise(resolve => setTimeout(resolve, 80));
    }
    
    // Al finalizar con éxito, calcula el siguiente bloque
    const siguienteId = idFinal + 1;
    guardarUltimoId(siguienteId);
    console.log(`=== Escaneo finalizado. Guardado para continuar en el ID: ${siguienteId} ===`);
}

iniciarCaceria();
