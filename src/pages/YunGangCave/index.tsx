import { Box } from '@mantine/core';
import { CameraControls, MeshPortalMaterial, Text, useGLTF } from '@react-three/drei';
import { Canvas, extend, GroupProps, useThree } from '@react-three/fiber';
import { Leva, useControls } from 'leva';
import { geometry } from 'maath';
import { Perf } from 'r3f-perf';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { Object3D } from 'three';
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
				<mesh>
					<roundedPlaneGeometry args={[WIDTH, GOLDENRATIO, 0.1]} />
					<MeshPortalMaterial>
						<ambientLight intensity={0.6} />
						<YunGangModel ref={model} />
					</MeshPortalMaterial>
				</mesh>
			</Canvas>
		</Box>
	);
}

const YunGangModel = forwardRef((props: GroupProps, ref: any) => {
	const { nodes } = useGLTF(YunGangCaveURL, true);

	const { camera } = useThree();

	const params = useControls({
		rotationX: 0,
		rotationY: 0,
		rotationZ: 0,
	});

	const [devicemotion, setDeviceMotion] = useState({
		alpha: 0,
		beta: 0,
		gamma: 0,
	});

	useImperativeHandle(ref, () => {
		return nodes['Yungang-20objcleanergles'] as Object3D;
	});

	useEffect(() => {
		camera.rotation.x = params.rotationX;
		camera.rotation.y = params.rotationY;
	}, [params]);

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
			<Text position={[0, -1.0, 0]}>{devicemotion.beta}</Text>
			<primitive object={nodes['Yungang-20objcleanergles']} />
		</group>
	);
});
