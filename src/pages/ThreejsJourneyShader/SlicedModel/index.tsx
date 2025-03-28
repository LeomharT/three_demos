import { useEffect } from 'react';
import {
	ACESFilmicToneMapping,
	Color,
	DirectionalLight,
	DoubleSide,
	EquirectangularReflectionMapping,
	Mesh,
	MeshStandardMaterial,
	PCFSoftShadowMap,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	Uniform,
	Vector3,
	WebGLRenderer,
} from 'three';
import CustomShaderMaterial from 'three-custom-shader-material/vanilla';
import { DRACOLoader, GLTFLoader, RGBELoader } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Pane } from 'tweakpane';
import fragmentShader from './shader/fragment.glsl?raw';
import vertexShader from './shader/vertex.glsl?raw';

export default function SlicedModel() {
	async function initialScene() {
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
		// renderer.outputColorSpace = LinearSRGBColorSpace;
		el.append(renderer.domElement);

		const scene = new Scene();
		scene.background = new Color(0x000011);

		const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
		camera.position.set(-5, 5, 12);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		const stats = new Stats();
		stats.showPanel(0);
		el.append(stats.dom);

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

		const rgbeLoader = new RGBELoader();
		rgbeLoader.setPath('/src/assets/texture/hdr/');

		/**
		 * Textures
		 */

		const environmentTexture = await rgbeLoader.loadAsync('aerodynamics_workshop.hdr');
		environmentTexture.mapping = EquirectangularReflectionMapping;

		/**
		 * Scene
		 */

		scene.background = environmentTexture;
		scene.backgroundBlurriness = 0.5;

		scene.environment = environmentTexture;
		scene.environmentIntensity = 1.0;

		const uniforms = {
			uSliceStart: new Uniform(1.0),
			uSliceArc: new Uniform(1.5),
		};

		const patchMap = {
			csm_Slice: {
				'#include <colorspace_fragment>': `
					#include <colorspace_fragment>
					
					if(!gl_FrontFacing)
					{
						gl_FragColor = vec4(0.125, 0.354, 0.741, 1.0);
					}
				`,
			},
		};

		const material = new MeshStandardMaterial({
			metalness: 0.5,
			roughness: 0.25,
			envMapIntensity: 0.5,
			color: '#858080',
		});

		const slicedMaterial = new CustomShaderMaterial({
			baseMaterial: MeshStandardMaterial,
			fragmentShader,
			vertexShader,
			uniforms,
			patchMap,

			metalness: 0.5,
			roughness: 0.25,
			envMapIntensity: 0.5,
			color: '#858080',
			transparent: false,
			side: DoubleSide,
		});

		gltfLoader.load('gears.glb', (gltf) => {
			const model = gltf.scene;

			model.traverse((mesh) => {
				if (mesh instanceof Mesh) {
					if (mesh.name === 'outerHull') {
						mesh.material = slicedMaterial;
					} else {
						mesh.material = material;
					}
					mesh.castShadow = true;
					mesh.receiveShadow = true;
				}
			});

			scene.add(model);
		});

		const plane = new Mesh(
			new PlaneGeometry(10, 10, 10),
			new MeshStandardMaterial({ color: '#aaaaaa' })
		);
		plane.receiveShadow = true;
		plane.position.x = -4;
		plane.position.y = -3;
		plane.position.z = -4;
		plane.lookAt(new Vector3(0, 0, 0));
		scene.add(plane);

		/**
		 * Lights
		 */

		const directionalLight = new DirectionalLight('#ffffff', 4);
		directionalLight.position.set(6.25, 3, 4);
		directionalLight.castShadow = true;
		directionalLight.shadow.mapSize.set(1024, 1024);
		directionalLight.shadow.camera.near = 0.1;
		directionalLight.shadow.camera.far = 30;
		directionalLight.shadow.normalBias = 0.05;
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
		pane.addBinding(uniforms.uSliceStart, 'value', {
			label: 'Sliced Start',
			min: -Math.PI,
			max: Math.PI,
		});
		pane.addBinding(uniforms.uSliceArc, 'value', {
			label: 'Sliced Arc',
			min: 0,
			max: Math.PI * 2,
		});

		/**
		 * Events
		 */

		function render(time: number = 0) {
			requestAnimationFrame(render);

			stats.update();
			controls.update(time);

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
