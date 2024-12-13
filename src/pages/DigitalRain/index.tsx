import { useMantineTheme } from '@mantine/core';
import { useEffect } from 'react';
import {
	Mesh,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	ShaderMaterial,
	WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import fragmentShader from './shader/fragment.glsl?raw';
import vertexShader from './shader/vertex.glsl?raw';

export default function DigitalRain() {
	const theme = useMantineTheme();

	const initialScene = async () => {
		const { innerWidth, innerHeight } = window;

		const el = document.querySelector('#container') as HTMLDivElement;
		el.innerHTML = '';

		/**
		 * Basic
		 */

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.setSize(innerWidth, innerHeight);
		renderer.setClearColor(theme.colors.dark[9]);
		renderer.setClearAlpha(1.0);
		renderer.setPixelRatio(window.devicePixelRatio);
		el.append(renderer.domElement);

		const scene = new Scene();

		const camera = new PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
		camera.position.set(0, 0, 1.0);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;
		controls.enabled = false;

		const stats = new Stats();
		el.append(stats.dom);

		/**
		 * Scenes
		 */

		const planeGeometry = new PlaneGeometry(1, 1, 16, 16);

		const uniforms = {
			u_time: { value: 0 },
		};

		const shaderMaterial = new ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms,
		});

		const planeMesh = new Mesh(planeGeometry, shaderMaterial);
		scene.add(planeMesh);

		/**
		 * Event
		 */

		function render(time?: number) {
			requestAnimationFrame(render);

			stats.update();
			controls.update(time);
			renderer.render(scene, camera);

			uniforms.u_time.value += 0.01;
		}
		render();

		function resize() {
			renderer.setSize(window.innerWidth, window.innerHeight);
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		}
		window.addEventListener('resize', resize);
	};

	useEffect(() => {
		initialScene();
	}, []);

	return <div id='container'></div>;
}
