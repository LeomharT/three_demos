import { useEffect } from 'react';
import {
	Color,
	DoubleSide,
	Mesh,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	ShaderChunk,
	ShaderMaterial,
	Uniform,
	Vector2,
	WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import fragmentShader from './shader/fragment.glsl?raw';
import perlinClassic3D from './shader/include/perlinClassic3D.glsl?raw';
import vertexShader from './shader/vertex.glsl?raw';

export default function RegingSeaLightShading() {
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
		renderer.setPixelRatio(Math.max(2, window.devicePixelRatio));
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

		// @ts-ignore
		ShaderChunk['perlinClassic3D'] = perlinClassic3D;

		/**
		 * Scene
		 */
		const uniforms = {
			uTime: new Uniform(0),

			uBigWaveElevation: new Uniform(0.2),
			uBigWaveFrequency: new Uniform(new Vector2(4, 1.5)),
			uBigWaveSpeed: new Uniform(0.75),

			uSmallWaveElevation: new Uniform(0.15),
			uSmallWaveFrequency: new Uniform(3.0),
			uSmallWaveSpeed: new Uniform(0.2),

			uBigWaveDepthColor: new Uniform(new Color('#ff4000')),
			uBigWaveSurfaceColor: new Uniform(new Color('#151c37')),
			uBigWaveColorOffset: new Uniform(0.925),
			uBigWaveColorMultiplier: new Uniform(1.0),
		};

		const regingSeaGeometry = new PlaneGeometry(2, 2, 512, 512);
		const regingSeaMaterial = new ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms,
			side: DoubleSide,
			transparent: true,
		});
		const regingSea = new Mesh(regingSeaGeometry, regingSeaMaterial);
		regingSea.rotation.x = -Math.PI / 2;
		scene.add(regingSea);

		/**
		 * Pane
		 */
		const pane = new Pane({ title: 'Debug Params' });
		pane.element.parentElement!.style.width = '380px';
		{
			const regingPane = pane.addFolder({ title: 'Reging Sea' });
			const bigWave = regingPane.addFolder({ title: 'Big Wave' });
			bigWave.addBinding(uniforms.uBigWaveElevation, 'value', {
				label: 'Big Wave Elevation',
				step: 0.001,
				min: 0,
				max: 1,
			});
			bigWave.addBinding(uniforms.uBigWaveFrequency.value, 'x', {
				label: 'Big Wave Frequency X',
				step: 0.001,
				min: 1,
				max: 30,
			});
			bigWave.addBinding(uniforms.uBigWaveFrequency.value, 'y', {
				label: 'Big Wave Frequency Y',
				step: 0.001,
				min: 1,
				max: 30,
			});
			bigWave.addBinding(uniforms.uBigWaveDepthColor, 'value', {
				label: 'Big Wave Depth Color',
				color: { type: 'float' },
			});
			bigWave.addBinding(uniforms.uBigWaveSurfaceColor, 'value', {
				label: 'Big Wave Surface Color',
				color: { type: 'float' },
			});
			bigWave.addBinding(uniforms.uBigWaveColorMultiplier, 'value', {
				label: 'Big Wave Color Multiplier',
				step: 0.001,
				min: 1,
				max: 10,
			});
			const smallWave = regingPane.addFolder({ title: 'Small Wave' });
			smallWave.addBinding(uniforms.uSmallWaveElevation, 'value', {
				label: 'Small Wave Elevation',
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

			uniforms.uTime.value += 0.01;

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
