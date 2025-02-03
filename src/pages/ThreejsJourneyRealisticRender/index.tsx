import { useEffect } from 'react';
import {
	ACESFilmicToneMapping,
	AgXToneMapping,
	AxesHelper,
	CameraHelper,
	CineonToneMapping,
	CustomToneMapping,
	DirectionalLight,
	DirectionalLightHelper,
	EquirectangularReflectionMapping,
	LinearToneMapping,
	Mesh,
	NeutralToneMapping,
	NoToneMapping,
	PCFSoftShadowMap,
	PerspectiveCamera,
	ReinhardToneMapping,
	Scene,
	WebGLRenderer,
} from 'three';
import { GLTFLoader, OrbitControls, RGBELoader } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';

export default function ThreejsJourneyRealisticRender() {
	async function initialScene() {
		const el = document.querySelector('#container') as HTMLDivElement;

		/**
		 * Basic
		 */

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.toneMapping = ReinhardToneMapping;
		renderer.toneMappingExposure = 2;
		renderer.shadowMap.enabled = true;
		// Use this as default shadow type always
		renderer.shadowMap.type = PCFSoftShadowMap;
		renderer.setSize(window.innerWidth, window.innerHeight);
		el.append(renderer.domElement);

		const scene = new Scene();

		const camera = new PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		camera.position.set(4, 5, 4);
		camera.lookAt(scene.position);
		scene.add(camera);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.target.y = 3.5;
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;

		/**
		 * Loader
		 */

		const rgbeLoader = new RGBELoader();
		rgbeLoader.setPath('/src/assets/texture/hdr/');

		const gltfLoader = new GLTFLoader();
		gltfLoader.setPath('/src/assets/models/');

		/**
		 * Textures
		 */

		const environmentTexture = await rgbeLoader.loadAsync('2k.hdr');
		environmentTexture.mapping = EquirectangularReflectionMapping;

		scene.background = environmentTexture;
		scene.environment = environmentTexture;

		/**
		 * Scene
		 */

		gltfLoader.load('FlightHelmet/FlightHelmet.gltf', (data) => {
			const helmet = data.scene;
			helmet.traverse((mesh) => {
				if (mesh instanceof Mesh) {
					mesh.castShadow = true;
					mesh.receiveShadow = true;
				}
			});
			helmet.scale.set(10, 10, 10);
			scene.add(helmet);
		});

		/**
		 * Light
		 */

		const directionalLight = new DirectionalLight(0xffffff, 6);
		directionalLight.position.set(-4, 6.5, 2.5);
		directionalLight.shadow.mapSize.setScalar(512);
		directionalLight.target.position.set(0, 4, 0);
		directionalLight.target.updateWorldMatrix(true, true);
		directionalLight.shadow.camera.near = 0.1;
		directionalLight.shadow.camera.far = 15;
		directionalLight.castShadow = true;
		scene.add(directionalLight);

		/**
		 * Helpers
		 */

		const axesHelper = new AxesHelper();
		scene.add(axesHelper);

		const directionalLightHelper = new DirectionalLightHelper(directionalLight);
		scene.add(directionalLightHelper);

		const cameraHelper = new CameraHelper(directionalLight.shadow.camera);
		scene.add(cameraHelper);

		/**
		 * Pane
		 */

		const pane = new Pane({ title: 'Debug Params' });
		pane.addBinding(scene, 'environmentIntensity', {
			step: 0.01,
			min: 0,
			max: 5,
		});
		pane.addBinding(renderer, 'toneMapping', {
			options: [
				{ text: 'NoToneMapping', value: NoToneMapping },
				{ text: 'LinearToneMapping', value: LinearToneMapping },
				{ text: 'ReinhardToneMapping', value: ReinhardToneMapping },
				{ text: 'CineonToneMapping', value: CineonToneMapping },
				{ text: 'ACESFilmicToneMapping', value: ACESFilmicToneMapping },
				{ text: 'CustomToneMapping', value: CustomToneMapping },
				{ text: 'AgXToneMapping', value: AgXToneMapping },
				{ text: 'NeutralToneMapping', value: NeutralToneMapping },
			],
		});
		{
			pane.addBinding(directionalLight, 'castShadow');
			pane.addBinding(directionalLight, 'intensity', {
				label: 'Directional Light Intensity',
				step: 0.001,
				min: 0,
				max: 10,
			});
			pane.addBinding(directionalLight.position, 'x', {
				label: 'Directional Light X',
				step: 0.001,
				min: -10,
				max: 10,
			});
			pane.addBinding(directionalLight.position, 'y', {
				label: 'Directional Light Y',
				step: 0.001,
				min: -10,
				max: 10,
			});
			pane.addBinding(directionalLight.position, 'z', {
				label: 'Directional Light Z',
				step: 0.001,
				min: -10,
				max: 10,
			});
		}

		/**
		 * Event
		 */

		function render(time: number = 0) {
			requestAnimationFrame(render);

			controls.update(time);

			directionalLightHelper.update();

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
