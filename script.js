// ==================== CONFIGURATION ====================
const CONFIG = {
  STIFFNESS: 0.1,
  DAMPING: 0.9,
  TANGENT_SCALE: 50,
  SAMPLE_STEPS: 200,
  POINT_RADIUS: 8,
  TANGENT_LENGTH: 30,
  COLORS: {
    CURVE: "#00b4db",
    CONTROL_POINTS: "#ff4081",
    TANGENTS: "#ffcc00",
    END_POINTS: "#4caf50",
    GRID: "rgba(255, 255, 255, 0.05)",
  },
};

// ==================== STATE VARIABLES ====================
let canvas, ctx;
let controlPoints = [];
let springPoints = [];
let mouse = { x: 0, y: 0, isDown: false };
let lastTime = 0;
let fps = 60;
let frameCount = 0;
let fpsTime = 0;

// ==================== FRAME RATE MANAGER ====================
class FrameRateManager {
  constructor(targetFPS = 60) {
    this.targetFPS = targetFPS;
    this.frameInterval = 1000 / targetFPS; // 16.67ms for 60 FPS
    this.lastFrameTime = 0;
    this.frameCount = 0;
    this.lastFPSUpdate = 0;
    this.slowFrames = 0;
    this.fastFrames = 0;
    this.performanceWarning = false;
    
    // Quality levels: 0=low, 1=medium, 2=high
    this.quality = {
      level: 2,
      settings: [
        { // Level 0: Low quality (for poor performance)
          samples: 50,
          tangents: [0.5], // Only show tangent at midpoint
          grid: false,
          lines: false,
          arrows: false,
          fadeAlpha: 0.3,
        },
        { // Level 1: Medium quality
          samples: 100,
          tangents: [0, 0.5, 1], // Start, middle, end
          grid: true,
          lines: true,
          arrows: false,
          fadeAlpha: 0.2,
        },
        { // Level 2: High quality (default)
          samples: 200,
          tangents: [0, 0.25, 0.5, 0.75, 1], // All 5 tangents
          grid: true,
          lines: true,
          arrows: true,
          fadeAlpha: 0.1,
        }
      ]
    };
    
    this.currentSettings = this.quality.settings[this.quality.level];
  }
  
  shouldRender(currentTime) {
    const elapsed = currentTime - this.lastFrameTime;
    
    // Only render if enough time has passed for target FPS
    if (elapsed >= this.frameInterval) {
      // Adjust timing to prevent drift
      this.lastFrameTime = currentTime - (elapsed % this.frameInterval);
      
      // Measure exact frame start time
      const frameStart = performance.now();
      
      return {
        render: true,
        frameStart: frameStart,
        onComplete: (frameTime) => {
          this.updatePerformance(frameTime);
        }
      };
    }
    
    return { render: false };
  }
  
  updatePerformance(frameTime) {
    this.frameCount++;
    
    // Track frame performance
    if (frameTime > 18) { // Very slow (less than ~55 FPS)
      this.slowFrames++;
      this.fastFrames = 0;
      
      // Lower quality if consistently slow
      if (this.slowFrames > 5 && this.quality.level > 0) {
        this.lowerQuality();
        this.slowFrames = 0;
        this.showPerformanceWarning();
      }
    } else if (frameTime < 14) { // Very fast (more than ~70 FPS)
      this.fastFrames++;
      this.slowFrames = Math.max(0, this.slowFrames - 1);
      
      // Raise quality if consistently fast and not already at max
      if (this.fastFrames > 30 && this.quality.level < 2) {
        this.raiseQuality();
        this.fastFrames = 0;
      }
    } else { // Good performance (60 FPS ± buffer)
      this.slowFrames = Math.max(0, this.slowFrames - 0.5);
      this.fastFrames = Math.max(0, this.fastFrames - 0.5);
    }
    
    // Update FPS display every second
    const now = performance.now();
    if (now - this.lastFPSUpdate > 1000) {
      const measuredFPS = Math.round((this.frameCount * 1000) / (now - this.lastFPSUpdate));
      fps = measuredFPS;
      
      // Update display with color coding
      const fpsElement = document.getElementById('fps');
      fpsElement.textContent = measuredFPS;
      
      if (measuredFPS < 58) {
        fpsElement.style.color = '#ff4081'; // Red for low FPS
        fpsElement.title = 'Performance warning: Below target 60 FPS';
      } else if (measuredFPS < 62) {
        fpsElement.style.color = '#4caf50'; // Green for good FPS
        fpsElement.title = 'Good: Maintaining 60 FPS';
      } else {
        fpsElement.style.color = '#ffcc00'; // Yellow for high FPS
        fpsElement.title = 'Excellent: Above 60 FPS';
      }
      
      // Show quality level
      const qualityNames = ['Low', 'Medium', 'High'];
      document.getElementById('quality').textContent = qualityNames[this.quality.level];
      
      this.frameCount = 0;
      this.lastFPSUpdate = now;
      
      // Hide warning after 5 seconds of good performance
      if (measuredFPS >= 58 && this.performanceWarning) {
        setTimeout(() => {
          this.hidePerformanceWarning();
        }, 5000);
      }
    }
  }
  
  lowerQuality() {
    if (this.quality.level > 0) {
      this.quality.level--;
      this.currentSettings = this.quality.settings[this.quality.level];
      console.log(`Lowered quality to level ${this.quality.level} for performance`);
    }
  }
  
  raiseQuality() {
    if (this.quality.level < 2) {
      this.quality.level++;
      this.currentSettings = this.quality.settings[this.quality.level];
      console.log(`Raised quality to level ${this.quality.level}`);
    }
  }
  
  showPerformanceWarning() {
    if (!this.performanceWarning) {
      this.performanceWarning = true;
      
      // Create warning element if it doesn't exist
      let warning = document.getElementById('performance-warning');
      if (!warning) {
        warning = document.createElement('div');
        warning.id = 'performance-warning';
        warning.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: rgba(255, 64, 129, 0.9);
          color: white;
          padding: 10px 15px;
          border-radius: 5px;
          z-index: 1000;
          font-family: Arial, sans-serif;
          font-size: 14px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          animation: fadeIn 0.3s ease;
        `;
        document.body.appendChild(warning);
      }
      
      warning.textContent = `Quality lowered to maintain 60 FPS`;
      warning.style.display = 'block';
    }
  }
  
  hidePerformanceWarning() {
    this.performanceWarning = false;
    const warning = document.getElementById('performance-warning');
    if (warning) {
      warning.style.display = 'none';
    }
  }
  
  getCurrentSettings() {
    return this.currentSettings;
  }
}

// Initialize frame rate manager
const frameRateManager = new FrameRateManager(60);

// ==================== INITIALIZATION ====================
function init() {
  // Get canvas and context
  canvas = document.getElementById("bezierCanvas");
  ctx = canvas.getContext("2d", { alpha: false }); // Disable alpha for performance
  
  // Set canvas size to container
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  
  // Add quality display to UI
  addQualityDisplay();
  
  // Initialize control points
  initializePoints();
  
  // Setup mouse events
  setupMouseEvents();
  
  // Setup control sliders
  setupControls();
  
  // Start animation loop
  requestAnimationFrame(animate);
}

function addQualityDisplay() {
  const controls = document.querySelector('.controls');
  const qualityDisplay = document.createElement('div');
  qualityDisplay.className = 'quality-display';
  qualityDisplay.innerHTML = `
    <span style="color: #80deea">Quality: </span>
    <span id="quality" style="font-weight: bold">High</span>
  `;
  qualityDisplay.style.cssText = `
    background: rgba(0, 0, 0, 0.3);
    padding: 10px 15px;
    border-radius: 8px;
    font-family: monospace;
    font-size: 0.9rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  `;
  controls.appendChild(qualityDisplay);
}

function resizeCanvas() {
  const container = canvas.parentElement;
  canvas.width = container.clientWidth - 40;
  canvas.height = 500;
}

function setupMouseEvents() {
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mousedown", () => (mouse.isDown = true));
  canvas.addEventListener("mouseup", () => (mouse.isDown = false));
  canvas.addEventListener("mouseleave", () => (mouse.isDown = false));
  
  canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
  canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
}

function handleMouseMove(e) {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
  
  if (mouse.isDown) {
    springPoints[0].targetX = mouse.x;
    springPoints[0].targetY = mouse.y;
  }
}

function handleTouchMove(e) {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  mouse.x = touch.clientX - rect.left;
  mouse.y = touch.clientY - rect.top;
  
  springPoints[0].targetX = mouse.x;
  springPoints[0].targetY = mouse.y;
}

function handleTouchStart(e) {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  mouse.x = touch.clientX - rect.left;
  mouse.y = touch.clientY - rect.top;
  mouse.isDown = true;
}

function initializePoints() {
  controlPoints = [
    { x: 100, y: 300 },
    { x: 200, y: 100 },
    { x: 400, y: 100 },
    { x: 500, y: 300 },
  ];
  
  springPoints = [
    {
      x: controlPoints[1].x,
      y: controlPoints[1].y,
      vx: 0,
      vy: 0,
      targetX: controlPoints[1].x,
      targetY: controlPoints[1].y,
      stiffness: CONFIG.STIFFNESS,
      damping: CONFIG.DAMPING,
    },
    {
      x: controlPoints[2].x,
      y: controlPoints[2].y,
      vx: 0,
      vy: 0,
      targetX: controlPoints[2].x,
      targetY: controlPoints[2].y,
      stiffness: CONFIG.STIFFNESS,
      damping: CONFIG.DAMPING,
    },
  ];
}

function calculateBezierPoint(t, p0, p1, p2, p3) {
  const u = 1 - t;
  
  const x =
    u * u * u * p0.x +
    3 * u * u * t * p1.x +
    3 * u * t * t * p2.x +
    t * t * t * p3.x;
  
  const y =
    u * u * u * p0.y +
    3 * u * u * t * p1.y +
    3 * u * t * t * p2.y +
    t * t * t * p3.y;
  
  return { x, y };
}

function calculateBezierTangent(t, p0, p1, p2, p3) {
  const u = 1 - t;
  
  const dx =
    3 * u * u * (p1.x - p0.x) +
    6 * u * t * (p2.x - p1.x) +
    3 * t * t * (p3.x - p2.x);
  
  const dy =
    3 * u * u * (p1.y - p0.y) +
    6 * u * t * (p2.y - p1.y) +
    3 * t * t * (p3.y - p2.y);
  
  const length = Math.sqrt(dx * dx + dy * dy);
  return {
    x: dx / (length || 1),
    y: dy / (length || 1),
  };
}

function updatePhysics(deltaTime) {
  springPoints.forEach((spring) => {
    updateSpring(spring, deltaTime);
  });
  
  controlPoints[1].x = springPoints[0].x;
  controlPoints[1].y = springPoints[0].y;
  controlPoints[2].x = springPoints[1].x;
  controlPoints[2].y = springPoints[1].y;
  
  const followFactor = 0.3;
  springPoints[1].targetX +=
    (springPoints[0].x - springPoints[1].targetX) *
    followFactor *
    deltaTime *
    60;
  springPoints[1].targetY +=
    (springPoints[0].y - springPoints[1].targetY) *
    followFactor *
    deltaTime *
    60;
}

function updateSpring(spring, deltaTime) {
  const ax =
    -spring.stiffness * (spring.x - spring.targetX) -
    spring.damping * spring.vx;
  const ay =
    -spring.stiffness * (spring.y - spring.targetY) -
    spring.damping * spring.vy;
  
  spring.vx += ax * deltaTime;
  spring.vy += ay * deltaTime;
  spring.x += spring.vx * deltaTime;
  spring.y += spring.vy * deltaTime;
  
  const maxSpeed = 500;
  const speed = Math.sqrt(spring.vx * spring.vx + spring.vy * spring.vy);
  if (speed > maxSpeed) {
    spring.vx = (spring.vx / speed) * maxSpeed;
    spring.vy = (spring.vy / speed) * maxSpeed;
  }
}

function drawGrid() {
  const settings = frameRateManager.getCurrentSettings();
  if (!settings.grid) return;
  
  const gridSize = 50;
  ctx.strokeStyle = CONFIG.COLORS.GRID;
  ctx.lineWidth = 1;
  
  for (let x = 0; x <= canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  
  for (let y = 0; y <= canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawControlPoints() {
  controlPoints.forEach((point, index) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, CONFIG.POINT_RADIUS, 0, Math.PI * 2);
    
    if (index === 0 || index === 3) {
      ctx.fillStyle = CONFIG.COLORS.END_POINTS;
    } else {
      ctx.fillStyle = CONFIG.COLORS.CONTROL_POINTS;
    }
    
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = "white";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`P${index}`, point.x, point.y - 20);
  });
}

function drawControlLines() {
  const settings = frameRateManager.getCurrentSettings();
  if (!settings.lines) return;
  
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  
  ctx.beginPath();
  ctx.moveTo(controlPoints[0].x, controlPoints[0].y);
  ctx.lineTo(controlPoints[1].x, controlPoints[1].y);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(controlPoints[2].x, controlPoints[2].y);
  ctx.lineTo(controlPoints[3].x, controlPoints[3].y);
  ctx.stroke();
  
  ctx.setLineDash([]);
}

function drawBezierCurve() {
  const settings = frameRateManager.getCurrentSettings();
  
  ctx.beginPath();
  const firstPoint = calculateBezierPoint(0, ...controlPoints);
  ctx.moveTo(firstPoint.x, firstPoint.y);
  
  for (let i = 1; i <= settings.samples; i++) {
    const t = i / settings.samples;
    const point = calculateBezierPoint(t, ...controlPoints);
    ctx.lineTo(point.x, point.y);
  }
  
  ctx.strokeStyle = CONFIG.COLORS.CURVE;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
}

function drawTangents() {
  const settings = frameRateManager.getCurrentSettings();
  
  settings.tangents.forEach((t) => {
    const point = calculateBezierPoint(t, ...controlPoints);
    const tangent = calculateBezierTangent(t, ...controlPoints);
    
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.lineTo(
      point.x + tangent.x * CONFIG.TANGENT_LENGTH,
      point.y + tangent.y * CONFIG.TANGENT_LENGTH
    );
    
    ctx.strokeStyle = CONFIG.COLORS.TANGENTS;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = CONFIG.COLORS.TANGENTS;
    ctx.fill();
    
    if (settings.arrows) {
      drawArrow(
        point.x,
        point.y,
        point.x + tangent.x * CONFIG.TANGENT_LENGTH,
        point.y + tangent.y * CONFIG.TANGENT_LENGTH
      );
    }
  });
}

function drawArrow(fromX, fromY, toX, toY) {
  const headLength = 10;
  const dx = toX - fromX;
  const dy = toY - fromY;
  const angle = Math.atan2(dy, dx);
  
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLength * Math.cos(angle - Math.PI / 6),
    toY - headLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLength * Math.cos(angle + Math.PI / 6),
    toY - headLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.stroke();
}

function animate(currentTime) {
  // Use frame rate manager to control rendering
  const shouldRender = frameRateManager.shouldRender(currentTime);
  
  if (shouldRender.render) {
    // Get current quality settings
    const settings = frameRateManager.getCurrentSettings();
    
    // Clear canvas with performance-optimized method
    ctx.fillStyle = "rgb(0, 10, 20)"; // Solid color, no alpha (faster)
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Apply fade effect if enabled
    if (settings.fadeAlpha > 0) {
      ctx.fillStyle = `rgba(0, 10, 20, ${settings.fadeAlpha})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Draw with current quality settings
    drawGrid();
    
    // Calculate delta time for physics (use consistent value for 60 FPS)
    const deltaTime = 1/60; // Fixed for 60 FPS physics
    
    // Update physics
    updatePhysics(deltaTime);
    
    // Draw everything
    drawControlLines();
    drawBezierCurve();
    drawTangents();
    drawControlPoints();
    
    // Draw mouse indicator
    drawMouseIndicator();
    
    // Measure actual frame time and update performance
    const frameTime = performance.now() - shouldRender.frameStart;
    shouldRender.onComplete(frameTime);
  }
  
  // Always continue the animation loop
  requestAnimationFrame(animate);
}

function drawMouseIndicator() {
  if (!mouse.isDown) return;
  
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, 15, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 64, 129, 0.3)";
  ctx.fill();
  ctx.strokeStyle = CONFIG.COLORS.CONTROL_POINTS;
  ctx.lineWidth = 2;
  ctx.stroke();
  
  ctx.font = "12px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText("Drag", mouse.x, mouse.y + 30);
}

function setupControls() {
  const stiffnessSlider = document.getElementById("stiffness");
  const dampingSlider = document.getElementById("damping");
  const resetBtn = document.getElementById("reset-btn");
  
  stiffnessSlider.value = CONFIG.STIFFNESS;
  dampingSlider.value = CONFIG.DAMPING;
  
  stiffnessSlider.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    CONFIG.STIFFNESS = value;
    document.getElementById("stiffness-value").textContent = value.toFixed(2);
    springPoints.forEach((spring) => (spring.stiffness = value));
  });
  
  dampingSlider.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    CONFIG.DAMPING = value;
    document.getElementById("damping-value").textContent = value.toFixed(2);
    springPoints.forEach((spring) => (spring.damping = value));
  });
  
  resetBtn.addEventListener("click", () => {
    initializePoints();
    springPoints.forEach((spring) => {
      spring.stiffness = CONFIG.STIFFNESS;
      spring.damping = CONFIG.DAMPING;
    });
    // Reset quality to high
    frameRateManager.quality.level = 2;
    frameRateManager.currentSettings = frameRateManager.quality.settings[2];
  });
}

window.addEventListener("load", init);

window.BezierSim = {
  controlPoints,
  springPoints,
  config: CONFIG,
  frameRateManager,
  recalculate: () => {
    springPoints[0].targetX = mouse.x;
    springPoints[0].targetY = mouse.y;
  },
};