import { useEffect } from 'react';
import {
	Color,
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
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Pane } from 'tweakpane';
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
		camera.position.set(2, 2, 2);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		const statsFPS = new Stats();
		statsFPS.showPanel(0);
		el.append(statsFPS.dom);

		/**
		 * Loaders
		 */

		const textureLoader = new TextureLoader();
		textureLoader.setPath(ASSETS_TEXTURE_PATH);

		/**
		 * Textures
		 */

		const earthDayMapTexture = textureLoader.load('earth/2k_earth_daymap.jpg');
		earthDayMapTexture.colorSpace = SRGBColorSpace;
		earthDayMapTexture.anisotropy = 8;

		const earthNightMapTexture = textureLoader.load('earth/2k_earth_nightmap.jpg');

		const specularCloudsTexture = textureLoader.load('earth/specularClouds.jpg');

		/**
		 * Scene
		 */

		const sunSpherical = new Spherical(1, Math.PI / 2, 0.5);
		const sunDirection = new Vector3();

		const uniforms = {
			uEarthDayTexture: new Uniform(earthDayMapTexture),
			uEarthNightTexture: new Uniform(earthNightMapTexture),
			uSpecularCloudsTexture: new Uniform(specularCloudsTexture),

			uSunDirection: new Uniform(sunDirection),
		};

		const earthGeometry = new SphereGeometry(1, 32, 32);
		const earthMaterial = new ShaderMaterial({
			fragmentShader,
			vertexShader,
			uniforms,
		});
		const earth = new Mesh(earthGeometry, earthMaterial);
		scene.add(earth);

		const sunGeometry = new IcosahedronGeometry(0.1, 3);
		const sunMaterial = new MeshBasicMaterial();
		const sun = new Mesh(sunGeometry, sunMaterial);
		scene.add(sun);

		function updateSun() {
			// Position
			sunDirection.setFromSpherical(sunSpherical);

			// Debug
			sun.position.copy(sunDirection).multiplyScalar(3);

			// Uniform
			uniforms.uSunDirection.value.copy(sunDirection);
		}
		updateSun();

		/**
		 * Pane
		 */

		const pane = new Pane({ title: 'Debug Params' });
		pane.element.parentElement!.style.width = '380px';
		// Earth Params
		{
			const earthPane = pane.addFolder({ title: '🌏 Earth' });
		}
		// Sun Params
		{
			const sunPane = pane.addFolder({ title: '🌞 Sun' });
			sunPane
				.addBinding(sunSpherical, 'radius', {
					label: 'Sun Spherical Radius',
					min: 0,
					max: 5,
					step: 0.001,
				})
				.on('change', updateSun);
			sunPane
				.addBinding(sunSpherical, 'phi', {
					label: 'Sun Spherical Phi',
					min: 0,
					max: Math.PI,
					step: 0.001,
				})
				.on('change', updateSun);
			sunPane
				.addBinding(sunSpherical, 'theta', {
					label: 'Sun Spherical Theta',
					min: 0,
					max: Math.PI * 2,
					step: 0.001,
				})
				.on('change', updateSun);
		}

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
