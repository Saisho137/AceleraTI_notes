# Clase 14 - Patrones de Arquitectura de Microservicios & EDA

Diseñando Sistemas Distribuidos Resilientes - Arka

Diapositivas: <https://manulasker.github.io/enyoi_java_slides/clase_24_25_patrones_arquitectura_microservicios/#/title-slide>

## Índice

1. [De Monolito a Microservicios](#de-monolito-a-microservicios)
2. [Patrones de Comunicación](#patrones-de-comunicación)
3. [API Gateway Pattern](#api-gateway-pattern)
4. [Service Discovery](#service-discovery)
5. [Circuit Breaker Pattern](#circuit-breaker-pattern)
6. [Database per Service](#database-per-service)
7. [Event Driven Architecture (EDA)](#event-driven-architecture-eda)
8. [Patrón Saga](#patrón-saga)

## Resumen

Los microservicios representan una arquitectura donde aplicaciones se descomponen en servicios pequeños e independientes que se comunican entre sí. Esta clase cubre los patrones fundamentales para diseñar sistemas distribuidos resilientes: comunicación síncrona/asíncrona, API Gateway y BFF, service discovery, circuit breaker para tolerancia a fallos, database per service, arquitectura dirigida por eventos (EDA) con Event Sourcing y CQRS, y el patrón Saga para transacciones distribuidas (coreografía vs orquestación).

## De Monolito a Microservicios

Entendiendo por qué y cuándo descomponer un sistema monolítico en servicios independientes.

### Qué es un Monolito

Un sistema donde toda la lógica (UI, negocio, datos) vive en un solo desplegable.

![Arquitectura monolítica](assets/clase-14-patrones-arquitectura-microservicios/monolito-modulos-acolar.png)

> Problema Arka: Ventas concurrentes causan race conditions → stock negativo (sobreventa).

### Qué son los Microservicios

Arquitectura donde la aplicación se compone de servicios pequeños, autónomos que se comunican entre sí.

![Arquitectura de microservicios](assets/clase-14-patrones-arquitectura-microservicios/microservicios-arquitectura.png)

### Monolito vs Microservicios

| Característica | Monolito                            | Microservicios                                |
| -------------- | ----------------------------------- | --------------------------------------------- |
| Despliegue     | Todo junto                          | Independiente por servicio                    |
| Escalabilidad  | Vertical (más recursos al servidor) | Horizontal (más instancias del servicio)      |
| Tecnología     | Un solo stack                       | Polyglot (cada servicio puede usar diferente) |
| Base de datos  | Compartida                          | Una por servicio                              |
| Equipo         | Un equipo grande                    | Equipos pequeños por servicio                 |
| Fallo          | Un error tumba todo                 | Fallo aislado por servicio                    |
| Complejidad    | Simple al inicio                    | Complejidad operacional alta                  |
| Transacciones  | ACID fácil                          | Consistencia eventual                         |

> No todo debe ser microservicios. “Monolith First” es una estrategia válida (Martin Fowler).

### Cuándo Migrar

**SÍ migrar cuando:**

- El equipo crece y hay conflictos en el código
- Necesitas escalar partes específicas
- Los deploys son lentos y riesgosos
- **Caso Arka:** Necesitas manejar concurrencia a nivel de servicio

**NO migrar cuando:**

- Equipo pequeño (< 5 devs)
- El dominio no está bien entendido
- No tienes infraestructura de CI/CD
- La aplicación es simple y funcional

> Regla de oro: Si no puedes gestionar un monolito bien, los microservicios lo harán 10x peor.

## Patrones de Comunicación

¿Cómo se hablan los microservicios entre sí?

### Comunicación Síncrona

El servicio que llama espera la respuesta antes de continuar.

![Comunicación síncrona](assets/clase-14-patrones-arquitectura-microservicios/comunicacion-sincrona.png)

**Protocolos comunes:** REST (HTTP/JSON), gRPC (HTTP/2 + Protobuf)

> Riesgo: Si un servicio está lento o caído, el que llama se bloquea → cascading failure.

### Comunicación Asíncrona

El servicio emisor publica un evento y continúa sin esperar respuesta.

![Comunicación asíncrona](assets/clase-14-patrones-arquitectura-microservicios/comunicacion-asincrona.png)

> Ventaja: Desacoplamiento total. Los servicios no necesitan conocerse entre sí.

### Comparativa de Comunicación

| Aspecto       | Síncrona                   | Asíncrona                |
| ------------- | -------------------------- | ------------------------ |
| Acoplamiento  | Temporal (espera)          | Desacoplado              |
| Latencia      | Suma de todas las llamadas | Solo la publicación      |
| Confiabilidad | Cadena de dependencias     | Tolerante a fallos       |
| Complejidad   | Fácil de entender          | Más difícil de debuggear |
| Consistencia  | Inmediata                  | Eventual                 |
| Caso de uso   | Consultas, validaciones    | Comandos, notificaciones |

![Comparativa síncrona vs asíncrona](assets/clase-14-patrones-arquitectura-microservicios/comparativa-comunicacion.png)

## Api Gateway Pattern

### Qué es el ApiGateway

![Arquitectura API Gateway](assets/clase-14-patrones-arquitectura-microservicios/api-gateway-arquitectura.png)

> Normalmente, se usa el Algoritmo Round Robin para Load Balancing

### Responsabilidades del Gateway

| Función                    | Descripción                             |
| -------------------------- | --------------------------------------- |
| Routing                    | Dirige la petición al servicio correcto |
| Autenticación/Autorización | Valida tokens JWT, API Keys             |
| Rate Limiting              | Limita peticiones por cliente           |
| Load Balancing             | Distribuye carga entre instancias       |
| Circuit Breaking           | Protege contra servicios caídos         |
| Transformación             | Adapta request/response                 |
| Caching                    | Cache de respuestas frecuentes          |
| Logging/Monitoring         | Observabilidad centralizada             |

**Herramientas populares:** Spring Cloud Gateway, Kong, NGINX, AWS API Gateway

### Backend for Frontend

Variante donde cada tipo de cliente tiene su propio gateway optimizado.

![Backend for Frontend](assets/clase-14-patrones-arquitectura-microservicios/backend-for-frontend.png)

> BFF permite optimizar la respuesta para cada cliente: el móvil recibe menos datos, la web más.

### Api Gateway vs BFF

| Característica | API Gateway                       | Backend for Frontend (BFF)                  |
| -------------- | --------------------------------- | ------------------------------------------- |
| Enfoque        | Único punto de entrada para todos | Múltiples gateways, uno por tipo de cliente |
| Adaptabilidad  | "Talla única" (One size fits all) | A medida para cada cliente (Tailored)       |
| Propiedad      | Equipo de Plataforma / Backend    | Equipo de Frontend / Producto               |
| Ventaja        | Simplicidad y centralización      | Optimización de UX y performance            |
| Riesgo         | Cuello de botella (Bottleneck)    | Duplicación de lógica y complejidad         |

> El BFF no reemplaza necesariamente al API Gateway; a menudo coexisten. El API Gateway maneja cross-cutting concerns (SSL, Auth) y enruta a los BFFs.

## Service Discovery

¿Cómo encuentra un servicio la dirección de otro servicio?

### El Problema

En un entorno dinámico (contenedores, auto-scaling), las IPs y puertos cambian constantemente.

![Problema de Service Discovery](assets/clase-14-patrones-arquitectura-microservicios/service-discovery-problema.png)

> Hardcodear URLs (<http://192.168.1.100:8080>) es frágil y no escala.

### Client-Side vs Server-Side

> Docker Compose ya provee service discovery básico con DNS por nombre de servicio.

#### Client Side Discovery

![Client-Side Discovery](assets/clase-14-patrones-arquitectura-microservicios/client-side-discovery.png)

El cliente consulta el registro y decide qué instancia llamar.

**Ejemplo:** Netflix Eureka, Spring Cloud

#### Server Side Discovery

![Server-Side Discovery](assets/clase-14-patrones-arquitectura-microservicios/server-side-discovery.png)

Un load balancer consulta el registro y rutea al cliente.

**Ejemplo:** Kubernetes Services, AWS ELB

## Circuit Breaker Pattern

Protección contra fallos en cascada en sistemas distribuidos.

### El Problema: Cascading Failures

![Fallos en cascada](assets/clase-14-patrones-arquitectura-microservicios/cascading-failures.png)

> Un solo servicio lento/caído puede tumbar toda la cadena de llamadas.

### Estados del Circuit Breaker

| Estado    | Comportamiento                                  |
| --------- | ----------------------------------------------- |
| Closed    | Todo funciona normal, se cuentan fallos         |
| Open      | Todas las peticiones son rechazadas (fail-fast) |
| Half-Open | Se permiten pocas peticiones de prueba          |

![Estados del Circuit Breaker](assets/clase-14-patrones-arquitectura-microservicios/circuit-breaker-estados.png)

#### Ejemplo con Resilience4j

```java
// Configuración del Circuit Breaker
@Bean
public CircuitBreakerConfig circuitBreakerConfig() {
    return CircuitBreakerConfig.custom()
        .failureRateThreshold(50)        // 50% de fallos activa el breaker
        .waitDurationInOpenState(Duration.ofSeconds(30)) // Espera antes de Half-Open
        .slidingWindowSize(10)           // Ventana de evaluación
        .minimumNumberOfCalls(5)         // Mínimo de llamadas para evaluar
        .build();
}
```

```java
// Uso en un servicio reactivo
@Service
public class InventoryClient {
    private final CircuitBreaker circuitBreaker;
    private final WebClient webClient;

    public Mono<StockResponse> checkStock(String sku) {
        return webClient.get()
            .uri("/api/inventory/{sku}", sku)
            .retrieve()
            .bodyToMono(StockResponse.class)
            .transformDeferred(CircuitBreakerOperator.of(circuitBreaker))
            .onErrorResume(e -> Mono.just(StockResponse.unavailable()));
    }
}
```

> Fallback: Cuando el circuit breaker está abierto, retornar una respuesta por defecto en vez de fallar.

## Database per Service

Cada microservicio posee y gestiona su propia base de datos.

### Shared DB vs DB per Service

#### Base de Datos Compartida

![Base de datos compartida](assets/clase-14-patrones-arquitectura-microservicios/shared-database.png)

- Acoplamiento a nivel de datos
- Un cambio de schema afecta todos
- No puedes escalar independientemente

#### Patrón Database per Service

![Database per Service](assets/clase-14-patrones-arquitectura-microservicios/database-per-service.png)

- Autonomía total por servicio
- Cada equipo elige su tecnología
- Escala independientemente

### El Gran Desafío: Consultas Cruzadas

![Consultas cruzadas entre servicios](assets/clase-14-patrones-arquitectura-microservicios/consultas-cruzadas.png)

¿Cómo hacer JOINs entre servicios? No puedes hacer SELECT ... JOIN entre bases de datos separadas. Necesitas otras estrategias:

| Estrategia      | Descripción                                        |
| --------------- | -------------------------------------------------- |
| API Composition | Un servicio agrega datos de múltiples servicios    |
| CQRS            | Modelo de lectura separado, alimentado por eventos |
| Saga            | Transacciones distribuidas por pasos               |

#### Api Composition

Un servicio agregador consulta múltiples servicios y combina las respuestas.

![API Composition](assets/clase-14-patrones-arquitectura-microservicios/api-composition.png)

| Ventaja                           | Desventaja                            |
| --------------------------------- | ------------------------------------- |
| Simple de implementar             | Latencia = suma de todas las llamadas |
| No requiere infraestructura extra | El agregador puede ser un bottleneck  |
| Consistencia en tiempo real       | Falla si algún servicio no responde   |

> La consistencia eventual reemplaza las transacciones ACID en microservicios.

## Event Driven Architecture (EDA)

Arquitectura donde los componentes se comunican a través de eventos de forma asíncrona y desacoplada.

### Qué es EDA

![Arquitectura dirigida por eventos](assets/clase-14-patrones-arquitectura-microservicios/eda-arquitectura.png)

> EDA = Los servicios reaccionan a hechos que ocurrieron (eventos), no a comandos directos.

### Componentes de EDA

| Componente  | Rol                              | Ejemplo                                      |
| ----------- | -------------------------------- | -------------------------------------------- |
| Producer    | Emite eventos cuando algo ocurre | Order Service publica OrderCreated           |
| Consumer    | Reacciona a eventos de interés   | Inventory Service escucha OrderCreated       |
| Broker      | Canal que transporta eventos     | Apache Kafka, RabbitMQ, AWS SQS              |
| Topic/Queue | Categoría del evento             | orders, inventory, notifications             |
| Event       | Hecho inmutable que ocurrió      | { "type": "ProductCreated", "sku": "A-123" } |

### Domain Events vs Integration Events

#### Domain Events

Ocurren dentro de un Bounded Context.

```java
// Dentro del servicio de inventario
record StockDecremented(
    String sku,
    int quantity,
    int remainingStock,
    Instant timestamp
) {}
```

- Lenguaje del dominio
- Usados internamente
- Pueden ser muy detallados

#### Integration Events

Se publican hacia afuera para otros servicios.

```java
// Publicado a Kafka
record ProductCreatedEvent(
    String eventId,
    String eventType,
    ProductPayload payload,
    Instant timestamp
) {}
```

- Contrato público
- Versionables
- Mínimo de información necesaria

### Eventos en el Caso de Arka

![Flujo de eventos en Arka](assets/clase-14-patrones-arquitectura-microservicios/eventos-arka.png)

```json
{
  "eventId": "uuid-123",
  "eventType": "ProductCreated",
  "payload": {
    "sku": "GPU-RTX4090",
    "name": "NVIDIA RTX 4090",
    "initialStock": 50,
    "price": 1599.99
  },
  "timestamp": "2025-02-15T10:00:00Z"
}
```

### Event Sourcing

Con CRUD, un UPDATE destruye el estado anterior. Event Sourcing cambia el enfoque: guardamos todos los eventos que produjeron el estado actual.

![Event Sourcing](assets/clase-14-patrones-arquitectura-microservicios/event-sourcing.png)

#### Ventajas de Event Sourcing

| Ventaja            | Descripción                                     |
| ------------------ | ----------------------------------------------- |
| Auditoría completa | Historial de cada cambio                        |
| Debugging          | Puedes "rebobinar" al estado en cualquier punto |
| Reconstrucción     | Recalcular vistas desde los eventos             |
| Temporal queries   | "¿Cuál era el stock el martes?"                 |

> Complejidad: Requiere manejo de snapshots y versionado de eventos.

### Patrón CQRS: Command Query Responsibility Segregation

Separar el modelo de escritura (Commands) del modelo de lectura (Queries).

![Arquitectura CQRS](assets/clase-14-patrones-arquitectura-microservicios/cqrs-arquitectura.png)

#### Por qué CQRS

**El problema sin CQRS:**

Un solo modelo para leer y escribir genera conflictos:

- Escritura necesita normalización (evitar duplicados)
- Lectura necesita desnormalización (JOINs son lentos)
- Escalar lectura y escritura juntas es ineficiente

**Con CQRS en Arka:**

| Lado  | BD                  | Optimización             |
| ----- | ------------------- | ------------------------ |
| Write | PostgreSQL (R2DBC)  | Normalizada, consistente |
| Read  | Vista materializada | Desnormalizada, rápida   |

Los eventos en Kafka alimentan el modelo de lectura automáticamente.

> La BD de lectura puede ser una vista desnormalizada, un cache Redis, o un índice Elasticsearch — cada una optimizada para su caso de uso.

## Patrón Saga

Transacciones distribuidas en el mundo de los microservicios.

### Problema: Transacciones Distribuidas

En un monolito, una transacción ACID es simple:

- **Atomicidad:** Se ejecuta todo o nada
- **Consistencia:** Los datos pasan de un estado válido a otro
- **Isolation (Aislamiento):** Las transacciones concurrentes no interfieren entre sí
- **Durabilidad:** Una vez confirmada, la transacción persiste incluso ante fallos

```java
@Transactional
public void processOrder(Order order) {
    orderRepository.save(order);          // 1. Guardar orden
    inventoryService.decrementStock(sku); // 2. Descontar stock
    paymentService.charge(order);         // 3. Cobrar
    // Si algo falla → ROLLBACK automático
}
```

### El Desafío en Microservicios

En microservicios, cada servicio tiene su propia BD:

![Transacciones distribuidas](assets/clase-14-patrones-arquitectura-microservicios/transacciones-distribuidas.png)

> No existe @Transactional entre bases de datos distintas. Si el pago falla después de descontar stock, ¿cómo se revierte?

### Qué es el Patrón Saga

Una Saga es una secuencia de transacciones locales, donde cada paso tiene una acción compensatoria en caso de fallo.

![Patrón Saga](assets/clase-14-patrones-arquitectura-microservicios/saga-patron.png)

| Concepto              | Descripción                               |
| --------------------- | ----------------------------------------- |
| Transacción Local (T) | Acción que modifica datos en un servicio  |
| Compensación (C)      | Acción que revierte una transacción local |
| Saga                  | Secuencia: T1 → T2 → T3… o C3 → C2 → C1   |

### Saga Coreografiada

Cada servicio emite un evento y los demás reaccionan. No hay un coordinador central.

![Saga coreografiada](assets/clase-14-patrones-arquitectura-microservicios/saga-coreografia.png)

#### Coreografia: Caso de Fallo

¿Qué pasa si el pago falla?

![Saga coreografía - caso de fallo](assets/clase-14-patrones-arquitectura-microservicios/saga-coreografia-fallo.png)

### Saga Orquestada

Un microservicio dedicado (o componente dentro del Order Service) que actúa como "director de orquesta":

- Conoce todos los pasos de la transacción
- Llama a cada servicio en orden
- Decide qué compensar si algo falla
- Los demás servicios no se conocen entre sí — solo responden al orquestador

> A diferencia de la coreografía, aquí hay un punto central de control. Más fácil de entender y debuggear, pero introduce más acoplamiento.

#### Saga Orquestada: Flujos

![Saga orquestada - flujo](assets/clase-14-patrones-arquitectura-microservicios/saga-orquestacion-flujo.png)

#### Orquestación: Caso de Fallo

![Saga orquestación - caso de fallo](assets/clase-14-patrones-arquitectura-microservicios/saga-orquestacion-fallo.png)

> El orquestador mantiene el estado de la saga y sabe exactamente qué pasos compensar.

### Coreografia vs Orquestación

| Aspecto        | Coreografía                        | Orquestación                          |
| -------------- | ---------------------------------- | ------------------------------------- |
| Coordinador    | No hay (descentralizado)           | Sí (orquestador central)              |
| Acoplamiento   | Bajo (solo eventos)                | Medio (orquestador conoce los pasos)  |
| Complejidad    | Crece con más servicios            | Centralizada y manejable              |
| Visibilidad    | Difícil de rastrear flujo completo | Fácil, el orquestador tiene el estado |
| Punto de fallo | Distribuido                        | Si cae el orquestador, se detiene     |
| Ideal para     | Sagas simples (2-3 pasos)          | Sagas complejas (4+ pasos)            |
| Testing        | Más difícil                        | Más fácil                             |

### Saga Arka

![Implementación de Saga en Arka](assets/clase-14-patrones-arquitectura-microservicios/saga-arka.png)

_continuará..._

-

## Extra

Bancolombia dejó de usar Cloudwatch porque no se integraba tan bien a Kafka ni a micros en EKS, por lo que se optó por usar Grafana como exporter.
Dynatrex se utiliza para reunir logs.

Si hay timeouts por ejemplo de apigateway (no del micro), hay estrategias para buscar consistencia: sincronizar timeout del micro con la infra o estar atento a errores de Timeout ej del apigw y ejecutar rollbacks en el proceso.

-

## Dudas

Consistencia eventual: NO es factible para transacciones.

Resiliencia: Si por ejemplo, una orden depende de que el micro de Inventario responda.

DB relacionales: Cómo se manejan las relaciones en DDBB SQL si están divididas en microservicios, cómo se manejan las relaciones entre entidades de distintos micros.
