# Clase Extra - AWS CloudFormation & LocalStack

**Recursos:**

- [Laboratorio Docker & LocalStack](https://manulasker.github.io/enyoi_java_slides/lab_1_docker_localstack/)
- [Módulo: Configuración Inicial](https://manulasker.github.io/enyoi_java_slides/lab_1_docker_localstack/modulos/configuracion-inicial)

---

## Índice

1. [Resumen](#resumen)
2. [CloudFormation - Introducción](#cloudformation---introducción)
3. [Convenciones de Nomenclatura](#convenciones-de-nomenclatura)
4. [AWS SQS - Límites de Mensajes](#aws-sqs---límites-de-mensajes)
5. [Patrón Saga - Transacciones Distribuidas](#patrón-saga---transacciones-distribuidas)
6. [AWS Secrets Manager](#aws-secrets-manager)
7. [Recursos Adicionales](#recursos-adicionales)

---

## Resumen

CloudFormation es el servicio de Infraestructura como Código (IaC) de AWS que permite definir recursos mediante plantillas YAML o JSON. Las mejores prácticas incluyen usar prefijos en Logical IDs (r para Resources, p para Parameters, o para Outputs) para mejorar la legibilidad. AWS SQS tiene un límite de 1 MB por mensaje; para mensajes mayores se debe usar S3 Extended Client Library. El patrón Saga permite manejar transacciones distribuidas mediante eventos con compensación (rollback) en caso de fallo. AWS Secrets Manager automatiza la rotación de secretos mediante funciones Lambda.

---

## CloudFormation - Introducción

**AWS CloudFormation** es un servicio de Infraestructura como Código (IaC) que permite definir y provisionar recursos de AWS mediante plantillas declarativas en formato YAML o JSON.

### Componentes Principales

Una plantilla de CloudFormation típicamente contiene:

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Description: Descripción de la plantilla

Parameters:
  # Valores de entrada configurables
  ...

Resources:
  # Recursos de AWS a crear
  ...

Outputs:
  # Valores de salida para exportar
  ...
```

**Ventajas:**

- ✅ Infraestructura versionada en Git
- ✅ Reproducible en múltiples ambientes
- ✅ Rollback automático en caso de error
- ✅ Gestión de dependencias entre recursos

---

## Convenciones de Nomenclatura

### Buena Práctica: Prefijos en Logical IDs

Es una **buena práctica** usar prefijos en los Logical IDs de CloudFormation para mejorar la legibilidad y organización del código.

### Convención de Prefijos

| Sección        | Prefijo | Ejemplo            |
| -------------- | ------- | ------------------ |
| **Resources**  | `r`     | `rOrdenesQueue`    |
| **Parameters** | `p`     | `pEnvironment`     |
| **Outputs**    | `o`     | `oOrdenesQueueUrl` |

### Ejemplo: Sin Prefijos (Menos Claro)

```yaml
Parameters:
  Environment:
    Type: String
    Default: dev

Resources:
  OrdenesQueue:
    Type: AWS::SQS::Queue
    Properties:
      QueueName: !Sub ordenes-${Environment}

Outputs:
  OrdenesQueueUrl:
    Description: URL de la cola de órdenes
    Value: !GetAtt OrdenesQueue.QueueUrl
```

### Ejemplo: Con Prefijos (Más Claro)

```yaml
Parameters:
  pEnvironment:
    Type: String
    Default: dev
    Description: Ambiente de despliegue

Resources:
  rOrdenesQueue:
    Type: AWS::SQS::Queue
    Properties:
      QueueName: !Sub ordenes-${pEnvironment}
      MessageRetentionPeriod: 345600 # 4 días

Outputs:
  oOrdenesQueueUrl:
    Description: URL de la cola de órdenes
    Value: !GetAtt rOrdenesQueue.QueueUrl
    Export:
      Name: !Sub ${AWS::StackName}-OrdenesQueueUrl
```

### Ventajas de Usar Prefijos

- ✅ **Claridad**: Se identifica inmediatamente el tipo de elemento
- ✅ **Organización**: Facilita la búsqueda y navegación en plantillas grandes
- ✅ **Prevención de conflictos**: Evita colisiones de nombres entre secciones
- ✅ **Mantenibilidad**: Mejora la legibilidad para equipos grandes

### Otras Convenciones Comunes

Además de los prefijos, considera estas prácticas:

```yaml
# Usar PascalCase para Logical IDs
rUserTable: # ✅ Correcto
  Type: AWS::DynamoDB::Table

r_user_table: # ❌ Evitar snake_case
  Type: AWS::DynamoDB::Table

# Nombres descriptivos
rApiGateway: # ✅ Claro
rAG: # ❌ Ambiguo

# Consistencia en toda la plantilla
rOrdenesQueue: # ✅ Consistente con otros recursos
OrdenesQueue: # ❌ Inconsistente si otros usan prefijo
```

---

## AWS SQS - Límites de Mensajes

### Límite de Tamaño de Mensaje

**AWS SQS** tiene un límite de **1 MB** (1,048,576 bytes) por mensaje.

> **Actualización 2025:** AWS aumentó el límite de 256 KB a 1 MB en enero de 2025.

### Problema: Mensajes Mayores a 1 MB

Si necesitas enviar mensajes mayores a 1 MB, SQS por sí solo no es suficiente.

**Solución:** Usar **Amazon S3** como almacenamiento extendido.

### Amazon SQS Extended Client Library

Para manejar mensajes grandes (hasta 2 GB), usa la **SQS Extended Client Library**:

```xml
<!-- Maven dependency para Java -->
<dependency>
    <groupId>com.amazonaws</groupId>
    <artifactId>amazon-sqs-java-extended-client-lib</artifactId>
    <version>2.0.3</version>
</dependency>
```

### Cómo Funciona

1. **Mensaje > 1 MB**: El cliente automáticamente sube el payload a S3
2. **Referencia en SQS**: SQS recibe solo una referencia (pointer) al objeto en S3
3. **Consumidor**: Al leer el mensaje, el cliente descarga automáticamente el payload desde S3

```java
// Configurar cliente extendido
AmazonS3 s3 = AmazonS3ClientBuilder.defaultClient();
AmazonSQS sqsExtended = new AmazonSQSExtendedClient(
    AmazonSQSClientBuilder.defaultClient(),
    new ExtendedClientConfiguration()
        .withLargePayloadSupportEnabled(s3, "mi-bucket-payloads")
        .withAlwaysThroughS3(false)  // Solo usar S3 si excede límite
        .withPayloadSizeThreshold(256 * 1024)  // Umbral: 256 KB
);

// Enviar mensaje (transparente para el desarrollador)
sqsExtended.sendMessage(queueUrl, largeMessage);
```

### Diagrama de Flujo

```text
┌─────────────┐
│  Productor  │
└──────┬──────┘
       │ Mensaje > 1 MB
       ▼
┌─────────────────────┐
│ Extended Client     │
│ - Detecta tamaño    │
│ - Sube a S3         │
└──────┬──────────────┘
       │
       ├──────────────────┐
       │                  │
       ▼                  ▼
┌──────────┐      ┌──────────────┐
│   SQS    │      │      S3      │
│ (pointer)│      │  (payload)   │
└──────┬───┘      └──────────────┘
       │                  ▲
       │                  │
       ▼                  │
┌─────────────────────┐   │
│ Extended Client     │   │
│ - Lee pointer       │───┘
│ - Descarga de S3    │
└──────┬──────────────┘
       │
       ▼
┌─────────────┐
│  Consumidor │
└─────────────┘
```

### Límites y Consideraciones

| Aspecto                 | Límite                                    |
| ----------------------- | ----------------------------------------- |
| **SQS estándar**        | 1 MB por mensaje                          |
| **Con Extended Client** | Hasta 2 GB por mensaje                    |
| **S3 objeto máximo**    | 5 TB (pero Extended Client limita a 2 GB) |
| **Costo adicional**     | Almacenamiento S3 + operaciones GET/PUT   |

### Ejemplo CloudFormation: SQS + S3

```yaml
Parameters:
  pEnvironment:
    Type: String
    Default: dev

Resources:
  # Bucket S3 para payloads grandes
  rPayloadsBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub sqs-payloads-${pEnvironment}
      LifecycleConfiguration:
        Rules:
          - Id: DeleteOldPayloads
            Status: Enabled
            ExpirationInDays: 7 # Limpiar payloads después de 7 días

  # Cola SQS
  rOrdenesQueue:
    Type: AWS::SQS::Queue
    Properties:
      QueueName: !Sub ordenes-${pEnvironment}
      MessageRetentionPeriod: 345600 # 4 días
      VisibilityTimeout: 300 # 5 minutos

Outputs:
  oOrdenesQueueUrl:
    Description: URL de la cola de órdenes
    Value: !GetAtt rOrdenesQueue.QueueUrl

  oPayloadsBucketName:
    Description: Nombre del bucket para payloads grandes
    Value: !Ref rPayloadsBucket
```

### Alternativas para Mensajes Grandes

Si los mensajes son consistentemente grandes, considera:

1. **Amazon Kinesis Data Streams**: Hasta 1 MB por registro, mejor para streaming
2. **Amazon S3 + EventBridge**: Notificaciones de eventos en S3
3. **AWS Step Functions**: Orquestación con estado persistente
4. **Dividir mensajes**: Partir mensajes grandes en chunks más pequeños

---

## Patrón Saga - Transacciones Distribuidas

### ¿Qué es el Patrón Saga?

El **Patrón Saga** es una arquitectura de eventos que permite manejar **transacciones distribuidas** en sistemas de microservicios. Se basa en dividir una transacción larga en una secuencia de transacciones locales más pequeñas, cada una con su propia **acción compensatoria** (rollback) en caso de fallo.

### Problema: Transacciones ACID en Microservicios

En arquitecturas monolíticas, las transacciones ACID (Atomicidad, Consistencia, Aislamiento, Durabilidad) son manejadas por una única base de datos. En microservicios, cada servicio tiene su propia base de datos, lo que hace imposible usar transacciones ACID tradicionales.

**Ejemplo del problema:**

```text
Orden de Compra:
1. Servicio de Órdenes: Crear orden
2. Servicio de Inventario: Reservar productos
3. Servicio de Pagos: Procesar pago
4. Servicio de Envíos: Programar envío

¿Qué pasa si el pago falla después de reservar inventario?
```

### Solución: Saga Pattern

Una Saga divide la transacción en pasos locales, cada uno con una **transacción compensatoria** para deshacer cambios previos.

```text
┌─────────────────────────────────────────────────────────┐
│                    SAGA EXITOSA                         │
└─────────────────────────────────────────────────────────┘

Orden → Inventario → Pago → Envío
  ✓         ✓         ✓       ✓

┌─────────────────────────────────────────────────────────┐
│                    SAGA CON FALLO                       │
└─────────────────────────────────────────────────────────┘

Orden → Inventario → Pago → ❌ FALLO
  ✓         ✓         ✓

COMPENSACIÓN (Rollback):
  ↓         ↓         ↓
Cancelar  Liberar   Revertir
Orden     Inventario Pago
```

### Consideraciones Importantes

**Idempotencia:**

- Las acciones compensatorias deben ser **idempotentes** (ejecutarse múltiples veces sin efectos secundarios)

**Consistencia Eventual:**

- Las Sagas garantizan **consistencia eventual**, no inmediata
- Puede haber estados intermedios inconsistentes temporalmente

**Orden de Compensación:**

- Las compensaciones se ejecutan en **orden inverso** a las acciones originales

---

## AWS Secrets Manager

### ¿Qué es AWS Secrets Manager?

**AWS Secrets Manager** es un servicio gestionado que permite almacenar, recuperar y **rotar automáticamente** secretos como contraseñas, claves API, tokens y credenciales de bases de datos.

### Rotación Automática de Secretos

Una de las características más poderosas de Secrets Manager es la **rotación automática** mediante funciones Lambda.

### ¿Por qué Rotar Secretos?

- ✅ **Seguridad**: Reduce el riesgo de credenciales comprometidas
- ✅ **Cumplimiento**: Muchas regulaciones requieren rotación periódica
- ✅ **Mejores prácticas**: Limita la ventana de exposición en caso de fuga

### Cómo Funciona la Rotación

```text
┌──────────────────────────────────────────────────────────┐
│              FLUJO DE ROTACIÓN AUTOMÁTICA                │
└──────────────────────────────────────────────────────────┘

1. Secrets Manager programa rotación (ej: cada 30 días)
   │
   ▼
2. Invoca función Lambda de rotación
   │
   ▼
3. Lambda ejecuta 4 pasos:
   ├─ createSecret: Genera nueva credencial
   ├─ setSecret: Actualiza en el sistema destino
   ├─ testSecret: Verifica que funciona
   └─ finishSecret: Marca como actual
   │
   ▼
4. Aplicaciones usan automáticamente el nuevo secreto
```

### Ventajas de Secrets Manager

| Característica          | Beneficio                                   |
| ----------------------- | ------------------------------------------- |
| **Rotación automática** | Reduce riesgo de credenciales comprometidas |
| **Versionado**          | Rollback fácil a versiones anteriores       |
| **Auditoría**           | CloudTrail registra todos los accesos       |
| **Cifrado**             | KMS cifra secretos en reposo                |
| **Integración**         | Funciona con RDS, Redshift, DocumentDB      |

### Costos

- **$0.40** por secreto por mes
- **$0.05** por cada 10,000 llamadas a la API
- Rotación automática: **sin costo adicional** (solo Lambda)

### Alternativa: AWS Systems Manager Parameter Store

Para casos más simples sin rotación automática:

```yaml
Resources:
  rDatabasePassword:
    Type: AWS::SSM::Parameter
    Properties:
      Name: /prod/database/password
      Type: SecureString # Cifrado con KMS
      Value: !Ref pInitialPassword
```

**Diferencias:**

- Parameter Store: Más económico, sin rotación automática
- Secrets Manager: Rotación automática, mejor para credenciales críticas

---

## Recursos Adicionales

### Tabla Resumen

| Concepto                | Qué Aprendimos                              |
| ----------------------- | ------------------------------------------- |
| **CloudFormation**      | IaC con YAML/JSON, prefijos en Logical IDs  |
| **SQS Extended Client** | Mensajes > 1 MB usando S3                   |
| **Patrón Saga**         | Transacciones distribuidas con compensación |
| **Secrets Manager**     | Rotación automática de secretos con Lambda  |

### Enlaces Útiles

- [AWS CloudFormation Documentation](https://docs.aws.amazon.com/cloudformation/)
- [CloudFormation Best Practices](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/best-practices.html)
- [SQS Extended Client Library (Java)](https://github.com/awslabs/amazon-sqs-java-extended-client-lib)
- [SQS Extended Client Library (Python)](https://pypi.org/project/amazon-sqs-extended-client/)
- [AWS Secrets Manager Documentation](https://docs.aws.amazon.com/secretsmanager/)
- [Secrets Manager Rotation](https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotating-secrets.html)
- [Saga Pattern - Microservices.io](https://microservices.io/patterns/data/saga.html)
- [AWS Step Functions](https://docs.aws.amazon.com/step-functions/)
- [LocalStack Documentation](https://docs.localstack.cloud/)
