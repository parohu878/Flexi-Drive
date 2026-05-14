# 🚗 Flexi Drive

Plataforma P2P de alquiler de coches entre particulares.

## Instalación

```bash
npm install
npm start
```

La app arranca en [http://localhost:3000](http://localhost:3000)

## Estructura

```
src/
├── App.jsx              # Componente raíz + datos + navegación
├── index.js             # Entry point
├── index.css            # Estilos globales + variables CSS
└── components/
    ├── Navbar.jsx/css
    ├── Footer.jsx/css
    ├── HomeScreen.jsx/css
    ├── SearchScreen.jsx/css
    ├── CarDetail.jsx/css
    ├── CarMiniature.jsx
    ├── PublishScreen.jsx/css
    └── ProfileScreen.jsx/css
```

## Pantallas

- **Home** — Hero, buscador rápido, coches destacados, cómo funciona, CTA publicar
- **Search** — Mapa + filtros laterales + listado de coches
- **CarDetail** — Detalle del coche + panel de reserva
- **Publish** — Formulario multi-paso para publicar un coche
- **Profile** — Reservas del usuario y coches publicados
