import { useEffect } from 'react';
import {
	ACESFilmicToneMapping,
	AgXToneMapping,
	AxesHelper,
	CineonToneMapping,
	CustomToneMapping,
	EquirectangularReflectionMapping,
	LinearToneMapping,
	NeutralToneMapping,
	NoToneMapping,
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
			helmet.scale.set(10, 10, 10);
			scene.add(helmet);
		});

		/**
		 * Helpers
		 */

		const axesHelper = new AxesHelper();
		scene.add(axesHelper);

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

		/**
		 * Event
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
