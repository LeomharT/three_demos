import { Box, useMantineTheme } from '@mantine/core';
import {
	CameraControls,
	MeshPortalMaterial,
	Preload,
	Text,
	useGLTF,
} from '@react-three/drei';
import { Canvas, GroupProps, extend } from '@react-three/fiber';
import { useControls } from 'leva';
import { geometry } from 'maath';
import { Perf } from 'r3f-perf';
import { useLocation } from 'react-router';
import { NoToneMapping } from 'three';
import FiestaTeaURL from './assets/fiesta_tea-transformed.glb?url';

extend(geometry);

const GOLDENRATIO = 1.61803398875;
const WIDTH = 1;

export default function PortalThrouth() {
	const theme = useMantineTheme();

	const location = useLocation();

	const { monitor } = useControls({
		monitor: 0,
	});

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
				<PortalScene />
				<Preload all />
			</Canvas>
		</Box>
	);
}

function PortalScene(props: GroupProps) {
	const { nodes } = useGLTF(FiestaTeaURL, true);

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
			<mesh onClick={console.error}>
				<roundedPlaneGeometry args={[WIDTH, GOLDENRATIO, 0.1]} />
				<MeshPortalMaterial blend={0}>
					<color attach='background' args={['#e4cdac']} />
					<primitive
						object={nodes.Scene}
						scale={0.3}
						position={[0, -0.4, -0.3]}
					/>
				</MeshPortalMaterial>
			</mesh>
		</group>
	);
}
