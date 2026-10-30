# 🍕 take me night — Late Night Artisanal Pizza (Jeddah)

> **Official interactive web experience for "take me night" — Jeddah's iconic late-night wood-fired artisanal pizza brand.**  
> Crafted with Three.js, custom GLSL shaders, GSAP ScrollTrigger, Lenis smooth scrolling, and an interactive 3D GLTF Disco Ball preloader.

[![Live Demo](https://img.shields.io/badge/LIVE_DEMO-VISIT_WEBSITE-FF14D4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://abod6911.github.io/take-me-night/)
[![GitHub Repo](https://img.shields.io/badge/GITHUB-PUBLIC_REPOSITORY-FFE600?style=for-the-badge&logo=github&logoColor=0B0711)](https://github.com/abod6911/take-me-night)
[![Three.js](https://img.shields.io/badge/Three.js-r170-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![GSAP](https://img.shields.io/badge/GSAP-3.12-88CE02?style=for-the-badge&logo=greensock&logoColor=white)](https://greensock.com/)

---

## 🌐 Live Preview Link

🔗 **[https://abod6911.github.io/take-me-night/](https://abod6911.github.io/take-me-night/)**

---

## ✨ Architectural & Visual Highlights

### 🪩 1. 3D WebGL GLTF Disco Ball Preloader
- Real-time 3D **`disco_ball.glb`** loaded via Three.js `GLTFLoader`.
- **Faceted PBR Mirrors:** Micro-tile reflectivity (`metalness: 0.98`, `roughness: 0.10`) with realistic studio environment reflections.
- **Dynamic Colored Lighting:** 4 orbiting PointLights (Electric Magenta `#FF14D4`, Laser Yellow `#FFE600`, Neon Cyan `#00E5FF`, and Overhead White Specular).
- **Interactive Cursor Parallax & Ignition Zoom:** Smooth inertia mouse tracking and high-velocity camera zoom-through into the 3D tablecloth.
- **420+ Star Diamond Particles:** Additive blending sparkle field with atmospheric depth.

### 🏁 2. Undulating 3D WebGL Checkered Tablecloth
- Custom **GLSL Vertex & Fragment Shaders** generating organic cloth ripples across the full viewport.
- **Valley Ambient Occlusion:** Deep shadowing in the wave troughs for tactile, photorealistic fabric folds.
- **Scroll-Linked Shader Color Morphing:**
  - *Hero Section:* Deep Midnight Black (`#0B0711`) & Crisp Starlight Off-White (`#F8F6FA`).
  - *Menu Section:* Seamlessly transforms into Electric Magenta (`#D411B8`) & Starlight Off-White (`#F8F6FA`).

### 🍕 3. Pinned Scroll-Driven Orbital Showcase
- High-impact **2-Line Stacked Giant Typography** (`TAKE ME / NIGHT`, `SMOKED / BRISKET`, `CRAZY / RANCH`, `DOUBLE / PEPPERONI`, `TRUFFLE / BURRATA`, `HOT HONEY / DIABLO`).
- Strict scroll index synchronization between center dish plate, dynamic barcodes, and bottom-left geometric info card.
- **Zero Audio:** 100% silent, distraction-free visual luxury.

### 🛒 4. Late-Night Ordering System & Cart Drawer
- **Cart Drawer:** Live quantity steppers (`+` / `-`), free delivery progress bar, 1-tap late-night sauce upsells (Truffle Mayo, Garlic Ranch, Hot Honey Glaze).
- **Interactive Payment Modal:** Apple Pay, Mada card, and Cash on Delivery with simulated live order tracker.
- **Pizza Customizer Modal:** Interactive crust selection (Thin Crust vs Cheesy Stuffed) and topping modifiers.

### 📱 5. Flawless Cross-Device Ergonomics
- 100% responsive across mobile (`< 768px`), tablet, and ultrawide 4K desktop displays.
- Responsive kinetic marquees, sticky bottom navigation pill, and touch-optimized gestures.

---

## 🛠️ Tech Stack

- **Framework:** HTML5, Modern Vanilla JavaScript (ES6+), Tailwind CSS
- **3D & Shaders:** Three.js (r170), GLTFLoader, Custom GLSL Shaders
- **Motion & Physics:** GSAP (GreenSock), ScrollTrigger, Lenis Smooth Scroll
- **Typography:** Google Fonts (`Anton`, `Plus Jakarta Sans`, `Inter`, `Playfair Display`, `Space Mono`)
- **Build Tool:** Vite 5

---

## 🚀 Local Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/abod6911/take-me-night.git

# 2. Navigate to project directory
cd take-me-night

# 3. Install dependencies
npm install

# 4. Start local development server
npm run dev

# 5. Build for production
npm run build

# 6. Preview production build locally
npm run preview
```

---

## 📂 Project Structure

```
take-me-night/
├── index.html                   # Semantic markup, meta tags & modal architectures
├── vite.config.js               # Relative base configuration for universal hosting
├── package.json                 # Dependencies and scripts
├── public/
│   ├── brand/                   # Neon signage and logo assets
│   ├── dishes/                  # Ultra-high-res transparent pizza photography
│   └── models/
│       └── disco_ball.glb       # Optimized 3D GLTF disco ball asset
└── src/
    ├── main.js                  # Application orchestrator, cart logic & Lenis scroll
    ├── styles/                  # Tailwind base & custom neo-brutalist CSS layers
    └── components/
        ├── preloader.js         # 3D GLTF Disco Ball WebGL scene & ignition sequence
        ├── tablecloth.js        # 3D undulating cloth Three.js WebGL GLSL shader
        └── hero-scroll.js       # Pinned scroll orbital dish rotation & title syncing
```

---

## 📄 License

MIT © [abod6911](https://github.com/abod6911)
