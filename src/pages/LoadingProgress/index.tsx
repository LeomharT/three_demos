import nprogress from 'nprogress';
import 'nprogress/nprogress.css';
import { useEffect } from 'react';
import {
	ACESFilmicToneMapping,
	AgXToneMapping,
	CineonToneMapping,
	CustomToneMapping,
	DirectionalLight,
	EquirectangularReflectionMapping,
	LinearToneMapping,
	LoadingManager,
	Mesh,
	NeutralToneMapping,
	NoToneMapping,
	PerspectiveCamera,
	PlaneGeometry,
	ReinhardToneMapping,
	Scene,
	ShaderMaterial,
	Uniform,
	WebGLRenderer,
} from 'three';
import { GLTFLoader, OrbitControls, RGBELoader } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';

nprogress.configure({
	showSpinner: true,
});

export default function LoadingProgress() {
	function initialScene() {
		const el = document.querySelector('#container') as HTMLDivElement;
		const size = {
			width: window.innerWidth,
			height: window.innerHeight,
			pixelratio: Math.min(2, window.devicePixelRatio),
		};
		nprogress.start();

		/**
		 * BASIC
		 */

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.setSize(size.width, size.height);
		renderer.setPixelRatio(size.pixelratio);
		renderer.toneMapping = ReinhardToneMapping;
		renderer.toneMappingExposure = 1.0;
		el.append(renderer.domElement);

		const scene = new Scene();

		const camera = new PerspectiveCamera(75, size.width / size.height, 0.1, 500);
		camera.position.set(4, 5, 4);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.target.y = 3.5;
		controls.enableDamping = true;

		/**
		 * LOADER
		 */

		const loadingManager = new LoadingManager(
			() => {
				overlayMaterial.uniforms.uAlpha.value = 0.0;
			},
			(url, loaded, total) => {
				console.log(loaded / total);
				nprogress.set(loaded / total);
			}
		);

		const rgbeLoader = new RGBELoader(loadingManager);
		rgbeLoader.setPath('/src/assets/texture/hdr/');

		const gltfLoader = new GLTFLoader(loadingManager);
		gltfLoader.setPath('/src/assets/models/');

		/**
		 * TEXTURE
		 */

		rgbeLoader.load('2k.hdr', (data) => {
			data.mapping = EquirectangularReflectionMapping;

			scene.background = data;

			scene.environment = data;
			scene.environmentIntensity = 1.0;
		});

		/**
		 * OVERLAY
		 */

		const overlayGeometry = new PlaneGeometry(2, 2, 1, 1);
		const overlayMaterial = new ShaderMaterial({
			transparent: true,
			uniforms: {
				uAlpha: new Uniform(1.0),
			},
			vertexShader: `
				void main()
				{
					gl_Position = vec4(position, 1.0);
				}
			`,
			fragmentShader: `
				uniform float uAlpha;

				void main()
				{
					gl_FragColor = vec4(vec3(1.0), uAlpha);
				}
			`,
		});
		const overlay = new Mesh(overlayGeometry, overlayMaterial);
		scene.add(overlay);

		/**
		 * SCENE
		 */

		gltfLoader.load('/FlightHelmet/FlightHelmet.gltf', (data) => {
			const helmet = data.scene;
			helmet.scale.set(10, 10, 10);

			scene.add(helmet);
		});

		/**
		 * LIGHT
		 */

		const directionalLight = new DirectionalLight(0xffffff, 6);
		directionalLight.position.set(-4, 6.5, 2.5);
		directionalLight.shadow.mapSize.setScalar(512);
		directionalLight.target.position.set(0, 4, 0);
		directionalLight.target.updateWorldMatrix(true, true);
		directionalLight.shadow.camera.near = 0.1;
		directionalLight.shadow.camera.far = 15;
		directionalLight.castShadow = true;
		scene.add(directionalLight);

		/**
		 * PANE
		 */

		const pane = new Pane({ title: 'Debug' });
		pane.element.parentElement!.style.width = '380px';

		// Renderer
		{
			const folder = pane.addFolder({ title: '🎬 Renderer' });
			folder.addBinding(renderer, 'toneMapping', {
				label: 'Tonemapping',
				options: [
					{ text: 'NoToneMapping', value: NoToneMapping },
					{ text: 'LinearToneMapping', value: LinearToneMapping },
					{ text: 'ReinhardToneMapping', value: ReinhardToneMapping },
					{ text: 'CineonToneMapping', value: CineonToneMapping },
					{ text: 'ACESFilmicToneMapping', value: ACESFilmicToneMapping },
					{ text: 'CustomToneMapping', value: CustomToneMapping },
					{ text: 'AgXToneMapping', value: AgXToneMapping },
					{ text: 'NeutralToneMapping', value: NeutralToneMapping },
				],
			});
		}
		// Scene
		{
			const folder = pane.addFolder({ title: '🌅 Scene' });
			folder.addBinding(scene, 'environmentIntensity', {
				label: 'Scene Environment Intensity',
				min: 0,
				max: 5,
				step: 0.001,
			});
		}

		/**
		 * EVENTS
		 */

		function render(time: number = 0) {
			requestAnimationFrame(render);

			controls.update(time);

			renderer.render(scene, camera);
		}
		render();

		function resize() {
			size.width = window.innerWidth;
			size.height = window.innerHeight;
			size.pixelratio = Math.min(window.devicePixelRatio);

			renderer.setSize(size.width, size.height);
			renderer.setPixelRatio(size.pixelratio);

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
