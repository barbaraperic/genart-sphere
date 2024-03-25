// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require('three')

// Include any additional ThreeJS examples below
require('three/examples/js/controls/OrbitControls')

const canvasSketch = require('canvas-sketch')

const settings = {
  // Make the loop animated unless ?static is passed to URL
  animate: !/static/i.test(window.location.search),
  // Get a WebGL canvas rather than 2D
  context: 'webgl',
}

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    context,
  })

  // WebGL background color
  renderer.setClearColor('#fff', 1)

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(25, 1, 0.01, 100)
  camera.position.set(2, 2, -10)
  camera.lookAt(new THREE.Vector3())

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas)
  controls.enableZoom = false

  // Setup your scene
  const scene = new THREE.Scene()

  // A grid
  const gridScale = 10
  scene.add(
    new THREE.GridHelper(gridScale, 10, 'hsl(0, 0%, 50%)', 'hsl(0, 0%, 70%)')
  )

  // A custom geometry
  const geometry = new THREE.BufferGeometry()

  let vertices = new Float32Array([
    -1.0,
    -1.0,
    1.0, // vertex 1
    1.0,
    -1.0,
    1.0, // vertex 2
    1.0,
    1.0,
    1.0, // vertex 3
  ])

  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
  const material = new THREE.MeshBasicMaterial({
    color: 'skyblue',
    side: THREE.DoubleSide,
  })
  const mesh = new THREE.Mesh(geometry, material)

  scene.add(mesh)

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio)
      renderer.setSize(viewportWidth, viewportHeight)
      camera.aspect = viewportWidth / viewportHeight
      camera.updateProjectionMatrix()
    },
    // Update & render your scene here
    render() {
      controls.update()
      renderer.render(scene, camera)
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      controls.dispose()
      renderer.dispose()
    },
  }
}

canvasSketch(sketch, settings)
