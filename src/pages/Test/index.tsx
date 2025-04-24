import { useMantineTheme } from '@mantine/core';
import { useEffect } from 'react';
import {
	Color,
	Mesh,
	PerspectiveCamera,
	Scene,
	ShaderMaterial,
	SphereGeometry,
	Uniform,
	WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import sunFragmentShader from './shader/sun/fragment.glsl?raw';
import sunVertexShader from './shader/sun/vertex.glsl?raw';

export default function Test() {
	const theme = useMantineTheme();

	function initialScene() {
		const el = document.querySelector('#container') as HTMLDivElement;

		const size = {
			width: window.innerWidth,
			height: window.innerHeight,
			pixelratio: window.devicePixelRatio,
		};

		/**
		 * Basic
		 */

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.setSize(size.width, size.height);
		renderer.setPixelRatio(size.pixelratio);
		el.append(renderer.domElement);

		const scene = new Scene();
		scene.background = new Color(theme.colors.dark[9]);

		const camera = new PerspectiveCamera(75, size.width / size.height, 0.1, 1000);
		camera.position.set(3, 3, 3);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;

		/**
		 * Scene
		 */

		const uniforms = {
			uTime: new Uniform(0),
		};

		const sunGeometry = new SphereGeometry(2, 32, 32);
		const sunMaterial = new ShaderMaterial({
			vertexShader: sunVertexShader,
			fragmentShader: sunFragmentShader,
			uniforms,
		});
		const sun = new Mesh(sunGeometry, sunMaterial);
		scene.add(sun);

		/**
		 * Pane
		 */
		const pane = new Pane({ title: '🐞 Debug' });
		pane.element.parentElement!.style.width = '320px';
		// Sun Debug Params
		const sunPane = pane.addFolder({ title: '☀️ Sun' });

		/**
		 * Events
		 */

		function render(time: number = 0) {
			requestAnimationFrame(render);

			// Update
			controls.update(time);

			// Render
			renderer.render(scene, camera);
		}
		render();

		function resize() {
			size.width = window.innerWidth;
			size.height = window.innerHeight;
			size.pixelratio = Math.min(2, window.devicePixelRatio);

			renderer.setSize(size.width, size.height);
			camera.aspect = size.width / size.height;
			camera.updateProjectionMatrix();
		}
		window.addEventListener('resize', resize);
	}

	useEffect(() => {
		initialScene();
	}, []);

	return <div id='container'></div>;
}
