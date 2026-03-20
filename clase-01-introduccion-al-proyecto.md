# Clase 1 - Introducción al Proyecto

## Índice

1. [Contexto del Proyecto](#contexto-del-proyecto)
2. [Consideraciones de Diseño](#consideraciones-de-diseño)
3. [Diagramas del Proyecto](#diagramas-del-proyecto)
4. [Ciclo de Vida del Desarrollo de Software (SDLC)](#ciclo-de-vida-del-desarrollo-de-software-sdlc)

## Resumen

Clase introductoria al proyecto **Arka**, una empresa de tecnología que busca migrar sus operaciones al mundo digital. Se aborda el contexto del negocio (retail), las Historias de Usuario del backlog, consideraciones clave de diseño para un marketplace, y las fases del Ciclo de Vida del Desarrollo de Software (SDLC).

---

## Contexto del Proyecto

**Arka** es una empresa de venta de equipo de tecnología que busca migrar sus operaciones a la web:

- Gestión de inventario
- Gestión de pedidos
- Canal digital / sitio de compras / marketplace

**Objetivo:** Pasar del mundo físico al virtual.

> Se recomienda estudiar a profundidad el nicho de negocio: **Retail**.

### Documentación del Proyecto

- [Backlog del proyecto Java Backend Arka](assets/PDFs/Backlog%20del%20proyecto%20Java%20Backend%20Arka.pdf)
- [Proyecto Arka - Versión 1](assets/PDFs/Proyecto%20Arka%201.pdf)
- [Proyecto Java Backend Reto - Versión 2](assets/PDFs/Proyecto%20Java%20Backend%20Reto%20V2.pdf)

---

## Consideraciones de Diseño

A partir del análisis de las Historias de Usuario del proyecto, se identifican las siguientes consideraciones clave:

### Modelo de Datos

- El campo de **categoría** debe implementarse como una tabla/clase independiente (tabla maestra)
- Atributos adicionales a considerar para productos de venta:
  - Moneda e impuestos
  - Tipos numéricos: entero vs decimal
  - Diferencia entre **Costo** (de compra) y **Precio** (de venta)

### Validaciones

- El precio debe ser mayor al costo
- El precio no debe estar vacío

### Gestión de Inventario

- **Puntos de re-orden:** Automatizar alertas cuando el stock alcance un mínimo definido
- **Descuento de inventario:** Puede darse por:
  - Compras de clientes
  - **Mermas** (daños de producto, robo, etc.)
- **Reserva de stock:** Implementar un sistema de reserva temporal con tiempo límite para validar disponibilidad

### Gestión de Pedidos

**Máquina de estados** para los diferentes estados de un pedido:

| Estado      | Descripción                              |
| ----------- | ---------------------------------------- |
| Pendiente   | Pedido creado, pendiente de confirmación |
| Confirmado  | Pedido confirmado por el sistema         |
| En despacho | Pedido en proceso de distribución        |
| Entregado   | Pedido entregado al cliente              |

- El total de ventas (en dinero y número de productos) se contabiliza solo con pedidos en estado **CONFIRMADO**

### Reportes y Analítica

- **Rentabilidad en reportes periódicos:** En retail se utiliza el concepto de **Costo Promedio** para manejar variables dinámicas (costos que cambian durante el periodo analizado)
- **Carritos abandonados:** Monitorear y contactar clientes con carritos abandonados para recuperar ventas potenciales
  - Se debe definir el tiempo después del cual un carrito se considera abandonado
- **Automatización periódica:** Los **Cron Jobs** son el mecanismo más común para automatizar acciones periódicas en un microservicio

### Priorización de Historias de Usuario

![Priorización de Historias de Usuario](assets/clase-01-introduccion-al-proyecto/priorizaciones.png)

---

## Diagramas del Proyecto

**Diagramas obligatorios:**

- Diagrama de Base de datos
- Diagrama de Infraestructura
- Diagrama de Arquitectura

**Diagramas adicionales recomendados:**

- Diagrama de clases
- Diagrama de despliegue
- Diagrama de DDD

---

## Ciclo de Vida del Desarrollo de Software (SDLC)

El ciclo de vida del desarrollo de software es un proceso estructurado que se utiliza para diseñar, desarrollar y probar software de alta calidad. A continuación se describen las principales fases:

### 1. Planificación

En esta fase inicial se definen los objetivos del proyecto, se estiman los recursos necesarios y se establece el cronograma.

> La estimación inicial suele basarse en la experiencia de profesionales que han enfrentado proyectos similares, permitiendo estimaciones preliminares antes del análisis detallado.

### 2. Análisis (del Negocio)

Se estudian las necesidades del negocio y se definen los requisitos del sistema. Es crucial entender el dominio del problema.

**Estrategias y herramientas:**

- **DDD (Domain-Driven Design):** Enfoque de desarrollo guiado por el dominio del negocio
- **Diagramas de flujo:** Ayudan a visualizar procesos
  - **Diagrama de ojo de pez:** Para análisis de causa-efecto
  - **Diagrama BPMN (Business Process Model and Notation):** Estándar internacional para diagramar procesos de negocio

![Diagrama de Flujo del Proceso](assets/clase-01-introduccion-al-proyecto/diagrama_flujo.png)

### 3. Diseño

Se crea la arquitectura del sistema y se definen los componentes técnicos.

**Herramientas:**

- **Diagramas UML:** Para modelar la estructura y comportamiento del sistema
- Diagramas de base de datos
- Diagramas de arquitectura

### 4. Desarrollo

Fase de implementación donde se escribe el código según las especificaciones del diseño.

### 5. Pruebas

Se verifica que el software funcione correctamente y cumpla con los requisitos establecidos.

**Tipos de pruebas:**

- Unitarias
- Integración
- Sistema
- Aceptación

### 6. Implementación

Se despliega el software en el ambiente de producción para que los usuarios finales puedan utilizarlo.

### 7. Mantenimiento

Se realizan actualizaciones, correcciones de errores y mejoras continuas del sistema.
