import { Box, useMantineTheme } from '@mantine/core';
import { CameraControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Color } from 'three';

export default function PortalThrouth() {
	const theme = useMantineTheme();

	return (
		<Box w='100vw' h='100vh'>
			<Canvas
				gl={{ alpha: true, antialias: true }}
				camera={{ position: [0, 0, 1] }}
				scene={{ background: new Color(theme.colors.dark[7]) }}
			>
				<axesHelper args={[1]} />
				<CameraControls
					makeDefault
					maxPolarAngle={Math.PI / 2}
					minPolarAngle={-Math.PI / 2}
					minAzimuthAngle={-Math.PI / 2}
					maxAzimuthAngle={Math.PI / 2}
				/>
				<group dispose={null}>
					<mesh>
						<planeGeometry args={[1, 1, 64, 64]} />
						<meshBasicMaterial wireframe color={theme.colors.blue[5]} />
					</mesh>
				</group>
			</Canvas>
		</Box>
	);
}
