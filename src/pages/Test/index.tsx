import { useEffect } from 'react';
import {
	BackSide,
	Color,
	IcosahedronGeometry,
	Mesh,
	MeshBasicMaterial,
	PCFSoftShadowMap,
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
import atmosphereFragmentShader from './shader/atmosphere/fragment.glsl?raw';
import atmosphereVertexShader from './shader/atmosphere/vertex.glsl?raw';
import earthFragmentShader from './shader/earth/fragment.glsl?raw';
import earthVertexShader from './shader/earth/vertex.glsl?raw';

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

		const textureLoader = new TextureLoader();
		textureLoader.setPath('/src/assets/texture/earth/');

		/**
		 * Textures
		 */

		const earthDayTexture = textureLoader.load('2k_earth_daymap.jpg');
		earthDayTexture.colorSpace = SRGBColorSpace;
		earthDayTexture.anisotropy = 8;

		const earthNightTexture = textureLoader.load('2k_earth_nightmap.jpg');
		earthNightTexture.colorSpace = SRGBColorSpace;
		earthNightTexture.anisotropy = 8;

		const specularCloudsTexture = textureLoader.load('specularClouds.jpg');
		specularCloudsTexture.anisotropy = 8;

		/**
		 * Scene
		 */

		const uniforms = {
			uEarthDayTexture: new Uniform(earthDayTexture),
			uEarthNightTexture: new Uniform(earthNightTexture),
			uSpecularCloudTexture: new Uniform(specularCloudsTexture),

			uSunDirection: new Uniform(new Vector3()),

			uAtmosphereDayColor: new Uniform(new Color('#00aaff')),
			uAtmosphereTwilightColor: new Uniform(new Color('#ff6600')),
		};

		const sunSpherical = new Spherical(1, Math.PI / 2, 0.5);
		const sunDirection = new Vector3();

		const sun = new Mesh(
			new IcosahedronGeometry(0.1, 5),
			new MeshBasicMaterial({
				color: 0xffffff,
			})
		);
		scene.add(sun);

		function updateSun() {
			sunDirection.setFromSpherical(sunSpherical);

			sun.position.copy(sunDirection).multiplyScalar(5.0);

			uniforms.uSunDirection.value.copy(sunDirection);
		}
		updateSun();

		const earthGeometry = new SphereGeometry(2, 64, 64);
		const earthMaterial = new ShaderMaterial({
			vertexShader: earthVertexShader,
			fragmentShader: earthFragmentShader,
			uniforms,
		});
		const earth = new Mesh(earthGeometry, earthMaterial);
		scene.add(earth);

		const atmosphereGeometry = new SphereGeometry(2, 64, 64);
		const atmosphereMaterial = new ShaderMaterial({
			transparent: true,
			vertexShader: atmosphereVertexShader,
			fragmentShader: atmosphereFragmentShader,
			uniforms,
			side: BackSide,
		});
		const atmosphere = new Mesh(atmosphereGeometry, atmosphereMaterial);
		atmosphere.scale.setScalar(1.04);
		scene.add(atmosphere);

		/**
		 * Pane
		 */

		const pane = new Pane({ title: '🚧 Debug Params 🚧' });
		pane.element.parentElement!.style.width = '380px';
		// Earth Pane
		const earthPane = pane.addFolder({ title: '🌎 Earth' });

		// Sun Pane
		const sunPane = pane.addFolder({ title: '🌞 Sun' });
		sunPane
			.addBinding(sunSpherical, 'phi', {
				label: 'Sun Direction Phi',
				min: 0,
				max: Math.PI,
				step: 0.01,
			})
			.on('change', updateSun);
		sunPane
			.addBinding(sunSpherical, 'theta', {
				label: 'Sun Direction Theta',
				min: -Math.PI,
				max: Math.PI,
				step: 0.01,
			})
			.on('change', updateSun);

		/**
		 * Events
		 */

		function render(time: number = 0) {
			requestAnimationFrame(render);

			stats.update();
			controls.update(time);

			earth.rotation.y += 0.001;

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
