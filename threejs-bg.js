// ════════════════════════════════════════════════
// 1. CUSTOM CURSOR (GSAP)
// ════════════════════════════════════════════════
const cursor = document.getElementById('custom-cursor');
const cursorDot = cursor.querySelector('.cursor-dot');
const cursorRing = cursor.querySelector('.cursor-ring');

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  
  // Instant follow for dot
  gsap.set(cursorDot, {
    x: mouseX,
    y: mouseY
  });
  
  // Smooth follow for ring
  gsap.to(cursorRing, {
    x: mouseX,
    y: mouseY,
    duration: 0.15,
    ease: "power2.out"
  });
});

// Hover states
const interactiveElements = document.querySelectorAll('a, button, .project__grid-item, .experiment');
interactiveElements.forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.classList.add('hovering');
  });
  el.addEventListener('mouseleave', () => {
    cursor.classList.remove('hovering');
  });
});


// ════════════════════════════════════════════════
// 2. THREE.JS BACKGROUND SCENE
// ════════════════════════════════════════════════
const canvas = document.getElementById('webgl-canvas');

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// Material (Metallic Studio Dialect Style)
const material = new THREE.MeshStandardMaterial({
  color: 0x222222,
  roughness: 0.2,
  metalness: 0.8,
  wireframe: true,
  transparent: true,
  opacity: 0.15
});

// Objects
const objects = [];

// 1. Icosahedron
const geo1 = new THREE.IcosahedronGeometry(1.5, 0);
const mesh1 = new THREE.Mesh(geo1, material);
mesh1.position.set(-3, 2, -2);
scene.add(mesh1);
objects.push({ mesh: mesh1, rotSpeed: { x: 0.002, y: 0.003 } });

// 2. Torus Knot
const geo2 = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
const mesh2 = new THREE.Mesh(geo2, material);
mesh2.position.set(4, -1, -3);
scene.add(mesh2);
objects.push({ mesh: mesh2, rotSpeed: { x: -0.001, y: 0.002 } });

// 3. Sphere
const geo3 = new THREE.SphereGeometry(1.2, 32, 32);
const mesh3 = new THREE.Mesh(geo3, material);
mesh3.position.set(-2, -3, -4);
scene.add(mesh3);
objects.push({ mesh: mesh3, rotSpeed: { x: 0.001, y: -0.002 } });

// Parallax target variables
let targetX = 0;
let targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
  targetX = (event.clientX - windowHalfX) * 0.001;
  targetY = (event.clientY - windowHalfY) * 0.001;
});

let scrollY = window.scrollY;
window.addEventListener('scroll', () => {
  scrollY = window.scrollY;
});

// Animation Loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const time = clock.getElapsedTime();

  // Gentle floating animation & rotation
  objects.forEach((obj, idx) => {
    obj.mesh.rotation.x += obj.rotSpeed.x;
    obj.mesh.rotation.y += obj.rotSpeed.y;
    // Float up and down
    obj.mesh.position.y += Math.sin(time + idx) * 0.002;
  });

  // Mouse Parallax (Camera slight movement)
  camera.position.x += (targetX - camera.position.x) * 0.05;
  camera.position.y += (-targetY - camera.position.y) * 0.05;
  camera.lookAt(scene.position);

  // Scroll Parallax (Move the entire scene up/down based on scroll)
  // Divide by a large number so it moves smoothly
  scene.position.y = scrollY * 0.002;

  renderer.render(scene, camera);
}

animate();

// Resize Handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
