# Clase 7 - Pruebas

## Índice

1. [¿Por qué probar?](#por-qué-probar)
2. [Tipos de Pruebas](#tipos-de-pruebas)
3. [JUnit - Framework de Testing](#junit---framework-de-testing)
4. [Anotaciones de JUnit](#anotaciones-de-junit)
5. [Pruebas Parametrizadas](#pruebas-parametrizadas)
6. [Patrón AAA (Arrange-Act-Assert)](#patrón-aaa-arrange-act-assert)
7. [Mockito - Objetos Simulados](#mockito---objetos-simulados)
8. [Pruebas de Integración con Spring Boot](#pruebas-de-integración-con-spring-boot)
9. [MockMvc - Simulación de Peticiones HTTP](#mockmvc---simulación-de-peticiones-http)
10. [Test Driven Development (TDD)](#test-driven-development-tdd)
11. [Configuración de Gradle y Cobertura](#configuración-de-gradle-y-cobertura)
12. [Ejercicio Práctico](#ejercicio-práctico)
13. [Recursos Adicionales](#recursos-adicionales)

## Resumen

Esta clase aborda las **pruebas de software en Java con Spring Boot**:

- **Pruebas Unitarias:** JUnit 5 y Mockito para probar clases de forma aislada
- **Pruebas de Integración:** `@SpringBootTest`, `@DataJpaTest` y `@WebMvcTest`
- **MockMvc:** Simulación de peticiones HTTP a controllers
- **Pruebas Parametrizadas:** `@ParameterizedTest` con múltiples fuentes de datos
- **Patrones:** AAA (Arrange-Act-Assert) y TDD (Red-Green-Refactor)
- **Configuración:** Gradle con JaCoCo para cobertura de código

**Objetivo:** Validar el comportamiento de las clases, prevenir errores y facilitar el mantenimiento del código.

---

## ¿Por qué probar?

Las pruebas de software son esenciales para garantizar la calidad y confiabilidad del código. De una manera u otra, **las pruebas aseguran los escenarios o casos de uso del negocio**.

### Razones principales para escribir pruebas

**1. Validan el comportamiento de nuestras clases**

- Verifican que el código hace lo que se espera
- Confirman que los métodos retornan los valores correctos
- Aseguran que las clases se comportan según las especificaciones

**2. Previenen errores al hacer cambios**

- Detectan bugs introducidos por modificaciones (regresiones)
- Alertan cuando un cambio rompe funcionalidad existente
- Proporcionan una red de seguridad al refactorizar

**3. Facilitan el mantenimiento y refactorización**

- Permiten hacer cambios con confianza
- Documentan cómo se debe usar el código
- Reducen el miedo a modificar código legacy
- Aceleran el desarrollo a largo plazo

### Beneficios adicionales

✅ **Mejoran el diseño del código:** Escribir tests obliga a crear código más modular y desacoplado

✅ **Reducen el tiempo de debugging:** Los errores se detectan temprano y se identifican más rápido

✅ **Documentación ejecutable:** Los tests muestran ejemplos de cómo usar las clases y métodos

✅ **Confianza en despliegues:** Mayor seguridad al liberar nuevas versiones

---

## Tipos de Pruebas

### Pruebas Unitarias

**Prueban una clase o método de forma aislada.**

**Características:**

- Foco en una unidad individual de código (método, clase)
- Aisladas de dependencias externas (usando mocks)
- Muy rápidas de ejecutar (milisegundos)
- No acceden a bases de datos, red, o archivos

**Ejemplo:**

```java
@Test
void deberiaCalcularElTotalDelCarrito() {
    // Prueba un solo método de la clase Carrito
    Carrito carrito = new Carrito();
    carrito.agregarProducto(new Producto("Laptop", 1000));
    
    assertEquals(1000, carrito.calcularTotal());
}
```

**Cuándo usar:**

- Para validar lógica de negocio pura
- Para probar cálculos, validaciones, transformaciones
- Para la mayoría de tus tests (base de la pirámide)

### Pruebas de Integración

**Prueban varias clases colaborando juntas.**

**Características:**

- Verifican la interacción entre múltiples componentes
- Pueden usar el contexto completo de Spring
- Pueden conectarse a bases de datos (reales o en memoria)
- Más lentas que las unitarias pero más realistas

**Ejemplo:**

```java
@SpringBootTest
class UsuarioServiceIntegrationTest {
    
    @Autowired
    private UsuarioService service;
    
    @Autowired
    private UsuarioRepository repository;
    
    @Test
    void deberiCrearUsuarioEnBaseDeDatos() {
        // Prueba la integración entre Service y Repository
        Usuario usuario = service.crearUsuario("Juan", "juan@test.com");
        
        assertTrue(repository.findById(usuario.getId()).isPresent());
    }
}
```

**Cuándo usar:**

- Para verificar que los componentes trabajan bien juntos
- Para probar flujos completos de capas (Controller → Service → Repository)
- Para validar configuraciones de Spring
- Para probar integraciones con bases de datos o APIs externas

### Comparación

| Aspecto | Pruebas Unitarias | Pruebas de Integración |
|---------|-------------------|------------------------|
| **Alcance** | Una clase o método | Varias clases colaborando |
| **Velocidad** | Muy rápidas (ms) | Más lentas (segundos) |
| **Aislamiento** | Completamente aisladas | Usan componentes reales |
| **Dependencias** | Mocks/Stubs | Beans reales de Spring |
| **Cantidad** | Muchas (70-80%) | Moderadas (20-30%) |

---

## JUnit - Framework de Testing

**JUnit** es la biblioteca de pruebas unitarias más popular en Java. Proporciona anotaciones y assertions para escribir y ejecutar tests.

### Características principales

- **Framework estándar** para testing en Java
- **Anotación @Test** marca un método como prueba
- **Assertions** para verificar resultados
- **Runners** para ejecutar los tests
- **Integración** con IDEs y herramientas de build (Maven, Gradle)

### Estructura básica de un test

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CalculadoraTest {
    
    @Test
    void deberiaSumarDosNumeros() {
        Calculadora calc = new Calculadora();
        
        int resultado = calc.sumar(2, 3);
        
        assertEquals(5, resultado);
    }
}
```

### Assertions más comunes

```java
// Igualdad
assertEquals(esperado, actual);
assertNotEquals(noEsperado, actual);

// Verdadero/Falso
assertTrue(condicion);
assertFalse(condicion);

// Null
assertNull(objeto);
assertNotNull(objeto);

// Excepciones
assertThrows(Exception.class, () -> {
    // Código que debe lanzar excepción
});

// Verificaciones múltiples
assertAll(
    () -> assertEquals(1, actual),
    () -> assertTrue(condicion)
);
```

### Sintaxis JUnit vs AssertJ

Se pueden escribir las pruebas con sintaxis más o menos verbosa:

```java
// JUnit (más conciso)
assertEquals("Local", result);

// AssertJ (más fluido y legible)
assertThat(result).isEqualTo("Local");
```

**Comparación de Doubles:** Para comparar números decimales, usar `.isCloseTo()` en lugar de `.isEqualTo()` debido a la imprecisión de punto flotante:

```java
// ❌ Puede fallar por imprecisión
assertThat(resultado).isEqualTo(0.3);

// ✅ Correcto - permite un margen de error
assertThat(resultado).isCloseTo(0.3, within(0.0001));
```

> 💡 **Tip:** Las pruebas se pueden debuguear mediante breakpoints, igual que el código de producción.

---

## Anotaciones de JUnit

JUnit proporciona varias anotaciones para controlar el ciclo de vida de los tests:

### Tabla de Anotaciones

| Anotación | Propósito |
|-----------|-----------|
| `@Test` | Define un método de prueba. Deberían ser métodos `void`. |
| `@BeforeEach` | Ejecutado **antes de cada prueba** (preparar instancias, estado) |
| `@AfterEach` | Ejecutado **después de cada prueba** (limpiar recursos) |
| `@BeforeAll` | Ejecutado **una vez antes de todas las pruebas** (debe ser `static`) |
| `@AfterAll` | Ejecutado **una vez después de todas las pruebas** (debe ser `static`) |
| `@DisplayName` | Agrega una descripción legible a la prueba |
| `@Tag` | Etiqueta para categorizar y filtrar pruebas |
| `@Disabled` | Deshabilita temporalmente una prueba |

> 📝 **Convención de nombrado:** Por convención, el nombre del método de test debe describir lo que se está probando (ej: `deberiaCalcularTotalConDescuento`).

### Ejemplo de uso

```java
class UsuarioServiceTest {
    private UsuarioService service;
    
    @BeforeEach
    void setUp() {
        service = new UsuarioService();
    }
    
    @Test
    void deberiaCrearUsuario() {
        Usuario usuario = new Usuario("Juan", "juan@test.com");
        Usuario creado = service.crear(usuario);
        assertNotNull(creado.getId());
    }
}
```

### Orden de ejecución

```
1. @BeforeAll (una vez)
2. @BeforeEach
3. @Test (primer test)
4. @AfterEach
5. @BeforeEach
6. @Test (segundo test)
7. @AfterEach
8. @AfterAll (una vez)
```

### Cuándo usar cada anotación

**`@BeforeEach`:**

- Inicializar objetos necesarios para cada test
- Preparar el estado común de los tests
- Evitar duplicación de código de setup

**`@AfterEach`:**

- Limpiar recursos después de cada test
- Cerrar conexiones, archivos, etc.
- Restaurar estado inicial

**`@BeforeAll`:**

- Inicializar recursos costosos una sola vez
- Configuración global de la suite de tests
- **Nota:** Debe ser `static`

**`@AfterAll`:**

- Liberar recursos globales
- Limpiar después de toda la suite
- **Nota:** Debe ser `static`

---

## Pruebas Parametrizadas

`@ParameterizedTest` permite ejecutar una misma prueba unitaria con múltiples conjuntos de datos, evitando duplicación de código.

### Fuentes de Datos

| Anotación | Uso |
|-----------|-----|
| `@ValueSource` | Valores simples de un solo tipo |
| `@CsvSource` | Múltiples valores separados por coma |
| `@MethodSource` | Valores generados por un método |
| `@ArgumentsSource` | Valores generados mediante Streams (clase Provider) |

### Ejemplo con @CsvSource

```java
@ParameterizedTest
@CsvSource({
    "1, 1, 2",      // a=1, b=1, expected=2
    "2, 3, 5",      // a=2, b=3, expected=5
    "10, -5, 5"     // a=10, b=-5, expected=5
})
void deberiaSumarCorrectamente(int a, int b, int expected) {
    assertEquals(expected, calculadora.sumar(a, b));
}
```

### Ejemplo con @ValueSource

```java
@ParameterizedTest
@ValueSource(strings = {"admin", "user", "guest"})
void deberiaValidarRolesPermitidos(String rol) {
    assertTrue(servicio.esRolValido(rol));
}
```

### Ejemplo con @MethodSource

```java
@ParameterizedTest
@MethodSource("proveedorDeDatos")
void deberiaCalcularDescuento(double precio, double descuento, double expected) {
    assertEquals(expected, servicio.aplicarDescuento(precio, descuento), 0.01);
}

static Stream<Arguments> proveedorDeDatos() {
    return Stream.of(
        Arguments.of(100.0, 10.0, 90.0),
        Arguments.of(200.0, 25.0, 150.0),
        Arguments.of(50.0, 0.0, 50.0)
    );
}
```

> 📚 **Documentación completa:** [Baeldung - Parameterized Tests JUnit 5](https://www.baeldung.com/parameterized-tests-junit-5)

---

## Patrón AAA (Arrange-Act-Assert)

El patrón **AAA** es la estructura recomendada para organizar tests de forma clara y legible.

### Las 3 fases

**1. Arrange (Preparar):**

- Configurar el estado inicial
- Crear los objetos necesarios
- Preparar los datos de entrada

**2. Act (Actuar):**

- Ejecutar la acción que se está probando
- Llamar al método bajo prueba
- Una sola acción por test

**3. Assert (Afirmar):**

- Verificar que el resultado es el esperado
- Usar assertions para validar
- Puede haber múltiples assertions relacionadas

### Ejemplo

```java
@Test
void deberiaAplicarDescuentoDelDiezPorciento() {
    // Arrange: Preparar
    Producto producto = new Producto("Laptop", 1000.0);
    ServicioDescuento servicio = new ServicioDescuento();
    
    // Act: Ejecutar
    double precioFinal = servicio.aplicarDescuento(producto, 10.0);
    
    // Assert: Verificar
    assertEquals(900.0, precioFinal);
}
```

### Beneficios del patrón AAA

✅ **Claridad:** Fácil de leer y entender qué se está probando

✅ **Estructura consistente:** Todos los tests siguen el mismo patrón

✅ **Mantenibilidad:** Fácil de modificar y actualizar

✅ **Documentación:** Muestra claramente las precondiciones, acción y resultado esperado

### Variante: Given-When-Then (GWT)

Equivalente a AAA, usa lenguaje más cercano al negocio: Given (Arrange), When (Act), Then (Assert).

---

## Mockito - Objetos Simulados

**Mockito** es una librería para crear **objetos simulados (mocks)** que permiten aislar las pruebas unitarias de sus dependencias.

### ¿Qué es un Mock?

Un **mock** es un objeto falso que simula el comportamiento de un objeto real. Se usa para:

- **Aislar** la unidad bajo prueba de sus dependencias
- **Evitar** la necesidad de instancias reales de servicios, repositorios, APIs externas
- **Controlar** el comportamiento de las dependencias en los tests
- **Verificar** las interacciones entre objetos

### Problemas que resuelve Mockito

**Sin Mockito:**

```java
@Test
void testUsuarioService() {
    // ❌ Necesito una base de datos real
    UsuarioRepository repo = new UsuarioRepository();
    // ❌ Necesito configurar conexión, crear tablas, etc.
    repo.conectar("jdbc:mysql://localhost:3306/testdb");
    
    UsuarioService service = new UsuarioService(repo);
    // ... test muy complejo y lento
}
```

**Con Mockito:**

```java
@Test
void testUsuarioService() {
    // ✅ Creo un mock del repository
    UsuarioRepository mockRepo = mock(UsuarioRepository.class);
    
    // ✅ Defino qué debe retornar
    when(mockRepo.findById(1L)).thenReturn(Optional.of(new Usuario()));
    
    // ✅ Test simple y rápido
    UsuarioService service = new UsuarioService(mockRepo);
    // ...
}
```

### Crear Mocks

**Opción 1: Usar `mock()`**

```java
UsuarioRepository mockRepo = mock(UsuarioRepository.class);
```

**Opción 2: Usar anotación `@Mock`**

```java
@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {
    
    @Mock
    private UsuarioRepository mockRepo;
    
    @InjectMocks  // Inyecta los mocks en el servicio
    private UsuarioService service;
    
    @Test
    void test() {
        // mockRepo ya está creado e inyectado
    }
}
```

> ✅ **`@Mock` vs `mock()`:** Ambas opciones son **funcionalmente equivalentes**. La anotación `@Mock` es preferida porque:
>
> - Código más corto y legible
> - El nombre del campo aparece en mensajes de error
> - Se combina fácilmente con `@InjectMocks`
>
> **Requisito:** Para que `@Mock` funcione, se necesita `@ExtendWith(MockitoExtension.class)` en JUnit 5, o llamar a `MockitoAnnotations.openMocks(this)` en `@BeforeEach`.

### Configuración avanzada de Mocks

**Mocks anidados con `RETURNS_DEEP_STUBS`:**

Cuando trabajas con objetos que tienen múltiples niveles de profundidad (llamadas encadenadas), puedes usar `@Mock(answer = Answers.RETURNS_DEEP_STUBS)` para evitar crear múltiples capas de `when()`:

```java
// ❌ Sin RETURNS_DEEP_STUBS - necesitas mockear cada nivel
@Mock
private UsuarioService usuarioService;

@Test
void testSinDeepStubs() {
    when(usuarioService.obtenerUsuario()).thenReturn(Mockito.mock());
    when(usuarioService.obtenerUsuario().getDireccion()).thenReturn(Mockito.mock());
    when(usuarioService.obtenerUsuario().getDireccion().getCiudad()).thenReturn("Bogotá");
}

// ✅ Con RETURNS_DEEP_STUBS - mockea toda la cadena
@Mock(answer = Answers.RETURNS_DEEP_STUBS)
private UsuarioService usuarioService;

@Test
void testConDeepStubs() {
    when(usuarioService.obtenerUsuario().getDireccion().getCiudad())
        .thenReturn("Bogotá");
}
```

### Configurar comportamiento (Stubbing)

**Definir qué retorna un método:**

```java
// Cuando se llame a findById(1L), retornar un usuario
when(mockRepo.findById(1L))
    .thenReturn(Optional.of(new Usuario("Juan")));

// Cuando se llame con cualquier Long, retornar vacío
when(mockRepo.findById(anyLong()))
    .thenReturn(Optional.empty());

// Cuando se llame a save(), retornar el mismo objeto
when(mockRepo.save(any(Usuario.class)))
    .thenReturn(usuario);
```

**Lanzar excepciones:**

```java
when(mockRepo.findById(999L))
    .thenThrow(new NotFoundException("Usuario no encontrado"));
```

### Verificar interacciones

**Verificar que se llamó un método:**

```java
// Verificar que save() fue llamado con el usuario
verify(mockRepo).save(usuario);

// Verificar que se llamó exactamente 1 vez
verify(mockRepo, times(1)).findById(1L);

// Verificar que NUNCA se llamó
verify(mockRepo, never()).delete(any());

// Verificar que se llamó al menos 2 veces
verify(mockRepo, atLeast(2)).findAll();
```

### Ejemplo

```java
@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {
    @Mock
    private UsuarioRepository mockRepo;
    
    @InjectMocks
    private UsuarioService service;
    
    @Test
    void deberiaCrearUsuario() {
        Usuario usuario = new Usuario("Ana", "ana@test.com");
        when(mockRepo.save(any(Usuario.class))).thenReturn(usuario);
        
        Usuario resultado = service.crearUsuario("Ana", "ana@test.com");
        
        assertNotNull(resultado);
        verify(mockRepo).save(any(Usuario.class));
    }
}
```

### Ventajas de usar Mockito

✅ **Tests rápidos:** No necesitan bases de datos o servicios reales

✅ **Aislamiento:** Prueban solo la lógica de la clase bajo prueba

✅ **Control total:** Defines exactamente qué retornan las dependencias

✅ **Verificación:** Puedes confirmar que se llamaron los métodos correctos

### Mocks y Principios SOLID

Al seguir los principios **SOLID** (especialmente Inversión de Dependencias), se facilita enormemente el uso de mocks:

- **Inyección de dependencias:** Permite reemplazar implementaciones reales por mocks fácilmente
- **Interfaces:** Permiten crear mocks sin depender de clases concretas
- **Datos Dummy:** Los mocks devuelven datos controlados que permiten testear escenarios específicos

> 💡 **Código bien diseñado = código fácil de testear**

---

## Pruebas de Integración con Spring Boot

Las **pruebas de integración** verifican que múltiples componentes de Spring Boot trabajen correctamente juntos.

### @SpringBootTest

La anotación `@SpringBootTest` levanta el contexto completo de Spring, permitiendo probar la integración real de los componentes.

**Características:**

- Carga el contexto completo de Spring
- Puede inyectar beans reales con `@Autowired`
- Puede conectarse a bases de datos reales o en memoria
- Más lenta que pruebas unitarias pero más realista

### Ejemplo básico

```java
@SpringBootTest
class UsuarioServiceIntegrationTest {
    
    @Autowired
    private UsuarioService service;  // Bean real de Spring
    
    @Autowired
    private UsuarioRepository repository;  // Bean real de Spring
    
    @Test
    void deberiaGuardarUsuarioEnBaseDeDatos() {
        // Arrange
        Usuario usuario = new Usuario("Pedro", "pedro@test.com");
        
        // Act
        Usuario guardado = service.crearUsuario(usuario);
        
        // Assert
        assertNotNull(guardado.getId());
        assertTrue(repository.findById(guardado.getId()).isPresent());
    }
    
    @AfterEach
    void limpiarBaseDeDatos() {
        repository.deleteAll();  // Limpiar después de cada test
    }
}
```

### @MockBean - Mocks en pruebas de integración

Cuando usas `@SpringBootTest` pero quieres mockear algunas dependencias:

```java
@SpringBootTest
class PedidoServiceIntegrationTest {
    
    @Autowired
    private PedidoService pedidoService;  // Bean real
    
    @MockBean  // Mock dentro del contexto de Spring
    private ServicioPago servicioPago;
    
    @MockBean
    private ServicioEmail servicioEmail;
    
    @Test
    void deberiaCrearPedidoYEnviarEmail() {
        // Arrange
        Pedido pedido = new Pedido();
        when(servicioPago.procesar(any())).thenReturn(true);
        
        // Act
        Pedido resultado = pedidoService.crearPedido(pedido);
        
        // Assert
        assertNotNull(resultado);
        verify(servicioEmail).enviarConfirmacion(any());
    }
}
```

### Configuración de Base de Datos para Tests

**Base de datos en memoria (H2):**

```properties
spring.datasource.url=jdbc:h2:mem:testdb
spring.jpa.hibernate.ddl-auto=create-drop
```

**TestContainers (Docker):** Permite usar bases de datos reales en contenedores.

### Anotaciones específicas de Spring Boot

**`@DataJpaTest`** - Solo para capa de persistencia:

```java
@DataJpaTest
class UsuarioRepositoryTest {
    
    @Autowired
    private UsuarioRepository repository;
    
    @Test
    void deberiaEncontrarUsuarioPorEmail() {
        Usuario usuario = new Usuario("Luis", "luis@test.com");
        repository.save(usuario);
        
        Optional<Usuario> encontrado = repository.findByEmail("luis@test.com");
        
        assertTrue(encontrado.isPresent());
    }
}
```

**`@WebMvcTest`** - Solo para controllers:

```java
@WebMvcTest(UsuarioController.class)
class UsuarioControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private UsuarioService service;
    
    @Test
    void deberiaRetornarUsuarioPorId() throws Exception {
        Usuario usuario = new Usuario("Maria", "maria@test.com");
        when(service.obtenerPorId(1L)).thenReturn(Optional.of(usuario));
        
        mockMvc.perform(get("/api/usuarios/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Maria"));
    }
}
```

---

## MockMvc - Simulación de Peticiones HTTP

**MockMvc** es una herramienta de Spring para probar controllers sin necesidad de levantar un servidor HTTP real.

### ¿Qué es MockMvc?

- Permite **simular peticiones HTTP** (GET, POST, PUT, DELETE, etc.)
- Levanta un **"servidor ficticio"** en memoria
- Verifica responses, status codes, headers, JSON, etc.
- **No requiere un servidor real** (Tomcat, Jetty)

### Configuración

**Usar junto con `@SpringBootTest` y `@AutoConfigureMockMvc`:**

```java
@SpringBootTest
@AutoConfigureMockMvc
class UsuarioControllerIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    // Tests aquí
}
```

**O usar con `@WebMvcTest`** (solo el controller):

```java
@WebMvcTest(UsuarioController.class)
class UsuarioControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private UsuarioService service;
    
    // Tests aquí
}
```

### Estructura de un test con MockMvc

```java
mockMvc.perform([método HTTP])
    .contentType([tipo de contenido])
    .content([cuerpo de la solicitud])
    .andExpect([lo que esperamos - los asserts])
```

### Ejemplos de uso

**GET Request:**

```java
@Test
void deberiaObtenerUsuarioPorId() throws Exception {
    mockMvc.perform(get("/api/usuarios/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nombre").value("Juan"))
            .andExpect(jsonPath("$.email").value("juan@test.com"));
}
```

**POST Request:**

```java
@Test
void deberiaCrearNuevoUsuario() throws Exception {
    String usuarioJson = """
        {
            "nombre": "Ana",
            "email": "ana@test.com"
        }
        """;
    
    mockMvc.perform(post("/api/usuarios")
            .contentType(MediaType.APPLICATION_JSON)
            .content(usuarioJson))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.nombre").value("Ana"));
}
```

**PUT Request:**

```java
@Test
void deberiaActualizarUsuario() throws Exception {
    String usuarioJson = """
        {
            "nombre": "Juan Actualizado",
            "email": "juan.nuevo@test.com"
        }
        """;
    
    mockMvc.perform(put("/api/usuarios/1")
            .contentType(MediaType.APPLICATION_JSON)
            .content(usuarioJson))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nombre").value("Juan Actualizado"));
}
```

**DELETE Request:**

```java
@Test
void deberiaEliminarUsuario() throws Exception {
    mockMvc.perform(delete("/api/usuarios/1"))
            .andExpect(status().isNoContent());
}
```

### Assertions comunes

- **Status:** `.andExpect(status().isOk())`, `.isCreated()`, `.isNotFound()`
- **JSON:** `.andExpect(jsonPath("$.nombre").value("Juan"))`
- **Content-Type:** `.andExpect(content().contentType(MediaType.APPLICATION_JSON))`

### Ventajas de MockMvc

✅ No requiere servidor real (tests más rápidos)  
✅ Valida serialización JSON y validaciones  
✅ API fluida y expresiva  
✅ Usa el contexto real de Spring

---

## Test Driven Development (TDD)

**TDD (Test-Driven Development)** es una metodología de desarrollo donde **se escribe primero la prueba** antes del código de producción.

### Filosofía de TDD

> "Escribe el test que falla, luego escribe el código para hacerlo pasar."

En lugar de:

1. Escribir código
2. Probar manualmente
3. Escribir tests (tal vez)

TDD propone:

1. **Escribir el test primero** (que falla)
2. **Escribir el código mínimo** para que pase
3. **Refactorizar** y mejorar

### Ciclo Red-Green-Refactor

El ciclo de TDD tiene 3 pasos que se repiten continuamente:

```
┌──────────────────────────────────┐
│  1. 🔴 RED                       │
│  Escribir una prueba que falla   │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  2. 🟢 GREEN                     │
│  Hacer que pase con el mínimo    │
│  código necesario                │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  3. 🔵 REFACTOR                  │
│  Refactorizar el código          │
│  (sin romper los tests)          │
└────────────┬─────────────────────┘
             │
             ▼
          Repetir
```

### Ejemplo del ciclo

```java
// 🔴 RED: Test que falla
@Test
void deberiaSumarDosNumeros() {
    assertEquals(5, new Calculadora().sumar(2, 3));
}

// 🟢 GREEN: Implementación mínima
public int sumar(int a, int b) {
    return a + b;
}

// 🔵 REFACTOR: Código mejorado
public int sumar(int a, int b) {
    return Math.addExact(a, b); // Maneja overflow
}
```

### Beneficios de TDD

✅ **Mejor diseño:** Pensar en la API antes de implementar resulta en mejor diseño

✅ **Cobertura completa:** Todo el código está cubierto por tests desde el inicio

✅ **Menos bugs:** Los defectos se detectan inmediatamente

✅ **Documentación:** Los tests documentan cómo usar el código

✅ **Refactoring seguro:** Puedes mejorar el código con confianza

✅ **Desarrollo enfocado:** Te obliga a pensar en qué necesitas antes de implementar

### Desafíos de TDD

❌ **Curva de aprendizaje:** Requiere práctica y cambio de mentalidad

❌ **Más tiempo inicial:** Puede parecer más lento al principio (pero se recupera a largo plazo)

❌ **Requiere disciplina:** Es fácil saltarse el ciclo bajo presión

❌ **No todo es TDD:** Algunos escenarios (UI, exploratory coding) no se prestan para TDD estricto

### Cuándo usar TDD

✅ Lógica de negocio compleja, algoritmos, APIs  
❌ Prototipos rápidos, código exploratorio, UI inicial

---

## Configuración de Gradle y Cobertura

### Configuración de JUnit y JaCoCo en build.gradle

```groovy
test {
    useJUnitPlatform()  // Habilita JUnit 5
    
    testLogging {
        events "passed", "skipped", "failed"
    }
    
    finalizedBy jacocoTestReport  // Genera reporte después de tests
}

jacocoTestReport {
    dependsOn test  // Requiere que los tests se ejecuten primero
    
    reports {
        xml.required = true
        html.required = true
    }
    
    finalizedBy jacocoTestCoverageVerification  // Verifica cobertura mínima
}

jacocoTestCoverageVerification {
    violationRules {
        rule {
            limit {
                minimum = 0.80  // 80% de cobertura mínima
            }
        }
    }
}
```

### Ubicación de Reportes

| Reporte | Ubicación |
|---------|-----------|
| **Coverage HTML** | `/build/reports/jacoco/test/html/index.html` |
| **Test Results** | `/build/reports/tests/test/index.html` |

### Principios Importantes

- **Las pruebas unitarias NO deben depender de ninguna otra prueba** (independientes)
- Cada test debe poder ejecutarse de forma aislada
- El orden de ejecución no debe afectar los resultados

---

## Conclusión

Las pruebas son fundamentales para:

✅ **Validar el comportamiento** de nuestras clases  
✅ **Prevenir errores** al hacer cambios  
✅ **Facilitar el mantenimiento** y refactorización

**Herramientas principales:**

- **JUnit:** Framework de testing
- **Mockito:** Crear mocks y aislar dependencias
- **MockMvc:** Probar controllers sin servidor real
- **Spring Boot Test:** Pruebas de integración

**Metodología:**

- **TDD:** Escribir tests primero (Red-Green-Refactor)
- **Patrón AAA:** Arrange-Act-Assert para estructura clara

Recuerda: **Código sin tests es código legacy desde el día 1.**

---

## Recursos Adicionales

### Documentación y Tutoriales

| Recurso | Enlace |
|---------|--------|
| **Pruebas Parametrizadas JUnit 5** | [Baeldung](https://www.baeldung.com/parameterized-tests-junit-5) |
| **Mockito Documentation** | [site.mockito.org](https://site.mockito.org/) |
| **Spring Boot Testing** | [Spring Docs](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.testing) |

### Repositorio de Ejemplos

🔗 [Unit Test Practice - Enyoi](https://github.com/Saisho137/unit-test-practice-enyoi)

Contiene ejemplos prácticos de pruebas unitarias en Java con JUnit y Mockito.
