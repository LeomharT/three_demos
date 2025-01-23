import { useMantineTheme } from '@mantine/core';
import { useEffect } from 'react';
import {
	AmbientLight,
	CubeReflectionMapping,
	CubeTextureLoader,
	DirectionalLight,
	Mesh,
	MeshStandardMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	SRGBColorSpace,
	TextureLoader,
	WebGLRenderer,
} from 'three';
import { DRACOLoader, GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

export default function CupBooks() {
	const theme = useMantineTheme();

	async function initialScene() {
		const el = document.querySelector('#container') as HTMLDivElement;

		/**
		 * Loader
		 */

		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath('node_modules/three/examples/jsm/libs/draco/');
		dracoLoader.setDecoderConfig({ type: 'js' });
		dracoLoader.preload();

		const gltfLoader = new GLTFLoader();
		gltfLoader.setPath('/src/pages/CustomModel/CupBooks/assets/models/');
		gltfLoader.setDRACOLoader(dracoLoader);

		const textureLoader = new TextureLoader();
		textureLoader.setPath('/src/assets/texture/env/');

		const cubeTextureLoader = new CubeTextureLoader();
		cubeTextureLoader.setPath('/src/assets/texture/env/0/');

		/**
		 * Basic
		 */

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setClearColor(theme.black);
		el.append(renderer.domElement);

		const scene = new Scene();

		const camera = new PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		camera.position.set(2, 2, 2);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;

		const stats = new Stats();
		el.append(stats.dom);

		/**
		 * Texture
		 */

		const environmentTexture = await cubeTextureLoader.loadAsync([
			'px.png',
			'nx.png',
			'py.png',
			'ny.png',
			'pz.png',
			'nz.png',
		]);
		environmentTexture.mapping = CubeReflectionMapping;
		environmentTexture.colorSpace = SRGBColorSpace;

		scene.environment = environmentTexture;
		scene.environmentIntensity = 0.65;

		/**
		 * Scene
		 */

		const floorGeometry = new PlaneGeometry(3, 3, 32, 32);
		floorGeometry.rotateX(-Math.PI / 2);
		const floorMaterial = new MeshStandardMaterial({
			color: '#777777',
			metalness: 0.3,
			roughness: 0.4,
			envMapIntensity: 0.5,
		});
		const floor = new Mesh(floorGeometry, floorMaterial);
		floor.receiveShadow = true;
		scene.add(floor);

		gltfLoader.load('Cup&Books.glb', (data) => {
			const cupBooks = data.scene;

			scene.add(cupBooks);
		});

		/**
		 * Light
		 */

		const ambientLight = new AmbientLight();
		scene.add(ambientLight);

		const directionalLight = new DirectionalLight();
		scene.add(directionalLight);

		/**
		 * Events
		 */

		function render(time: number = 0) {
			requestAnimationFrame(render);

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
	}

	useEffect(() => {
		initialScene();
	}, []);

	return <div id='container'></div>;
}
