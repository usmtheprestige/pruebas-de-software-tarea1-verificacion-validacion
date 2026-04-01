# Tarea 1 - INF331 Pruebas de Software <br> Informe de Verificación vs Validación
- Leonardo Chacón Geminiani, 202273034-K
- Aarón Vargas Bermúdez, {rol}

## 1. Introducción


## 2. Análisis del requerimiento
### Ambigüedades detectadas

El sistema propuesto tiene múltiples vacíos de especificación que impiden una implementación directa. Dichos vacíos son parte del problema; entonces será necesario identificarlos y organizarlos antes de tomar decisiones de diseño.

Para facilitar su análisis, se agrupan según el aspecto del sistema que afectan.

---

### 2.1 Modelado de datos y entidades
(relacionado con la definición de las entidades principales del sistema [clientes, técnicos y reservas];
impacta directamente el modelo de datos)

- **Datos mínimos de cliente**  
  No se especifica qué atributos son obligatorios para registrar un cliente. No queda claro si basta con un nombre o si se requiere además información de contacto como teléfono o correo.

- **Datos mínimos de técnico**  
  De forma similar, no se define qué información debe almacenarse de un técnico. No está claro si se necesita solo identificación básica o también atributos como especialidad, disponibilidad o contacto.

- **Información mínima de una reserva**  
  El concepto de “reserva” no está formalizado. No se indica qué campos la componen: fecha, hora, cliente, técnico, dirección, tipo de problema, entre otros.

- **Criterio de unicidad**  
  No se establece qué atributo identifica de manera única a clientes o técnicos. Esto abre la posibilidad de duplicidad de registros (por ejemplo, nombres repetidos), lo que afecta la integridad de los datos.

---

### 2.2 Lógica de negocio y restricciones
(reglas operacionales del sistema, especialmente en la gestión de reservas)

- **Reservas en fechas pasadas**  
  No se define si el sistema debe permitir agendar reservas en el pasado, lo cual tiene implicancias directas en las validaciones.

- **Reservas superpuestas**  
  No se aclara si un técnico puede tener múltiples reservas en el mismo horario, lo que afecta la consistencia operativa del sistema.

- **Duración de la reserva**  
  No se especifica cuánto dura una atención técnica. Sin esta información, no es posible determinar correctamente conflictos de agenda.

- **Cancelación de reservas**  
  Aunque se menciona la funcionalidad de cancelar, no se definen sus reglas: si todas las reservas pueden cancelarse, si hay restricciones temporales o si una cancelación es reversible.

- **Estados de una reserva**  
  No existe una definición explícita de estados. No queda claro si el sistema requiere solo estados básicos (activa/cancelada) o un flujo más completo (pendiente, en curso, finalizada, etc.).

---

### 2.3 Consultas y comportamiento del sistema
(cómo el sistema expone la información y cómo se interpretan ciertos requerimientos funcionales)

- **Definición de “reservas futuras”**  
  No se especifica con precisión qué significa este concepto. No queda claro si incluye reservas canceladas ni bajo qué criterio deben ordenarse o filtrarse.

---

### 2.4 Arquitectura y aspectos no funcionales
(decisiones técnicas y de arquitectura, que no están definidas en el enunciado pero son necesarias para implementar el sistema)

- **Autenticación y control de acceso**  
  Aunque se menciona que el sistema debe ser “confiable”, no se define si debe existir autenticación ni qué operaciones requieren autorización.

- **Manejo de errores**  
  No se especifica cómo debe comportarse el sistema ante entradas inválidas, conflictos de horario o datos incompletos, lo que impacta tanto la UX como las pruebas.

- **Persistencia de datos**  
  No se indica cómo se deben almacenar los datos. Esto deja abierta la decisión entre distintas estrategias de persistencia (base de datos, servicios cloud, etc.).

- **Alcance funcional**  
  Se menciona que las solicitudes llegan por email y WhatsApp, pero no se define si el sistema debe integrarse con estos canales o solo operar como una herramienta interna.

---

Las ambigüedades mencionadas impactan el modelo de datos, la lógica de negocio, las validaciones y la arquitectura, afectando directamente el diseño del sistema. Por lo cual será necesario resolverlas explícitamente en las siguientes secciones del documento para asegurar coherencia entre requerimientos, implementación y pruebas.

## 3. Requerimiento mejorado
## 4. Alcance y exclusiones
## 5. Verificación vs validación en el proyecto
## 6. Decisiones de diseño frente a ambigüedades
## 7. Diseño e implementación general
## 8. Estrategia de pruebas
## 9. Casos de prueba
## 10. Pruebas que validan nuestros supuestos
## 11. Uso de IA en el proyecto
## 12. Reflexión final
## 13. Conclusiones
