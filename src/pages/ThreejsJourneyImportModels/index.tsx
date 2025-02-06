import { useMantineTheme } from '@mantine/core';
import { MutableRefObject, useEffect, useRef } from 'react';
import {
	AmbientLight,
	AnimationMixer,
	Color,
	DirectionalLight,
	Mesh,
	MeshStandardMaterial,
	PCFSoftShadowMap,
	PerspectiveCamera,
	PlaneGeometry,
	RepeatWrapping,
	Scene,
	SRGBColorSpace,
	TextureLoader,
	WebGLRenderer,
} from 'three';
import { GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons.js';

export default function ThreejsJourneyImportModels() {
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

		/**
		 * Loader
		 */

		const textureLoader = new TextureLoader();
		textureLoader.setPath('/src/assets/texture/');

		const gltfLoader = new GLTFLoader();
		gltfLoader.setPath('/src/assets/models/');

		/**
		 * Texture
		 */

		const alphaTexture = await textureLoader.loadAsync('alpha.png');

		const floorColorTexture = await textureLoader.loadAsync(
			'/gravelly_sand_1k/textures/gravelly_sand_diff_1k.jpg'
		);
		floorColorTexture.colorSpace = SRGBColorSpace;
		floorColorTexture.wrapS = floorColorTexture.wrapT = RepeatWrapping;
		floorColorTexture.repeat.x = 2.0;
		floorColorTexture.repeat.y = 2.0;

		const floorARMTexture = await textureLoader.loadAsync(
			'/gravelly_sand_1k/textures/gravelly_sand_arm_1k.jpg'
		);
		const floorNormalexture = await textureLoader.loadAsync(
			'/gravelly_sand_1k/textures/gravelly_sand_nor_gl_1k.png'
		);

		/**
		 * Scene
		 */

		const floorGeometry = new PlaneGeometry(5, 5, 16, 16);
		const floorMaterial = new MeshStandardMaterial({
			transparent: true,
			alphaMap: alphaTexture,
			map: floorColorTexture,
			aoMap: floorARMTexture,
			metalnessMap: floorARMTexture,
			roughnessMap: floorARMTexture,
			normalMap: floorNormalexture,
		});
		const floor = new Mesh(floorGeometry, floorMaterial);
		floor.rotation.x = -Math.PI / 2;
		floor.receiveShadow = true;
		scene.add(floor);

		let animationMixer: AnimationMixer | undefined;

		gltfLoader.load('Fox/Fox.gltf', (data) => {
			const fox = data.scene;
			fox.scale.setScalar(0.01);
			fox.traverse((mesh) => {
				if (mesh instanceof Mesh) {
					mesh.castShadow = true;
					mesh.receiveShadow = true;
				}
			});

			animationMixer = new AnimationMixer(fox);
			const clip = animationMixer.clipAction(data.animations[0]);
			clip.play();

			scene.add(fox);
		});

		/**
		 * Lights
		 */

		const ambientLight = new AmbientLight();
		scene.add(ambientLight);

		const directionalLight = new DirectionalLight();
		directionalLight.castShadow = true;
		directionalLight.intensity = 5.0;
		directionalLight.position.x = 4.0;
		directionalLight.position.y = 4.0;
		scene.add(directionalLight);

		/**
		 * Event
		 */
		let lastTime = 0;

		function render(time: number = 0) {
			requestAnimationFrame(render);

			controls.update(time);
			if (animationMixer) animationMixer.update((time - lastTime) * 0.001);

			lastTime = time;

			renderer.render(scene, camera);
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
