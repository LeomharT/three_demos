import { Box, useMantineTheme } from '@mantine/core';
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import {
	AmbientLight,
	AxesHelper,
	BufferGeometry,
	Mesh,
	PerspectiveCamera,
	PointLight,
	Scene,
	WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Pane } from 'tweakpane';

export default function Particle() {
	const location = useLocation();

	const theme = useMantineTheme();

	useEffect(() => {
		const { innerWidth, innerHeight } = window;

		const el = document.querySelector('#container') as HTMLDivElement;
		el.innerHTML = '';

		/**
		 * Basic
		 */

		const renderer = new WebGLRenderer({ alpha: true, antialias: true });
		renderer.shadowMap.enabled = true;
		renderer.localClippingEnabled = true;
		renderer.setClearAlpha(1);
		renderer.setSize(innerWidth, innerHeight);
		renderer.setAnimationLoop(render);
		renderer.setClearColor(theme.colors.dark[8]);
		el.append(renderer.domElement);

		const scene = new Scene();

		const camera = new PerspectiveCamera(
			75,
			innerWidth / innerHeight,
			0.1,
			5000
		);
		camera.position.set(0, 600, 600);
		camera.lookAt(scene.position);

		const controler = new OrbitControls(camera, renderer.domElement);
		controler.enableDamping = true;
		controler.dampingFactor = 0.05;

		const stats = new Stats();
		el.append(stats.dom);

		/**
		 * Variant
		 */

		const PARTICLE_COUNT = 1000;
		const DURATION = 20;
		let TIME = 0;
		let TIME_STEP = 1 / 60;

		/**
		 * Models
		 */

		const bufferGeometry = new BufferGeometry();

		const particleGeometry = new Mesh(bufferGeometry);

		/**
		 * Lights
		 */

		const ambientLight = new AmbientLight(0xffffff);
		ambientLight.intensity = 0.5;
		scene.add(ambientLight);

		const pointLight = new PointLight(0xffffff, 4, 1000, 2);
		pointLight.position.set(0, 400, 0);
		scene.add(pointLight);

		/**
		 * Helpers
		 */

		const axesHelper = new AxesHelper(600);
		scene.add(axesHelper);

		/**
		 * Pane
		 */

		const pane = new Pane({ title: 'Params' });

		const paneAmbientLight = pane.addFolder({ title: 'AmbientLight' });
		paneAmbientLight.addBinding(ambientLight, 'intensity', {
			max: 10,
			min: 0,
			step: 0.1,
		});

		function render(time: number = 0) {
			controler.update(time);
			stats.update();

			renderer.render(scene, camera);
		}

		function resize() {
			renderer.setSize(window.innerWidth, window.innerHeight);
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		}
		window.addEventListener('resize', resize);
	}, []);

	return <Box w='100vw' h='100vh' id='container'></Box>;
}
