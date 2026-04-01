# Sistema de Gestión de Reservas - Atención Técnica

Aplicación web simple para gestionar reservas de atención técnica de electrodomésticos.

## Instrucciones de Ejecución

1. Abre el archivo `src/index.html` directamente en tu navegador web.
   - Click derecho en `src/index.html` → Abrir con → navegador favorito
   - O arrastra el archivo al navegador
   - O usa un servidor local: `python -m http.server` (Python 3) o `npx http-server`

2. La aplicación iniciará con datos de ejemplo listos para usar.

3. Usa las secciones de navegación para:
   - Registrar clientes
   - Registrar técnicos
   - Agendar reservas
   - Consultar reservas futuras

## Características

- **Registrar Clientes**: Nombre, teléfono y correo obligatorios
- **Registrar Técnicos**: Nombre, especialidad y teléfono obligatorios
- **Agendar Reservas**: Cliente, técnico, fecha, hora y descripción del problema
- **Consultar Reservas**: Lista de reservas futuras ordenadas por fecha y hora
- **Cancelar Reservas**: Opción de cancelar reservas activas

## Reglas de Negocio

- Solo se permiten reservas en fechas y horas futuras
- No se permiten reservas superpuestas para el mismo técnico
- Las reservas pueden tener dos estados: activa o cancelada
- La vista de reservas futuras muestra solo reservas activas
- Las reservas se ordenan automáticamente por fecha y hora ascendente

## Tecnologías Usadas

- **HTML5**: Estructura semántica
- **CSS3**: Estilos complementarios
- **Tailwind CSS**: Framework CSS vía CDN
- **JavaScript Vanilla (ES6)**: Lógica de negocio sin frameworks
- **localStorage**: Persistencia de datos en el navegador

## Limitaciones y Consideraciones

- **No hay backend**: Los datos se guardan solo en el navegador del usuario
- **localStorage limitado**: Máximo ~5-10MB por dominio según navegador
- **Datos locales**: Cada navegador/dispositivo tiene su propia base de datos
- **Sin seguridad**: No se necesita autenticación, solo para uso local/educativo
- **Compatible**: Funciona en todos los navegadores modernos con soporte para localStorage
- **Offline**: Funciona completamente sin conexión a internet

## Estructura de Datos (localStorage)

```json
{
  "clientes": [
    {
      "id": "c8xwz9...",
      "nombre": "Ana Martínez",
      "telefono": "3001234567",
      "correo": "ana@example.com"
    }
  ],
  "tecnicos": [
    {
      "id": "t2hy5k...",
      "nombre": "Juan Rodríguez",
      "especialidad": "Neveras",
      "telefono": "3011111111"
    }
  ],
  "reservas": [
    {
      "id": "r4mp2n...",
      "clienteId": "c8xwz9...",
      "tecnicoId": "t2hy5k...",
      "fecha": "2026-04-05",
      "hora": "10:00",
      "descripcion": "Revisión general de nevera",
      "estado": "activa"
    }
  ]
}
```

## Validaciones Implementadas

- Correo electrónico válido
- Campos obligatorios no vacíos
- Fechas y horas futuras solamente
- No permite reservas superpuestas para el mismo técnico
- Selección obligatoria de cliente y técnico

## Mejora Futura (Opcional)

Para mejorar la aplicación en el futuro, podrías:
- Agregar edición de clientes/técnicos
- Exportar/importar datos
- Filtrar reservas por técnico o cliente
- Agregar notificaciones
- Implementar backend con base de datos
- Agregar autenticación de usuarios
