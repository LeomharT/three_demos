import { useMantineTheme } from '@mantine/core';
import { useEffect } from 'react';
import {
	AxesHelper,
	BoxGeometry,
	Color,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	TextureLoader,
	WebGLRenderer,
} from 'three';
import {
	EffectComposer,
	OrbitControls,
	OutputPass,
	Reflector,
	RenderPass,
} from 'three/examples/jsm/Addons.js';
import { uv } from 'three/tsl';
import { Pane } from 'tweakpane';

console.log(uv);
export default function CarShow() {
	const theme = useMantineTheme();

	const initialThree = async () => {
		const el = document.querySelector('#container') as HTMLDivElement;

		/**
		 * Basic
		 */

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: false,
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(window.devicePixelRatio);
		el.append(renderer.domElement);

		const scene = new Scene();
		scene.background = new Color('black');

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

		/**
		 * Loaders
		 */

		const textureLoader = new TextureLoader();
		textureLoader.setPath('/src/pages/CarShow/assets/');

		/**
		 * Textures
		 */

		/**
		 * Effect
		 */

		const composer = new EffectComposer(renderer);
		composer.setSize(window.innerWidth, window.innerHeight);
		composer.setPixelRatio(window.devicePixelRatio);

		const renderPass = new RenderPass(scene, camera);
		composer.addPass(renderPass);

		const outputPass = new OutputPass();
		composer.addPass(outputPass);

		/**
		 * Scene
		 */

		const floorGeometry = new PlaneGeometry(20, 20, 32, 32);

		const reflector = new Reflector(floorGeometry, {
			textureWidth: window.innerWidth * window.devicePixelRatio,
			textureHeight: window.innerHeight * window.devicePixelRatio,
			color: 0xb5b5b5,
		});
		reflector.rotation.x = -Math.PI / 2;
		console.log(reflector.material);
		scene.add(reflector);

		const box = new Mesh(
			new BoxGeometry(1, 1, 1),
			new MeshBasicMaterial({ color: 'red' })
		);
		box.position.set(0, 2, 0);
		scene.add(box);

		/**
		 * Helpers
		 */

		const axesHelper = new AxesHelper();
		scene.add(axesHelper);

		/**
		 * Pane
		 */

		const pane = new Pane({ title: 'Debug Params' });

		/**
		 * Events
		 */

		function render(time: number = 0) {
			requestAnimationFrame(render);

			composer.render();
			controls.update(time);
		}
		render();

		function resize() {
			composer.setSize(window.innerWidth, window.innerHeight);
			renderer.setSize(window.innerWidth, window.innerHeight);
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		}
		window.addEventListener('resize', resize);
	};

	useEffect(() => {
		initialThree();
	}, []);

	return <div id='container'></div>;
}
