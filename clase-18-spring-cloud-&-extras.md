# Clase 18 - Spring Extras & Spring Cloud

> Diapositivas: <https://manulasker.github.io/enyoi_java_slides/clase_29_30_spring_extras_cloud/#/title-slide>

---

## Índice

1. [Spring Extras](#spring-extras)
   - [Scheduling](#scheduling)
   - [Caching](#caching)
   - [Eventos de Aplicación](#eventos-de-aplicación)
   - [AOP (Programación Orientada a Aspectos)](#aop-programación-orientada-a-aspectos)
2. [Spring Cloud](#spring-cloud)
   - [Qué es Spring Cloud](#qué-es-spring-cloud)
   - [Ecosistema](#ecosistema)
   - [Discovery Service](#discovery-service)
   - [Config Server](#config-server)
   - [API Gateway](#api-gateway)
   - [Circuit Breaker / Resilience4j](#circuit-breaker--resilience4j)
   - [Cloud Functions](#cloud-functions)
   - [Cloud Stream (Kafka/RabbitMQ)](#cloud-stream-kafkarabbitmq)
   - [OpenFeign](#openfeign)
   - [Spring Security + JWT](#spring-security--jwt)
   - [Spring AI](#spring-ai)
   - [Observabilidad Distribuida](#observabilidad-distribuida)

## Resumen

Spring Boot ofrece funcionalidades avanzadas para apps profesionales: **Scheduling** para automatizar tareas periódicas, **Caching** para reducir latencia con anotaciones simples, **Eventos** para desacoplar componentes internos y **AOP** para centralizar preocupaciones transversales (logging, métricas, seguridad). Spring Cloud extiende esto al ecosistema distribuido, proveyendo herramientas para comunicación, configuración centralizada, resiliencia y observabilidad en microservicios.

---

## Spring Extras

Funcionalidades avanzadas de Spring Boot para aplicaciones profesionales.

---

### Scheduling

Ejecutar tareas de forma automática y periódica sin depender de scripts externos.

#### Habilitando Scheduling

```java
@Configuration
@EnableScheduling // ← Activa el sistema de tareas programadas
public class SchedulingConfig {

    @Bean
    public TaskScheduler taskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(5);
        scheduler.setThreadNamePrefix("scheduled-");
        return scheduler;
    }
}
```

> Sin `@EnableScheduling`, las anotaciones `@Scheduled` se ignoran silenciosamente.

#### Estrategias de @Scheduled

| Estrategia     | Ejemplo               | Comportamiento                                       |
| -------------- | --------------------- | ---------------------------------------------------- |
| `fixedDelay`   | `30000`               | Espera 30s **después** de terminar la tarea anterior |
| `fixedRate`    | `60000`               | Ejecuta cada 60s sin importar si la anterior terminó |
| `cron`         | `"0 0 6 * * MON-FRI"` | Expresión cron: `seg min hora día mes díaSemana`     |
| `initialDelay` | `5000`                | Espera 5s antes de la primera ejecución              |

> **Cuidado con `fixedRate`:** si la tarea dura más que el intervalo, puede haber solapamiento. Usa `fixedDelay` si la tarea es costosa.

```java
@Service
public class InventorySyncService {

    @Scheduled(fixedDelay = 30_000)
    public void syncInventory() { ... }

    @Scheduled(fixedRate = 60_000)
    public void generateReport() { ... }

    @Scheduled(cron = "0 0 6 * * MON-FRI")
    public void morningCleanup() { ... }
}
```

#### Cron Externalizado

Buena práctica: extraer la expresión cron a configuración para cambiarla sin recompilar.

```java
@Scheduled(cron = "${app.inventory.sync-cron}")
public void syncInventory() { ... }
```

```yaml
# application.yml
app:
  inventory:
    sync-cron: "0 */15 * * * *" # Cada 15 minutos
```

---

### Caching

Reducir latencia y carga almacenando resultados de operaciones costosas.

#### Habilitando Caché

```java
@Configuration
@EnableCaching
public class CacheConfig {}
```

#### Proveedores

| Proveedor            | Tipo                          | Uso típico                    |
| -------------------- | ----------------------------- | ----------------------------- |
| `ConcurrentMapCache` | En memoria (default)          | Desarrollo, apps pequeñas     |
| Caffeine             | En memoria (alto rendimiento) | Apps medianas                 |
| Redis                | Distribuido                   | Microservicios, producción    |
| Hazelcast            | Distribuido                   | Clusters, alta disponibilidad |

#### Anotaciones

| Anotación     | Efecto                                                               |
| ------------- | -------------------------------------------------------------------- |
| `@Cacheable`  | Si el resultado ya está en caché, lo devuelve sin ejecutar el método |
| `@CachePut`   | Siempre ejecuta el método y actualiza el caché                       |
| `@CacheEvict` | Elimina una entrada (o todas) del caché                              |

```java
@Service
public class ProductService {

    @Cacheable(value = "products", key = "#id")
    public Product findById(Long id) { ... }

    @CachePut(value = "products", key = "#product.id")
    public Product update(Product product) { ... }

    @CacheEvict(value = "products", key = "#id")
    public void delete(Long id) { ... }

    @CacheEvict(value = "products", allEntries = true)
    public void clearCache() { ... }
}
```

#### Flujo de @Cacheable

![Flujo de @Cacheable: Cache HIT vs Cache MISS](assets/clase-18-spring-cloud-extras/cache-flujo-cacheable.png)

Primera llamada → va a la BD y guarda en caché. Llamadas siguientes con el mismo ID → responde directo del caché.

#### Caché con Redis

```yaml
# application.yml
spring:
  cache:
    type: redis
  data:
    redis:
      host: localhost
      port: 6379
      password: secret
```

```java
@Cacheable(
    value = "products",
    key = "#id",
    unless = "#result == null",  // evalúa después (acceso a #result)
    condition = "#id > 0")       // evalúa antes de ejecutar el método
public Product findById(Long id) { ... }
```

> `unless` evalúa **después** de la ejecución. `condition` evalúa **antes**.

---

### Eventos de Aplicación

Comunicación desacoplada entre componentes dentro de la misma aplicación.

**Objetivos:**

- Desacoplar procesos dentro del mismo servicio.
- Reaccionar a cambios sin dependencias directas entre clases.
- Preparar el paso a mensajería distribuida.

#### Flujo: Definir → Publicar → Escuchar

```java
// 1. Definir el evento
public record OrderCreatedEvent(Long orderId, String sku, int quantity) {}

// 2. Publicar
@Service
public class OrderService {
    private final ApplicationEventPublisher eventPublisher;

    public Order createOrder(CreateOrderRequest req) {
        Order order = orderRepository.save(toEntity(req));
        eventPublisher.publishEvent(
            new OrderCreatedEvent(order.getId(), order.getSku(), order.getQty()));
        return order;
    }
}

// 3. Escuchar
@Component
public class InventoryEventListener {

    @EventListener
    public void onOrderCreated(OrderCreatedEvent event) {
        inventoryService.reserveStock(event.sku(), event.quantity());
    }
}
```

#### Eventos Asíncronos y Transaccionales

```java
// Asíncrono: ejecuta en otro thread
@Configuration
@EnableAsync
public class AsyncConfig {}

@Component
public class NotificationListener {

    @Async
    @EventListener
    public void onOrderCreated(OrderCreatedEvent event) {
        emailService.sendConfirmation(event.orderId());
    }
}

// Transaccional: solo se ejecuta si el commit fue exitoso
@Component
public class AuditListener {

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOrderCommitted(OrderCreatedEvent event) {
        auditService.log("Order created: " + event.orderId());
    }
}
```

> `@TransactionalEventListener` evita procesar eventos de transacciones que hicieron rollback.

---

### AOP (Programación Orientada a Aspectos)

Separar preocupaciones transversales (logging, seguridad, métricas) del código de negocio.

#### El problema que resuelve

Sin AOP, cada servicio repite las mismas preocupaciones. Con AOP, un `Aspect` las centraliza:

![AOP: un Aspect centraliza logging, security y metrics para todos los servicios](assets/clase-18-spring-cloud-extras/aop-aspect-centralizado.png)

#### Tipos de Advice

| Tipo              | Cuándo se ejecuta           | Uso típico                       |
| ----------------- | --------------------------- | -------------------------------- |
| `@Before`         | Antes del método            | Validación, logging de entrada   |
| `@After`          | Después (siempre)           | Limpieza de recursos             |
| `@AfterReturning` | Solo si no hubo excepción   | Auditoría de resultados          |
| `@AfterThrowing`  | Solo si hubo excepción      | Logging de errores               |
| `@Around`         | Envuelve el método completo | Métricas de tiempo, retry, caché |

> `@Around` es el advice más poderoso: controla si el método se ejecuta y puede modificar argumentos y resultado.

#### Ejemplo: Logging con @Around

```java
@Aspect
@Component
public class LoggingAspect {

    @Around("execution(* com.arka.*.service.*.*(..))")
    public Object logExecution(ProceedingJoinPoint joinPoint) throws Throwable {
        String method = joinPoint.getSignature().toShortString();
        long start = System.currentTimeMillis();
        log.info("→ Entrando a {}", method);
        try {
            Object result = joinPoint.proceed();
            log.info("← {} completado en {}ms", method, System.currentTimeMillis() - start);
            return result;
        } catch (Exception e) {
            log.error("✗ {} falló: {}", method, e.getMessage());
            throw e;
        }
    }
}
```

#### Ejemplo: Anotación Personalizada + Aspect (Rate Limiting)

```java
// Anotación personalizada
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimited {
    int maxCalls() default 100;
    int periodSeconds() default 60;
}

// Uso en controller
@RateLimited(maxCalls = 50)
@GetMapping("/api/products")
public List<Product> findAll() { ... }

// Aspect que lo implementa
@Aspect
@Component
public class RateLimitAspect {
    private final Map<String, AtomicInteger> counters = new ConcurrentHashMap<>();

    @Around("@annotation(rateLimited)")
    public Object enforce(ProceedingJoinPoint jp, RateLimited rateLimited) throws Throwable {
        String key = jp.getSignature().toShortString();
        AtomicInteger counter = counters.computeIfAbsent(key, k -> new AtomicInteger(0));
        if (counter.incrementAndGet() > rateLimited.maxCalls()) {
            throw new TooManyRequestsException("Rate limit exceeded");
        }
        return jp.proceed();
    }
}
```

---

## Spring Cloud

El ecosistema para construir microservicios distribuidos en la nube.

### Qué es Spring Cloud

Spring Cloud proporciona implementaciones listas para los patrones más comunes en sistemas distribuidos: comunicación, configuración centralizada, resiliencia y observabilidad.

![Mapa conceptual del ecosistema Spring Cloud](assets/clase-18-spring-cloud-extras/spring-cloud-ecosistema.png)

### Ecosistema

![Arquitectura típica: Cliente → API Gateway → microservicios ↔ Kafka, con Config Server distribuyendo configuración](assets/clase-18-spring-cloud-extras/spring-cloud-arquitectura-microservicios.png)

---

### Discovery Service

### Config Server

### API Gateway

### Circuit Breaker / Resilience4j

### Cloud Functions

### Cloud Stream (Kafka/RabbitMQ)

### OpenFeign

### Spring Security + JWT

### Spring AI

### Observabilidad Distribuida
