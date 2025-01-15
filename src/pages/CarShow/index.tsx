import { useMantineTheme } from '@mantine/core';
import {
	CubeCamera,
	Environment,
	MeshReflectorMaterial,
	OrbitControls,
	PerspectiveCamera,
} from '@react-three/drei';
import { Canvas, GroupProps, useFrame, useLoader } from '@react-three/fiber';
import { useControls } from 'leva';
import { Perf } from 'r3f-perf';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import {
	Color,
	Mesh,
	MeshStandardMaterial,
	RepeatWrapping,
	TextureLoader,
	TorusGeometry,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import classes from './style.module.css';

export default function CarShow() {
	const theme = useMantineTheme();

	return (
		<div className={classes.container}>
			<Suspense fallback={'Loading...'}>
				<Canvas shadows>
					<Perf position='top-left' />
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
			<CubeCamera resolution={256} frames={Infinity}>
				{(texture) => {
					return (
						<>
							<Environment map={texture} />
							<Car />
						</>
					);
				}}
			</CubeCamera>
			<Rings />
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
	const [roughnessTexute, normalTexture, girdTexture] = useLoader(TextureLoader, [
		'/src/pages/CarShow/assets/texture/terrain-roughness.jpg',
		'/src/pages/CarShow/assets/texture/terrain-normal.jpg',
		'/src/pages/CarShow/assets/texture/grid-texture.png',
	]);

	useEffect(() => {
		[normalTexture, roughnessTexute].forEach((t) => {
			t.wrapS = t.wrapT = RepeatWrapping;
			t.repeat.set(5, 5);
		});
	}, [normalTexture, roughnessTexute]);

	return (
		<mesh rotation-x={-Math.PI / 2} castShadow receiveShadow>
			<planeGeometry args={[30, 30, 32, 32]} />
			<MeshReflectorMaterial
				envMapIntensity={0}
				dithering={true}
				color={[0.015, 0.015, 0.015]}
				roughness={0.7}
				blur={[1000, 400]}
				mixBlur={30}
				mixStrength={80}
				mixContrast={1}
				resolution={1024}
				mirror={0}
				depthScale={0.01}
				minDepthThreshold={0.9}
				maxDepthThreshold={1}
				depthToBlurRatioBias={0.25}
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
					mesh.material.envMapIntensity = 20;
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

function Rings() {
	const refs = useRef<Mesh<TorusGeometry, MeshStandardMaterial>[]>([]);

	useFrame(() => {
		for (let i = 0; i < refs.current.length; i++) {
			const mesh = refs.current[i];

			const z = (i - refs.current.length / 2) * 3.5;

			// [-7, 7]
			const distance = Math.abs(z);

			mesh.position.set(0, 0, z);
			mesh.scale.setScalar(1 - distance * 0.04);

			let colorScale = 1.0;

			if (distance > 2) {
				colorScale = 1 - (Math.min(distance, 12) - 2) / 10;
			}
			colorScale *= 0.5;

			if (i % 2 === 1) {
				mesh.material.emissive = new Color(6, 0.15, 0.7).multiplyScalar(colorScale);
			} else {
				mesh.material.emissive = new Color(0.1, 0.7, 3).multiplyScalar(colorScale);
			}
		}
	});

	const rings = useMemo(() => {
		return new Array(14).fill(0).map((_, index) => {
			return (
				<mesh
					key={index}
					ref={(el: Mesh<TorusGeometry, MeshStandardMaterial>) =>
						(refs.current[index] = el)
					}
					position={[0, 0, 0]}
					castShadow
					receiveShadow
				>
					<torusGeometry args={[3.35, 0.05, 10, 100]} />
					<meshStandardMaterial emissive={[0.5, 0.5, 0.5]} color={[0, 0, 0]} />
				</mesh>
			);
		});
	}, []);

	return rings;
}
