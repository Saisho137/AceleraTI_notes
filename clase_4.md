# Clase 4 - Bases de datos relacionales

**Ejercicio de clase:** En 15 minutos hacer 2 endpoints de tienda Arca, GET de productos y POST de producto; con Mocks.

## Índice

1. [Bases de datos relacionales](#bases-de-datos-relacionales)
   - [Modelo basado en tablas](#modelo-basado-en-tablas)
   - [Claves y relaciones](#claves-y-relaciones)
   - [Integridad referencial](#integridad-referencial)
   - [Lenguaje SQL](#lenguaje-sql)
   - [Propiedades ACID](#propiedades-acid)
2. [Modelo Entidad-Relación (MER)](#modelo-entidad-relación-mer)
   - [Representación conceptual](#representación-conceptual)
   - [Elementos clave](#elementos-clave)
   - [Tipos de relaciones](#tipos-de-relaciones)
   - [Cardinalidad](#cardinalidad)
3. [Normalización](#normalización)
   - [Primera Forma Normal (1FN)](#primera-forma-normal-1fn)
   - [Segunda Forma Normal (2FN)](#segunda-forma-normal-2fn)
   - [Tercera Forma Normal (3FN)](#tercera-forma-normal-3fn)
   - [Forma Normal de Boyce-Codd (FNBC)](#forma-normal-de-boyce-codd-fnbc)
4. [Ejemplo práctico: Sistema de Biblioteca](#ejemplo-práctico-sistema-de-biblioteca)

---

## Bases de datos relacionales

Las **bases de datos relacionales** son sistemas de gestión de datos que organizan la información en tablas interconectadas, representando la estructura y lógica de negocio mediante relaciones matemáticas entre entidades.

**Características principales:**

- Estructuran datos en **tablas** (relaciones) con filas y columnas
- Utilizan **relaciones** para conectar información entre tablas
- Garantizan **integridad** mediante restricciones y claves
- Implementan **transacciones ACID** (Todo o Nada)
- Emplean **SQL** como lenguaje estándar de consulta

> **Principio fundamental:** Las bases de datos relacionales están diseñadas para garantizar transacciones bajo el principio de **"Todo o Nada"** - una operación se completa totalmente o no se realiza en absoluto.

### Modelo basado en tablas

Las bases de datos relacionales organizan la información en **tablas** (también llamadas relaciones), donde:

- **Filas (tuplas/registros)**: Representan instancias individuales de una entidad
- **Columnas (atributos/campos)**: Definen las propiedades de la entidad
- **Celdas**: Contienen valores específicos de un atributo para un registro

**Ejemplo:**

Tabla `Estudiantes`:

| id_estudiante | nombre | apellido | fecha_nacimiento | email |
|---------------|--------|----------|------------------|-------|
| 1 | Juan | Pérez | 2000-05-15 | <juan@email.com> |
| 2 | María | García | 1999-08-22 | <maria@email.com> |
| 3 | Carlos | López | 2001-01-10 | <carlos@email.com> |

### Claves y relaciones

Las claves son fundamentales para establecer relaciones e identificar registros únicamente:

#### Clave Primaria (Primary Key - PK)

Identifica de forma **única e inequívoca** cada registro en una tabla.

**Características:**

- Valores únicos (no se repiten)
- No puede ser NULL
- Solo una clave primaria por tabla
- Puede ser simple (una columna) o compuesta (varias columnas)
- **Se indexa automáticamente** para optimizar búsquedas

**Ejemplo:**

```sql
CREATE TABLE Estudiantes (
    id_estudiante INT PRIMARY KEY,  -- Clave primaria simple
    nombre VARCHAR(100),
    email VARCHAR(100) UNIQUE
);

-- Clave primaria compuesta
CREATE TABLE Inscripciones (
    id_estudiante INT,
    id_curso INT,
    fecha_inscripcion DATE,
    PRIMARY KEY (id_estudiante, id_curso)  -- Compuesta
);
```

#### Clave Foránea (Foreign Key - FK)

Establece una **relación** entre dos tablas, referenciando la clave primaria de otra tabla.

**Características:**

- Apunta a una clave primaria de otra tabla (o de la misma)
- Puede tener valores NULL (si se permite)
- Puede haber múltiples claves foráneas en una tabla
- Garantiza la integridad referencial

**Ejemplo:**

```sql
CREATE TABLE Cursos (
    id_curso INT PRIMARY KEY,
    nombre VARCHAR(100),
    creditos INT
);

CREATE TABLE Inscripciones (
    id_inscripcion INT PRIMARY KEY,
    id_estudiante INT,
    id_curso INT,
    fecha_inscripcion DATE,
    FOREIGN KEY (id_estudiante) REFERENCES Estudiantes(id_estudiante),
    FOREIGN KEY (id_curso) REFERENCES Cursos(id_curso)
);
```

#### Clave Candidata

Cualquier columna o conjunto de columnas que **podría** ser clave primaria (cumple requisitos de unicidad y no nulidad).

**Ejemplo:**

En la tabla `Estudiantes`:

- `id_estudiante` (elegida como PK)
- `email` (también única, es clave candidata)
- `numero_documento` (única, es clave candidata)

#### Clave Única (Unique Key)

Similar a la clave primaria pero con diferencias importantes:

**Diferencias con Primary Key:**

- **Permite un valor NULL** (solo uno en la mayoría de DBMS)
- Puede haber **múltiples claves únicas** por tabla
- **Se indexa automáticamente** (como PK) para garantizar unicidad eficientemente
- No identifica el registro principal de la tabla

```sql
CREATE TABLE Usuarios (
    id_usuario INT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,  -- Clave única
    email VARCHAR(100) UNIQUE,    -- Clave única
    telefono VARCHAR(20) UNIQUE   -- Clave única
);
```

### Integridad referencial

La **integridad referencial** es una regla de consistencia que garantiza que las relaciones entre tablas permanezcan válidas y coherentes.

**Definición:**
> Asegura que toda clave foránea en una tabla hija debe corresponder a una clave primaria existente en la tabla padre, o ser NULL (si se permite).

**Reglas:**

1. **No se pueden insertar** registros hijos que referencien padres inexistentes
2. **No se pueden eliminar** registros padres si tienen hijos dependientes (sin configuración CASCADE)
3. **No se pueden modificar** claves primarias si tienen referencias activas

**Ejemplo práctico:**

```sql
-- Tabla padre
CREATE TABLE Departamentos (
    id_departamento INT PRIMARY KEY,
    nombre VARCHAR(100)
);

-- Tabla hija
CREATE TABLE Empleados (
    id_empleado INT PRIMARY KEY,
    nombre VARCHAR(100),
    id_departamento INT,
    FOREIGN KEY (id_departamento) 
        REFERENCES Departamentos(id_departamento)
);

-- ✅ Inserción válida
INSERT INTO Departamentos VALUES (1, 'Ventas');
INSERT INTO Empleados VALUES (101, 'Ana', 1);  -- Referencia válida

-- ❌ Violación de integridad referencial
INSERT INTO Empleados VALUES (102, 'Luis', 99);  
-- Error: id_departamento 99 no existe

-- ❌ Violación al eliminar
DELETE FROM Departamentos WHERE id_departamento = 1;
-- Error: Hay empleados que referencian este departamento
```

**Acciones ante violaciones (ON DELETE / ON UPDATE):**

```sql
CREATE TABLE Empleados (
    id_empleado INT PRIMARY KEY,
    nombre VARCHAR(100),
    id_departamento INT,
    FOREIGN KEY (id_departamento) 
        REFERENCES Departamentos(id_departamento)
        ON DELETE CASCADE          -- Elimina empleados si se elimina el depto
        ON UPDATE CASCADE          -- Actualiza FK si cambia la PK
);

-- Otras opciones:
-- ON DELETE SET NULL       - Pone NULL en la FK
-- ON DELETE NO ACTION      - Impide la eliminación (default)
-- ON DELETE RESTRICT       - Similar a NO ACTION
-- ON UPDATE SET DEFAULT    - Pone valor por defecto
```

**Integridad referencial en migraciones:**

Al migrar una base de datos, es **crucial** mantener la integridad referencial:

1. **Orden de migración:**

   ```sql
   -- ✅ Orden correcto: Padres primero
   MIGRATE Departamentos;      -- Tabla padre
   MIGRATE Empleados;          -- Tabla hija
   
   -- ❌ Orden incorrecto causará errores
   MIGRATE Empleados;          -- Falla: no existen departamentos
   MIGRATE Departamentos;
   ```

2. **Desactivar y reactivar temporalmente:**

   ```sql
   -- Desactivar temporalmente (cuidado en producción)
   SET FOREIGN_KEY_CHECKS = 0;
   -- Realizar migraciones
   SET FOREIGN_KEY_CHECKS = 1;
   ```

3. **Validar integridad post-migración:**

   ```sql
   -- Verificar registros huérfanos
   SELECT e.* 
   FROM Empleados e
   LEFT JOIN Departamentos d ON e.id_departamento = d.id_departamento
   WHERE d.id_departamento IS NULL;
   ```

### Lenguaje SQL

**SQL (Structured Query Language)** es el lenguaje estándar para interactuar con bases de datos relacionales. Se divide en sublanguajes según su función:

#### DDL (Data Definition Language)

Define y modifica la **estructura** de la base de datos (esquema).

**Comandos principales:**

- `CREATE`: Crear objetos (tablas, vistas, índices)
- `ALTER`: Modificar estructura existente
- `DROP`: Eliminar objetos
- `TRUNCATE`: Eliminar todos los datos de una tabla (sin logging)

**Ejemplos:**

```sql
-- CREATE: Crear tabla
CREATE TABLE Productos (
    id_producto INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) CHECK (precio > 0),  -- Constraint CHECK
    stock INT DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ALTER: Agregar columna
ALTER TABLE Productos ADD COLUMN categoria VARCHAR(50);

-- ALTER: Modificar tipo de columna
ALTER TABLE Productos MODIFY COLUMN precio DECIMAL(12,2);

-- ALTER: Agregar constraint
ALTER TABLE Productos ADD CONSTRAINT uk_nombre UNIQUE (nombre);

-- DROP: Eliminar tabla
DROP TABLE Productos;

-- TRUNCATE: Eliminar todos los datos (rápido, sin rollback)
TRUNCATE TABLE Productos;
```

#### DML (Data Manipulation Language)

Manipula los **datos** dentro de las tablas.

**Comandos principales:**

- `SELECT`: Consultar datos
- `INSERT`: Insertar nuevos registros
- `UPDATE`: Actualizar registros existentes
- `DELETE`: Eliminar registros

**Ejemplos:**

```sql
-- INSERT: Insertar datos
INSERT INTO Productos (nombre, precio, stock) 
VALUES ('Laptop', 1200.00, 15);

-- INSERT múltiple
INSERT INTO Productos (nombre, precio, stock) VALUES
    ('Mouse', 25.00, 100),
    ('Teclado', 45.00, 80),
    ('Monitor', 350.00, 30);

-- SELECT: Consultar datos
SELECT * FROM Productos WHERE precio > 50;

SELECT nombre, precio 
FROM Productos 
WHERE stock > 20 AND precio < 100
ORDER BY precio DESC;

-- UPDATE: Actualizar registros
UPDATE Productos 
SET precio = precio * 1.10  -- Incremento 10%
WHERE categoria = 'Electrónica';

-- DELETE: Eliminar registros
DELETE FROM Productos 
WHERE stock = 0 AND fecha_creacion < '2023-01-01';
```

**Constraint CHECK en DML:**

El `CHECK` es una restricción que valida que los datos cumplan una condición específica antes de insertarse o actualizarse.

```sql
-- CHECK en creación de tabla
CREATE TABLE Empleados (
    id_empleado INT PRIMARY KEY,
    nombre VARCHAR(100),
    edad INT CHECK (edad >= 18 AND edad <= 65),  -- Rango válido
    salario DECIMAL(10,2) CHECK (salario > 0),   -- Mayor que cero
    email VARCHAR(100) CHECK (email LIKE '%@%'), -- Formato email
    genero CHAR(1) CHECK (genero IN ('M', 'F', 'O'))  -- Valores específicos
);

-- Intentar insertar con violación CHECK
INSERT INTO Empleados VALUES (1, 'Juan', 15, 500, 'juan@mail.com', 'M');
-- Error: edad debe estar entre 18 y 65

-- CHECK con nombre personalizado
ALTER TABLE Empleados 
ADD CONSTRAINT chk_salario_minimo 
CHECK (salario >= 1300000);
```

#### DCL (Data Control Language)

Controla **permisos y accesos** a la base de datos.

**Comandos principales:**

- `GRANT`: Otorgar permisos
- `REVOKE`: Revocar permisos

**Ejemplos:**

```sql
-- GRANT: Otorgar permisos de lectura
GRANT SELECT ON database_name.Productos TO 'usuario_lectura'@'localhost';

-- GRANT: Otorgar múltiples permisos
GRANT SELECT, INSERT, UPDATE ON database_name.* TO 'usuario_admin'@'%';

-- GRANT: Todos los permisos
GRANT ALL PRIVILEGES ON *.* TO 'superadmin'@'localhost';

-- REVOKE: Quitar permisos
REVOKE INSERT, UPDATE ON database_name.Productos FROM 'usuario_lectura'@'localhost';
```

#### TCL (Transaction Control Language)

Controla las **transacciones** para garantizar ACID.

**Comandos principales:**

- `BEGIN/START TRANSACTION`: Iniciar transacción
- `COMMIT`: Confirmar cambios permanentemente
- `ROLLBACK`: Deshacer cambios
- `SAVEPOINT`: Crear punto de guardado dentro de una transacción

**Ejemplos:**

```sql
-- Transacción bancaria
START TRANSACTION;

    UPDATE Cuentas SET saldo = saldo - 1000 WHERE id_cuenta = 101;
    UPDATE Cuentas SET saldo = saldo + 1000 WHERE id_cuenta = 102;
    
    -- Si algo falla, se hace ROLLBACK
    -- Si todo está bien, se hace COMMIT

COMMIT;  -- Confirmar ambas operaciones

-- Transacción con ROLLBACK
BEGIN TRANSACTION;

    INSERT INTO Pedidos (cliente_id, total) VALUES (1, 500);
    -- Uy, error detectado
    
ROLLBACK;  -- Deshacer el INSERT

-- Transacción con SAVEPOINT
START TRANSACTION;

    INSERT INTO Ordenes VALUES (1, '2024-01-01', 100);
    SAVEPOINT punto1;
    
    INSERT INTO DetalleOrden VALUES (1, 1, 'Producto A', 50);
    SAVEPOINT punto2;
    
    INSERT INTO DetalleOrden VALUES (2, 1, 'Producto B', 50);
    
    -- Problema con el último insert
    ROLLBACK TO punto2;  -- Volver al punto2, conservar hasta ahí
    
COMMIT;
```

### Propiedades ACID

Las propiedades **ACID** garantizan que las transacciones en bases de datos relacionales sean confiables y mantengan la integridad de los datos, incluso ante fallos.

#### A - Atomicidad (Atomicity)

**Definición:** Una transacción es una unidad indivisible - **se ejecuta completamente o no se ejecuta en absoluto** (Todo o Nada).

**Principio:** Si cualquier parte de la transacción falla, toda la transacción se revierte (rollback).

**Ejemplo práctico: Transferencia bancaria:**

```sql
START TRANSACTION;

-- Paso 1: Restar dinero de cuenta origen
UPDATE Cuentas SET saldo = saldo - 1000 WHERE id_cuenta = 'A123';

-- Paso 2: Sumar dinero a cuenta destino
UPDATE Cuentas SET saldo = saldo + 1000 WHERE id_cuenta = 'B456';

-- Si AMBOS pasos tienen éxito -> COMMIT
-- Si CUALQUIERA falla -> ROLLBACK automático
COMMIT;
```

**Escenarios:**

- ✅ Ambos updates exitosos → Se confirma la transferencia
- ❌ Falla el primer update → No se ejecuta nada
- ❌ Falla el segundo update → Se deshace el primero (rollback)
- ❌ Falla de sistema entre ambos → Se deshace automáticamente al reiniciar

**Sin atomicidad:**

```text
Cuenta A: $1000 → $0     (se restó)
Cuenta B: $500 → $500    (falla, no se suma)
Resultado: ¡Se perdieron $1000! 💸
```

**Con atomicidad:**

```text
Cuenta A: $1000 → $1000  (rollback)
Cuenta B: $500 → $500    (no se ejecutó)
Resultado: Todo queda como estaba ✅
```

#### C - Consistencia (Consistency)

**Definición:** Una transacción lleva la base de datos de un **estado válido a otro estado válido**, respetando todas las reglas e integridad definidas.

**Principio:** No se permiten transacciones que violen constraints, triggers, o reglas de negocio.

**Ejemplo práctico: Sistema de inventario:**

```sql
-- Reglas de negocio:
-- 1. Stock nunca puede ser negativo
-- 2. Total de ventas debe cuadrar con stock reducido
-- 3. Todo producto vendido debe estar en inventario

START TRANSACTION;

-- Venta de 5 unidades
UPDATE Productos SET stock = stock - 5 WHERE id_producto = 101;

-- Registrar venta
INSERT INTO Ventas (id_producto, cantidad, total) 
VALUES (101, 5, 250.00);

-- Validaciones de consistencia:
-- ¿El stock es válido (>= 0)?
-- ¿El producto existe?
-- ¿Los valores tienen sentido?

COMMIT;
```

**Escenarios:**

- ✅ Stock = 10, vender 5 → Stock = 5 (válido)
- ❌ Stock = 3, vender 5 → Rechazado (violaría constraint `stock >= 0`)
- ❌ Vender producto inexistente → Rechazado (viola FK)

**Constraints que garantizan consistencia:**

```sql
CREATE TABLE Productos (
    id_producto INT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,           -- No puede ser vacío
    precio DECIMAL(10,2) CHECK (precio > 0), -- Precio positivo
    stock INT CHECK (stock >= 0),           -- Stock no negativo
    categoria_id INT,
    FOREIGN KEY (categoria_id) REFERENCES Categorias(id)  -- Debe existir
);

-- Trigger para consistencia adicional
CREATE TRIGGER validar_stock_suficiente
BEFORE INSERT ON Ventas
FOR EACH ROW
BEGIN
    DECLARE stock_actual INT;
    SELECT stock INTO stock_actual FROM Productos WHERE id_producto = NEW.id_producto;
    
    IF stock_actual < NEW.cantidad THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock insuficiente';
    END IF;
END;
```

#### I - Aislamiento (Isolation)

**Definición:** Las transacciones concurrentes se ejecutan de forma **aislada**, sin interferir entre sí, como si fueran secuenciales.

**Principio:** Los cambios de una transacción no son visibles para otras hasta que se confirmen (COMMIT).

**Niveles de aislamiento (Isolation Levels):**

SQL define 4 niveles de aislamiento con diferentes trade-offs entre consistencia y rendimiento:

| Nivel | Dirty Read | Non-Repeatable Read | Phantom Read | Performance |
|-------|------------|---------------------|--------------|-------------|
| **READ UNCOMMITTED** | ✅ Posible | ✅ Posible | ✅ Posible | ⚡⚡⚡ Máxima |
| **READ COMMITTED** | ❌ Imposible | ✅ Posible | ✅ Posible | ⚡⚡ Alta |
| **REPEATABLE READ** | ❌ Imposible | ❌ Imposible | ✅ Posible | ⚡ Media |
| **SERIALIZABLE** | ❌ Imposible | ❌ Imposible | ❌ Imposible | 🐌 Baja |

**Problemas de concurrencia:**

**1. Dirty Read (Lectura sucia):**

Una transacción lee datos modificados por otra transacción que **aún no ha hecho COMMIT**.

```sql
-- Transacción A
BEGIN;
UPDATE Productos SET precio = 100 WHERE id = 1;  -- Era 50
-- Aún NO se ha hecho COMMIT

-- Transacción B (con READ UNCOMMITTED)
SELECT precio FROM Productos WHERE id = 1;  -- Lee 100 (dato no confirmado)

-- Transacción A
ROLLBACK;  -- Se deshace, precio vuelve a 50

-- Problema: Transacción B leyó un dato que nunca existió oficialmente
```

**2. Non-Repeatable Read (Lectura no repetible):**

Una transacción lee el mismo registro **dos veces** y obtiene valores diferentes porque otra transacción lo modificó entre lecturas.

```sql
-- Transacción A
BEGIN;
SELECT saldo FROM Cuentas WHERE id = 101;  -- Lee $1000

-- Transacción B
UPDATE Cuentas SET saldo = 500 WHERE id = 101;
COMMIT;

-- Transacción A (continúa)
SELECT saldo FROM Cuentas WHERE id = 101;  -- Ahora lee $500 😱
COMMIT;

-- Problema: Misma consulta, resultados diferentes dentro de la misma transacción
```

**3. Phantom Read (Lectura fantasma):**

Una transacción ejecuta la misma consulta dos veces y obtiene **diferentes conjuntos de filas** porque otra transacción insertó/eliminó registros.

```sql
-- Transacción A
BEGIN;
SELECT COUNT(*) FROM Pedidos WHERE estado = 'Pendiente';  -- 5 pedidos

-- Transacción B
INSERT INTO Pedidos (estado) VALUES ('Pendiente');
COMMIT;

-- Transacción A (continúa)
SELECT COUNT(*) FROM Pedidos WHERE estado = 'Pendiente';  -- 6 pedidos 👻
COMMIT;

-- Problema: Aparecieron filas "fantasma" que no estaban antes
```

**Configurar nivel de aislamiento:**

```sql
-- A nivel de sesión
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- A nivel de transacción específica
START TRANSACTION ISOLATION LEVEL REPEATABLE READ;
    -- operaciones...
COMMIT;

-- Ejemplo práctico: garantizar lecturas consistentes
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;

BEGIN;
    SELECT saldo FROM Cuentas WHERE id = 101;  -- $1000
    -- ... lógica de negocio ...
    SELECT saldo FROM Cuentas WHERE id = 101;  -- Garantizado: $1000
COMMIT;
```

**Elección del nivel:**

- **READ UNCOMMITTED**: Reportes no críticos, máxima velocidad
- **READ COMMITTED**: Default en PostgreSQL, buen balance
- **REPEATABLE READ**: Default en MySQL, transacciones financieras
- **SERIALIZABLE**: Transacciones críticas (bancos, sistemas médicos)

#### D - Durabilidad (Durability)

**Definición:** Una vez que una transacción hace **COMMIT**, los cambios son **permanentes** y sobreviven a fallos del sistema (crashes, pérdida de energía).

**Principio:** Los datos confirmados se escriben en almacenamiento persistente (disco) y son recuperables.

**Ejemplo práctico:**

```sql
BEGIN;
    INSERT INTO Transacciones (id, monto, fecha) VALUES (1, 5000, NOW());
COMMIT;  -- ✅ A partir de aquí, el registro es PERMANENTE

-- Incluso si:
-- - El servidor se apaga
-- - Hay un corte de luz
-- - El sistema operativo crashea
-- - Se reinicia la base de datos

-- Cuando el sistema se recupere, el registro estará ahí
```

**Mecanismos de durabilidad:**

1. **Write-Ahead Logging (WAL):**

   ```text
   - Primero se escribe el cambio en el log (disco)
   - Luego se puede confirmar al usuario
   - Los cambios reales en tablas se hacen después (más lento)
   ```

2. **Checkpoints:**

   ```text
   - Periódicamente se sincronizan todos los cambios pendientes
   - Reduce el tiempo de recuperación tras un fallo
   ```

3. **Transaction Log:**

   ```sql
   -- PostgreSQL
   SHOW wal_level;  -- Log de transacciones
   
   -- MySQL
   SHOW VARIABLES LIKE 'innodb_flush_log_at_trx_commit';
   -- = 1: Máxima durabilidad (flush a disco en cada COMMIT)
   -- = 2: Flush cada segundo (más rápido, menos seguro)
   ```

**Trade-off Durabilidad vs Performance:**

```sql
-- Máxima durabilidad (lento)
SET innodb_flush_log_at_trx_commit = 1;

-- Mayor rendimiento (riesgo de perder última transacción en crash)
SET innodb_flush_log_at_trx_commit = 2;
```

**Recuperación tras fallos:**

```sql
-- El sistema usa los logs para recuperar transacciones
-- Redo: Rehacer transacciones confirmadas (COMMIT) que no se escribieron
-- Undo: Deshacer transacciones no confirmadas (sin COMMIT)

-- PostgreSQL
pg_ctl start  -- Automáticamente recupera del WAL

-- MySQL
mysql --user=root --password
-- InnoDB automáticamente recupera transacciones
```

## Modelo Entidad-Relación (MER)

El **Modelo Entidad-Relación** es una técnica de modelado conceptual que permite representar la estructura de una base de datos de forma visual e independiente de la implementación técnica.

### Representación Conceptual

**Propósito:** Modelar entidades, atributos y relaciones del dominio del problema **antes del diseño físico**.

**Ventajas:**

- Comunicación clara entre analistas, desarrolladores y stakeholders
- Independiente del DBMS (PostgreSQL, MySQL, Oracle, etc.)
- Facilita la detección de errores en etapas tempranas
- Sirve como documentación del sistema
- Permite establecer un **lenguaje ubicuo** compartido por todo el equipo

**Lenguaje Ubicuo (Ubiquitous Language):**

Es un vocabulario común y preciso que comparten todos los miembros del proyecto (negocio y técnicos) para referirse a conceptos del dominio. El MER ayuda a definir este lenguaje mediante:

- **Nombres de entidades** que reflejan conceptos del negocio (Cliente, Pedido, Producto)
- **Términos consistentes** en código, documentación y conversaciones
- **Reducción de ambigüedades** en requisitos y especificaciones

**Ejemplo:** Si el negocio usa "Miembro" en lugar de "Usuario", el MER, la base de datos y el código deben usar consistentemente "Miembro" para evitar confusiones.

### Elementos clave

#### 1. Entidades

**Definición:** Objetos o conceptos del mundo real que tienen existencia independiente y sobre los cuales se almacena información.

**Representación:** Rectángulos

**Tipos:**

- **Fuertes:** Existen por sí mismas (ej: `Cliente`, `Producto`)
- **Débiles:** Dependen de otra entidad para existir (ej: `Dependiente` de `Empleado`)

**Ejemplos:**

```text
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Cliente  │     │ Producto │     │  Pedido  │
└──────────┘     └──────────┘     └──────────┘
```

#### 2. Atributos

**Definición:** Propiedades o características que describen una entidad.

**Representación:** Óvalos conectados a la entidad

**Tipos:**

**a) Simples vs Compuestos:**

```text
Simples:
- edad: 25
- precio: 100.50

Compuestos (se pueden descomponer):
- nombre_completo: {nombre: "Juan", apellido: "Pérez"}
- direccion: {calle: "Main St", numero: 123, ciudad: "NYC"}
```

**b) Mono-valuados vs Multi-valuados:**

```text
Mono-valuados (un solo valor):
- fecha_nacimiento: 1990-05-15
- numero_documento: 123456

Multi-valuados (múltiples valores):
- telefonos: [555-1234, 555-5678, 555-9012]
- emails: [personal@mail.com, trabajo@empresa.com]
```

**c) Almacenados vs Derivados:**

```text
Almacenados (se guardan):
- fecha_nacimiento: 1990-05-15
- precio_base: 100

Derivados (se calculan):
- edad: 34 (calculada desde fecha_nacimiento)
- precio_con_iva: 119 (calculado desde precio_base)
```

**d) Clave (Key):**

```text
- id_cliente (PRIMARY KEY)
- numero_documento (UNIQUE)
- email (UNIQUE)
```

#### 3. Relaciones

**Definición:** Asociaciones o vínculos entre dos o más entidades.

**Representación:** Rombos conectando entidades

**Ejemplo visual:**

```text
┌──────────┐                    ┌──────────┐
│ Cliente  │───── realiza ─────>│  Pedido  │
└──────────┘                    └──────────┘
```

### Tipos de relaciones

Las relaciones se clasifican según su **cardinalidad** (número de instancias que pueden asociarse).

#### 1. Uno a Uno (1:1)

**Definición:** Una instancia de la entidad A se relaciona con **exactamente una** instancia de la entidad B, y viceversa.

**Ejemplo:** Una persona tiene un solo pasaporte, y un pasaporte pertenece a una sola persona.

```text
┌──────────┐        1:1         ┌──────────┐
│ Persona  │────────────────────│Pasaporte │
└──────────┘                    └──────────┘
```

**Implementación SQL:**

```sql
CREATE TABLE Personas (
    id_persona INT PRIMARY KEY,
    nombre VARCHAR(100),
    fecha_nacimiento DATE
);

CREATE TABLE Pasaportes (
    numero_pasaporte VARCHAR(20) PRIMARY KEY,
    id_persona INT UNIQUE,  -- UNIQUE garantiza 1:1
    fecha_emision DATE,
    fecha_vencimiento DATE,
    FOREIGN KEY (id_persona) REFERENCES Personas(id_persona)
);
```

**Casos de uso:**

- Persona ↔ Pasaporte
- Usuario ↔ Perfil de Usuario
- Empleado ↔ Escritorio asignado
- País ↔ Capital

#### 2. Uno a Muchos (1:N)

**Definición:** Una instancia de la entidad A se relaciona con **cero o más** instancias de la entidad B, pero una instancia de B solo se relaciona con **una** de A.

**Ejemplo:** Un cliente puede hacer muchos pedidos, pero cada pedido pertenece a un solo cliente.

```text
┌──────────┐        1:N         ┌──────────┐
│ Cliente  │────────────────────│  Pedido  │
└──────────┘                    └──────────┘
    1                              N
```

**Implementación SQL:**

```sql
CREATE TABLE Clientes (
    id_cliente INT PRIMARY KEY,
    nombre VARCHAR(100),
    email VARCHAR(100)
);

CREATE TABLE Pedidos (
    id_pedido INT PRIMARY KEY,
    id_cliente INT,  -- FK en el lado "muchos"
    fecha DATE,
    total DECIMAL(10,2),
    FOREIGN KEY (id_cliente) REFERENCES Clientes(id_cliente)
);
```

**Casos de uso:**

- Cliente → Pedidos
- Departamento → Empleados
- Categoría → Productos
- Autor → Libros
- Profesor → Cursos

#### 3. Muchos a Muchos (N:M)

**Definición:** Una instancia de A se relaciona con **cero o más** instancias de B, y una instancia de B se relaciona con **cero o más** instancias de A.

**Ejemplo:** Un estudiante puede inscribirse en muchos cursos, y un curso puede tener muchos estudiantes.

```text
┌──────────┐        N:M         ┌──────────┐
│Estudiante│────────────────────│  Curso   │
└──────────┘                    └──────────┘
    N                              M
```

**Implementación SQL (requiere tabla intermedia):**

```sql
CREATE TABLE Estudiantes (
    id_estudiante INT PRIMARY KEY,
    nombre VARCHAR(100),
    carrera VARCHAR(50)
);

CREATE TABLE Cursos (
    id_curso INT PRIMARY KEY,
    nombre VARCHAR(100),
    creditos INT
);

-- Tabla intermedia (junction table)
CREATE TABLE Inscripciones (
    id_estudiante INT,
    id_curso INT,
    fecha_inscripcion DATE,
    nota DECIMAL(3,2),
    PRIMARY KEY (id_estudiante, id_curso),  -- PK compuesta
    FOREIGN KEY (id_estudiante) REFERENCES Estudiantes(id_estudiante),
    FOREIGN KEY (id_curso) REFERENCES Cursos(id_curso)
);
```

**Casos de uso:**

- Estudiantes ↔ Cursos
- Productos ↔ Pedidos
- Actores ↔ Películas
- Médicos ↔ Pacientes
- Autores ↔ Libros (un libro puede tener varios autores)

### Cardinalidad

La **cardinalidad** especifica el número mínimo y máximo de instancias que pueden participar en una relación.

**Notación:** `(mínimo, máximo)`

**Símbolos comunes:**

- `0` - Cero (participación opcional)
- `1` - Uno
- `N` o `*` - Muchos (sin límite)

**Ejemplos:**

#### Ejemplo 1: Cliente - Pedido

```text
        (1,1)                (0,N)
Cliente ────────realiza───────── Pedido
```

**Interpretación:**

- Un cliente puede hacer **0 o muchos** pedidos (0,N)
- Un pedido debe pertenecer a **exactamente un** cliente (1,1)

#### Ejemplo 2: Estudiante - Curso

```text
          (0,N)                  (1,N)
Estudiante ────inscripción──── Curso
```

**Interpretación:**

- Un estudiante puede inscribirse en **0 o más** cursos (0,N)
- Un curso debe tener **al menos 1** estudiante inscrito (1,N)

#### Ejemplo 3: Empleado - Departamento

```text
         (1,1)                 (0,N)
Empleado ────pertenece──── Departamento
```

**Interpretación:**

- Un empleado debe pertenecer a **exactamente un** departamento (1,1)
- Un departamento puede tener **0 o muchos** empleados (0,N)

**Cardinalidades comunes:**

| Cardinalidad | Significado | Ejemplo |
|--------------|-------------|---------|
| **(0,1)** | Opcional, máximo uno | Persona → Licencia de conducir |
| **(1,1)** | Obligatorio, exactamente uno | Pedido → Cliente |
| **(0,N)** | Opcional, sin límite | Cliente → Pedidos |
| **(1,N)** | Al menos uno, sin límite | Curso → Estudiantes |

### Independencia de implementación

**Ventaja clave:** El modelo MER es abstracto y no depende del DBMS específico que se use.

**Proceso:**

```text
1. Modelo Conceptual (MER)
   ↓
2. Modelo Lógico (tablas, relaciones)
   ↓
3. Modelo Físico (PostgreSQL, MySQL, Oracle)
```

El mismo MER puede implementarse en diferentes bases de datos sin cambios en el diseño conceptual.

### Base para normalización

El MER sirve como punto de partida para aplicar **formas normales** que eliminan redundancia y mejoran la integridad de datos.

## Normalización

La **normalización** es el proceso de organizar datos en una base de datos para **reducir redundancia** y **mejorar integridad**, dividiendo tablas grandes en tablas más pequeñas y definiendo relaciones entre ellas.

**Objetivos:**

- Eliminar datos duplicados
- Minimizar anomalías de inserción, actualización y eliminación
- Simplificar consultas y mantenimiento
- Garantizar dependencias lógicas coherentes

**Proceso:** Aplicar formas normales (FN) progresivamente: 1FN → 2FN → 3FN → FNBC

### Primera Forma Normal (1FN)

**Regla:** Todos los atributos deben contener **valores atómicos** (indivisibles) y **no deben haber grupos repetitivos**.

**Violaciones:** Múltiples valores en una celda (ej: "555-1234, 555-5678"), columnas repetitivas (tel1, tel2, tel3).

**Ejemplo: ❌ No está en 1FN**

| id | nombre | telefonos | cursos |
|----|--------|-----------|--------|
| 1 | Juan | 555-1234, 555-5678 | Math, Physics |

**Problema:** `telefonos` y `cursos` tienen múltiples valores.

**Solución: ✅ En 1FN (tablas separadas)**

```sql
CREATE TABLE Estudiantes (
    id_estudiante INT PRIMARY KEY,
    nombre VARCHAR(100)
);

CREATE TABLE Telefonos (
    id_telefono INT PRIMARY KEY,
    id_estudiante INT,
    telefono VARCHAR(20),
    FOREIGN KEY (id_estudiante) REFERENCES Estudiantes(id_estudiante)
);
```

### Segunda Forma Normal (2FN)

**Requisito:** Estar en 1FN

**Regla:** Todos los atributos **no clave** deben depender de **toda la clave primaria**, no solo de parte de ella. Elimina **dependencias parciales** en claves compuestas.

**Ejemplo: ❌ No está en 2FN**

| id_estudiante | id_curso | nombre_estudiante | nombre_curso | calificacion |
|---------------|----------|-------------------|--------------|--------------|
| 1 | 101 | Juan | Matemáticas | 9.5 |

**PK:** (id_estudiante, id_curso)

**Problema:** `nombre_estudiante` solo depende de `id_estudiante`, `nombre_curso` solo depende de `id_curso`.

**Solución: ✅ En 2FN**

```sql
CREATE TABLE Estudiantes (
    id_estudiante INT PRIMARY KEY,
    nombre_estudiante VARCHAR(100)
);

CREATE TABLE Cursos (
    id_curso INT PRIMARY KEY,
    nombre_curso VARCHAR(100)
);

CREATE TABLE Inscripciones (
    id_estudiante INT,
    id_curso INT,
    calificacion DECIMAL(3,2),
    PRIMARY KEY (id_estudiante, id_curso),
    FOREIGN KEY (id_estudiante) REFERENCES Estudiantes(id_estudiante),
    FOREIGN KEY (id_curso) REFERENCES Cursos(id_curso)
);
```

### Tercera Forma Normal (3FN)

**Requisito:** Estar en 2FN

**Regla:** Ningún atributo **no clave** debe depender de otro atributo **no clave**. Elimina **dependencias transitivas** (A → B → C).

**Ejemplo: ❌ No está en 3FN**

| id_empleado | nombre | id_departamento | nombre_departamento | ubicacion_departamento |
|-------------|--------|-----------------|---------------------|------------------------|
| 1 | Juan | 10 | Ventas | Edificio A |
| 2 | Ana | 20 | IT | Edificio B |

**PK:** id_empleado

**Problema:** `id_empleado` → `id_departamento` → `nombre_departamento` (dependencia transitiva)

**Solución: ✅ En 3FN**

```sql
CREATE TABLE Empleados (
    id_empleado INT PRIMARY KEY,
    nombre VARCHAR(100),
    id_departamento INT,
    FOREIGN KEY (id_departamento) REFERENCES Departamentos(id_departamento)
);

CREATE TABLE Departamentos (
    id_departamento INT PRIMARY KEY,
    nombre_departamento VARCHAR(100),
    ubicacion_departamento VARCHAR(100)
);
```

### Forma Normal de Boyce-Codd (FNBC)

**Requisito:** Estar en 3FN

**Regla:** Para toda dependencia funcional `X → Y`, `X` debe ser **superclave**. Es una versión más estricta de 3FN.

**Ejemplo: ❌ Está en 3FN pero NO en FNBC**

| id_estudiante | id_curso | instructor |
|---------------|----------|------------|
| 1 | Math101 | Dr. Smith |
| 2 | Math101 | Dr. Smith |

**Regla de negocio:** Un instructor solo enseña un curso específico.

**Problema:** `instructor → id_curso` viola FNBC (instructor no es superclave).

**Solución: ✅ En FNBC**

```sql
CREATE TABLE Instructores_Cursos (
    instructor VARCHAR(100) PRIMARY KEY,
    id_curso VARCHAR(20),
    FOREIGN KEY (id_curso) REFERENCES Cursos(id_curso)
);

CREATE TABLE Inscripciones (
    id_estudiante INT,
    instructor VARCHAR(100),
    PRIMARY KEY (id_estudiante, instructor),
    FOREIGN KEY (id_estudiante) REFERENCES Estudiantes(id_estudiante),
    FOREIGN KEY (instructor) REFERENCES Instructores_Cursos(instructor)
);
```

### Resumen de Formas Normales

| Forma Normal | Requisito | Qué elimina |
|--------------|-----------|-------------|
| **1FN** | Base | Valores no atómicos, grupos repetitivos |
| **2FN** | En 1FN | Dependencias parciales (en claves compuestas) |
| **3FN** | En 2FN | Dependencias transitivas (no-clave → no-clave) |
| **FNBC** | En 3FN | Dependencias de no-superclave |

**Guía:** 1FN es obligatorio, 3FN suficiente para la mayoría, FNBC para sistemas críticos.

---



---

## Resumen final

### Conceptos clave

**Bases de datos relacionales:**

- Modelo basado en **tablas** con filas y columnas
- **Claves** (primarias, foráneas, candidatas) para identificar y relacionar
- **Integridad referencial** para mantener consistencia entre tablas
- **SQL** dividido en DDL, DML, DCL, TCL
- **Propiedades ACID** para transacciones confiables

**Modelo Entidad-Relación:**

- **Entidades** (objetos), **atributos** (propiedades), **relaciones** (vínculos)
- Tipos de relaciones: **1:1**, **1:N**, **N:M**
- **Cardinalidad** especifica participación mínima y máxima

**Normalización:**

- **1FN:** Valores atómicos, sin grupos repetitivos
- **2FN:** Eliminar dependencias parciales
- **3FN:** Eliminar dependencias transitivas
- **FNBC:** Solo superclaves determinan atributos

---
