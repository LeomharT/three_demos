import { Box, useMantineTheme } from '@mantine/core';
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import {
	AmbientLight,
	AxesHelper,
	BufferAttribute,
	BufferGeometry,
	Mesh,
	MeshPhongMaterial,
	PerspectiveCamera,
	Scene,
	SpotLight,
	SpotLightHelper,
	WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Pane } from 'tweakpane';
export default function Particle() {
	const location = useLocation();

	const theme = useMantineTheme();

	useEffect(() => {
		const { innerWidth, innerHeight } = window;

		const el = document.querySelector('#container') as HTMLDivElement;
		el.innerHTML = '';

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
		 * Variant
		 */

		const PARTICLE_COUNT = 10000;

		/**
		 * Models
		 */

		const bufferGeomtry = new BufferGeometry();
		bufferGeomtry.computeVertexNormals();

		const positionArr = new Float32Array([]);
		const attrPosition = new BufferAttribute(positionArr, 3);

		const offsetArr = new Float32Array([]);
		const attrOffset = new BufferAttribute(offsetArr, 1);

		const controlerPoint1Arr = new Float32Array([]);
		const attrControlPoint1 = new BufferAttribute(controlerPoint1Arr, 3);

		const controlerPoint2Arr = new Float32Array([]);
		const attrControlPoint2 = new BufferAttribute(controlerPoint2Arr, 3);

		const endPositionArr = new Float32Array([]);
		const attrEndPosition = new BufferAttribute(endPositionArr, 3);

		const axisAngleArr = new Float32Array([]);
		const attrAxisAngle = new BufferAttribute(axisAngleArr, 4);

		const colorArr = new Float32Array([]);
		const attrColor = new BufferAttribute(colorArr, 3);

		bufferGeomtry.setAttribute('position', attrPosition);

		const particleMaterial = new MeshPhongMaterial({
			flatShading: true,
		});

		const particleStream = new Mesh(bufferGeomtry, particleMaterial);
		scene.add(particleStream);

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
			camera.updateProjectionMatrix();
		}
		window.addEventListener('resize', resize);
	}, []);

	return <Box w='100vw' h='100vh' id='container'></Box>;
}
