import { useMantineTheme } from '@mantine/core';
import { useEffect } from 'react';
import {
	AmbientLight,
	AxesHelper,
	BoxGeometry,
	Color,
	ConeGeometry,
	DirectionalLight,
	DirectionalLightHelper,
	FogExp2,
	Group,
	LoadingManager,
	Mesh,
	MeshStandardMaterial,
	PCFShadowMap,
	PerspectiveCamera,
	PlaneGeometry,
	PointLight,
	PointLightHelper,
	RepeatWrapping,
	Scene,
	SphereGeometry,
	SRGBColorSpace,
	TextureLoader,
	Vector3,
	WebGLRenderer,
} from 'three';
import { OrbitControls, Sky } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Pane } from 'tweakpane';

export default function HauntedHouse() {
	const theme = useMantineTheme();

	const initialScene = async () => {
		const el = document.querySelector('#container') as HTMLDivElement;
		el.innerHTML = '';

		/**
		 * Basic
		 */

		const renderer = new WebGLRenderer({ alpha: true, antialias: true });
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setClearColor(theme.colors.dark[7]);
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = PCFShadowMap;
		el.append(renderer.domElement);

		const scene = new Scene();

		const camera = new PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			500
		);
		camera.position.set(5, 5, 5);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;
		controls.maxPolarAngle = Math.PI;
		controls.minPolarAngle = 0;

		const stats = new Stats();
		el.append(stats.dom);

		/**
		 * Loader
		 */

		const loadingManager = new LoadingManager();
		loadingManager.onStart = () => {
			console.log('Loading start ');
		};
		loadingManager.onLoad = () => {
			console.log('Load success!!!');
		};
		loadingManager.onError = () => {
			console.log('Loading error');
		};
		loadingManager.onProgress = () => {
			console.log('Loading...');
		};

		const textureLoader = new TextureLoader(loadingManager);
		textureLoader.setPath('/src/pages/HauntedHouse/assets/');

		/**
		 * Textures
		 */

		// Floor
		const floorAlphaTexture = await textureLoader.loadAsync('floor/alpha.jpg');
		const floorColorTexture = await textureLoader.loadAsync(
			'floor/coast_sand_rocks_02_diff_1k.jpg'
		);
		floorColorTexture.colorSpace = SRGBColorSpace;
		const floorDisplacementTexture = await textureLoader.loadAsync(
			'floor/coast_sand_rocks_02_disp_1k.jpg'
		);
		const floorNormalTexture = await textureLoader.loadAsync(
			'floor/coast_sand_rocks_02_nor_gl_1k.jpg'
		);
		// ARMT A = ao R = rough M = Metal
		const floorARMTexture = await textureLoader.loadAsync(
			'floor/coast_sand_rocks_02_arm_1k.jpg'
		);
		for (const texture of [
			floorARMTexture,
			floorColorTexture,
			floorDisplacementTexture,
			floorNormalTexture,
		]) {
			texture.wrapS = texture.wrapT = RepeatWrapping;
			texture.repeat.set(8, 8);
		}

		// Walls
		const wallsColorTexture = await textureLoader.loadAsync(
			'walls/castle_brick_broken_06_diff_1k.jpg'
		);
		wallsColorTexture.colorSpace = SRGBColorSpace;
		const wallsNormalTexture = await textureLoader.loadAsync(
			'walls/castle_brick_broken_06_nor_gl_1k.jpg'
		);
		const wallsARMTexture = await textureLoader.loadAsync(
			'walls/castle_brick_broken_06_arm_1k.jpg'
		);

		// Roof
		const roofColorTexture = await textureLoader.loadAsync(
			'roof/roof_slates_02_diff_1k.jpg'
		);
		roofColorTexture.colorSpace = SRGBColorSpace;
		const roofARMTexture = await textureLoader.loadAsync(
			'roof/roof_slates_02_arm_1k.jpg'
		);
		const roofNormalTexture = await textureLoader.loadAsync(
			'roof/roof_slates_02_nor_gl_1k.jpg'
		);
		for (const texture of [roofColorTexture, roofARMTexture, roofNormalTexture]) {
			texture.wrapS = texture.wrapT = RepeatWrapping;
			texture.repeat.x = 3;
			texture.repeat.y = 1;
		}

		// Bushes
		const bushesColorTexture = await textureLoader.loadAsync(
			'bushes/leaves_forest_ground_diff_1k.jpg'
		);
		bushesColorTexture.colorSpace = SRGBColorSpace;
		const bushesNormalTexture = await textureLoader.loadAsync(
			'bushes/leaves_forest_ground_nor_gl_1k.jpg'
		);
		const bushesARMTexture = await textureLoader.loadAsync(
			'bushes/leaves_forest_ground_arm_1k.jpg'
		);

		// Grave
		const graveColorTexture = await textureLoader.loadAsync(
			'grave/plastered_stone_wall_diff_1k.jpg'
		);
		graveColorTexture.colorSpace = SRGBColorSpace;
		const graveARMTexture = await textureLoader.loadAsync(
			'grave/plastered_stone_wall_arm_1k.jpg'
		);
		const graveNormalTexture = await textureLoader.loadAsync(
			'grave/plastered_stone_wall_nor_gl_1k.jpg'
		);
		for (const texture of [graveColorTexture, graveARMTexture, graveNormalTexture]) {
			texture.repeat.set(0.3, 0.4);
		}

		// Door
		const doorColorTexture = await textureLoader.loadAsync(
			'door/Door_Wood_001_basecolor.jpg'
		);
		doorColorTexture.colorSpace = SRGBColorSpace;
		const doorAmbientOcclusionTexture = await textureLoader.loadAsync(
			'door/Door_Wood_001_ambientOcclusion.jpg'
		);
		const doorDisplacementTexture = await textureLoader.loadAsync(
			'door/Door_Wood_001_height.png'
		);
		const doorAlphaTexture = await textureLoader.loadAsync(
			'door/Door_Wood_001_opacity.jpg'
		);
		const doorMetalnessTexture = await textureLoader.loadAsync(
			'door/Door_Wood_001_metallic.jpg'
		);
		const doorRoughnessTexture = await textureLoader.loadAsync(
			'door/Door_Wood_001_roughness.jpg'
		);
		const doorNormalTexture = await textureLoader.loadAsync(
			'door/Door_Wood_001_normal.jpg'
		);

		/**
		 * Scene
		 */

		// Floor
		const floorGeometry = new PlaneGeometry(20, 20, 100, 100);
		floorGeometry.rotateX(-Math.PI / 2);
		const floorMaterial = new MeshStandardMaterial({
			transparent: true,
			alphaMap: floorAlphaTexture,
			map: floorColorTexture,
			aoMap: floorARMTexture,
			roughnessMap: floorARMTexture,
			metalnessMap: floorARMTexture,
			normalMap: floorNormalTexture,
			displacementMap: floorDisplacementTexture,
			displacementBias: -0.2,
			displacementScale: 0.3,
		});
		const floor = new Mesh(floorGeometry, floorMaterial);
		scene.add(floor);

		// House container

		// Walls
		const wallsGeometry = new BoxGeometry(4, 2.5, 4);
		wallsGeometry.translate(0, 1.25, 0);
		const wallsMaterial = new MeshStandardMaterial({
			map: wallsColorTexture,
			aoMap: wallsARMTexture,
			roughnessMap: wallsARMTexture,
			metalnessMap: wallsARMTexture,
			normalMap: wallsNormalTexture,
		});
		const walls = new Mesh(wallsGeometry, wallsMaterial);
		// Roof
		const roofGeometry = new ConeGeometry(3.5, 1.5, 4, 1);
		const roofMaterial = new MeshStandardMaterial({
			map: roofColorTexture,
			aoMap: roofARMTexture,
			roughnessMap: roofARMTexture,
			metalnessMap: roofARMTexture,
			normalMap: roofNormalTexture,
		});
		const roof = new Mesh(roofGeometry, roofMaterial);
		roof.position.y = 2.5 + 1.5 / 2;
		roof.rotation.y = Math.PI / 4;
		// Door
		const doorGeometry = new PlaneGeometry(2.2, 2.2, 100, 100);
		const doorMaterial = new MeshStandardMaterial({
			transparent: true,
			map: doorColorTexture,
			aoMap: doorAmbientOcclusionTexture,
			alphaMap: doorAlphaTexture,
			displacementMap: doorDisplacementTexture,
			roughnessMap: doorRoughnessTexture,
			metalnessMap: doorMetalnessTexture,
			normalMap: doorNormalTexture,
			displacementScale: 0.15,
			displacementBias: -0.04,
		});
		const door = new Mesh(doorGeometry, doorMaterial);
		door.position.y = 2.2 / 2;
		door.position.z = 4 / 2 + 0.01;
		// Bushes
		const bushGeometry = new SphereGeometry(1, 16, 16);
		const bushMaterial = new MeshStandardMaterial({
			color: '#ccffcc',
			map: bushesColorTexture,
			aoMap: bushesARMTexture,
			roughnessMap: bushesARMTexture,
			metalnessMap: bushesARMTexture,
			normalMap: bushesNormalTexture,
		});
		const bush1 = new Mesh(bushGeometry, bushMaterial);
		bush1.scale.setScalar(0.5);
		bush1.position.set(0.8, 0.2, 2.2);
		// Clone need only once
		bush1.rotation.x = -0.75;

		const bush2 = bush1.clone();
		bush2.scale.setScalar(0.25);
		bush2.position.set(1.4, 0.1, 2.1);

		const bush3 = bush1.clone();
		bush3.scale.setScalar(0.4);
		bush3.position.set(-0.8, 0.1, 2.2);

		const bush4 = bush1.clone();
		bush4.scale.setScalar(0.15);
		bush4.position.set(-1, 0.05, 2.6);

		// Garves
		const garveGeometry = new BoxGeometry(0.6, 0.8, 0.2);
		const graveMaterial = new MeshStandardMaterial({
			map: graveColorTexture,
			aoMap: graveARMTexture,
			roughnessMap: graveARMTexture,
			metalnessMap: graveARMTexture,
			normalMap: graveNormalTexture,
		});
		const garves = new Group();

		for (let i = 0; i < 30; i++) {
			const angle = Math.random() * Math.PI * 2;
			const radius = 3 + Math.random() * 4;
			const x = Math.cos(angle) * radius;
			const y = Math.random() * 0.4;
			const z = Math.sin(angle) * radius;

			const grave = new Mesh(garveGeometry, graveMaterial);
			grave.position.x = x;
			grave.position.y = y;
			grave.position.z = z;

			grave.rotation.x = (Math.random() - 0.5) * 0.4;
			grave.rotation.y = (Math.random() - 0.5) * 0.4;
			grave.rotation.z = (Math.random() - 0.5) * 0.4;

			// Add to graves group
			garves.add(grave);
		}
		scene.add(garves);

		const house = new Group();
		house.add(walls);
		house.add(roof);
		house.add(door);
		house.add(bush1, bush2, bush3, bush4);
		scene.add(house);

		/**
		 * Shadows
		 */

		walls.castShadow = true;
		walls.receiveShadow = true;

		roof.castShadow = true;
		floor.receiveShadow = true;
		door.receiveShadow = true;

		garves.traverse((grave) => {
			grave.castShadow = true;
			garves.receiveShadow = true;
		});

		/**
		 * Sky
		 */

		const effectController = {
			radius: 1,
			phi: -1.6,
			theta: -0.4,
			scale: 100,
			turbidity: 20,
			rayleigh: 3,
			mieCoefficient: 0.1,
			mieDirectionalG: 0.95,
		};
		const sky = new Sky();
		function updateSky() {
			sky.scale.setScalar(effectController.scale);
			const sunPosition = new Vector3().setFromSphericalCoords(
				effectController.radius,
				effectController.phi,
				effectController.theta
			);
			sky.material.uniforms['sunPosition'].value = sunPosition;
			sky.material.uniforms['turbidity'].value = effectController.turbidity;
			sky.material.uniforms['rayleigh'].value = effectController.rayleigh;
			sky.material.uniforms['mieCoefficient'].value = effectController.mieCoefficient;
			sky.material.uniforms['mieDirectionalG'].value = effectController.mieDirectionalG;
		}
		updateSky();
		scene.add(sky);

		// Fog
		const fog = new FogExp2('#04343f', 0.1);
		scene.fog = fog;

		/**
		 * Lights
		 */

		const ambientLight = new AmbientLight();
		ambientLight.color = new Color('#86cdff');
		ambientLight.intensity = 0.275;
		scene.add(ambientLight);

		const directionalLight = new DirectionalLight();
		directionalLight.castShadow = true;
		directionalLight.color = new Color('#86cdff');
		directionalLight.scale.setScalar(1);
		directionalLight.position.x = 5.0;
		directionalLight.position.z = -5.0;
		directionalLight.shadow.mapSize.width = 512;
		directionalLight.shadow.mapSize.height = 512;
		directionalLight.shadow.camera.top = 8;
		directionalLight.shadow.camera.right = 8;
		directionalLight.shadow.camera.bottom = -8;
		directionalLight.shadow.camera.left = -8;
		directionalLight.shadow.camera.near = 1;
		directionalLight.shadow.camera.far = 20;
		scene.add(directionalLight);
		scene.add(directionalLight.target);

		// Door light
		const pointLight = new PointLight();
		pointLight.position.set(0, 2.2, 2.5);
		pointLight.color = new Color('#ff7d46');
		pointLight.intensity = 5;
		scene.add(pointLight);

		// Ghosts Light
		const ghost1 = new PointLight('#8800ff', 6);
		ghost1.castShadow = true;
		ghost1.shadow.camera.far = 10;
		ghost1.shadow.mapSize.set(256, 256);

		const ghost2 = new PointLight('#ff0088', 6);
		ghost2.castShadow = true;
		ghost2.shadow.camera.far = 10;
		ghost2.shadow.mapSize.set(256, 256);

		const ghost3 = new PointLight('#ff0000', 6);
		ghost3.castShadow = true;
		ghost3.shadow.camera.far = 10;
		ghost3.shadow.mapSize.set(256, 256);

		scene.add(ghost1, ghost2, ghost3);

		/**
		 * Helpers
		 */

		const axesHelper = new AxesHelper();
		scene.add(axesHelper);

		const directionalLightHelper = new DirectionalLightHelper(directionalLight);
		directionalLightHelper.visible = false;
		scene.add(directionalLightHelper);

		const pointLightHelper = new PointLightHelper(pointLight);
		pointLightHelper.visible = false;
		scene.add(pointLightHelper);

		const ghost1LightHelper = new PointLightHelper(ghost1);
		ghost1LightHelper.visible = false;
		const ghost2LightHelper = new PointLightHelper(ghost2);
		ghost2LightHelper.visible = false;
		const ghost3LightHelper = new PointLightHelper(ghost3);
		ghost3LightHelper.visible = false;
		scene.add(ghost1LightHelper, ghost2LightHelper, ghost3LightHelper);

		/**
		 * Pane
		 */

		const pane = new Pane({ title: 'Debug Params' });
		// Ambient Light
		{
			const ambientPane = pane.addFolder({ title: 'Ambient Light' });
			ambientPane.addBinding(ambientLight, 'intensity', {
				min: 0,
				max: 10,
				step: 0.1,
			});
			ambientPane.addBinding(ambientLight, 'color', {
				color: {
					type: 'float',
				},
			});
		}
		// DirectionalLight
		{
			const directionalLightPane = pane.addFolder({ title: 'Directional Light' });
			directionalLightPane.addBinding(directionalLightHelper, 'visible', {
				label: 'helper visible',
			});
			directionalLightPane.addBinding(directionalLight, 'color', {
				color: { type: 'float' },
			});
			directionalLightPane.addBinding(directionalLight, 'intensity', {
				min: 0,
				max: 10,
				step: 0.1,
			});
			directionalLightPane
				.addBinding(directionalLight, 'position')
				.on('change', () => directionalLightHelper.update());
		}
		// Point Light
		{
			const pointLightPane = pane.addFolder({ title: 'Point Light' });
			pointLightPane.addBinding(pointLightHelper, 'visible', {
				label: 'helper visible',
			});
			pointLightPane.addBinding(pointLight, 'color', {
				color: { type: 'float' },
			});
			pointLightPane.addBinding(pointLight, 'intensity', {
				min: 0,
				max: 10,
				step: 0.1,
			});
			pointLightPane
				.addBinding(pointLight, 'position')
				.on('change', () => pointLightHelper.update());
		}
		// Ghost Light
		{
			const ghostPane = pane.addFolder({ title: 'Ghost Light' });
			ghostPane.addBinding(ghost1LightHelper, 'visible').on('change', (val) => {
				ghost1LightHelper.visible = val.value;
				ghost2LightHelper.visible = val.value;
				ghost3LightHelper.visible = val.value;
			});
		}
		// Floor Material
		{
			const floorMaterialPane = pane.addFolder({ title: 'Floor Material' });
			floorMaterialPane.addBinding(floorMaterial, 'roughness', {
				min: 0,
				max: 1,
				step: 0.1,
			});
			floorMaterialPane.addBinding(floorMaterial, 'metalness', {
				min: 0,
				max: 1,
				step: 0.1,
			});
			floorMaterialPane.addBinding(floorMaterial, 'displacementScale', {
				min: 0,
				max: 1,
				step: 0.01,
			});
			floorMaterialPane.addBinding(floorMaterial, 'displacementBias', {
				min: -1,
				max: 1,
				step: 0.01,
			});
		}
		// Sky
		{
			const skyPane = pane.addFolder({ title: 'Sky' });
			skyPane
				.addBinding(effectController, 'radius', {
					label: 'radius',
					min: 0,
					max: 100,
				})
				.on('change', updateSky);
			skyPane
				.addBinding(effectController, 'phi', {
					min: -Math.PI,
					max: Math.PI,
					step: 0.1,
				})
				.on('change', updateSky);
			skyPane
				.addBinding(effectController, 'theta', {
					min: -Math.PI,
					max: Math.PI,
					step: 0.1,
				})
				.on('change', updateSky);
			skyPane
				.addBinding(effectController, 'turbidity', {
					min: 0,
					max: 50,
					step: 0.01,
				})
				.on('change', updateSky);
			skyPane
				.addBinding(effectController, 'rayleigh', {
					min: 0,
					max: 10,
					step: 0.01,
				})
				.on('change', updateSky);
			skyPane
				.addBinding(effectController, 'mieCoefficient', {
					min: 0,
					max: 10,
					step: 0.01,
				})
				.on('change', updateSky);
			skyPane
				.addBinding(effectController, 'mieDirectionalG', {
					min: 0,
					max: 10,
					step: 0.01,
				})
				.on('change', updateSky);
		}
		/**
		 * Events
		 */

		function render(time: number = 0) {
			requestAnimationFrame(render);

			stats.update();
			controls.update(time);
			renderer.render(scene, camera);

			const ghost1Angle = time * 0.0005;
			const ghost2Angle = -time * 0.00038;
			const ghost3Angle = -time * 0.00023;

			ghost1.position.x = Math.cos(ghost1Angle) * 4;
			ghost1.position.y =
				Math.sin(ghost1Angle) *
				Math.sin(ghost1Angle + 2.34) *
				Math.sin(ghost1Angle + 3.45);
			ghost1.position.z = Math.sin(ghost1Angle) * 4;

			ghost2.position.x = Math.cos(ghost2Angle) * 5;
			ghost2.position.y =
				Math.sin(ghost2Angle) *
				Math.sin(ghost2Angle + 2.34) *
				Math.sin(ghost2Angle + 3.45);
			ghost2.position.z = Math.sin(ghost2Angle) * 5;

			ghost3.position.x = Math.cos(ghost3Angle) * 6;
			ghost3.position.y =
				Math.sin(ghost3Angle) *
				Math.sin(ghost3Angle + 2.34) *
				Math.sin(ghost3Angle + 3.45);
			ghost3.position.z = Math.sin(ghost3Angle) * 6;
		}
		render();

		function resize() {
			renderer.setSize(window.innerWidth, window.innerHeight);
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		}
		window.addEventListener('resize', resize);
	};

	useEffect(() => {
		initialScene();
	}, []);

	return <div id='container'></div>;
}
