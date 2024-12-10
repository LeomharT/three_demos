import { useMantineTheme } from '@mantine/core';
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import {
	AdditiveBlending,
	AxesHelper,
	BufferAttribute,
	BufferGeometry,
	PerspectiveCamera,
	Points,
	PointsMaterial,
	Scene,
	WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Pane } from 'tweakpane';

export default function GalaxyGenerator() {
	const theme = useMantineTheme();

	const location = useLocation();

	const debug = location.hash === '#debug';

	const initialScene = async () => {
		const el = document.querySelector('#container') as HTMLDivElement;
		el.innerHTML = '';

		const { innerWidth, innerHeight } = window;

		/**
		 * Basic
		 */

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.setSize(innerWidth, innerHeight);
		renderer.setClearColor(theme.colors.dark[7]);
		renderer.setClearAlpha(1.0);
		el.append(renderer.domElement);

		const scene = new Scene();

		const camera = new PerspectiveCamera(
			75,
			innerWidth / innerHeight,
			0.1,
			1000
		);
		camera.position.set(2, 2, 2);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;

		const stats = new Stats();
		if (debug) el.append(stats.dom);

		const PARTICLE_PARAMS = {
			COUNT: 100000,
			SIZE: 0.01,
			RADIUS: 5,
			BRANCHES: 3,
			SPIN: 1,
		};

		/**
		 * Scenes
		 */

		let bufferGeometry = new BufferGeometry();
		let pointsMaterial = new PointsMaterial({
			size: PARTICLE_PARAMS.SIZE,
			// perspective
			sizeAttenuation: true,
			depthWrite: false,
			blending: AdditiveBlending,
		});
		let points: null | Points = null;

		function generatorGalaxy() {
			// Free old resource
			if (points) {
				bufferGeometry.dispose();
				pointsMaterial.dispose();
				scene.remove(points);
			}

			bufferGeometry = new BufferGeometry();
			pointsMaterial = new PointsMaterial({
				size: PARTICLE_PARAMS.SIZE,
				// perspective
				sizeAttenuation: true,
				depthWrite: false,
				blending: AdditiveBlending,
			});

			const position = new Float32Array(PARTICLE_PARAMS.COUNT * 3);
			const attrPosition = new BufferAttribute(position, 3);

			for (let i = 0; i < PARTICLE_PARAMS.COUNT; i++) {
				const i3 = i * 3;

				const radius = PARTICLE_PARAMS.RADIUS * Math.random();

				const spinAngle = radius * PARTICLE_PARAMS.SPIN;

				const index = i % PARTICLE_PARAMS.BRANCHES;

				// ?
				const branchesAngle = (index / PARTICLE_PARAMS.BRANCHES) * Math.PI * 2;

				position[i3 + 0] = Math.cos(branchesAngle + spinAngle) * radius;
				position[i3 + 1] = 0;
				position[i3 + 2] = Math.sin(branchesAngle + spinAngle) * radius;
			}

			bufferGeometry.setAttribute('position', attrPosition);
			points = new Points(bufferGeometry, pointsMaterial);

			scene.add(points);
		}
		generatorGalaxy();

		/**
		 * Helpers
		 */

		const axesHelper = new AxesHelper();
		scene.add(axesHelper);

		/**
		 * Pane
		 */

		const pane = new Pane({ title: 'Debug Params' });
		const particlePane = pane.addFolder({ title: 'particle' });
		particlePane
			.addBinding(PARTICLE_PARAMS, 'SIZE', {
				min: 0,
				max: 1,
				step: 0.01,
			})
			.on('change', generatorGalaxy);
		particlePane
			.addBinding(PARTICLE_PARAMS, 'COUNT', {
				step: 100,
				min: 100,
				max: 100000,
			})
			.on('change', generatorGalaxy);
		particlePane
			.addBinding(PARTICLE_PARAMS, 'RADIUS', {
				step: 0.01,
				min: 0.01,
				max: 5,
			})
			.on('change', generatorGalaxy);
		particlePane
			.addBinding(PARTICLE_PARAMS, 'BRANCHES', {
				step: 1,
				min: 1,
				max: 10,
			})
			.on('change', generatorGalaxy);
		particlePane
			.addBinding(PARTICLE_PARAMS, 'SPIN', {
				step: 1,
				min: -5,
				max: 5,
			})
			.on('change', generatorGalaxy);
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
