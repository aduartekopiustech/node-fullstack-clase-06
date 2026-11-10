<div align="center">

<a href="https://nodejs.org/en" target="_blank"><img src="https://user-images.githubusercontent.com/3438503/260495760-ca5d8c24-b382-43d9-8fbe-d905b4b208f0.png" width="260" alt="Logo de Node.js" /></a>

# Clase 6 de NodeJS

### Kopius · The Academy · Cohort 05 · M3

**API REST: Express, CORS, middlewares, Yup y CRUD JSON**

![Node.js](https://img.shields.io/badge/Node.js-26.x_LTS-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES_Modules-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)

</div>

---

## CONTENIDO

1. [Objetivos](#1-objetivos)
2. [¿Qué es una API?](#2-qué-es-una-api)
   - [Definición y contrato](#21-definición-y-contrato)
   - [API, Web API y API REST](#22-api-web-api-y-api-rest)
   - [El recorrido de una petición](#23-el-recorrido-de-una-petición)
   - [JSON como formato de intercambio](#24-json-como-formato-de-intercambio)
   - [Otros estilos de API](#25-otros-estilos-de-api)
3. [REST: fundamentos y convenciones](#3-rest-fundamentos-y-convenciones)
   - [Qué es REST](#31-qué-es-rest)
   - [Recursos y URIs](#32-recursos-y-uris)
   - [Métodos HTTP](#33-métodos-http)
   - [Códigos de estado](#34-códigos-de-estado)
   - [Convenciones de diseño](#35-convenciones-de-diseño)
   - [Formato de respuesta](#36-formato-de-respuesta)
4. [CRUD en memoria](#4-crud-en-memoria)
   - [Preparar el proyecto](#41-preparar-el-proyecto)
   - [app.js completo](#42-appjs-completo)
   - [Qué hace cada endpoint](#43-qué-hace-cada-endpoint)
   - [Probar con curl](#44-probar-con-curl)
   - [La contraseña](#45-la-contraseña)
5. [Middlewares](#5-middlewares)
   - [Fundamentos](#51-fundamentos)
   - [Uso y orden](#52-uso-y-orden)
   - [Implementaciones](#53-implementaciones)
   - [Convenciones](#54-convenciones)
6. [Validación con Yup](#6-validación-con-yup)
   - [Por qué validar](#61-por-qué-validar)
   - [Esquemas](#62-esquemas)
   - [El middleware validateBody](#63-el-middleware-validatebody)
   - [Crear no es lo mismo que actualizar](#64-crear-no-es-lo-mismo-que-actualizar)
   - [Errores de validación](#65-errores-de-validación)
7. [CORS y errores](#7-cors-y-errores)
   - [La same-origin policy](#71-la-same-origin-policy)
   - [Cómo funciona CORS](#72-cómo-funciona-cors)
   - [Configurar cors](#73-configurar-cors)
   - [Qué no hace CORS](#74-qué-no-hace-cors)
   - [Errores consistentes](#75-errores-consistentes)
8. [Express basado en clases](#8-express-basado-en-clases)
   - [Por qué una clase](#81-por-qué-una-clase)
   - [class Server](#82-class-server)
   - [Punto de entrada](#83-punto-de-entrada)
   - [Qué vive dentro de Server](#84-qué-vive-dentro-de-server)
9. [Tarea 012](#9-tarea-012)
   - [Objetivo](#91-objetivo)
   - [Estructura sugerida](#92-estructura-sugerida)
   - [Criterios de aceptación](#93-criterios-de-aceptación)
   - [Pruebas con curl](#94-pruebas-con-curl)
   - [Desafíos](#95-desafíos)
   - [Errores frecuentes](#96-errores-frecuentes)
10. [Referencias](#10-referencias)

---

> [!NOTE]
> La clase anterior respondió HTML. Ahora el servidor expone **recursos como JSON** para que cualquier cliente HTTP pueda consumirlos: un navegador con `fetch`, una app móvil, otro backend o `curl`. El foco deja de ser "dibujar una página" y pasa a ser **diseñar un contrato**.

---

## 1. Objetivos

- Entender qué es una API REST.
- Diseñar rutas REST coherentes para un recurso `users`.
- Implementar un CRUD completo en memoria con `GET`, `POST`, `PATCH` y `DELETE`.
- Entender qué es un middleware, cómo se encadena y cómo implementar los propios.
- Validar y normalizar la entrada con **Yup** sin mezclar validación con reglas de negocio.
- Configurar **CORS** correctamente y explicar qué protege y qué no.
- Devolver errores con un formato consistente y códigos HTTP con semántica correcta.
- Organizar la aplicación con una **clase `Server`** que concentra rutas, middlewares, CORS y `listen`.

**Requisitos:**

- Un cliente HTTP: `curl`, Postman o Insomnia.

> [!IMPORTANT]
> Usaremos **ES Modules**. El `package.json` debe contener `"type": "module"`. Todos los ejemplos asumen esa configuración.

```bash
npm install express@5 cors@2 yup@1
```

<sub>[⬆ Volver al índice](#contenido)</sub>

---

## 2. ¿Qué es una API?

### 2.1 Definición y contrato

Una **API** (_Application Programming Interface_) es un **contrato** que permite que dos programas se comuniquen sin conocer los detalles internos del otro.

Pensalo como el tablero de un auto: vos usás el volante, los pedales y la palanca. No necesitás saber cómo funciona la inyección de combustible para conducir. La API es ese tablero: una superficie estable y documentada sobre algo que puede cambiar por dentro.

En una **API web**, el contrato se expresa sobre HTTP:

| Parte del contrato | Pregunta que responde         | Ejemplo                               |
| ------------------ | ----------------------------- | ------------------------------------- |
| Recurso            | ¿Sobre qué actúo?             | `users`                               |
| Método             | ¿Qué quiero hacer?            | `GET`, `POST`, `PATCH`, `DELETE`      |
| Ruta               | ¿Dónde está el recurso?       | `/api/users/42`                       |
| Entrada            | ¿Qué datos envío?             | body JSON, query params, headers      |
| Salida             | ¿Qué recibo y en qué formato? | `200`, `404`, `{ "data": { ... } }`   |
| Errores            | ¿Cómo se informa un problema? | `{ "error": { "code": "...", ... } }` |

El contrato importa más que la implementación. Podés reescribir el servidor entero, cambiar el array por PostgreSQL y el cliente no debería notar la diferencia **si el contrato se respeta**.

> [!IMPORTANT]
> Una API no es "lo que devuelve el servidor". Es el **acuerdo** entre quien consume y quien provee. Si el acuerdo cambia sin avisar, rompés clientes.

### 2.2 API, Web API y API REST

Los términos se usan como sinónimos, pero no lo son:

| Término      | Alcance                                                                 |
| ------------ | ----------------------------------------------------------------------- |
| **API**      | Cualquier interfaz entre componentes de software (una librería también) |
| **Web API**  | API expuesta sobre HTTP                                                 |
| **API REST** | Web API que sigue el estilo arquitectónico REST                         |
| **API JSON** | Web API que usa JSON como formato, sin garantizar que sea REST          |

Una API puede devolver JSON y **no** ser REST. REST es un conjunto de restricciones arquitectónicas, no un formato.

```text
API           → contrato entre programas
Web API       → contrato sobre HTTP
API REST      → contrato HTTP + restricciones REST
API JSON      → contrato HTTP + JSON (puede o no ser REST)
```

### 2.3 El recorrido de una petición

```text
Cliente (fetch, curl, app móvil)              Servidor Express
        │                                            │
        │  POST /api/users HTTP/1.1                  │
        │  Content-Type: application/json            │
        │  Accept: application/json                  │
        │  { "name": "Ada", "email": "ada@..." }     │
        ├───────────────────────────────────────────>│
        │                                            │  cors
        │                                            │  express.json
        │                                            │  validateBody
        │                                            │  handler
        │  201 Created                               │
        │  Content-Type: application/json            │
        │  Location: /api/users/3                    │
        │  { "data": { "id": 3, ... } }              │
        │<───────────────────────────────────────────┤
```

Lo importante: **el cliente no ve tus funciones**. Ve método, ruta, headers, estado y body. Todo lo demás es tu problema.

### 2.4 JSON como formato de intercambio

JSON (_JavaScript Object Notation_) es un formato de texto. No es un objeto de JavaScript: es una **serialización**. Viaja como texto y se parsea del otro lado.

```json
{
  "data": {
    "id": 1,
    "name": "Ana",
    "email": "ana@example.com"
  }
}
```

| Regla de JSON                         | Ejemplo incorrecto                  |
| ------------------------------------- | ----------------------------------- |
| Las claves van entre comillas dobles  | `{ name: "Ana" }`                   |
| Los strings van entre comillas dobles | `{ "name": 'Ana' }`                 |
| No hay funciones ni `undefined`       | `{ "fn": () => {} }`                |
| No hay comentarios                    | `{ "id": 1 /* comentario */ }`      |
| Los números no llevan comillas        | `{ "id": "1" }` (string, no número) |

> [!WARNING]
> `JSON.parse` no perdona. Un body con comillas simples, una coma final o un comentario devuelve `400` del parser de `express.json()` antes de llegar a tu handler. Ese `400` es correcto: el cliente mandó algo que no es JSON.

### 2.5 Otros estilos de API

REST no es la única opción. Conocer las alternativas evita creer que "API" es sinónimo de "REST".

| Estilo        | Idea principal                                            | Cuándo se usa                                 |
| ------------- | --------------------------------------------------------- | --------------------------------------------- |
| **REST**      | Recursos + métodos HTTP + estado de representación        | CRUDs, APIs públicas, la mayoría de los casos |
| **GraphQL**   | Un único endpoint; el cliente pide exactamente los campos | Clientes con necesidades de datos variables   |
| **RPC**       | Llamadas a procedimientos (`/createUser`, `/getUserById`) | Acciones, no recursos; sistemas internos      |
| **gRPC**      | RPC binario sobre HTTP/2 con contratos Protobuf           | Microservicios de alto rendimiento            |
| **WebSocket** | Canal bidireccional persistente                           | Tiempo real: chats, tableros, notificaciones  |

Esta clase usa REST porque es el estándar de facto para CRUDs y porque obliga a pensar en recursos, métodos y estados. Ese vocabulario sirve para cualquier estilo.

<sub>[⬆ Volver al índice](#contenido)</sub>

---

## 3. REST: fundamentos y convenciones

### 3.1 Qué es REST

**REST** (_Representational State Transfer_) es un estilo arquitectónico descrito por Roy Fielding en su tesis doctoral (2000). No es un protocolo ni una librería: es un conjunto de **restricciones** que, si se respetan, producen un sistema con ciertas propiedades.

Las restricciones principales:

| Restricción           | Qué significa                                                            |
| --------------------- | ------------------------------------------------------------------------ |
| **Cliente-servidor**  | El cliente y el servidor evolucionan por separado                        |
| **Sin estado**        | Cada petición trae todo lo necesario; el servidor no recuerda al cliente |
| **Cacheable**         | Las respuestas deben poder cachearse cuando corresponda                  |
| **Interfaz uniforme** | Recursos identificables, mensajes autodescriptivos, hipermedia, métodos  |
| **Sistema en capas**  | Proxies, gateways y balanceadores son invisibles para el cliente         |
| **Código a demanda**  | (Opcional) El servidor puede enviar código ejecutable al cliente         |

> [!IMPORTANT]
> REST no significa "usar JSON". Implica una **interfaz uniforme**, recursos identificables y mensajes HTTP con semántica correcta. Podés tener una API REST que devuelva XML o HTML.

En la práctica, "API REST" en la industria suele significar: **recursos en URLs, métodos HTTP con su semántica y JSON como representación**. Esa es la definición operativa que usaremos.

### 3.2 Recursos y URIs

Un **recurso** es una entidad que querés exponer: un usuario, un pedido, una factura. La **URI** lo identifica.

```text
/api/users          → colección de usuarios
/api/users/42       → un usuario concreto
/api/users/42/orders → colección de pedidos de ese usuario
```

Reglas de oro:

1. **Sustantivos, no verbos.** La acción la expresa el método, no la URL.
   - ✅ `GET /api/users`
   - ❌ `GET /api/getUsers`
   - ❌ `POST /api/createUser`
2. **Plural para colecciones.** `users`, no `user`.
3. **Identificador en la ruta.** `/:id` identifica un elemento de la colección.
4. **Jerarquía cuando hay pertenencia real.** `/users/42/orders` tiene sentido si los pedidos pertenecen a un usuario.
5. **Sin extensiones ni mayúsculas.** `users`, no `Users` ni `users.json`.

| Recurso         | URI                          |
| --------------- | ---------------------------- |
| Listar usuarios | `GET /api/users`             |
| Un usuario      | `GET /api/users/42`          |
| Pedidos de 42   | `GET /api/users/42/orders`   |
| Un pedido       | `GET /api/users/42/orders/7` |

### 3.3 Métodos HTTP

El método expresa la **intención**. Cada uno tiene una semántica que el cliente, los proxies y los logs esperan.

| Método   | Uso en el recurso              | Seguro | Idempotente | Body de respuesta típico |
| -------- | ------------------------------ | ------ | ----------- | ------------------------ |
| `GET`    | Leer uno o varios              | Sí     | Sí          | Recurso(s)               |
| `HEAD`   | Igual que `GET`, sin body      | Sí     | Sí          | Ninguno                  |
| `POST`   | Crear un recurso               | No     | No          | Recurso creado           |
| `PUT`    | Reemplazar el recurso completo | No     | Sí          | Recurso reemplazado      |
| `PATCH`  | Modificar parcialmente         | No     | No siempre  | Recurso modificado       |
| `DELETE` | Eliminar el recurso            | No     | Sí          | Ninguno (`204`)          |

- **Seguro**: no modifica el estado del servidor.
- **Idempotente**: repetir la misma petición deja el sistema en el mismo estado final.

> [!NOTE]
> `POST` no es idempotente: dos `POST` iguales crean dos recursos distintos. `PUT` y `DELETE` sí lo son: repetirlos no multiplica el efecto. `PATCH` depende de cómo lo implementes.

### 3.4 Códigos de estado

El estado HTTP es parte del contrato. Un `200` con un body de error confunde a todos.

| Rango | Significado        | Ejemplos habituales                                       |
| ----- | ------------------ | --------------------------------------------------------- |
| `2xx` | Éxito              | `200 OK`, `201 Created`, `204 No Content`                 |
| `3xx` | Redirección        | `301`, `304 Not Modified`                                 |
| `4xx` | Error del cliente  | `400 Bad Request`, `404 Not Found`, `409 Conflict`, `422` |
| `5xx` | Error del servidor | `500 Internal Server Error`, `503 Service Unavailable`    |

Los que vas a usar en esta clase:

| Situación                        | Estado | Por qué                                           |
| -------------------------------- | ------ | ------------------------------------------------- |
| Listar o buscar con éxito        | `200`  | Hay un body con datos                             |
| Crear con éxito                  | `201`  | Se creó un recurso; conviene enviar `Location`    |
| Eliminar con éxito               | `204`  | No hay body que devolver                          |
| Body inválido o campos faltantes | `400`  | El cliente mandó datos que no cumplen el contrato |
| Recurso inexistente              | `404`  | La ruta o el ID no existen                        |
| Conflicto (email duplicado)      | `409`  | La petición choca con el estado actual            |
| Error inesperado del servidor    | `500`  | Falló algo que no es culpa del cliente            |

> [!WARNING]
> No uses `200` para todo. Un cliente (o un monitor) decide qué hacer según el estado. Si devolvés `200` cuando el recurso no existe, rompés la semántica y obligás al cliente a leer el body para saber qué pasó.

### 3.5 Convenciones de diseño

Además de sustantivos y métodos, hay convenciones que hacen una API predecible:

| Tema           | Convención                                     | Ejemplo                         |
| -------------- | ---------------------------------------------- | ------------------------------- |
| **Versionado** | Prefijo de versión en la ruta o en un header   | `/api/v1/users`                 |
| **Filtros**    | Query params, no rutas nuevas                  | `/api/users?name=ada`           |
| **Paginación** | `limit` y `offset` (o `page` y `pageSize`)     | `/api/users?limit=10&offset=20` |
| **Orden**      | Query param `sort`                             | `/api/users?sort=-createdAt`    |
| **Búsqueda**   | Query param `q`                                | `/api/users?q=ada`              |
| **Formato**    | JSON por defecto; negociación con `Accept`     | `Accept: application/json`      |
| **Fechas**     | ISO 8601 en UTC                                | `"2026-11-09T14:30:00.000Z"`    |
| **Nombres**    | `camelCase` en JSON                            | `firstName`, `createdAt`        |
| **IDs**        | Un tipo consistente: número o string, no ambos | `42` siempre, no `42` y `"42"`  |

> [!TIP]
> Una buena API se puede adivinar. Si conocés el recurso `users`, deberías poder intuir que `GET /api/users/42` trae uno y `DELETE /api/users/42` lo borra, sin leer la documentación.

### 3.6 Formato de respuesta

Elegí un **sobre** (_envelope_) y usalo siempre. Un sobre hace explícito qué es dato y qué es error.

**Éxito con un recurso:**

```json
{
  "data": {
    "id": 1,
    "name": "Ana",
    "email": "ana@example.com"
  }
}
```

**Éxito con una colección:**

```json
{
  "data": [
    { "id": 1, "name": "Ana", "email": "ana@example.com" },
    { "id": 2, "name": "Bruno", "email": "bruno@example.com" }
  ]
}
```

**Error:**

```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found"
  }
}
```

**Error de validación:**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": [
      "name must be at least 2 characters",
      "email must be a valid email"
    ]
  }
}
```

Ventajas del sobre:

- El cliente sabe siempre dónde buscar los datos (`data`) y los errores (`error`).
- Podés agregar metadatos sin romper: `meta: { total, page }`.
- `code` es estable y programable; `message` es para humanos.

> [!NOTE]
> No existe un único sobre correcto. Lo que sí existe es una regla: **elegí uno y sé consistente**. Cambiar de `{ data }` a `{ result }` a mitad de proyecto rompe clientes.

<sub>[⬆ Volver al índice](#contenido)</sub>

---

## 4. CRUD en memoria

Vamos a construir un ejemplo **completo y ejecutable** en un solo archivo `app.js`. La memoria se pierde al reiniciar: es intencional. Primero dominamos HTTP; la persistencia real llega con PostgreSQL y Sequelize en una clase posterior.

### 4.1 Preparar el proyecto

```bash
mkdir clase-06-api-rest
cd clase-06-api-rest
npm init -y
npm install express@5
```

Editá `package.json` para habilitar ES Modules:

```json
{
  "name": "clase-06-api-rest",
  "type": "module",
  "scripts": {
    "dev": "node --watch app.js",
    "start": "node app.js"
  },
  "dependencies": {
    "express": "^5.1.0"
  }
}
```

> [!IMPORTANT]
> `"type": "module"` habilita `import`/`export`. Sin eso, `import express from "express"` falla con `SyntaxError: Cannot use import statement outside a module`.

### 4.2 app.js completo

```javascript
// app.js
import express from "express";

const app = express();

// 1. Global middleware: parse JSON bodies into req.body
app.use(express.json());

// 2. In-memory data
let nextId = 3;
const users = [
  { id: 1, name: "Ana", email: "ana@example.com", password: "ana-secret-123" },
  {
    id: 2,
    name: "Bruno",
    email: "bruno@example.com",
    password: "bruno-secret-456",
  },
];

// 3. Never expose the password
const toPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
});

// 4. Helpers
const findUser = (id) => users.find((user) => user.id === Number(id));

const sendNotFound = (res) =>
  res.status(404).json({
    error: { code: "USER_NOT_FOUND", message: "User not found" },
  });

// 5. Routes
app.get("/api/users", (req, res) => {
  res.json({ data: users.map(toPublicUser) });
});

app.get("/api/users/:id", (req, res) => {
  const user = findUser(req.params.id);

  if (!user) return sendNotFound(res);

  res.json({ data: toPublicUser(user) });
});

app.post("/api/users", (req, res) => {
  const { name, email, password } = req.body ?? {};
  const user = { id: nextId++, name, email, password };

  users.push(user);

  res
    .status(201)
    .location(`/api/users/${user.id}`)
    .json({ data: toPublicUser(user) });
});

app.patch("/api/users/:id", (req, res) => {
  const user = findUser(req.params.id);

  if (!user) return sendNotFound(res);

  const { name, email, password } = req.body ?? {};

  // Assign only known fields: never Object.assign(user, req.body)
  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (password !== undefined) user.password = password;

  res.json({ data: toPublicUser(user) });
});

app.delete("/api/users/:id", (req, res) => {
  const index = users.findIndex((user) => user.id === Number(req.params.id));

  if (index === -1) return sendNotFound(res);

  users.splice(index, 1);

  res.status(204).send();
});

// 6. Route not found
app.use((req, res) => {
  res.status(404).json({
    error: { code: "ROUTE_NOT_FOUND", message: "Route not found" },
  });
});

// 7. Central error handler (must have 4 arguments)
app.use((error, req, res, next) => {
  console.error(error);

  res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Unexpected server error" },
  });
});

// 8. Start the server
app.listen(3000, () => {
  console.log("API escuchando en http://localhost:3000");
});
```

Ejecutalo:

```bash
node app.js
# o, para reiniciar al guardar:
npm run dev
```

> [!NOTE]
> En esta primera versión **no hay validación con Yup** todavía. El objetivo de esta sección es dominar el CRUD y los estados HTTP. En la sección 6 agregamos validación sin reescribir la estructura.

### 4.3 Qué hace cada endpoint

| Método y ruta           | Entrada                  | Salida                            | Estado        |
| ----------------------- | ------------------------ | --------------------------------- | ------------- |
| `GET /api/users`        | —                        | `{ data: [ ... ] }`               | `200`         |
| `GET /api/users/:id`    | `id` en la ruta          | `{ data: { ... } }` o `{ error }` | `200` / `404` |
| `POST /api/users`       | body JSON                | `{ data: { ... } }` + `Location`  | `201`         |
| `PATCH /api/users/:id`  | `id` + body JSON parcial | `{ data: { ... } }` o `{ error }` | `200` / `404` |
| `DELETE /api/users/:id` | `id` en la ruta          | sin body                          | `204` / `404` |

Detalles importantes del código:

- `express.json()` es obligatorio para que `req.body` tenga el JSON parseado.
- `req.params.id` es **string**. Por eso comparamos con `Number(...)`.
- `toPublicUser` evita filtrar `password`. Es una regla, no un detalle.
- `POST` devuelve `Location` con la URL del recurso creado.
- `DELETE` exitoso devuelve `204` y **no** envía body.
- El handler de 404 va **después** de las rutas y **antes** del de errores.
- El handler de errores tiene **cuatro argumentos**: así Express lo reconoce.

### 4.4 Probar con curl

```bash
# Listar
curl -i http://localhost:3000/api/users

# Buscar uno
curl -i http://localhost:3000/api/users/1

# Buscar uno inexistente
curl -i http://localhost:3000/api/users/999

# Crear
curl -i -X POST http://localhost:3000/api/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ada","email":"ada@example.com","password":"ada-secret-789"}'

# Actualizar parcialmente
curl -i -X PATCH http://localhost:3000/api/users/3 \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ada Lovelace"}'

# Eliminar
curl -i -X DELETE http://localhost:3000/api/users/3
```

Qué mirar en cada respuesta:

- La primera línea (`HTTP/1.1 200 OK`, `201 Created`, `204 No Content`, `404 Not Found`).
- El header `Content-Type: application/json; charset=utf-8`.
- El header `Location` en el `201`.
- Que el body **no** incluya `password`.

> [!TIP]
> `curl -i` muestra headers y body. `curl -s -o /dev/null -w "%{http_code}\n"` muestra solo el estado, ideal para scripts de prueba.

### 4.5 La contraseña

En este ejemplo guardamos `password` en texto plano **solo para enseñar el contrato**. En un sistema real:

1. **Nunca** devuelvas `password` en ninguna respuesta.
2. **Nunca** guardes la contraseña en texto plano: guardá un **hash** con `bcrypt` o `argon2`.
3. El hash se calcula al crear o cambiar la contraseña, no en cada request.
4. La contraseña no se "actualiza" con `PATCH` sin pasar por el mismo proceso de hashing.

```javascript
// Ejemplo conceptual, no parte de este CRUD
import bcrypt from "bcrypt";

const passwordHash = await bcrypt.hash(password, 12);
const isValid = await bcrypt.compare(candidate, user.passwordHash);
```

> [!WARNING]
> `Object.assign(user, req.body)` es una vulnerabilidad de **mass assignment**: el cliente podría enviar `{ "id": 1 }` o `{ "role": "admin" }` y sobrescribir campos que no debería. Asigná campo por campo, o validá con un esquema estricto (lo verás con Yup).

<sub>[⬆ Volver al índice](#contenido)</sub>

---

## 5. Middlewares

### 5.1 Fundamentos

Un **middleware** es una función que participa en el recorrido entre la petición y la respuesta. Recibe tres argumentos:

```javascript
const middleware = (req, res, next) => {
  // 1. observar
  // 2. transformar
  // 3. responder (corta la cadena)
  // 4. o llamar a next() para continuar
};
```

| Argumento | Qué es                                                       |
| --------- | ------------------------------------------------------------ |
| `req`     | La petición (`http.IncomingMessage` enriquecida por Express) |
| `res`     | La respuesta (`http.ServerResponse` enriquecida por Express) |
| `next`    | Función para pasar al siguiente middleware                   |

Un middleware puede:

- **Observar**: loggear método, ruta, duración.
- **Transformar**: parsear el body, normalizar headers, agregar `req.user`.
- **Rechazar**: responder `401`, `400`, `429` y **no** llamar a `next()`.
- **Delegar el error**: `next(error)` para que lo maneje el error handler.

> [!WARNING]
> Si un middleware no responde **ni** ejecuta `next()`, la petición queda esperando hasta que el cliente hace timeout. Es el error más común al escribir middlewares.

### 5.2 Uso y orden

El orden importa. Express ejecuta los middlewares en el orden en que se registran.

```text
request
  │
  ▼
cors            → agrega headers CORS (y responde preflight OPTIONS)
  │
  ▼
express.json    → parsea el body JSON en req.body
  │
  ▼
requestLogger   → observa método y ruta
  │
  ▼
validateBody    → valida y normaliza req.body
  │
  ▼
route handler   → lee/escribe datos y responde
  │
  ▼
response
```

Reglas de orden:

1. **CORS antes que todo** si el navegador va a consumir la API.
2. **Parsers antes de los handlers** que usan `req.body`.
3. **Logger temprano** para ver incluso los requests que fallan.
4. **Validación después del parser** y antes del handler.
5. **404 después de todas las rutas**.
6. **Error handler al final**, con cuatro argumentos.

```javascript
import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use(notFoundHandler);
app.use(errorHandler);
```

También podés aplicar un middleware a **una sola ruta**:

```javascript
app.post("/api/users", validateBody(createUserSchema), createUser);
//                       └── solo corre en este POST
```

O a un **router** completo:

```javascript
app.use("/api/users", requireAuth, usersRouter);
```

### 5.3 Implementaciones

**Logger de requests:**

```javascript
const requestLogger = (req, res, next) => {
  const startedAt = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startedAt;
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`,
    );
  });

  next();
};
```

`res.on("finish", ...)` corre cuando la respuesta terminó, así podés loggear el estado final y la duración.

**Request ID:**

```javascript
import { randomUUID } from "node:crypto";

const requestId = (req, res, next) => {
  req.id = req.get("X-Request-Id") ?? randomUUID();
  res.set("X-Request-Id", req.id);
  next();
};
```

Sirve para correlacionar logs entre servicios.

**Autenticación (esquema):**

```javascript
const requireAuth = (req, res, next) => {
  const token = req.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      error: { code: "UNAUTHORIZED", message: "Missing token" },
    });
  }

  // verify token...
  req.user = { id: 1, role: "admin" };
  next();
};
```

**Validación con Yup (lo veremos en la sección 6):**

```javascript
const validateBody = (schema) => async (req, res, next) => {
  try {
    req.body = await schema.validate(req.body ?? {}, {
      abortEarly: false,
      stripUnknown: false,
    });
    next();
  } catch (error) {
    // ...
  }
};
```

**404 y error handler:**

```javascript
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: { code: "ROUTE_NOT_FOUND", message: "Route not found" },
  });
};

const errorHandler = (error, req, res, next) => {
  const status = error.status ?? 500;

  if (status >= 500) console.error(error);

  res.status(status).json({
    error: {
      code: error.code ?? "INTERNAL_ERROR",
      message: status >= 500 ? "Unexpected server error" : error.message,
    },
  });
};
```

> [!NOTE]
> Express 5 detecta promesas rechazadas en handlers y middlewares `async` y las envía automáticamente al error handler. Aun así, `try/catch` con `next(error)` sigue siendo explícito y didáctico. En Express 4 tenías que envolver todo a mano.

### 5.4 Convenciones

| Convención                                               | Por qué                                                          |
| -------------------------------------------------------- | ---------------------------------------------------------------- |
| Llamar a `next()` o responder, nunca ambos               | Doble respuesta produce `ERR_HTTP_HEADERS_SENT`                  |
| Delegar errores con `next(error)`                        | Centraliza el formato y el logging                               |
| Un middleware, una responsabilidad                       | Facilita testear y reordenar                                     |
| No hacer trabajo pesado sincrónico                       | Bloquea el event loop y frena a todos los clientes               |
| Nombrar por lo que hace: `requestLogger`, `validateBody` | El nombre reemplaza al comentario                                |
| No usar `app.use` global para lo que es de una ruta      | Un middleware global corre en todo, incluso donde no corresponde |
| El error handler lleva **cuatro** argumentos             | Con tres, Express lo trata como middleware normal                |
| Devolver el resultado de `res.status(...).json(...)`     | Evita seguir ejecutando código después de responder              |

> [!WARNING]
> Un `return res.status(400).json(...)` corta la función, pero **no** la cadena de middlewares por sí solo: como no llamás a `next()`, la cadena se detiene ahí. Eso es lo que querés cuando respondés un error.

<sub>[⬆ Volver al índice](#contenido)</sub>

---

## 6. Validación con Yup

### 6.1 Por qué validar

El cliente puede enviar cualquier cosa: campos faltantes, tipos incorrectos, strings enormes, `null`, arrays, objetos anidados, `__proto__`. **Nunca confíes en la entrada.**

Validar en el servidor cumple tres funciones:

1. **Proteger el dominio**: no guardar datos que rompen invariantes.
2. **Normalizar**: `trim`, `lowercase`, convertir tipos.
3. **Informar**: devolver `400` con detalles útiles y estables.

> [!IMPORTANT]
> Validar en el frontend es UX; validar en el backend es **seguridad y consistencia**. El frontend se puede saltear con `curl`. El backend no.

### 6.2 Esquemas

Un **esquema** de Yup describe la forma y las reglas de un objeto. Se declara una vez y se reutiliza.

```javascript
import * as yup from "yup";

const createUserSchema = yup
  .object({
    name: yup.string().trim().min(2).required(),
    email: yup.string().trim().lowercase().email().required(),
    password: yup.string().trim().min(8).required(),
  })
  .noUnknown(true);
```

| Regla              | Efecto                                               |
| ------------------ | ---------------------------------------------------- |
| `yup.string()`     | El valor debe ser string                             |
| `.trim()`          | Elimina espacios al inicio y al final                |
| `.lowercase()`     | Convierte a minúsculas                               |
| `.min(2)`          | Longitud mínima                                      |
| `.email()`         | Valida formato de email                              |
| `.required()`      | El campo debe existir y no ser vacío                 |
| `.noUnknown(true)` | Rechaza claves que no estén declaradas en el esquema |

`noUnknown(true)` es tu defensa contra **mass assignment**: si el cliente manda `{ "id": 1, "role": "admin" }`, el esquema lo rechaza.

> [!NOTE]
> En Yup v1, `.noUnknown(true)` es la forma correcta de rechazar claves extra. No existe `.exact()`. Si ves ese método en un ejemplo viejo, probablemente sea de otra librería o de una versión distinta.

### 6.3 El middleware validateBody

El patrón es una **fábrica de middlewares**: recibe un esquema y devuelve un middleware.

```javascript
import * as yup from "yup";

const validateBody = (schema) => async (req, res, next) => {
  try {
    req.body = await schema.validate(req.body ?? {}, {
      abortEarly: false,
      stripUnknown: false,
    });

    next();
  } catch (error) {
    if (!(error instanceof yup.ValidationError)) {
      return next(error);
    }

    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request body",
        details: error.errors,
      },
    });
  }
};
```

Opciones de `validate`:

| Opción         | Valor   | Por qué                                            |
| -------------- | ------- | -------------------------------------------------- |
| `abortEarly`   | `false` | Devuelve **todos** los errores, no solo el primero |
| `stripUnknown` | `false` | No borra claves desconocidas en silencio           |

`req.body` se **reemplaza** por el valor validado y transformado. Eso es intencional: el handler recibe datos normalizados (`trim`, `lowercase`), no lo que mandó el cliente.

Uso en la ruta:

```javascript
app.post("/api/users", validateBody(createUserSchema), (req, res) => {
  const user = { id: nextId++, ...req.body };
  users.push(user);
  res
    .status(201)
    .location(`/api/users/${user.id}`)
    .json({ data: toPublicUser(user) });
});
```

> [!WARNING]
> `stripUnknown: false` + `noUnknown(true)` es la combinación estricta: el esquema rechaza claves extra. Si usás `stripUnknown: true` sin `noUnknown`, las claves extra se **descartan en silencio**, lo que puede ocultar errores del cliente. Elegí una política y documentala.

### 6.4 Crear no es lo mismo que actualizar

En `POST`, `name`, `email` y `password` son obligatorios. En `PATCH`, todos son opcionales, pero el body no debería estar vacío. **Son reglas distintas: no reutilices ciegamente el mismo esquema.**

```javascript
const updateUserSchema = yup
  .object({
    name: yup.string().trim().min(2),
    email: yup.string().trim().lowercase().email(),
    password: yup.string().trim().min(8),
  })
  .noUnknown(true)
  .test(
    "at-least-one",
    "At least one field is required",
    (value) => Object.keys(value ?? {}).length > 0,
  );
```

| Aspecto      | `POST` (crear)        | `PATCH` (actualizar)      |
| ------------ | --------------------- | ------------------------- |
| `name`       | Obligatorio           | Opcional                  |
| `email`      | Obligatorio, único    | Opcional, único si cambia |
| `password`   | Obligatorio, mínimo 8 | Opcional, mismo mínimo    |
| Body vacío   | Inválido              | Inválido                  |
| Claves extra | Rechazadas            | Rechazadas                |

Uso:

```javascript
app.patch("/api/users/:id", validateBody(updateUserSchema), (req, res) => {
  const user = findUser(req.params.id);
  if (!user) return sendNotFound(res);

  Object.assign(user, req.body); // safe: Yup rejected unknown keys
  res.json({ data: toPublicUser(user) });
});
```

> [!TIP]
> Si querés un `PUT` (reemplazo completo), el esquema es como el de `POST` pero con `password` opcional o con una regla propia. No lo agregues "porque sí": cada método que expongas es contrato que tenés que mantener.

### 6.5 Errores de validación

Un `400` con detalles permite al cliente corregir sin adivinar.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": [
      "name must be at least 2 characters",
      "email must be a valid email",
      "password is a required field"
    ]
  }
}
```

Buenas prácticas:

- `code` estable (`VALIDATION_ERROR`), no un texto que cambia.
- `message` corto y humano.
- `details` como array de strings, o como objeto `{ field: message }` si querés más estructura.
- No devuelvas el valor recibido si puede contener secretos (por ejemplo, `password`).
- No devuelvas stack traces en producción.

> [!NOTE]
> `error.errors` de Yup es un array de mensajes. Si necesitás el campo, usá `error.inner` y mapeá `{ path, message }`.

<sub>[⬆ Volver al índice](#contenido)</sub>

---

## 7. CORS y errores

### 7.1 La same-origin policy

Los navegadores aplican la **same-origin policy**: por defecto, el JavaScript de una página solo puede leer respuestas de su mismo **origen**.

Un origen es la combinación de **esquema + host + puerto**:

```text
http://localhost:5173   →  origen A
http://localhost:3000   →  origen B (distinto puerto)
https://api.example.com →  origen C
```

```text
Página en http://localhost:5173
        │
        │  fetch("http://localhost:3000/api/users")
        ▼
Navegador: "¿el servidor de :3000 autoriza a :5173?"
        │
        ├── sí  → entrega la respuesta al JS
        └── no  → bloquea la lectura y muestra un error CORS en consola
```

> [!IMPORTANT]
> La same-origin policy la aplica el **navegador**, no el servidor. `curl` y Postman no la aplican: pueden llamar a cualquier API. Por eso CORS no es autenticación ni autorización.

### 7.2 Cómo funciona CORS

**CORS** (_Cross-Origin Resource Sharing_) es un mecanismo por el cual el servidor **declara** qué orígenes pueden leer sus respuestas.

Para peticiones "simples" (`GET`, `POST` con `Content-Type` permitido), el navegador manda la petición y verifica los headers de la respuesta:

```http
Access-Control-Allow-Origin: http://localhost:5173
```

Para peticiones que lo requieren (por ejemplo, `PATCH`, `DELETE`, o `Content-Type: application/json` en algunos casos), el navegador primero manda un **preflight** `OPTIONS`:

```text
Navegador                                  Servidor
    │  OPTIONS /api/users/1                    │
    │  Origin: http://localhost:5173           │
    │  Access-Control-Request-Method: PATCH    │
    ├─────────────────────────────────────────>│
    │                                          │  cors middleware
    │  204 No Content                          │
    │  Access-Control-Allow-Origin: ...        │
    │  Access-Control-Allow-Methods: PATCH     │
    │  Access-Control-Allow-Headers: Content-Type
    │<─────────────────────────────────────────┤
    │                                          │
    │  PATCH /api/users/1                      │
    ├─────────────────────────────────────────>│
```

Si el preflight falla, el navegador **ni siquiera envía** la petición real.

### 7.3 Configurar cors

```javascript
import cors from "cors";

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400,
  }),
);
```

| Opción           | Efecto                                                         |
| ---------------- | -------------------------------------------------------------- |
| `origin`         | Origen(es) permitido(s). String, array o función               |
| `methods`        | Métodos permitidos en el preflight                             |
| `allowedHeaders` | Headers que el cliente puede enviar                            |
| `credentials`    | Permite cookies/credenciales (no compatible con `origin: "*"`) |
| `maxAge`         | Segundos que el navegador cachea el preflight                  |

Para varios orígenes, una **allowlist** explícita:

```javascript
const allowedOrigins = (
  process.env.CORS_ORIGINS ?? "http://localhost:5173"
).split(",");

const corsOptions = {
  origin(origin, callback) {
    // Allow tools without Origin header (curl, health checks)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);

    callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
```

> [!WARNING]
> `origin: "*"` con `credentials: true` **no funciona**: el navegador lo rechaza. Si necesitás credenciales, usá una allowlist explícita. Y si usás `"*"`, cualquier sitio puede leer tus respuestas públicas: no lo uses en APIs privadas.

### 7.4 Qué no hace CORS

| CORS **no**...                   | Porque...                                                |
| -------------------------------- | -------------------------------------------------------- |
| Autentica usuarios               | Es un mecanismo del navegador, no de identidad           |
| Autoriza acciones                | Un usuario autenticado puede seguir sin permiso          |
| Impide que `curl` llame a la API | `curl` no aplica same-origin policy                      |
| Protege datos en el servidor     | Solo controla qué **orígenes del navegador** pueden leer |
| Reemplaza HTTPS                  | Son capas distintas                                      |
| Reemplaza rate limiting          | Son controles distintos                                  |

> [!IMPORTANT]
> CORS es una **política de lectura del navegador**. La seguridad real se hace con autenticación, autorización, validación, rate limiting y HTTPS. No confundas "el navegador bloqueó la respuesta" con "el servidor está protegido".

### 7.5 Errores consistentes

Un error handler central evita que cada ruta invente su formato.

**Clase de error de aplicación:**

```javascript
export class AppError extends Error {
  constructor(
    message,
    { status = 500, code = "INTERNAL_ERROR", details } = {},
  ) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
```

**Uso en un handler:**

```javascript
import { AppError } from "./errors.js";

app.get("/api/users/:id", (req, res, next) => {
  const user = findUser(req.params.id);

  if (!user) {
    return next(
      new AppError("User not found", { status: 404, code: "USER_NOT_FOUND" }),
    );
  }

  res.json({ data: toPublicUser(user) });
});
```

**Error handler final:**

```javascript
app.use((error, req, res, next) => {
  const status = error.status ?? 500;
  const code = error.code ?? "INTERNAL_ERROR";

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json({
    error: {
      code,
      message: status >= 500 ? "Unexpected server error" : error.message,
      ...(error.details ? { details: error.details } : {}),
    },
  });
});
```

Reglas del error handler:

1. **Va al final**, después de las rutas y del 404.
2. Tiene **cuatro argumentos** (`error, req, res, next`).
3. Los `5xx` se loguean; los `4xx` no necesitan stack trace.
4. No filtra detalles internos al cliente en `5xx`.
5. Siempre responde con el mismo sobre `{ error: { code, message } }`.

**404 de ruta:**

```javascript
app.use((req, res) => {
  res.status(404).json({
    error: { code: "ROUTE_NOT_FOUND", message: "Route not found" },
  });
});
```

> [!NOTE]
> Diferencia importante: `USER_NOT_FOUND` es un recurso inexistente dentro de una ruta válida; `ROUTE_NOT_FOUND` es una ruta que no existe. Ambos son `404`, pero el `code` le dice al cliente qué pasó.

<sub>[⬆ Volver al índice](#contenido)</sub>

---

## 8. Express basado en clases

### 8.1 Por qué una clase

Hasta ahora todo vive en `app.js`. Funciona, pero cuando el proyecto crece aparecen problemas:

- El archivo mezcla configuración, rutas, datos y arranque.
- No podés crear dos instancias para tests.
- El estado (`users`, `nextId`) queda en variables globales.
- El orden de registro de middlewares es implícito y fácil de romper.

Una **clase `Server`** concentra la configuración en un solo lugar y expone una instancia con `start()` y `stop()`. Ganás:

| Antes (`app.js`)     | Después (`class Server`)                    |
| -------------------- | ------------------------------------------- |
| Estado global        | Estado de instancia (`#users`)              |
| Arranque al importar | Arranque explícito con `start()`            |
| Difícil de testear   | Podés crear una instancia sin abrir puerto  |
| Orden disperso       | Orden explícito en `#registerMiddlewares()` |
| Sin cierre ordenado  | `stop()` cierra el servidor HTTP            |

> [!IMPORTANT]
> La clase no reemplaza la arquitectura por capas de la próxima clase. Es el paso intermedio: **una sola pieza responsable de configurar Express**. Más adelante, las rutas se moverán a routers y controllers, y `Server` solo las ensamblará.

### 8.2 class Server

Este archivo concentra **rutas, middlewares, CORS y `listen`**. Eso es exactamente lo que pedimos: un único lugar donde se configura la aplicación.

```javascript
// src/Server.js
import express from "express";
import cors from "cors";
import * as yup from "yup";

// ---------- helpers ----------
const toPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
});

const requestLogger = (req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: { code: "ROUTE_NOT_FOUND", message: "Route not found" },
  });
};

const errorHandler = (error, req, res, next) => {
  const status = error.status ?? 500;

  if (status >= 500) console.error(error);

  res.status(status).json({
    error: {
      code: error.code ?? "INTERNAL_ERROR",
      message: status >= 500 ? "Unexpected server error" : error.message,
    },
  });
};

// ---------- validation ----------
const createUserSchema = yup
  .object({
    name: yup.string().trim().min(2).required(),
    email: yup.string().trim().lowercase().email().required(),
    password: yup.string().trim().min(8).required(),
  })
  .noUnknown(true);

const updateUserSchema = yup
  .object({
    name: yup.string().trim().min(2),
    email: yup.string().trim().lowercase().email(),
    password: yup.string().trim().min(8),
  })
  .noUnknown(true)
  .test(
    "at-least-one",
    "At least one field is required",
    (value) => Object.keys(value ?? {}).length > 0,
  );

const validateBody = (schema) => async (req, res, next) => {
  try {
    req.body = await schema.validate(req.body ?? {}, {
      abortEarly: false,
      stripUnknown: false,
    });
    next();
  } catch (error) {
    if (!(error instanceof yup.ValidationError)) return next(error);

    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request body",
        details: error.errors,
      },
    });
  }
};

// ---------- Server ----------
export class Server {
  #app;
  #port;
  #httpServer;
  #users = [
    {
      id: 1,
      name: "Ana",
      email: "ana@example.com",
      password: "ana-secret-123",
    },
    {
      id: 2,
      name: "Bruno",
      email: "bruno@example.com",
      password: "bruno-secret-456",
    },
  ];
  #nextId = 3;

  constructor({ port = 3000 } = {}) {
    this.#port = port;
    this.#app = express();

    this.#registerMiddlewares();
    this.#registerRoutes();
    this.#registerErrorHandlers();
  }

  get app() {
    return this.#app;
  }

  // 1. Middlewares: CORS, body parser y logger
  #registerMiddlewares() {
    this.#app.use(
      cors({
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
      }),
    );

    this.#app.use(express.json());
    this.#app.use(requestLogger);
  }

  // 2. Helpers de dominio
  #findUser(id) {
    return this.#users.find((user) => user.id === Number(id)) ?? null;
  }

  #sendNotFound(res) {
    res.status(404).json({
      error: { code: "USER_NOT_FOUND", message: "User not found" },
    });
  }

  // 3. Routes
  #registerRoutes() {
    this.#app.get("/api/health", (req, res) => {
      res.json({ status: "ok" });
    });

    this.#app.get("/api/users", (req, res) => {
      res.json({ data: this.#users.map(toPublicUser) });
    });

    this.#app.get("/api/users/:id", (req, res) => {
      const user = this.#findUser(req.params.id);

      if (!user) return this.#sendNotFound(res);

      res.json({ data: toPublicUser(user) });
    });

    this.#app.post("/api/users", validateBody(createUserSchema), (req, res) => {
      const user = { id: this.#nextId++, ...req.body };

      this.#users.push(user);

      res
        .status(201)
        .location(`/api/users/${user.id}`)
        .json({ data: toPublicUser(user) });
    });

    this.#app.patch(
      "/api/users/:id",
      validateBody(updateUserSchema),
      (req, res) => {
        const user = this.#findUser(req.params.id);

        if (!user) return this.#sendNotFound(res);

        Object.assign(user, req.body);
        res.json({ data: toPublicUser(user) });
      },
    );

    this.#app.delete("/api/users/:id", (req, res) => {
      const index = this.#users.findIndex(
        (user) => user.id === Number(req.params.id),
      );

      if (index === -1) return this.#sendNotFound(res);

      this.#users.splice(index, 1);
      res.status(204).send();
    });
  }

  // 4. Error handlers: 404 y error central
  #registerErrorHandlers() {
    this.#app.use(notFoundHandler);
    this.#app.use(errorHandler);
  }

  // 5. Listen
  start() {
    this.#httpServer = this.#app.listen(this.#port, () => {
      console.log(`API escuchando en http://localhost:${this.#port}`);
    });

    return this;
  }

  // 6. Graceful shutdown
  async stop() {
    if (!this.#httpServer) return;

    await new Promise((resolve, reject) => {
      this.#httpServer.close((error) => (error ? reject(error) : resolve()));
    });

    this.#httpServer = undefined;
  }
}
```

Puntos clave de la implementación:

- Los campos privados (`#app`, `#users`, `#nextId`) encapsulan el estado. Nadie fuera de la clase los toca.
- El constructor **solo orquesta**: registra middlewares, rutas y errores en orden.
- `#registerRoutes()` es el único lugar donde se declaran rutas.
- `#registerMiddlewares()` es el único lugar donde se configura CORS y el parser.
- `start()` es el único lugar donde se llama a `listen`.
- `stop()` permite cerrar el servidor en tests o al recibir una señal.
- `get app()` expone la app de Express para tests con `supertest`, sin abrir puerto.

> [!WARNING]
> `#registerErrorHandlers()` debe ejecutarse **después** de `#registerRoutes()`. Si registrás el 404 antes de las rutas, todas las peticiones caen en el 404. El orden dentro del constructor no es decorativo.

### 8.3 Punto de entrada

El arranque queda en un archivo mínimo. La clase no se auto-ejecuta: eso permite importarla en tests.

```javascript
// src/main.js
import { Server } from "./Server.js";

const server = new Server({ port: Number(process.env.PORT ?? 3000) });

server.start();

const shutdown = async (signal) => {
  console.log(`\n${signal} recibido, cerrando servidor...`);
  await server.stop();
  process.exit(0);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
```

```json
{
  "name": "clase-06-api-rest",
  "type": "module",
  "scripts": {
    "dev": "node --watch src/main.js",
    "start": "node src/main.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^5.1.0",
    "yup": "^1.6.1"
  }
}
```

Estructura:

```text
clase-06-api-rest/
├── src/
│   ├── Server.js
│   └── main.js
├── package.json
└── README.md
```

> [!TIP]
> Separar `Server.js` de `main.js` tiene una ventaja concreta: en un test podés hacer `const server = new Server({ port: 0 })` y probar la app sin chocar con el puerto 3000. `port: 0` le pide al sistema un puerto libre.

### 8.4 Qué vive dentro de Server

| Responsabilidad        | Dónde                                  |
| ---------------------- | -------------------------------------- |
| Crear la app Express   | `constructor`                          |
| Configurar CORS        | `#registerMiddlewares()`               |
| Parsear JSON           | `#registerMiddlewares()`               |
| Registrar logger       | `#registerMiddlewares()`               |
| Declarar rutas         | `#registerRoutes()`                    |
| Declarar validaciones  | Esquemas + `validateBody` en el módulo |
| Declarar 404 y errores | `#registerErrorHandlers()`             |
| Escuchar el puerto     | `start()`                              |
| Cerrar el servidor     | `stop()`                               |
| Estado en memoria      | Campos privados `#users`, `#nextId`    |

Lo que **no** debería vivir dentro de `Server` a medida que el proyecto crezca:

- Reglas de negocio complejas.
- Acceso a base de datos.
- Controllers con lógica de dominio.
- DTOs y modelos.

Eso se separa en la próxima clase con **Model, DTO, Repository, Service, Controller y Router**. `Server` quedará como el **Composition Root**: el lugar que ensambla las piezas.

<sub>[⬆ Volver al índice](#contenido)</sub>

---

## 9. Tarea 012

### 9.1 Objetivo

Construir una **API REST de usuarios** con Express que implemente todo lo aprendido:

- CRUD en memoria con `id`, `name`, `email` y `password`.
- Validación con Yup, con esquemas distintos para crear y actualizar.
- CORS restringido a `http://localhost:5173`.
- Errores con formato consistente.
- Configuración basada en la clase `Server` con rutas, middlewares, CORS y `listen`.

> [!IMPORTANT]
> La API debe poder ejecutarse con `npm run dev` y responder en `http://localhost:3000`. Si no arranca sin pasos manuales, la tarea no está terminada.

### 9.2 Estructura sugerida

```text
tarea-012/
├── src/
│   ├── Server.js
│   └── main.js
├── package.json
└── README.md
```

Podés agregar `src/schemas.js` y `src/errors.js` si querés separar responsabilidades, pero no es obligatorio. Lo que **sí** es obligatorio es que la configuración de Express viva en `Server.js`.

### 9.3 Criterios de aceptación

- [ ] `npm install` instala `express`, `cors` y `yup`.
- [ ] `npm run dev` inicia el servidor en el puerto `3000`.
- [ ] `GET /api/users` responde `200` con `{ data: [...] }`.
- [ ] `GET /api/users/:id` responde `200` si existe y `404` con `code: "USER_NOT_FOUND"` si no.
- [ ] `POST /api/users` responde `201`, incluye header `Location` y devuelve el recurso creado.
- [ ] `POST` sin `name`, con email inválido o con password corta responde `400` con `details`.
- [ ] `PATCH /api/users/:id` responde `200` y actualiza solo los campos enviados.
- [ ] `PATCH` con body vacío responde `400`.
- [ ] `PATCH` o `DELETE` con ID inexistente responden `404`.
- [ ] `DELETE /api/users/:id` responde `204` sin body.
- [ ] Ninguna respuesta incluye `password`.
- [ ] Las claves desconocidas en el body son rechazadas (`400`).
- [ ] CORS permite solamente `http://localhost:5173`.
- [ ] Un origen no permitido recibe una respuesta sin los headers CORS correspondientes.
- [ ] Los errores inesperados responden `500` con `{ error: { code, message } }`.
- [ ] La configuración de rutas, middlewares, CORS y `listen` está en `Server.js`.
- [ ] El estado en memoria se reinicia al reiniciar el proceso y eso está documentado en el README.
- [ ] El README explica cómo levantar la API y cómo probarla con `curl`.

> [!NOTE]
> "Ninguna respuesta incluye `password`" incluye `GET`, `POST`, `PATCH` y los errores. Si un error de validación devuelve el body recibido, podría filtrar la contraseña. Revisalo.

### 9.4 Pruebas con curl

```bash
# Health
curl -i http://localhost:3000/api/health

# Listar
curl -i http://localhost:3000/api/users

# Crear válido
curl -i -X POST http://localhost:3000/api/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ada","email":"ada@example.com","password":"ada-secret-789"}'

# Crear inválido (sin name, email mal, password corta)
curl -i -X POST http://localhost:3000/api/users \
  -H 'Content-Type: application/json' \
  -d '{"email":"no-es-email","password":"123"}'

# Crear con clave desconocida
curl -i -X POST http://localhost:3000/api/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ada","email":"ada@example.com","password":"ada-secret-789","role":"admin"}'

# Buscar inexistente
curl -i http://localhost:3000/api/users/999

# PATCH válido
curl -i -X PATCH http://localhost:3000/api/users/3 \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ada Lovelace"}'

# PATCH con body vacío
curl -i -X PATCH http://localhost:3000/api/users/3 \
  -H 'Content-Type: application/json' \
  -d '{}'

# DELETE
curl -i -X DELETE http://localhost:3000/api/users/3

# DELETE inexistente
curl -i -X DELETE http://localhost:3000/api/users/999

# Ruta inexistente
curl -i http://localhost:3000/api/nope

# CORS: origen permitido
curl -i -X OPTIONS http://localhost:3000/api/users \
  -H 'Origin: http://localhost:5173' \
  -H 'Access-Control-Request-Method: POST'

# CORS: origen no permitido
curl -i -X OPTIONS http://localhost:3000/api/users \
  -H 'Origin: http://evil.example.com' \
  -H 'Access-Control-Request-Method: POST'
```

> [!TIP]
> Guardá estas pruebas en un archivo `api.http` y usalo con la extensión **REST Client** de VS Code. Te queda una colección viva que podés correr con un click.

### 9.5 Desafíos

1. **Filtro por nombre.** Aceptar `GET /api/users?name=ada` sin modificar el array original (`filter`, no `sort` ni `splice`).
2. **Email único.** Responder `409 Conflict` con `code: "EMAIL_TAKEN"` si el email ya existe.
3. **Paginación.** Aceptar `?limit=` y `?offset=` y devolver `meta: { total, limit, offset }`.
4. **Búsqueda.** Aceptar `?q=` y buscar en `name` y `email`.
5. **Orden.** Aceptar `?sort=name` y `?sort=-name`.
6. **Validación de ID.** Responder `400` si `:id` no es un entero positivo, en lugar de comparar `Number("abc")`.
7. **`PUT` completo.** Implementar reemplazo total con su propio esquema.
8. **Hashing.** Reemplazar `password` por `passwordHash` usando `bcrypt` y nunca devolverlo.
9. **Rate limiting.** Agregar `express-rate-limit` en `POST` y `PATCH`.
10. **Tests.** Probar la app con `supertest` usando `new Server({ port: 0 })` y `server.stop()`.

### 9.6 Errores frecuentes

| Síntoma                                        | Causa probable                                                        | Solución                                                      |
| ---------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------- |
| `req.body` es `undefined`                      | Falta `express.json()` o el `Content-Type` no es JSON                 | Registrar el parser y enviar `Content-Type: application/json` |
| `req.body` es `{}` aunque enviaste datos       | El body no es JSON válido o falta el header                           | Revisar comillas, comas finales y header                      |
| `Cannot use import statement outside a module` | Falta `"type": "module"` en `package.json`                            | Agregarlo y reiniciar                                         |
| `EADDRINUSE: address already in use :::3000`   | Otro proceso usa el puerto                                            | Matar el proceso o usar otro puerto                           |
| El error handler no se ejecuta                 | Tiene tres argumentos, no cuatro                                      | Declarar `(error, req, res, next)`                            |
| Todas las rutas responden `404`                | El 404 se registró antes que las rutas                                | Mover el 404 al final                                         |
| `ERR_HTTP_HEADERS_SENT`                        | Un handler responde dos veces o llama a `next()` después de responder | Usar `return` al responder y no llamar a `next()`             |
| CORS falla solo en el navegador                | Origen no incluido en la allowlist o `credentials` con `"*"`          | Revisar `origin` y `credentials`                              |
| El navegador manda `OPTIONS` y recibe `404`    | No hay middleware CORS o está después de las rutas                    | Registrar `cors()` antes de las rutas                         |
| `PATCH` sobrescribe `id` o `role`              | `Object.assign` sin validación estricta                               | Usar Yup con `noUnknown(true)` y asignar campos conocidos     |
| La contraseña aparece en la respuesta          | Se devuelve el objeto completo                                        | Usar `toPublicUser` o un DTO de salida                        |
| Los datos desaparecen al reiniciar             | Es memoria, no persistencia                                           | Documentarlo; la persistencia llega con PostgreSQL            |
| `req.params.id` nunca coincide                 | Se compara string con número                                          | Convertir con `Number(...)` o validar el ID                   |
| El servidor no cierra en tests                 | Falta `server.stop()` o el puerto queda abierto                       | Cerrar en `afterAll` con `await server.stop()`                |

<sub>[⬆ Volver al índice](#contenido)</sub>

---

## 10. Referencias

- 📘 [HTTP Semantics — RFC 9110](https://www.rfc-editor.org/rfc/rfc9110)
- 📘 [MDN — HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- 📘 [MDN — HTTP request methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)
- 📘 [Express — documentación oficial](https://expressjs.com/)
- 📘 [Express — routing](https://expressjs.com/en/guide/routing.html)
- 📘 [Express — using middleware](https://expressjs.com/en/guide/using-middleware.html)
- 📘 [Express — error handling](https://expressjs.com/en/guide/error-handling.html)
- 📘 [Express — migración a v5](https://expressjs.com/en/guide/migrating-5.html)
- 📘 [`express` — npm](https://www.npmjs.com/package/express)
- 📘 [`cors` — npm](https://www.npmjs.com/package/cors)
- 📘 [`yup` — npm](https://www.npmjs.com/package/yup)
- 📘 [MDN — CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- 📘 [MDN — Same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)
- 📘 [Roy Fielding — Architectural Styles and the Design of Network-based Software Architectures](https://www.ics.uci.edu/~fielding/pubs/dissertation/top.htm)
- 📘 [JSON — especificación](https://www.json.org/json-en.html)

## Mentor

**Ariel Duarte** · Kopius · The Academy

<sub>[⬆ Volver al índice](#contenido)</sub>
