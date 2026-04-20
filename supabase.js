// ============================================
// SISTEMA DE AVISOS SI3 - Configuracion
// ============================================

// Credenciales Supabase (no modificar)
const SUPABASE_URL = 'https://wuvvwoojcqzcvwjwcgce.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1dnZ3b29qY3F6Y3Z3andjZ2NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2ODgwMDEsImV4cCI6MjA5MjI2NDAwMX0.54gwvzl8JEOsjDHLmnnKAKPCbj2XjJ3t3obwFyOIYEw';

const TABLA_ALERTAS = 'alertas';
let syncInProgress = false;
let lastSyncTime = 0;

// ============================================
// FUNCIONES DE SUPABASE
// ============================================

async function syncToSupabase(alerta) {
    try {
        console.log('Enviando alerta a Supabase:', alerta);
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLA_ALERTAS}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                id: alerta.id,
                codigo: alerta.codigo,
                tipo: alerta.tipo,
                activa: alerta.activa,
                creado_por: alerta.creadoPor,
                nombre_creador: alerta.nombreCreador,
                created_at: alerta.created_at,
                completada_at: alerta.completada_at || null
            })
        });
        console.log('Respuesta Supabase:', response.status, response.statusText);
        return response.ok;
    } catch (e) {
        console.error('Error sync to Supabase:', e);
        return false;
    }
}

async function syncUpdateToSupabase(alerta) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLA_ALERTAS}?id=eq.${alerta.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                activa: alerta.activa,
                completada_at: alerta.completada_at || null
            })
        });
        return response.ok;
    } catch (e) {
        console.error('Error updating in Supabase:', e);
        return false;
    }
}

async function fetchAlertasFromSupabase() {
    try {
        console.log('Fetching alertas from Supabase...');
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLA_ALERTAS}?order=created_at.desc&limit=100`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        console.log('Fetch response:', response.status, response.statusText);
        if (response.ok) {
            const data = await response.json();
            console.log('Alertas desde Supabase:', data.length);
            return data;
        }
        return [];
    } catch (e) {
        console.error('Error fetching from Supabase:', e);
        return [];
    }
}

async function sincronizarAlertas() {
    if (syncInProgress) return;
    syncInProgress = true;
    
    try {
        const remotas = await fetchAlertasFromSupabase();
        const locales = obtenerAlertas();
        
        const idsLocales = new Set(locales.map(a => a.id));
        const idsRemotas = new Set(remotas.map(a => a.id));
        const locallyDeleted = [];
        
        for (let remota of remotas) {
            if (!idsLocales.has(remota.id)) {
                const alerta = {
                    id: remota.id,
                    codigo: remota.codigo,
                    tipo: remota.tipo,
                    activa: remota.activa,
                    creadoPor: remota.creado_por,
                    nombreCreador: remota.nombre_creador,
                    created_at: remota.created_at,
                    completada_at: remota.completada_at
                };
                locales.push(alerta);
            }
        }
        
        for (let i = locales.length - 1; i >= 0; i--) {
            const local = locales[i];
            const remota = remotas.find(r => r.id === local.id);
            if (!remota) {
                locallyDeleted.push(local.id);
                locales.splice(i, 1);
            } else if (local.activa !== remota.activa || local.completada_at !== remota.completada_at) {
                local.activa = remota.activa;
                local.completada_at = remota.completada_at;
            }
        }
        
        for (let id of locallyDeleted) {
            deleteFromSupabase(id);
            console.log('Deleted locally:', id);
        }
        
        locales.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        localStorage.setItem('alertas', JSON.stringify(locales));
        console.log('Sincronizado: ' + locales.length + ' alertas');
        lastSyncTime = Date.now();
    } catch (e) {
        console.error('Error en sincronizacion:', e);
    } finally {
        syncInProgress = false;
    }
}

// ============================================
// Mapas de nombres de usuarios
// ============================================
var NOMBRES_USUARIOS = {
    'juan': 'Juan Pablo Londoño',
    'anderson': 'Anderzon Rojas',
    'mateo': 'Mateo Guarín',
    'david': 'David Valencia'
};

// ============================================
// Funciones auxiliaries
// ============================================

// Obtener nombre de usuario por su ID
function getNombreUsuario(username) {
    return NOMBRES_USUARIOS[username] || 'Desconocido';
}

// Generar codigo automatique
function generarCodigoAutomatico() {
    var now = new Date();
    var fecha = now.toISOString().split('T')[0].replace(/-/g, '');
    var hora = now.toTimeString().substring(0, 5).replace(/:/g, '');
    var random = Math.floor(Math.random() * 9000) + 1000;
    return fecha + hora + random;
}

// ============================================
// Funciones de localStorage
// ============================================

// Guardar una nueva alerta
async function guardarAlerta(codigo, tipo, enviadoPor) {
    var alerta = {
        id: Date.now(),
        codigo: codigo,
        tipo: tipo,
        activa: true,
        creadoPor: enviadoPor,
        nombreCreador: getNombreUsuario(enviadoPor),
        created_at: new Date().toISOString()
    };
    var alertas = JSON.parse(localStorage.getItem('alertas') || '[]');
    alertas.push(alerta);
    localStorage.setItem('alertas', JSON.stringify(alertas));
    
    syncToSupabase(alerta);
    
    return alerta;
}

// Obtener todas las alertas
function obtenerAlertas() {
    return JSON.parse(localStorage.getItem('alertas') || '[]');
}

// Obtener solo alertas activas
function obtenerAlertasActivas() {
    return obtenerAlertas().filter(function(a) { return a.activa; });
}

// Obtener alertas por tipo
function obtenerAlertasPorTipo(tipo) {
    return obtenerAlertasActivas().filter(function(a) { return a.tipo === tipo; });
}

// Obtener alertas del turno
function obtenerAlertasDelTurno(turno) {
    var tipo = turno === 1 ? 'alistador1' : 'alistador2';
    return obtenerAlertasPorTipo(tipo);
}

// Completar una alerta (marcarla como hecho)
async function completarAlerta(id) {
    var alertas = obtenerAlertas();
    for (var i = 0; i < alertas.length; i++) {
        if (alertas[i].id === id) {
            alertas[i].activa = false;
            alertas[i].completada_at = new Date().toISOString();
            syncUpdateToSupabase(alertas[i]);
            break;
        }
    }
    localStorage.setItem('alertas', JSON.stringify(alertas));
}

// Completar todas las alertas
async function completarTodasAlertas() {
    var alertas = obtenerAlertas();
    alertas.forEach(function(a) { 
        if (a.activa) {
            a.activa = false;
            a.completada_at = new Date().toISOString();
            syncUpdateToSupabase(a);
        }
    });
    localStorage.setItem('alertas', JSON.stringify(alertas));
}

async function deleteFromSupabase(id) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLA_ALERTAS}?id=eq.${id}`, {
            method: 'DELETE',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Prefer': 'return=minimal'
            }
        });
        return response.ok;
    } catch (e) {
        console.error('Error deleting from Supabase:', e);
        return false;
    }
}

// Eliminar una alerta del historial
function eliminarAlerta(id) {
    var alertas = obtenerAlertas();
    var nuevas = alertas.filter(function(a) { return a.id !== id; });
    localStorage.setItem('alertas', JSON.stringify(nuevas));
    deleteFromSupabase(id);
}

// Eliminar todas las alertas (historial completo)
function eliminarTodasAlertas() {
    localStorage.setItem('alertas', JSON.stringify([]));
    eliminarTodoSupabase();
}

async function eliminarTodoSupabase() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLA_ALERTAS}?id=not.eq.0`, {
            method: 'DELETE',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Prefer': 'return=minimal'
            }
        });
        console.log('Supabase cleared:', response.status);
    } catch (e) {
        console.error('Error deleting all from Supabase:', e);
    }
}

// ============================================
// Configuracion de turnos
// ============================================
var HORARIOS_ALISTADOR_TURNO1 = ['08:00', '10:00', '12:00', '13:30'];
var HORARIOS_ALISTADOR_TURNO2 = ['16:00', '18:00', '20:00', '21:30'];
var HORARIOS_RECEPCION = {
    0: [],
    1: ['15:00'],
    2: ['15:00'],
    3: ['15:00'],
    4: ['15:00'],
    5: ['15:00'],
    6: ['11:30']
};

// ============================================
// Contraseñas de usuarios
// ============================================
var CONTRASENAS = {
    'juan': 'juan123',
    'anderson': 'anderzon123',
    'mateo': 'mateo123',
    'david': 'david123'
};

// ============================================
// Funcion para verificar contrasena
// ============================================
function verificarContrasena(username, contrasena) {
    return CONTRASENAS[username] === contrasena;
}

// ============================================
// Auto-sync al iniciar
// ============================================
(function initSync() {
    sincronizarAlertas();
    setInterval(function() {
        sincronizarAlertas();
    }, 30000);
})();