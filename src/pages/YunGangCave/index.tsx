import { Box, useMantineTheme } from '@mantine/core';
import { CameraControls, useGLTF, useHelper } from '@react-three/drei';
import { Canvas, extend, GroupProps, useThree } from '@react-three/fiber';
import { folder, Leva, useControls } from 'leva';
import { geometry } from 'maath';
import { Perf } from 'r3f-perf';
import {
	forwardRef,
	MutableRefObject,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from 'react';
import { useLocation } from 'react-router';
import { Object3D, SpotLight, SpotLightHelper } from 'three';
import YunGangCaveURL from './assets/yungang_cave_20.glb?url';
extend(geometry);

const GOLDENRATIO = 1.61803398875;
const WIDTH = 1;

export default function YunGangCave() {
	const location = useLocation();

	const model = useRef();

	return (
		<Box w='100vw' h='100vh'>
			<Leva hidden={location.hash !== '#debug'} />
			<Canvas>
				<Perf position='top-left' />
				<axesHelper />
				<CameraControls makeDefault />
				<YunGangModel ref={model} />
			</Canvas>
		</Box>
	);
}

const YunGangModel = forwardRef((props: GroupProps, ref: any) => {
	const { nodes } = useGLTF(YunGangCaveURL, true);

	const theme = useMantineTheme();

	const { camera } = useThree();

	const params = useControls({
		spotLight: folder({
			position: [0, 0, 0],
		}),
	});

	const [devicemotion, setDeviceMotion] = useState({
		alpha: 0,
		beta: 0,
		gamma: 0,
	});

	const spotLight = useRef<SpotLight>(null);

	useHelper(
		spotLight as MutableRefObject<Object3D>,
		SpotLightHelper,
		theme.colors.yellow[5]
	);

	useImperativeHandle(ref, () => {
		return nodes['Yungang-20objcleanergles'] as Object3D;
	});

	useEffect(() => {
		window.addEventListener(
			'deviceorientation',
			(e) => {
				const { beta, gamma } = e;

				if (!beta || !gamma) return;

				camera.rotation.x = (beta - 90) / 100;
				camera.rotation.y = gamma / 100;

				setDeviceMotion({
					alpha: e.alpha ?? 0,
					beta: e.beta ?? 0,
					gamma: e.gamma ?? 0,
				});
			},
			false
		);
	}, []);

	return (
		<group
			{...props}
			scale={0.1}
			dispose={null}
			position={[0, -1, 0]}
			rotation={[0, Math.PI * 1.2, Math.PI]}
		>
			<ambientLight intensity={0.6} />
			<spotLight
				castShadow
				position={params.position}
				rotation={[Math.PI / 2, 0, 0]}
				ref={spotLight}
			/>
			<primitive object={nodes['Yungang-20objcleanergles']} />
		</group>
	);
});
