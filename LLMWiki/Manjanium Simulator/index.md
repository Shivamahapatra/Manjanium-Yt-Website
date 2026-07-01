## 🗺️ System Blueprint Node Matrix

### 🧪 01. Core Vehicles & Physics
> Manages high-frequency vehicle rigid bodies, dynamic suspension raycasts, tire stint degradation arrays, and impact G-force calculations.
* **Active Blueprint:** [[01_Physics_Engine]]
* **Primary Core Stack:** `@react-three/rapier` (WASM physics server) & `DynamicRaycastVehicleController`

### 🎨 02. Interface Layers & Aesthetics
> Handles user interface mounting configurations, glassmorphic rendering containers, and absolute HUD canvas layering.
* **Active Blueprint:** [[02_UI_and_Aesthetics]]
* **Primary Core Stack:** Stitch Design System tokens, absolute HTML layers, responsive SVG vector gauges.

### 🏁 03. Circuit Architecture & Triggers
> Contains low-poly compressed track mesh pathways, sector checkpoint validations, and anti-cheat tracking loops.
* **Active Blueprint:** [[03_Tracks_Architecture]]
* **Primary Core Stack:** Draco-compressed `.glb` track meshes & Rapier Sensor bounding colliders.

### ⚙️ 04. Input Processors & Control Schemes
> Orchestrates low-latency keystroke capturing, automatic/manual transmission curves, and Pointer Lock canvas mouse tracking.
* **Active Blueprint:** [[04_Settings_and_Controls]]
* **Primary Core Stack:** Global keyboard/mouse event listener custom hooks & Pointer Lock API constraints.

### 🧠 05. Race Management Loops & Engine Logic
> Coordinates multiplayer matchmaking data pipelines, interactive ERS energy deployments, and live DRS zone calculations.
* **Active Blueprint:** [[05_Game_Logic]]
* **Primary Core Stack:** Supabase profile database tables & real-time coordinate delta vector tracking.

### 🔗 06. Multi-Zone Workspace & Deployment Sync
> Outlines monorepo application boundaries, path rewrites routing logic, and unified cross-site browser context persistence.
* **Active Blueprint:** [[06_Integrations_and_Sync]]
* **Primary Core Stack:** `pnpm` workspaces, Next.js asset routing rewrites, shared domain cross-site authorization cookies.