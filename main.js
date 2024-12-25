import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Lensflare, LensflareElement } from "three/examples/jsm/objects/Lensflare.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// URLs des textures
const textureURL = "/assets/image.jpg";
const displacementURL =
  "https://s3-us-west-2.amazonaws.com/s.cdpn.io/17271/ldem_3_8bit.jpg";
const worldURL =
  "https://s3-us-west-2.amazonaws.com/s.cdpn.io/17271/hipp8_s.jpg";
const normalMapURL =
  "https://s3-us-west-2.amazonaws.com/s.cdpn.io/17271/lroc_normalmap.jpg"; // Nouvelle texture normalMap

// Scène, caméra et rendu
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  85,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Contrôles de la caméra
const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = true; // Désactive le déplacement
controls.enableRotate = true; // Désactive la rotation autour de la lune
controls.enableZoom = true; // Active le zoom
controls.minDistance = 8; // Limite du zoom avant
controls.maxDistance = 20; // Limite du zoom arrière

// Chargement des textures
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load(textureURL);
const displacementMap = textureLoader.load(displacementURL);
const lensflareTexture = textureLoader.load(
  "https://threejs.org/examples/textures/lensflare/lensflare0.png"
);

// Matériau et géométrie de la lune
const geometry = new THREE.SphereGeometry(2, 60, 60);
var material = new THREE.MeshPhongMaterial({
  color: 0xffffff,
  map: texture,
  displacementMap: displacementMap,
  displacementScale: 0.06,
  bumpMap: displacementMap,
  bumpScale: 0.04,
  reflectivity: 0,
  shininess: 0,
});

// Création de la lune
const moon = new THREE.Mesh(geometry, material);
scene.add(moon);

// Lumières
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(-100, 10, 50);

// Créer l'effet de lensflare
const lensflare = new Lensflare();
lensflare.addElement(new LensflareElement(lensflareTexture, 300, 0)); // Taille du flare (300)

// Attacher le lensflare à la lumière directionnelle
light.add(lensflare);

scene.add(light);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.1);
hemiLight.color.setHSL(0.6, 1, 0.6);
hemiLight.groundColor.setHSL(0.095, 1, 0.75);
hemiLight.position.set(0, 50, 0);
scene.add(hemiLight);

// Lumière d'ambiance sombre
const ambientLight = new THREE.AmbientLight(0x222222); // Lumière ambiante faible pour simuler l'obscurité
scene.add(ambientLight);

// Etoiles
const starsGeometry = new THREE.BufferGeometry();
const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff });
const starPositions = [];

for (let i = 0; i < 10000; i++) {
  starPositions.push(
    (Math.random() - 0.5) * 2500,
    (Math.random() - 0.5) * 2500,
    (Math.random() - 0.5) * 2500
  );
}

starsGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(starPositions, 3)
);
const stars = new THREE.Points(starsGeometry, starsMaterial);

scene.add(stars);

// Soleil
const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({
  color: 0xffcc00,
  emissive: 0xffcc00,
  emissiveIntensity: 1,
  depthTest: false, // Ignore la profondeur
});

const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.position.set(-100, 10, 50); // Même position que la lumière directionnelle
let sunAngle = 0;
scene.add(sun);

// Chargement du modèle GLTF du satellite
const satelliteOrbit = {
  radius: 4,
  speed: 0.002,
  angle: 0,
};
let satelliteModel;
const satelliteRotation = {
  x: 0.5, // Inclinaison sur l'axe X (radians)
  y: 0.5, // Inclinaison sur l'axe Y (radians)
  z: 0.0, // Inclinaison sur l'axe Z (radians)
};
const loader = new GLTFLoader();
loader.load(
  "../assets/model/satelite/scene.gltf", // Chemin du fichier du modèle
  (gltf) => {
    satelliteModel = gltf.scene;
    satelliteModel.scale.set(0.05, 0.05, 0.05); // Ajustez la taille si nécessaire
    // Appliquer une inclinaison initiale
    satelliteModel.rotation.set(
      satelliteRotation.x,
      satelliteRotation.y,
      satelliteRotation.z
    );
    scene.add(satelliteModel);
  },
  undefined,
  (error) => {
    console.error("Erreur lors du chargement du satellite :", error);
  }
);

// Ordre de rendu
moon.renderOrder = 2; // Rendu en premier
stars.renderOrder = -1; // Les étoiles sont rendues en arrière-plan
sun.renderOrder = 0; // Rendu après la lune

// Position de la caméra
camera.position.z = 10;
// Chargement de l'audio
const listener = new THREE.AudioListener();
camera.add(listener);

const audioLoader = new THREE.AudioLoader();
const sound = new THREE.Audio(listener);

// Charger le fichier audio
audioLoader.load("assets/audio/interstellar.mp3", (buffer) => {
  sound.setBuffer(buffer);
  sound.setLoop(true);
  sound.setVolume(0.4);
});

// Contrôle du volume et du bouton de lecture
const audioButton = document.createElement("button");
audioButton.textContent = "🔇";
audioButton.style.position = "absolute";
audioButton.style.top = "20px";
audioButton.style.right = "20px";
audioButton.style.padding = "10px";
audioButton.style.borderRadius = "50%";
audioButton.style.fontSize = "20px";
audioButton.style.cursor = "pointer";
audioButton.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
audioButton.style.color = "white";
document.body.appendChild(audioButton);

// Contrôle du bouton audio
audioButton.addEventListener("click", () => {
  if (sound.isPlaying) {
    sound.pause();
    audioButton.textContent = "🔇";
  } else {
    sound.play();
    audioButton.textContent = "🔊";
  }
});

// Animation
function animate() {
  requestAnimationFrame(animate);

  sunAngle += 0.0001;
  const radius = 200;
  const sunX = radius * Math.cos(sunAngle);
  const sunZ = radius * Math.sin(sunAngle);
  sun.position.set(sunX, 10, sunZ);
  light.position.set(sunX, 10, sunZ);

  moon.rotation.y += 0.002; // Rotation lente de la lune

  // Mise à jour de l'orbite du satellite
  if (satelliteModel) {
    satelliteOrbit.angle += satelliteOrbit.speed;
    const x = satelliteOrbit.radius * Math.cos(satelliteOrbit.angle) + moon.position.x;
    const z = satelliteOrbit.radius * Math.sin(satelliteOrbit.angle) + moon.position.z;
    satelliteModel.position.set(x, 0, z);
  }

  renderer.render(scene, camera);
}

// Gestion du redimensionnement de la fenêtre
function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", onResize, false);

animate();
