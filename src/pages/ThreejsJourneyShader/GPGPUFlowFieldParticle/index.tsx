import { useEffect } from 'react';
import {
	AdditiveBlending,
	BufferAttribute,
	BufferGeometry,
	Color,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	Points,
	Scene,
	ShaderMaterial,
	Uniform,
	Vector2,
	WebGLRenderer,
} from 'three';
import {
	DRACOLoader,
	GLTFLoader,
	GPUComputationRenderer,
	OrbitControls,
} from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import fragmentShader from './shader/fragment.glsl?raw';
import gpgpuShader from './shader/gpgpu/particle.glsl?raw';
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

		// Base Geometry
		const baseGeometry: { [key: string]: any } = {};
		baseGeometry.instance = (gltf.scene.children[0] as Mesh).geometry;
		baseGeometry.count = baseGeometry.instance.attributes.position.count;

		// GPU Computation
		const gpgpuSize = Math.ceil(Math.sqrt(baseGeometry.count));
		const gpgpu = new GPUComputationRenderer(gpgpuSize, gpgpuSize, renderer);

		// Base Particle
		const baseParticlesTexture = gpgpu.createTexture();

		for (let i = 0; i < baseGeometry.count; i++) {
			const i3 = i * 3;
			const i4 = i * 4;

			baseParticlesTexture.image.data[i4 + 0] =
				baseGeometry.instance.attributes.position.array[i3 + 0];
			baseParticlesTexture.image.data[i4 + 1] =
				baseGeometry.instance.attributes.position.array[i3 + 1];
			baseParticlesTexture.image.data[i4 + 2] =
				baseGeometry.instance.attributes.position.array[i3 + 2];
			baseParticlesTexture.image.data[i4 + 3] = 0.0;
		}

		const particleVariable = gpgpu.addVariable(
			'uParticle',
			gpgpuShader,
			baseParticlesTexture
		);
		gpgpu.setVariableDependencies(particleVariable, [particleVariable]);
		gpgpu.init();

		const uniforms = {
			uSize: new Uniform(0.02),
			uResolution: new Uniform(new Vector2(window.innerWidth, window.innerHeight)),
			uParticleTexture: new Uniform(null as any),
		};

		// Particle UV
		const particleUVArray = new Float32Array(baseGeometry.count * 2);
		const particleUVAttr = new BufferAttribute(particleUVArray, 2);
		for (let y = 0; y < gpgpuSize; y++) {
			for (let x = 0; x < gpgpuSize; x++) {
				const i = y * gpgpuSize + x;
				const i2 = i * 2;

				const uvX = (x + 0.5) / gpgpuSize;
				const uvY = (y + 0.5) / gpgpuSize;

				particleUVArray[i2 + 0] = uvX;
				particleUVArray[i2 + 1] = uvY;
			}
		}

		const particleGeometry = new BufferGeometry();
		particleGeometry.setDrawRange(0, baseGeometry.count);
		particleGeometry.setAttribute('aParticleUv', particleUVAttr);

		const particleMaterial = new ShaderMaterial({
			uniforms,
			vertexShader,
			fragmentShader,
			depthWrite: false,
			blending: AdditiveBlending,
		});
		const particle = new Points(particleGeometry, particleMaterial);
		scene.add(particle);

		const debug = new Mesh(
			new PlaneGeometry(2, 2),
			new MeshBasicMaterial({
				map: gpgpu.getCurrentRenderTarget(particleVariable).texture,
			})
		);
		debug.position.x = 3;
		scene.add(debug);

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

			// GPGPU Update
			gpgpu.compute();
			uniforms.uParticleTexture.value =
				gpgpu.getCurrentRenderTarget(particleVariable).texture;

			// Render normal scene
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
