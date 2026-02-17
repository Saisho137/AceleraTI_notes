# Clase 3 - HTTP Rest

## Índice

1. [HTTP](#http)
   - [Verbos](#verbos)
   - [Códigos de respuesta](#códigos-de-respuesta)
   - [Idempotencia](#idempotencia)
   - [CORS](#cors)
   - [HealthCheck](#healthcheck)
2. [REST](#rest)
   - [Principios REST](#principios-rest)
   - [Gateway](#gateway)
   - [Proxy](#proxy)
   - [REST vs SOAP](#rest-vs-soap)
3. [Adicional](#adicional)
   - [Swagger](#swagger)
   - [Modelo OSI](#modelo-osi)

---

## HTTP

HyperText Transfer Protocol, es el protocolo de comunicación que usan los navegadores y servidores web para intercambiar datos

Un cliente utiliza un verbo para hacer una petición y el servidor responde un código de respuesta junto a un contenido (HTML, JSON, XML, etc)

Es un protocolo de Red, es decir, capa 7 (de aplicación) en el modelo OSI y comúnmente usa TCP como protocolo de Transporte

Se puede pasar información por Headers, Body, Query Params, Path params…

### Verbos

Los verbos HTTP (también llamados métodos) definen la acción que se desea realizar sobre un recurso identificado por una URL.

| Verbo | Propósito | Idempotente | Seguro | Uso típico |
|-------|-----------|-------------|--------|-----------|
| **GET** | Obtener/Leer datos | Sí | Sí | Obtener información de un recurso |
| **POST** | Crear/Enviar datos | No | No | Crear nuevos recursos, enviar formularios |
| **PUT** | Crear/Actualizar completamente | Sí | No | Reemplazar un recurso completo |
| **PATCH** | Actualizar parcialmente | No* | No | Modificar partes específicas de un recurso |
| **DELETE** | Eliminar | Sí | No | Eliminar un recurso |
| **HEAD** | Obtener metadatos | Sí | Sí | Verificar existencia, obtener headers |
| **OPTIONS** | Obtener opciones permitidas | Sí | Sí | CORS preflight, capacidades del servidor |
| **TRACE** | Diagnóstico de ruta | Sí | Sí | Debugging (raramente usado) |
| **CONNECT** | Establecer túnel | No | No | Proxy HTTP/HTTPS |

*PATCH puede ser idempotente dependiendo de la implementación

**Ejemplos prácticos:**

![Ejemplo Rest con mascotas](assets/clase-03-http-rest/ejemplo-rest-mascotas.png)

### Códigos de respuesta

Los códigos de estado HTTP indican si una petición HTTP específica se completó exitosamente.

![Códigos de estado HTTP informativos 1xx-5xx](assets/clase-03-http-rest/codigos-informativos.png)

#### 1xx - Informativos

Indican que la petición fue recibida y el proceso continúa.

- **100 Continue**: El servidor recibió los headers y el cliente puede enviar el body
- **101 Switching Protocols**: El servidor acepta cambiar el protocolo
- **102 Processing**: El servidor está procesando la petición (WebDAV)

#### 2xx - Éxito

Indican que la petición fue recibida, entendida y procesada correctamente.

- **200 OK**: Petición exitosa (GET, PUT exitosos)
- **201 Created**: Recurso creado exitosamente (POST exitoso)
- **202 Accepted**: Petición aceptada pero no procesada aún
- **204 No Content**: Petición exitosa pero sin contenido (DELETE exitoso)
- **206 Partial Content**: Respuesta parcial (ranges de contenido)

#### 3xx - Redirección

Indican que se necesita una acción adicional para completar la petición.

- **301 Moved Permanently**: El recurso se movió permanentemente
- **302 Found**: Redirección temporal
- **304 Not Modified**: El recurso no ha cambiado (cache válido)
- **307 Temporary Redirect**: Redirección temporal manteniendo el método
- **308 Permanent Redirect**: Redirección permanente manteniendo el método

#### 4xx - Error del Cliente

Indican errores en la petición del cliente.

- **400 Bad Request**: Petición malformada o inválida
- **401 Unauthorized**: Autenticación requerida o fallida
- **403 Forbidden**: Servidor entiende pero rechaza la petición
- **404 Not Found**: Recurso no encontrado
- **405 Method Not Allowed**: Método HTTP no permitido para este recurso
- **409 Conflict**: Conflicto con el estado actual (por ejemplo: duplicate key)
- **422 Unprocessable Entity**: Datos bien formados pero semánticamente incorrectos
- **429 Too Many Requests**: Límite de velocidad excedido

#### 5xx - Error del Servidor

Indican que el servidor falló al procesar una petición válida.

- **500 Internal Server Error**: Error genérico del servidor
- **501 Not Implemented**: Servidor no soporta la funcionalidad
- **502 Bad Gateway**: Proxy/Gateway recibió respuesta inválida
- **503 Service Unavailable**: Servidor temporalmente no disponible
- **504 Gateway Timeout**: Timeout en proxy/gateway
- **505 HTTP Version Not Supported**: Versión HTTP no soportada

### Idempotencia

Una operación es idempotente si y solo si la puedo ejecutar N veces sin alterar el estado del servidor después de la primera ejecución exitosa.

**¿Qué significa esto?**

Si ejecuto la misma operación 1 vez o 100 veces, el resultado final en el servidor debe ser el mismo.

**Verbos y su idempotencia:**

| Verbo | ¿Idempotente? | Explicación |
|-------|---------------|-------------|
| **GET** | ✅ Sí | Solo lee datos, no modifica el estado |
| **HEAD** | ✅ Sí | Solo obtiene metadatos, no modifica |
| **OPTIONS** | ✅ Sí | Solo obtiene capacidades, no modifica |
| **PUT** | ✅ Sí | Reemplaza completamente el recurso |
| **DELETE** | ✅ Sí | Eliminar algo ya eliminado no cambia el estado |
| **POST** | ❌ No | Cada ejecución puede crear nuevos recursos |
| **PATCH** | ⚠️ Depende | Puede ser idempotente según implementación |

**¿Por qué es importante?**

1. **Tolerancia a fallos**: Permite reintentos seguros en caso de timeouts de red
2. **Sistemas distribuidos**: Facilita la replicación y sincronización
3. **Cache y optimización**: Permite optimizaciones en proxies y CDNs
4. **Debugging**: Operaciones repetibles facilitan la depuración

#### Implementando idempotencia para POST

POST no es idempotente por naturaleza, pero se puede hacer idempotente usando:

**1. Idempotency Keys (Claves de idempotencia):**

```http
POST /api/usuarios
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{"nombre": "Juan", "email": "juan@email.com"}
```

El servidor:

- Verifica si ya procesó esta clave
- Si ya existe, devuelve la respuesta anterior
- Si no existe, procesa y guarda la respuesta

**2. Client-Generated IDs:**

```http
POST /api/usuarios
Content-Type: application/json

{"id": "user_123", "nombre": "Juan", "email": "juan@email.com"}
```

**3. Conditional Requests:**

```http
POST /api/usuarios
If-None-Match: "user_123"
Content-Type: application/json

{"id": "user_123", "nombre": "Juan"}
```

**Ejemplo de implementación en código:**

```java
@PostMapping("/usuarios")
public ResponseEntity<Usuario> crearUsuario(
    @RequestHeader("Idempotency-Key") String idempotencyKey,
    @RequestBody Usuario usuario) {
    
    // Verificar si ya se procesó esta clave
    Optional<OperacionIdempotente> operacionExistente = 
        idempotencyService.buscarPorClave(idempotencyKey);
    
    if (operacionExistente.isPresent()) {
        // Retornar resultado anterior
        return ResponseEntity.ok(operacionExistente.get().getResultado());
    }
    
    // Procesar nueva operación
    Usuario nuevoUsuario = usuarioService.crear(usuario);
    
    // Guardar operación para futuras consultas
    idempotencyService.guardar(idempotencyKey, nuevoUsuario);
    
    return ResponseEntity.status(201).body(nuevoUsuario);
}
```

### CORS

**Cross-Origin Resource Sharing (CORS)** es un mecanismo de seguridad del navegador que controla cómo las páginas web pueden acceder a recursos de otros dominios.

**¿Qué es un "origen" (origin)?**

Un origen está compuesto por: `protocolo + dominio + puerto`

- `https://miapp.com:3000` es diferente de `https://miapp.com:3001`
- `http://miapp.com` es diferente de `https://miapp.com`
- `https://miapp.com` es diferente de `https://api.miapp.com`

#### **¿Por qué existe CORS?**

**Same-Origin Policy**: Los navegadores, por seguridad, solo permiten que una página web haga peticiones AJAX al mismo origen desde el que se cargó la página.

**¿Qué es AJAX?**

**AJAX (Asynchronous JavaScript and XML)** es una técnica que permite a las páginas web realizar peticiones HTTP de forma asíncrona sin recargar toda la página.

- **Asíncrono**: No bloquea la interfaz mientras espera la respuesta
- **JavaScript**: Se ejecuta mediante código JavaScript
- **XML**: Originalmente para intercambiar datos XML, ahora se usa principalmente JSON

**Ejemplo de AJAX:**

```javascript
// AJAX tradicional (XMLHttpRequest)
const xhr = new XMLHttpRequest();
xhr.open('GET', 'https://api.ejemplo.com/datos');
xhr.onload = function() {
  if (xhr.status === 200) {
    console.log(xhr.responseText);
  }
};
xhr.send();

// AJAX moderno (fetch API)
fetch('https://api.ejemplo.com/datos')
  .then(response => response.json())
  .then(data => console.log(data));
```

Sin CORS, una página maliciosa en `evil.com` no podría leer datos de tu cuenta bancaria en `banco.com`.

##### **¿Cómo funciona CORS?**

**1. Peticiones Simples (Simple Requests):**

Peticiones que cumplen:

- Métodos: GET, HEAD, POST
- Headers permitidos: Accept, Accept-Language, Content-Language, Content-Type (con valores limitados)
- Content-Type: application/x-www-form-urlencoded, multipart/form-data, text/plain

```javascript
// Página en https://miapp.com
fetch('https://api.otrodominio.com/datos')
  .then(response => response.json())
```

El navegador envía:

```http
GET /datos HTTP/1.1
Host: api.otrodominio.com
Origin: https://miapp.com
```

El servidor responde con headers CORS:

```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://miapp.com
Access-Control-Allow-Credentials: true
```

**2. Peticiones Preflight (OPTIONS):**

Peticiones "complejas" requieren una petición preflight para verificar permisos:

```javascript
// Petición que requiere preflight
fetch('https://api.otrodominio.com/usuarios', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123'
  },
  body: JSON.stringify({nombre: 'Juan'})
});
```

**Paso 1 - Preflight Request:**

```http
OPTIONS /usuarios HTTP/1.1
Host: api.otrodominio.com
Origin: https://miapp.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type, Authorization
```

**Paso 2 - Preflight Response:**

```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://miapp.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

**Paso 3 - Petición Real:**

```http
POST /usuarios HTTP/1.1
Host: api.otrodominio.com
Origin: https://miapp.com
Content-Type: application/json
Authorization: Bearer token123
```

##### **Headers CORS más importantes:**

| Header | Descripción | Ejemplo |
|--------|-------------|----------|
| `Access-Control-Allow-Origin` | Orígenes permitidos | `*` o `https://miapp.com` |
| `Access-Control-Allow-Methods` | Métodos HTTP permitidos | `GET, POST, PUT, DELETE` |
| `Access-Control-Allow-Headers` | Headers personalizados permitidos | `Content-Type, Authorization` |
| `Access-Control-Allow-Credentials` | Permite envío de cookies/auth | `true` |
| `Access-Control-Max-Age` | Cache del preflight (segundos) | `86400` |
| `Access-Control-Expose-Headers` | Headers disponibles en JS | `X-Total-Count` |

##### **¿Cómo solucionar problemas de CORS?**

**Errores comunes:**

- ❌ `Access-Control-Allow-Origin: *` con credentials
- ❌ No incluir el header en Access-Control-Allow-Headers
- ❌ No manejar OPTIONS en el servidor
- ❌ Olvidar el protocolo en el origen (http vs https)

### HealthCheck

**Health Check** es un endpoint que permite verificar el estado de salud de una aplicación o servicio, fundamental para sistemas distribuidos y monitoreo.

**¿Qué es un Health Check?**

Un endpoint (usualmente `/health` o `/status`) que responde rápidamente indicando si el servicio está funcionando correctamente y puede procesar peticiones.

**¿Para qué sirve?**

1. **Load Balancers**: Decidir si enviar tráfico a una instancia
2. **Orchestradores (K8s, Docker)**: Determinar si reiniciar un contenedor
3. **Monitoreo**: Alertas automáticas cuando un servicio falla
4. **Circuit Breakers**: Evitar llamadas a servicios no disponibles
5. **Deployment**: Verificar que un despliegue fue exitoso

**Verbo HEAD para Health Checks:**

El verbo **HEAD** es ideal para health checks porque:

- Solo retorna headers (no body)
- Más rápido que GET
- Menor consumo de ancho de banda
- Mismo procesamiento que GET pero sin contenido

```http
# Health check básico
HEAD /health HTTP/1.1
Host: api.miservicio.com

# Respuesta
HTTP/1.1 200 OK
Cache-Control: no-cache
Content-Type: application/json
```

**Tipos de Health Checks:**

**1. Liveness Check** ("¿Está vivo?"):

- Verifica si la aplicación está ejecutándose
- Respuesta rápida (< 1 segundo)
- Falla = reiniciar el contenedor

**2. Readiness Check** ("¿Está listo?"):

- Verifica si puede procesar peticiones
- Incluye dependencias (DB, cache, servicios externos)
- Falla = no enviar tráfico

**3. Startup Check** ("¿Ya arrancó?"):

- Durante el arranque inicial
- Timeout más largo
- Protege aplicaciones con arranque lento

**Códigos de respuesta típicos:**

- **200 OK**: Servicio saludable y listo
- **503 Service Unavailable**: Servicio no disponible
- **429 Too Many Requests**: Sobrecargado pero funcional
- **500 Internal Server Error**: Error interno

## REST

**Representational State Transfer** es un estilo arquitectónico para diseñar APIs web que define principios para crear servicios:

- **Simples**: Fáciles de entender e implementar
- **Escalables**: Soportan crecimiento horizontal
- **Basados en recursos**: URLs representan entidades (`/usuarios`, `/productos`)
- **Semántica clara**: Operaciones mediante verbos HTTP (`GET /usuarios/123`)

**Ejemplo de API REST:**

```http
GET    /api/usuarios          # Listar usuarios
GET    /api/usuarios/123      # Obtener usuario específico  
POST   /api/usuarios          # Crear nuevo usuario
PUT    /api/usuarios/123      # Actualizar usuario completo
PATCH  /api/usuarios/123      # Actualizar parcialmente
DELETE /api/usuarios/123      # Eliminar usuario
```

### Principios REST

REST define 6 principios fundamentales para el diseño de APIs web:

| Principio | Descripción | Ejemplo | Beneficio |
|-----------|-------------|---------|----------|
| **Cliente-Servidor** | Separación de responsabilidades entre interfaz de usuario y almacenamiento de datos | Frontend (React) se comunica con Backend (Spring Boot) vía HTTP | Escalabilidad independiente, equipos especializados |
| **Sin Estado (Stateless)** | Cada petición debe contener toda la información necesaria | Incluir JWT token en cada petición en lugar de sesiones | Escalabilidad horizontal, simplicidad |
| **Cacheable** | Las respuestas deben indicar si pueden ser almacenadas en cache | Headers: `Cache-Control: max-age=3600` | Mejor performance, menor carga del servidor |
| **Interfaz Uniforme** | Uso consistente de HTTP y URIs para acceder a recursos | Todos los recursos usan GET/POST/PUT/DELETE de forma estándar | Simplicidad, interoperabilidad |
| **Sistema en Capas** | Arquitectura puede tener intermediarios (proxies, gateways) | Cliente → Load Balancer → API Gateway → Microservicio | Seguridad, escalabilidad, flexibilidad |
| **Código bajo Demanda** | El servidor puede enviar código ejecutable (opcional) | JavaScript enviado desde el servidor | Extensibilidad dinámica |

**Detalles de cada principio:**

#### 1. Cliente-Servidor

```text
Cliente (Frontend)     ←→     Servidor (Backend)
- Presentación               - Lógica de negocio
- Interacción usuario         - Almacenamiento
- Estado de la UI             - Seguridad
```

#### 2. Sin Estado (Stateless)

```http
# ✅ Correcto - petición autocontenida
GET /api/usuarios/123
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ⚠️ No recomendado para REST stateless - depende de sesión del servidor (válido en algunos casos, pero rompe el principio de "sin estado")
GET /api/usuarios/123
Cookie: JSESSIONID=ABC123
```

#### 3. Cacheable

```http
# Respuesta cacheable
HTTP/1.1 200 OK
Cache-Control: public, max-age=3600
ETag: "123456"
Last-Modified: Mon, 18 Nov 2025 10:00:00 GMT

# Petición condicional
GET /api/usuarios/123
If-None-Match: "123456"

# Respuesta 304 Not Modified (usa cache)
HTTP/1.1 304 Not Modified
```

#### 4. Interfaz Uniforme

**Identificación de recursos:**

```http
GET    /api/usuarios      # Obtener lista de usuarios
GET    /api/usuarios/123  # Obtener usuario específico
POST   /api/usuarios      # Crear nuevo usuario
PUT    /api/usuarios/123  # Actualizar usuario
DELETE /api/usuarios/123  # Eliminar usuario
```

**Manipulación mediante representaciones:**

```json
// El cliente envía representación JSON
{
  "nombre": "Juan Pérez",
  "email": "juan@email.com"
}
```

**Mensajes autodescriptivos:**

```http
POST /api/usuarios
Content-Type: application/json
Accept: application/json

{"nombre": "Juan", "email": "juan@email.com"}
```

**HATEOAS (Hypermedia as the Engine of Application State):**

```json
{
  "id": 123,
  "nombre": "Juan Pérez",
  "email": "juan@email.com",
  "_links": {
    "self": {
      "href": "/api/usuarios/123"
    },
    "editar": {
      "href": "/api/usuarios/123",
      "method": "PUT"
    },
    "eliminar": {
      "href": "/api/usuarios/123",
      "method": "DELETE"
    },
    "pedidos": {
      "href": "/api/usuarios/123/pedidos"
    }
  }
}
```

### Gateway

Un **API Gateway** es un servicio que centraliza y gestiona todos los endpoints de un sistema, actuando como punto de entrada único para múltiples servicios backend.

**Funciones principales:**

- **Routing**: Enruta peticiones al servicio backend correcto
- **Load Balancing**: Distribuye carga entre instancias
- **Authentication & Authorization**: Gestión centralizada de seguridad
- **Rate Limiting**: Control de límites de peticiones por cliente
- **Caching**: Almacenamiento en caché de respuestas frecuentes
- **Monitoring & Analytics**: Métricas y logging centralizado
- **Request/Response Transformation**: Modificación de datos en tránsito

**Ventajas:**

- Punto único de configuración para políticas transversales
- Simplifica la arquitectura de microservicios
- Reduce duplicación de código en servicios
- Facilita versionado de APIs

**Ejemplos populares:**

- **Kong**: Open source, basado en Nginx
- **AWS API Gateway**: Servicio gestionado de Amazon
- **Azure API Management**: Solución de Microsoft
- **Zuul**: Netflix OSS, integrado con Spring Cloud

### Proxy

Un **Proxy** es un servidor intermediario que actúa como puente entre un cliente y un servidor de destino, interceptando y retransmitiendo peticiones.

**¿Qué es un Proxy?**

```text
Cliente → Proxy → Servidor Destino
```

El cliente no se comunica directamente con el servidor final, sino que todas las peticiones pasan por el proxy.

**Tipos de Proxy:**

**1. Forward Proxy (Proxy de salida):**

- El cliente conoce que existe el proxy
- Intercepta peticiones del cliente hacia internet
- Uso típico: empresas controlando acceso a internet

```text
Usuario Corporativo → Proxy Corporativo → Internet
                      (filtra contenido)
```

**2. Reverse Proxy (Proxy inverso):**

- El cliente NO sabe que existe el proxy
- Intercepta peticiones hacia un servidor
- El cliente piensa que habla directamente con el servidor

```text
Cliente → Reverse Proxy → Servidor Backend
          (transparente)
```

**¿Para qué sirve?**

**1. Load Balancing (Balanceo de carga):**

```text
                    ┌─ Servidor 1
Cliente → Proxy ────┼─ Servidor 2
                    └─ Servidor 3
```

**2. Caching (Almacenamiento en cache):**

```text
Cliente → Proxy Cache → Servidor
           │
           └─ Cache local (Redis, Memcached)
```

**3. SSL Termination:**

```text
HTTPS → Proxy (termina SSL) → HTTP → Backend
```

**4. Seguridad (WAF - Web Application Firewall):**

- Filtrado de peticiones maliciosas
- Rate limiting
- Protección DDoS

**5. Compresión:**

```nginx
# Nginx con compresión
gzip on;
gzip_types text/plain application/json application/javascript text/css;
```

**Ejemplos Reales:**

**1. CDN (Content Delivery Network):**

- **CloudFlare**: Proxy global que cachea contenido
- **AWS CloudFront**: Distribución de contenido
- **Fastly**: Edge computing y caching

**2. API Gateways:**

- **Kong**: API Gateway con plugins
- **Zuul** (Netflix): Gateway para microservicios
- **AWS API Gateway**: Gestión de APIs en la nube

**3. Proxies corporativos:**

- **Squid**: Cache proxy para empresas
- **Blue Coat**: Seguridad y control de acceso
- **Zscaler**: Cloud proxy security

**Ventajas del uso de Proxy:**

- **Escalabilidad**: Distribuir carga entre múltiples servidores
- **Disponibilidad**: Failover automático
- **Seguridad**: Ocultar servidores backend, filtrar ataques
- **Performance**: Cache, compresión, optimización
- **Flexibilidad**: Routing dinámico, A/B testing
- **SSL**: Terminación centralizada de certificados

### REST vs SOAP

**SOAP (Simple Object Access Protocol)** y **REST (Representational State Transfer)** son dos enfoques diferentes para crear APIs web.

| Aspecto | REST | SOAP |
|---------|------|------|
| **Tipo** | Estilo arquitectónico | Protocolo |
| **Formato** | JSON, XML, HTML, texto | Solo XML |
| **Transporte** | HTTP, HTTPS | HTTP, HTTPS, SMTP, TCP, UDP |
| **Métodos** | HTTP verbs (GET, POST, PUT, DELETE) | Solo POST |
| **Definición de contrato** | OpenAPI/Swagger (opcional) | WSDL (obligatorio) |
| **Complejidad** | Simple, lightweight | Complejo, heavyweight |
| **Performance** | Rápido, menor overhead | Más lento, mayor overhead |
| **Caching** | Sí (HTTP caching) | No (siempre POST) |
| **Seguridad** | HTTPS, OAuth, JWT | WS-Security, SAML |
| **Estandarización** | Menos rígido | Altamente estandarizado |
| **Tolerancia a errores** | Manejo HTTP estándar | SOAP Faults detallados |
| **Tamaño del mensaje** | Pequeño | Grande (XML verbose) |
| **Facilidad de uso** | Fácil | Difícil, curva de aprendizaje |

**WSDL (Web Services Description Language):**

WSDL es un documento XML que describe completamente un servicio SOAP:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://schemas.xmlsoap.org/wsdl/"
             targetNamespace="http://miservicio.com/usuarios">
             
  <!-- Tipos de datos -->
  <types>
    <xsd:schema targetNamespace="http://miservicio.com/usuarios">
      <xsd:element name="GetUsuarioRequest">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="usuarioId" type="xsd:int"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      
      <xsd:element name="GetUsuarioResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="usuario" type="tns:Usuario"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
    </xsd:schema>
  </types>
  
  <!-- Mensajes -->
  <message name="GetUsuarioRequestMessage">
    <part name="parameters" element="tns:GetUsuarioRequest"/>
  </message>
  
  <message name="GetUsuarioResponseMessage">
    <part name="parameters" element="tns:GetUsuarioResponse"/>
  </message>
  
  <!-- PortType (interfaz) -->
  <portType name="UsuarioPortType">
    <operation name="GetUsuario">
      <input message="tns:GetUsuarioRequestMessage"/>
      <output message="tns:GetUsuarioResponseMessage"/>
    </operation>
  </portType>
  
  <!-- Binding (cómo se envían los mensajes) -->
  <binding name="UsuarioSoapBinding" type="tns:UsuarioPortType">
    <soap:binding transport="http://schemas.xmlsoap.org/soap/http"/>
    <operation name="GetUsuario">
      <soap:operation soapAction="getUsuario"/>
      <input>
        <soap:body use="literal"/>
      </input>
      <output>
        <soap:body use="literal"/>
      </output>
    </operation>
  </binding>
  
  <!-- Service (endpoint) -->
  <service name="UsuarioService">
    <port name="UsuarioPort" binding="tns:UsuarioSoapBinding">
      <soap:address location="http://localhost:8080/ws/usuarios"/>
    </port>
  </service>
</definitions>
```

**Embedding SOAP en REST:**

> Cuando se tiene una aplicación que funciona con SOAP y algunas veces no hay personal con experiencia en este protocolo, muchas veces se embebe en la petición REST el XML mediante el Body

```http
# Wrapper REST para servicio SOAP
POST /api/legacy/usuarios/obtener HTTP/1.1
Content-Type: application/xml
X-SOAP-Action: getUsuario

<?xml version="1.0"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetUsuarioRequest>
      <usuarioId>123</usuarioId>
    </GetUsuarioRequest>
  </soap:Body>
</soap:Envelope>
```

**Cuándo usar cada uno:**

**Usar SOAP cuando:**

- Necesitas transacciones ACID
- Seguridad empresarial robusta
- Integración con sistemas legacy
- Contratos rígidos y versionado estricto
- Entornos altamente regulados (banca, gobierno)

**Usar REST cuando:**

- APIs públicas
- Aplicaciones web modernas
- Microservicios
- Móviles y IoT
- Necesitas performance y simplicidad
- Desarrollo ágil

Ejemplo real:

![Ejemplo real de embebido SOAP en REST](assets/clase-03-http-rest/soap-embebido-rest-ejemplo.png)

## Adicional

### Swagger

**Swagger** (ahora **OpenAPI Specification**) es el estándar para documentar APIs REST de forma interactiva.

**¿Qué incluye una especificación OpenAPI?**

- Endpoints y métodos HTTP
- Parámetros de entrada y respuestas
- Modelos de datos
- Autenticación
- Ejemplos de uso

**Configuración básica en Spring Boot:**

```java
// Dependencia
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.0.2</version>
</dependency>

// Configuración
@OpenAPIDefinition(
    info = @Info(
        title = "API de Usuarios",
        version = "1.0.0",
        description = "Gestión de usuarios"
    )
)
public class OpenApiConfig {}

// Controller anotado
@RestController
@Tag(name = "Usuarios")
public class UsuarioController {

    @Operation(summary = "Obtener usuarios")
    @GetMapping("/usuarios")
    public List<Usuario> obtenerUsuarios() {
        return usuarioService.findAll();
    }
}
```

**URLs de acceso:**

- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI JSON**: `http://localhost:8080/v3/api-docs`

**Beneficios:**

1. **Documentación automática**: Siempre actualizada
2. **Testing interactivo**: Probar endpoints desde la UI
3. **Generación de código**: SDKs automáticos
4. **Colaboración**: Facilita trabajo frontend/backend

### Modelo OSI

El **Modelo OSI** describe cómo los datos viajan por una red en 7 capas. Para desarrollo web, las capas más relevantes son:

![Diagrama del modelo OSI de 7 capas para comunicación en red](assets/clase-03-http-rest/modelo-osi-capas.png)

| Capa | Nombre | Protocolos Web | Ejemplo en Desarrollo |
|------|--------|----------------|---------------------|
| **7** | **Aplicación** | HTTP, HTTPS, WebSocket | APIs REST, GraphQL |
| **6** | **Presentación** | TLS/SSL, JSON, XML | Cifrado, serialización |
| **5** | **Sesión** | JWT, Cookies | Autenticación, estado |
| **4** | **Transporte** | **TCP**, **UDP** | Conexiones confiables/rápidas |
| **3** | **Red** | IP | Enrutamiento entre servidores |
| **2-1** | **Enlace/Física** | Ethernet, Wi-Fi | Infraestructura de red |

### TCP vs UDP en Desarrollo Web

**TCP (Transmission Control Protocol):**

- ✅ **Confiable**: Garantiza entrega y orden
- ✅ **Usado en**: HTTP, HTTPS, WebSockets, APIs REST
- ⚠️ **Overhead**: Mayor latencia por verificaciones

**UDP (User Datagram Protocol):**

- ⚡ **Rápido**: Sin overhead de conexión
- ✅ **Usado en**: DNS, streaming en vivo, WebRTC
- ⚠️ **No confiable**: Puede perder paquetes

### Stack de una Petición HTTP

```text
[Aplicación]    fetch('/api/users') - JavaScript
[Presentación]  HTTPS/TLS - Cifrado
[Sesión]        Bearer Token - Autenticación  
[Transporte]    TCP - Conexión confiable
[Red]           IP - Enrutamiento
[Enlace/Física] Ethernet/WiFi - Hardware
```

**Debugging por capas:**

```bash
# Capa 3 (Red)
ping api.miservicio.com

# Capa 4 (Transporte)  
telnet api.miservicio.com 80

# Capa 7 (Aplicación)
curl -v https://api.miservicio.com/health
```

---

## Resumen Final

### Conceptos Clave de HTTP

- **Verbos**: Definen la acción (GET, POST, PUT, DELETE, etc.)
- **Códigos de estado**: Indican el resultado (2xx éxito, 4xx error cliente, 5xx error servidor)
- **Idempotencia**: Operaciones que pueden repetirse sin efectos secundarios
- **CORS**: Mecanismo de seguridad para peticiones entre dominios
- **Health Checks**: Endpoints para verificar el estado de servicios

### Los 6 Principios REST

1. **Cliente-Servidor**: Separación de responsabilidades
2. **Sin Estado**: Cada petición es independiente
3. **Cacheable**: Respuestas pueden almacenarse en cache
4. **Interfaz Uniforme**: Uso consistente de HTTP
5. **Sistema en Capas**: Permite intermediarios (proxies, gateways)
6. **Código bajo Demanda**: Servidor puede enviar código ejecutable

### Herramientas y Conceptos Adicionales

- **API Gateway**: Punto de entrada centralizado para microservicios
- **Proxy**: Intermediario entre cliente y servidor
- **Swagger/OpenAPI**: Documentación interactiva de APIs
- **Modelo OSI**: Marco teórico de 7 capas para comunicación en red

---

> **Tarea**: Hacer un programa sencillo en Java, compilarlo a mano y ejecutarlo
