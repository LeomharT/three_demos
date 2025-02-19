import { useEffect } from 'react';
import {
	AdditiveBlending,
	AxesHelper,
	BufferAttribute,
	BufferGeometry,
	Color,
	PerspectiveCamera,
	Points,
	Scene,
	ShaderMaterial,
	WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Pane } from 'tweakpane';
import fragmentShader from './shader/fragment.glsl?raw';
import vertexShader from './shader/vertex.glsl?raw';

export default function GalaxyAnimation() {
	useEffect(() => {
		const el = document.querySelector('#container') as HTMLDivElement;

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
		el.append(renderer.domElement);

		const scene = new Scene();
		scene.background = new Color(0x000000);

		const camera = new PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		camera.position.set(2, 2, 2);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		const stats = new Stats();
		el.append(stats.dom);

		/**
		 * Scene
		 */

		const params = {
			size: 30.0,
			count: 200000,
			radius: 3.0,
			branches: 3.0,
			randomness: 0.5,
			randomnessPower: 3,
			insideColor: new Color('#ff6030'),
			outsideColor: new Color('#1b3984'),
		};

		let bufferGeometry = new BufferGeometry();
		let pointsMaterial = new ShaderMaterial({});
		let points: null | Points = null;

		function generatorGalaxy() {
			if (points) {
				bufferGeometry.dispose();
				pointsMaterial.dispose();
				scene.remove(points);
			}

			bufferGeometry = new BufferGeometry();
			pointsMaterial = new ShaderMaterial({
				depthWrite: false,
				transparent: true,
				vertexColors: true,
				vertexShader,
				fragmentShader,
				uniforms: {
					uTime: { value: 0 },
					uSize: { value: params.size * renderer.getPixelRatio() },
					uRadius: { value: params.radius },
				},
				blending: AdditiveBlending,
			});

			const position = new Float32Array(params.count * 3);
			const attrPosition = new BufferAttribute(position, 3);

			const color = new Float32Array(params.count * 3);
			const attrColor = new BufferAttribute(color, 3);

			const scales = new Float32Array(params.count);
			const attrScales = new BufferAttribute(scales, 1);

			const randomness = new Float32Array(params.count * 3);
			const attrRandomness = new BufferAttribute(randomness, 3);

			for (let i = 0; i < params.count; i++) {
				const i3 = i * 3;

				const radius = Math.random() * params.radius;

				const index = i % params.branches;

				const branchAngle = (index / params.branches) * Math.PI * 2;

				const randomX =
					Math.pow(Math.random(), params.randomnessPower) *
					(Math.random() < 0.5 ? 1 : -1) *
					params.randomness *
					radius;
				const randomY =
					Math.pow(Math.random(), params.randomnessPower) *
					(Math.random() < 0.5 ? 1 : -1) *
					params.randomness *
					radius;
				const randomZ =
					Math.pow(Math.random(), params.randomnessPower) *
					(Math.random() < 0.5 ? 1 : -1) *
					params.randomness *
					radius;

				randomness[i3 + 0] = randomX;
				randomness[i3 + 1] = randomY;
				randomness[i3 + 2] = randomZ;

				// Position
				position[i3 + 0] = Math.cos(branchAngle) * radius;
				position[i3 + 1] = 0;
				position[i3 + 2] = Math.sin(branchAngle) * radius;

				// Color
				const mixColor = params.insideColor.clone();
				mixColor.lerp(params.outsideColor, radius / params.radius);

				color[i3 + 0] = mixColor.r;
				color[i3 + 1] = mixColor.g;
				color[i3 + 2] = mixColor.b;

				// Scale
				scales[i] = Math.random();
			}

			bufferGeometry.setAttribute('position', attrPosition);
			bufferGeometry.setAttribute('color', attrColor);
			bufferGeometry.setAttribute('aScales', attrScales);
			bufferGeometry.setAttribute('aRandomness', attrRandomness);

			points = new Points(bufferGeometry, pointsMaterial);

			scene.add(points);
		}
		generatorGalaxy();

		/**
		 * Helper
		 */

		const axesHelper = new AxesHelper();
		scene.add(axesHelper);

		/**
		 * Pane
		 */

		const pane = new Pane({ title: 'Debug Params' });
		pane
			.addBinding(params, 'size', {
				label: 'Size',
				min: 0,
				max: 20,
				step: 0.1,
			})
			.on('change', generatorGalaxy);
		pane
			.addBinding(params, 'count', {
				label: 'Count',
				step: 100,
				min: 100,
				max: 100000,
			})
			.on('change', generatorGalaxy);
		pane
			.addBinding(params, 'radius', {
				label: 'Radius',
				step: 0.01,
				min: 1,
				max: 5,
			})
			.on('change', generatorGalaxy);
		pane
			.addBinding(params, 'branches', {
				label: 'Branches',
				step: 1,
				min: 1,
				max: 30,
			})
			.on('change', generatorGalaxy);
		pane
			.addBinding(params, 'randomness', {
				label: 'Randomness',
				step: 0.001,
				min: 0,
				max: 1,
			})
			.on('change', generatorGalaxy);
		pane
			.addBinding(params, 'randomnessPower', {
				label: 'Randomness Power',
				step: 1,
				min: 0,
				max: 10,
			})
			.on('change', generatorGalaxy);
		pane
			.addBinding(params, 'insideColor', {
				label: 'Inside Color',
				color: { type: 'float' },
			})
			.on('change', generatorGalaxy);
		pane
			.addBinding(params, 'outsideColor', {
				label: 'Outside Color',
				color: { type: 'float' },
			})
			.on('change', generatorGalaxy);

		/**
		 * Events
		 */

		function render(time: number = 0) {
			requestAnimationFrame(render);

			stats.update();
			controls.update(time);

			pointsMaterial.uniforms.uTime.value += 0.01;

			renderer.render(scene, camera);
		}
		render();

		function resize() {
			renderer.setSize(window.innerWidth, window.innerHeight);
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		}
		window.addEventListener('resize', resize);
	}, []);

	return <div id='container'></div>;
}
