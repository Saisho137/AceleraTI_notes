# Clase 9 - SOLID y Patrones de Diseño

## Índice

1. [¿Qué es SOLID?](#qué-es-solid)
2. [Single Responsibility Principle (SRP)](#single-responsibility-principle-srp)
3. [Open/Closed Principle (OCP)](#openclosed-principle-ocp)
4. [Liskov Substitution Principle (LSP)](#liskov-substitution-principle-lsp)
5. [Interface Segregation Principle (ISP)](#interface-segregation-principle-isp)
6. [Dependency Inversion Principle (DIP)](#dependency-inversion-principle-dip)
7. [SOLID en conjunto](#solid-en-conjunto)
8. [Patrones de Diseño](#patrones-de-diseño)
9. [Conceptos Clave de Java](#conceptos-clave-de-java)
10. [Ejercicio práctico](#ejercicio-práctico)
11. [Recursos adicionales](#recursos-adicionales)

## Resumen

Los **principios SOLID** (Robert C. Martin) guían el diseño orientado a objetos para crear código mantenible, extensible y testeable:

| Principio | Definición |
|-----------|------------|
| **S**ingle Responsibility | Una clase, una razón para cambiar |
| **O**pen/Closed | Abierto a extensión, cerrado a modificación |
| **L**iskov Substitution | Subclases sustituibles por sus clases base |
| **I**nterface Segregation | Interfaces pequeñas y específicas |
| **D**ependency Inversion | Depender de abstracciones, no de implementaciones |

---

## ¿Qué es SOLID?

Son 5 principios de diseño OOP formulados por **Robert C. Martin (Uncle Bob)**.

**Beneficios:**
- ✅ Código robusto y fácil de testar
- ✅ Cambios no rompen el sistema
- ✅ Bajo acoplamiento entre componentes
- ✅ Facilita el trabajo en equipo

---

## Single Responsibility Principle (SRP)

> **Una clase debe tener una y solo una razón para cambiar.**

### Violación vs Aplicación

![Violando SRP](assets/clase_9/srp_violacion.png)

![Aplicando SRP](assets/clase_9/srp_aplicacion.png)

**Beneficios:** Clases pequeñas, enfocadas, fáciles de entender, testar y reutilizar.

---

## Open/Closed Principle (OCP)

> **Las entidades de software deben estar abiertas para extensión, pero cerradas para modificación.**

### Violación vs Aplicación

![Violando OCP](assets/clase_9/ocp_violacion.png)

![Aplicando OCP](assets/clase_9/ocp_aplicacion.png)

### Patrón Strategy

![Patrón Strategy](assets/clase_9/patron_strategy.png)

**Tip:** En casi cualquier caso, es factible reemplazar un `switch-case` por un patrón Strategy para cumplir OCP.

**Beneficios:** Agregar funcionalidad sin modificar código existente, reduce riesgo de romper funcionalidad.

---

## Liskov Substitution Principle (LSP)

> **Los objetos de una clase derivada deben poder sustituir objetos de la clase base sin alterar el comportamiento del programa.**

### Violación y Problema

![Violando LSP](assets/clase_9/lsp_violacion.png)

![El problema](assets/clase_9/lsp_problema.png)

### Aplicación Correcta

![Aplicando LSP](assets/clase_9/lsp_aplicacion.png)

**Beneficios:** Herencia predecible, polimorfismo funcional, tests válidos para toda la jerarquía.

---

## Interface Segregation Principle (ISP)

> **Los clientes no deben ser forzados a depender de interfaces que no utilizan.**

### Violación vs Aplicación

![Violando ISP](assets/clase_9/isp_violacion.png)

![Aplicando ISP](assets/clase_9/isp_aplicacion.png)

![Implementaciones limpias](assets/clase_9/isp_implementaciones_limpias.png)

**Beneficios:** Interfaces cohesivas, menor acoplamiento, más fácil de mockear en tests.

---

## Dependency Inversion Principle (DIP)

> **Los módulos de alto nivel no deben depender de módulos de bajo nivel. Ambos deben depender de abstracciones.**

### Violación vs Aplicación

![Violando DIP](assets/clase_9/dip_violacion.png)

![Aplicando DIP](assets/clase_9/dip_aplicacion.png)

![Alto nivel depende de abstracción](assets/clase_9/dip_alto_nivel_abstraccion.png)

### DIP con Spring Framework

![DIP con Spring Framework](assets/clase_9/dip_spring_framework.png)

### DIP sin Framework (Inyección Manual)

Cuando no hay framework de inyección de dependencias (como era el caso de Python hasta febrero 2025), se necesita una **"clase contenedora" ("clase sucia")** que:
- Reúne todas las implementaciones concretas
- Las instancia manualmente
- Las pasa a los casos de uso

![Container Manual](assets/clase_9/di_container_manual.png)

**Ejemplo real de configuración:**

![Ejemplo Config](assets/clase_9/di_ejemplo_real_config.png)

![Ejemplo Uso](assets/clase_9/di_ejemplo_real_uso.png)

**Beneficios:** Desacoplamiento total, fácil cambiar implementaciones, testing trivial con mocks.

---

## SOLID en conjunto

### Ejemplo: Sistema de Notificaciones

![Sistema de Notificaciones](assets/clase_9/solid_ejemplo_notificaciones.png)

![Servicio con DIP y SRP](assets/clase_9/solid_servicio_dip_srp.png)

![Uso flexible](assets/clase_9/solid_uso_flexible.png)

---

## Patrones de Diseño

### Strategy

**Propósito:** Definir una familia de algoritmos intercambiables en tiempo de ejecución.

```java
// Interfaz de estrategia
public interface PaymentStrategy {
    void pay(double amount);
}

// Implementaciones concretas
public class CreditCardPayment implements PaymentStrategy {
    public void pay(double amount) { /* lógica tarjeta */ }
}

public class PayPalPayment implements PaymentStrategy {
    public void pay(double amount) { /* lógica PayPal */ }
}

// Uso
public class ShoppingCart {
    private PaymentStrategy strategy;
    
    public void setPaymentStrategy(PaymentStrategy strategy) {
        this.strategy = strategy;
    }
    
    public void checkout(double total) {
        strategy.pay(total);
    }
}
```

**Cuándo usar:** Reemplazar `switch-case` o `if-else` extensos, permitir cambio de comportamiento en runtime.

---

### Factory

**Propósito:** Centralizar la creación de objetos, ocultando la lógica de instanciación.

```java
public class NotificationSenderFactory {
    private final Map<String, Supplier<NotificationSender>> registers;

    public NotificationSenderFactory() {
        this.registers = new HashMap<>();
        registers.put("EMAIL", EmailNotificationSender::new);
        registers.put("SMS", SmsNotificationSender::new);
        registers.put("PUSH", PushNotificationSender::new);
    }

    public NotificationSender createSender(String type) {
        Supplier<NotificationSender> supplier = registers.get(type.toUpperCase());
        if (supplier == null)
            throw new IllegalArgumentException("Unknown type: " + type);
        return supplier.get();
    }

    // Extensible: permite registrar nuevos tipos (OCP)
    public void registerSender(String type, Supplier<NotificationSender> supplier) {
        this.registers.put(type.toUpperCase(), supplier);
    }
}
```

**Cuándo usar:** Múltiples implementaciones de una interfaz, lógica de creación compleja, cumplir OCP.

---

### Repository

**Propósito:** Abstraer el acceso a datos, separando la lógica de negocio de la persistencia.

```java
// Interfaz del repositorio (abstracción)
public interface UserRepository {
    User findById(Long id);
    List<User> findAll();
    User save(User user);
    void delete(Long id);
}

// Implementación concreta (puede ser JPA, MongoDB, etc.)
@Repository
public class JpaUserRepository implements UserRepository {
    @Autowired
    private EntityManager em;
    
    public User findById(Long id) {
        return em.find(User.class, id);
    }
    // ... demás métodos
}
```

**Cuándo usar:** Siempre para acceso a datos. Permite cambiar de BD sin afectar la lógica de negocio.

---

## Conceptos Clave de Java

### La palabra clave `final`

Funciona similar a `const` en JavaScript: una vez asignada, **la referencia no puede cambiar**, pero sí el contenido del objeto.

```java
private final Map<String, NotificationSender> registers;

public MyClass() {
    this.registers = new HashMap<>();  // ✅ Inicialización en constructor (permitido)
}

public void reset() {
    this.registers = new HashMap<>();  // ❌ ERROR: reasignación no permitida
}

public void addItem() {
    registers.put("key", value);       // ✅ Modificar contenido (permitido)
}
```

**Reglas de `final`:**
- Se puede asignar **una sola vez**: en la declaración, en un bloque inicializador, o en el constructor
- Después de esa asignación inicial, **no se puede reasignar** a otro objeto
- El **contenido del objeto sí puede modificarse** (agregar/eliminar elementos, cambiar propiedades)

**Beneficio:** Garantiza que la referencia siempre apunte al mismo objeto, evitando reasignaciones accidentales.

---

### Interfaz `Supplier<T>`

`Supplier<T>` es una **interfaz funcional** de Java que representa un proveedor de resultados. No recibe argumentos y retorna un valor de tipo `T`.

```java
@FunctionalInterface
public interface Supplier<T> {
    T get();
}
```

**Uso práctico:** Permite diferir la creación de objetos hasta que se necesiten (lazy instantiation) y abstraer la lógica de construcción.

```java
// Sin Supplier - instancia inmediata
Map<String, NotificationSender> map = new HashMap<>();
map.put("EMAIL", new EmailNotificationSender()); // Se crea ahora

// Con Supplier - instancia diferida
Map<String, Supplier<NotificationSender>> map = new HashMap<>();
map.put("EMAIL", EmailNotificationSender::new); // Solo guarda la referencia

// Se crea cuando se necesita
NotificationSender sender = map.get("EMAIL").get();
```

**Ventajas:**
- **Lazy instantiation:** El objeto se crea solo cuando se llama `.get()`
- **Sintaxis concisa:** `ClassName::new` es equivalente a `() -> new ClassName()`
- **Extensibilidad:** Permite registrar nuevas implementaciones sin modificar la factory

---

## Ejercicio práctico

### Analiza este código y encuentra qué principios SOLID viola

![Ejercicio](assets/clase_9/ejercicio_analizar_violaciones.png)

**Repo de práctica:** [refactoring-solid-practice-enyoi](https://github.com/Saisho137/refactoring-solid-practice-enyoi)

---

## Recursos adicionales

### Herramientas mencionadas

| Herramienta | Descripción |
|-------------|-------------|
| **SQLite** | BD embebida en un archivo, sin motor adicional. Solo requiere dependencia del cliente en Java. |
| **Retrofit** | Cliente HTTP para Java con parseo automático de JSON. Más simple que FeignClient en algunos casos. |

### Material de estudio

📚 **Presentación oficial:** [SOLID - Slides Enyoi](https://manulasker.github.io/enyoi_java_slides/clase_10_11_solid_presentation/index.html#/1)
