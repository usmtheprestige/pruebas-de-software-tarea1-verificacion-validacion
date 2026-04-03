# Sistema de Gestión de Reservas - Atención Técnica

Aplicación web para gestionar reservas de atención técnica de electrodomésticos con separación clara entre flujos de **técnico** y **cliente**.

---

## 📋 Tabla de Contenidos

- [Características](#características)
- [Requisitos Previos](#requisitos-previos)
- [Instalación y Configuración](#instalación-y-configuración)
- [Cómo Usar](#cómo-usar)
- [Flujos de Negocio](#flujos-de-negocio)
- [Validaciones](#validaciones)
- [Estructura de Datos](#estructura-de-datos)
- [Tecnologías](#tecnologías)
- [Solución de Problemas](#solución-de-problemas)

---

## ✨ Características

### Gestión de Clientes
- Registrar nuevos clientes con nombre, teléfono y correo
- Validación de correo electrónico único
- Lista de clientes registrados

### Gestión de Técnicos
- Registrar nuevos técnicos con nombre, especialidad y teléfono
- Especialidades disponibles: Neveras, Lavadoras, Hornos, Microondas, General
- Lista de técnicos registrados

### Flujo de Técnico: Publicar Horarios
- Los técnicos publican horarios disponibles
- Campos requeridos: Técnico, Fecha, Hora
- Muestra tabla de horarios publicados
- Validación de conflictos de horario por técnico

### Flujo de Cliente: Reservar Servicio
- Los clientes seleccionan un horario disponible
- Campos requeridos: Cliente, Horario Disponible, Descripción del Problema
- Tabla con detalles del técnico, especialidad, fecha y hora
- Al reservar, la descripción se guarda en la reserva

### Gestión de Reservas
- Visualizar todas las reservas activas futuras
- Ver detalles: cliente, técnico, fecha, hora, descripción, estado
- Cancelar reservas (vuelven a estado disponible)

---

## ⚙️ Requisitos Previos

### Software Necesario
- **Navegador web moderno** (Chrome, Firefox, Safari, Edge)
- **Acceso a internet** (para Firebase y CDN de Tailwind)

### No se requiere:
- ✓ Node.js
- ✓ Python
- ✓ Servidor local
- ✓ Base de datos local

---

## 🚀 Instalación y Configuración

### Paso 1: Descargar o Clonar el Proyecto

**Opción A - Si tienes Git:**
```bash
git clone <URL-del-repositorio>
cd pruebas-de-software-tarea1-verificacion-validacion
```

**Opción B - Si descargaste un ZIP:**
1. Descomprime el archivo ZIP
2. Abre la carpeta extraída

### Paso 2: Abrir el Proyecto en el Navegador

**Opción A - Arrastrar archivo (más simple):**
1. Abre la carpeta del proyecto
2. Ve a la carpeta `src`
3. Arrastra el archivo `index.html` al navegador

**Opción B - Click derecho:**
1. Haz click derecho en `src/index.html`
2. Selecciona "Abrir con" → tu navegador favorito

**Opción C - Usar un servidor local (recomendado):**

**Con Python 3:**
```bash
cd pruebas-de-software-tarea1-verificacion-validacion
python -m http.server 8000
```
Luego abre en el navegador: `http://localhost:8000/src/index.html`

**Con Node.js (http-server):**
```bash
npm install -g http-server
http-server -p 8000
```
Luego abre en el navegador: `http://localhost:8000/src/index.html`

### Paso 3: Verificar Conexión a Firebase

Al cargar la página, verifica en la consola del navegador:
- **Éxito:** Deberías ver ✅ "Firebase funciona"
- **Error:** Si ves un error, contacta al administrador

Para abrir la consola:
- `F12` en tu teclado, o
- Click derecho → "Inspeccionar" → Pestaña "Consola"

---

## 🎯 Cómo Usar

### 1. Registrar Clientes

1. Haz click en la pestaña **"Clientes"**
2. Completa el formulario:
   - **Nombre:** Mínimo 2 caracteres
   - **Teléfono:** 8-12 dígitos
   - **Correo:** Formato válido (ej: usuario@dominio.com)
3. Haz click en **"Registrar Cliente"**
4. Verifica el mensaje de éxito verde
5. El cliente aparece en la tabla inferior

### 2. Registrar Técnicos

1. Haz click en la pestaña **"Técnicos"**
2. Completa el formulario:
   - **Nombre:** Mínimo 2 caracteres
   - **Especialidad:** Selecciona una de la lista
   - **Teléfono:** 8-12 dígitos
3. Haz click en **"Registrar Técnico"**
4. Verifica el mensaje de éxito
5. El técnico aparece en la tabla inferior

### 3. Técnico: Publicar Horario Disponible

1. Haz click en la pestaña **"Publicar Horario (Técnico)"**
2. Completa el formulario:
   - **Técnico:** Selecciona de la lista
   - **Fecha:** Elige una fecha futura
   - **Hora:** Elige una hora (formato 24h)
3. Haz click en **"Publicar Horario"**
4. El horario aparece en la tabla "Horarios Publicados"

### 4. Cliente: Reservar Servicio

1. Haz click en la pestaña **"Reservar (Cliente)"**
2. Completa el formulario:
   - **Cliente:** Selecciona un cliente registrado
   - **Horario Disponible:** Selecciona un horario de la lista
   - **Descripción del Problema:** Describe el problema (mín. 5 caracteres)
3. Haz click en **"Reservar Servicio"**
4. Verifica el mensaje de éxito

### 5. Ver Reservas Activas

1. Haz click en la pestaña **"Ver Reservas"**
2. Visualiza todas las reservas activas futuras
3. Cada fila muestra:
   - Cliente y técnico asignado
   - Fecha y hora
   - Descripción del problema
   - Estado (activa)
   - Botón para cancelar si es necesario

### 6. Cancelar una Reserva

1. Ve a la pestaña **"Ver Reservas"**
2. Encuentra la reserva que deseas cancelar
3. Haz click en el botón **"Cancelar"** de esa fila
4. La reserva será cancelada y el horario vuelve a estar disponible

---

## 📊 Flujos de Negocio

### Flujo del Técnico: Publicar Disponibilidad

```
Técnico registrado
    ↓
Va a "Publicar Horario (Técnico)"
    ↓
Selecciona: Técnico, Fecha, Hora
    ↓
Publica horario como "disponible"
    ↓
Horario aparece en lista de disponibles
```

### Flujo del Cliente: Reservar Servicio

```
Cliente registrado
    ↓
Ve horarios disponibles
    ↓
Va a "Reservar (Cliente)"
    ↓
Selecciona: Cliente, Horario, Descripción
    ↓
Reserva es confirmada como "activa"
    ↓
Se guarda descripción del problema
    ↓
Aparece en "Ver Reservas"
```

### Estados de Reserva

- **Disponible:** Horario publicado por técnico, esperando cliente
- **Activa:** Cliente ha reservado el horario con descripción del problema

---

## ✅ Validaciones

| Campo | Validación |
|-------|-----------|
| **Nombre Cliente/Técnico** | Mínimo 2 caracteres |
| **Teléfono** | 8-12 dígitos, solo números |
| **Correo** | Formato válido (usuario@dominio.com) |
| **Correo Único** | No puede haber dos clientes con mismo correo |
| **Fecha** | Must be in the future |
| **Hora** | Required, format HH:MM |
| **Conflicto Técnico** | Un técnico no puede tener dos "disponibles" a la misma hora |
| **Conflicto Cliente** | Un cliente no puede tener dos reservas "activas" a la misma hora |
| **Descripción** | Mínimo 5 caracteres |
| **Especialidad** | Requerida, debe ser una de: Neveras, Lavadoras, Hornos, Microondas, General |

---

## 📦 Estructura de Datos (Firebase)

### Colección: `clientes`
```json
{
  "id": "doc-id",
  "nombre": "Juan García",
  "telefono": "3001234567",
  "correo": "juan@example.com"
}
```

### Colección: `tecnicos`
```json
{
  "id": "doc-id",
  "nombre": "Carlos López",
  "especialidad": "Neveras",
  "telefono": "3101234567"
}
```

### Colección: `reservas`
```json
{
  "id": "doc-id",
  "tecnicoId": "ref-to-tecnico",
  "clienteId": "ref-to-cliente",      // null si está disponible
  "fecha": "2026-04-15",
  "hora": "10:00",
  "descripcion": "Nevera no enfría",  // null si está disponible
  "estado": "disponible",              // o "activa"
  "fechaCreacion": "2026-04-02T..."
}
```

---

## 💻 Tecnologías

| Tecnología | Propósito | Ubicación |
|-----------|----------|-----------|
| **HTML5** | Estructura semántica | `src/index.html` |
| **CSS3 + Tailwind** | Estilos responsivos | Tailwind CDN + `src/styles.css` |
| **JavaScript ES6** | Lógica de negocio | `src/app.js` |
| **Firebase Firestore** | Base de datos en la nube | `src/firebase.js` |

---

## 🐛 Solución de Problemas

### Error: "No hay conexión a Firebase"

**Causas posibles:**
1. Sin conexión a internet
2. Credenciales de Firebase inválidas
3. Proyecto Firebase eliminado o deshabilitado

**Solución:**
- Verifica tu conexión a internet
- Comprueba que Firebase esté disponible
- Abre la consola (F12) para ver errores específicos

### Error: "No puedo registrar clientes"

**Causas posibles:**
1. Validación fallida (revisa los requisitos en la tabla de validaciones)
2. Correo ya existe en la base de datos

**Solución:**
- Lee el mensaje de error verde/rojo
- Usa un correo electrónico diferente
- Verifica el formato del teléfono

### Reservas no aparecen en la lista

**Causas posibles:**
1. La reserva es de fecha/hora pasada
2. La página no se recargó después de reservar

**Solución:**
- Recarga la página (F5)
- Asegúrate de usar fechas futuras
- Verifica que te encuentres en la pestaña correcta

### Los horarios no aparecen en el select de "Reservar"

**Posibles razones:**
1. No hay horarios publicados aún
2. Los horarios publicados ya fueron reservados
3. Los horarios son de fecha/hora pasada

**Solución:**
- Ve a "Publicar Horario" y crea nuevos horarios
- Recarga la página
- Verifica que los horarios sean fecha/hora futura

---

## 📝 Notas Importantes

- **Datos en la nube:** Todo se guarda en Firebase, accesible desde cualquier dispositivo
- **Tiempo real:** Los cambios se sincronizan automáticamente
- **Persistencia:** Los datos permanecen después de cerrar el navegador
- **Sin autenticación:** Por simplicidad, no hay login (para educativo)
- **Zona horaria:** Usa la hora local de tu navegador

---

## 📧 Contacto y Soporte

Para reportar problemas o sugerencias, contacta al equipo de desarrollo.

**Versión:** 2.0.0  
**Última actualización:** Abril 2026
- Agregar notificaciones
- Implementar backend con base de datos
- Agregar autenticación de usuarios
