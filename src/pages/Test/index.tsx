import { useEffect } from 'react';
import { Color, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

export default function Test() {
	useEffect(() => {
		const el = document.querySelector('#container') as HTMLDivElement;

		const size = {
			width: window.innerWidth,
			height: window.innerHeight,
			pixelRatio: Math.min(2, window.devicePixelRatio),
		};

		/**
		 * Basic
		 */

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.setSize(size.width, size.height);
		renderer.setPixelRatio(size.pixelRatio);
		el.append(renderer.domElement);

		const scene = new Scene();
		scene.background = new Color('#1e1e1e');

		const camera = new PerspectiveCamera(75, size.width / size.height, 0.1, 1000);
		camera.position.set(3, 3, 3);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		const stats = new Stats();
		el.append(stats.dom);

		/**
		 * Events
		 */

		function render(time: number = 0) {
			// Loop
			requestAnimationFrame(render);

			// Update
			controls.update(time);
			stats.update();

			// Render
			renderer.render(scene, camera);
		}
		render();

		function resize() {
			size.width = window.innerWidth;
			size.height = window.innerHeight;
			size.pixelRatio = Math.min(2, window.devicePixelRatio);

			renderer.setSize(size.width, size.height);

			camera.aspect = size.width / size.height;
			camera.updateProjectionMatrix();
		}
		window.addEventListener('resize', resize);
	}, []);

	return <div id='container'></div>;
}
