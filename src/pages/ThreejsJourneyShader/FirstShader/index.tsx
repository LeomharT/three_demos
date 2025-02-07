import { useMantineTheme } from '@mantine/core';
import { MutableRefObject, useEffect, useRef } from 'react';
import {
	Color,
	DirectionalLight,
	DoubleSide,
	Mesh,
	PCFSoftShadowMap,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	ShaderMaterial,
	TextureLoader,
	Vector2,
	WebGLRenderer,
} from 'three';
import {
	EffectComposer,
	RenderPass,
	UnrealBloomPass,
} from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Pane } from 'tweakpane';
import fragmentShader from './shader/fragment.glsl?raw';
import vertexShader from './shader/vertex.glsl?raw';
import ColorTexture from './USFlag.png';

export default function FirstShader() {
	const el = useRef<HTMLDivElement>(null) as MutableRefObject<HTMLDivElement>;

	const theme = useMantineTheme();

	async function initailScene() {
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
		renderer.shadowMap.type = PCFSoftShadowMap;
		el.current.append(renderer.domElement);

		const scene = new Scene();
		scene.background = new Color(theme.colors.gray[9]);

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

		const compose = new EffectComposer(renderer);

		const renderPass = new RenderPass(scene, camera);
		compose.addPass(renderPass);

		const bloomPass = new UnrealBloomPass(
			new Vector2(window.innerWidth, window.innerHeight),
			0.234,
			0.5,
			0
		);
		compose.addPass(bloomPass);

		/**
		 * Loader
		 */

		const textureLoader = new TextureLoader();
		const flag = await textureLoader.loadAsync(ColorTexture);

		/**
		 * Scene
		 */

		const uniforms = {
			uTime: { value: 0 },
			uTexture: { value: flag },
		};

		const planeGeometry = new PlaneGeometry(1.6, 1, 64, 64);

		const planeMaterial = new ShaderMaterial({
			uniforms,
			fragmentShader,
			vertexShader,
			wireframe: false,
			side: DoubleSide,
			transparent: true,
			shadowSide: PCFSoftShadowMap,
		});

		const plane = new Mesh(planeGeometry, planeMaterial);

		scene.add(plane);

		/**
		 * Light
		 */

		const directionalLight = new DirectionalLight();
		directionalLight.position.z = 2;
		scene.add(directionalLight);

		/**
		 * Pane
		 */

		const pane = new Pane({ title: 'Debug Params' });
		{
			const bloomPane = pane.addFolder({ title: 'Bloom' });
			bloomPane.addBinding(bloomPass, 'enabled');
			bloomPane.addBinding(bloomPass, 'strength', {
				min: 0,
				max: 1,
				step: 0.0001,
			});
			bloomPane.addBinding(bloomPass, 'radius', {
				min: 0,
				max: 1,
				step: 0.0001,
			});
		}

		/**
		 * Event
		 */

		let lastTime = 0;

		function render(time: number = 0) {
			requestAnimationFrame(render);

			controls.update(time);

			lastTime = time;

			uniforms.uTime.value = ((time * 0.001) % Math.PI) * 2;

			compose.render(time);
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
		initailScene();
	}, []);
	return <div id='container' ref={(ref: HTMLDivElement) => (el.current = ref)}></div>;
}
