import { useEffect } from 'react';
import {
	AdditiveBlending,
	AxesHelper,
	Color,
	DoubleSide,
	Mesh,
	Object3D,
	PerspectiveCamera,
	Scene,
	ShaderMaterial,
	SphereGeometry,
	TorusKnotGeometry,
	Uniform,
	WebGLRenderer,
} from 'three';
import { GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import fragmentShader from './shader/fragment.glsl?raw';
import vertexShader from './shader/vertex.glsl?raw';

export default function Hologram() {
	async function initialScene() {
		const el = document.querySelector('#root') as HTMLDivElement;

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
		scene.background = new Color('#1d1f2a');

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

		/**
		 * Loader
		 */

		const gltfLoader = new GLTFLoader();
		gltfLoader.setPath('/src/assets/models/');

		/**
		 * Scene
		 */

		const materialParams = {
			color: '#70c1ff',
		};

		const uniforms = {
			uTime: new Uniform(0),
			uColor: new Uniform(new Color(materialParams.color)),
		};

		const hologramMaterial = new ShaderMaterial({
			transparent: true,
			wireframe: false,
			uniforms,
			fragmentShader,
			vertexShader,
			side: DoubleSide,
			depthWrite: false,
			blending: AdditiveBlending,
		});

		// Sphere
		const sphereGeometry = new SphereGeometry(1, 32, 32);
		const sphere = new Mesh(sphereGeometry, hologramMaterial);
		sphere.position.x = -3;
		scene.add(sphere);

		// Suzanne
		const suzanne = await gltfLoader.loadAsync('suzanne.glb');
		suzanne.scene.traverse((mesh) => {
			if (mesh instanceof Mesh) {
				mesh.material = hologramMaterial;
			}
		});
		scene.add(suzanne.scene);

		// TorusKnot
		const torusKnotGeometry = new TorusKnotGeometry(0.5, 0.2, 64, 16);
		const torusKnot = new Mesh(torusKnotGeometry, hologramMaterial);
		torusKnot.position.x = 3;
		scene.add(torusKnot);

		const meshes: Object3D[] = [sphere, suzanne.scene, torusKnot];

		/**
		 * Helper
		 */

		const axesHelper = new AxesHelper();
		scene.add(axesHelper);

		/**
		 * Pane
		 */

		const pane = new Pane({ title: 'Debug Params' });
		pane.element.parentElement!.style.width = '340px';
		{
			const scenePane = pane.addFolder({ title: 'Scene' });
			scenePane.addBinding(scene, 'background', {
				label: 'Scene Background',
				color: { type: 'float' },
			});
		}
		{
			const hologramPane = pane.addFolder({ title: 'Hologram' });
			hologramPane.addBinding(hologramMaterial, 'wireframe');
			hologramPane
				.addBinding(materialParams, 'color', {
					label: 'Hologram Color',
					color: { type: 'int' },
				})
				.on('change', (val) => uniforms.uColor.value.set(val.value));
		}

		/**
		 * Events
		 */

		function render(time: number = 0) {
			requestAnimationFrame(render);

			controls.update(time);

			meshes.forEach((mesh) => {
				// mesh.rotation.x += 0.01;
				// mesh.rotation.y += 0.01;
			});
			uniforms.uTime.value += 0.01;

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
	return <div></div>;
}
