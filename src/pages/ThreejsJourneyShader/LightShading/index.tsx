import { useEffect } from 'react';
import {
	AxesHelper,
	Color,
	DoubleSide,
	IcosahedronGeometry,
	Mesh,
	MeshBasicMaterial,
	Object3D,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	ShaderChunk,
	ShaderMaterial,
	SphereGeometry,
	TorusKnotGeometry,
	Uniform,
	WebGLRenderer,
} from 'three';
import { GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import fragmentShader from './shader/fragment.glsl?raw';
import ambientLightShader from './shader/include/ambientLight.glsl?raw';
import vertexShader from './shader/vertex.glsl?raw';

export default function LightShading() {
	async function initialScene() {
		const el = document.querySelector('#container') as HTMLDivElement;

		/**
		 * Basic
		 */

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		el.append(renderer.domElement);

		const scene = new Scene();
		scene.background = new Color(0x000000);

		const camera = new PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);

		camera.position.set(0, 5, 5);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		/**
		 * Loader
		 */

		const gltfLoader = new GLTFLoader();
		gltfLoader.setPath('/src/assets/models/');

		/**
		 * Use vite glsl plugin or this
		 */
		// @ts-ignore
		ShaderChunk['ambient_light'] = ambientLightShader;

		/**
		 * Scene
		 */
		const uniforms = {
			uColor: new Uniform(new Color(0xffffff)),
		};

		const lightShaderMaterial = new ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms,
		});

		const sphereGeometry = new SphereGeometry(1, 32, 32);
		const sphere = new Mesh(sphereGeometry, lightShaderMaterial);
		sphere.position.x = -3;
		scene.add(sphere);

		const suzanne = await gltfLoader.loadAsync('suzanne.glb');
		suzanne.scene.traverse((mesh) => {
			if (mesh instanceof Mesh) {
				mesh.material = lightShaderMaterial;
			}
		});
		scene.add(suzanne.scene);

		const torusKnotGeometry = new TorusKnotGeometry(0.5, 0.2, 64, 16);
		const torusKnot = new Mesh(torusKnotGeometry, lightShaderMaterial);
		torusKnot.position.x = 3;
		scene.add(torusKnot);

		const meshes: Object3D[] = [sphere, suzanne.scene, torusKnot];

		const directionalHelperPlane = new Mesh(
			new PlaneGeometry(1, 1, 16, 16),
			new MeshBasicMaterial({
				color: new Color(0.1, 0.1, 1.0),
				side: DoubleSide,
			})
		);
		directionalHelperPlane.position.set(0, 0, 3);
		scene.add(directionalHelperPlane);

		const pointLightHelper = new Mesh(
			new IcosahedronGeometry(0.1, 32),
			new MeshBasicMaterial({
				color: new Color(1.0, 0.1, 0.1),
			})
		);
		pointLightHelper.position.set(0, 2.5, 0);
		scene.add(pointLightHelper);

		/**
		 * Helpers
		 */

		const axesHelper = new AxesHelper();
		scene.add(axesHelper);

		/**
		 * Pane
		 */

		const pane = new Pane({ title: 'Debug Params' });
		pane.addBinding(uniforms.uColor, 'value', {
			label: 'Material Color',
			color: { type: 'float' },
		});

		/**
		 * Evnets
		 */

		function render(time: number = 0) {
			requestAnimationFrame(render);

			controls.update(time);

			meshes.forEach((mesh) => {
				mesh.rotation.x += 0.01;
				mesh.rotation.y += 0.01;
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
