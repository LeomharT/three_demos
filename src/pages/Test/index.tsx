import { useEffect } from 'react';
import {
	BufferAttribute,
	BufferGeometry,
	Color,
	PerspectiveCamera,
	Points,
	Scene,
	ShaderMaterial,
	Uniform,
	Vector2,
	WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Pane } from 'tweakpane';
import fragmentShader from './shader/fragment.glsl?raw';
import vertexShader from './shader/vertex.glsl?raw';

export default function Test() {
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
		el.append(renderer.domElement);

		const scene = new Scene();
		scene.background = new Color(0x000011);

		const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
		camera.position.set(3, 0, 3);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		const stats = new Stats();
		stats.showPanel(0);
		el.append(stats.dom);

		/**
		 * Loaders
		 */

		/**
		 * Textures
		 */

		/**
		 * Scene
		 */
		const point = {
			count: 500,
		};

		const uniforms = {
			uTime: new Uniform(0.0),
			uSize: new Uniform(0.01),
			uResolution: new Uniform(
				new Vector2(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)
			),
		};

		const pointGeometry = new BufferGeometry();

		// Attribute Position
		const positionArr = new Float32Array(point.count * 3);
		const positionAttr = new BufferAttribute(positionArr, 3);

		for (let i = 0; i < point.count; i++) {
			const i3 = i * 3;

			positionArr[i3 + 0] = Math.random() - 0.5;
			positionArr[i3 + 1] = Math.random() - 0.5;
			positionArr[i3 + 2] = Math.random() - 0.5;
		}

		pointGeometry.setAttribute('position', positionAttr);

		const pointMaterial = new ShaderMaterial({
			fragmentShader,
			vertexShader,
			uniforms,
			depthWrite: false,
			transparent: true,
		});
		const points = new Points(pointGeometry, pointMaterial);
		scene.add(points);

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

			uniforms.uTime.value += 0.1;

			renderer.render(scene, camera);
		}
		render();

		function resize() {
			sizes.width = window.innerWidth;
			sizes.height = window.innerHeight;
			sizes.pixelRatio = Math.min(2, window.devicePixelRatio);

			renderer.setSize(sizes.width, sizes.height);
			camera.aspect = sizes.width / sizes.height;
			camera.updateProjectionMatrix();

			uniforms.uResolution.value.set(
				sizes.width * sizes.pixelRatio,
				sizes.height * sizes.pixelRatio
			);
		}
		window.addEventListener('resize', resize);
	}

	useEffect(() => {
		initialScene();
	}, []);

	return <div id='container'></div>;
}
