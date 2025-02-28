import { useMantineTheme } from '@mantine/core';
import { useEffect } from 'react';
import {
	AxesHelper,
	Color,
	CubeTextureLoader,
	DoubleSide,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	RepeatWrapping,
	Scene,
	ShaderMaterial,
	SphereGeometry,
	TextureLoader,
	TorusKnotGeometry,
	Uniform,
	WebGLRenderer,
} from 'three';
import {
	DRACOLoader,
	GLTFLoader,
	OrbitControls,
	RGBELoader,
} from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Pane } from 'tweakpane';
import fragmentShader from './shader/fragment.glsl?raw';
import vertexShader from './shader/vertex.glsl?raw';

const ASSETS_PATH = '/src/pages/ThreejsJourneyShader/CoffeeSmoke/assets/';

export default function Test() {
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
		gltfLoader.setPath('/src/assets/models/');
		gltfLoader.setDRACOLoader(dracoLoader);

		const textureLoader = new TextureLoader();
		textureLoader.setPath(ASSETS_PATH);

		const cubeTextureLoader = new CubeTextureLoader();
		cubeTextureLoader.setPath('/src/assets/texture/env/1/');

		const rgbeLoader = new RGBELoader();
		rgbeLoader.setPath('/src/assets/texture/env/');

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
		camera.position.set(4, 4, 4);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;

		const stats = new Stats();
		el.append(stats.dom);

		const noiseTexture = await textureLoader.loadAsync('perlin.png');
		noiseTexture.wrapT = noiseTexture.wrapS = RepeatWrapping;

		/**
		 * Scene
		 */

		const uniforms = {
			uMaterialColor: new Uniform(new Color(0xffffff)),
			uAmbientLightColor: new Uniform(new Color(0xffffff)),
			uDirectionalLightColor: new Uniform(new Color(0x6cff24)),
		};

		const lightShadingMaterial = new ShaderMaterial({
			uniforms,
			vertexShader,
			fragmentShader,
		});

		const sphereGeometry = new SphereGeometry(1, 32, 32);
		const sphere = new Mesh(sphereGeometry, lightShadingMaterial);
		sphere.position.x = -3;
		scene.add(sphere);

		const suzanne = (await gltfLoader.loadAsync('suzanne.glb')).scene;
		suzanne.traverse((mesh) => {
			if (mesh instanceof Mesh) {
				mesh.material = lightShadingMaterial;
			}
		});
		scene.add(suzanne);

		const torusKnotGeometry = new TorusKnotGeometry(0.5, 0.2, 64, 16);
		const torusKnot = new Mesh(torusKnotGeometry, lightShadingMaterial);
		torusKnot.position.x = 3;
		scene.add(torusKnot);

		const meshes = [sphere, suzanne, torusKnot] as Mesh[];

		const directionalLightHelper = new Mesh(
			new PlaneGeometry(1, 1, 16, 16),
			new MeshBasicMaterial({
				color: uniforms.uDirectionalLightColor.value,
				side: DoubleSide,
			})
		);
		directionalLightHelper.position.z = 3.0;
		scene.add(directionalLightHelper);

		/**
		 * Pane
		 */

		const pane = new Pane({ title: 'Debug Params' });
		pane.element.parentElement!.style.width = '320px';
		pane.addBinding(uniforms.uMaterialColor, 'value', {
			label: 'Material Color',
			color: {
				type: 'float',
			},
		});
		pane.addBinding(uniforms.uAmbientLightColor, 'value', {
			label: 'Ambient Light Color',
			color: {
				type: 'float',
			},
		});
		pane.addBinding(uniforms.uDirectionalLightColor, 'value', {
			label: 'Directional Color',
			color: {
				type: 'float',
			},
		});

		/**
		 * Helpers
		 */

		const axesHelper = new AxesHelper();
		scene.add(axesHelper);

		/**
		 * Events
		 */

		function render(time: number = 0) {
			requestAnimationFrame(render);

			stats.update();
			controls.update(time);

			meshes.forEach((mesh) => {
				mesh.rotation.x += 0.01;
				mesh.rotation.z += 0.01;
			});

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
