import { useMantineTheme } from '@mantine/core';
import { useEffect } from 'react';
import {
	AmbientLight,
	AxesHelper,
	Clock,
	Color,
	DirectionalLight,
	DoubleSide,
	GridHelper,
	InstancedMesh,
	LoadingManager,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	Object3D,
	PerspectiveCamera,
	PlaneGeometry,
	Raycaster,
	Scene,
	SphereGeometry,
	SRGBColorSpace,
	Texture,
	TextureLoader,
	Vector2,
	Vector3,
	WebGLRenderer,
} from 'three';
import {
	DRACOLoader,
	EffectComposer,
	GLTFLoader,
	RenderPass,
	UnrealBloomPass,
} from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Pane } from 'tweakpane';

export default function Spaceship() {
	const theme = useMantineTheme();

	const initialScene = async () => {
		const el = document.querySelector('#container') as HTMLDivElement;

		/**
		 * Basic
		 */

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setClearColor(theme.colors.dark[9]);
		renderer.shadowMap.enabled = true;
		el.append(renderer.domElement);

		const scene = new Scene();

		const camera = new PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		camera.position.set(5, 5, 5);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		const stats = new Stats();
		el.append(stats.dom);

		const composer = new EffectComposer(renderer);
		composer.setSize(window.innerWidth, window.innerHeight);
		composer.setPixelRatio(window.devicePixelRatio);

		composer.addPass(new RenderPass(scene, camera));

		/**
		 * Loaders
		 */

		const loadingManager = new LoadingManager();
		loadingManager.onLoad = () => {
			console.log('Loaded');
		};
		loadingManager.onProgress = () => {
			console.log('Loading....');
		};

		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath('node_modules/three/examples/jsm/libs/draco/');
		dracoLoader.setDecoderConfig({ type: 'js' });
		dracoLoader.preload();

		const gltfLoader = new GLTFLoader(loadingManager);
		gltfLoader.dracoLoader = dracoLoader;
		gltfLoader.setPath('/src/pages/Spaceship/assets/');

		const textureLoader = new TextureLoader(loadingManager);
		textureLoader.setPath('/src/pages/Spaceship/assets/');

		/**
		 * Textures
		 */

		const starAlphaTexture = await textureLoader.loadAsync('starAlpha.png');

		/**
		 * Scenes
		 */

		const spaceshipGLTF = await gltfLoader.loadAsync('spaceship.glb');
		const spaceship = spaceshipGLTF.scene;
		spaceship.scale.setScalar(0.5);
		spaceship.traverse((mesh) => {
			if (mesh instanceof Mesh) {
				mesh.receiveShadow = true;
				mesh.castShadow = true;
				if (mesh.material instanceof MeshStandardMaterial) {
					mesh.material.depthTest = true;
					mesh.material.depthWrite = true;
					mesh.material.alphaToCoverage = true;
					mesh.material.transparent = false;
					if (mesh.material.map instanceof Texture) {
						mesh.material.map.colorSpace = SRGBColorSpace;
					}
				}
			}
		});
		spaceship.position.set(-3.7, 0, -2.235);
		scene.add(spaceship);

		const planeGeometry = new PlaneGeometry(20, 20);
		const planeMaterial = new MeshBasicMaterial({
			transparent: true,
			opacity: 0.25,
			color: new Color(1, 0, 1),
		});
		const plane = new Mesh(planeGeometry, planeMaterial);
		plane.rotation.y = Math.PI / 2;
		plane.visible = false;
		scene.add(plane);

		const sphereGeometry = new SphereGeometry(0.1, 20, 20);
		const sphereMaterial = new MeshBasicMaterial({
			color: new Color(1, 0, 0),
		});
		const sphere = new Mesh(sphereGeometry, sphereMaterial);
		sphere.position.set(0, 2, 0);
		sphere.visible = false;
		scene.add(sphere);

		const STAR_COUNT = 350;
		const STARS: {
			len: number;
			pos: Vector3;
			color: Color;
			speed: number;
		}[] = [];
		const COLORS = ['#fcaa67', '#c75d59', '#ffffc7', '#8cc5c6', '#a5898c'];

		function r(min: number, max: number) {
			const diff = Math.random() * (max - min);
			return min + diff;
		}

		function resetStar() {
			const len = r(1.5, 5);
			const pos = new Vector3(r(-15, 15), r(-10, 10), r(-15, 15));
			const color = new Color(COLORS[Math.floor(Math.random() * COLORS.length)])
				.convertSRGBToLinear()
				.multiplyScalar(1.3);
			const speed = r(19.5, 42);

			return {
				len,
				pos,
				color,
				speed,
			};
		}

		for (let i = 0; i < STAR_COUNT; i++) {
			STARS.push(resetStar());
		}

		const bloom = new UnrealBloomPass(
			new Vector2(window.innerWidth, window.innerHeight),
			1.5,
			0.4,
			0.85
		);

		const starGeometry = new PlaneGeometry(1, 0.05);
		const starMaterial = new MeshBasicMaterial({
			transparent: true,
			alphaMap: starAlphaTexture,
			side: DoubleSide,
		});

		const star = new InstancedMesh(starGeometry, starMaterial, STAR_COUNT);
		star.rotation.y = Math.PI / 2;
		star.position.y = 2;

		const object3D = new Object3D();

		for (let i = 0; i < STARS.length; i++) {
			object3D.position.copy(STARS[i].pos);
			object3D.scale.x = STARS[i].len;
			object3D.updateMatrix();

			star.setColorAt(i, STARS[i].color);
			star.setMatrixAt(i, object3D.matrix);
		}
		star.instanceMatrix.needsUpdate = true;

		scene.add(star);

		/**
		 * Lights
		 */

		const ambientLight = new AmbientLight();
		ambientLight.intensity = 0.2;
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
		axesHelper.scale.setScalar(10);
		scene.add(axesHelper);

		const gridHelper = new GridHelper(100, 35);
		gridHelper.visible = false;
		scene.add(gridHelper);

		/**
		 * Pane
		 */

		const pane = new Pane({ title: 'Debug Params' });
		/** Ambient Light */
		{
			const ambientLightPane = pane.addFolder({ title: 'Ambient Light' });
			ambientLightPane.addBinding(ambientLight, 'intensity');
		}
		/** Direction Light */
		{
			const directionalLightPane = pane.addFolder({ title: 'Directional Light' });
			directionalLightPane.addBinding(directionalLight, 'intensity');
		}

		/**
		 * Events
		 */

		const raycaster = new Raycaster();
		const point = new Vector2();
		const rect = el.getBoundingClientRect();

		let intersectPoint: Vector3 | undefined;

		let translY = 0;
		let translAcceleration = 0;

		let angleZ = 0;
		let angleAcceleration = 0;

		const clock = new Clock();
		let previourTime = 0;

		const updateObject = new Object3D();

		function render(time: number = 0) {
			requestAnimationFrame(render);

			const elapsedTime = clock.getElapsedTime();
			const deltaTime = elapsedTime - previourTime;
			previourTime = elapsedTime;

			stats.update();
			controls.update(time);

			composer.render(time);

			if (intersectPoint) {
				const targetY = intersectPoint.y;
				translAcceleration += (targetY - translY) * 0.002;
				translAcceleration *= 0.95;
				translY += translAcceleration;

				const dir = intersectPoint.clone().sub(new Vector3(0, translY, 0)).normalize();
				const dirCos = dir.dot(new Vector3(0, 1, 0));
				// Compute for rotation
				const angle = Math.acos(dirCos) - Math.PI / 2;

				angleAcceleration += (angle - angleZ) * 0.06;
				angleAcceleration *= 0.85;
				angleZ = angleAcceleration;
			}

			spaceship.position.y = translY;
			spaceship.rotation.setFromVector3(new Vector3(angleZ, 0, angleZ), 'XYZ');

			// for (let i = 0; i < STARS.length; i++) {
			// 	if (STARS[i].pos.z >= 40) {
			// 		STARS[i] = resetStar();
			// 	}
			// 	STARS[i].pos.z += STARS[i].speed * deltaTime;
			// 	updateObject.position.copy(STARS[i].pos);
			// 	updateObject.scale.x = STARS[i].len;

			// 	updateObject.updateMatrix();

			// 	star.setMatrixAt(i, updateObject.matrix);
			// 	star.setColorAt(i, STARS[i].color);
			// }
		}
		render();

		function resize() {
			renderer.setSize(window.innerWidth, window.innerHeight);
			composer.setSize(window.innerWidth, window.innerHeight);

			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		}
		window.addEventListener('resize', resize);

		function move(e: MouseEvent) {
			const x = (e.clientX / rect.width) * 2 - 1;
			const y = -(e.clientY / rect.height) * 2 + 1;
			point.set(x, y);

			raycaster.setFromCamera(point, camera);
			const intersects = raycaster.intersectObjects([plane], true);

			intersectPoint = intersects[0]?.point;
			if (intersectPoint) {
				intersectPoint.x = -3;
				sphere.position.copy(intersectPoint);
			}
		}
		el.addEventListener('mousemove', move);
	};

	useEffect(() => {
		initialScene();
	}, []);

	return <div id='container'></div>;
}
