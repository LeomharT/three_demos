import { useEffect } from 'react';
import {
	AmbientLight,
	AxesHelper,
	CubeCamera,
	EquirectangularRefractionMapping,
	LinearFilter,
	Mesh,
	MeshStandardMaterial,
	PerspectiveCamera,
	PMREMGenerator,
	Scene,
	SphereGeometry,
	TorusGeometry,
	WebGLRenderer,
	WebGLRenderTarget,
} from 'three';
import { OrbitControls, RGBELoader } from 'three/examples/jsm/Addons.js';
import CubeRenderTarget from 'three/src/renderers/common/CubeRenderTarget.js';

export default function ThreeJSJourneyEnvironmentMap() {
	async function initialScene() {
		const el = document.querySelector('#container') as HTMLDivElement;

		/**
		 * Loaders
		 */

		const rgbeLoader = new RGBELoader();
		rgbeLoader.setPath('/src/assets/texture/hdr/');

		/**
		 * Texture
		 */

		const environmentTexture = await rgbeLoader.loadAsync('teatro_massimo_1k.hdr');
		environmentTexture.mapping = EquirectangularRefractionMapping;

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
		scene.background = environmentTexture;

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

		const cubeEnvironmentTexture = new CubeRenderTarget(128, {
			generateMipmaps: true,
			minFilter: LinearFilter,
			magFilter: LinearFilter,
		});
		const cubeCamera = new CubeCamera(0.1, 1000, cubeEnvironmentTexture);
		cubeCamera.position.set(0, 0, 0);

		const pmrem = new PMREMGenerator(renderer);

		let t: undefined | WebGLRenderTarget;

		/**
		 * Scene
		 */

		const sphereGeometry = new SphereGeometry(0.5, 32, 32);
		const sphereMaterial = new MeshStandardMaterial({
			color: 'red',
			metalness: 0.8,
			roughness: 0.21,
			envMap: cubeEnvironmentTexture.texture,
		});
		const sphere = new Mesh(sphereGeometry, sphereMaterial);
		scene.add(sphere);

		const ring = new Mesh(
			new TorusGeometry(5, 0.1, 16),
			new MeshStandardMaterial({
				color: 'white',
				emissive: 'white',
				emissiveIntensity: 3.0,
			})
		);
		scene.add(ring);

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

		function render(time: number = 0) {
			requestAnimationFrame(render);

			if (t) t.dispose();

			controls.update(time);
			sphere.visible = false;
			cubeCamera.update(renderer, scene);
			t = pmrem.fromScene(scene, 0, 0.1, 1000);
			sphere.material.envMap = t.texture;
			sphere.visible = true;

			ring.rotation.x = time * 0.001;
			ring.rotation.y = time * 0.001;

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
