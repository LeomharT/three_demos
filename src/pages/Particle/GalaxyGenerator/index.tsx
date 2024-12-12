import { useMantineTheme } from '@mantine/core';
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import {
	AdditiveBlending,
	AxesHelper,
	BufferAttribute,
	BufferGeometry,
	Color,
	CustomBlending,
	LinearSRGBColorSpace,
	MultiplyBlending,
	NoBlending,
	NoColorSpace,
	NormalBlending,
	PerspectiveCamera,
	Points,
	PointsMaterial,
	Scene,
	SRGBColorSpace,
	SubtractiveBlending,
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
		renderer.setClearColor(theme.colors.dark[9]);
		renderer.setClearAlpha(1.0);
		el.append(renderer.domElement);

		const scene = new Scene();

		const camera = new PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
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
			RANDOMNESS: 0.2,
			RANDOMNESS_POWER: 3,
			INSIDECOLOR: '#ff6030',
			OUTSIDECOLOR: '#1b3984',
			BLENDING: AdditiveBlending,
		};

		/**
		 * Scenes
		 */

		let bufferGeometry = new BufferGeometry();
		let pointsMaterial = new PointsMaterial();
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
				blending: PARTICLE_PARAMS.BLENDING,
				vertexColors: true,
			});

			const position = new Float32Array(PARTICLE_PARAMS.COUNT * 3);
			const attrPosition = new BufferAttribute(position, 3);

			const colors = new Float32Array(PARTICLE_PARAMS.COUNT * 3);
			const attrColor = new BufferAttribute(colors, 3);

			for (let i = 0; i < PARTICLE_PARAMS.COUNT; i++) {
				const i3 = i * 3;

				const radius = PARTICLE_PARAMS.RADIUS * Math.random();

				const index = i % PARTICLE_PARAMS.BRANCHES;

				/**
				 * @description divide a circle equally according to the number of branches
				 * `Math.PI * 2 = 360°`
				 * `index / PARTICLE_PARAMS.BRANCHES average score`
				 * `radius = legth`
				 *
				 * `Math.PI * 2`作用是平均切分360°, 如果是`Math.PI`那么就是在平均切分180°,
				 * index / PARTICLE_PARAMS.BRANCHES计算每次随机值的角度, 就是360°的三分之一, 那么正好切割为三份
				 */
				const branchesAngle = (index / PARTICLE_PARAMS.BRANCHES) * Math.PI * 2;

				/**
				 * 没有radius就是在原地打转
				 * 乘以radius作用是越远的粒子旋转的角度越大
				 * 正负就是逆时针和顺时针的区别
				 */
				const spinAngle = radius * PARTICLE_PARAMS.SPIN;

				/**
				 * 减去0.5为了保证能够在正负轴均有分布
				 * 乘以radisu都只有一个作用, 就是越远的粒子随机值越大
				 */
				const randomX =
					Math.pow(Math.random(), PARTICLE_PARAMS.RANDOMNESS_POWER) *
					(Math.random() < 0.5 ? 1 : -1) *
					PARTICLE_PARAMS.RANDOMNESS *
					radius;
				const randomY =
					Math.pow(Math.random(), PARTICLE_PARAMS.RANDOMNESS_POWER) *
					(Math.random() < 0.5 ? 1 : -1) *
					PARTICLE_PARAMS.RANDOMNESS *
					radius;
				const randomZ =
					Math.pow(Math.random(), PARTICLE_PARAMS.RANDOMNESS_POWER) *
					(Math.random() < 0.5 ? 1 : -1) *
					PARTICLE_PARAMS.RANDOMNESS *
					radius;

				position[i3 + 0] = Math.cos(branchesAngle + spinAngle) * radius + randomX;
				position[i3 + 1] = randomY;
				position[i3 + 2] = Math.sin(branchesAngle + spinAngle) * radius + randomZ;

				const colorInside = new Color(PARTICLE_PARAMS.INSIDECOLOR);
				const colorOutSide = new Color(PARTICLE_PARAMS.OUTSIDECOLOR);

				const mixColor = new Color().lerpColors(
					colorInside,
					colorOutSide,
					radius / PARTICLE_PARAMS.RADIUS
				);

				colors[i3] = mixColor.r;
				colors[i3 + 1] = mixColor.g;
				colors[i3 + 2] = mixColor.b;
			}

			bufferGeometry.setAttribute('position', attrPosition);
			bufferGeometry.setAttribute('color', attrColor);
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
		pane.addBinding(renderer, 'outputColorSpace', {
			options: [
				{ text: 'NoColorSpace', value: NoColorSpace },
				{ text: 'SRGBColorSpace', value: SRGBColorSpace },
				{ text: 'LinearSRGBColorSpace', value: LinearSRGBColorSpace },
			],
		});

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
		particlePane
			.addBinding(PARTICLE_PARAMS, 'RANDOMNESS', {
				step: 0.001,
				min: 0,
				max: 2,
			})
			.on('change', generatorGalaxy);
		particlePane
			.addBinding(PARTICLE_PARAMS, 'INSIDECOLOR', {
				color: { type: 'int' },
			})
			.on('change', generatorGalaxy);
		particlePane
			.addBinding(PARTICLE_PARAMS, 'OUTSIDECOLOR', {
				color: { type: 'int' },
			})
			.on('change', generatorGalaxy);
		particlePane
			.addBinding(PARTICLE_PARAMS, 'BLENDING', {
				options: [
					{ text: 'NoBlending', value: NoBlending },
					{ text: 'CustomBlending', value: CustomBlending },
					{ text: 'NormalBlending', value: NormalBlending },
					{ text: 'AdditiveBlending', value: AdditiveBlending },
					{ text: 'MultiplyBlending', value: MultiplyBlending },
					{ text: 'SubtractiveBlending', value: SubtractiveBlending },
				],
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

		console.log([<div>123</div>, <span>456</span>]);
	};

	useEffect(() => {
		initialScene();
	}, []);

	return <div id='container'></div>;
}
