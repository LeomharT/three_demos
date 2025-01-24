import { useMantineTheme } from '@mantine/core';
import { useEffect } from 'react';
import {
	AmbientLight,
	CubeTextureLoader,
	DirectionalLight,
	EquirectangularReflectionMapping,
	Mesh,
	MeshStandardMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	TextureLoader,
	WebGLRenderer,
} from 'three';
import {
	DRACOLoader,
	GLTFLoader,
	OrbitControls,
	RGBELoader,
} from 'three/examples/jsm/Addons.js';
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

		const rgbeLoader = new RGBELoader();
		rgbeLoader.setPath('/src/assets/texture/hdr/');

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
		renderer.shadowMap.enabled = true;
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

		const environmentTexture = await rgbeLoader.loadAsync('teatro_massimo_1k.hdr');
		environmentTexture.mapping = EquirectangularReflectionMapping;

		scene.environment = environmentTexture;
		scene.environmentIntensity = 0.1;

		/**
		 * Scene
		 */

		const floorGeometry = new PlaneGeometry(30, 30, 32, 32);
		floorGeometry.rotateX(-Math.PI / 2);
		const floorMaterial = new MeshStandardMaterial({
			envMapIntensity: 0.5,
		});
		const floor = new Mesh(floorGeometry, floorMaterial);
		floor.position.y = -1.2;
		floor.receiveShadow = true;
		scene.add(floor);

		gltfLoader.load('Cup&Books.gltf', (data) => {
			const cupBooks = data.scene;

			cupBooks.traverse((mesh) => {
				if (mesh instanceof Mesh) {
					mesh.castShadow = true;
					mesh.receiveShadow = true;

					if (mesh.material instanceof MeshStandardMaterial) {
						mesh.material.flatShading = false;
					}
				}
			});

			scene.add(cupBooks);
		});

		/**
		 * Light
		 */

		const ambientLight = new AmbientLight();
		ambientLight.intensity = 0.5;
		scene.add(ambientLight);

		const directionalLight = new DirectionalLight();
		directionalLight.position.set(0, 10, 0);
		directionalLight.castShadow = true;
		directionalLight.intensity = 2.0;
		scene.add(directionalLight);

		const directionalLight2 = directionalLight.clone();
		directionalLight2.castShadow = true;
		directionalLight2.position.set(1, 0, 1);
		scene.add(directionalLight2);

		const directionalLight3 = directionalLight.clone();
		directionalLight3.castShadow = true;
		directionalLight3.position.set(-1, 0, 0);
		scene.add(directionalLight3);

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
