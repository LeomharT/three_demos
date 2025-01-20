import { useMantineTheme } from '@mantine/core';
import { useEffect } from 'react';
import {
	AmbientLight,
	AxesHelper,
	BoxGeometry,
	Color,
	DirectionalLight,
	Layers,
	Mesh,
	MeshBasicMaterial,
	Object3D,
	PerspectiveCamera,
	Raycaster,
	ReinhardToneMapping,
	Scene,
	ShaderMaterial,
	TextureLoader,
	Vector2,
	WebGLRenderer,
} from 'three';
import {
	EffectComposer,
	FXAAShader,
	GLTFLoader,
	OrbitControls,
	OutputPass,
	RenderPass,
	ShaderPass,
	UnrealBloomPass,
} from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Pane } from 'tweakpane';
import bloomFragmentShader from './shader/bloom/fragment.glsl?raw';
import bloomVertexShader from './shader/bloom/vertex.glsl?raw';
import fragmentShader from './shader/fragment.glsl?raw';
import vertexShader from './shader/vertex.glsl?raw';

export default function Test() {
	const theme = useMantineTheme();

	const initialScene = () => {
		const el = document.querySelector('#container') as HTMLDivElement;
		el.innerHTML = '';

		/**
		 * Loader
		 */

		const textureLoader = new TextureLoader();
		textureLoader.setPath('/src/pages/SpaceStation/assets/texture');

		const gltfLoader = new GLTFLoader();
		gltfLoader.setPath('/src/pages/SpaceStation/assets/model');

		/**
		 * Basic
		 */

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.toneMapping = ReinhardToneMapping;
		el.append(renderer.domElement);

		const scene = new Scene();
		scene.background = new Color(theme.colors.dark[8]);

		const camera = new PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		camera.position.set(0, 0, 1);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;

		const stats = new Stats();
		el.append(stats.dom);

		/**
		 * Effect
		 */

		const finalComposer = new EffectComposer(renderer);

		const renderPass = new RenderPass(scene, camera);

		const bloomPass = new UnrealBloomPass(
			new Vector2(
				window.innerWidth * window.devicePixelRatio,
				window.innerHeight * window.devicePixelRatio
			),
			0.2,
			0.5,
			0
		);
		const bloomComposer = new EffectComposer(renderer);
		bloomComposer.renderToScreen = false;
		bloomComposer.addPass(renderPass);
		bloomComposer.addPass(bloomPass);

		const shitPass = new ShaderPass({
			name: 'CopyShader',
			uniforms: {
				tDiffuse: { value: null },
				opacity: { value: 1.0 },
			},
			vertexShader,
			fragmentShader,
		});

		const mixPass = new ShaderPass(
			new ShaderMaterial({
				uniforms: {
					baseTexture: { value: null },
					bloomTexture: { value: bloomComposer.renderTarget2.texture },
				},
				vertexShader: bloomVertexShader,
				fragmentShader: bloomFragmentShader,
				defines: {},
			}),
			'baseTexture'
		);
		mixPass.needsSwap = true;
		const fxaaPass = new ShaderPass(FXAAShader);

		const outPass = new OutputPass();
		finalComposer.addPass(renderPass);
		finalComposer.addPass(mixPass);
		finalComposer.addPass(shitPass);
		finalComposer.addPass(fxaaPass);
		finalComposer.addPass(outPass);

		/**
		 * Layers
		 */

		const BLOOM_LAYER = 1;

		const bloomlayer = new Layers();
		bloomlayer.set(BLOOM_LAYER);

		/**
		 * Raycaster
		 */

		const raycaster = new Raycaster();
		const point = new Vector2();

		/**
		 * Scene
		 */

		const darkMaterial = new MeshBasicMaterial({ color: 'black' });

		// Stars

		const boxGeometry = new BoxGeometry(0.25, 0.5, 0.5, 16, 16, 16);

		const box1Material = new MeshBasicMaterial({
			color: theme.colors.blue[4],
		});
		const box2Material = new MeshBasicMaterial({
			color: theme.colors.green[4],
		});

		const box1 = new Mesh(boxGeometry, box1Material);
		box1.position.x = 0.25 / 2;

		const box2 = new Mesh(boxGeometry, box2Material);
		box2.position.x = -0.25 / 2;

		scene.add(box1, box2);

		/**
		 * Lights
		 */

		const ambientLight = new AmbientLight(0xffffff);
		ambientLight.intensity = 0.1;
		scene.add(ambientLight);

		const directionalLight = new DirectionalLight();
		directionalLight.color = new Color('#edf3ed');
		directionalLight.position.set(0, -1, 1);
		scene.add(directionalLight);

		/**
		 * Helper
		 */

		const axesHelper = new AxesHelper();
		// scene.add(axesHelper);

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

		const materials: Record<string, MeshBasicMaterial> = {};

		function darkenNonBloomed(obj: Object3D) {
			if (obj instanceof Mesh) {
				if (bloomlayer.test(obj.layers) === false) {
					materials[obj.uuid] = obj.material;
					obj.material = darkMaterial;
				}
			}
		}

		function resotreMaterial(obj: Object3D) {
			if (obj instanceof Mesh) {
				if (materials[obj.uuid]) {
					obj.material = materials[obj.uuid];
					delete materials[obj.uuid];
				}
			}
		}

		function render(time?: number) {
			requestAnimationFrame(render);

			stats.update();
			controls.update(time);

			scene.traverse(darkenNonBloomed);
			bloomComposer.render();
			scene.traverse(resotreMaterial);

			finalComposer.render();
		}
		render();

		function resize() {
			renderer.setSize(window.innerWidth, window.innerHeight);
			finalComposer.setSize(window.innerWidth, window.innerHeight);
			bloomComposer.setSize(window.innerWidth, window.innerHeight);

			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		}
		window.addEventListener('resize', resize);

		function handleOnPointerDown(e: PointerEvent) {
			point.x = (e.clientX / window.innerWidth) * 2 - 1;
			point.y = -(e.clientY / window.innerHeight) * 2 + 1;

			raycaster.setFromCamera(point, camera);

			const intersects = raycaster.intersectObjects(scene.children);

			if (intersects.length) {
				const object = intersects[0].object;
				if (object instanceof Mesh) {
					object.layers.toggle(BLOOM_LAYER);
				}
			}
		}
		window.addEventListener('pointerdown', handleOnPointerDown);
	};

	useEffect(() => {
		initialScene();
	}, []);

	return <div id='container'></div>;
}
