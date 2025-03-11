import { useMantineTheme } from '@mantine/core';
import { useEffect } from 'react';
import {
	AxesHelper,
	Color,
	CubeTextureLoader,
	IcosahedronGeometry,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	Scene,
	ShaderMaterial,
	SphereGeometry,
	Spherical,
	SRGBColorSpace,
	TextureLoader,
	Uniform,
	Vector3,
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
		textureLoader.setPath('/src/assets/texture/');

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
		scene.background = new Color(0x000011);

		const camera = new PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		camera.position.set(1.5, 1.5, 1.5);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;

		const stats = new Stats();
		el.append(stats.dom);

		/**
		 * Texture
		 */

		const earthDayMapTexture = textureLoader.load('earth/2k_earth_daymap.jpg');
		earthDayMapTexture.colorSpace = SRGBColorSpace;
		earthDayMapTexture.anisotropy = 8;

		const earthNightMapTexture = textureLoader.load('earth/2k_earth_nightmap.jpg');
		earthNightMapTexture.colorSpace = SRGBColorSpace;
		earthNightMapTexture.anisotropy = 8;

		/**
		 * Scene
		 */

		const sunSpherical = new Spherical(1, Math.PI / 2, 0.5);
		const sunDirection = new Vector3();

		const uniforms = {
			uEarthDayTexture: new Uniform(earthDayMapTexture),
			uEarthNightTexture: new Uniform(earthNightMapTexture),

			uSunDirection: new Uniform(sunDirection),
		};

		// Earth
		const earthGeometry = new SphereGeometry(1, 64, 64);
		const earthMaterial = new ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms,
		});
		const earth = new Mesh(earthGeometry, earthMaterial);
		scene.add(earth);

		// Sun
		const sun = new Mesh(new IcosahedronGeometry(0.1, 3), new MeshBasicMaterial());
		scene.add(sun);

		function updateSun() {
			sunDirection.setFromSpherical(sunSpherical);

			sun.position.copy(sunDirection).multiplyScalar(5.0);

			uniforms.uSunDirection.value.copy(sunDirection);
		}
		updateSun();

		/**
		 * Pane
		 */

		const pane = new Pane({ title: '🐞 Debug Params' });
		pane.element.parentElement!.style.width = '380px';

		{
			const sunPane = pane.addFolder({ title: 'Sun' });
			sunPane
				.addBinding(sunSpherical, 'phi', {
					label: 'Sun Phi',
					min: 0,
					max: Math.PI,
					step: 0.001,
				})
				.on('change', updateSun);
			sunPane
				.addBinding(sunSpherical, 'theta', {
					label: 'Sun Theta',
					min: 0,
					max: Math.PI * 2,
					step: 0.001,
				})
				.on('change', updateSun);
		}

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
