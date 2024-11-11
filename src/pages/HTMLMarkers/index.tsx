import {
	Box,
	Group as MantineGroup,
	MantineProvider,
	Title,
	useMantineTheme,
} from '@mantine/core';
import { IconMapPinFilled } from '@tabler/icons-react';
import { Easing } from '@tweenjs/tween.js';
import { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import {
	AmbientLight,
	AxesHelper,
	Color,
	EquirectangularReflectionMapping,
	Group,
	Mesh,
	MeshStandardMaterial,
	PCFSoftShadowMap,
	PerspectiveCamera,
	PlaneGeometry,
	Raycaster,
	Scene,
	ShadowMaterial,
	SpotLight,
	SpotLightHelper,
	Vector2,
	Vector3,
	WebGLRenderer,
} from 'three';
import {
	CSS3DObject,
	CSS3DRenderer,
	GLTFLoader,
	OrbitControls,
	RGBELoader,
} from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Tween } from 'three/examples/jsm/libs/tween.module.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { Pane } from 'tweakpane';
import EarthModel from './assets/earth.gltf?url';
import CityHDR from './assets/modern_european_city_street_1k.hdr?url';
import classes from './style.module.css';

export default function HTMLMarkers() {
	const theme = useMantineTheme();

	useEffect(() => {
		const el = document.querySelector('#container') as HTMLDivElement;
		el.innerHTML = '';

		const { innerWidth, innerHeight } = window;

		const rgbeLoader = new RGBELoader();

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.setClearAlpha(0);
		renderer.setSize(innerWidth, innerHeight);
		renderer.domElement.style.position = 'relative';
		renderer.domElement.style.zIndex = '1';
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = PCFSoftShadowMap;
		el.append(renderer.domElement);

		const scene = new Scene();
		scene.background = new Color(theme.colors.gray[2]);

		rgbeLoader.load(CityHDR, (data) => {
			scene.environment = data;
			scene.environment.mapping = EquirectangularReflectionMapping;
		});

		const css3DRenderer = new CSS3DRenderer();
		css3DRenderer.setSize(innerWidth, innerHeight);
		css3DRenderer.domElement.style.position = 'absolute';
		css3DRenderer.domElement.style.top = '0';
		css3DRenderer.domElement.style.zIndex = '2';
		css3DRenderer.domElement.style.pointerEvents = 'none';
		el.append(css3DRenderer.domElement);

		const camera = new PerspectiveCamera(
			75,
			innerWidth / innerHeight,
			0.1,
			1000
		);
		camera.position.set(0, 2, 5);
		camera.lookAt(scene.position);

		const controler = new OrbitControls(camera, renderer.domElement);
		controler.enableDamping = true;
		controler.enablePan = true;

		const axesHelper = new AxesHelper();
		// scene.add(axesHelper);

		const state = new Stats();
		el.append(state.dom);

		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath('node_modules/three/examples/jsm/libs/draco/');
		dracoLoader.setDecoderConfig({ type: 'js' });
		dracoLoader.preload();

		const gltfLoader = new GLTFLoader();
		gltfLoader.dracoLoader = dracoLoader;
		gltfLoader.path = window.location.origin;

		// Modules
		const planeGemotry = new PlaneGeometry(100, 100);
		planeGemotry.rotateX(-Math.PI / 2);
		const shadowMaterial = new ShadowMaterial({
			color: 0x000000,
			opacity: 0.2,
		});
		const plane = new Mesh(planeGemotry, shadowMaterial);
		plane.userData.name = 'Floor_Shadow';
		plane.receiveShadow = true;
		scene.add(plane);

		const ambientLight = new AmbientLight();
		ambientLight.intensity = 0.8;
		scene.add(ambientLight);

		const spotLight = new SpotLight(0xffffff);
		spotLight.castShadow = true;
		spotLight.intensity = 0.2;
		spotLight.angle = 1.1;
		spotLight.decay = 0.1;
		spotLight.shadow.bias = 0.0111;
		spotLight.shadow.radius = 4;
		spotLight.shadow.mapSize.set(512, 512);
		spotLight.position.set(0, 40, 0);
		scene.add(spotLight);

		const spotLightHelper = new SpotLightHelper(
			spotLight,
			theme.colors.blue[5]
		);
		spotLightHelper.visible = false;
		// scene.add(spotLightHelper);

		const tween = new Tween(camera);

		function cameraMoveToCenter(camera: PerspectiveCamera) {
			if (tween.isPlaying()) return;

			tween
				.to({
					position: {
						x: 0,
						y: 2,
						z: 5,
					},
					rotation: {
						x: 0,
						y: 0,
						z: 0,
					},
				})
				.easing(Easing.Quadratic.InOut)
				.duration(1000)
				.onStart(() => {
					controler.enabled = false;
				})
				.onComplete(() => {
					controler.enabled = true;
				})
				.onUpdate((value) => {
					camera.position.x = value.position.x;
					camera.position.y = value.position.y;
					camera.position.z = value.position.z;

					camera.lookAt(scene.position);
					camera.updateProjectionMatrix();
				});
			tween.start();
		}

		gltfLoader.load(EarthModel, (data) => {
			const lampd = data.scene.getObjectByName('URF-Height_Lampd_0')!;
			const lampdIce = data.scene.getObjectByName('URF-Height_Lampd_Ice_0')!;
			const lampdWater = data.scene.getObjectByName('URF-Height_watr_0')!;

			const markers = [
				{
					id: 'markerNorth',
					position: new Vector3(0, 2.5, 0),
					scalc: new Vector3(0.03, 0.03, 0.03),
					rotate: {
						axis: new Vector3(0, 0, 0),
						angle: 0,
					},
					element: (
						<MantineGroup
							gap={0}
							id='markerNorth'
							className={`${classes.marker} ${classes.visiable}`}
						>
							<IconMapPinFilled color={theme.colors.blue[5]} />
							<Title order={6}>North</Title>
						</MantineGroup>
					),
				},
				{
					id: 'markerSouth',
					position: new Vector3(-1.5, 1.5, 0),
					scalc: new Vector3(0.03, 0.03, 0.03),
					rotate: {
						axis: new Vector3(0, 0, 1),
						angle: Math.PI / 2,
					},
					element: (
						<IconMapPinFilled
							id='markerSouth'
							className={`${classes.marker} ${classes.visiable}`}
							color={theme.colors.yellow[5]}
							onClick={() => cameraMoveToCenter(camera)}
						/>
					),
				},
			];

			for (const m of markers) {
				const css3DContainer = document.createElement('div');

				const css3DRoot = ReactDOM.createRoot(css3DContainer);
				css3DRoot.render(<MantineProvider>{m.element}</MantineProvider>);

				const marker = new CSS3DObject(css3DContainer);
				marker.scale.set(...m.scalc.toArray());
				marker.rotateOnAxis(m.rotate.axis, m.rotate.angle);
				marker.position.set(...m.position.toArray());
				scene.add(marker);
			}

			controler.addEventListener('change', () => {
				const raycaster = new Raycaster();

				for (const marker of markers) {
					const markerPosition = marker.position.clone();
					markerPosition.project(camera);

					raycaster.setFromCamera(
						new Vector2(markerPosition.x, markerPosition.y),
						camera
					);

					const intersects = raycaster.intersectObjects(scene.children, true);

					const element = document.querySelector(`#${marker.id}`);

					if (intersects.length === 0) {
						element?.classList.add(classes.visiable);
					} else {
						const intersectionDistance = intersects[0].distance;
						const markerDestance = marker.position.distanceTo(camera.position);

						// if css object is far to camera, then its blocked
						if (intersectionDistance < markerDestance) {
							element?.classList.remove(classes.visiable);
						} else {
							element?.classList.add(classes.visiable);
						}
					}
				}
			});

			if (lampdWater instanceof Mesh) {
				if (lampdWater.material instanceof MeshStandardMaterial) {
					lampdWater.material.roughness = 0;
				}
			}
			if (lampdIce instanceof Mesh) {
				if (lampdIce.material instanceof MeshStandardMaterial) {
					lampdIce.material.roughness = 0;
				}
			}
			if (lampd instanceof Mesh) {
				if (lampd.material instanceof MeshStandardMaterial) {
					lampd.material.color = new Color('lightgreen');
				}
			}

			const group = new Group();
			group.add(lampd, lampdIce, lampdWater);
			group.position.set(0, 1.1, 0);
			group.traverse((object) => {
				object.castShadow = true;
			});
			scene.add(group);
		});

		// Debuger params
		const params = {
			debugger: false,
			environmentIntensity: 0.5,
			ambientIntensity: 0.5,
			spotlightAngle: 1.1,
		};
		const pane = new Pane({ title: 'params' });
		pane.element.style.position = 'relative';
		pane.element.style.zIndex = '99';
		pane.addBinding(params, 'debugger').on('change', (val) => {
			spotLightHelper.visible = !!val.value;
			axesHelper.visible = !!val.value;
		});
		pane
			.addBinding(params, 'ambientIntensity', {
				step: 0.1,
				max: 10,
				min: 0.1,
			})
			.on('change', (val) => {
				ambientLight.intensity = val.value;
			});
		pane
			.addBinding(params, 'environmentIntensity', {
				step: 0.1,
				max: 10,
				min: 0.1,
			})
			.on('change', (val) => {
				scene.environmentIntensity = val.value;
			});
		pane
			.addBinding(params, 'spotlightAngle', {
				step: 0.1,
				max: Math.PI / 2,
				min: 0.1,
			})
			.on('change', (val) => {
				spotLight.angle = val.value;
				spotLightHelper.update();
			});
		pane
			.addButton({
				title: 'Documentation',
			})
			.on('click', () => {
				window.location.href = '/docs';
			});

		function render(time?: number) {
			requestAnimationFrame(render);

			state.update();
			controler.update(time);
			renderer.render(scene, camera);
			css3DRenderer.render(scene, camera);
			tween.update(time);
		}
		render();

		function resize() {
			css3DRenderer.setSize(window.innerWidth, window.innerHeight);
			renderer.setSize(window.innerWidth, window.innerHeight);
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		}
		window.addEventListener('resize', resize);
	}, []);

	return <Box id='container' pos='relative'></Box>;
}
