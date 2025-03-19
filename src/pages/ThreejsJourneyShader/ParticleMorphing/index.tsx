import { LoadingOverlay } from '@mantine/core';
import gsap from 'gsap';
import { useEffect, useState } from 'react';
import {
	AdditiveBlending,
	BufferGeometry,
	Color,
	Float32BufferAttribute,
	LoadingManager,
	Mesh,
	PerspectiveCamera,
	Points,
	Scene,
	ShaderChunk,
	ShaderMaterial,
	Uniform,
	Vector2,
	WebGLRenderer,
} from 'three';
import { DRACOLoader, GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import fragmentShader from './shader/fragment.glsl?raw';
import simplexNoise3d from './shader/include/simplexNoise3d.glsl?raw';
import vertexShader from './shader/vertex.glsl?raw';
export default function ParticleMorphing() {
	const [loading, setLoading] = useState(true);

	async function initialScreen() {
		/**
		 * Docuement
		 */

		const el = document.querySelector('#container') as HTMLDivElement;

		/**
		 * Basic
		 */

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
		el.append(renderer.domElement);

		const scene = new Scene();
		scene.background = new Color(0x160920);

		const camera = new PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		camera.position.set(5, 5, 5);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		/**
		 * Loaders
		 */

		const loaderManager = new LoadingManager();
		loaderManager.onLoad = () => {
			setLoading(false);
		};
		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath('node_modules/three/examples/jsm/libs/draco/');
		dracoLoader.setDecoderConfig({ type: 'js' });
		dracoLoader.preload();

		const gltfLoader = new GLTFLoader(loaderManager);
		gltfLoader.dracoLoader = dracoLoader;
		gltfLoader.setPath('/src/assets/models');

		// @ts-ignore
		ShaderChunk['simplexNoise'] = simplexNoise3d;

		/**
		 * Params
		 */

		const uniforms = {
			uSize: new Uniform(0.2),
			uResolution: new Uniform(
				new Vector2(
					window.innerWidth * window.devicePixelRatio,
					window.innerHeight * window.devicePixelRatio
				)
			),
			uProgress: new Uniform(0),
		};

		/**
		 * Scene
		 */
		const gltf = await gltfLoader.loadAsync('/models.glb');

		// Positions
		const positions = gltf.scene.children.map((child) => {
			return (child as Mesh).geometry.getAttribute('position');
		});

		// Max Particle Count
		let particleMaxCount = 0;

		for (const position of positions) {
			if (position.count > particleMaxCount) {
				particleMaxCount = position.count;
			}
		}

		// New Particle Position
		const particlePositions = [];

		for (const position of positions) {
			const originalArray = position.array;
			const newArray = new Float32Array(particleMaxCount * 3);

			for (let i = 0; i < particleMaxCount; i++) {
				const i3 = i * 3;

				if (i3 < originalArray.length) {
					newArray[i3 + 0] = originalArray[i3 + 0];
					newArray[i3 + 1] = originalArray[i3 + 1];
					newArray[i3 + 2] = originalArray[i3 + 2];
				} else {
					const randomIndex = Math.floor(position.count * Math.random()) * 3;
					newArray[i3 + 0] = originalArray[randomIndex + 0];
					newArray[i3 + 1] = originalArray[randomIndex + 1];
					newArray[i3 + 2] = originalArray[randomIndex + 2];
				}
			}

			particlePositions.push(new Float32BufferAttribute(newArray, 3));
		}

		const particleGeometry = new BufferGeometry();
		particleGeometry.setAttribute('position', particlePositions[1]);
		particleGeometry.setAttribute('aPositionTarget', particlePositions[3]);

		const particleMaterial = new ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms,
			blending: AdditiveBlending,
			depthWrite: false,
		});
		const particle = new Points(particleGeometry, particleMaterial);
		scene.add(particle);

		/**
		 * Pane
		 */

		const pane = new Pane({ title: '🚧 Debug Params 🚧' });
		pane.element.parentElement!.style.width = '380px';
		{
			const scenePane = pane.addFolder({ title: '🎞️ Scene' });
			scenePane
				.addBinding(scene, 'background', {
					label: 'Scene Background',
					color: {
						type: 'float',
					},
				})
				.on('change', (val) => {
					scene.background = val.value;
				});
		}
		{
			const particlePane = pane.addFolder({ title: '🧿 Particle' });
			particlePane.addBinding(uniforms.uSize, 'value', {
				label: 'Particle Size',
				min: 0,
				max: 1,
				step: 0.001,
			});
			particlePane.addBinding(uniforms.uProgress, 'value', {
				label: 'Particle Morphing Porgress',
				min: 0,
				max: 1,
				step: 0.01,
			});
			particlePane
				.addButton({
					title: 'Morphing 01',
				})
				.on('click', () => {
					gsap.to(uniforms.uProgress, {
						duration: 0.4,
						value: 1,
						ease: 'linear',
					});
				});
		}

		/**
		 * Events
		 */

		function render(time: number = 0) {
			// Update
			controls.update(time);

			// Render
			renderer.render(scene, camera);

			requestAnimationFrame(render);
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
		initialScreen();
	}, []);

	return (
		<div id='container' style={{ width: '100vw', height: '100vh' }}>
			<LoadingOverlay visible={loading} />
		</div>
	);
}
