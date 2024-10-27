import { Box } from '@mantine/core';
import { useEffect } from 'react';
import {
	AxesHelper,
	Color,
	PerspectiveCamera,
	Scene,
	WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

export default function SmoothstepTest() {
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
		camera.position.set(1, 1, 1);
		camera.lookAt(scene.position);

		const controler = new OrbitControls(camera, renderer.domElement);
		controler.enableDamping = true;
		controler.enablePan = true;

		const axesHelper = new AxesHelper();
		scene.add(axesHelper);

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
