import { useMantineTheme } from '@mantine/core';
import { useEffect } from 'react';
import {
	AmbientLight,
	AxesHelper,
	DirectionalLight,
	DirectionalLightHelper,
	Mesh,
	MeshStandardMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	SphereGeometry,
	WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Pane } from 'tweakpane';

export default function HauntedHouse() {
	const theme = useMantineTheme();

	const initialScene = async () => {
		const el = document.querySelector('#container') as HTMLDivElement;
		el.innerHTML = '';

		/**
		 * Basic
		 */

		const renderer = new WebGLRenderer({ alpha: true, antialias: true });
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setClearColor(theme.colors.dark[7]);
		el.append(renderer.domElement);

		const scene = new Scene();

		const camera = new PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			500
		);
		camera.position.set(3, 3, 3);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;

		const stats = new Stats();
		el.append(stats.dom);

		/**
		 * Scene
		 */

		const sphereGeometry = new SphereGeometry(0.5, 16, 16);
		const material = new MeshStandardMaterial();
		const mesh = new Mesh(sphereGeometry, material);
		scene.add(mesh);

		// Floor
		const floorGeometry = new PlaneGeometry(1, 1, 16, 16);
		const floorMaterial = new MeshStandardMaterial();
		const floor = new Mesh(floorGeometry, floorMaterial);
		scene.add(floor);

		/**
		 * Lights
		 */

		const ambientLight = new AmbientLight();
		scene.add(ambientLight);

		const directionalLight = new DirectionalLight();
		directionalLight.position.x = 2.0;
		scene.add(directionalLight);
		scene.add(directionalLight.target);

		/**
		 * Helpers
		 */

		const axesHelper = new AxesHelper();
		scene.add(axesHelper);

		const directionalLightHelper = new DirectionalLightHelper(directionalLight);
		scene.add(directionalLightHelper);

		/**
		 * Pane
		 */

		const pane = new Pane({ title: 'Debug Params' });
		const ambientPane = pane.addFolder({ title: 'Ambient Light' });
		ambientPane.addBinding(ambientLight, 'intensity', {
			min: 0,
			max: 10,
			step: 0.1,
		});

		/**
		 * Events
		 */

		function render(time?: number) {
			requestAnimationFrame(render);

			stats.update();
			controls.update(time);
			renderer.render(scene, camera);
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
