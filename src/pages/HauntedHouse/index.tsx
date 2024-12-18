import { useMantineTheme } from '@mantine/core';
import { useEffect } from 'react';
import {
	AmbientLight,
	AxesHelper,
	BoxGeometry,
	ConeGeometry,
	DirectionalLight,
	DirectionalLightHelper,
	Group,
	LoadingManager,
	Mesh,
	MeshStandardMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	RepeatWrapping,
	Scene,
	SphereGeometry,
	SRGBColorSpace,
	TextureLoader,
	Vector3,
	WebGLRenderer,
} from 'three';
import { OrbitControls, Sky } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Pane } from 'tweakpane';

export default function HauntedHouse() {
	const theme = useMantineTheme();

	const initialScene = async () => {
		const el = document.querySelector('#container') as HTMLDivElement;
		el.innerHTML = '';

		/**
		 * Basic
		 */

		const renderer = new WebGLRenderer({ alpha: true, antialias: true });
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setClearColor(theme.colors.dark[7]);
		el.append(renderer.domElement);

		const scene = new Scene();

		const camera = new PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			500
		);
		camera.position.set(5, 5, 5);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;

		const stats = new Stats();
		el.append(stats.dom);

		/**
		 * Loader
		 */

		const loadingManager = new LoadingManager();
		loadingManager.onStart = () => {
			console.log('Loading start ');
		};
		loadingManager.onLoad = () => {
			console.log('Load success!!!');
		};
		loadingManager.onError = () => {
			console.log('Loading error');
		};
		loadingManager.onProgress = () => {
			console.log('Loading...');
		};

		const textureLoader = new TextureLoader(loadingManager);
		textureLoader.setPath('/src/pages/HauntedHouse/assets/');

		/**
		 * Textures
		 */

		// Floor
		const floorAlphaTexture = await textureLoader.loadAsync('floor/alpha.jpg');
		const floorColorTexture = await textureLoader.loadAsync(
			'floor/coast_sand_rocks_02_diff_1k.jpg'
		);
		floorColorTexture.colorSpace = SRGBColorSpace;
		const floorDisplacementTexture = await textureLoader.loadAsync(
			'floor/coast_sand_rocks_02_disp_1k.jpg'
		);
		const floorNormalTexture = await textureLoader.loadAsync(
			'floor/coast_sand_rocks_02_nor_gl_1k.jpg'
		);
		// ARMT A = ao R = rough M = Metal
		const floorARMTexture = await textureLoader.loadAsync(
			'floor/coast_sand_rocks_02_arm_1k.jpg'
		);
		for (const texture of [
			floorARMTexture,
			floorColorTexture,
			floorDisplacementTexture,
			floorNormalTexture,
		]) {
			texture.wrapS = texture.wrapT = RepeatWrapping;
			texture.repeat.set(8, 8);
		}

		// Walls
		const wallsColorTexture = await textureLoader.loadAsync(
			'walls/castle_brick_broken_06_diff_1k.jpg'
		);
		wallsColorTexture.colorSpace = SRGBColorSpace;
		const wallsNormalTexture = await textureLoader.loadAsync(
			'walls/castle_brick_broken_06_nor_gl_1k.jpg'
		);
		const wallsARMTexture = await textureLoader.loadAsync(
			'walls/castle_brick_broken_06_arm_1k.jpg'
		);

		/**
		 * Scene
		 */

		// Floor
		const floorGeometry = new PlaneGeometry(20, 20, 100, 100);
		floorGeometry.rotateX(-Math.PI / 2);
		const floorMaterial = new MeshStandardMaterial({
			transparent: true,
			alphaMap: floorAlphaTexture,
			map: floorColorTexture,
			aoMap: floorARMTexture,
			roughnessMap: floorARMTexture,
			metalnessMap: floorARMTexture,
			normalMap: floorNormalTexture,
			displacementMap: floorDisplacementTexture,
			displacementBias: -0.2,
			displacementScale: 0.3,
		});
		const floor = new Mesh(floorGeometry, floorMaterial);
		scene.add(floor);

		// House container

		// Walls
		const wallsGeometry = new BoxGeometry(4, 2.5, 4);
		wallsGeometry.translate(0, 1.25, 0);
		const wallsMaterial = new MeshStandardMaterial({
			map: wallsColorTexture,
			aoMap: wallsARMTexture,
			roughnessMap: wallsARMTexture,
			metalnessMap: wallsARMTexture,
			normalMap: wallsNormalTexture,
		});
		const walls = new Mesh(wallsGeometry, wallsMaterial);
		// Roof
		const roofGeometry = new ConeGeometry(3.5, 1.5, 4, 1);
		const roofMaterial = new MeshStandardMaterial({});
		const roof = new Mesh(roofGeometry, roofMaterial);
		roof.position.y = 2.5 + 1.5 / 2;
		roof.rotation.y = Math.PI / 4;
		// Door
		const doorGeometry = new PlaneGeometry(2.2, 2.2);
		const doorMaterial = new MeshStandardMaterial({ color: 'red' });
		const door = new Mesh(doorGeometry, doorMaterial);
		door.position.y = 2.2 / 2;
		door.position.z = 4 / 2 + 0.01;
		// Bushes
		const bushGeometry = new SphereGeometry(1, 16, 16);
		const bushMaterial = new MeshStandardMaterial({});
		const bush1 = new Mesh(bushGeometry, bushMaterial);
		bush1.scale.setScalar(0.5);
		bush1.position.set(0.8, 0.2, 2.2);

		const bush2 = bush1.clone();
		bush2.scale.setScalar(0.25);
		bush2.position.set(1.4, 0.1, 2.1);

		const bush3 = bush1.clone();
		bush3.scale.setScalar(0.4);
		bush3.position.set(-0.8, 0.1, 2.2);

		const bush4 = bush1.clone();
		bush4.scale.setScalar(0.15);
		bush4.position.set(-1, 0.05, 2.6);

		// Garves
		const garveGeometry = new BoxGeometry(0.6, 0.8, 0.2);
		const graveMaterial = new MeshStandardMaterial({
			color: 'yellow',
		});
		const garves = new Group();

		for (let i = 0; i < 30; i++) {
			const angle = Math.random() * Math.PI * 2;
			const radius = 3 + Math.random() * 4;
			const x = Math.cos(angle) * radius;
			const y = Math.random() * 0.4;
			const z = Math.sin(angle) * radius;

			const grave = new Mesh(garveGeometry, graveMaterial);
			grave.position.x = x;
			grave.position.y = y;
			grave.position.z = z;

			grave.rotation.x = (Math.random() - 0.5) * 0.4;
			grave.rotation.y = (Math.random() - 0.5) * 0.4;
			grave.rotation.z = (Math.random() - 0.5) * 0.4;

			// Add to graves group
			garves.add(grave);
		}
		scene.add(garves);

		const house = new Group();
		house.add(walls);
		house.add(roof);
		house.add(door);
		house.add(bush1, bush2, bush3, bush4);
		scene.add(house);

		/**
		 * Sky
		 */

		const effectController = {
			radius: 1,
			phi: 0,
			theta: 0,
			scale: 20,
			turbidity: 10,
			rayleigh: 0.5,
			mieCoefficient: 0.005,
			mieDirectionalG: 0.8,
		};
		const sky = new Sky();
		function updateSky() {
			sky.scale.setScalar(effectController.scale);
			const sunPosition = new Vector3().setFromSphericalCoords(
				effectController.radius,
				effectController.phi,
				effectController.theta
			);
			sky.material.uniforms['sunPosition'].value = sunPosition;
			sky.material.uniforms['turbidity'].value = effectController.turbidity;
			sky.material.uniforms['rayleigh'].value = effectController.rayleigh;
			sky.material.uniforms['mieCoefficient'].value = effectController.mieCoefficient;
			sky.material.uniforms['mieDirectionalG'].value = effectController.mieDirectionalG;
		}
		updateSky();
		// scene.add(sky);

		/**
		 * Lights
		 */

		const ambientLight = new AmbientLight();
		scene.add(ambientLight);

		const directionalLight = new DirectionalLight();
		directionalLight.scale.setScalar(1);
		directionalLight.position.x = 5.0;
		directionalLight.position.z = -5.0;
		scene.add(directionalLight);
		scene.add(directionalLight.target);

		/**
		 * Helpers
		 */

		const axesHelper = new AxesHelper();
		scene.add(axesHelper);

		const directionalLightHelper = new DirectionalLightHelper(directionalLight);
		directionalLightHelper.visible = true;
		scene.add(directionalLightHelper);

		/**
		 * Pane
		 */

		const pane = new Pane({ title: 'Debug Params' });
		// Ambient Light
		{
			const ambientPane = pane.addFolder({ title: 'Ambient Light' });
			ambientPane.addBinding(ambientLight, 'intensity', {
				min: 0,
				max: 10,
				step: 0.1,
			});
		}
		// Floor Material
		{
			const floorMaterialPane = pane.addFolder({ title: 'Floor Material' });
			floorMaterialPane.addBinding(floorMaterial, 'roughness', {
				min: 0,
				max: 1,
				step: 0.1,
			});
			floorMaterialPane.addBinding(floorMaterial, 'metalness', {
				min: 0,
				max: 1,
				step: 0.1,
			});
			floorMaterialPane.addBinding(floorMaterial, 'displacementScale', {
				min: 0,
				max: 1,
				step: 0.01,
			});
			floorMaterialPane.addBinding(floorMaterial, 'displacementBias', {
				min: -1,
				max: 1,
				step: 0.01,
			});
		}
		// DirectionalLight
		{
			const directionalLightPane = pane.addFolder({ title: 'Directional Light' });
			directionalLightPane.addBinding(directionalLightHelper, 'visible', {
				label: 'helper visible',
			});
			directionalLightPane.addBinding(directionalLight, 'color', {
				color: { type: 'float' },
			});
			directionalLightPane.addBinding(directionalLight, 'intensity', {
				min: 0,
				max: 10,
				step: 0.1,
			});
			directionalLightPane
				.addBinding(directionalLight, 'position')
				.on('change', () => directionalLightHelper.update());
		}
		// Sky
		{
			const skyPane = pane.addFolder({ title: 'Sky' });
			skyPane
				.addBinding(effectController, 'radius', {
					label: 'radius',
					min: 0,
					max: 100,
				})
				.on('change', updateSky);
			skyPane
				.addBinding(effectController, 'phi', {
					min: -Math.PI / 2,
					max: Math.PI / 2,
					step: 0.1,
				})
				.on('change', updateSky);
			skyPane
				.addBinding(effectController, 'theta', {
					min: -Math.PI,
					max: Math.PI,
					step: 0.1,
				})
				.on('change', updateSky);
			skyPane
				.addBinding(effectController, 'turbidity', {
					min: 0,
					max: 50,
					step: 0.01,
				})
				.on('change', updateSky);
			skyPane
				.addBinding(effectController, 'rayleigh', {
					min: 0,
					max: 10,
					step: 0.01,
				})
				.on('change', updateSky);
			skyPane
				.addBinding(effectController, 'mieCoefficient', {
					min: 0,
					max: 10,
					step: 0.01,
				})
				.on('change', updateSky);
			skyPane
				.addBinding(effectController, 'mieDirectionalG', {
					min: 0,
					max: 10,
					step: 0.01,
				})
				.on('change', updateSky);
		}
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
