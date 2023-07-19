import { render, h } from 'preact'
import { Canvas } from '@react-three/fiber'
import { Leva } from 'leva'
import { ACESFilmicToneMapping, sRGBEncoding } from 'three'
import './styles/main.css'
import { OrbitControls } from '@react-three/drei/core/OrbitControls'

render(
  // <div className='main'>
  //   <Leva
  //     collapsed={false}
  //     oneLineLabels={false}
  //     flat={true}
  //     theme={{
  //       sizes: {
  //         titleBarHeight: '28px',
  //       },
  //       fontSizes: {
  //         root: '10px',
  //       },
  //     }}
  //   />
  // <Canvas
  //   dpr={[1, 2]}
  //   gl={{
  //     antialias: true,
  //     toneMapping: ACESFilmicToneMapping,
  //     outputEncoding: sRGBEncoding,
  //   }}
  //   camera={{
  //     fov: 55,
  //     near: 0.1,
  //     far: 200,
  //     position: [3, 2, 9],
  //   }}
  //   shadows
  // >
  //   <Scene />
  // </Canvas>
  // </div>,
  // ,
  <Canvas>
    <OrbitControls />
    <mesh>
      <boxGeometry />
      <meshNormalMaterial />
    </mesh>
  </Canvas>,
  document.getElementById('root') as HTMLElement
)