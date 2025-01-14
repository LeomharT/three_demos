import { useMantineTheme } from '@mantine/core';
import {
	MeshReflectorMaterial,
	OrbitControls,
	PerspectiveCamera,
} from '@react-three/drei';
import { Canvas, GroupProps, useLoader } from '@react-three/fiber';
import { useControls } from 'leva';
import { Suspense, useEffect } from 'react';
import { Mesh, MeshStandardMaterial, RepeatWrapping, TextureLoader } from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import classes from './style.module.css';

export default function CarShow() {
	const theme = useMantineTheme();

	return (
		<div className={classes.container}>
			<Suspense fallback={'Loading...'}>
				<Canvas shadows>
					<CarShowScene />
				</Canvas>
			</Suspense>
		</div>
	);
}

function CarShowScene() {
	const { light1Intensity, light2Intensity } = useControls({
		light1Intensity: {
			value: 530,
			min: 0,
			max: 1000,
		},
		light2Intensity: {
			value: 540,
			min: 0,
			max: 1000,
		},
	});

	return (
		<>
			{/* Basics */}
			<PerspectiveCamera makeDefault fov={50} position={[3, 2, 5]} />
			<OrbitControls target={[0, 0.35, 0]} dampingFactor={0.05} />
			{/* Scene */}
			<color attach='background' args={[0, 0, 0]} />
			<Car />
			<Ground />
			{/* Lights */}
			<spotLight
				color={[1, 0.25, 0.7]}
				intensity={light1Intensity}
				angle={0.6}
				penumbra={0.5}
				position={[5, 5, 0]}
				castShadow
				shadow-bias={[-0.0001]}
			/>
			<spotLight
				color={[0.14, 0.5, 1.0]}
				intensity={light2Intensity}
				angle={0.6}
				penumbra={0.5}
				position={[-5, 5, 0]}
				castShadow
				shadow-bias={[-0.0001]}
			/>
			{/* Helpers */}
			<axesHelper />
		</>
	);
}

function Ground() {
	const [roughnessTexute, normalTexture] = useLoader(TextureLoader, [
		'/src/pages/CarShow/assets/texture/terrain-roughness.jpg',
		'/src/pages/CarShow/assets/texture/terrain-normal.jpg',
		'/src/pages/CarShow/assets/texture/grid-texture.png',
	]);

	useEffect(() => {
		[normalTexture, roughnessTexute].forEach((t) => {
			t.wrapS = t.wrapT = RepeatWrapping;
			t.repeat.set(5, 5);
		});
	}, []);

	return (
		<mesh rotation-x={-Math.PI / 2} castShadow receiveShadow>
			<planeGeometry args={[30, 30, 32, 32]} />
			<MeshReflectorMaterial
				mirror={0}
				dithering
				envMapIntensity={0}
				roughness={0.7}
				blur={[1000, 400]}
				resolution={1024}
				mixContrast={1}
				mixStrength={80}
				depthScale={0.01}
				minDepthThreshold={0.9}
				maxDepthThreshold={1}
				depthToBlurRatioBias={0.25}
				color={[0.015, 0.015, 0.015]}
				reflectorOffset={0.2}
				roughnessMap={roughnessTexute}
				normalMap={normalTexture}
			/>
		</mesh>
	);
}

function Car(props: GroupProps) {
	const gltf = useLoader(
		GLTFLoader,
		'/src/pages/CarShow/assets/modules/chevrolet_corvette_c7/scene.gltf'
	);

	useEffect(() => {
		gltf.scene.scale.setScalar(0.005);
		gltf.scene.position.set(0, -0.035, 0);
		gltf.scene.traverse((mesh) => {
			if (mesh instanceof Mesh) {
				mesh.castShadow = true;
				mesh.receiveShadow = true;
				if (mesh.material instanceof MeshStandardMaterial) {
					mesh.material.envMapIntensity = 50;
				}
			}
		});
	}, []);

	return (
		<group {...props} dispose={null}>
			<primitive object={gltf.scene} />
		</group>
	);
}
