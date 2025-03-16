import { useEffect } from 'react';
import {
	Color,
	Mesh,
	PerspectiveCamera,
	Scene,
	ShaderMaterial,
	SphereGeometry,
	WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import fragmentShader from './shader/fragment.glsl?raw';
import vertexShader from './shader/vertex.glsl?raw';

const ASSETS_TEXTURE_PATH = '/src/assets/texture/';

export default function Test() {
	function initialScene() {
		const el = document.querySelector('#container') as HTMLDivElement;

		const sizes = {
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
		renderer.setSize(sizes.width, sizes.height);
		renderer.setPixelRatio(sizes.pixelRatio);
		el.append(renderer.domElement);

		const scene = new Scene();
		scene.background = new Color(0x000011);

		const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
		camera.position.set(3, 3, 3);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		const statsFPS = new Stats();
		statsFPS.showPanel(0);
		el.append(statsFPS.dom);

		/**
		 * Scene
		 */

		const uniforms = {};

		const earthGeometry = new SphereGeometry(1, 32, 32);
		const earthMaterial = new ShaderMaterial({
			fragmentShader,
			vertexShader,
			uniforms,
		});
		const earth = new Mesh(earthGeometry, earthMaterial);
		scene.add(earth);

		/**
		 * Events
		 */

		function render(time: number = 0) {
			requestAnimationFrame(render);

			statsFPS.update();
			controls.update(time);

			renderer.render(scene, camera);
		}
		render();

		function resize() {
			sizes.width = window.innerWidth;
			sizes.height = window.innerHeight;
			sizes.pixelRatio = Math.min(2, window.devicePixelRatio);

			renderer.setSize(sizes.width, sizes.height);
			camera.aspect = sizes.width / sizes.height;
			camera.updateProjectionMatrix();
		}
		window.addEventListener('resize', resize);
	}

	useEffect(() => {
		initialScene();
	}, []);

	return <div id='container'></div>;
}
