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

export default function Earth() {
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
		camera.position.set(3, 3, 3);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		const stats = new Stats();
		el.append(stats.dom);

		/**
		 * Loader
		 */

		const textureLoader = new TextureLoader();
		textureLoader.setPath('/src/assets/texture/earth/');

		/**
		 * Texture
		 */

		const earthDayTexture = textureLoader.load('2k_earth_daymap.jpg');
		earthDayTexture.colorSpace = SRGBColorSpace;

		const earthNightTexture = textureLoader.load('2k_earth_nightmap.jpg');
		earthNightTexture.colorSpace = SRGBColorSpace;

		const earthSpecularCloudsTexture = textureLoader.load('specularClouds.jpg');
		earthSpecularCloudsTexture.colorSpace = SRGBColorSpace;

		/**
		 * Scene
		 */

		const uniforms = {
			uDayMapTexture: new Uniform(earthDayTexture),
			uNightMapTexture: new Uniform(earthNightTexture),
			uSunDirection: new Uniform(new Vector3(0, 0, 1)),
		};

		const sunSpherical = new Spherical(1.0, Math.PI / 2, 0.5);
		const sunDirection = new Vector3();

		const sphereGeometry = new SphereGeometry(1.0, 64, 64);
		const earthMaterial = new ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms,
			transparent: true,
		});
		const earth = new Mesh(sphereGeometry, earthMaterial);
		scene.add(earth);

		const sun = new Mesh(new IcosahedronGeometry(0.1, 2), new MeshBasicMaterial());
		scene.add(sun);

		function updateSun() {
			// Sun Direction
			sunDirection.setFromSpherical(sunSpherical);

			// Debug
			sun.position.copy(sunDirection).multiplyScalar(3.0);

			// Uniform
			uniforms.uSunDirection.value.copy(sunDirection);
		}
		updateSun();

		/**
		 * Pane
		 */

		const pane = new Pane({ title: '🚧🚧🚧 Debug Params 🚧🚧🚧' });
		pane.element.parentElement!.style.width = '380px';
		{
			const earthPane = pane.addFolder({ title: '🌍 Earth' });
			earthPane.addBinding(earthMaterial, 'wireframe');
		}
		{
			const sunPane = pane.addFolder({ title: '🌞 Sun' });
			sunPane
				.addBinding(sunSpherical, 'phi', {
					label: 'Sun Phi',
					min: 0,
					max: Math.PI,
				})
				.on('change', updateSun);
			sunPane
				.addBinding(sunSpherical, 'theta', {
					label: 'Sun Theta',
					min: 0,
					max: Math.PI * 2,
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

			earth.rotation.y += 0.001;

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
