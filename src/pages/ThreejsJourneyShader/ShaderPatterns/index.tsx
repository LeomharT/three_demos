import { useEffect } from 'react';
import {
	Mesh,
	PCFSoftShadowMap,
	PerspectiveCamera,
	PlaneGeometry,
	RawShaderMaterial,
	Scene,
	TextureLoader,
	WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import fragmentShader from './shaders/fragment.glsl?raw';
import vertexShader from './shaders/vertex.glsl?raw';

export default function ShaderPatterns() {
	async function initailScene() {
		const el = document.querySelector('#container') as HTMLDivElement;

		/**
		 * Basic
		 */

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = PCFSoftShadowMap;
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setClearColor(0x000000);
		el.append(renderer.domElement);

		const scene = new Scene();

		const camera = new PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		camera.position.set(0, 0, 1);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		/**
		 * Loaders
		 */

		const textureLoader = new TextureLoader();
		textureLoader.setPath('/src/assets/texture/');

		/**
		 * Textures
		 */

		const alphaTexture = textureLoader.load('decal-diffuse.png');

		/**
		 * Scenes
		 */

		const uniforms = {
			uTexture: {
				value: alphaTexture,
			},
		};

		const planeGeometry = new PlaneGeometry(1, 1, 32, 32);
		const planeMaterial = new RawShaderMaterial({
			transparent: true,
			vertexShader,
			fragmentShader,
			uniforms,
		});
		const plane = new Mesh(planeGeometry, planeMaterial);
		scene.add(plane);

		/**
		 * Events
		 */

		function render(time: number = 0) {
			requestAnimationFrame(render);

			renderer.render(scene, camera);

			controls.update(time);
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
		initailScene();
	}, []);
	return <div id='container'></div>;
}
