import {
  Mesh,
  PlaneGeometry,
  MeshPhongMaterial,
  BoxGeometry,
  AmbientLight,
  SpotLight,
  ACESFilmicToneMapping,
  sRGBEncoding,
  CylinderGeometry,
  ConeGeometry,
  MeshBasicMaterial,
} from 'three'
import { extend, createRoot, events } from '@react-three/fiber'
import { Scene } from './Scene'

// Register the THREE namespace as native JSX elements.
// See below for notes on tree-shaking
extend({
  Mesh,
  PlaneGeometry,
  MeshPhongMaterial,
  BoxGeometry,
  AmbientLight,
  SpotLight,
  CylinderGeometry,
  ConeGeometry,
  MeshBasicMaterial,
})

// Create a react root
const root = createRoot(document.getElementById('root') as HTMLCanvasElement)

// Configure the root, inject events optionally, set camera, etc
root.configure({
  events,
  dpr: [1, 2],
  gl: {
    antialias: true,
    toneMapping: ACESFilmicToneMapping,
    outputEncoding: sRGBEncoding,
  },
  shadows: true,
  camera: {
    fov: 55,
    near: 0.1,
    far: 200,
    position: [3, 2, 9],
  },
})

// createRoot by design is not responsive, you have to take care of resize yourself
window.addEventListener('resize', () => {
  root.configure({ size: { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight } })
})

// Trigger resize
window.dispatchEvent(new Event('resize'))

// Render entry point
root.render(<Scene />)
