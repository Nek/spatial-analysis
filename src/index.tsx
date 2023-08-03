import {
  ACESFilmicToneMapping,
  AmbientLight,
  AxesHelper,
  BoxGeometry,
  BufferGeometry,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  GridHelper,
  Group,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  MeshNormalMaterial,
  MeshPhongMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  OrthographicCamera,
  PlaneGeometry,
  SRGBColorSpace,
  SphereGeometry,
  SpotLight,
} from 'three'

import { extend, createRoot, events } from '@react-three/fiber'
import { Scene } from './Scene'

// Register the THREE namespace as native JSX elements.
// See below for notes on tree-shaking
extend({
  AmbientLight,
  AxesHelper,
  BoxGeometry,
  BufferGeometry,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  GridHelper,
  Group,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  MeshNormalMaterial,
  MeshPhongMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  OrthographicCamera,
  PlaneGeometry,
  SphereGeometry,
  SpotLight,
})

// Create a react root
const root = createRoot(document.getElementById('root') as HTMLCanvasElement)

// createRoot by design is not responsive, you have to take care of resize yourself
window.addEventListener('resize', () => {
  root.configure({
    events,
    dpr: [1, 2],
    gl: {
      antialias: true,
      toneMapping: ACESFilmicToneMapping,
      outputColorSpace: SRGBColorSpace,
    },
    shadows: 'soft',
    camera: {
      fov: 50,
      position: [0, 6, 12],
    },
    size: { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight },
  })
  root.render(<Scene />)
})

// Trigger resize
window.dispatchEvent(new Event('resize'))
