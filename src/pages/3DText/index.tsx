import { Box, useMantineTheme } from '@mantine/core';
import { useEffect } from 'react';
import {
	AxesHelper,
	Color,
	CylinderGeometry,
	EdgesGeometry,
	Mesh,
	MeshStandardMaterial,
	PerspectiveCamera,
	Scene,
	SphereGeometry,
	Vector3,
	WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

export default function _3DText() {
	const theme = useMantineTheme();

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
		renderer.setClearColor(theme.colors.dark[7]);
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
		camera.position.set(0, 0, 1);
		camera.lookAt(scene.position);

		const controler = new OrbitControls(camera, renderer.domElement);
		controler.enablePan = false;
		controler.enableDamping = true;
		controler.dampingFactor = 0.05;
		controler.target.set(0, 0, 0);

		/**
		 * Models
		 */

		const spheresGeometry = new SphereGeometry(0.5, 16, 16);
		const spheresMaterial = new MeshStandardMaterial({
			color: new Color(theme.colors.red[5]),
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
			cyl.position.copy(startPoint);
			cyl.lookAt(endPotion);

			scene.add(cyl);
		}

		/**
		 * Helpers
		 */
		const axesHelper = new AxesHelper();
		axesHelper.scale.setScalar(1);
		scene.add(axesHelper);

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
