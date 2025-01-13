import { Box } from '@mantine/core';
import { useEffect } from 'react';
import {
	AmbientLight,
	AxesHelper,
	BoxGeometry,
	Clock,
	Color,
	DirectionalLight,
	DirectionalLightHelper,
	HemisphereLight,
	HemisphereLightHelper,
	Mesh,
	MeshStandardMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	PointLight,
	RectAreaLight,
	Scene,
	SphereGeometry,
	SpotLight,
	SpotLightHelper,
	SRGBColorSpace,
	TextureLoader,
	TorusGeometry,
	WebGLRenderer,
} from 'three';
import { OrbitControls, RectAreaLightHelper } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Pane } from 'tweakpane';

export default function LightBasic() {
	useEffect(() => {
		const { innerWidth, innerHeight } = window;

		const el = document.querySelector('#container') as HTMLDivElement;
		el.innerHTML = '';

		/**
		 * Basic
		 */
		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.shadowMap.enabled = true;
		renderer.setSize(innerWidth, innerHeight);
		renderer.setAnimationLoop(render);
		renderer.setPixelRatio(window.devicePixelRatio);

		el.append(renderer.domElement);

		const scene = new Scene();
		scene.background = new Color(0x000000);

		const camera = new PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 500);
		camera.position.set(3, 3, 3);
		camera.lookAt(scene.position);

		const controler = new OrbitControls(camera, renderer.domElement);
		controler.enablePan = false;
		controler.enableDamping = true;
		controler.dampingFactor = 0.05;
		controler.target.set(0, 0, 0);

		const stats = new Stats();
		el.append(stats.dom);

		const textureLoader = new TextureLoader();
		textureLoader.setPath('/src/pages/LightBasic/assets/');

		const spotLightMap = textureLoader.load('leaves_forest_ground_diff_1k.jpg');

		/**
		 * Scene
		 */

		const material = new MeshStandardMaterial();
		material.roughness = 0.1;

		const floorGeometry = new PlaneGeometry(5, 5, 16, 16);
		const floor = new Mesh(floorGeometry, material);
		floor.castShadow = true;
		floor.receiveShadow = true;
		floor.rotation.x = -Math.PI / 2;
		floor.position.y = -0.65;
		scene.add(floor);

		const sphereGeometry = new SphereGeometry(0.5, 32, 32);
		const sphere = new Mesh(sphereGeometry, material);
		sphere.castShadow = true;
		sphere.receiveShadow = true;
		sphere.position.set(-1.5, 0.0, 0.0);
		scene.add(sphere);

		const cubeGeometry = new BoxGeometry(0.75, 0.75, 0.75);
		const cube = new Mesh(cubeGeometry, material);
		cube.castShadow = true;
		cube.receiveShadow = true;
		cube.position.set(0.0, 0.0, 0.0);
		scene.add(cube);

		const torusGeometry = new TorusGeometry(0.3, 0.2, 32, 64);
		const torus = new Mesh(torusGeometry, material);
		torus.castShadow = true;
		torus.receiveShadow = true;
		torus.position.set(1.5, 0.0, 0.0);
		scene.add(torus);

		/**
		 * Lights
		 */

		const ambientLight = new AmbientLight(0xffffff, 1.0);
		scene.add(ambientLight);

		const directionalLight = new DirectionalLight(0x00fffc, 0.9);
		directionalLight.position.set(1.0, 0.25, 0);
		scene.add(directionalLight);

		const hemisphereLight = new HemisphereLight(0xff0000, 0x0000ff, 0.9);
		scene.add(hemisphereLight);

		const pointLight = new PointLight(0xff9000, 1.5);
		pointLight.position.set(1.0, -0.5, 1.0);
		pointLight.distance = 3.0;
		pointLight.decay = 2.0;
		scene.add(pointLight);

		const rectAreaLight = new RectAreaLight(0x4e00ff, 6, 1, 1);
		rectAreaLight.position.set(-1.5, 0, 1.5);
		rectAreaLight.lookAt(scene.position);
		scene.add(rectAreaLight);

		const spotLight = new SpotLight(0x78ff00, 5.5, 7, Math.PI * 0.1, 0.25, 1);
		spotLight.position.set(0, 2, 3);
		spotLight.map = spotLightMap;
		spotLight.map.colorSpace = SRGBColorSpace;
		spotLight.target.position.x = -1.5;
		scene.add(spotLight);

		/**
		 * Helpers
		 */

		const directionalLightHelper = new DirectionalLightHelper(directionalLight);
		scene.add(directionalLightHelper);

		const hemisphereLightHelper = new HemisphereLightHelper(hemisphereLight, 10.0);
		scene.add(hemisphereLightHelper);

		const spotLightHelper = new SpotLightHelper(spotLight);
		scene.add(spotLightHelper);

		const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight);
		scene.add(rectAreaLightHelper);

		/**
		 * Pane
		 */

		const pane = new Pane({ title: 'Debug Params' });
		// Material
		{
			const materialPane = pane.addFolder({ title: 'Material' });
			materialPane.addBinding(material, 'roughness', {
				min: 0,
				max: 1,
				step: 0.001,
			});
		}
		// Ambient Light Pane
		{
			const ambientPane = pane.addFolder({ title: 'Ambient Light' });
			ambientPane.addBinding(ambientLight, 'intensity', {
				min: 0,
				max: 3,
				step: 0.001,
			});
			ambientPane.addBinding(ambientLight, 'color', {
				color: {
					type: 'float',
				},
			});
		}

		/**
		 * Helpers
		 */
		const axesHelper = new AxesHelper();
		axesHelper.scale.setScalar(1);
		scene.add(axesHelper);

		const clock = new Clock();

		function render(time: number = 0) {
			controler.update(time);
			stats.update();

			const elapsedTime = clock.getElapsedTime();

			sphere.rotation.x = elapsedTime * 0.1;
			cube.rotation.x = elapsedTime * 0.1;
			torus.rotation.x = elapsedTime * 0.1;

			sphere.rotation.y = elapsedTime * 0.1;
			cube.rotation.y = elapsedTime * 0.1;
			torus.rotation.y = elapsedTime * 0.1;

			renderer.render(scene, camera);
		}

		function resize() {
			renderer.setSize(window.innerWidth, window.innerHeight);
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		}
		window.addEventListener('resize', resize);
	}, []);
	return (
		<Box w='100vw' h='100vh' id='container'>
			LightBasic
		</Box>
	);
}
