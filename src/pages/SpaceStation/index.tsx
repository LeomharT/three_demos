import { useMantineTheme } from '@mantine/core';
import { useEffect } from 'react';
import {
	AmbientLight,
	Color,
	DirectionalLight,
	DirectionalLightHelper,
	InstancedMesh,
	MeshPhysicalMaterial,
	PerspectiveCamera,
	Scene,
	SphereGeometry,
	TextureLoader,
	Vector2,
	WebGLRenderer,
} from 'three';
import {
	EffectComposer,
	GLTFLoader,
	OrbitControls,
	OutputPass,
	RenderPass,
	UnrealBloomPass,
} from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

export default function SpaceStation() {
	const theme = useMantineTheme();

	function random(min: number, max: number) {
		const diff = Math.random() * (max - min);
		return min + diff;
	}

	const initialScene = () => {
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
		renderer.setPixelRatio(window.devicePixelRatio);
		el.append(renderer.domElement);

		const scene = new Scene();
		scene.background = new Color(theme.colors.dark[8]);

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

		const boolmPass = new UnrealBloomPass(
			new Vector2(
				window.innerWidth * window.devicePixelRatio,
				window.innerHeight * window.devicePixelRatio
			),
			0.2,
			0.5,
			0
		);
		composer.addPass(boolmPass);

		const outPass = new OutputPass();
		composer.addPass(outPass);

		/**
		 * Loader
		 */

		const textureLoader = new TextureLoader();
		textureLoader.setPath('/src/pages/SpaceStation/assets/texture');

		const gltfLoader = new GLTFLoader();
		gltfLoader.setPath('/src/pages/SpaceStation/assets/model');

		/**
		 * Textures
		 */

		const starColorTexture = textureLoader.load('/diffuse.png');
		const starAlphaTexture = textureLoader.load('/star-alpha.png');

		/**
		 * Variable
		 */

		const STAR_COUNT = 500;

		/**
		 * Scene
		 */

		gltfLoader.load('/sci-fi_space_station/scene.gltf', (data) => {
			const spacestation = data.scene;
			console.log(spacestation);
			scene.add(spacestation);
		});

		const starGeometry = new SphereGeometry(0.3, 32, 32);
		const starMaterial = new MeshPhysicalMaterial({
			transparent: true,
			color: 'white',
			iridescence: 1,
			iridescenceIOR: 1,
			roughness: 0.8,
			metalness: 0.2,
			iridescenceThicknessRange: [1, 1200],
			ior: 2,
		});
		const star = new InstancedMesh(starGeometry, starMaterial, 1);
		star.receiveShadow = true;
		star.castShadow = true;

		scene.add(star);

		/**
		 * Lights
		 */

		const ambientLight = new AmbientLight();
		ambientLight.intensity = 0.2;
		scene.add(ambientLight);

		const dircetionalLight = new DirectionalLight();
		dircetionalLight.intensity = 1.8;
		dircetionalLight.castShadow = true;
		dircetionalLight.position.set(0, 10, 10);
		dircetionalLight.color = new Color(theme.white);
		scene.add(dircetionalLight);

		/**
		 * Helper
		 */

		const directionalLightHelper = new DirectionalLightHelper(dircetionalLight);
		scene.add(directionalLightHelper);

		/**
		 * Events
		 */

		function render(time?: number) {
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
