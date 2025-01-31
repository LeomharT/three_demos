import { useEffect } from 'react';
import {
	AmbientLight,
	AxesHelper,
	CubeCamera,
	EquirectangularRefractionMapping,
	HalfFloatType,
	LinearFilter,
	Mesh,
	MeshStandardMaterial,
	PerspectiveCamera,
	Scene,
	SphereGeometry,
	SRGBColorSpace,
	TextureLoader,
	TorusGeometry,
	WebGLRenderer,
} from 'three';
import {
	GLTFLoader,
	GroundedSkybox,
	OrbitControls,
	RGBELoader,
} from 'three/examples/jsm/Addons.js';
import CubeRenderTarget from 'three/src/renderers/common/CubeRenderTarget.js';
import { Pane } from 'tweakpane';

export default function ThreeJSJourneyEnvironmentMap() {
	async function initialScene() {
		const el = document.querySelector('#container') as HTMLDivElement;

		const ENVIRONMENT_LAYER: number = 1;

		/**
		 * Loaders
		 */

		const rgbeLoader = new RGBELoader();
		rgbeLoader.setPath('/src/assets/texture/hdr/');

		const textureLoader = new TextureLoader();
		textureLoader.setPath('/src/assets/texture/hdr/');

		const gltfLoader = new GLTFLoader();
		gltfLoader.setPath('/src/assets/models/');

		/**
		 * Texture
		 */

		const environmentTexture = await rgbeLoader.loadAsync('teatro_massimo_1k.hdr');
		environmentTexture.mapping = EquirectangularRefractionMapping;

		const envMap = await textureLoader.loadAsync(
			'interior_views_cozy_wood_cabin_with_cauldron_and_p.jpg'
		);
		envMap.mapping = EquirectangularRefractionMapping;
		envMap.colorSpace = SRGBColorSpace;

		/**
		 * Basic
		 */

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.shadowMap.enabled = true;
		renderer.setClearColor(0x000000);
		el.append(renderer.domElement);

		const scene = new Scene();
		scene.background = envMap;
		// scene.environment = envMap;
		// Skybox
		const skyBox = new GroundedSkybox(envMap, 15, 75);
		scene.add(skyBox);

		const camera = new PerspectiveCamera(
			35,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		camera.position.set(3, 3, 3);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		const cubeEnvironmentTexture = new CubeRenderTarget(512, {
			generateMipmaps: true,
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			// 这个会加强环境照明的效果, type就是这个Texuture的数据是如何储存的, 我们需要HDR需要Float
			type: HalfFloatType,
		});
		const cubeCamera = new CubeCamera(0.1, 1000, cubeEnvironmentTexture);
		cubeCamera.layers.set(ENVIRONMENT_LAYER);
		cubeCamera.position.set(0, 0, 0);

		/**
		 * Scene
		 */

		const sphereGeometry = new SphereGeometry(0.5, 32, 32);
		const sphereMaterial = new MeshStandardMaterial({
			metalness: 0.8,
			roughness: 0,
			envMap: cubeEnvironmentTexture.texture,
		});
		const sphere = new Mesh(sphereGeometry, sphereMaterial);
		sphere.position.x = -2;
		scene.add(sphere);

		const ring = new Mesh(
			new TorusGeometry(1, 0.1, 16),
			new MeshStandardMaterial({
				color: 'white',
				emissive: 'white',
				emissiveIntensity: 3.0,
			})
		);
		ring.layers.enable(ENVIRONMENT_LAYER);
		scene.add(ring);

		gltfLoader.load('FlightHelmet/FlightHelmet.gltf', (data) => {
			const fightHelmet = data.scene;

			fightHelmet.traverse((mesh) => {
				if (mesh instanceof Mesh) {
					if (mesh.material instanceof MeshStandardMaterial) {
						mesh.material.envMap = cubeEnvironmentTexture.texture;
						mesh.material.envMapIntensity = 4.0;
					}
				}
			});

			scene.add(fightHelmet);
		});

		/**
		 * Lights
		 */

		const ambientLight = new AmbientLight();
		scene.add(ambientLight);

		/**
		 * Helpers
		 */

		const axesHelper = new AxesHelper();
		scene.add(axesHelper);

		/**
		 * Pane
		 */
		const pane = new Pane({ title: 'Debug Params' });
		{
			const scenePane = pane.addFolder({ title: 'Scene Params' });
			scenePane.addBinding(scene, 'backgroundIntensity', {
				min: 0,
				max: 2,
				step: 0.01,
			});
			scenePane.addBinding(scene, 'backgroundBlurriness', {
				min: 0,
				max: 1,
				step: 0.01,
			});
			scenePane.addBinding(scene, 'environmentIntensity', {
				min: 0,
				max: 2,
				step: 0.01,
			});
		}

		function render(time: number = 0) {
			requestAnimationFrame(render);

			controls.update(time);

			sphere.visible = false;
			cubeCamera.update(renderer, scene);
			sphere.visible = true;

			ring.rotation.x = Math.sin(time * 0.001) * 2;

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
