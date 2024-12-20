import { useMantineTheme } from '@mantine/core';
import { useEffect } from 'react';
import {
	AmbientLight,
	AxesHelper,
	CameraHelper,
	DirectionalLight,
	DirectionalLightHelper,
	Mesh,
	MeshStandardMaterial,
	PCFSoftShadowMap,
	PerspectiveCamera,
	PlaneGeometry,
	RepeatWrapping,
	Scene,
	SphereGeometry,
	SRGBColorSpace,
	TextureLoader,
	WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Pane } from 'tweakpane';

export default function ThreejsJourneyShadow() {
	const theme = useMantineTheme();

	const initialScene = async () => {
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
		renderer.setClearColor(theme.colors.dark[9]);
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = PCFSoftShadowMap;
		el.append(renderer.domElement);

		const scene = new Scene();

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
		controls.dampingFactor = 0.05;

		const stats = new Stats();
		el.append(stats.dom);

		/**
		 * Loaders
		 */

		const textureLoader = new TextureLoader();
		textureLoader.setPath('/src/pages/Shadow/ThreejsJourneyShadow/assets/');

		/**
		 * Textures
		 */

		const sphereColorTexture = await textureLoader.loadAsync(
			'metal_grate_rusty_diff_1k.jpg'
		);
		sphereColorTexture.colorSpace = SRGBColorSpace;
		const sphereARMTexture = await textureLoader.loadAsync(
			'metal_grate_rusty_arm_1k.jpg'
		);
		const sphereNormalTexture = await textureLoader.loadAsync(
			'metal_grate_rusty_nor_gl_1k.jpg'
		);
		const sphereDisplacementTexture = await textureLoader.loadAsync(
			'metal_grate_rusty_disp_1k.jpg'
		);
		for (const texture of [
			sphereColorTexture,
			sphereARMTexture,
			sphereDisplacementTexture,
			sphereNormalTexture,
		]) {
			texture.repeat.x = 6;
			texture.repeat.y = 3;

			texture.wrapS = texture.wrapT = RepeatWrapping;
		}

		/**
		 * Scenes
		 */

		const floorGeometry = new PlaneGeometry(10, 10, 16, 16);
		floorGeometry.rotateX(-Math.PI / 2);
		const floorMaterial = new MeshStandardMaterial();
		const floor = new Mesh(floorGeometry, floorMaterial);
		floor.receiveShadow = true;
		scene.add(floor);

		const sphereGeometry = new SphereGeometry(1, 512, 512);
		const sphereMateral = new MeshStandardMaterial({
			map: sphereColorTexture,
			normalMap: sphereNormalTexture,
			displacementMap: sphereDisplacementTexture,
			displacementScale: 0.2,
			aoMap: sphereARMTexture,
			metalnessMap: sphereARMTexture,
			metalness: 0.5,
			roughness: 0.5,
			roughnessMap: sphereARMTexture,
		});
		sphereMateral.flatShading = true;
		const sphere = new Mesh(sphereGeometry, sphereMateral);
		sphere.castShadow = true;
		sphere.receiveShadow = true;
		sphere.position.y = 1.5;
		scene.add(sphere);

		/**
		 * Lights
		 */

		const ambientLight = new AmbientLight();
		ambientLight.intensity = 1;
		scene.add(ambientLight);

		const directionalLight = new DirectionalLight();
		directionalLight.position.set(0, 3, 0);
		directionalLight.intensity = 1;
		directionalLight.castShadow = true;
		directionalLight.shadow.mapSize.set(256, 256);
		directionalLight.shadow.camera.top = 8;
		directionalLight.shadow.camera.right = 8;
		directionalLight.shadow.camera.bottom = -8;
		directionalLight.shadow.camera.left = -8;
		scene.add(directionalLight);

		/**
		 * Helpers
		 */

		const axesHelper = new AxesHelper();
		scene.add(axesHelper);

		const directionalLightHelper = new DirectionalLightHelper(directionalLight, 2);
		scene.add(directionalLightHelper);

		const cameraHelper = new CameraHelper(directionalLight.shadow.camera);
		scene.add(cameraHelper);

		/**
		 * Pane
		 */

		const pane = new Pane({ title: 'Debug Params' });
		// Sphere Material
		{
			const sphereMaterialPane = pane.addFolder({ title: 'Sphere Material' });
			sphereMaterialPane.addBinding(sphereMateral, 'roughness', {
				step: 0.01,
				min: 0,
				max: 1,
			});
			sphereMaterialPane.addBinding(sphereMateral, 'metalness', {
				step: 0.01,
				min: 0,
				max: 1,
			});
		}
		// Ambient Light
		{
			const ambientLightPane = pane.addFolder({ title: 'Ambient Light' });
			ambientLightPane.addBinding(ambientLight, 'intensity', {
				step: 0.01,
				min: 0,
				max: 10,
			});
			ambientLightPane.addBinding(ambientLight, 'color', {
				color: {
					type: 'float',
				},
			});
		}
		// Directional Light
		{
			const directionalLightPane = pane.addFolder({ title: 'Directional Light' });
			directionalLightPane.addBinding(directionalLightHelper, 'visible');
			directionalLightPane.addBinding(directionalLight, 'intensity', {
				step: 0.01,
				min: 0,
				max: 10,
			});
			directionalLightPane.addBinding(directionalLight, 'color', {
				color: {
					type: 'float',
				},
			});
			directionalLightPane
				.addBinding(directionalLight, 'position')
				.on('change', () => directionalLightHelper.update());
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
