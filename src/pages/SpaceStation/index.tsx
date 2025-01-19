import { useMantineTheme } from '@mantine/core';
import { useEffect } from 'react';
import {
	AmbientLight,
	AxesHelper,
	BufferAttribute,
	BufferGeometry,
	Color,
	DirectionalLight,
	InstancedMesh,
	MeshPhysicalMaterial,
	PerspectiveCamera,
	Points,
	Scene,
	ShaderLib,
	ShaderMaterial,
	SphereGeometry,
	TextureLoader,
	Vector2,
	WebGLRenderer,
} from 'three';
import {
	EffectComposer,
	GLTFLoader,
	OrbitControls,
	OutputPass,
	RenderPass,
	ShaderPass,
	UnrealBloomPass,
} from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Pane } from 'tweakpane';
import fragmentShader from './shader/fragment.glsl?raw';
import pointsVertexShader from './shader/points/vertex.glsl?raw';
import vertexShader from './shader/vertex.glsl?raw';
export default function SpaceStation() {
	const theme = useMantineTheme();

	function random(min: number, max: number) {
		const diff = Math.random() * (max - min);
		return min + diff;
	}

	const initialScene = () => {
		const el = document.querySelector('#container') as HTMLDivElement;
		el.innerHTML = '';

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
		scene.background = new Color(theme.colors.dark[8]);

		const camera = new PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		camera.position.setScalar(1);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;

		const stats = new Stats();
		el.append(stats.dom);

		/**
		 * Effect
		 */

		const composer = new EffectComposer(renderer);

		const renderPass = new RenderPass(scene, camera);
		composer.addPass(renderPass);

		const boolmPass = new UnrealBloomPass(
			new Vector2(
				window.innerWidth * window.devicePixelRatio,
				window.innerHeight * window.devicePixelRatio
			),
			0.2,
			0.5,
			0
		);
		// composer.addPass(boolmPass);

		const shitPass = new ShaderPass({
			name: 'CopyShader',
			uniforms: {
				tDiffuse: { value: null },
				opacity: { value: 1.0 },
			},
			vertexShader,
			fragmentShader,
		});
		composer.addPass(shitPass);

		const outPass = new OutputPass();
		composer.addPass(outPass);

		/**
		 * Loader
		 */

		const textureLoader = new TextureLoader();
		textureLoader.setPath('/src/pages/SpaceStation/assets/texture');

		const gltfLoader = new GLTFLoader();
		gltfLoader.setPath('/src/pages/SpaceStation/assets/model');

		/**
		 * Scene
		 */

		const sphereGeometry = new SphereGeometry(0.3, 32, 32);
		const sphereMaterial = new MeshPhysicalMaterial({
			transparent: true,
			color: 'white',
			iridescence: 0,
			iridescenceIOR: 1,
			roughness: 0.8,
			metalness: 0.2,
			iridescenceThicknessRange: [1, 1200],
			ior: 2,
		});
		const sphere = new InstancedMesh(sphereGeometry, sphereMaterial, 1);
		sphere.receiveShadow = true;
		sphere.castShadow = true;

		scene.add(sphere);

		// Stars
		const STAR_COUNT = 1;

		const starGeometry = new BufferGeometry();
		const starPosition = new Float32Array(STAR_COUNT * 3);
		for (let i = 0; i < STAR_COUNT; i++) {
			const i3 = i * 3;

			starPosition[i3 + 0] = 0;
			starPosition[i3 + 1] = 1;
			starPosition[i3 + 2] = 1;
		}
		const attrPosition = new BufferAttribute(starPosition, 3);
		starGeometry.setAttribute('position', attrPosition);

		const starMaterial = new ShaderMaterial({
			vertexShader: pointsVertexShader,
			fragmentShader: ShaderLib.points.fragmentShader,
			uniforms: ShaderLib.points.uniforms,
		});
		const stars = new Points(starGeometry, starMaterial);
		scene.add(stars);

		/**
		 * Lights
		 */

		const ambientLight = new AmbientLight(0xffffff);
		ambientLight.intensity = 0.1;
		scene.add(ambientLight);

		const directionalLight = new DirectionalLight();
		directionalLight.position.set(0, -1, 1);
		scene.add(directionalLight);

		/**
		 * Helper
		 */

		const axesHelper = new AxesHelper();
		scene.add(axesHelper);

		/**
		 * Pane
		 */

		const pane = new Pane({ title: 'Debug Params' });
		// Directional Light
		{
			const folder = pane.addFolder({ title: 'Directional Light' });
			folder.addBinding(directionalLight, 'color', {
				color: { type: 'float' },
			});
			folder.addBinding(directionalLight, 'intensity', {
				step: 0.1,
				max: 5.0,
				min: 1.0,
			});
		}

		/**
		 * Events
		 */

		function updatePosition() {
			const attr = starGeometry.getAttribute('position') as BufferAttribute;

			for (let i = 0; i < STAR_COUNT; i++) {
				const x = attr.getX(i) + 0.01;
				attr.needsUpdate = true;
				attr.setXYZ(0, x, 2, 0);
			}
		}

		function render(time?: number) {
			requestAnimationFrame(render);

			stats.update();
			controls.update(time);
			composer.render();
		}
		render();

		function resize() {
			renderer.setSize(window.innerWidth, window.innerHeight);
			composer.setSize(window.innerWidth, window.innerHeight);

			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		}
		window.addEventListener('resize', resize);
	};

	useEffect(() => {
		initialScene();
	}, []);

	return <div id='container'></div>;
}
