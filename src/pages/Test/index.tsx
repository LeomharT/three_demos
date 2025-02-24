import { useMantineTheme } from '@mantine/core';
import { useEffect } from 'react';
import {
	AxesHelper,
	CubeTextureLoader,
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

const ASSETS_PATH = '/src/pages/ThreejsJourneyShader/CoffeeSmoke/assets/';

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
		textureLoader.setPath(ASSETS_PATH);

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

		const noiseTexture = await textureLoader.loadAsync('perlin.png');
		noiseTexture.wrapT = noiseTexture.wrapS = RepeatWrapping;
		/**
		 * Scene
		 */

		const uniforms = {
			uTime: new Uniform(0),
			uNoiseTexture: new Uniform(noiseTexture),
		};

		const smokeGeometry = new PlaneGeometry(1, 1, 16, 64);
		smokeGeometry.translate(0, 0.5, 0);
		smokeGeometry.scale(1.5, 6, 1.5);
		const smokeMaterial = new ShaderMaterial({
			fragmentShader,
			vertexShader,
			uniforms,
			transparent: true,
			side: DoubleSide,
			wireframe: false,
			depthWrite: false,
		});
		const smoke = new Mesh(smokeGeometry, smokeMaterial);
		scene.add(smoke);

		/**
		 * Pane
		 */

		const pane = new Pane({ title: 'Debug Params' });
		pane.element.parentElement!.style.width = '320px';
		pane.addBinding(smokeMaterial, 'wireframe');

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

			uniforms.uTime.value += 0.001;

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
