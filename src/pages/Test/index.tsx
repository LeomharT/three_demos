import { useMantineTheme } from '@mantine/core';
import { useEffect } from 'react';
import {
	AdditiveBlending,
	AxesHelper,
	BufferAttribute,
	BufferGeometry,
	Color,
	CubeTextureLoader,
	PerspectiveCamera,
	Points,
	Scene,
	ShaderMaterial,
	TextureLoader,
	WebGLRenderer,
} from 'three';
import {
	DRACOLoader,
	GLTFLoader,
	OrbitControls,
	RGBELoader,
} from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Pane } from 'tweakpane';
import fragmentShader from './shader/fragment.glsl?raw';
import vertexShader from './shader/vertex.glsl?raw';

export default function Test() {
	const theme = useMantineTheme();

	async function initialScene() {
		const el = document.querySelector('#container') as HTMLDivElement;

		/**
		 * Loader
		 */

		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath('node_modules/three/examples/jsm/libs/draco/');
		dracoLoader.setDecoderConfig({ type: 'js' });
		dracoLoader.preload();

		const gltfLoader = new GLTFLoader();
		gltfLoader.setPath('/src/assets/models/');
		gltfLoader.setDRACOLoader(dracoLoader);

		const textureLoader = new TextureLoader();
		textureLoader.setPath('/src/assets/texture/env/');

		const cubeTextureLoader = new CubeTextureLoader();
		cubeTextureLoader.setPath('/src/assets/texture/env/1/');

		const rgbeLoader = new RGBELoader();
		rgbeLoader.setPath('/src/assets/texture/env/');

		/**
		 * Basic
		 */

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setClearColor(theme.black);
		el.append(renderer.domElement);

		const scene = new Scene();

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
		controls.dampingFactor = 0.05;

		const stats = new Stats();
		el.append(stats.dom);

		/**
		 * Scene
		 */

		const params = {
			count: 20000,
			size: 10.0,
			radius: 5.0,
			branches: 3,
		};

		let pointsGeometry = new BufferGeometry();
		let pointsMaterial = new ShaderMaterial();
		let points: null | Points;

		const INSIDECOLOR = new Color('#ff6030');
		const OUTSIDECOLOR = new Color('#1b3984');

		function genetatorPoints() {
			if (points) {
				pointsGeometry.dispose();
				pointsMaterial.dispose();
				scene.remove(points);
			}

			const position = new Float32Array(params.count * 3);
			const attrPosition = new BufferAttribute(position, 3);

			const colors = new Float32Array(params.count * 3);
			const attrColor = new BufferAttribute(colors, 3);

			const random = new Float32Array(params.count);
			const attrRandom = new BufferAttribute(random, 1);

			pointsGeometry = new BufferGeometry();
			pointsGeometry.setAttribute('position', attrPosition);
			pointsGeometry.setAttribute('color', attrColor);
			pointsGeometry.setAttribute('aRandom', attrRandom);

			pointsMaterial = new ShaderMaterial({
				vertexShader,
				fragmentShader,
				uniforms: {
					uTime: { value: 0 },
					uSize: { value: params.size },
				},
				transparent: true,
				depthWrite: false,
				vertexColors: true,
				blending: AdditiveBlending,
			});

			for (let i = 0; i < params.count; i++) {
				const i3 = i * 3;

				const index = i % params.branches;

				const branchAngle = (index / params.branches) * Math.PI * 2;

				const radius = Math.random() * params.radius;

				position[i3 + 0] = Math.cos(branchAngle) * radius;
				position[i3 + 1] = 0;
				position[i3 + 2] = Math.sin(branchAngle) * radius;

				random[i] = Math.random();

				const mixColor = INSIDECOLOR.clone();
				mixColor.lerp(OUTSIDECOLOR, radius / params.radius);

				colors[i3 + 0] = mixColor.r;
				colors[i3 + 1] = mixColor.g;
				colors[i3 + 2] = mixColor.b;
			}

			points = new Points(pointsGeometry, pointsMaterial);
			scene.add(points);
		}
		genetatorPoints();

		/**
		 * Pane
		 */

		const pane = new Pane({ title: 'Debug Params' });
		pane.element.parentElement!.style.width = '320px';
		pane
			.addBinding(params, 'size', {
				label: 'Point Size',
				min: 20,
				max: 50,
			})
			.on('change', genetatorPoints);
		pane
			.addBinding(params, 'branches', {
				label: 'Point Branches',
				min: 1,
				max: 10,
				step: 1,
			})
			.on('change', genetatorPoints);

		/**
		 * Helpers
		 */

		const axesHelper = new AxesHelper();
		scene.add(axesHelper);

		/**
		 * Events
		 */

		function render(time: number = 0) {
			requestAnimationFrame(render);

			stats.update();
			controls.update(time);

			pointsMaterial.uniforms.uTime.value += 0.001;

			renderer.render(scene, camera);
		}
		render();

		function resize() {
			renderer.setSize(window.innerWidth, window.innerHeight);
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		}
		window.addEventListener('resize', resize);
	}

	useEffect(() => {
		initialScene();
	}, []);

	return <div id='container'></div>;
}
