import { useEffect } from 'react';
import {
	CubeTextureLoader,
	PerspectiveCamera,
	ReinhardToneMapping,
	Scene,
	SRGBColorSpace,
	Vector2,
	WebGLRenderer,
	WebGLRenderTarget,
} from 'three';
import {
	EffectComposer,
	GammaCorrectionShader,
	GLTFLoader,
	RenderPass,
	ShaderPass,
	SMAAPass,
	UnrealBloomPass,
} from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Pane } from 'tweakpane';

export default function PostProcessing() {
	function initialScene() {
		const el = document.querySelector('#container') as HTMLDivElement;

		const sizes = {
			width: window.innerWidth,
			height: window.innerHeight,
			pixelRatio: Math.min(2, window.devicePixelRatio),
		};

		/**
		 * Basic
		 */

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.setSize(sizes.width, sizes.height);
		renderer.setPixelRatio(sizes.pixelRatio);
		renderer.toneMapping = ReinhardToneMapping;
		renderer.toneMappingExposure = 1.5;
		renderer.outputColorSpace = SRGBColorSpace;
		el.append(renderer.domElement);

		const scene = new Scene();

		const camera = new PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 1000);
		camera.position.set(3, 0, 3);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		const stats = new Stats();
		stats.showPanel(0);
		el.append(stats.dom);

		/**
		 * Post-processing
		 */

		const renderTarget = new WebGLRenderTarget(800, 600, {
			samples: renderer.getPixelRatio() === 1 ? 2 : 0,
		});

		const composer = new EffectComposer(renderer, renderTarget);

		const renderPass = new RenderPass(scene, camera);
		composer.addPass(renderPass);

		const gamma = new ShaderPass(GammaCorrectionShader);
		composer.addPass(gamma);

		const smaa = new SMAAPass(sizes.width, sizes.height);
		composer.addPass(smaa);

		const bloom = new UnrealBloomPass(
			new Vector2(sizes.width, sizes.height),
			0.3,
			1,
			0.6
		);
		composer.addPass(bloom);

		/**
		 * Loaders
		 */

		const gltfLoader = new GLTFLoader();
		gltfLoader.setPath('/src/assets/models/');

		const cubeTextureLoader = new CubeTextureLoader();
		cubeTextureLoader.setPath('/src/assets/texture/env/5/');

		/**
		 * Textures
		 */

		const environmentMap = cubeTextureLoader.load([
			'px.jpg',
			'nx.jpg',
			'py.jpg',
			'ny.jpg',
			'pz.jpg',
			'nz.jpg',
		]);

		/**
		 * Scene
		 */

		scene.background = environmentMap;
		scene.environment = environmentMap;

		gltfLoader.load('DamagedHelmet/glTF/DamagedHelmet.gltf', (gltf) => {
			const model = gltf.scene;
			scene.add(model);
		});

		/**
		 * Pane
		 */

		const pane = new Pane({ title: '🚧 Debug Params 🚧' });
		pane.element.parentElement!.style.width = '380px';

		/**
		 * Events
		 */

		function render(time: number = 0) {
			requestAnimationFrame(render);

			stats.update();
			controls.update(time);

			composer.render();
		}
		render();

		function resize() {
			sizes.width = window.innerWidth;
			sizes.height = window.innerHeight;
			sizes.pixelRatio = Math.min(2, window.devicePixelRatio);

			renderer.setSize(sizes.width, sizes.height);
			composer.setSize(sizes.width, sizes.height);

			camera.aspect = sizes.width / sizes.height;
			camera.updateProjectionMatrix();
		}
		window.addEventListener('resize', resize);
	}

	useEffect(() => {
		initialScene();
	}, []);

	return <div id='container'></div>;
}
