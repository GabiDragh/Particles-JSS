import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const starParticleTexture = textureLoader.load('./textures/particles/1.png')

/**
 * INFO: Textures
 */

// Geometry
const particlesGeometry = new THREE.BufferGeometry();
const count = 5000 //test computer limits by increasing the number of particles - 5000000 slows it down, but still pays the video

const positions = new Float32Array(count * 3) //array for random value
const colors = new Float32Array(count * 3) //array for random color - R G B 


for ( let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10 //spread the particles around the scene, creates the being inside the scene effect by creating a bigger geometry
    colors[i] = Math.random()
}

// create buffer attribute
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3)) //buffer attibute - array times 3 for each coord x, y, z
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3)) //buffer attibute - array times 3 for each coord x, y, z


// Material
const particlesMaterial = new THREE.PointsMaterial({ 
    size: 0.3,
    sizeAttenuation: true, //creates perspective - front bigger than back particles
    // color: new THREE.Color('#ff88cc'),
    // map: starParticleTexture,
    transparent: true,
    alphaMap: starParticleTexture,  //can stilll see the edges in the particles because they are drawn in the same order they are created, therefore the gpu doesn't know which one is in front of which. AlphaTest might fix it
    // alphaTest: 0.01,
    // depthTest: false
    depthWrite: false,
    blending: THREE.AdditiveBlending, //gets illuminated by combining colors, mimics combining lights. really cool for sparkles etc. Too many particles and additiveBlending activated, might get into trouble
    vertexColors: true
})


// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

// // Add cube to test depthTest = false bugs

// const cube = new THREE.Mesh (
//     new THREE.BoxGeometry(),
//     new THREE.MeshBasicMaterial()
// )

// scene.add(cube)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}


/**
 * INFO: Custom Geometry
 */

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update particles
    // particles.rotation.y = elapsedTime / 10

    // Update each particle

    for (let i = 0; i < count; i++) {
        const i3 = i * 3 //i3 takes values 3 by 3 (instead of i < count * 3)
        const x = particlesGeometry.attributes.position.array[i3] //used to offset the position to get the wave effect
        particlesGeometry.attributes.position.array[i3 + 1] = Math.sin(elapsedTime + x)
    }

    particlesGeometry.attributes.position.needsUpdate = true //three.js needs to know when a geometry attribute changes

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()