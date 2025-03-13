import { useEffect } from 'react';
import {
	ACESFilmicToneMapping,
	Color,
	PerspectiveCamera,
	PlaneGeometry,
	Points,
	Scene,
	ShaderMaterial,
	TextureLoader,
	Uniform,
	Vector2,
	WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import fragmentShader from './shader/fragment.glsl?raw';
import vertexShader from './shader/vertex.glsl?raw';

export default function ParticleCursor() {
	async function initialScene() {
		const el = document.querySelector('#container') as HTMLDivElement;
		const pixelRatio = Math.min(2, window.devicePixelRatio);

		/**
		 * Basic
		 */

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(pixelRatio);
		renderer.toneMapping = ACESFilmicToneMapping;
		el.append(renderer.domElement);

		const scene = new Scene();
		scene.background = new Color(0x000000);

		const camera = new PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		camera.position.set(0, 0, 18);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		/**
		 * Loaders
		 */

		const textureLoader = new TextureLoader();
		textureLoader.setPath('/src/assets/texture/picture/');

		/**
		 * Textures
		 */

		const particleTexture1 = textureLoader.load('picture-1.png');
		const particleTexture2 = textureLoader.load('picture-2.png');
		const particleTexture3 = textureLoader.load('picture-3.png');
		const particleTexture4 = textureLoader.load('picture-4.png');

		/**
		 * Scene
		 */

		const uniforms = {
			uPointSize: new Uniform(0.05),
			uResolution: new Uniform(
				new Vector2(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio)
			),
			uTexture: new Uniform(particleTexture1),
		};

		const particleGeometry = new PlaneGeometry(10, 10, 128, 128);
		const particleMaterial = new ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms,
			transparent: true,
		});
		const particles = new Points(particleGeometry, particleMaterial);
		scene.add(particles);

		/**
		 * Pane
		 */

		const pane = new Pane({ title: '🚧 Debug Params 🚧' });
		pane.element.parentElement!.style.width = '380px';
		{
			const pointPane = pane.addFolder({ title: '💠 Point' });
			pointPane.addBinding(uniforms.uPointSize, 'value', {
				label: 'Point Size',
				min: 0,
				max: 1,
				step: 0.001,
			});
		}

		/**
		 * Events
		 */

		function render(time: number = 0) {
			requestAnimationFrame(render);

			controls.update(time);

			renderer.render(scene, camera);
		}
		render();

		function resize() {
			renderer.setSize(window.innerWidth, window.innerHeight);

			uniforms.uResolution.value.set(
				window.innerWidth * pixelRatio,
				window.innerHeight * pixelRatio
			);

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
