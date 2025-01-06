import { useMantineTheme } from '@mantine/core';
import { useEffect } from 'react';
import {
	Color,
	InstancedMesh,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	ShaderMaterial,
	TextureLoader,
	WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import fragmentShader from './shader/fragment.glsl?raw';
import vertexShader from './shader/vertex.glsl?raw';

export default function SpaceStation() {
	const theme = useMantineTheme();

	const initialScene = () => {
		const el = document.querySelector('#container') as HTMLDivElement;
		el.innerHTML = '';

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
		scene.background = new Color(theme.colors.dark[8]);

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
		controls.dampingFactor = 0.05;

		const stats = new Stats();
		el.append(stats.dom);

		/**
		 * Loader
		 */

		const textureLoader = new TextureLoader();
		textureLoader.setPath('/src/pages/SpaceStation/assets/texture');

		/**
		 * Textures
		 */

		const starAlphaTexture = textureLoader.load('/star-alpha.png');

		/**
		 * Variable
		 */

		const STAR_COUNT = 500;

		/**
		 * Scene
		 */

		const starGeometry = new PlaneGeometry(1, 0.05, 16, 16);
		const starMaterial = new ShaderMaterial({
			vertexShader,
			fragmentShader,
			transparent: true,
			uniforms: {
				u_texture: { value: starAlphaTexture },
			},
		});
		const star = new InstancedMesh(starGeometry, starMaterial, 1);

		scene.add(star);

		/**
		 * Events
		 */

		function render(time?: number) {
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
	};

	useEffect(() => {
		initialScene();
	}, []);

	return <div id='container'></div>;
}
