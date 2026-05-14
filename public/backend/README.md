# 🚗 Flexi Drive — Backend API

REST API per a la plataforma P2P de lloguer de cotxes.

## Stack

- **Node.js** + **Express** — servidor i routing
- **JWT** (jsonwebtoken) — autenticació stateless
- **bcryptjs** — hash de contrasenyes
- **morgan** — logging de peticions HTTP
- **express-rate-limit** — protecció contra abús

> **Base de dades**: En memòria (arrays JS) per facilitar el desenvolupament. En producció, substituir per MongoDB o PostgreSQL.

---

## Instal·lació

```bash
cd backend
cp .env.example .env
npm install
npm run dev     # amb nodemon (hot reload)
# o
npm start       # producció
```

El servidor arranca a: `http://localhost:3001`

---

## Variables d'entorn (`.env`)

| Variable         | Valor per defecte                    | Descripció                        |
|------------------|--------------------------------------|-----------------------------------|
| `PORT`           | `3001`                               | Port del servidor                 |
| `JWT_SECRET`     | `flexi_dev_secret`                   | Clau secreta JWT (canviar!)       |
| `JWT_EXPIRES_IN` | `7d`                                 | Durada del token                  |
| `NODE_ENV`       | `development`                        | Entorn                            |
| `CORS_ORIGIN`    | `http://localhost:3000`              | Origen permès pel frontend        |

---

## Endpoints

### Auth

| Mètode | Ruta              | Protegit | Descripció                    |
|--------|-------------------|----------|-------------------------------|
| POST   | `/api/auth/register` | ❌      | Registre nou usuari           |
| POST   | `/api/auth/login`    | ❌      | Login → retorna JWT           |
| GET    | `/api/auth/me`       | ✅      | Perfil de l'usuari autenticat |

**Exemple login:**
```json
POST /api/auth/login
{
  "email": "joan@example.com",
  "password": "password123"
}
```

### Cotxes

| Mètode | Ruta                     | Protegit | Descripció                          |
|--------|--------------------------|----------|-------------------------------------|
| GET    | `/api/cars`              | ❌       | Llistat amb filtres i paginació     |
| GET    | `/api/cars/:id`          | ❌       | Detall d'un cotxe                   |
| POST   | `/api/cars`              | ✅       | Crear cotxe (propietari)            |
| PUT    | `/api/cars/:id`          | ✅       | Editar cotxe (només propietari)     |
| DELETE | `/api/cars/:id`          | ✅       | Eliminar cotxe (només propietari)   |
| GET    | `/api/cars/owner/:userId`| ❌       | Cotxes d'un propietari              |

**Query params de `/api/cars`:**
- `q` — cerca per nom, marca, model o ubicació
- `fuel` — `Gasolina | Diésel | Eléctrico | Híbrido`
- `transmission` — `Manual | Automático`
- `maxPrice` — preu màxim per hora
- `minPrice` — preu mínim per hora
- `seats` — places mínimes
- `available` — `true` per mostrar només disponibles
- `sortBy` — `price_asc | price_desc | rating | newest`
- `page` / `limit` — paginació

### Reserves

| Mètode | Ruta                          | Protegit | Descripció                    |
|--------|-------------------------------|----------|-------------------------------|
| GET    | `/api/reservations`           | ✅       | Les meves reserves            |
| GET    | `/api/reservations/:id`       | ✅       | Detall d'una reserva          |
| POST   | `/api/reservations`           | ✅       | Crear reserva                 |
| PATCH  | `/api/reservations/:id/cancel`| ✅       | Cancel·lar reserva            |
| GET    | `/api/reservations/car/:carId`| ✅       | Reserves d'un cotxe (propietari) |

**Exemple crear reserva:**
```json
POST /api/reservations
Authorization: Bearer <token>
{
  "carId": "c1",
  "startTime": "2026-05-10T10:00:00Z",
  "hours": 3
}
```

### Valoracions

| Mètode | Ruta                         | Protegit | Descripció                |
|--------|------------------------------|----------|---------------------------|
| GET    | `/api/cars/:carId/reviews`   | ❌       | Valoracions d'un cotxe    |
| POST   | `/api/cars/:carId/reviews`   | ✅       | Crear valoració           |

### Usuaris

| Mètode | Ruta                  | Protegit | Descripció                   |
|--------|-----------------------|----------|------------------------------|
| GET    | `/api/users/:id`      | ❌       | Perfil públic                |
| PUT    | `/api/users/me`       | ✅       | Actualitzar perfil propi     |
| GET    | `/api/users/me/stats` | ✅       | Estadístiques pròpies        |

### Health

```
GET /api/health → { status: "ok", service: "flexi-drive-api", ts: "..." }
```

---

## Autenticació

Les rutes protegides necessiten el header:
```
Authorization: Bearer <jwt_token>
```

---

## Usuaris de prova (ja carregats a memòria)

| Email                  | Contrasenya   | Nom         |
|------------------------|---------------|-------------|
| joan@example.com       | password123   | Joan Duran  |
| marc@example.com       | password123   | Marc Roca   |
| laura@example.com      | password123   | Laura Puig  |

---

## Pròxims passos (roadmap backend)

- [ ] Connectar MongoDB (Mongoose) o PostgreSQL (Prisma)
- [ ] Upload de fotos (Multer + S3)
- [ ] Sistema de pagaments (Stripe)
- [ ] Websockets per missatgeria en temps real
- [ ] Emails transaccionals (nodemailer / Resend)
- [ ] Tests automatitzats (Jest + Supertest)
- [ ] Docker + Docker Compose
- [ ] Deploy a Railway / Render / AWS
