import { useEffect } from 'react';
import {
	AdditiveBlending,
	BufferGeometry,
	Color,
	Mesh,
	PerspectiveCamera,
	Points,
	Scene,
	ShaderMaterial,
	Uniform,
	Vector2,
	WebGLRenderer,
} from 'three';
import { DRACOLoader, GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import fragmentShader from './shader/fragment.glsl?raw';
import vertexShader from './shader/vertex.glsl?raw';

export default function GPGPUFlowFieldParticle() {
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
		renderer.setPixelRatio(window.devicePixelRatio);
		el.append(renderer.domElement);

		const scene = new Scene();
		scene.background = new Color(0x29191f);

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

		/**
		 * Loaders
		 */

		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath('node_modules/three/examples/jsm/libs/draco/');
		dracoLoader.setDecoderConfig({ type: 'js' });
		dracoLoader.preload();

		const gltfLoader = new GLTFLoader();
		gltfLoader.dracoLoader = dracoLoader;
		gltfLoader.setPath('/src/assets/models/');

		/**
		 * Scene
		 */

		const gltf = await gltfLoader.loadAsync('boat.glb');

		const uniforms = {
			uSize: new Uniform(0.02),
			uResolution: new Uniform(new Vector2(window.innerWidth, window.innerHeight)),
		};

		const particleGeometry = new BufferGeometry();
		particleGeometry.setAttribute(
			'position',
			(gltf.scene.children[0] as Mesh).geometry.getAttribute('position')
		);

		const particleMaterial = new ShaderMaterial({
			uniforms,
			vertexShader,
			fragmentShader,
			depthWrite: false,
			blending: AdditiveBlending,
		});
		const particle = new Points(particleGeometry, particleMaterial);
		scene.add(particle);

		/**
		 * Pane
		 */

		const pane = new Pane({ title: '🚧 Debug Params' });
		pane.element.parentElement!.style.width = '380px';
		{
			const scenePane = pane.addFolder({ title: '🎬 Scene' });
			scenePane.addBinding(scene, 'background', {
				label: 'Scene Background',
				color: { type: 'float' },
			});
		}
		{
			const pointPane = pane.addFolder({ title: '🧿 Points' });
			pointPane.addBinding(uniforms.uSize, 'value', {
				label: 'Point Size',
				step: 0.001,
				min: 0,
				max: 1,
			});
		}

		/**
		 * Events
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

			uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
		}
		window.addEventListener('resize', resize);
	}

	useEffect(() => {
		initialScene();
	}, []);

	return <div id='container'></div>;
}
