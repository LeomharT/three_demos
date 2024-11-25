import { Box } from '@mantine/core';
import { CameraControls, useGLTF } from '@react-three/drei';
import { Canvas, GroupProps } from '@react-three/fiber';
import { Leva } from 'leva';
import { Perf } from 'r3f-perf';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { useLocation } from 'react-router';
import { Object3D } from 'three';
import YunGangCaveURL from './assets/yungang_cave_20.glb?url';

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
				<ambientLight intensity={0.6} />
				<YunGangModel ref={model} />
			</Canvas>
		</Box>
	);
}

const YunGangModel = forwardRef((props: GroupProps, ref: any) => {
	const { nodes } = useGLTF(YunGangCaveURL, true);

	useImperativeHandle(ref, () => {
		return nodes['Yungang-20objcleanergles'] as Object3D;
	});

	return (
		<group
			{...props}
			scale={0.3}
			dispose={null}
			position={[0, -2, 0]}
			rotation={[0, Math.PI * 1.2, Math.PI]}
		>
			<primitive object={nodes['Yungang-20objcleanergles']} />
		</group>
	);
});
