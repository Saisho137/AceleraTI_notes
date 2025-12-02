# Clase 4.2 - Bases de datos relacionales

## Solución tarea

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                   DIAGRAMA MER LÓGICO                                    │
└─────────────────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────┐
    │       Persona       │
    ├─────────────────────┤
    │ PK  documento       │◄─────────────────────────────────────────┐
    │     tipo_documento  │                                          │
    │     nombre          │                                          │
    │     apellidos       │                                          │
    │     created_at      │                                          │
    │     updated_at      │                                          │
    └─────────┬───────────┘                                          │
              │                                                      │
              │ 1:N                                                   │
              ▼                                                      │
    ┌─────────────────────┐                                          │
    │      Telefono       │                                          │
    ├─────────────────────┤                                          │
    │ PK  id              │                                          │
    │ FK  documento_pers  │                                          │
    │     numero          │                                          │
    │     tipo            │  [MOVIL, FIJO, TRABAJO]                  │
    │     es_principal    │                                          │
    │     created_at      │                                          │
    └─────────────────────┘                                          │
                                                                     │
    ┌─────────────────────┐         ┌─────────────────────┐          │
    │    Propietario      │         │    Arrendatario     │          │
    ├─────────────────────┤         ├─────────────────────┤          │
    │ PK  documento_pers  │────┐    │ PK  documento_pers  │──────────┤
    │ FK  (hereda Persona)│    │    │ FK  (hereda Persona)│          │
    │     activo          │    │    │     tipo            │ [PROPIETARIO, EXTERNO]
    │     created_at      │    │    │     activo          │          │
    │     updated_at      │    │    │     created_at      │          │
    └─────────────────────┘    │    │     updated_at      │          │
              │                │    └──────────┬──────────┘          │
              │ 1:N            │               │                     │
              ▼                │               │ 1:N                 │
    ┌─────────────────────┐    │               │                     │
    │    Parqueadero      │    │               │                     │
    ├─────────────────────┤    │               │                     │
    │ PK  id              │◄───────────────────┼─────────────────────┘
    │ FK  documento_prop  │────┘               │
    │     tipo            │ [MOTO, CARRO]      │
    │     ubicacion_piso  │                    │
    │     ubicacion_num   │                    │
    │     activo          │                    │
    │     created_at      │                    │
    │     updated_at      │                    │
    └─────────┬───────────┘                    │
              │                                │
              │ 1:N                            │
              │         ┌──────────────────────┘
              ▼         ▼
    ┌─────────────────────────┐       ┌─────────────────────┐
    │     Arrendamiento       │       │  EstadoArrendamiento│
    ├─────────────────────────┤       ├─────────────────────┤
    │ PK  id                  │       │ PK  id              │
    │ FK  id_parqueadero      │       │     codigo          │ [ACTIVO, FINALIZADO,
    │ FK  documento_arrend    │       │     nombre          │  CANCELADO, VENCIDO]
    │ FK  id_estado           │──────►│     descripcion     │
    │     fecha_inicio        │       └─────────────────────┘
    │     fecha_fin           │
    │     valor_mensual       │       ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
    │     notas               │         CONSTRAINT: Para un mismo
    │     created_at          │       │ id_parqueadero, los rangos    │
    │     updated_at          │         (fecha_inicio, fecha_fin) NO
    │     deleted_at          │       │ deben solaparse.              │
    └─────────────────────────┘       └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘


┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ LEYENDA:                                                                                │
│   PK = Primary Key    FK = Foreign Key    ──► = Relación    [ ] = Valores ENUM/CHECK   │
│                                                                                         │
│ DECISIONES DE DISEÑO:                                                                   │
│   • Persona: Tabla base para evitar duplicación (un propietario puede ser arrendatario)│
│   • Soft Delete: Solo en Arrendamiento (deleted_at) para historial                     │
│   • Hard Delete: En otras tablas con validación de dependencias                        │
│   • Teléfono: Ahora relacionado con Persona (sirve para ambos roles)                   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

```sql
-- ============================================================================
-- SISTEMA DE GESTIÓN DE PARQUEADEROS
-- Base de datos PostgreSQL
-- Fecha: 2025
-- ============================================================================

-- Eliminar objetos existentes (para desarrollo)
DROP TRIGGER IF EXISTS trg_validar_solapamiento ON arrendamiento;
DROP FUNCTION IF EXISTS fn_validar_solapamiento_arrendamiento();
DROP FUNCTION IF EXISTS fn_actualizar_updated_at();
DROP TABLE IF EXISTS arrendamiento CASCADE;
DROP TABLE IF EXISTS parqueadero CASCADE;
DROP TABLE IF EXISTS arrendatario CASCADE;
DROP TABLE IF EXISTS propietario CASCADE;
DROP TABLE IF EXISTS telefono CASCADE;
DROP TABLE IF EXISTS persona CASCADE;
DROP TABLE IF EXISTS estado_arrendamiento CASCADE;

-- TIPOS ENUMERADOS
CREATE TYPE tipo_documento_enum AS ENUM ('CC', 'CE', 'NIT', 'PASAPORTE', 'TI');
CREATE TYPE tipo_telefono_enum AS ENUM ('MOVIL', 'FIJO', 'TRABAJO');
CREATE TYPE tipo_parqueadero_enum AS ENUM ('MOTO', 'CARRO');
CREATE TYPE tipo_arrendatario_enum AS ENUM ('PROPIETARIO', 'EXTERNO');

-- TABLA: persona
CREATE TABLE persona (
    documento       VARCHAR(20)           NOT NULL,
    tipo_documento  tipo_documento_enum   NOT NULL DEFAULT 'CC',
    nombre          VARCHAR(100)          NOT NULL,
    apellidos       VARCHAR(100)          NOT NULL,
    email           VARCHAR(150),
    created_at      TIMESTAMP             NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP             NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_persona PRIMARY KEY (documento),
    CONSTRAINT uq_persona_email UNIQUE (email),
    CONSTRAINT chk_persona_nombre CHECK (LENGTH(TRIM(nombre)) >= 2),
    CONSTRAINT chk_persona_apellidos CHECK (LENGTH(TRIM(apellidos)) >= 2),
    CONSTRAINT chk_persona_email CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- TABLA: telefono
CREATE TABLE telefono (
    id                  SERIAL                NOT NULL,
    documento_persona   VARCHAR(20)           NOT NULL,
    numero              VARCHAR(15)           NOT NULL,
    tipo                tipo_telefono_enum    NOT NULL DEFAULT 'MOVIL',
    es_principal        BOOLEAN               NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMP             NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_telefono PRIMARY KEY (id),
    CONSTRAINT fk_telefono_persona FOREIGN KEY (documento_persona)
        REFERENCES persona(documento) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_telefono_persona_numero UNIQUE (documento_persona, numero),
    CONSTRAINT chk_telefono_numero CHECK (numero ~ '^[0-9]{7,15}$')
);

CREATE INDEX idx_telefono_documento ON telefono(documento_persona);

-- TABLA: propietario
CREATE TABLE propietario (
    documento_persona   VARCHAR(20)   NOT NULL,
    activo              BOOLEAN       NOT NULL DEFAULT TRUE,
    fecha_registro      DATE          NOT NULL DEFAULT CURRENT_DATE,
    created_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_propietario PRIMARY KEY (documento_persona),
    CONSTRAINT fk_propietario_persona FOREIGN KEY (documento_persona)
        REFERENCES persona(documento) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- TABLA: arrendatario
CREATE TABLE arrendatario (
    documento_persona   VARCHAR(20)             NOT NULL,
    tipo                tipo_arrendatario_enum  NOT NULL DEFAULT 'EXTERNO',
    activo              BOOLEAN                 NOT NULL DEFAULT TRUE,
    fecha_registro      DATE                    NOT NULL DEFAULT CURRENT_DATE,
    created_at          TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_arrendatario PRIMARY KEY (documento_persona),
    CONSTRAINT fk_arrendatario_persona FOREIGN KEY (documento_persona)
        REFERENCES persona(documento) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- TABLA: parqueadero
CREATE TABLE parqueadero (
    id                  SERIAL                  NOT NULL,
    documento_propiet   VARCHAR(20)             NOT NULL,
    tipo                tipo_parqueadero_enum   NOT NULL,
    ubicacion_piso      SMALLINT                NOT NULL,
    ubicacion_numero    VARCHAR(10)             NOT NULL,
    activo              BOOLEAN                 NOT NULL DEFAULT TRUE,
    observaciones       TEXT,
    created_at          TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_parqueadero PRIMARY KEY (id),
    CONSTRAINT fk_parqueadero_propietario FOREIGN KEY (documento_propiet)
        REFERENCES propietario(documento_persona) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT uq_parqueadero_ubicacion UNIQUE (ubicacion_piso, ubicacion_numero),
    CONSTRAINT chk_parqueadero_piso CHECK (ubicacion_piso >= -5 AND ubicacion_piso <= 50),
    CONSTRAINT chk_parqueadero_numero CHECK (LENGTH(TRIM(ubicacion_numero)) >= 1)
);

CREATE INDEX idx_parqueadero_propietario ON parqueadero(documento_propiet);
CREATE INDEX idx_parqueadero_tipo ON parqueadero(tipo) WHERE activo = TRUE;
CREATE INDEX idx_parqueadero_ubicacion ON parqueadero(ubicacion_piso, ubicacion_numero);

-- TABLA: estado_arrendamiento
CREATE TABLE estado_arrendamiento (
    id              SERIAL          NOT NULL,
    codigo          VARCHAR(20)     NOT NULL,
    nombre          VARCHAR(50)     NOT NULL,
    descripcion     TEXT,
    es_final        BOOLEAN         NOT NULL DEFAULT FALSE,

    CONSTRAINT pk_estado_arrendamiento PRIMARY KEY (id),
    CONSTRAINT uq_estado_codigo UNIQUE (codigo)
);

INSERT INTO estado_arrendamiento (codigo, nombre, descripcion, es_final) VALUES
    ('ACTIVO', 'Activo', 'El arrendamiento está vigente', FALSE),
    ('FINALIZADO', 'Finalizado', 'El arrendamiento terminó en la fecha acordada', TRUE),
    ('CANCELADO', 'Cancelado', 'El arrendamiento fue cancelado por mutuo acuerdo', TRUE),
    ('VENCIDO', 'Vencido', 'El arrendamiento superó la fecha fin sin renovación', TRUE);

-- TABLA: arrendamiento
CREATE TABLE arrendamiento (
    id                      SERIAL          NOT NULL,
    id_parqueadero          INTEGER         NOT NULL,
    documento_arrendatario  VARCHAR(20)     NOT NULL,
    id_estado               INTEGER         NOT NULL DEFAULT 1,
    fecha_inicio            DATE            NOT NULL,
    fecha_fin               DATE            NOT NULL,
    valor_mensual           DECIMAL(12,2)   NOT NULL,
    notas                   TEXT,
    created_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at              TIMESTAMP       NULL,

    CONSTRAINT pk_arrendamiento PRIMARY KEY (id),
    CONSTRAINT fk_arrendamiento_parqueadero FOREIGN KEY (id_parqueadero)
        REFERENCES parqueadero(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_arrendamiento_arrendatario FOREIGN KEY (documento_arrendatario)
        REFERENCES arrendatario(documento_persona) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_arrendamiento_estado FOREIGN KEY (id_estado)
        REFERENCES estado_arrendamiento(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_arrendamiento_fechas CHECK (fecha_fin > fecha_inicio),
    CONSTRAINT chk_arrendamiento_valor CHECK (valor_mensual > 0),
    CONSTRAINT chk_arrendamiento_duracion_minima CHECK (fecha_fin >= fecha_inicio + INTERVAL '1 month')
);

CREATE INDEX idx_arrendamiento_parqueadero ON arrendamiento(id_parqueadero) WHERE deleted_at IS NULL;
CREATE INDEX idx_arrendamiento_arrendatario ON arrendamiento(documento_arrendatario) WHERE deleted_at IS NULL;
CREATE INDEX idx_arrendamiento_estado ON arrendamiento(id_estado) WHERE deleted_at IS NULL;
CREATE INDEX idx_arrendamiento_fechas ON arrendamiento(fecha_inicio, fecha_fin) WHERE deleted_at IS NULL;
CREATE INDEX idx_arrendamiento_activos ON arrendamiento(id_parqueadero, fecha_inicio, fecha_fin)
    WHERE deleted_at IS NULL AND id_estado = 1;

-- FUNCIONES
CREATE OR REPLACE FUNCTION fn_validar_solapamiento_arrendamiento()
RETURNS TRIGGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    IF NEW.deleted_at IS NOT NULL THEN
        RETURN NEW;
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM arrendamiento a
    WHERE a.id_parqueadero = NEW.id_parqueadero
      AND a.id != COALESCE(NEW.id, 0)
      AND a.deleted_at IS NULL
      AND a.id_estado = 1
      AND (
          (NEW.fecha_inicio >= a.fecha_inicio AND NEW.fecha_inicio < a.fecha_fin)
          OR (NEW.fecha_fin > a.fecha_inicio AND NEW.fecha_fin <= a.fecha_fin)
          OR (NEW.fecha_inicio <= a.fecha_inicio AND NEW.fecha_fin >= a.fecha_fin)
      );

    IF v_count > 0 THEN
        RAISE EXCEPTION 'El parqueadero ID % ya tiene un arrendamiento activo que se solapa con el rango de fechas % a %',
            NEW.id_parqueadero, NEW.fecha_inicio, NEW.fecha_fin
            USING ERRCODE = 'unique_violation';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGERS
CREATE TRIGGER trg_validar_solapamiento
    BEFORE INSERT OR UPDATE ON arrendamiento
    FOR EACH ROW EXECUTE FUNCTION fn_validar_solapamiento_arrendamiento();

CREATE TRIGGER trg_persona_updated_at
    BEFORE UPDATE ON persona FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();

CREATE TRIGGER trg_propietario_updated_at
    BEFORE UPDATE ON propietario FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();

CREATE TRIGGER trg_arrendatario_updated_at
    BEFORE UPDATE ON arrendatario FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();

CREATE TRIGGER trg_parqueadero_updated_at
    BEFORE UPDATE ON parqueadero FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();

CREATE TRIGGER trg_arrendamiento_updated_at
    BEFORE UPDATE ON arrendamiento FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();

-- VISTAS
CREATE OR REPLACE VIEW vw_arrendamientos_activos AS
SELECT
    a.id AS arrendamiento_id,
    p_parq.ubicacion_piso,
    p_parq.ubicacion_numero,
    p_parq.tipo AS tipo_parqueadero,
    prop.documento_persona AS propietario_documento,
    per_prop.nombre || ' ' || per_prop.apellidos AS propietario_nombre,
    arr.documento_persona AS arrendatario_documento,
    per_arr.nombre || ' ' || per_arr.apellidos AS arrendatario_nombre,
    arr.tipo AS tipo_arrendatario,
    a.fecha_inicio,
    a.fecha_fin,
    a.valor_mensual,
    ea.nombre AS estado,
    (a.fecha_fin - a.fecha_inicio) / 30 AS meses_contratados,
    CASE
        WHEN CURRENT_DATE > a.fecha_fin THEN 'VENCIDO'
        WHEN CURRENT_DATE >= a.fecha_fin - INTERVAL '30 days' THEN 'POR VENCER'
        ELSE 'VIGENTE'
    END AS alerta_vencimiento
FROM arrendamiento a
INNER JOIN parqueadero p_parq ON a.id_parqueadero = p_parq.id
INNER JOIN propietario prop ON p_parq.documento_propiet = prop.documento_persona
INNER JOIN persona per_prop ON prop.documento_persona = per_prop.documento
INNER JOIN arrendatario arr ON a.documento_arrendatario = arr.documento_persona
INNER JOIN persona per_arr ON arr.documento_persona = per_arr.documento
INNER JOIN estado_arrendamiento ea ON a.id_estado = ea.id
WHERE a.deleted_at IS NULL AND a.id_estado = 1;

CREATE OR REPLACE VIEW vw_parqueaderos_disponibles AS
SELECT
    p.id, p.tipo, p.ubicacion_piso, p.ubicacion_numero,
    per.nombre || ' ' || per.apellidos AS propietario,
    per.documento AS propietario_documento
FROM parqueadero p
INNER JOIN propietario prop ON p.documento_propiet = prop.documento_persona
INNER JOIN persona per ON prop.documento_persona = per.documento
WHERE p.activo = TRUE
  AND NOT EXISTS (
      SELECT 1 FROM arrendamiento a
      WHERE a.id_parqueadero = p.id AND a.deleted_at IS NULL
        AND a.id_estado = 1 AND CURRENT_DATE BETWEEN a.fecha_inicio AND a.fecha_fin
  );

-- DATOS DE EJEMPLO
INSERT INTO persona (documento, tipo_documento, nombre, apellidos, email) VALUES
    ('1234567890', 'CC', 'Carlos', 'García Mendoza', 'carlos.garcia@email.com'),
    ('0987654321', 'CC', 'María', 'López Ruiz', 'maria.lopez@email.com'),
    ('1122334455', 'CC', 'Juan', 'Martínez Pérez', 'juan.martinez@email.com'),
    ('5544332211', 'CE', 'Ana', 'Rodríguez Silva', 'ana.rodriguez@email.com');

INSERT INTO telefono (documento_persona, numero, tipo, es_principal) VALUES
    ('1234567890', '3001234567', 'MOVIL', TRUE),
    ('1234567890', '6011234567', 'FIJO', FALSE),
    ('0987654321', '3109876543', 'MOVIL', TRUE),
    ('1122334455', '3201122334', 'MOVIL', TRUE);

INSERT INTO propietario (documento_persona) VALUES ('1234567890'), ('0987654321');

INSERT INTO arrendatario (documento_persona, tipo) VALUES
    ('1122334455', 'EXTERNO'), ('5544332211', 'EXTERNO'), ('0987654321', 'PROPIETARIO');

INSERT INTO parqueadero (documento_propiet, tipo, ubicacion_piso, ubicacion_numero) VALUES
    ('1234567890', 'CARRO', 1, 'A-101'), ('1234567890', 'CARRO', 1, 'A-102'),
    ('1234567890', 'MOTO', 1, 'M-01'), ('0987654321', 'CARRO', 2, 'B-201'),
    ('0987654321', 'MOTO', -1, 'S-M01');

INSERT INTO arrendamiento (id_parqueadero, documento_arrendatario, fecha_inicio, fecha_fin, valor_mensual, notas) VALUES
    (1, '1122334455', '2025-01-01', '2025-12-31', 150000.00, 'Contrato anual'),
    (4, '5544332211', '2025-06-01', '2026-05-31', 180000.00, 'Incluye acceso 24/7'),
    (3, '0987654321', '2025-03-01', '2025-08-31', 50000.00, 'Propietario arrienda para su moto personal');

```

## Consultas hechas en clase sobre este modelo

```sql
-- Personas que son propietarias --
SELECT p2.* FROM ejercicio_parqueaderos.propietario as p1
INNER JOIN ejercicio_parqueaderos.persona as p2 ON p1.documento_persona = p2.documento;

-- Propietarios que NO tienen Parqueadero --
SELECT DISTINCT p.documento_persona FROM ejercicio_parqueaderos.propietario as p
LEFT JOIN ejercicio_parqueaderos.parqueadero as par ON p.documento_persona = par.documento_propiet
WHERE par.documento_propiet IS NULL;

-- Personas que son propietarios y arrendatarios Y tienen más de 1 parqueadero --
SELECT prop.documento_persona, COUNT(1) FROM ejercicio_parqueaderos.propietario as prop
INNER JOIN ejercicio_parqueaderos.arrendatario as arr ON prop.documento_persona = arr.documento_persona 
-- Hasta aquí PERSONAS propietarias y arrendatarias --
INNER JOIN ejercicio_parqueaderos.parqueadero as par ON par.documento_propiet = arr.documento_persona
-- Hasta aquí son PERSONAS propietarias y arrendatarias Y tienen 1+ PARQUEADERO --
GROUP BY prop.documento_persona 
-- TENIENDO un recuento de Parqueaderos > 1 --
HAVING COUNT(1) > 1;
```
