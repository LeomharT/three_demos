import { useMantineTheme } from '@mantine/core';
import { useEffect } from 'react';
import {
	AmbientLight,
	AxesHelper,
	LoadingManager,
	Mesh,
	MeshStandardMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	RepeatWrapping,
	Scene,
	SpotLight,
	SpotLightHelper,
	SRGBColorSpace,
	TextureLoader,
	WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Pane } from 'tweakpane';

const WIDTH = 1.61803398875;
const GOLDENRATIO = 1.61803398875;

export default function TexturesBasic() {
	const theme = useMantineTheme();

	const initialScene = async () => {
		const el = document.querySelector('#container') as HTMLDivElement;
		el.innerHTML = '';

		const { innerWidth, innerHeight } = window;

		/**
		 * Basic
		 */

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.setSize(innerWidth, innerHeight);
		renderer.setClearColor(theme.colors.dark[9]);
		el.append(renderer.domElement);

		const scene = new Scene();

		const camera = new PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
		camera.position.set(0, 0, 3);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;

		const stats = new Stats();
		el.append(stats.dom);

		/**
		 * Loaders
		 */

		const loadingManager = new LoadingManager();
		loadingManager.onStart = () => {
			console.log('Loading is started');
		};
		loadingManager.onLoad = () => {
			console.log('Load finished');
		};
		loadingManager.onProgress = () => {
			console.log('Loading...');
		};
		loadingManager.onError = () => {
			console.log('Loading error');
		};

		const textureLoader = new TextureLoader(loadingManager);
		textureLoader.setPath('/src/pages/Textures/TexturesBasic/assets/');

		/**
		 * Scenes
		 */

		const geometry = new PlaneGeometry(WIDTH, GOLDENRATIO, 32, 32);

		const colorTexture = textureLoader.load('Door_Wood_001_basecolor.jpg');
		colorTexture.colorSpace = SRGBColorSpace;
		colorTexture.wrapS = RepeatWrapping;
		colorTexture.wrapT = RepeatWrapping;
		colorTexture.repeat.x = 1;
		colorTexture.repeat.y = 1;
		const alphaTexture = textureLoader.load('Door_Wood_001_opacity.jpg');
		const normalTexture = textureLoader.load('Door_Wood_001_normal.jpg');
		const heightTexture = textureLoader.load('Door_Wood_001_height.png');
		const ambientTexture = textureLoader.load('Door_Wood_001_ambientOcclusion.jpg');
		const roughnessMap = textureLoader.load('Door_Wood_001_roughness.jpg');
		const metalnessMap = textureLoader.load('Door_Wood_001_metallic.jpg');

		const material = new MeshStandardMaterial({
			map: colorTexture,
			alphaMap: alphaTexture,
			alphaTest: 0.00001,
			normalMap: normalTexture,
			aoMap: ambientTexture,
			displacementMap: heightTexture,
			displacementScale: 0.01,
			roughness: 1.0,
			roughnessMap: roughnessMap,
			metalness: 0.0,
			metalnessMap: metalnessMap,
		});
		material.needsUpdate = true;

		let mesh = new Mesh(geometry, material);
		scene.add(mesh);

		/**
		 * Lights
		 */

		const ambientLight = new AmbientLight();
		ambientLight.intensity = 1.5;
		scene.add(ambientLight);

		const spotLight = new SpotLight();
		spotLight.intensity = 5.0;
		spotLight.position.set(0, 0.5, 2.5);
		scene.add(spotLight);

		/**
		 * Helpers
		 */

		const axesHelper = new AxesHelper();
		scene.add(axesHelper);

		const spotLightHelper = new SpotLightHelper(spotLight);
		scene.add(spotLightHelper);

		/**
		 * Panes
		 */

		const pane = new Pane({ title: 'Debug Params' });
		// Ambient Light
		const ambientLightPane = pane.addFolder({ title: 'Ambient Light' });
		ambientLightPane.addBinding(ambientLight, 'intensity', {
			min: 0,
			max: 10,
			step: 0.1,
		});
		// Spot Light
		const spotLightPane = pane.addFolder({ title: 'Spot Light' });
		spotLightPane.addBinding(spotLight, 'intensity', {
			min: 0,
			max: 50,
			step: 0.1,
		});
		spotLightPane.addBinding(spotLight, 'position', {
			min: -10,
			max: 10,
			step: 0.1,
		});
		spotLightPane.addBinding(spotLight, 'angle', {
			min: 0,
			max: Math.PI / 2,
			step: 0.01,
		});
		// Material
		const materialPane = pane.addFolder({ title: 'Material' });
		materialPane.addBinding(material, 'aoMapIntensity', {
			min: 0,
			max: 10,
			step: 0.1,
		});
		materialPane.addBinding(material, 'displacementScale', {
			min: 0,
			max: 10,
			step: 0.001,
		});
		materialPane.addBinding(material, 'displacementBias', {
			min: 0,
			max: 10,
			step: 0.001,
		});
		materialPane.addBinding(material, 'roughness', {
			min: 0,
			max: 1,
			step: 0.1,
		});
		materialPane.addBinding(material, 'metalness', {
			min: 0,
			max: 1,
			step: 0.1,
		});

		/**
		 * Events
		 */

		function render(time: number = 0) {
			requestAnimationFrame(render);

			stats.update();
			controls.update(time);
			renderer.render(scene, camera);

			spotLightHelper.update();
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
