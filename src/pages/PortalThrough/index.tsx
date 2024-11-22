import { Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
	CameraControls,
	MeshPortalMaterial,
	Preload,
	Text,
	useGLTF,
} from '@react-three/drei';
import { Canvas, GroupProps, extend, useFrame } from '@react-three/fiber';
import { easing, geometry } from 'maath';
import { Perf } from 'r3f-perf';
import { useRef } from 'react';
import { useLocation } from 'react-router';
import { NoToneMapping } from 'three';
import FiestaTeaURL from './assets/fiesta_tea-transformed.glb?url';

extend(geometry);

const GOLDENRATIO = 1.61803398875;
const WIDTH = 1;

export default function PortalThrouth() {
	const location = useLocation();

	return (
		<Box w='100vw' h='100vh'>
			<Canvas
				camera={{ position: [0, 0, 1] }}
				gl={{ alpha: true, antialias: true }}
			>
				<Perf
					position='top-left'
					style={{ display: location.hash === '#debug' ? 'block' : 'none' }}
				/>
				<axesHelper args={[1]} />
				<CameraControls
					makeDefault
					maxPolarAngle={Math.PI / 2}
					minPolarAngle={-Math.PI / 2}
					minAzimuthAngle={-Math.PI / 2}
					maxAzimuthAngle={Math.PI / 2}
				/>
				<PortalScene id={1} />
				<Preload all />
			</Canvas>
		</Box>
	);
}

function PortalScene({ id, ...props }: GroupProps) {
	const { nodes } = useGLTF(FiestaTeaURL, true);

	const [opened, { toggle }] = useDisclosure(false);

	const portal = useRef();

	useFrame((state, dt) => {
		easing.damp(portal.current, 'blend', opened ? 1 : 0, 0.2, dt);
	});

	return (
		<group {...props} dispose={null}>
			<Text
				fontSize={0.3}
				anchorY='top'
				anchorX='left'
				material-toneMapped={NoToneMapping}
				position={[-0.375, 0.715, 0.01]}
			>
				Tea
			</Text>
			<mesh onDoubleClick={toggle}>
				<roundedPlaneGeometry args={[WIDTH, GOLDENRATIO, 0.1]} />
				<MeshPortalMaterial ref={portal}>
					<color attach='background' args={['#e4cdac']} />
					<primitive
						scale={0.35}
						object={nodes.Scene}
						position={[0, -0.75, -0.3]}
					/>
				</MeshPortalMaterial>
			</mesh>
		</group>
	);
}
