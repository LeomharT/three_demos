import { Box, useMantineTheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
	CameraControls,
	Gltf,
	MeshPortalMaterial,
	PortalMaterialType,
	Preload,
	Text,
} from '@react-three/drei';
import { Canvas, GroupProps, extend, useFrame } from '@react-three/fiber';
import { easing, geometry } from 'maath';
import { Perf } from 'r3f-perf';
import { MutableRefObject, useRef } from 'react';
import { useLocation } from 'react-router';
import { Color, NoToneMapping } from 'three';
import FiestaTeaURL from './assets/fiesta_tea-transformed.glb?url';
import PicklesURL from './assets/pickles_3d_version_of_hyuna_lees_illustration-transformed.glb?url';
import StillURL from './assets/still_life_based_on_heathers_artwork-transformed.glb?url';
extend(geometry);

const GOLDENRATIO = 1.61803398875;
const WIDTH = 1;

export default function PortalThrouth() {
	const location = useLocation();

	const theme = useMantineTheme();

	return (
		<Box w='100vw' h='100vh'>
			<Canvas
				camera={{ position: [0, 0.7, 2.5] }}
				gl={{ alpha: true, antialias: true }}
				scene={{ background: new Color(theme.colors.gray[2]) }}
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
				<PortalScene id={1} name='tea'>
					<Gltf src={FiestaTeaURL} scale={0.35} position={[0, -0.75, -0.3]} />
				</PortalScene>
				<PortalScene
					id={2}
					bg='#e4cdac'
					name={'pick\nles'}
					position={[-1.2, 0, 0]}
					rotation={[0, Math.PI / 6, 0]}
				>
					<Gltf src={PicklesURL} scale={5} position={[0, -0.5, -0.3]} />
				</PortalScene>
				<PortalScene
					id={3}
					bg='#e4cdac'
					name={'still'}
					position={[1.2, 0, 0]}
					rotation={[0, -Math.PI / 6, 0]}
				>
					<Gltf src={StillURL} scale={0.8} position={[0, -0.5, -0.3]} />
				</PortalScene>
				<Preload all />
			</Canvas>
		</Box>
	);
}

type ProtalScene = GroupProps & {
	bg?: string;
};

function PortalScene({ id, bg = '#ffffff', ...props }: ProtalScene) {
	const [opened, { toggle }] = useDisclosure(false);

	const portal = useRef() as MutableRefObject<PortalMaterialType>;

	useFrame((state, dt) => {
		easing.damp(portal.current, 'blend', opened ? 1 : 0, 0.2, dt);
	});

	return (
		<group {...props} dispose={null}>
			<Text
				fontSize={0.3}
				lineHeight={0.8}
				anchorY='top'
				anchorX='left'
				position={[-0.375, 0.715, 0.01]}
				material-toneMapped={NoToneMapping}
			>
				{props.name}
			</Text>
			<mesh onDoubleClick={toggle}>
				<roundedPlaneGeometry args={[WIDTH, GOLDENRATIO, 0.1]} />
				<MeshPortalMaterial ref={portal}>
					<color attach='background' args={[bg]} />
					{props.children}
				</MeshPortalMaterial>
			</mesh>
		</group>
	);
}
