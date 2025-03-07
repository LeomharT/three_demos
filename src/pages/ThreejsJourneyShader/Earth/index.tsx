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
import atomsphereFragmentShader from './shader/atomsphere/fragment.glsl?raw';
import atomsphereVertexShader from './shader/atomsphere/vertex.glsl?raw';
import earthFragmentShader from './shader/earth/fragment.glsl?raw';
import earthVertexShader from './shader/earth/vertex.glsl?raw';
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
		scene.background = new Color(0x000011);

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
		// Sharper Texture
		earthDayTexture.anisotropy = 8;

		const earthNightTexture = textureLoader.load('2k_earth_nightmap.jpg');
		earthNightTexture.colorSpace = SRGBColorSpace;
		earthNightTexture.anisotropy = 8;

		const earthSpecularCloudsTexture = textureLoader.load('specularClouds.jpg');
		earthSpecularCloudsTexture.colorSpace = SRGBColorSpace;
		earthSpecularCloudsTexture.anisotropy = 8;

		/**
		 * Scene
		 */

		const uniforms = {
			uTextureMixEdge0: new Uniform(-0.25),
			uTextureMixEdge1: new Uniform(0.5),
			uCloudsVolume: new Uniform(0.7),

			uDayMapTexture: new Uniform(earthDayTexture),
			uNightMapTexture: new Uniform(earthNightTexture),
			uSpecularCloudsTexture: new Uniform(earthSpecularCloudsTexture),

			uSunDirection: new Uniform(new Vector3(0, 0, 1)),

			uAtmosphereDayColor: new Uniform(new Color('#00aaff')),
			uAtmosphereTwilightColor: new Uniform(new Color('#ff6600')),
		};

		const sunSpherical = new Spherical(1.0, Math.PI / 2, 0.5);
		const sunDirection = new Vector3();

		const sphereGeometry = new SphereGeometry(1.0, 64, 64);
		const earthMaterial = new ShaderMaterial({
			uniforms,
			vertexShader: earthVertexShader,
			fragmentShader: earthFragmentShader,
			transparent: true,
		});
		const earth = new Mesh(sphereGeometry, earthMaterial);
		scene.add(earth);

		const atomsphereMaterial = new ShaderMaterial({
			uniforms,
			transparent: true,
			side: BackSide,
			vertexShader: atomsphereVertexShader,
			fragmentShader: atomsphereFragmentShader,
		});
		const atomsphere = new Mesh(sphereGeometry, atomsphereMaterial);
		atomsphere.scale.multiplyScalar(1.04);
		scene.add(atomsphere);

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
			earthPane.addBinding(uniforms.uTextureMixEdge0, 'value', {
				label: 'Mix Color Remap Edge 0',
				step: 0.001,
				min: -1,
				max: 1,
			});
			earthPane.addBinding(uniforms.uTextureMixEdge1, 'value', {
				label: 'Mix Color Remap Edge 1',
				step: 0.001,
				min: -1,
				max: 1,
			});
			earthPane
				.addBinding(uniforms.uAtmosphereDayColor, 'value', {
					label: 'Day Color',
					color: { type: 'float' },
				})
				.on('change', (val) => uniforms.uAtmosphereDayColor.value.set(val.value));

			earthPane
				.addBinding(uniforms.uAtmosphereTwilightColor, 'value', {
					label: 'Twilight Color',
					color: { type: 'float' },
				})
				.on('change', (val) => uniforms.uAtmosphereTwilightColor.value.set(val.value));
		}
		{
			const cloudsPane = pane.addFolder({ title: '🌥️ Clouds' });
			cloudsPane.addBinding(uniforms.uCloudsVolume, 'value', {
				label: 'Clouds Volume',
				min: 0,
				max: 1,
				step: 0.001,
			});
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
