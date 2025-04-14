import { useEffect } from 'react';
import {
	Color,
	DirectionalLight,
	Mesh,
	MeshStandardMaterial,
	PCFSoftShadowMap,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	WebGLRenderer,
} from 'three';
import CustomShaderMaterial from 'three-custom-shader-material/vanilla';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Pane } from 'tweakpane';
import fragmentShader from './shader/fragment.glsl?raw';
import vertexShader from './shader/vertex.glsl?raw';

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
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = PCFSoftShadowMap;
		renderer.shadowMap.autoUpdate = true;
		el.append(renderer.domElement);

		const scene = new Scene();
		scene.background = new Color(0x000011);

		const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
		camera.position.set(3, 3, 3);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		const stats = new Stats();
		stats.showPanel(0);
		el.append(stats.dom);

		/**
		 * Loaders
		 */

		/**
		 * Textures
		 */

		/**
		 * Scene
		 */

		const uniforms = {};

		const planeGeometry = new PlaneGeometry(3, 3, 32, 32);
		planeGeometry.rotateX(-Math.PI / 2);

		const planeMaterial = new CustomShaderMaterial({
			baseMaterial: MeshStandardMaterial,
			fragmentShader,
			vertexShader,
			uniforms,
		});

		const plane = new Mesh(planeGeometry, planeMaterial);
		plane.castShadow = true;
		plane.receiveShadow = true;
		scene.add(plane);

		/**
		 * Light
		 */

		const directionalLigit = new DirectionalLight(0xffffff);
		directionalLigit.castShadow = true;
		directionalLigit.intensity = 2.0;
		directionalLigit.position.set(0, 2, 3);
		scene.add(directionalLigit);

		/**
		 * Pane
		 */

		const pane = new Pane({ title: '🚧 Debug Params 🚧' });
		pane.element.parentElement!.style.width = '380px';

		/**
		 * Events
		 */

		function render(time: number = 0) {
			requestAnimationFrame(render);

			stats.update();
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
