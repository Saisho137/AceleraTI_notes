# Clase Nivelación - Metodologías Ágiles

## ¿Qué son las metodologías ágiles?

Son métodos de gestión de proyectos basados en ciclos cortos que fomentan la colaboración, la entrega continua de valor y la adaptación rápida a los cambios del cliente.

**Ejemplo:**

Un equipo de desarrollo lanza una app para reservas de citas médicas. Cada 2 semanas liberan una nueva versión con mejoras, como filtrado por especialidad o recordatorios por correo, ajustándose a lo que los usuarios van solicitando durante el proceso.

## Contexto Histórico

### Antes del 2000

Los proyectos seguían modelos rígidos como el cascada, con entregas al final y poca flexibilidad ante cambios.

### 2001 - Nace el Manifiesto Ágil

17 expertos proponen un nuevo enfoque basado en 4 valores y 12 principios que priorizan la colaboración, entrega continua y adaptación al cambio.

**Manifiesto Ágil:** <https://agilemanifesto.org/iso/es/manifesto.html>

### Comparación clave

**Tradicional:** planificación rígida y entregas finales.
**Ágil:** ciclos cortos, entrega continua y ajustes constantes.

### Metodologías ágiles más utilizadas

- **SCRUM:** Estructura formal con roles y sprints
- **Kanban:** Gestión visual y flujo continuo
- **XP (Extreme Programming):** Buenas prácticas técnicas
- **Lean:** Eliminar desperdicios y entregar valor rápido

## Scrum

### ¿Qué es Scrum?

Scrum es un marco de trabajo ágil que estructura el trabajo en ciclos cortos y predecibles llamados sprints, donde se entrega un incremento funcional del producto. Promueve la transparencia, la inspección y la adaptación constante.

### Roles en Scrum

- **Product Owner (PO):** Maximiza el valor del producto y gestiona el Product Backlog
- **Scrum Master (SM):** Asegura que Scrum se entienda y se aplique correctamente
- **Development Team:** Construye el producto y entrega incrementos funcionales

### Artefactos en Scrum

- **Product Backlog:** Lista priorizada de todo lo que necesita el producto, gestionada por el PO
- **Sprint Backlog:** Conjunto de tareas que el equipo selecciona del Product Backlog para trabajar durante un sprint
- **Incremento:** Resultado funcional y estable del trabajo realizado durante un sprint

### Eventos en Scrum

- **Sprint:** Ciclo de trabajo (de 1 a 4 semanas) en el que el equipo desarrolla una parte funcional del producto
- **Sprint Planning:** Reunión al inicio del sprint donde se define qué se va a hacer y cómo se va a lograr
- **Daily Scrum:** Reunión diaria de 15 minutos para que el equipo sincronice avances, planifique el día y detecte bloqueos
- **Sprint Review:** Al final del sprint, el equipo muestra el trabajo hecho y recoge feedback del cliente o stakeholders
- **Sprint Retrospective:** Reunión interna para reflexionar y mejorar: ¿qué funciona, qué no y qué se puede hacer mejor en el próximo sprint?

### Historias de Usuario

#### Estructura de una Historia de Usuario

```text
Como [tipo de usuario]
Quiero [objetivo]
Para [beneficio]

Criterios de aceptación:
- [Criterio 1]
- [Criterio 2]
- [...]
```

**Ejemplo:**

```text
Como usuario cliente
Quiero iniciar sesión
Para poder acceder a la plataforma

Criterios de aceptación: 
- Cuando se digite la contraseña, los caracteres deben ser reemplazados por '*'
- Debe validarse que tanto correo como contraseña sean digitados para iniciar sesión
- El sistema debe mostrar un mensaje de error claro si las credenciales son incorrectas
```

### Componentes adicionales

- **Definition of Ready (DoR):** Checklist para asegurar que una Historia de Usuario está lista para ser tomada por el equipo de desarrollo
- **Definition of Done (DoD):** Checklist para determinar que la Historia de Usuario está completamente terminada
- **Story Points:** Representación del esfuerzo necesario para completar la historia
- **Pivote:** Referencia en puntos/días para puntuar las historias

### Proceso de Scrum

![Proceso de Scrum](images/clase_nivelación/SCRUM%20PROCESS.png)

## Otras metodologías ágiles

### Kanban

**Enfoque:** Gestión visual del flujo de trabajo

**Características principales:**

- Tablero visual con columnas que representan estados del trabajo (Por hacer, En progreso, Hecho)
- Límite de trabajo en progreso (WIP - Work In Progress)
- Flujo continuo sin iteraciones fijas
- Enfoque en reducir cuellos de botella

**Ideal para:** Equipos que necesitan flexibilidad y flujo continuo de tareas

### Extreme Programming (XP)

**Enfoque:** Excelencia técnica y prácticas de desarrollo

**Características principales:**

- Programación en pares (Pair Programming)
- Desarrollo guiado por pruebas (TDD - Test Driven Development)
- Integración continua
- Refactorización constante del código
- Releases frecuentes y pequeños
- Diseño simple y retroalimentación continua

**Ideal para:** Proyectos que requieren alta calidad técnica y cambios frecuentes en los requisitos

### Lean Software Development

**Enfoque:** Eliminar desperdicios y maximizar el valor

**Características principales:**

- Eliminar todo lo que no agregue valor
- Amplificar el aprendizaje
- Decidir lo más tarde posible
- Entregar lo más rápido posible
- Empoderar al equipo
- Construir integridad
- Optimizar el todo, no las partes

**Ideal para:** Organizaciones que buscan eficiencia operativa y reducción de desperdicio

### Feature-Driven Development (FDD)

**Enfoque:** Desarrollo orientado a características

**Características principales:**

- Desarrollo basado en funcionalidades específicas
- Ciclos cortos de 2 semanas
- Fuerte énfasis en el modelado del dominio
- Inspecciones de código regulares
- Reportes de progreso frecuentes

**Ideal para:** Proyectos grandes con equipos distribuidos

### Crystal

**Enfoque:** Adaptabilidad según tamaño y criticidad del proyecto

**Características principales:**

- Familia de metodologías (Clear, Yellow, Orange, Red) según complejidad
- Comunicación osmótica (equipo en el mismo espacio)
- Reflexión frecuente y mejora continua
- Seguridad personal en el equipo
- Enfoque en las personas sobre los procesos

**Ideal para:** Equipos que necesitan una metodología adaptable a su contexto específico
