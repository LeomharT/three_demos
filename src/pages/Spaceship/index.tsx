import { useMantineTheme } from '@mantine/core';
import { useEffect } from 'react';
import {
	AmbientLight,
	AxesHelper,
	Color,
	DirectionalLight,
	DirectionalLightHelper,
	GridHelper,
	LoadingManager,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	SRGBColorSpace,
	Texture,
	WebGLRenderer,
} from 'three';
import { DRACOLoader, GLTFLoader } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Pane } from 'tweakpane';

export default function Spaceship() {
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
		camera.position.set(10, 10, 10);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		const stats = new Stats();
		el.append(stats.dom);

		/**
		 * Loaders
		 */

		const loadingManager = new LoadingManager();
		loadingManager.onLoad = () => {
			console.log('Loaded');
		};
		loadingManager.onProgress = () => {
			console.log('Loading....');
		};

		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath('node_modules/three/examples/jsm/libs/draco/');
		dracoLoader.setDecoderConfig({ type: 'js' });
		dracoLoader.preload();

		const gltfLoader = new GLTFLoader(loadingManager);
		gltfLoader.dracoLoader = dracoLoader;
		gltfLoader.setPath('/src/pages/Spaceship/assets/');

		/**
		 * Scenes
		 */

		const spaceshipGLTF = await gltfLoader.loadAsync('spaceship.glb');
		const spaceship = spaceshipGLTF.scene;
		spaceship.scale.setScalar(0.5);
		spaceship.traverse((mesh) => {
			if (mesh instanceof Mesh) {
				mesh.receiveShadow = true;
				mesh.castShadow = true;
				if (mesh.material instanceof MeshStandardMaterial) {
					mesh.material.depthTest = true;
					mesh.material.depthWrite = true;
					mesh.material.alphaToCoverage = true;
					mesh.material.transparent = false;
					if (mesh.material.map instanceof Texture) {
						mesh.material.map.colorSpace = SRGBColorSpace;
					}
				}
			}
		});
		spaceship.position.set(-3.7, 0, -2.235);
		scene.add(spaceship);

		const planeGeometry = new PlaneGeometry(20, 20);
		const planeMaterial = new MeshBasicMaterial({
			transparent: true,
			opacity: 0.25,
			color: new Color(1, 0, 1),
		});
		const plane = new Mesh(planeGeometry, planeMaterial);
		plane.rotation.y = Math.PI / 2;
		scene.add(plane);

		/**
		 * Lights
		 */

		const ambientLight = new AmbientLight();
		ambientLight.intensity = 0.2;
		scene.add(ambientLight);

		const directionalLight = new DirectionalLight();
		directionalLight.castShadow = true;
		directionalLight.shadow.bias = -0.0001;
		directionalLight.position.set(0, 10, 0);
		directionalLight.intensity = 1.8;
		scene.add(directionalLight);

		/**
		 * Helpers
		 */

		const axesHelper = new AxesHelper();
		axesHelper.scale.setScalar(10);
		scene.add(axesHelper);

		const gridHelper = new GridHelper(100, 35);
		scene.add(gridHelper);

		const directionalLightHelper = new DirectionalLightHelper(directionalLight);
		scene.add(directionalLightHelper);

		/**
		 * Pane
		 */

		const pane = new Pane({ title: 'Debug Params' });
		/** Ambient Light */
		{
			const ambientLightPane = pane.addFolder({ title: 'Ambient Light' });
			ambientLightPane.addBinding(ambientLight, 'intensity');
		}
		/** Direction Light */
		{
			const directionalLightPane = pane.addFolder({ title: 'Directional Light' });
			directionalLightPane.addBinding(directionalLight, 'intensity');
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

		const rect = el.getBoundingClientRect();

		function move(e: MouseEvent) {
			const x = e.clientX / rect.width - 0.5;
			const y = e.clientY / rect.height - 0.5;

			console.log(x, -y);
		}
		el.addEventListener('mousemove', move);
	};

	useEffect(() => {
		initialScene();
	}, []);

	return <div id='container'></div>;
}
