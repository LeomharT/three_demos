import { useMantineTheme } from '@mantine/core';
import Cannon from 'cannon';
import { useEffect } from 'react';
import {
	AmbientLight,
	AxesHelper,
	CubeTextureLoader,
	DirectionalLight,
	DirectionalLightHelper,
	Mesh,
	MeshStandardMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	SphereGeometry,
	TextureLoader,
	WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Pane } from 'tweakpane';
export default function ThreejsJourneyPhysics() {
	const theme = useMantineTheme();

	const initialScene = async () => {
		const el = document.querySelector('#container') as HTMLDivElement;

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
		el.append(renderer.domElement);

		const scene = new Scene();

		const camera = new PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		camera.position.set(0, 3, 3);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		const stats = new Stats();
		el.append(stats.dom);

		/**
		 * Loaders
		 */

		const textureLoader = new TextureLoader();
		textureLoader.setPath('/src/pages/Physics/ThreejsJourneyPhysics/assets/');

		const cubeTextureLoader = new CubeTextureLoader();
		cubeTextureLoader.setPath(
			'/src/pages/Physics/ThreejsJourneyPhysics/assets/textures/environmentMaps/'
		);

		/**
		 * Textures
		 */

		const environmentTexture = cubeTextureLoader.load([
			'0/px.png',
			'0/nx.png',
			'0/py.png',
			'0/ny.png',
			'0/pz.png',
			'0/nz.png',
		]);

		/**
		 * Scenes
		 */

		const floorGeometry = new PlaneGeometry(10, 10, 32, 32);
		floorGeometry.rotateX(-Math.PI / 2);
		const floorMaterial = new MeshStandardMaterial({
			color: '#777777',
			metalness: 0.3,
			roughness: 0.4,
			envMap: environmentTexture,
			envMapIntensity: 0.5,
		});
		const floor = new Mesh(floorGeometry, floorMaterial);
		floor.receiveShadow = true;
		scene.add(floor);

		const sphereGeometry = new SphereGeometry(0.5, 32, 32);
		const sphereMaterial = new MeshStandardMaterial({
			metalness: 0.4,
			roughness: 0.3,
			envMap: environmentTexture,
			envMapIntensity: 0.5,
		});
		const sphere = new Mesh(sphereGeometry, sphereMaterial);
		sphere.castShadow = true;
		sphere.receiveShadow = true;
		sphere.position.y = 0.5;
		scene.add(sphere);

		/**
		 * Physics
		 */

		const world = new Cannon.World();
		world.gravity.set(0, -9.82, 0);

		// Material
		// const concreteMaterial = new Cannon.Material('Concrete Material');
		// const plasticMaterial = new Cannon.Material('Plastic Material');

		const defaultMaterial = new Cannon.Material('Default Material');
		const defaultContactMaterial = new Cannon.ContactMaterial(
			defaultMaterial,
			defaultMaterial,
			{
				friction: 1.0,
				restitution: 0.7,
			}
		);
		world.addContactMaterial(defaultContactMaterial);
		world.defaultContactMaterial = defaultContactMaterial;

		const sphereShape = new Cannon.Sphere(0.5);
		const sphereBody = new Cannon.Body({
			mass: 1,
			position: new Cannon.Vec3(0, 3, 0),
			shape: sphereShape,
			material: defaultMaterial,
		});
		world.addBody(sphereBody);

		const floorShape = new Cannon.Plane();
		const floorBody = new Cannon.Body({
			mass: 0,
			shape: floorShape,
			material: defaultMaterial,
		});
		floorBody.quaternion.setFromAxisAngle(new Cannon.Vec3(1, 0, 0), -Math.PI / 2);
		world.addBody(floorBody);

		/**
		 * Lights
		 */

		const ambientLight = new AmbientLight();
		ambientLight.intensity = 1;
		scene.add(ambientLight);

		const directionalLight = new DirectionalLight();
		directionalLight.position.set(3, 3, -3);
		directionalLight.intensity = 2;
		directionalLight.castShadow = true;
		directionalLight.shadow.mapSize.set(512, 512);
		scene.add(directionalLight);

		/**
		 * Helpers
		 */

		const axesHelper = new AxesHelper();
		scene.add(axesHelper);

		const directionalLightHelp = new DirectionalLightHelper(directionalLight);
		directionalLightHelp.visible = false;
		scene.add(directionalLightHelp);

		/**
		 * Pane
		 */

		const pane = new Pane({ title: 'Debug Params' });
		// Axes Helper
		{
			const axesHelperPane = pane.addFolder({ title: 'Axes Helper' });
			axesHelperPane.addBinding(axesHelper, 'visible');
		}
		// Directional Light
		{
			const directionalLightPane = pane.addFolder({ title: 'Directional Light' });
			directionalLightPane.addBinding(directionalLight, 'intensity');
			directionalLightPane.addBinding(directionalLight, 'color', {
				color: { type: 'float' },
			});
		}

		/**
		 * Events
		 */

		let previousTime = 0;

		function render(time: number = 0) {
			requestAnimationFrame(render);

			let deltaTime = time - previousTime;
			previousTime = time;
			deltaTime /= 1000;

			// Update Phtsics World
			world.step(1 / 60, deltaTime, 3);
			sphere.position.copy(sphereBody.position);

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
