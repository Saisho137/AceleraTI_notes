# Clase 7 - Pruebas

## Índice

1. [¿Por qué probar?](#por-qué-probar)
2. [Tipos de Pruebas](#tipos-de-pruebas)
3. [JUnit - Framework de Testing](#junit---framework-de-testing)
4. [Anotaciones de JUnit](#anotaciones-de-junit)
5. [Patrón AAA (Arrange-Act-Assert)](#patrón-aaa-arrange-act-assert)
6. [Mockito - Objetos Simulados](#mockito---objetos-simulados)
7. [Pruebas de Integración con Spring Boot](#pruebas-de-integración-con-spring-boot)
8. [MockMvc - Simulación de Peticiones HTTP](#mockmvc---simulación-de-peticiones-http)
9. [Test Driven Development (TDD)](#test-driven-development-tdd)
10. [Ejercicio Práctico](#ejercicio-práctico)

## Resumen

Esta clase aborda las pruebas de software en Java con Spring Boot, enfocándose en pruebas unitarias con JUnit y Mockito, y pruebas de integración con `@SpringBootTest` y MockMvc. Se cubre el patrón AAA (Arrange-Act-Assert), anotaciones de JUnit, creación de mocks, y la metodología TDD (Test-Driven Development). El objetivo es validar el comportamiento de las clases, prevenir errores y facilitar el mantenimiento del código.

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

---

## Anotaciones de JUnit

JUnit proporciona varias anotaciones para controlar el ciclo de vida de los tests:

### Tabla de Anotaciones

| Anotación | Propósito |
|-----------|-----------|
| `@Test` | Define un método de prueba |
| `@BeforeEach` | Ejecutado **antes de cada prueba** |
| `@AfterEach` | Ejecutado **después de cada prueba** |
| `@BeforeAll` | Ejecutado **una vez antes de todas las pruebas** |
| `@AfterAll` | Ejecutado **una vez después de todas las pruebas** |

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

## Ejercicio Práctico

### Objetivo

**Realizar pruebas unitarias y de integración del ejercicio JPA**

Este ejercicio te permite aplicar todo lo aprendido en esta clase:

- Escribir pruebas unitarias con JUnit
- Usar Mockito para aislar dependencias
- Crear pruebas de integración con `@SpringBootTest`
- Probar controllers con MockMvc
- Aplicar el patrón AAA
- Practicar TDD

### Pasos sugeridos

#### 1. Pruebas Unitarias del Service

```java
@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {
    
    @Mock
    private UsuarioRepository repository;
    
    @InjectMocks
    private UsuarioService service;
    
    @Test
    void deberiaCrearUsuario() {
        // Arrange
        Usuario usuario = new Usuario("Juan", "juan@test.com");
        when(repository.save(any(Usuario.class))).thenReturn(usuario);
        
        // Act
        Usuario creado = service.crearUsuario(usuario);
        
        // Assert
        assertNotNull(creado);
        assertEquals("Juan", creado.getNombre());
        verify(repository).save(usuario);
    }
    
    @Test
    void deberiaObtenerUsuarioPorId() {
        // Arrange
        Usuario usuario = new Usuario("Ana", "ana@test.com");
        when(repository.findById(1L)).thenReturn(Optional.of(usuario));
        
        // Act
        Optional<Usuario> encontrado = service.obtenerPorId(1L);
        
        // Assert
        assertTrue(encontrado.isPresent());
        assertEquals("Ana", encontrado.get().getNombre());
    }
    
    @Test
    void deberiaLanzarExcepcionCuandoUsuarioNoExiste() {
        // Arrange
        when(repository.findById(999L)).thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(NotFoundException.class, () -> {
            service.obtenerPorIdOError(999L);
        });
    }
}
```

#### 2. Pruebas de Integración del Repository

```java
@DataJpaTest
class UsuarioRepositoryTest {
    
    @Autowired
    private UsuarioRepository repository;
    
    @Test
    void deberiaGuardarYRecuperarUsuario() {
        // Arrange
        Usuario usuario = new Usuario("Carlos", "carlos@test.com");
        
        // Act
        Usuario guardado = repository.save(usuario);
        Optional<Usuario> recuperado = repository.findById(guardado.getId());
        
        // Assert
        assertTrue(recuperado.isPresent());
        assertEquals("Carlos", recuperado.get().getNombre());
    }
    
    @Test
    void deberiaEncontrarUsuarioPorEmail() {
        // Arrange
        Usuario usuario = new Usuario("Maria", "maria@test.com");
        repository.save(usuario);
        
        // Act
        Optional<Usuario> encontrado = repository.findByEmail("maria@test.com");
        
        // Assert
        assertTrue(encontrado.isPresent());
        assertEquals("Maria", encontrado.get().getNombre());
    }
    
    @Test
    void deberiaListarTodosLosUsuarios() {
        // Arrange
        repository.save(new Usuario("User1", "user1@test.com"));
        repository.save(new Usuario("User2", "user2@test.com"));
        
        // Act
        List<Usuario> usuarios = repository.findAll();
        
        // Assert
        assertEquals(2, usuarios.size());
    }
}
```

#### 3. Pruebas de Integración del Controller con MockMvc

```java
@SpringBootTest
@AutoConfigureMockMvc
class UsuarioControllerIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private UsuarioRepository repository;
    
    @BeforeEach
    void limpiarBaseDeDatos() {
        repository.deleteAll();
    }
    
    @Test
    void deberiaCrearUsuarioViaAPI() throws Exception {
        String usuarioJson = """
            {
                "nombre": "Pedro",
                "email": "pedro@test.com"
            }
            """;
        
        mockMvc.perform(post("/api/usuarios")
                .contentType(MediaType.APPLICATION_JSON)
                .content(usuarioJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nombre").value("Pedro"))
                .andExpect(jsonPath("$.email").value("pedro@test.com"))
                .andExpect(jsonPath("$.id").exists());
    }
    
    @Test
    void deberiaObtenerTodosLosUsuarios() throws Exception {
        // Arrange
        repository.save(new Usuario("User1", "user1@test.com"));
        repository.save(new Usuario("User2", "user2@test.com"));
        
        // Act & Assert
        mockMvc.perform(get("/api/usuarios"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].nombre").value("User1"))
                .andExpect(jsonPath("$[1].nombre").value("User2"));
    }
    
    @Test
    void deberiaActualizarUsuario() throws Exception {
        // Arrange
        Usuario usuario = repository.save(new Usuario("Original", "original@test.com"));
        
        String usuarioActualizado = """
            {
                "nombre": "Actualizado",
                "email": "actualizado@test.com"
            }
            """;
        
        // Act & Assert
        mockMvc.perform(put("/api/usuarios/" + usuario.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(usuarioActualizado))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Actualizado"));
    }
    
    @Test
    void deberiaEliminarUsuario() throws Exception {
        // Arrange
        Usuario usuario = repository.save(new Usuario("ToDelete", "delete@test.com"));
        
        // Act
        mockMvc.perform(delete("/api/usuarios/" + usuario.getId()))
                .andExpect(status().isNoContent());
        
        // Assert
        assertFalse(repository.findById(usuario.getId()).isPresent());
    }
    
    @Test
    void deberiaRetornar404CuandoUsuarioNoExiste() throws Exception {
        mockMvc.perform(get("/api/usuarios/999"))
                .andExpect(status().isNotFound());
    }
}
```

#### 4. Aplicar TDD para nueva funcionalidad

**Ejemplo: Agregar funcionalidad para contar usuarios por dominio de email**

```java
// 🔴 RED - Primero el test
@Test
void deberiaContarUsuariosPorDominio() {
    // Arrange
    repository.save(new Usuario("User1", "user1@gmail.com"));
    repository.save(new Usuario("User2", "user2@gmail.com"));
    repository.save(new Usuario("User3", "user3@yahoo.com"));
    
    // Act
    long countGmail = service.contarPorDominio("gmail.com");
    long countYahoo = service.contarPorDominio("yahoo.com");
    
    // Assert
    assertEquals(2, countGmail);
    assertEquals(1, countYahoo);
}

// 🟢 GREEN - Implementación
public long contarPorDominio(String dominio) {
    return repository.findAll().stream()
        .filter(u -> u.getEmail().endsWith("@" + dominio))
        .count();
}

// 🔵 REFACTOR - Mejorar con query personalizada
// En Repository:
@Query("SELECT COUNT(u) FROM Usuario u WHERE u.email LIKE %:dominio")
long countByEmailDomain(@Param("dominio") String dominio);

// En Service:
public long contarPorDominio(String dominio) {
    return repository.countByEmailDomain("@" + dominio);
}
```

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
