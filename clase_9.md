# Clase 9 - SOLID

## Índice

1. [¿Qué es SOLID y por qué importa?](#qué-es-solid-y-por-qué-importa)
2. [Single Responsibility Principle (SRP)](#single-responsibility-principle-srp)
3. [Open/Closed Principle (OCP)](#openclosed-principle-ocp)
4. [Liskov Substitution Principle (LSP)](#liskov-substitution-principle-lsp)
5. [Interface Segregation Principle (ISP)](#interface-segregation-principle-isp)
6. [Dependency Inversion Principle (DIP)](#dependency-inversion-principle-dip)
7. [SOLID en conjunto](#solid-en-conjunto)
8. [Ejercicio práctico](#ejercicio-práctico)
9. [Recursos adicionales](#recursos-adicionales)

## Resumen

Esta clase presenta los **principios SOLID** de diseño orientado a objetos, formulados por Robert C. Martin (Uncle Bob):

- **S**ingle Responsibility: Una clase, una responsabilidad
- **O**pen/Closed: Abierto a extensión, cerrado a modificación
- **L**iskov Substitution: Las subclases deben ser sustituibles por sus clases base
- **I**nterface Segregation: Interfaces pequeñas y específicas
- **D**ependency Inversion: Depender de abstracciones, no de implementaciones

**Objetivo:** Crear código mantenible, extensible, testeable y con bajo acoplamiento.

---

## ¿Qué es SOLID y por qué importa?

Son 5 principios de diseño orientado a objetos, formulados por **Robert C. Martin (Uncle Bob)**, cuyo objetivo es generar código mantenible, extensible y testeable.

Con SOLID conseguimos:

- ✅ Código robusto y fácil de testar
- ✅ Los cambios no rompen todo el sistema
- ✅ Bajo acoplamiento entre componentes
- ✅ Facilita el trabajo en equipo

---

## Single Responsibility Principle (SRP)

**Una clase (o función) debe tener una y solo una razón para cambiar.**

### Ejemplo: Violando SRP

![Violando SRP](assets/clase_9/srp_violacion.png)

### Ejemplo: Aplicando SRP

![Aplicando SRP](assets/clase_9/srp_aplicacion.png)

### Beneficios de SRP

- Clases más pequeñas y enfocadas
- Más fáciles de entender
- Más fáciles de testar
- Cambios no afectan otras partes
- Mejor reutilización de código

---

## Open/Closed Principle (OCP)

**Las entidades de software deben estar abiertas para extensión, pero cerradas para modificación.**

### Ejemplo: Violando OCP

![Violando OCP](assets/clase_9/ocp_violacion.png)

### Ejemplo: Aplicando OCP

![Aplicando OCP](assets/clase_9/ocp_aplicacion.png)

### Patrón Strategy

![Patrón Strategy](assets/clase_9/patron_strategy.png)

### Beneficios de OCP

- Agregar funcionalidad sin modificar código existente
- Reduce riesgo de romper funcionalidad
- Código más estable en producción
- Facilita el testing (mockear estrategias)

---

## Liskov Substitution Principle (LSP)

**Los objetos de una clase derivada deben poder sustituir objetos de la clase base sin alterar el comportamiento del programa.**

### Ejemplo: Violando LSP

![Violando LSP](assets/clase_9/lsp_violacion.png)

### El problema

![El problema](assets/clase_9/lsp_problema.png)

### Ejemplo: Aplicando LSP

![Aplicando LSP](assets/clase_9/lsp_aplicacion.png)

### Beneficios de LSP

- Herencia correcta y predecible
- Polimorfismo que funciona
- Código cliente no necesita conocer subtipos
- Tests unitarios válidos para toda la jerarquía

---

## Interface Segregation Principle (ISP)

**Los clientes no deben ser forzados a depender de interfaces que no utilizan.**

### Ejemplo: Violando ISP

![Violando ISP](assets/clase_9/isp_violacion.png)

### Ejemplo: Aplicando ISP

![Aplicando ISP](assets/clase_9/isp_aplicacion.png)

### Implementaciones limpias

![Implementaciones limpias](assets/clase_9/isp_implementaciones_limpias.png)

### Beneficios de ISP

- Interfaces pequeñas y cohesivas
- Clases no implementan métodos innecesarios
- Menor acoplamiento
- Más fácil de mockear en tests
- Cambios en una interfaz no afectan a clientes que no la usan

---

## Dependency Inversion Principle (DIP)

**Los módulos de alto nivel no deben depender de módulos de bajo nivel. Ambos deben depender de abstracciones.**

### Ejemplo: Violando DIP

![Violando DIP](assets/clase_9/dip_violacion.png)

### Ejemplo: Aplicando DIP

![Aplicando DIP](assets/clase_9/dip_aplicacion.png)

### Alto nivel depende de abstracción

![Alto nivel depende de abstracción](assets/clase_9/dip_alto_nivel_abstraccion.png)

### DIP con Spring Framework

![DIP con Spring Framework](assets/clase_9/dip_spring_framework.png)

### Beneficios de DIP

- Desacoplamiento total entre módulos
- Fácil de cambiar implementaciones
- Testing con mocks/stubs trivial
- Base para Inyección de Dependencias
- Arquitectura flexible y extensible

---

## SOLID en conjunto

### Ejemplo: Sistema de Notificaciones

![Sistema de Notificaciones](assets/clase_9/solid_ejemplo_notificaciones.png)

### Servicio con DIP y SRP

![Servicio con DIP y SRP](assets/clase_9/solid_servicio_dip_srp.png)

### Uso flexible

![Uso flexible](assets/clase_9/solid_uso_flexible.png)

---

## Ejercicio práctico

### Analiza este código y encuentra qué principios SOLID viola

![Ejercicio](assets/clase_9/ejercicio_analizar_violaciones.png)

---

## Recursos adicionales

### Herramientas mencionadas

**SQLite:**

- Permite implementar una base de datos en un documento
- No requiere instalar motores o aplicaciones adicionales
- Solo necesitas la dependencia del cliente en Java

**Retrofit:**

- Cliente HTTP para Java
- Parseo automático de JSON a objetos
- Más simple y directo que FeignClient en algunos casos

### Material de estudio

📚 **Presentación oficial:** [SOLID - Slides Enyoi](https://manulasker.github.io/enyoi_java_slides/clase_10_11_solid_presentation/index.html#/1)
