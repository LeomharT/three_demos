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
	FloatType,
	LinearFilter,
	LinearSRGBColorSpace,
	Mesh,
	MeshBasicMaterial,
	NearestFilter,
	PerspectiveCamera,
	Plane,
	PlaneGeometry,
	RGBAFormat,
	Scene,
	ShaderMaterial,
	Vector2,
	Vector3,
	Vector4,
	WebGLRenderer,
	WebGLRenderTarget,
} from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import {
	CameraUtils,
	DRACOLoader,
	GLTFLoader,
	OrbitControls,
} from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Pane } from 'tweakpane';
import MccreeModel from './assets/low_poly_mccree/low_poly_mccree-transformed.glb?url';
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

		const WIDTH = 1;
		const GOLDENRATIO = 1.61803398875;

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.localClippingEnabled = true;
		renderer.shadowMap.enabled = true;
		renderer.setPixelRatio(window.devicePixelRatio);
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

		const portalRenderTarget = new WebGLRenderTarget(
			innerWidth * window.devicePixelRatio,
			innerHeight * window.devicePixelRatio,
			{
				samples: 8,
				minFilter: LinearFilter,
				magFilter: NearestFilter,
				type: FloatType,
				format: RGBAFormat,
				generateMipmaps: true,
				depthBuffer: true,
				colorSpace: LinearSRGBColorSpace,
			}
		);
		const portalScene = new Scene();
		const portalCamera = new PerspectiveCamera(45, 1.0, 0.1, 500.0);
		portalScene.add(portalCamera);

		const controler = new OrbitControls(camera, renderer.domElement);
		controler.enableDamping = true;
		controler.dampingFactor = 0.05;
		controler.enablePan = false;
		controler.panSpeed = 1;
		controler.enabled = true;
		controler.maxPolarAngle = Math.PI / 1.5;
		controler.maxAzimuthAngle = Math.PI / 3;
		controler.minAzimuthAngle = -Math.PI / 3;

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
				u_resolution: {
					value: new Vector2(
						innerWidth * window.devicePixelRatio,
						innerHeight * window.devicePixelRatio
					),
				},
			},
		});
		const portalMesh = new Mesh(portalGeometry, portalMaterial);
		scene.add(portalMesh);

		const sky = new Sky();
		sky.material.needsUpdate = true;
		sky.material.uniformsNeedUpdate = true;
		const effectController = {
			turbidity: 10,
			rayleigh: 0.5,
			mieCoefficient: 0.005,
			mieDirectionalG: 0.8,
			elevation: 0.6,
			azimuth: 0.1,
			distance: 1000,
			exposure: renderer.toneMappingExposure,
		};
		function updateSky() {
			const uniforms = sky.material.uniforms;
			uniforms['turbidity'].value = effectController.turbidity;
			uniforms['rayleigh'].value = effectController.rayleigh;
			uniforms['mieCoefficient'].value = effectController.mieCoefficient;
			uniforms['mieDirectionalG'].value = effectController.mieDirectionalG;

			function calcPosFromAngles(
				inclination: number,
				azimuth: number,
				vector: Vector3 = new Vector3()
			) {
				const theta = Math.PI * (inclination - 0.5);
				const phi = 2 * Math.PI * (azimuth - 0.5);

				vector.x = Math.cos(phi);
				vector.y = Math.sin(theta);
				vector.z = Math.sin(phi);

				return vector;
			}
			// const phi = MathUtils.degToRad(90 - effectController.elevation);
			// const theta = MathUtils.degToRad(effectController.azimuth);
			const sunPosition = calcPosFromAngles(
				effectController.elevation,
				effectController.azimuth
			);
			sky.material.uniforms.sunPosition.value = sunPosition;

			sky.scale.setScalar(effectController.distance);

			renderer.toneMappingExposure = effectController.exposure;
		}
		updateSky();
		portalScene.add(sky);

		const zPlane = new Plane(new Vector3(0, 0, 1), 0.0);
		const yPlane = new Plane(new Vector3(0, 1, 0), 1.0);

		gltfLoader.load(MccreeModel, (data) => {
			const mccree = data.scene;
			mccree.rotateY(Math.PI);
			mccree.position.set(0, -2, 0);
			portalScene.add(mccree);

			const clone = mccree.clone();
			clone.rotateY(-Math.PI);
			clone.traverse((object) => {
				if (object instanceof Mesh) {
					if (object.material instanceof MeshBasicMaterial) {
						const m = object.material.clone();
						m.clippingPlanes = [zPlane, yPlane];
						object.material = m;
					}
				}
			});
			scene.add(clone);
		});

		// Render Protal Scene
		const reflectedPosition = new Vector3();
		const bottomLeftCorner = new Vector3();
		const bottomRightCorner = new Vector3();
		const topLeftCorner = new Vector3();

		const boundingBox = new Box3().setFromBufferAttribute(
			portalMesh.geometry.attributes.position as BufferAttribute
		);

		function renderPortalScene() {
			portalMesh.worldToLocal(reflectedPosition.copy(camera.position));
			reflectedPosition.x *= -1.0;
			reflectedPosition.z *= -1.0;
			portalMesh.localToWorld(reflectedPosition);
			portalCamera.position.copy(reflectedPosition);

			portalMesh.localToWorld(
				bottomLeftCorner.set(boundingBox.max.x, boundingBox.min.y, 0.0)
			);
			portalMesh.localToWorld(
				bottomRightCorner.set(boundingBox.min.x, boundingBox.min.y, 0.0)
			);
			portalMesh.localToWorld(
				topLeftCorner.set(boundingBox.max.x, boundingBox.max.y, 0.0)
			);

			CameraUtils.frameCorners(
				portalCamera,
				bottomLeftCorner,
				bottomRightCorner,
				topLeftCorner,
				false
			);

			portalRenderTarget.texture.colorSpace = renderer.outputColorSpace;
			portalRenderTarget.texture.magFilter = NearestFilter;

			const currentRenderTarget = renderer.getRenderTarget();
			renderer.setRenderTarget(portalRenderTarget);

			if (renderer.autoClear === false) renderer.clear();
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
