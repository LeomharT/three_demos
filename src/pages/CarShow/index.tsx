import { useMantineTheme } from '@mantine/core';
import { CameraControls, MeshReflectorMaterial } from '@react-three/drei';
import { Canvas, useLoader } from '@react-three/fiber';
import { Suspense } from 'react';
import { TextureLoader } from 'three';
import classes from './style.module.css';

export default function CarShow() {
	const theme = useMantineTheme();

	return (
		<div className={classes.container}>
			<Suspense fallback={'Loading...'}>
				<Canvas
					shadows
					camera={{
						position: [2, 2, 2],
					}}
				>
					<CarShowScene />
					<CameraControls />
				</Canvas>
			</Suspense>
		</div>
	);
}

function CarShowScene() {
	return (
		<>
			<ambientLight intensity={5.0} />
			<mesh position={[0, 1, 0]}>
				<boxGeometry args={[1, 1, 1, 32, 32, 32]} />
				<meshBasicMaterial color='cyan' />
			</mesh>
			<Ground />
		</>
	);
}

function Ground() {
	const [roughnessTexute, normalTexture] = useLoader(TextureLoader, [
		'/src/pages/CarShow/assets/texture/terrain-roughness.jpg',
		'/src/pages/CarShow/assets/texture/terrain-normal.jpg',
	]);

	return (
		<mesh rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
			<planeGeometry args={[10, 10, 32, 32]} />
			<MeshReflectorMaterial
				mirror={0}
				// normalScale={new Vector2(0.15, 0.15)}
				// reflectorOffset={0.2}
				// roughnessMap={roughnessTexute}
				normalMap={normalTexture}
			/>
		</mesh>
	);
}
