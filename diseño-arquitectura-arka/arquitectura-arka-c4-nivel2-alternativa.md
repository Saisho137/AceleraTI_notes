# Documento de Diseño Arquitectónico - Backend E-commerce Arka

Este documento centraliza las decisiones arquitectónicas, tecnológicas y de diseño para la implementación de la plataforma B2B de Arka. Su objetivo es servir como fuente de verdad para los equipos de desarrollo, garantizando que el sistema resuelva los problemas críticos de negocio (como las sobreventas y la falta de autogestión) mediante un enfoque escalable, resiliente y dirigido por el dominio.

---

## 1. Stack Tecnológico y de Infraestructura

El sistema se construirá utilizando una arquitectura de microservicios reactivos, desplegados sobre infraestructura de nube nativa.

- **Lenguaje y Framework Core:** Java 21 con Spring Boot. Se utilizará Spring WebFlux para habilitar un enfoque reactivo (Non-blocking I/O), ideal para manejar la alta concurrencia requerida por el negocio.
- **Persistencia (R2DBC y Drivers Reactivos):**
  - _PostgreSQL:_ Motor relacional (ACID) conectado vía R2DBC para garantizar operaciones reactivas de bases de datos transaccionales.
  - _DynamoDB:_ Base de datos NoSQL clave-valor en AWS para latencias de un solo dígito (conectada vía AWS SDK).
  - _MongoDB:_ Base de datos NoSQL documental, conectada mediante Reactive MongoDB Driver.
- **Mensajería y Eventos (Broker):** Apache Kafka. Actuará como el bus central para la Arquitectura Dirigida por Eventos (EDA) y la orquestación de la Saga.
- **Gateway:** AWS ApiGateway + ALB para el enrutamiento de peticiones HTTP, rate limiting y delegación de seguridad.
- **Infraestructura (AWS):**
  - _Autenticación:_ AWS Cognito (IdP administrado).
  - _Notificaciones:_ Amazon SES (Simple Email Service) para la renderización y envío de plantillas HTML transaccionales.
- **Integraciones de Terceros (Sistemas Externos):**
  - _Mercado Pago:_ Pasarela de pagos para LATAM.
  - _APIs Externas:_ Proveedores (abastecimiento) y Operadores Logísticos (Shipping).

---

## 2. Decisiones Arquitectónicas Core

La solución de Arka se rige por los siguientes patrones y enfoques de arquitectura de software:

1. **Domain-Driven Design (DDD):** El diseño está segregado en Contextos Delimitados (Bounded Contexts) que definen los límites de cada microservicio, asegurando el uso del Lenguaje Ubicuo.
2. **Database per Service:** Cada microservicio posee y gestiona exclusivamente su propio repositorio de datos, lo que evita el acoplamiento y cuellos de botella.
3. **Event-Driven Architecture (EDA):** Comunicación asíncrona entre dominios mediante Apache Kafka para garantizar la resiliencia y el desacoplamiento.
4. **Transactional Outbox Pattern:** Implementado en los servicios transaccionales (Order, Payment, Shipping) utilizando bases de datos relacionales para evitar el problema de "Dual-Write". Garantiza que las mutaciones de estado y la publicación de eventos hacia Kafka sean atómicas.
5. **CQRS (Command Query Responsibility Segregation):** Utilizado por el _Reporter Service_, el cual consume eventos de Kafka para nutrir sus vistas materializadas en PostgreSQL, optimizando las consultas de analítica (OLAP) sin afectar las bases transaccionales (OLTP).

---

## 3. Asignación de Bases de Datos por Microservicio

Bajo el patrón _Database per Service_, se seleccionó el motor de persistencia óptimo para cada dominio:

- **Order Service:** `PostgreSQL` (Gestión del ciclo de vida y orquestación con soporte ACID).
- **Inventory Service:** `PostgreSQL` (Prevención de sobreventas exigiendo bloqueos transaccionales estrictos ACID).
- **Payment Service:** `PostgreSQL` (Manejo de estado financiero, tabla Outbox e Idempotencia).
- **Shipping Service:** `PostgreSQL` (Cotizaciones, persistencia de guías y protección contra caídas del servicio logístico externo).
- **Reporter Service:** `PostgreSQL` (Vistas materializadas y analítica para reportes mediante CQRS).
- **Catalog Service:** `DynamoDB` (Catálogo de lectura masiva, alto rendimiento y esquema flexible).
- **Cart Service:** `DynamoDB` (Persistencia a largo plazo para rastreo de carritos abandonados sin pérdida de información, soportando requerimientos de recuperación de ventas).
- **Notification Service:** `MongoDB` (Almacenamiento de historiales de mensajes disparados y plantillas semiestructuradas JSON).

---

## 4. Flujo de Transacciones: Transacción Síncrona Crítica y Saga Orquestada

Para resolver los problemas de concurrencia y orquestar el flujo distribuido de la compra, se implementa un modelo híbrido:

### Fase 1: Prevención de Sobreventas (Síncrono REST/HTTP)

El mayor problema actual de Arka es la sobreventa de productos. Dejar el descuento a la consistencia eventual generaría vulnerabilidad frente a concurrencias altas.

1. El cliente B2B envía la solicitud de creación de orden al `API Gateway`.
2. El `Order Service` inicia su transacción local.
3. El `Order Service` hace una petición **SÍNCRONA (HTTP/REST)** al `Inventory Service` para reservar los productos.
4. El `Inventory Service` ejecuta un bloqueo en `PostgreSQL`, verifica y disminuye el stock disponible. Si no hay stock, la petición HTTP falla inmediatamente y la orden es rechazada.
5. Si es exitoso, el `Order Service` consolida la orden en estado `PENDIENTE_PAGO` y persiste en su base de datos.

### Fase 2: Saga Orquestada de Procesamiento (Asíncrono vía Kafka)

A partir de la reserva de stock exitosa, el `Order Service` toma el rol de **Orquestador Central** del Patrón Saga:

1. **Ejecución de Pago:** El `Order Service` publica un comando vía Kafka solicitando el cobro. El `Payment Service` lo consume, procesa la transacción contra Mercado Pago e informa el resultado (`PaymentSuccess` o `PaymentFailed`).
2. **Confirmación y Despacho:** Si el pago es exitoso, el `Order Service` actualiza la orden a `CONFIRMADO` y publica un comando para logística. El `Shipping Service` consume, cotiza con la API de terceros y emite un evento `ShippingGenerated`.
3. **Compensación (Rollback):** Si el pago falla, el `Order Service` reacciona al fallo publicando un comando asíncrono de compensación (`ReleaseStockCommand`). El `Inventory Service` libera las unidades reservadas devolviéndolas al stock.

---

## 5. Máquina de Estados de la Orden

El `Order Service` administra estrictamente los siguientes estados en su base de datos, según lo exige el negocio:

1. **PENDIENTE_RESERVA:** Estado efímero de inicialización de la entidad.
2. **PENDIENTE_PAGO:** La validación síncrona con el Inventario fue exitosa. La orden asegura los productos, pero aguarda validación monetaria.
3. **CONFIRMADO:** El `Payment Service` notificó un pago exitoso vía Kafka. En este estado la orden se contabiliza en los reportes de ventas.
4. **EN_DESPACHO:** El `Shipping Service` ha generado exitosamente la guía y asignado el transporte de la mercancía.
5. **ENTREGADO:** El operador logístico externo notifica (vía webhook) la recepción física por parte del almacén B2B.
6. **CANCELADO (Estado de Fallo):** La orden fue abortada, ya sea porque falló la reserva síncrona de inventario o porque el pago asíncrono fue rechazado y el orquestador ejecutó las compensaciones de stock.

---

## 6. Catálogo de Eventos (Event-Driven Architecture)

Los siguientes **Integration Events** fluirán a través de los tópicos de Apache Kafka para notificar cambios de estado entre los Contextos Delimitados (Bounded Contexts):

| Nombre del Evento         | Emisor (Producer) | Consumidores (Consumers) | Descripción / Trigger                                                                                                                                      |
| :------------------------ | :---------------- | :----------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OrderCreatedEvent`       | Order Service     | Reporter, Notification   | Se genera cuando una orden pasa a estado PENDIENTE_PAGO tras reservar stock.                                                                               |
| `PaymentSuccessEvent`     | Payment Service   | Order, Reporter          | El cobro en Mercado Pago ha sido validado.                                                                                                                 |
| `PaymentFailedEvent`      | Payment Service   | Order                    | El cobro en Mercado Pago fue rechazado.                                                                                                                    |
| `OrderConfirmedEvent`     | Order Service     | Shipping, Notification   | La Saga avanzó exitosamente y se solicita despacho.                                                                                                        |
| `StockDepletedEvent`      | Inventory Service | Reporter, Notification   | Evento que notifica que un producto bajó del umbral de abastecimiento y requiere reabastecerse con el proveedor.                                           |
| `ShippingDispatchedEvent` | Shipping Service  | Order, Notification      | La guía fue generada por el proveedor externo.                                                                                                             |
| `CartAbandonedEvent`      | Cart Service      | Notification             | Disparado por el CronJob interno tras sobrepasar el tiempo de gracia de un carrito. Contiene ID de cliente y lista de productos para contactar al cliente. |

---

## 7. Consideraciones Transversales

- **Idempotencia Obligatoria:** Dado que Kafka garantiza entrega "al menos una vez" (at-least-once delivery), servicios intermediarios como `Payment`, `Shipping` y `Notification` implementarán llaves de idempotencia utilizando un identificador único (ej. `eventId` de la orden) para prevenir dobles cobros, múltiples despachos o spam de correos transaccionales por reintentos de red.
- **CronJobs Internos (Detección de Abandono):** La detección de Carritos Abandonados se ejecutará mediante tareas programadas (CronJobs/Schedulers nativos de Spring Boot) corriendo directamente en los contenedores del `Cart Service`, el cual leerá en intervalos definidos los registros expirados de `DynamoDB` para publicar el `CartAbandonedEvent`. Se omitirá el uso de AWS EventBridge para favorecer la cohesión de la lógica de dominio en el microservicio.
- **Notificaciones Centralizadas:** El `Notification Service` actuará como un consumidor _catch-all_ de ciertos eventos de dominio (`OrderConfirmed`, `ShippingDispatched`, `CartAbandoned`) para mapear el evento, poblar la plantilla desde su base de datos MongoDB e interactuar con la API de AWS SES hacia el cliente B2B.
