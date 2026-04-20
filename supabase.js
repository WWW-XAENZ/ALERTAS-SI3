// ============================================
// SISTEMA DE AVISOS SI3 - Configuracion
// ============================================

// Credenciales Supabase (no modificar)
const SUPABASE_URL = 'https://wuvvwoojcqzcvwjwcgce.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1dnZ3b29qY3F6Y3Z3andjZ2NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2ODgwMDEsImV4cCI6MjA5MjI2NDAwMX0.54gwvzl8JEOsjDHLmnnKAKPCbj2XjJ3t3obwFyOIYEw';

// ============================================
// Mapas de nombres de usuarios
// ============================================
var NOMBRES_USUARIOS = {
    'juan': 'Juan Pablo Londoño',
    'anderson': 'Anderson Rojas',
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
function guardarAlerta(codigo, tipo, enviadoPor) {
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
function completarAlerta(id) {
    var alertas = obtenerAlertas();
    for (var i = 0; i < alertas.length; i++) {
        if (alertas[i].id === id) {
            alertas[i].activa = false;
            alertas[i].completada_at = new Date().toISOString();
            break;
        }
    }
    localStorage.setItem('alertas', JSON.stringify(alertas));
}

// Completar todas las alertas
function completarTodasAlertas() {
    var alertas = obtenerAlertas();
    alertas.forEach(function(a) { 
        if (a.activa) {
            a.activa = false;
            a.completada_at = new Date().toISOString();
        }
    });
    localStorage.setItem('alertas', JSON.stringify(alertas));
}

// Eliminar una alerta del historial
function eliminarAlerta(id) {
    var alertas = obtenerAlertas();
    var nuevas = alertas.filter(function(a) { return a.id !== id; });
    localStorage.setItem('alertas', JSON.stringify(nuevas));
}

// Eliminar todas las alertas (historial completo)
function eliminarTodasAlertas() {
    localStorage.setItem('alertas', JSON.stringify([]));
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
    'anderson': 'anderson123',
    'mateo': 'mateo123',
    'david': 'david123'
};

// ============================================
// Funcion para verificar contrasena
// ============================================
function verificarContrasena(username, contrasena) {
    return CONTRASENAS[username] === contrasena;
}