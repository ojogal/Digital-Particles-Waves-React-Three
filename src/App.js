import './App.css';
import * as THREE from "three";
import { Canvas, useFrame, useLoader, extend, useThree } from "@react-three/fiber";
import circeImage from "./assets/circle.png";
// import circeSVG from "./assets/circle.svg";
import { useMemo, Suspense, useCallback, useRef } from 'react';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

extend({ OrbitControls });

function CameraControls() {
  const {
    camera,
    gl: { domElement }
  } = useThree();

  const controlsRef = useRef();
  useFrame(() => controlsRef.current.update())

  return (
    <orbitControls
      ref={controlsRef}
      args={[camera, domElement]}
    />
  );
}

function Points() {
  const ImageTexture = useLoader(THREE.TextureLoader, circeImage);
  const bufferRef = useRef();

  let t = 0;
  let f = 0.002;
  let a = 1;

  const graph = useCallback((x, z) => {
    return Math.sin(f * (x ** 2 + z ** 2 + t)) * a;
  }, [t, f, a])

  const count = 100;

  const sep = 4;

  let positions = useMemo(() => {
    let positions = [];

    for (let xi = 0; xi < count; xi++) {
      for (let zi = 0; zi < count; zi++) {
        let x = sep * (xi - count / 2);
        let z = sep * (zi - count / 2);
        let y = graph(x, z);
        positions.push(x, y, z)
      }
    }

    return new Float32Array(positions)
  }, [count, sep, graph]);

  useFrame(() => {
    t += 15;
    const positions = bufferRef.current.array;

    let i = 0;
    for (let xi = 0; xi < count; xi++) {
      for (let zi = 0; zi < count; zi++) {
        let x = sep * (xi - count / 2);
        let z = sep * (zi - count / 2);
        positions[i + 1] = graph(x, z);
        i += 3
      }
    }

    bufferRef.current.needsUpdate = true
  })

  return (
    <points>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          ref={bufferRef}
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
      </ bufferGeometry>
      <pointsMaterial
        attach="material"
        map={ImageTexture}
        // color={""}
        size={0.3}
        sizeAttenuation
        transparent={false}
        alphaTest={0.2}
        opacity={1.0}
      />
    </points>
  )
}

function AnimationCanvas() {
  return (
    <Canvas
      // colorManagement={false}
      camera={{ position: [100, 10, 0], fov: 75 }}
    >
      <Points />
      <CameraControls />
    </Canvas>
  )
}

function App() {
  return (
    <div className="App">
      <Suspense fallback={<div>Loading...</div>}>
        <AnimationCanvas />
      </Suspense>
    </div>
  );
}

export default App;