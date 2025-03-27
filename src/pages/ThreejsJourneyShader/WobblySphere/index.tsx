import { useEffect } from 'react';
import {
	Color,
	CubeTextureLoader,
	DirectionalLight,
	IcosahedronGeometry,
	Mesh,
	MeshDepthMaterial,
	MeshPhysicalMaterial,
	MeshStandardMaterial,
	PCFSoftShadowMap,
	PerspectiveCamera,
	PlaneGeometry,
	RGBADepthPacking,
	Scene,
	ShaderChunk,
	Uniform,
	WebGLRenderer,
} from 'three';
import CustomShaderMaterial from 'three-custom-shader-material/vanilla';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Pane } from 'tweakpane';
import fragmentShader from './shader/fragment.glsl?raw';
import simplex4DNoise from './shader/include/simplex4DNoise.glsl?raw';
import vertexShader from './shader/vertex.glsl?raw';
export default function WobblySphere() {
	async function initialScene() {
		/**
		 * Document
		 */

		const el = document.querySelector('#container') as HTMLDivElement;
		const size = {
			width: window.innerWidth,
			height: window.innerHeight,
			devicePixelRatio: Math.min(window.devicePixelRatio, 2),
		};

		/**
		 * Basic
		 */

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.setSize(size.width, size.height);
		renderer.setPixelRatio(size.devicePixelRatio);
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = PCFSoftShadowMap;
		el.append(renderer.domElement);

		const scene = new Scene();

		const camera = new PerspectiveCamera(75, size.width / size.height, 0.1, 1000);
		camera.position.set(5, 5, -5);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		// @ts-ignore
		ShaderChunk['simplex4DNoise'] = simplex4DNoise;

		/**
		 * Loaders
		 */

		const cubeTextureLoader = new CubeTextureLoader();
		cubeTextureLoader.setPath('/src/assets/texture/env/');

		/**
		 * Textures
		 */

		const environmentMap = cubeTextureLoader.load([
			'1/px.png',
			'1/nx.png',
			'1/py.png',
			'1/ny.png',
			'1/pz.png',
			'1/nz.png',
		]);
		scene.background = environmentMap;
		scene.environment = environmentMap;

		/**
		 * Scene
		 */

		const uniforms = {
			uTime: new Uniform(0.0),
			uPositionFrequency: new Uniform(0.5),
			uTimeFrequency: new Uniform(0.4),
			uStrength: new Uniform(0.3),

			uWarpPositionFrequency: new Uniform(0.38),
			uWarpTimeFrequency: new Uniform(0.12),
			uWarpStrength: new Uniform(1.7),

			uColorA: new Uniform(new Color(0x0000ff)),
			uColorB: new Uniform(new Color(0xff0000)),
		};

		let wobblySphereGeometry = new IcosahedronGeometry(2.5, 50);
		wobblySphereGeometry = mergeVertices(wobblySphereGeometry) as IcosahedronGeometry;
		wobblySphereGeometry.computeTangents();

		const wobblySphereMaterial = new CustomShaderMaterial({
			// CMS
			baseMaterial: MeshPhysicalMaterial,
			fragmentShader,
			vertexShader,
			uniforms,

			// MeshPhysicalMaterial
			metalness: 0,
			roughness: 0.5,
			color: '#ffffff',
			transmission: 0,
			ior: 1.5,
			thickness: 1.5,
			transparent: true,
			wireframe: false,
		}) as unknown as MeshPhysicalMaterial;

		const depthMaterial = new CustomShaderMaterial({
			// CMS
			baseMaterial: MeshDepthMaterial,
			vertexShader,
			uniforms,

			// MeshDepthMaterial
			depthPacking: RGBADepthPacking,
		});

		const wobblySphere = new Mesh(wobblySphereGeometry, wobblySphereMaterial);
		wobblySphere.customDepthMaterial = depthMaterial;
		wobblySphere.castShadow = true;
		wobblySphere.receiveShadow = true;
		scene.add(wobblySphere);

		const lightDebugPlane = new Mesh(
			new PlaneGeometry(15, 15, 15),
			new MeshStandardMaterial()
		);
		lightDebugPlane.rotation.y = Math.PI;
		lightDebugPlane.position.set(0, -5, 5);
		lightDebugPlane.receiveShadow = true;
		scene.add(lightDebugPlane);

		/**
		 * Light
		 */
		const directionalLight = new DirectionalLight('#ffffff', 3);
		directionalLight.castShadow = true;
		directionalLight.shadow.mapSize.set(1024, 1024);
		directionalLight.shadow.camera.far = 15;
		directionalLight.shadow.normalBias = 0.05;
		directionalLight.position.set(0.25, 2, -2.25);
		scene.add(directionalLight);

		/**
		 * Pane
		 */

		const pane = new Pane({ title: 'Debug Params' });
		pane.element.parentElement!.style.width = '380px';
		pane.addBinding(wobblySphereMaterial, 'metalness', {
			label: 'Material Metalness',
			max: 1,
			min: 0,
			step: 0.001,
		});
		pane.addBinding(wobblySphereMaterial, 'roughness', {
			label: 'Material Roughness',
			max: 1,
			min: 0,
			step: 0.001,
		});
		pane.addBinding(wobblySphereMaterial, 'ior', {
			label: 'Material IOR',
			max: 10,
			min: 0,
			step: 0.001,
		});
		pane.addBinding(wobblySphereMaterial, 'transmission', {
			label: 'Material Transmission',
			max: 1,
			min: 0,
			step: 0.001,
		});
		pane.addBinding(wobblySphereMaterial, 'thickness', {
			label: 'Material Thickness',
			max: 1,
			min: 0,
			step: 0.001,
		});
		pane.addBinding(wobblySphereMaterial, 'color', {
			label: 'Material Color',
			color: { type: 'float' },
		});
		pane.addBinding(uniforms.uPositionFrequency, 'value', {
			label: 'Position Frequency',
			step: 0.001,
			min: 0,
			max: 2,
		});
		pane.addBinding(uniforms.uTimeFrequency, 'value', {
			label: 'Time Frequency',
			step: 0.001,
			min: 0,
			max: 2,
		});
		pane.addBinding(uniforms.uStrength, 'value', {
			label: 'Strength',
			step: 0.001,
			min: 0,
			max: 2,
		});
		pane.addBinding(uniforms.uWarpPositionFrequency, 'value', {
			label: 'Warp Position Frequency',
			step: 0.001,
			min: 0,
			max: 2,
		});
		pane.addBinding(uniforms.uWarpTimeFrequency, 'value', {
			label: 'Warp Time Frequency',
			step: 0.001,
			min: 0,
			max: 2,
		});
		pane.addBinding(uniforms.uWarpStrength, 'value', {
			label: 'Warp Strength',
			step: 0.001,
			min: 0,
			max: 2,
		});
		pane
			.addBinding(uniforms.uColorA, 'value', {
				label: 'Color A',
				color: { type: 'float' },
			})
			.on('change', (val) => uniforms.uColorA.value.set(val.value));
		pane
			.addBinding(uniforms.uColorB, 'value', {
				label: 'Color B',
				color: { type: 'float' },
			})
			.on('change', (val) => uniforms.uColorB.value.set(val.value));

		/**
		 * Events
		 */

		function render(time: number = 0) {
			controls.update(time);

			renderer.render(scene, camera);

			uniforms.uTime.value += 0.01;

			requestAnimationFrame(render);
		}
		render();

		function resize() {
			size.width = window.innerWidth;
			size.height = window.innerHeight;

			renderer.setSize(size.width, size.height);
			camera.aspect = size.width / size.height;
			camera.updateProjectionMatrix();
		}
		window.addEventListener('resize', resize);
	}

	useEffect(() => {
		initialScene();
	}, []);

	return <div id='container'></div>;
}
