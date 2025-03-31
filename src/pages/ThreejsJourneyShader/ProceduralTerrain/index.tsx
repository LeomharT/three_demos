import { useEffect } from 'react';
import {
	ACESFilmicToneMapping,
	BoxGeometry,
	Color,
	DirectionalLight,
	EquirectangularReflectionMapping,
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
	TextureLoader,
	Uniform,
	WebGLRenderer,
} from 'three';
import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg';
import CustomShaderMaterial from 'three-custom-shader-material/vanilla';
import { RGBELoader } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Pane } from 'tweakpane';
import fragmentShader from './shader/fragment.glsl?raw';
import simplex2DNoise from './shader/include/simplex2DNoise.glsl?raw';
import vertexShader from './shader/vertex.glsl?raw';

export default function ProceduralTerrain() {
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
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = PCFSoftShadowMap;
		renderer.toneMapping = ACESFilmicToneMapping;
		renderer.toneMappingExposure = 1;
		el.append(renderer.domElement);

		const scene = new Scene();

		const camera = new PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 1000);
		camera.position.set(-10, 6, -2);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		const stats = new Stats();
		stats.showPanel(0);
		el.append(stats.dom);

		// @ts-ignore
		ShaderChunk['simplex2DNoise'] = simplex2DNoise;

		/**
		 * Loaders
		 */

		const textureLoader = new TextureLoader();
		textureLoader.setPath('/src/assets/texture/');

		const rgbeLoader = new RGBELoader();
		rgbeLoader.setPath('/src/assets/texture/hdr/');

		/**
		 * Textures
		 */

		const environmentMap = rgbeLoader.load('spruit_sunrise.hdr', (data) => {
			data.mapping = EquirectangularReflectionMapping;
		});

		/**
		 * Scene
		 */

		scene.background = environmentMap;
		scene.backgroundBlurriness = 0.5;
		scene.environment = environmentMap;

		// Board
		const boardFill = new Brush(new BoxGeometry(11, 2, 11));
		const boardHole = new Brush(new BoxGeometry(10, 2.1, 10));

		const evaluator = new Evaluator();
		const result = evaluator.evaluate(boardFill, boardHole, SUBTRACTION);
		result.geometry.clearGroups();
		result.material = new MeshStandardMaterial({
			metalness: 0,
			roughness: 0.3,
		});
		result.castShadow = true;
		result.receiveShadow = true;
		scene.add(result);

		const uniforms = {
			uTime: new Uniform(0.0),

			uPositionFrequency: new Uniform(0.2),
			uStrength: new Uniform(2.0),

			uWarpFrequency: new Uniform(5.0),
			uWarpStrength: new Uniform(0.5),

			uColorWaterDepth: new Uniform(new Color(0x002b3d)),
			uColorWaterSurface: new Uniform(new Color(0x66a8ff)),
			uColorSand: new Uniform(new Color(0xffe894)),
			uColorGrass: new Uniform(new Color(0x85d534)),
			uColorSnow: new Uniform(new Color(0xffffff)),
			uColorRock: new Uniform(new Color(0xbfbd8d)),
		};

		// Terrain
		const terrainGeometry = new PlaneGeometry(10, 10, 512, 512);
		terrainGeometry.deleteAttribute('uv');
		terrainGeometry.deleteAttribute('normal');
		terrainGeometry.rotateX(-Math.PI / 2);

		const terrainMaterial = new CustomShaderMaterial({
			baseMaterial: MeshStandardMaterial,
			vertexShader,
			fragmentShader,
			uniforms,

			metalness: 0,
			roughness: 0.5,
			color: '#85d534',
		}) as unknown as MeshStandardMaterial;

		const terrainDepthMaterial = new CustomShaderMaterial({
			baseMaterial: MeshDepthMaterial,
			vertexShader,
			fragmentShader,
			uniforms,
			depthPacking: RGBADepthPacking,
		}) as unknown as MeshDepthMaterial;

		const terrain = new Mesh(terrainGeometry, terrainMaterial);
		terrain.castShadow = true;
		terrain.receiveShadow = true;
		terrain.customDepthMaterial = terrainDepthMaterial;
		scene.add(terrain);

		// Water
		const water = new Mesh(
			new PlaneGeometry(10, 10, 1, 1),
			new MeshPhysicalMaterial({
				transmission: 1,
				roughness: 0.3,
			})
		);
		water.rotation.x = -Math.PI / 2;
		water.position.y = -0.1;
		scene.add(water);

		/**
		 * Lights
		 */
		const directionalLight = new DirectionalLight('#ffffff', 2);
		directionalLight.position.set(6.25, 3, 4);
		directionalLight.castShadow = true;
		directionalLight.shadow.mapSize.set(1024, 1024);
		directionalLight.shadow.camera.near = 0.1;
		directionalLight.shadow.camera.far = 30;
		directionalLight.shadow.camera.top = 8;
		directionalLight.shadow.camera.right = 8;
		directionalLight.shadow.camera.bottom = -8;
		directionalLight.shadow.camera.left = -8;
		scene.add(directionalLight);

		/**
		 * Pane
		 */

		const pane = new Pane({ title: '🚧 Debug Params 🚧' });
		pane.element.parentElement!.style.width = '380px';
		pane.addBinding(terrainMaterial, 'wireframe', {
			label: 'Wireframe',
		});
		pane.addBinding(uniforms.uPositionFrequency, 'value', {
			label: 'Position Frequency',
			min: 0.0,
			max: 1.0,
			step: 0.001,
		});
		pane.addBinding(uniforms.uStrength, 'value', {
			label: 'Strength',
			min: 0.0,
			max: 10.0,
			step: 0.1,
		});
		pane.addBinding(uniforms.uWarpFrequency, 'value', {
			label: 'Warp Frequency',
			min: 0.0,
			max: 10.0,
			step: 0.1,
		});
		pane.addBinding(uniforms.uWarpStrength, 'value', {
			label: 'Warp Strength',
			min: 0.0,
			max: 1.0,
			step: 0.001,
		});
		pane
			.addBinding(uniforms.uColorWaterDepth, 'value', {
				label: 'Color Water Depth',
				color: { type: 'float' },
			})
			.on('change', (val) => uniforms.uColorWaterDepth.value.set(val.value));
		pane
			.addBinding(uniforms.uColorWaterSurface, 'value', {
				label: 'Color Water Surface',
				color: { type: 'float' },
			})
			.on('change', (val) => uniforms.uColorWaterSurface.value.set(val.value));
		pane
			.addBinding(uniforms.uColorSand, 'value', {
				label: 'Color Sand',
				color: { type: 'float' },
			})
			.on('change', (val) => uniforms.uColorSand.value.set(val.value));
		pane
			.addBinding(uniforms.uColorGrass, 'value', {
				label: 'Color Grass',
				color: { type: 'float' },
			})
			.on('change', (val) => uniforms.uColorGrass.value.set(val.value));
		pane
			.addBinding(uniforms.uColorRock, 'value', {
				label: 'Color Rock',
				color: { type: 'float' },
			})
			.on('change', (val) => uniforms.uColorRock.value.set(val.value));
		pane
			.addBinding(uniforms.uColorSnow, 'value', {
				label: 'Color Snow',
				color: { type: 'float' },
			})
			.on('change', (val) => uniforms.uColorSnow.value.set(val.value));

		/**
		 * Events
		 */

		function render(time: number = 0) {
			requestAnimationFrame(render);

			stats.update();
			controls.update(time);

			uniforms.uTime.value += 0.01;

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
		}
		window.addEventListener('resize', resize);
	}

	useEffect(() => {
		initialScene();
	}, []);

	return <div id='container'></div>;
}
