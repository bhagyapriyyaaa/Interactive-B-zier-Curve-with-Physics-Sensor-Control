Interactive Bézier Curve with Physics
A real-time simulation of a cubic Bézier curve that responds to mouse movements with spring physics. Drag to control the curve, watch it flow like a rope, and see the math in action.

🎯 What It Does
Interactive Curve: Move your mouse to bend and stretch the curve in real-time

Spring Physics: Control points follow your cursor with smooth, bouncy motion

Math Visualization: See Bézier formulas, tangent vectors, and control points

Auto Performance: Maintains 60 FPS by adjusting quality when needed

📐 Math Behind It
Cubic Bézier Curve:

text
B(t) = (1−t)³P₀ + 3(1−t)²tP₁ + 3(1−t)t²P₂ + t³P₃
P₀, P₃: Fixed endpoints (green)

P₁, P₂: Movable control points (pink)

Physics (Spring System):

text
acceleration = -k*(position - target) - damping*velocity
k: Spring stiffness (how "tight" the follow)

damping: How quickly motion settles

🎮 How to Use
Open index.html in any browser

Move mouse over canvas - curve reacts automatically

Click and drag for direct control

Adjust sliders to change physics behavior:

Stiffness: How quickly points follow mouse

Damping: How bouncy the motion is

Reset button returns to starting position

🔧 Key Features
Real-time Interaction: Curve updates instantly as you move

60 FPS Guaranteed: Auto-adjusts quality to stay smooth

Touch Support: Works on mobile devices

Educational Display: Shows formulas and physics

Performance Monitor: Live FPS counter with quality indicator

📁 Files
text
├── index.html    # Main webpage
├── style.css     # Styling and layout
└── script.js     # All logic (physics, math, rendering)
🚀 Quick Start
Simply open index.html - no installation needed. Everything runs in the browser.

🎓 Learning Points
Mathematics: How Bézier curves work (parametric equations)

Physics: Spring-mass-damper systems

Programming: Real-time graphics, event handling, performance optimization

UI/UX: Interactive controls and feedback

📱 Works On
Desktop: Chrome, Edge

Mobile:Android Chrome

No plugins or downloads required

Built from scratch - no external libraries used for the core math or physics.

Drag the pink dots, watch the curve dance!
