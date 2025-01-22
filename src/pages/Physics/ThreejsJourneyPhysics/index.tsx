import { useMantineTheme } from '@mantine/core';
import Cannon from 'cannon';
import { useEffect } from 'react';
import {
	AmbientLight,
	AxesHelper,
	BoxGeometry,
	CubeTextureLoader,
	DirectionalLight,
	DirectionalLightHelper,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	Quaternion,
	Raycaster,
	Scene,
	SphereGeometry,
	TextureLoader,
	Vector2,
	Vector3,
	Vector3Like,
	WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Pane } from 'tweakpane';

export default function ThreejsJourneyPhysics() {
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
		camera.position.set(0, 3, 3);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		const stats = new Stats();
		el.append(stats.dom);

		/**
		 * Raycaster
		 */

		const raycaster = new Raycaster();
		let point = new Vector2();
		let intersectPoint: undefined | Vector3Like;

		/**
		 * Loaders
		 */

		const textureLoader = new TextureLoader();
		textureLoader.setPath('/src/pages/Physics/ThreejsJourneyPhysics/assets/');

		const cubeTextureLoader = new CubeTextureLoader();
		cubeTextureLoader.setPath(
			'/src/pages/Physics/ThreejsJourneyPhysics/assets/textures/environmentMaps/'
		);

		/**
		 * Textures
		 */

		const environmentTexture = cubeTextureLoader.load([
			'0/px.png',
			'0/nx.png',
			'0/py.png',
			'0/ny.png',
			'0/pz.png',
			'0/nz.png',
		]);

		/**
		 * Scenes
		 */

		const floorGeometry = new PlaneGeometry(10, 10, 32, 32);
		floorGeometry.rotateX(-Math.PI / 2);
		const floorMaterial = new MeshStandardMaterial({
			color: '#777777',
			metalness: 0.3,
			roughness: 0.4,
			envMap: environmentTexture,
			envMapIntensity: 0.5,
		});
		const floor = new Mesh(floorGeometry, floorMaterial);
		floor.receiveShadow = true;
		scene.add(floor);

		const plane = new Mesh(
			new PlaneGeometry(50, 50, 16, 16),
			new MeshBasicMaterial({
				color: 'yellow',
				wireframe: true,
			})
		);
		plane.lookAt(camera.position);
		scene.add(plane);

		controls.addEventListener('change', (e) => {
			plane.lookAt(camera.position);
			plane.updateMatrix();
		});

		/**
		 * Physics
		 */

		const world = new Cannon.World();
		world.broadphase = new Cannon.SAPBroadphase(world);
		world.allowSleep = true;
		world.gravity.set(0, -9.82, 0);

		// Material
		// const concreteMaterial = new Cannon.Material('Concrete Material');
		// const plasticMaterial = new Cannon.Material('Plastic Material');

		const defaultMaterial = new Cannon.Material('Default Material');
		const defaultContactMaterial = new Cannon.ContactMaterial(
			defaultMaterial,
			defaultMaterial,
			{
				friction: 1.0,
				restitution: 0.7,
			}
		);
		world.addContactMaterial(defaultContactMaterial);
		world.defaultContactMaterial = defaultContactMaterial;

		const floorShape = new Cannon.Box(new Cannon.Vec3(10 / 2, 0.5, 10 / 2));
		const floorBody = new Cannon.Body({
			mass: 0,
			shape: floorShape,
		});
		// floorBody.quaternion.setFromAxisAngle(new Cannon.Vec3(1, 0, 0), -Math.PI / 2);
		world.addBody(floorBody);

		/**
		 * Utils
		 */

		const hitAudio = new Audio(
			'/src/pages/Physics/ThreejsJourneyPhysics/assets/audio/hit.mp3'
		);
		function playHitAudio(event: any) {
			const contact = event.contact;
			const impactStrengh = contact.getImpactVelocityAlongNormal();

			if (impactStrengh > 1.5) {
				hitAudio.volume = Math.random();
				hitAudio.currentTime === 0;
				hitAudio.play();
			}
		}

		const objectToUpdate: {
			mesh: Mesh;
			body: Cannon.Body;
		}[] = [];

		const sphereGeometry = new SphereGeometry(1, 32, 32);
		const sphereMaterial = new MeshStandardMaterial({
			metalness: 0.3,
			roughness: 0.4,
			envMap: environmentTexture,
		});

		function createSphere(radius: number, position: Vector3Like) {
			const mesh = new Mesh(sphereGeometry, sphereMaterial);
			// Scale 1 * radius
			mesh.scale.setScalar(radius);
			mesh.castShadow = true;
			mesh.receiveShadow = true;
			mesh.position.copy(position);
			scene.add(mesh);

			const shape = new Cannon.Sphere(radius);
			const body = new Cannon.Body({
				shape,
				mass: 1,
				position: new Cannon.Vec3(0, 3, 0),
				material: defaultMaterial,
			});
			body.position.copy(position as Cannon.Vec3);
			body.addEventListener('collide', playHitAudio);
			world.addBody(body);
			objectToUpdate.push({
				mesh,
				body,
			});
		}

		createSphere(0.5, { x: 0, y: 3, z: 0 });

		const boxGeometry = new BoxGeometry(1, 1, 1, 16, 16, 16);
		const boxMaterial = new MeshStandardMaterial({
			metalness: 0.3,
			roughness: 0.4,
			envMap: environmentTexture,
		});

		function createBox(
			width: number,
			height: number,
			depth: number,
			position: Vector3Like
		) {
			const mesh = new Mesh(boxGeometry, boxMaterial);
			mesh.scale.set(width, height, depth);
			mesh.castShadow = true;
			mesh.receiveShadow = true;
			mesh.position.copy(position);
			scene.add(mesh);

			const shape = new Cannon.Box(new Cannon.Vec3(width / 2, height / 2, depth / 2));
			const body = new Cannon.Body({
				shape,
				mass: 1,
				position: new Cannon.Vec3(0, 3, 0),
				material: defaultMaterial,
			});
			body.addEventListener('collide', playHitAudio);
			world.addBody(body);

			objectToUpdate.push({
				mesh,
				body,
			});
		}

		/**
		 * Lights
		 */

		const ambientLight = new AmbientLight();
		ambientLight.intensity = 1;
		scene.add(ambientLight);

		const directionalLight = new DirectionalLight();
		directionalLight.position.set(3, 3, -3);
		directionalLight.intensity = 2;
		directionalLight.castShadow = true;
		directionalLight.shadow.mapSize.set(512, 512);
		scene.add(directionalLight);

		/**
		 * Helpers
		 */

		const axesHelper = new AxesHelper();
		scene.add(axesHelper);

		const directionalLightHelp = new DirectionalLightHelper(directionalLight);
		directionalLightHelp.visible = false;
		scene.add(directionalLightHelp);

		/**
		 * Pane
		 */

		const pane = new Pane({ title: 'Debug Params' });
		// Axes Helper
		{
			const axesHelperPane = pane.addFolder({ title: 'Axes Helper' });
			axesHelperPane.addBinding(axesHelper, 'visible');
		}
		// Directional Light
		{
			const directionalLightPane = pane.addFolder({ title: 'Directional Light' });
			directionalLightPane.addBinding(directionalLight, 'intensity');
			directionalLightPane.addBinding(directionalLight, 'color', {
				color: { type: 'float' },
			});
		}
		// Physics
		{
			const folder = pane.addFolder({ title: 'Physics' });
			folder
				.addButton({
					title: 'Create Shpere',
				})
				.on('click', () => {
					createSphere(
						Math.random() * 0.5,
						new Vector3((Math.random() - 0.5) * 3, 3, (Math.random() - 0.5) * 3)
					);
				});
			folder
				.addButton({
					title: 'Create Box',
				})
				.on('click', () => {
					createBox(
						Math.random() * 0.5,
						Math.random() * 0.5,
						Math.random() * 0.5,
						new Vector3((Math.random() - 0.5) * 3, 3, (Math.random() - 0.5) * 3)
					);
				});
			folder.addButton({ title: 'Rest' }).on('click', () => {
				for (const object of objectToUpdate) {
					object.body.removeEventListener('collide', playHitAudio);
					world.remove(object.body);
					scene.remove(object.mesh);
				}
				objectToUpdate.length = 0;
			});
		}

		/**
		 * Events
		 */

		let previousTime = 0;

		function render(time: number = 0) {
			requestAnimationFrame(render);

			let deltaTime = time - previousTime;
			previousTime = time;
			deltaTime /= 1000;

			// Wind

			// Update Phtsics World
			world.step(1 / 60, deltaTime, 3);

			const q = new Quaternion();

			for (const { mesh, body } of objectToUpdate) {
				mesh.position.copy(body.position);
				q.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w);
				mesh.rotation.setFromQuaternion(q, 'XYZ');
			}

			stats.update();
			controls.update(time);
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

			const intersect = raycaster.intersectObject(plane, true);

			if (intersect.length) {
				intersectPoint = intersect[0].point;
			}
		}
		window.addEventListener('pointermove', handleOnPointerMove);

		function handleOnPointerClick(e: PointerEvent) {
			const mesh = new Mesh(
				new SphereGeometry(0.5, 32, 32),
				new MeshBasicMaterial({ color: 'red' })
			);
			mesh.position.copy(camera.position);
			scene.add(mesh);

			const body = new Cannon.Body({
				shape: new Cannon.Sphere(0.5),
				material: defaultMaterial,
				mass: 1,
			});
			body.applyLocalForce(
				new Cannon.Vec3(
					camera.position.x * 100,
					camera.position.y,
					-camera.position.z * 100
				),
				new Cannon.Vec3(0, 0, 0)
			);
			body.position.set(camera.position.x, camera.position.y, camera.position.z);
			world.addBody(body);

			objectToUpdate.push({
				mesh,
				body,
			});
		}
		window.addEventListener('pointerdown', handleOnPointerClick);
	};

	useEffect(() => {
		initialScene();
	}, []);

	return <div id='container'></div>;
}
