import { useEffect } from 'react';
import {
	Color,
	Mesh,
	PerspectiveCamera,
	Scene,
	ShaderChunk,
	ShaderMaterial,
	SphereGeometry,
	SRGBColorSpace,
	TorusKnotGeometry,
	Uniform,
	Vector2,
	WebGLRenderer,
} from 'three';
import { GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import fragmentShader from './shader/fragment.glsl?raw';
import ambientLightShader from './shader/include/ambientLight.glsl?raw';
import directionalLightShader from './shader/include/directionalLight.glsl?raw';
import pointLightShader from './shader/include/pointLight.glsl?raw';

import vertexShader from './shader/vertex.glsl?raw';

export default function Halftone() {
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
		renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
		renderer.outputColorSpace = SRGBColorSpace;
		el.append(renderer.domElement);

		const scene = new Scene();
		scene.background = new Color('#26132f');

		const camera = new PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		camera.position.set(3, 4, 3);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		const gltfLoader = new GLTFLoader();
		gltfLoader.setPath('/src/assets/models/');

		//@ts-ignore
		ShaderChunk['ambient_light'] = ambientLightShader;
		//@ts-ignore
		ShaderChunk['directional_light'] = directionalLightShader;
		//@ts-ignore
		ShaderChunk['point_light'] = pointLightShader;

		/**
		 * Scene
		 */

		const uniforms = {
			uColor: new Uniform(new Color('#ff794d')),
			uResolution: new Uniform(
				new Vector2(
					window.innerWidth * window.devicePixelRatio,
					window.innerHeight * window.devicePixelRatio
				)
			),
			uShadowRepetitions: new Uniform(100),
			uShadowColor: new Uniform(new Color('#8e19b8')),

			uLightRepetitions: new Uniform(130),
			uLightColor: new Uniform(new Color('#e5ffe0')),
		};

		const halftoneMaterial = new ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms,
			transparent: true,
		});

		const sphereGeometry = new SphereGeometry(1, 32, 32);
		const sphere = new Mesh(sphereGeometry, halftoneMaterial);
		sphere.position.x = -3;
		scene.add(sphere);

		const suzanne = (await gltfLoader.loadAsync('suzanne.glb')).scene;
		suzanne.traverse((mesh) => {
			if (mesh instanceof Mesh) {
				mesh.material = halftoneMaterial;
			}
		});
		scene.add(suzanne);

		const torusKnotgeometry = new TorusKnotGeometry(0.5, 0.2, 64, 24);
		const torusKnot = new Mesh(torusKnotgeometry, halftoneMaterial);
		torusKnot.position.x = 3;
		scene.add(torusKnot);

		const meshes = [sphere, suzanne, torusKnot];

		/**
		 * Pane
		 */

		const pane = new Pane({ title: 'Debug Params' });
		pane.element.parentElement!.style.width = '380px';
		{
			const scenePane = pane.addFolder({ title: '🎬 Scene' });
			scenePane.expanded = false;
			scenePane.addBinding(scene, 'background', {
				color: { type: 'float' },
			});
		}
		{
			const uniformPane = pane.addFolder({ title: '🎨 Uniform' });
			uniformPane.expanded = false;
			uniformPane.addBinding(uniforms.uColor, 'value', {
				label: 'Color',
				color: { type: 'float' },
			});
			uniformPane.addBinding(uniforms.uShadowColor, 'value', {
				label: 'Shadow Color',
				color: { type: 'float' },
			});
			uniformPane.addBinding(uniforms.uShadowRepetitions, 'value', {
				label: 'Shadow Repetitions',
				step: 1,
				min: 1,
				max: 300,
			});
			uniformPane.addBinding(uniforms.uLightColor, 'value', {
				label: 'Light Color',
				color: { type: 'float' },
			});
			uniformPane.addBinding(uniforms.uLightRepetitions, 'value', {
				label: 'Light Repetitions',
				step: 1,
				min: 1,
				max: 300,
			});
		}

		/**
		 * Events
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

			uniforms.uResolution.value.set(
				window.innerWidth * window.devicePixelRatio,
				window.innerHeight * window.devicePixelRatio
			);
		}
		window.addEventListener('resize', resize);
	}

	useEffect(() => {
		initialScene();
	}, []);

	return <div id='container'></div>;
}
