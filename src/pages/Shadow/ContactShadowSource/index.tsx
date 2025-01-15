import { useMantineTheme } from '@mantine/core';
import { useEffect } from 'react';
import {
	AxesHelper,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	Raycaster,
	Scene,
	SphereGeometry,
	TextureLoader,
	Vector2,
	Vector3,
	WebGLRenderer,
} from 'three';
import {
	EffectComposer,
	OrbitControls,
	OutputPass,
	RenderPass,
} from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

export default function ContactShadowSource() {
	const theme = useMantineTheme();

	const initialScene = () => {
		const el = document.querySelector('#container') as HTMLDivElement;

		/**
		 * Basic
		 */

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.setClearColor(0x000000);
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(window.devicePixelRatio);
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
		controls.dampingFactor = 0.05;

		const stats = new Stats();
		el.append(stats.dom);

		/**
		 * Effect
		 */

		const composer = new EffectComposer(renderer);

		const renderPass = new RenderPass(scene, camera);
		composer.addPass(renderPass);

		const outputPass = new OutputPass();
		composer.addPass(outputPass);

		/**
		 * Loaders
		 */

		const textureLoader = new TextureLoader();
		textureLoader.setPath('/src/pages/Shadow/ContactShadow/assets/texture/');

		const alphaTexture = textureLoader.load('alpha.png');

		/**
		 * Raycaster
		 */

		const raycaster = new Raycaster();
		let rect = renderer.domElement.getBoundingClientRect();
		const pointer = new Vector2();
		let intersectPoint: undefined | Vector3;

		/**
		 * Scenes
		 */

		const floorGeometry = new PlaneGeometry(1, 1, 32, 32);
		const floorMaterial = new MeshBasicMaterial({
			wireframe: true,
			transparent: true,
			opacity: 0.1,
			color: 0xffee312,
		});
		const floor = new Mesh(floorGeometry, floorMaterial);
		scene.add(floor);

		const sphereGeometry = new SphereGeometry(0.01, 32, 32);
		const sphereMaterial = new MeshStandardMaterial({
			emissive: theme.colors.blue[4],
			// emissiveMap: alphaTexture,
			emissiveIntensity: 3.0,
		});
		const sphere = new Mesh(sphereGeometry, sphereMaterial);
		scene.add(sphere);

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
			rect = renderer.domElement.getBoundingClientRect();

			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		}
		window.addEventListener('resize', resize);

		function handlePointerMove(e: PointerEvent) {
			pointer.x = (e.clientX / rect.width) * 2 - 1;
			pointer.y = -(e.clientY / rect.height) * 2 + 1;

			raycaster.setFromCamera(pointer, camera);

			const intersects = raycaster.intersectObject(floor, true);
			intersectPoint = intersects[0]?.point;

			if (intersectPoint) {
				sphere.position.copy(intersectPoint);
			}
		}
		renderer.domElement.addEventListener('pointermove', handlePointerMove);
	};

	useEffect(() => {
		initialScene();
	}, []);

	return <div id='container'></div>;
}
