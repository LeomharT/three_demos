import { useEffect } from 'react';
import {
	Color,
	DoubleSide,
	Mesh,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	ShaderMaterial,
	Vector2,
	WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import fragmentShader from './shader/fragment.glsl?raw';
import vertexShader from './shader/vertex.glsl?raw';

export default function RagingSea() {
	async function initialScene() {
		const el = document.querySelector('#root') as HTMLDivElement;

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(window.devicePixelRatio);
		el.append(renderer.domElement);

		const scene = new Scene();
		scene.background = new Color(0x000000);

		const camera = new PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		camera.position.set(1, 1, 1);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		/**
		 * Scene
		 */

		const uniforms = {
			uTime: { value: 0 },
			uBigWaveElevation: { value: 0.1 },
			uBigWaveFrequency: { value: new Vector2(4, 1.5) },
		};

		const planeGeometry = new PlaneGeometry(1, 1, 64, 64);
		const planeMaterial = new ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms,
			side: DoubleSide,
			transparent: true,
			wireframe: false,
		});
		const plane = new Mesh(planeGeometry, planeMaterial);
		plane.rotation.x = -Math.PI / 2;
		scene.add(plane);

		/**
		 * Pane
		 */

		const pane = new Pane({ title: 'Debug Params' });
		pane.element.parentElement!.style.width = '325px';
		pane.addBinding(uniforms.uBigWaveElevation, 'value', {
			label: 'Big Wave Elevation',
			min: -0.2,
			max: 0.2,
			step: 0.001,
		});
		pane.addBinding(uniforms.uBigWaveFrequency.value, 'x', {
			label: 'Big Wave Frequency X',
			min: 0,
			max: 30,
		});
		pane.addBinding(uniforms.uBigWaveFrequency.value, 'y', {
			label: 'Big Wave Frequency Y',
			min: 0,
			max: 30,
		});
		pane.addBinding(planeMaterial, 'wireframe');

		/**
		 * Events
		 */

		function render(time: number = 0) {
			requestAnimationFrame(render);

			controls.update(time);

			renderer.render(scene, camera);

			uniforms.uTime.value += 0.01;
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
