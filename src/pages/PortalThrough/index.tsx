import { Box, useMantineTheme } from '@mantine/core';
import { CameraControls, useGLTF } from '@react-three/drei';
import { Canvas, GroupProps, extend } from '@react-three/fiber';
import { geometry } from 'maath';
import { Perf } from 'r3f-perf';
import { useLocation } from 'react-router';
import FiestaTeaURL from './assets/fiesta_tea-transformed.glb?url';

extend(geometry);

export default function PortalThrouth() {
	const theme = useMantineTheme();

	const location = useLocation();

	return (
		<Box w='100vw' h='100vh'>
			<Canvas
				gl={{ alpha: true, antialias: true }}
				camera={{ position: [0, 0, 1] }}
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
			</Canvas>
		</Box>
	);
}

function PortalScene(props: GroupProps) {
	const { nodes } = useGLTF(FiestaTeaURL, true);

	return (
		<group {...props} dispose={null}>
			<primitive object={nodes.Scene} />
		</group>
	);
}
