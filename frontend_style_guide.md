# Guía de Estilos de FlexiDrive

Esta guía documenta el sistema de diseño y los estilos utilizados en el frontend del proyecto FlexiDrive. El diseño se caracteriza por tener una estética oscura moderna ("Dark Mode" nativo) con toques de neón cyberpunk, utilizando degradados morados y púrpuras para resaltar elementos interactivos.

## 1. Tipografía

El proyecto utiliza dos fuentes principales de Google Fonts, combinando un estilo técnico/futurista para títulos con una tipografía limpia para lectura:

- **Secundaria / Títulos (`Orbitron`):**
  - **Pesos:** 700 (Bold), 900 (Black)
  - **Uso:** Empleada para números, títulos grandes (H1, H2), logotipos, precios y elementos que requieren un fuerte impacto visual futurista.

- **Primaria / Cuerpo (`Rajdhani`):**
  - **Pesos:** 300, 400, 500, 600, 700
  - **Uso:** Utilizada como la fuente predeterminada para el cuerpo del texto, descripciones, etiquetas, formularios y botones.

---

## 2. Paleta de Colores

Las variables de color están centralizadas en el archivo `index.css` bajo la pseudoclase `:root`.

### Colores de Marca y Acento (Neón)
- **Púrpura Principal (`--p`):** `#9b4dca` - Usado para fondos interactivos y detalles.
- **Púrpura Claro (`--pg`):** `#c47dff` - Usado para textos destacados, estados activos y hover.
- **Rosa / Neón (`--pk`):** `#e040fb` - Usado como acento brillante y para completar degradados.

### Fondos (Dark Theme)
- **Fondo Base (`--bg`):** `#05050a` - El color más oscuro, usado en el fondo de la página (`body`, `html`).
- **Fondo Secundario (`--bg2`):** `#0d0b14` - Usado para secciones contrastantes o barras laterales.
- **Fondo Terciario / Tarjetas (`--bg3`):** `#13101e` - Usado en tarjetas de contenido, modales y paneles superpuestos.

### Textos
- **Texto Principal (`--t`):** `#e8e8f2` - Un blanco ligeramente azulado para lectura cómoda en fondos oscuros.
- **Texto Atenuado (`--td`):** `rgba(232, 232, 242, 0.5)` - Usado para descripciones secundarias, subtítulos y metadatos.
- **Texto Muteado (`--tm`):** `rgba(232, 232, 242, 0.25)` - Usado para placeholders de inputs y leyendas menores.

### Bordes y Separadores
- **Borde Base (`--cb`):** `rgba(255, 255, 255, 0.07)` - Divisores sutiles y bordes de tarjetas inactivas.
- **Borde Activo/Acento (`--cb2`):** `rgba(155, 77, 202, 0.35)` - Usado cuando se hace hover sobre un elemento interactivo.

### Colores Semánticos y de Estado
- **Éxito / Disponible:** Texto Verde (`#5dcaa5`), Fondo Verde (`rgba(29, 158, 117, 0.25)`), Borde (`rgba(29,158,117,.4)`)
- **Error / Peligro:** Texto Rojo (`#ff6b6b`), Fondo Rojo (`rgba(255, 50, 50, 0.1)`)
- **Valoración / Estrellas:** Amarillo Dorado (`#f5c518`)
- **Advertencias / Trust:** Naranja (`rgba(255, 140, 66, 0.8)`)

---

## 3. Sombras, Degradados y Efectos

### Degradado Principal (Brand Gradient)
El degradado distintivo de la marca se define como:
`linear-gradient(135deg, #9b4dca, #e040fb)`
Se utiliza extensamente en:
- Botones primarios (`.btn-primary`)
- Avatares de usuario
- Marcadores (pines) del mapa
- Iconos del logotipo

### Resplandores y Neón (Glow Effects)
Para lograr la estética profunda, se utilizan fondos radiales que simulan luces de neón:
- **Ejemplo en el Hero:** `radial-gradient(ellipse 55% 60% at 20% 60%, rgba(155,77,202,.35) 0%, transparent 60%)`
- **Sombras de caída (Box Shadows):** Sombras tintadas en morado como `box-shadow: 0 4px 20px rgba(155,77,202,.45)` para elementos flotantes o interactivos.

---

## 4. Componentes de UI

### Botones (Buttons)
1. **Botón Primario (`.btn-primary`):** 
   - **Fondo:** Brand Gradient.
   - **Tipografía:** Orbitron o Rajdhani Bold, en mayúsculas, color blanco.
   - **Estados:** Al hacer hover, se elevan ligeramente (`translateY(-1px) o (-2px)`) y la sombra morada se intensifica.
2. **Botón Fantasma (`.btn-ghost`):**
   - **Fondo:** Transparente con ligero tinte púrpura (`rgba(155,77,202,.1)`).
   - **Borde:** Morado fino (`1px solid rgba(155,77,202,.3)`).
   - **Texto:** Color `--pg` (`#c47dff`).
3. **Chips / Filtros:**
   - Estilo píldora (`border-radius: 20px`). Suelen tener borde y fondo semitransparente, pasando a estilo primario completo cuando están `.active`.

### Tarjetas (Cards)
Las tarjetas (ej. `.car-card`, `.step-card`) siguen una estructura común:
- **Fondo:** `--bg3` o `--cb`
- **Borde Redondeado (Border Radius):** Habitualmente entre `12px` y `16px` (la variable `--r` es `14px`).
- **Borde:** `1px solid rgba(255,255,255,.07)`
- **Hover:** Efecto de levantamiento (`transform: translateY(-6px)`) con el borde transicionando a color púrpura (`rgba(155,77,202,.45)`) y un resplandor o sombra de neón suave debajo.

### Formularios e Inputs
- **Inputs de texto/selects:** Tienen fondos oscuros (`var(--bg3)` o `rgba(255,255,255,0.04)`).
- **Bordes:** Finos (`1px`) con color translúcido claro o púrpura.
- **Focus:** Al enfocar un campo, el borde se ilumina (`border-color: rgba(155,77,202,0.5)`).
- **Labels:** Suelen estar en minúsculas pero con `text-transform: uppercase`, espaciado de letras (`letter-spacing: .08em`), tipografía pequeña y color atenuado `--td`.

### Etiquetas (Badges)
Generalmente se colocan sobre imágenes o en listas para indicar estado:
- Tienen `padding` reducido (`3px 8px`).
- Suelen tener fondos con baja opacidad (ej. `20%`) combinados con bordes finos (ej. `30%`) del mismo color que el texto.

---

## 5. Animaciones

Se utilizan "keyframes" comunes para dar vida a la interfaz:
1. **`fadeInUp`:** Transición suave de `opacity: 0` y `transform: translateY(12px)` a visible en su posición original. Usado ampliamente en modales, menús de navegación móviles y pestañas.
2. **`neon`:** Efecto pulsante de opacidad de 45% a 100%.
3. **`pulse`:** Escala y desvanece (`scale(1.2)` y `opacity: 0`), ideal para los anillos expansivos debajo de los marcadores del mapa (`.pin-ring`).
4. **`spin`:** Rotación estándar de 360 grados, usado para los iconos de carga / spinners.

---

## 6. Layout y Estructura Global

- **Contenedor Principal:** Un max-width común de `1280px` centrado (`margin: 0 auto`) en las secciones principales (Hero, Detalles, Perfil).
- **Grid Systems:** Uso intensivo de CSS Grid (`display: grid`):
  - 4 columnas para escritorio grande.
  - 2 a 3 columnas en tabletas.
  - 1 columna en móviles, asegurando un diseño "Mobile First" y responsivo.
- **Barra de Navegación (Navbar):** `position: sticky` con filtro difuminado en segundo plano (`backdrop-filter: blur(12px)`).
- **Barra de Desplazamiento (Scrollbar):** Estilizada para integrarse con el tema oscuro (barra color `--bg2` y control morado).

---

> [!TIP]
> **Consistencia:** Al crear nuevos componentes, asegúrate de utilizar las variables CSS (`var(--p)`, `var(--bg3)`, etc.) en lugar de colores "hardcodeados". Esto mantendrá el diseño coherente en toda la aplicación y facilitará futuras modificaciones de temas.
