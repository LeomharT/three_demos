import { useMantineTheme } from '@mantine/core';
import { useEffect } from 'react';
import {
	AmbientLight,
	AxesHelper,
	CameraHelper,
	DirectionalLight,
	DirectionalLightHelper,
	EquirectangularRefractionMapping,
	Mesh,
	MeshPhysicalMaterial,
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
import {
	EffectComposer,
	LUTCubeLoader,
	LUTPass,
	OrbitControls,
	OutputPass,
	RenderPass,
	RGBELoader,
} from 'three/examples/jsm/Addons.js';
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
		 * Effect
		 */

		const composer = new EffectComposer(renderer);

		const renderPass = new RenderPass(scene, camera);
		composer.addPass(renderPass);

		const lutPass = new LUTPass({});
		const lutLoader = new LUTCubeLoader();
		lutLoader.setPath('/src/pages/Shadow/ThreejsJourneyShadow/assets/texture/');
		lutLoader.load('cubicle-99.CUBE', (data) => {
			lutPass.lut = data.texture3D;
			lutPass.intensity = 0.75;
			composer.addPass(lutPass);
		});

		const outputPass = new OutputPass();
		composer.addPass(outputPass);

		/**
		 * Loaders
		 */

		const textureLoader = new TextureLoader();
		textureLoader.setPath('/src/pages/Shadow/ThreejsJourneyShadow/assets/texture/');

		const rgbeLoader = new RGBELoader();
		rgbeLoader.setPath('/src/pages/Shadow/ThreejsJourneyShadow/assets/texture/');

		/**
		 * Textures
		 */

		const sphereColorTexture = textureLoader.load('terrazo.png');
		sphereColorTexture.colorSpace = SRGBColorSpace;
		sphereColorTexture.wrapS = sphereColorTexture.wrapT = RepeatWrapping;
		sphereColorTexture.repeat.set(1.5, 1.5);

		const environmentMap = rgbeLoader.load('kiara_1_dawn_1k.hdr', (texture) => {
			scene.background = texture;
			scene.backgroundBlurriness = 0.6;
			scene.background.mapping = EquirectangularRefractionMapping;
		});

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
		const sphereMateral = new MeshPhysicalMaterial({
			map: sphereColorTexture,
			metalness: 0.5,
			roughness: 0,
			clearcoat: 1,
			clearcoatRoughness: 0,
			envMap: environmentMap,
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
		directionalLight.position.set(0, 10, 0);
		directionalLight.intensity = 1;
		directionalLight.castShadow = true;
		directionalLight.shadow.mapSize.set(256, 256);
		directionalLight.shadow.camera.top = 5;
		directionalLight.shadow.camera.right = 5;
		directionalLight.shadow.camera.bottom = -5;
		directionalLight.shadow.camera.left = -5;
		directionalLight.shadow.camera.near = 0.01;
		directionalLight.shadow.camera.far = 10.1;
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

			composer.render();
		}
		render();

		function resize() {
			renderer.setSize(window.innerWidth, window.innerHeight);
			composer.setSize(window.innerWidth, window.innerHeight);

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
