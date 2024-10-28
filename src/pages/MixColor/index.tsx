import { Box, useMantineTheme } from '@mantine/core';
import rgba from 'color-normalize';
import { useEffect } from 'react';
import {
	AxesHelper,
	Color,
	Mesh,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	ShaderMaterial,
	Vector4,
	WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import fragmentShader from './shader/fragment.glsl?raw';
import vertexShader from './shader/vertex.glsl?raw';

export default function MixColor() {
	const theme = useMantineTheme();

	useEffect(() => {
		const el = document.querySelector('#container') as HTMLDivElement;

		el.innerHTML = '';

		const { innerWidth, innerHeight } = window;

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.setClearAlpha(0);
		renderer.setClearColor(new Color(0, 0, 0));
		renderer.setSize(innerWidth, innerHeight);

		const scene = new Scene();

		const camera = new PerspectiveCamera(
			75,
			innerWidth / innerHeight,
			0.1,
			1000
		);
		camera.position.set(0, 0, 1);
		camera.lookAt(scene.position);

		const controler = new OrbitControls(camera, renderer.domElement);
		controler.enableDamping = true;
		controler.enablePan = true;

		const axesHelper = new AxesHelper();
		scene.add(axesHelper);

		// Plane
		const geometry = new PlaneGeometry(2, 1, 16, 16);
		const material = new ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms: {
				u_color1: { value: new Vector4(...rgba(theme.colors.red[7])) },
				u_color2: { value: new Vector4(...rgba(theme.colors.blue[7])) },
			},
		});
		const mesh = new Mesh(geometry, material);

		scene.add(mesh);

		el.append(renderer.domElement);
		function render(time?: number) {
			requestAnimationFrame(render);
			controler.update(time);
			renderer.render(scene, camera);
		}

		render();
	}, []);

	return <Box id='container' w='100vw' h='100vh'></Box>;
}
