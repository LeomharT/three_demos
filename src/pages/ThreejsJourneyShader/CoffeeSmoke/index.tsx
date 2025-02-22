import { useEffect } from 'react';
import {
	Color,
	DoubleSide,
	Mesh,
	PerspectiveCamera,
	PlaneGeometry,
	RepeatWrapping,
	Scene,
	ShaderMaterial,
	TextureLoader,
	Uniform,
	WebGLRenderer,
} from 'three';
import { GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Pane } from 'tweakpane';
import fragmentShader from './shader/fragment.glsl?raw';
import vertexShader from './shader/vertex.glsl?raw';

const ASSETS_PATH = '/src/pages/ThreejsJourneyShader/CoffeeSmoke/assets/';

export default function CoffeeSmoke() {
	async function initialScene() {
		const el = document.querySelector('#container') as HTMLDivElement;

		/**
		 * Basic
		 */

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(window.devicePixelRatio);
		el.append(renderer.domElement);

		const scene = new Scene();
		scene.background = new Color(0x000000);

		const camera = new PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		camera.position.set(4, 4, 4);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		const stats = new Stats();
		el.append(stats.dom);

		/**
		 * Loaders
		 */

		const textureLoader = new TextureLoader();
		textureLoader.setPath(ASSETS_PATH);

		const gltfLoader = new GLTFLoader();
		gltfLoader.setPath(ASSETS_PATH);

		/**
		 * Textures
		 */

		const noiseTexture = textureLoader.load('perlin.png');
		noiseTexture.wrapS = noiseTexture.wrapT = RepeatWrapping;
		noiseTexture.repeat.set(10, 10);

		/**
		 * Scene
		 */

		const uniforms = {
			uTime: { value: 0 },
			uNoiseTexture: new Uniform(noiseTexture),
		};

		const smokeGeometry = new PlaneGeometry(1, 1, 16, 64);
		smokeGeometry.translate(0, 0.5, 0);
		smokeGeometry.scale(1.5, 6, 1.5);
		const smokeMaterial = new ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms,
			transparent: true,
			side: DoubleSide,
			wireframe: false,
		});
		const smoke = new Mesh(smokeGeometry, smokeMaterial);
		smoke.receiveShadow = true;
		smoke.position.y = 1.83;
		scene.add(smoke);

		gltfLoader.load('bakedModel.glb', (data) => {
			const mesh = data.scene;

			scene.add(mesh);
		});

		/**
		 * Pane
		 */

		const pane = new Pane({ title: 'Debug Params' });
		pane.element.parentElement!.style.width = '380px';
		pane.addBinding(smoke.position, 'y', {
			label: 'Smoke Position Y',
			step: 0.0001,
			min: 0,
			max: 10,
		});
		pane.addBinding(smokeMaterial, 'wireframe');

		/**
		 * Event
		 */

		function render(time: number = 0) {
			requestAnimationFrame(render);

			stats.update();
			controls.update(time);

			uniforms.uTime.value += 0.01;

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
