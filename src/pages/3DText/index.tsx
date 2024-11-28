import { Box, useMantineTheme } from '@mantine/core';
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import {
	AmbientLight,
	AxesHelper,
	Box3,
	Color,
	CylinderGeometry,
	DirectionalLight,
	DirectionalLightHelper,
	EdgesGeometry,
	Mesh,
	MeshPhongMaterial,
	MeshStandardMaterial,
	PerspectiveCamera,
	Scene,
	SphereGeometry,
	Vector3,
	WebGLRenderer,
} from 'three';
import typefaceFont from 'three/examples/fonts/helvetiker_regular.typeface.json?url';
import {
	FontLoader,
	OBJLoader,
	OrbitControls,
	TextGeometry,
} from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import GunURL from './assets/scifi_gun.obj?url';

export default function _3DText() {
	const theme = useMantineTheme();

	const location = useLocation();

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
		renderer.setClearColor(theme.colors.gray[3]);
		renderer.setSize(innerWidth, innerHeight);
		renderer.setAnimationLoop(render);
		renderer.setPixelRatio(window.devicePixelRatio);

		el.append(renderer.domElement);

		const scene = new Scene();

		const camera = new PerspectiveCamera(
			75,
			innerWidth / innerHeight,
			0.1,
			500
		);
		camera.position.set(1, 1, 1);
		camera.lookAt(scene.position);

		const controler = new OrbitControls(camera, renderer.domElement);
		controler.enablePan = false;
		controler.enableDamping = true;
		controler.dampingFactor = 0.05;
		controler.target.set(0, 0, 0);

		/**
		 * Loaders
		 */

		const objLoader = new OBJLoader();

		const fontLoader = new FontLoader();

		/**
		 * Models
		 */

		objLoader.load(GunURL, (data) => {
			const gun = data;
			const gunColor = new Color(theme.colors.lime[5]);
			gun.scale.setScalar(0.1);
			gun.translateY(-0.4);
			gun.traverse((obj) => {
				if (obj instanceof Mesh) {
					if (obj.material instanceof MeshPhongMaterial) {
						obj.material.color = gunColor;
					}
				}
			});
			scene.add(gun);

			const box = new Box3();
			box.setFromObject(gun, true);

			const size = new Vector3().subVectors(box.min, box.max).length();
			const spheresGeometry = new SphereGeometry(size / 2, 16, 16);
			spheresGeometry.rotateX(Math.PI / 2);
			const spheresMaterial = new MeshStandardMaterial({
				color: '#f6b85b',
			});
			const spheresEdge = new EdgesGeometry(spheresGeometry);

			for (let i = 0; i < spheresEdge.attributes.position.count - 1; i += 2) {
				const startPoint = new Vector3(
					spheresEdge.attributes.position.array[i * 3 + 0],
					spheresEdge.attributes.position.array[i * 3 + 1],
					spheresEdge.attributes.position.array[i * 3 + 2]
				);

				const endPotion = new Vector3(
					spheresEdge.attributes.position.array[i * 3 + 3],
					spheresEdge.attributes.position.array[i * 3 + 4],
					spheresEdge.attributes.position.array[i * 3 + 5]
				);

				const cylLength = new Vector3()
					.subVectors(endPotion, startPoint)
					.length();
				const cylGeometry = new CylinderGeometry(0.01, 0.01, cylLength, 16, 16);
				// Move to bottom on y axis for rotation
				cylGeometry.translate(0, cylLength / 2, 0);
				cylGeometry.rotateX(Math.PI / 2);

				const cyl = new Mesh(cylGeometry, spheresMaterial);
				cyl.receiveShadow = true;
				cyl.castShadow = true;
				cyl.position.copy(startPoint);
				cyl.lookAt(endPotion);

				scene.add(cyl);
			}

			fontLoader.load(typefaceFont, (font) => {
				const textGeometry = new TextGeometry('SPHERE', {
					font,
					size: 0.2,
					depth: 0.05,
					curveSegments: 12,
					bevelEnabled: false,
					bevelThickness: 0.03,
					bevelSize: 0.02,
					bevelOffset: 0,
					bevelSegments: 5,
				});
				textGeometry.computeBoundingBox();
				const textBox = textGeometry.boundingBox as Box3;
				textGeometry.translate(
					-textBox.max.x / 2,
					-textBox.max.y / 2,
					-textBox.max.z / 2
				);
				textGeometry.rotateY(Math.PI / 2);

				spheresGeometry.computeBoundingBox();
				const edgeBoundingBox = spheresGeometry.boundingBox as Box3;
				const text = new Mesh(textGeometry, spheresMaterial);
				text.position.set(0, edgeBoundingBox.max.y + 0.3, 0);
				scene.add(text);
			});
		});

		/**
		 * Light
		 */

		const ambientLight = new AmbientLight();
		ambientLight.intensity = 1;
		scene.add(ambientLight);

		const directLight = new DirectionalLight(theme.white);
		directLight.castShadow = true;
		directLight.intensity = 1;
		directLight.position.set(0, 2, 0);
		scene.add(directLight);

		/**
		 * Helpers
		 */

		const axesHelper = new AxesHelper();
		axesHelper.scale.setScalar(1);
		scene.add(axesHelper);

		const directLightHelper = new DirectionalLightHelper(directLight, 1);
		scene.add(directLightHelper);

		/**
		 * Pane
		 */

		const pane = new Pane({
			title: 'Params',
		});
		pane.element.style.display = location.hash === '#debug' ? 'block' : 'none';
		const lightsPane = pane.addFolder({ title: 'Lights' });
		lightsPane.addBinding(ambientLight, 'intensity', {
			label: 'AmbientLight Intensity',
			max: 10,
			min: 0,
			step: 0.1,
		});
		lightsPane.addBinding(directLight, 'intensity', {
			label: 'DirectionLight Intensity',
			max: 10,
			min: 0,
			step: 0.1,
		});

		/**
		 * Events
		 */

		function render(time?: number) {
			controler.update(time);
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
