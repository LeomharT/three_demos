import { useMantineTheme } from '@mantine/core';
import color from 'color-normalize';
import { useEffect } from 'react';
import {
	AxesHelper,
	FrontSide,
	Mesh,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	ShaderMaterial,
	WebGLRenderer,
} from 'three';
import { GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import fragmentShader from './shader/fragment.glsl?raw';
import vertexShader from './shader/vertex.glsl?raw';
export default function Test() {
	const theme = useMantineTheme();

	const initialScene = async () => {
		const el = document.querySelector('#container') as HTMLDivElement;

		/**
		 * Loaders
		 */

		const gltfLoader = new GLTFLoader();
		gltfLoader.setPath('/src/assets/models/');

		/**
		 * Basic
		 */

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setClearColor(theme.black);
		renderer.setSize(window.innerWidth, window.innerHeight);
		el.append(renderer.domElement);

		const scene = new Scene();

		const camera = new PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		camera.position.set(0, 1, 1);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		const stats = new Stats();
		el.append(stats.dom);

		/**
		 * Scenes
		 */

		const planeGeometry = new PlaneGeometry(1, 1, 128, 128);
		planeGeometry.rotateX(-Math.PI / 2);
		const planeMaterial = new ShaderMaterial({
			transparent: true,
			wireframe: true,
			vertexShader,
			side: FrontSide,
			fragmentShader,
			uniforms: {
				uColor: { value: color(theme.colors.blue[4]) },
			},
		});
		const plane = new Mesh(planeGeometry, planeMaterial);
		scene.add(plane);

		/**
		 * Lights
		 */

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

			// Update
			controls.update(time);
			stats.update();

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
