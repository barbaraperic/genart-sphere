// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require('three')

// Include any additional ThreeJS examples below
require('three/examples/js/controls/OrbitControls')

const canvasSketch = require('canvas-sketch')
const glsl = require('glslify')

const settings = {
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: 'webgl',
}

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas,
  })

  // WebGL background color
  renderer.setClearColor('#FFF', 1)

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100)
  camera.position.set(0, 0, -4)
  camera.lookAt(new THREE.Vector3())

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas)

  // Setup your scene
  const scene = new THREE.Scene()

  // Setup a geometry
  const geometry = new THREE.SphereGeometry(1, 32, 16)

  const vertexShader = /*glsl*/ `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0);
      }
  `

  const fragmentShader = glsl(`
    #pragma glslify: noise = require('glsl-noise/simplex/3d');

    uniform vec3 color;
    uniform float time;
    varying vec2 vUv;
    void main() {
      vec2 center = vec2(0.5, 0.5);

      vec2 q = vUv;
      q.x *= 2.0;

      vec2 pos = mod(q * 8.0, 1.0);
      float d = distance(pos, center);
      // float mask = step(0.15 + sin(time + vUv.x) * 0.25, d);
      
      vec2 noiseInput = floor(q * 8.0);
      float offset = noise(vec3(noiseInput.xy, time)) * 0.15;
      float mask = step(0.25 + offset, d);
      mask = 1.0 - mask;
      vec3 fragColor = mix(color, vec3(0.5), mask);
      gl_FragColor = vec4(vec3(fragColor), 1.0);
    }
  `)

  // Setup a material
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color('skyblue') },
    },
    fragmentShader,
    vertexShader,
  })

  // Setup a mesh with geometry + material
  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio)
      renderer.setSize(viewportWidth, viewportHeight, false)
      camera.aspect = viewportWidth / viewportHeight
      camera.updateProjectionMatrix()
    },
    // Update & render your scene here
    render({ time }) {
      controls.update()
      renderer.render(scene, camera)
      material.uniforms.time.value = time
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      controls.dispose()
      renderer.dispose()
    },
  }
}

canvasSketch(sketch, settings)
