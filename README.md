# Interactive Bézier Curve with Physics

A real-time simulation of a cubic Bézier curve that responds to mouse movements using spring physics.
Drag to control the curve, watch it flow like a rope, and see the mathematics behind smooth motion in action.

---

## 🎯 What It Does

- Interactive Curve  
  Move your mouse to bend and stretch the curve in real time.

- Spring Physics  
  Control points follow the cursor with smooth, bouncy motion.

- Math Visualization  
  Displays Bézier formulas, tangent vectors, and control points.

- Auto Performance  
  Maintains 60 FPS by dynamically adjusting rendering quality.

---

## 📐 Math Behind It

### Cubic Bézier Curve

B(t) = (1−t)³P₀ + 3(1−t)²tP₁ + 3(1−t)t²P₂ + t³P₃

P₀, P₃: Fixed endpoints (green)  
P₁, P₂: Movable control points (pink)

---

### Spring Physics Model

acceleration = -k * (position - target) - damping * velocity

k (Stiffness): How tightly the control points follow the cursor  
Damping: How quickly the motion settles

---

## 🎮 How to Use

1. Open index.html in any modern browser  
2. Move the mouse over the canvas to interact  
3. Click and drag control points for direct manipulation  
4. Adjust sliders:
   - Stiffness: Follow speed
   - Damping: Bounciness
5. Click Reset to restore the initial state

---

## 🔧 Key Features

- Real-time interactive rendering  
- Smooth 60 FPS performance  
- Touch support for mobile devices  
- Educational overlays for math and physics  
- Live FPS counter with quality indicator

---

## 📁 Project Structure

├── index.html    # Main webpage  
├── style.css     # Styling and layout  
└── script.js     # Physics, math, and rendering logic

---

## 🚀 Quick Start

No installation required.
Simply open index.html and start interacting.

---

## 🎓 Learning Outcomes

- Bézier curve mathematics  
- Spring–mass–damper physics  
- Real-time graphics programming  
- Event handling and user interaction  
- Performance optimization techniques

---

## 📱 Platform Support

Desktop: Chrome, Edge  
Mobile: Android Chrome

No plugins or external libraries required.

---

## 🛠️ Implementation Notes

- Built completely from scratch  
- No external libraries used for core math or physics  
- Optimized for clarity, performance, and learning

---

Drag the pink dots and watch the curve dance.
