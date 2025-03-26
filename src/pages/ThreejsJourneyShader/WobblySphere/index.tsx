import { useEffect } from 'react';
import {
	CubeTextureLoader,
	DirectionalLight,
	IcosahedronGeometry,
	Mesh,
	MeshPhysicalMaterial,
	MeshStandardMaterial,
	PCFSoftShadowMap,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';

export default function WobblySphere() {
	async function initialScene() {
		/**
		 * Document
		 */

		const el = document.querySelector('#container') as HTMLDivElement;
		const size = {
			width: window.innerWidth,
			height: window.innerHeight,
			devicePixelRatio: Math.min(window.devicePixelRatio, 2),
		};

		/**
		 * Basic
		 */

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.setSize(size.width, size.height);
		renderer.setPixelRatio(size.devicePixelRatio);
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = PCFSoftShadowMap;
		el.append(renderer.domElement);

		const scene = new Scene();

		const camera = new PerspectiveCamera(75, size.width / size.height, 0.1, 1000);
		camera.position.set(5, 5, -5);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		/**
		 * Loaders
		 */

		const cubeTextureLoader = new CubeTextureLoader();
		cubeTextureLoader.setPath('/src/assets/texture/env/');

		/**
		 * Textures
		 */

		const environmentMap = cubeTextureLoader.load([
			'1/px.png',
			'1/nx.png',
			'1/py.png',
			'1/ny.png',
			'1/pz.png',
			'1/nz.png',
		]);
		scene.background = environmentMap;
		scene.environment = environmentMap;

		/**
		 * Scene
		 */

		const wobblySphereGeometry = new IcosahedronGeometry(2.5, 50);
		const wobblySphereMaterial = new MeshPhysicalMaterial({
			metalness: 0,
			roughness: 0.5,
			color: '#ffffff',
			transmission: 0,
			ior: 1.5,
			thickness: 1.5,
			transparent: true,
			wireframe: false,
		});
		const wobblySphere = new Mesh(wobblySphereGeometry, wobblySphereMaterial);
		wobblySphere.castShadow = true;
		wobblySphere.receiveShadow = true;
		scene.add(wobblySphere);

		const lightDebugPlane = new Mesh(
			new PlaneGeometry(15, 15, 15),
			new MeshStandardMaterial()
		);
		lightDebugPlane.rotation.y = Math.PI;
		lightDebugPlane.position.set(0, -5, 5);
		lightDebugPlane.receiveShadow = true;
		scene.add(lightDebugPlane);

		/**
		 * Light
		 */
		const directionalLight = new DirectionalLight('#ffffff', 3);
		directionalLight.castShadow = true;
		directionalLight.shadow.mapSize.set(1024, 1024);
		directionalLight.shadow.camera.far = 15;
		directionalLight.shadow.normalBias = 0.05;
		directionalLight.position.set(0.25, 2, -2.25);
		scene.add(directionalLight);

		/**
		 * Pane
		 */

		const pane = new Pane({ title: 'Debug Params' });
		pane.element.parentElement!.style.width = '380px';
		pane.addBinding(wobblySphereMaterial, 'metalness', {
			label: 'Material Metalness',
			max: 1,
			min: 0,
			step: 0.001,
		});
		pane.addBinding(wobblySphereMaterial, 'roughness', {
			label: 'Material Roughness',
			max: 1,
			min: 0,
			step: 0.001,
		});
		pane.addBinding(wobblySphereMaterial, 'ior', {
			label: 'Material IOR',
			max: 10,
			min: 0,
			step: 0.001,
		});
		pane.addBinding(wobblySphereMaterial, 'transmission', {
			label: 'Material Transmission',
			max: 1,
			min: 0,
			step: 0.001,
		});
		pane.addBinding(wobblySphereMaterial, 'thickness', {
			label: 'Material Thickness',
			max: 1,
			min: 0,
			step: 0.001,
		});
		pane.addBinding(wobblySphereMaterial, 'color', {
			label: 'Material Color',
			color: { type: 'float' },
		});

		/**
		 * Events
		 */

		function render(time: number = 0) {
			controls.update(time);

			renderer.render(scene, camera);

			requestAnimationFrame(render);
		}
		render();

		function resize() {
			size.width = window.innerWidth;
			size.height = window.innerHeight;

			renderer.setSize(size.width, size.height);
			camera.aspect = size.width / size.height;
			camera.updateProjectionMatrix();
		}
		window.addEventListener('resize', resize);
	}

	useEffect(() => {
		initialScene();
	}, []);

	return <div id='container'></div>;
}
