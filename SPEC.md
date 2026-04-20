# Sistema de Avisos - Especificación

## 1. Project Overview

- **Nombre**: Sistema de Avisos con Vibración
- **Tipo**: WebApp con notificaciones locales
- **Funcionalidad**: Sistema de alertas con vibración y sonido para 3 trabajadores (recepción + 2 alistadores), controlado por un jefe que recibe códigos y puede desactivarlos
- **Usuarios**: 4 (jefe, recepción, alistador 1, alistador 2)

---

## 2. UI/UX Specification

### Layout Structure

**Pantallas**:
1. **Login** - selector de usuario + contraseña
2. **Panel Jefe** - recibe códigos, puede desactivar avisos activos
3. **Panel Recepción** - envía código de aviso programado
4. **Panel Alistadores** - recibe avisos según turno

### Visual Design

- **Color principal**: `#1E3A5F` (azul oscuro institucional)
- **Color acento**: `#FF6B35` (naranja vibrante para alertas)
- **Fondo**: `#0D1B2A` (azul muy oscuro)
- **Texto**: `#FFFFFF` principal, `#94A3B8` secundario
- **Estados**:
  - Alerta activa: fondo rojo `#DC2626` con animación pulse
  - Alerta desactivada: gris `#6B7280`
  - Éxito: verde `#10B981`

### Typography

- **Font**: 'JetBrains Mono' para códigos, 'Inter' para texto
- **Tamaños**: headings 24px, body 16px, códigos 32px bold

### Components

- **Botón alerta**: grande, con vibración (navigator.vibrate)
- **Card de código**: muestra código único generado
- **Temporizador**: cuenta atrás para próximos avisos
- **Lista de alertas activas**: con botón de desactivar (solo jefe)

---

## 3. Functionality Specification

### Autenticación

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| jefe | jefe123 | Recibe códigos, desactiva alertas |
| recepcion | recepcion123 | Envía códigos de aviso |
| alistador1 | alistador123 | Recibe avisos turno 1 |
| alistador2 | alistador2 | Recibe avisos turno 2 |

### Horarios de Avisos

**Recepción**:
- Lunes a viernes: 3:00 PM
- Sábados: 11:30 AM

**Alistadores**:
- Turno 1 (6 AM - 2 PM): 8:00, 10:00, 12:00, 1:30 PM
- Turno 2 (2 PM - 10 PM): 4:00, 6:00, 8:00, 9:30 PM

### Flujo de Alertas

1. **Generación automática**: según horario, se crea código único (ej: `RC-20260420-3PM`)
2. **Notificación**: vibración (500ms) + sonido beep
3. **Estado**: activo hasta que jefe lo desactive
4. **Desactivación**: solo el jefe puede desactivar con su contraseña

### Base de datos Supabase

**Tablas**:
- `usuarios`: id, username, password, rol
- `alertas`: id, tipo (recepcion/alistador), codigo, activa, created_at, desactivada_por

---

## 4. Acceptance Criteria

- [ ] Login funciona con los 4 usuarios
- [ ] Jefe puede ver alertas activas y desactivarlas
- [ ] Recepción ve próximo aviso programado
- [ ] Alistadores ven avisos según su turno
- [ ] Vibración funciona en móviles (navigator.vibrate)
- [ ] Sonido beep al recibir aviso
- [ ] Alertas no se desactivan automáticamente
- [ ] Códigos únicos por fecha y hora
- [ ] Guardado en Supabase