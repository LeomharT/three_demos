import { useMantineTheme } from '@mantine/core';
import colorNormalize from 'color-normalize';
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import {
	ACESFilmicToneMapping,
	AxesHelper,
	Box3,
	BufferAttribute,
	Color,
	Group,
	MathUtils,
	Mesh,
	OrthographicCamera,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	ShaderMaterial,
	Vector3,
	Vector4,
	WebGLRenderer,
	WebGLRenderTarget,
} from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import {
	DRACOLoader,
	GLTFLoader,
	OrbitControls,
} from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Pane } from 'tweakpane';
import MccreeModel from './assets/low_poly_mccree/scene.gltf?url';
import fragmentShader from './shader/fragment.glsl?raw';
import fragmentPortalShader from './shader/fragmentPortal.glsl?raw';
import vertexShader from './shader/vertex.glsl?raw';

export default function MccreePortal() {
	const theme = useMantineTheme();

	const location = useLocation();

	useEffect(() => {
		const el = document.querySelector('#container') as HTMLDivElement;
		el.innerHTML = '';

		const { innerWidth, innerHeight } = window;

		const GOLDENRATIO = 1.61803398875;
		const WIDTH = 1;

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.localClippingEnabled = true;
		renderer.shadowMap.enabled = true;
		renderer.setClearAlpha(0);
		renderer.setSize(innerWidth, innerHeight);
		renderer.toneMapping = ACESFilmicToneMapping;
		renderer.toneMappingExposure = 0.5;
		el.append(renderer.domElement);

		const scene = new Scene();
		scene.background = new Color(theme.colors.gray[0]);

		const camera = new PerspectiveCamera(
			75,
			innerWidth / innerHeight,
			0.5,
			1000
		);
		camera.position.set(0, 0, 1.5);
		camera.lookAt(scene.position);

		const portalRenderTarget = new WebGLRenderTarget(512, 512);
		const portalScene = new Scene();

		const controler = new OrbitControls(camera, renderer.domElement);
		controler.enableDamping = true;
		controler.dampingFactor = 0.05;
		controler.enablePan = false;
		controler.panSpeed = 1;
		controler.enabled = true;
		controler.maxPolarAngle = Math.PI / 1.5;
		controler.maxAzimuthAngle = Math.PI / 3;
		controler.minAzimuthAngle = -Math.PI / 3;

		controler.addEventListener('change', () => {
			portalCamera.rotation.setFromQuaternion(camera.quaternion.clone());

			portalCamera.position.set(
				camera.position.x,
				camera.position.y,
				camera.position.z
			);
		});

		const stats = new Stats();
		el.append(stats.dom);

		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath('node_modules/three/examples/jsm/libs/draco/');
		dracoLoader.setDecoderConfig({ type: 'js' });
		dracoLoader.preload();

		const gltfLoader = new GLTFLoader();
		gltfLoader.dracoLoader = dracoLoader;

		const axesHelper = new AxesHelper();
		scene.add(axesHelper);

		// Models
		const planeGeometry = new PlaneGeometry(WIDTH + 0.05, GOLDENRATIO + 0.05);
		const palneMaterial = new ShaderMaterial({
			fragmentShader,
			vertexShader,
			transparent: true,
			uniforms: {
				u_color: {
					value: new Vector4(...colorNormalize(theme.black)),
				},
				u_radius: { value: 0.05 },
				u_aspect: { value: (WIDTH + 0.05) / (GOLDENRATIO + 0.05) },
			},
		});
		const plane = new Mesh(planeGeometry, palneMaterial);
		scene.add(plane);

		const portalGeometry = new PlaneGeometry(WIDTH, GOLDENRATIO);
		const portalMaterial = new ShaderMaterial({
			fragmentShader: fragmentPortalShader,
			vertexShader,
			transparent: true,
			depthTest: false,
			toneMapped: true,
			uniforms: {
				u_color: {
					value: new Vector4(...colorNormalize(theme.colors.blue[5])),
				},
				u_radius: { value: 0.05 },
				u_aspect: { value: WIDTH / GOLDENRATIO },
				u_texture: { value: portalRenderTarget.texture },
			},
		});
		const portalMesh = new Mesh(portalGeometry, portalMaterial);
		scene.add(portalMesh);

		const boundingBox = new Box3().setFromBufferAttribute(
			plane.geometry.attributes.position as BufferAttribute
		);
		const portalCamera = new OrthographicCamera(
			boundingBox.min.x * (1 + 2 / 512),
			boundingBox.max.x * (1 + 2 / 512),
			boundingBox.max.y * (1 + 2 / 512),
			boundingBox.min.y * (1 + 2 / 512),
			0.1,
			1000
		);
		portalCamera.position.set(0, 0, 1);
		portalCamera.lookAt(portalScene.position);

		const sky = new Sky();
		sky.scale.setScalar(450000);
		sky.material.needsUpdate = true;
		sky.material.uniformsNeedUpdate = true;
		const effectController = {
			turbidity: 10,
			rayleigh: 1,
			mieCoefficient: 0.005,
			mieDirectionalG: 0.7,
			elevation: 45,
			azimuth: -90,
			exposure: renderer.toneMappingExposure,
		};
		function updateSky() {
			const uniforms = sky.material.uniforms;
			uniforms['turbidity'].value = effectController.turbidity;
			uniforms['rayleigh'].value = effectController.rayleigh;
			uniforms['mieCoefficient'].value = effectController.mieCoefficient;
			uniforms['mieDirectionalG'].value = effectController.mieDirectionalG;

			const phi = MathUtils.degToRad(90 - effectController.elevation);
			const theta = MathUtils.degToRad(effectController.azimuth);
			const sunPosition = new Vector3().setFromSphericalCoords(1, phi, theta);
			sky.material.uniforms.sunPosition.value = sunPosition;

			renderer.toneMappingExposure = effectController.exposure;
		}
		updateSky();
		portalScene.add(sky);

		gltfLoader.load(MccreeModel, (data) => {
			const mccree = data.scene;
			mccree.position.set(0, -2, 0);

			const mccreeClone = mccree.clone() as Group;

			scene.add(mccree);
			portalScene.add(mccreeClone);
		});

		function renderPortalScene() {
			const currentRenderTarget = renderer.getRenderTarget();

			renderer.setRenderTarget(portalRenderTarget);

			renderer.state.buffers.depth.setMask(true);
			renderer.render(portalScene, portalCamera);

			renderer.setRenderTarget(currentRenderTarget);
		}

		// Pane
		const pane = new Pane();
		pane.element.id = 'pane';
		pane.element.style.visibility =
			location.hash === '#debug' ? 'visialbe' : 'hidden';

		const skyPane = pane.addFolder({ title: 'Sky Params' });
		skyPane
			.addBinding(effectController, 'turbidity', {
				max: 20,
				min: 0,
				label: 'Haziness',
			})
			.on('change', updateSky);
		skyPane
			.addBinding(effectController, 'rayleigh', {
				max: 4,
				min: 0,
				label: 'Rayleigh',
			})
			.on('change', updateSky);
		skyPane
			.addBinding(effectController, 'mieCoefficient', {
				max: 0.1,
				min: 0,
				label: 'MieCoefficient',
			})
			.on('change', updateSky);
		skyPane
			.addBinding(effectController, 'mieDirectionalG', {
				max: 1,
				min: 0,
				label: 'MieDirectionalG',
			})
			.on('change', updateSky);
		skyPane
			.addBinding(effectController, 'elevation', {
				max: 90,
				min: 0,
				label: 'Elevation',
			})
			.on('change', updateSky);
		skyPane
			.addBinding(effectController, 'azimuth', {
				max: 180,
				min: -180,
				label: 'Azimuth',
			})
			.on('change', updateSky);
		skyPane
			.addBinding(effectController, 'exposure', {
				max: 1,
				min: 0,
				label: 'Exposure',
			})
			.on('change', updateSky);
		pane
			.addButton({
				label: 'Docs',
				title: 'Docs',
			})
			.on('click', () => {
				window.location.href = '/docs/mccree';
			});

		const panes = document.querySelectorAll('.tp-dfwv');
		if (panes.length > 1) {
			panes[1].remove();
		}

		function render(time?: number) {
			requestAnimationFrame(render);
			controler.update(time);
			stats.update();

			renderPortalScene();
			renderer.render(scene, camera);
		}
		render();

		function resize() {
			renderer.setSize(window.innerWidth, window.innerHeight);
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		}

		window.addEventListener('resize', resize);
	}, []);

	return <div id='container'></div>;
}
