import { useMantineTheme } from '@mantine/core';
import { useEffect } from 'react';
import {
	AmbientLight,
	AxesHelper,
	DirectionalLight,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	Raycaster,
	Scene,
	SphereGeometry,
	Vector2,
	Vector3,
	WebGLRenderer,
} from 'three';
import { GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

export default function Test() {
	const theme = useMantineTheme();

	const initialScene = async () => {
		const el = document.querySelector('#container') as HTMLDivElement;

		/**
		 * Loaders
		 */

		const gltfLoader = new GLTFLoader();
		gltfLoader.setPath('/src/assets/models/');

		/**
		 * Basic
		 */

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setClearColor(theme.black);
		renderer.setSize(window.innerWidth, window.innerHeight);
		el.append(renderer.domElement);

		const scene = new Scene();

		const camera = new PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		camera.position.set(0, 0, 1);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		const stats = new Stats();
		el.append(stats.dom);

		/**
		 * Raycaster
		 */

		const raycaster = new Raycaster();
		const point = new Vector2();
		let intersections: undefined | Vector3;

		/**
		 * Scenes
		 */

		const planeGeometry = new PlaneGeometry(1, 1, 64, 64);
		const planeMaterial = new MeshBasicMaterial({
			color: theme.colors.yellow[5],
			wireframe: true,
		});
		const plane = new Mesh(planeGeometry, planeMaterial);
		scene.add(plane);

		const sphereGeometry = new SphereGeometry(0.01, 32, 32);
		const sphereMaterial = new MeshStandardMaterial({
			emissive: theme.colors.blue[4],
			emissiveIntensity: 3,
		});
		const sphere = new Mesh(sphereGeometry, sphereMaterial);
		scene.add(sphere);

		const spaceship = (await gltfLoader.loadAsync('spaceship.glb')).scene;
		spaceship.scale.setScalar(0.03);
		spaceship.position.z = -0.22;
		spaceship.position.x = 0.11;
		spaceship.traverse((mesh) => {
			if (mesh instanceof Mesh) {
				mesh.castShadow = true;
				mesh.receiveShadow = true;
				if (mesh.material instanceof MeshStandardMaterial) {
					mesh.material.depthTest = true;
					mesh.material.depthWrite = true;
				}
			}
		});

		scene.add(spaceship);

		/**
		 * Lights
		 */

		const ambientLight = new AmbientLight(0xffffff, 0.52);
		scene.add(ambientLight);

		const directionalLight = new DirectionalLight();
		directionalLight.castShadow = true;
		directionalLight.shadow.bias = -0.0001;
		directionalLight.position.set(0, 10, 0);
		directionalLight.intensity = 1.8;
		scene.add(directionalLight);

		/**
		 * Helpers
		 */

		const axesHelper = new AxesHelper();
		scene.add(axesHelper);

		/**
		 * Events
		 */

		let translateY = 0;
		let translateYAcceleration = 0;

		let angleZ = 0;
		let angleAcceleration = 0;

		function render(time: number = 0) {
			requestAnimationFrame(render);

			// Update
			controls.update(time);
			stats.update();

			// Acceleration
			if (intersections) {
				const positionY = intersections.y;
				translateYAcceleration += (positionY - translateY) * 0.002;
				translateYAcceleration *= 0.95;
				translateY += translateYAcceleration;

				const dir = intersections.clone().sub(new Vector3(0, translateY, 0)).normalize();
				const dirCos = dir.dot(new Vector3(0, 1, 0));
				//
				const angle = Math.acos(dirCos) - Math.PI / 2;

				angleAcceleration += (angle - angleZ) * 0.06;
				angleAcceleration *= 0.85;
				angleZ = angleAcceleration;
			}

			spaceship.position.y = translateY;
			spaceship.rotation.setFromVector3(new Vector3(angleZ, -Math.PI / 2, angleZ), 'ZXY');

			renderer.render(scene, camera);
		}
		render();

		function resize() {
			renderer.setSize(window.innerWidth, window.innerHeight);

			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		}
		window.addEventListener('resize', resize);

		function handleOnPointerMove(e: PointerEvent) {
			const rect = renderer.domElement.getBoundingClientRect();

			point.x = (e.clientX / rect.width) * 2 - 1;
			point.y = -(e.clientY / rect.height) * 2 + 1;

			raycaster.setFromCamera(point, camera);

			const intersect = raycaster.intersectObjects([plane], true);

			if (intersect[0]) {
				intersections = intersect[0].point;
				intersections.x = 0.3;

				sphere.position.copy(intersections);
			}
		}
		window.addEventListener('pointermove', handleOnPointerMove);
	};

	useEffect(() => {
		initialScene();
	}, []);

	return <div id='container'></div>;
}
