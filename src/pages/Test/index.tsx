import { useEffect } from 'react';
import {
	BackSide,
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
import earthFragmentShader from './shader/earth/fragment.glsl?raw';
import earthVertexShader from './shader/earth/vertex.glsl?raw';

import atmosphereFragmentShader from './shader/atmosphere/fragment.glsl?raw';
import atmosphereVertexShader from './shader/atmosphere/vertex.glsl?raw';
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
		camera.position.set(3, 0, 3);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		const stats = new Stats();
		stats.showPanel(0);
		el.append(stats.dom);

		/**
		 * Loaders
		 */

		const textureLoader = new TextureLoader();
		textureLoader.setPath(ASSETS_TEXTURE_PATH);

		/**
		 * Textures
		 */

		const earthDayTexture = textureLoader.load('earth/2k_earth_daymap.jpg');
		earthDayTexture.anisotropy = 8;
		earthDayTexture.colorSpace = SRGBColorSpace;

		const earthNightTexture = textureLoader.load('earth/2k_earth_nightmap.jpg');
		earthNightTexture.anisotropy = 8;
		earthNightTexture.colorSpace = SRGBColorSpace;

		const specularCloudTexture = textureLoader.load('earth/specularClouds.jpg');
		specularCloudTexture.anisotropy = 8;

		/**
		 * Scene
		 */

		const sunSpherical = new Spherical(1, Math.PI / 2, 0.5);
		const sunDirection = new Vector3();

		const uniforms = {
			// Sun
			uSunDirection: new Uniform(sunDirection),

			//Earth
			uEarthDayTexture: new Uniform(earthDayTexture),
			uEarthNightTexture: new Uniform(earthNightTexture),
			uSpecularCloudTexture: new Uniform(specularCloudTexture),

			uAtmosphereDayColor: new Uniform(new Color('#00aaff')),
			uAtmosphereTwilightColor: new Uniform(new Color('#ff6600')),
		};

		const earthGeometry = new SphereGeometry(2, 64, 64);
		const earthMaterial = new ShaderMaterial({
			vertexShader: earthVertexShader,
			fragmentShader: earthFragmentShader,
			uniforms,
			transparent: true,
		});
		const earth = new Mesh(earthGeometry, earthMaterial);
		// earth.visible = false;
		scene.add(earth);

		const atmosphereGeometry = new SphereGeometry(2, 64, 64);
		const atmosphereMaterial = new ShaderMaterial({
			vertexShader: atmosphereVertexShader,
			fragmentShader: atmosphereFragmentShader,
			uniforms,
			transparent: true,
			side: BackSide,
		});
		const atmosphere = new Mesh(atmosphereGeometry, atmosphereMaterial);
		atmosphere.scale.setScalar(1.04);
		scene.add(atmosphere);

		const sunGeometry = new IcosahedronGeometry(0.1, 3);
		const sunMaterial = new MeshBasicMaterial();
		const sun = new Mesh(sunGeometry, sunMaterial);
		scene.add(sun);

		function updateSun() {
			// Direction
			sunDirection.setFromSpherical(sunSpherical);

			// Update Sun
			sun.position.copy(sunDirection).multiplyScalar(5);

			// Uniforms
			uniforms.uSunDirection.value.copy(sunDirection);
		}
		updateSun();

		/**
		 * Pane
		 */

		const pane = new Pane({ title: '🚧 Debug Params 🚧' });
		pane.element.parentElement!.style.width = '380px';
		{
			const earthPane = pane.addFolder({ title: '🌏 Earth' });
		}
		{
			const sunPane = pane.addFolder({ title: '🌞 Sun' });
			sunPane
				.addBinding(sunSpherical, 'phi', {
					label: 'Sun Spherical Phi',
					step: 0.01,
					min: 0,
					max: Math.PI,
				})
				.on('change', updateSun);
			sunPane
				.addBinding(sunSpherical, 'theta', {
					label: 'Sun Spherical Theta',
					step: 0.01,
					min: -Math.PI,
					max: Math.PI,
				})
				.on('change', updateSun);
		}

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
