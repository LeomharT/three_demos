import { Box, useMantineTheme } from '@mantine/core';
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import {
	AmbientLight,
	AxesHelper,
	BufferAttribute,
	BufferGeometry,
	Mesh,
	MeshPhysicalMaterial,
	NearestFilter,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	SpotLight,
	SpotLightHelper,
	TextureLoader,
	WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Pane } from 'tweakpane';
import sticjerURL from './assets/sticjer.png?url';
export default function Particle() {
	const location = useLocation();

	const theme = useMantineTheme();

	useEffect(() => {
		const { innerWidth, innerHeight } = window;

		const el = document.querySelector('#container') as HTMLDivElement;
		el.innerHTML = '';

		/**
		 * Variant
		 */

		const PARTICLE_COUNT = 10000;

		/**
		 * Basic
		 */

		const renderer = new WebGLRenderer({ alpha: true, antialias: true });
		renderer.shadowMap.enabled = true;
		renderer.localClippingEnabled = true;
		renderer.setClearAlpha(1);
		renderer.setSize(innerWidth, innerHeight);
		renderer.setAnimationLoop(render);
		renderer.setClearColor(theme.colors.dark[8]);
		el.append(renderer.domElement);

		const scene = new Scene();

		const camera = new PerspectiveCamera(
			75,
			innerWidth / innerHeight,
			0.1,
			500
		);
		camera.position.set(0, 0, 0.2);
		camera.lookAt(scene.position);

		const controler = new OrbitControls(camera, renderer.domElement);
		controler.enableDamping = true;
		controler.dampingFactor = 0.05;

		const stats = new Stats();
		el.append(stats.dom);

		/**
		 * Loaders
		 */

		const textureLoader = new TextureLoader();

		/**
		 * Models
		 */

		const vertices = new Float32Array([
			-0.1, -0.1, 0.0, 0.1, -0.1, 0.0, 0.1, 0.1, 0.0, 0.1, 0.1, 0.0, -0.1, 0.1,
			0.0, -0.1, -0.1, 0.0,
		]);
		const bufferGeomtry = new BufferGeometry();
		const attrPosition = new BufferAttribute(vertices, 3);
		bufferGeomtry.setAttribute('position', attrPosition);
		bufferGeomtry.computeVertexNormals();

		// const plane = new Mesh(
		// 	bufferGeomtry,
		// 	new MeshBasicMaterial({
		// 		color: theme.colors.green[5],
		// 	})
		// );
		// scene.add(plane);

		textureLoader.load(sticjerURL, (data) => {
			data.magFilter = NearestFilter;
			data.minFilter = NearestFilter;
			const decalMaterial = new MeshPhysicalMaterial({
				map: data,
				// ior: 1.5,
				metalness: 0.8,
				clearcoat: 0.5,
				roughness: 0.5,
				iridescence: 1,
				iridescenceIOR: 1.3,
				iridescenceThicknessRange: [1, 1400],
				// depth value
				polygonOffset: true,
				polygonOffsetFactor: -1,
				transparent: true,
			});
			// const decalGeometry = new DecalGeometry(
			// 	plane,
			// 	plane.position,
			// 	plane.rotation,
			// 	new Vector3(0.1, 0.1, 0.1)
			// );
			// const decal = new Mesh(decalGeometry, decalMaterial);
			// plane.add(decal);

			const plane = new Mesh(new PlaneGeometry(1, 1), decalMaterial);
			scene.add(plane);

			const decalPane = pane.addFolder({ title: 'Decal' });
			decalPane.addBinding(decalMaterial, 'ior', {
				min: 1.0,
				max: 2.333,
			});
			decalPane.addBinding(decalMaterial, 'iridescence', {
				min: 0.0,
				max: 1.0,
			});
			decalPane.addBinding(decalMaterial, 'iridescenceIOR', {
				min: 1.0,
				max: 2.333,
			});
		});

		/**
		 * Lights
		 */

		const ambientLight = new AmbientLight(0xffffff);
		ambientLight.intensity = 0.5;
		scene.add(ambientLight);

		const spotLight = new SpotLight(0xffffff);
		spotLight.position.set(0, 0.5, 1);
		spotLight.intensity = 5.0;
		spotLight.angle = Math.PI / 12;
		spotLight.distance = 0;
		spotLight.castShadow = true;
		scene.add(spotLight);

		/**
		 * Helpers
		 */

		const axesHelper = new AxesHelper();
		scene.add(axesHelper);

		const spotLightHelper = new SpotLightHelper(
			spotLight,
			theme.colors.yellow[5]
		);
		scene.add(spotLightHelper);

		/**
		 * Pane
		 */

		const pane = new Pane({ title: 'Params' });

		const paneAmbientLight = pane.addFolder({ title: 'AmbientLight' });
		paneAmbientLight.addBinding(ambientLight, 'intensity', {
			max: 10,
			min: 0,
			step: 0.1,
		});

		const paneSpotLight = pane.addFolder({ title: 'SpotLight' });
		paneSpotLight.addBinding(spotLight, 'intensity', {
			max: 10,
			min: 0,
			step: 0.1,
		});
		paneSpotLight.addBinding(spotLight, 'decay', {
			max: 2,
			min: 1,
		});
		paneSpotLight.addBinding(spotLight, 'angle', {
			max: 1,
			min: 0,
		});
		paneSpotLight.addBinding(spotLight, 'distance', {
			max: 20,
			min: 0,
		});

		function render(time: number = 0) {
			controler.update(time);
			stats.update();

			spotLightHelper.update();

			renderer.render(scene, camera);
		}

		function resize() {
			renderer.setSize(window.innerWidth, window.innerHeight);
			camera.aspect = window.innerWidth / window.innerHeight;
		}
		window.addEventListener('resize', resize);
	}, []);

	return <Box w='100vw' h='100vh' id='container'></Box>;
}
