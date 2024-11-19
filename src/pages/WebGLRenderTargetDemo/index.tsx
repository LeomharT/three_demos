import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
	ACESFilmicToneMapping,
	AxesHelper,
	Color,
	DoubleSide,
	IcosahedronGeometry,
	Mesh,
	MeshBasicMaterial,
	MeshPhongMaterial,
	PerspectiveCamera,
	Plane,
	PlaneGeometry,
	PointLight,
	Scene,
	Vector3,
	WebGLRenderer,
	WebGLRenderTarget,
} from 'three';
import {
	CameraUtils,
	GLTFLoader,
	OrbitControls,
} from 'three/examples/jsm/Addons.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { Pane } from 'tweakpane';
import MccreeModelURL from '../MccreePortal/assets/low_poly_mccree/low_poly_mccree-transformed.glb?url';

export default function WebGLRenderTargetDemo() {
	const navigate = useNavigate();

	const location = useLocation();

	useEffect(() => {
		const el = document.querySelector('#container') as HTMLDivElement;
		el.innerHTML = '';

		const { innerWidth, innerHeight } = window;

		const RESOLUTION = 512;

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.localClippingEnabled = true;
		renderer.setSize(innerWidth, innerHeight);
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.toneMapping = ACESFilmicToneMapping;
		el.append(renderer.domElement);

		const scene = new Scene();

		const camera = new PerspectiveCamera(
			75,
			innerWidth / innerHeight,
			0.1,
			1000
		);
		camera.position.set(0, 75, 160);
		camera.lookAt(scene.position);

		const controler = new OrbitControls(camera, renderer.domElement);
		controler.target.set(0, 40, 0);
		controler.enablePan = true;
		controler.enableDamping = true;
		controler.dampingFactor = 0.05;

		const darcoLoader = new DRACOLoader();
		darcoLoader.setDecoderPath('node_modules/three/examples/jsm/libs/draco/');
		darcoLoader.setDecoderConfig({ type: 'js' });
		darcoLoader.preload();

		const gltfLoader = new GLTFLoader();
		gltfLoader.dracoLoader = darcoLoader;

		const mccree = gltfLoader.loadAsync(MccreeModelURL);

		const portalScene = new Scene();
		portalScene.background = new Color(1, 11, 0);

		const portalCamera = new PerspectiveCamera(45, 1.0, 0.1, 500.0);
		portalScene.add(portalCamera);

		const axesHelper = new AxesHelper(50);
		scene.add(axesHelper);

		const planeGeo = new PlaneGeometry(100.1, 100.1);

		const portalPlane = new Plane(new Vector3(0, 0, 1), 0);

		const geometry = new IcosahedronGeometry(5, 0);
		const material = new MeshPhongMaterial({
			color: 0xffffff,
			emissive: 0x333333,
			flatShading: true,
			clippingPlanes: [portalPlane],
			clipShadows: true,
		});
		const smallSphereOne = new Mesh(geometry, material);
		// smallSphereOne.position.y = 20;
		// smallSphereOne.position.x = 30;
		scene.add(smallSphereOne);
		const smallSphereTwo = new Mesh(geometry, material);
		scene.add(smallSphereTwo);

		const leftPortalTexture = new WebGLRenderTarget(RESOLUTION, RESOLUTION);
		const leftPortal = new Mesh(
			planeGeo,
			new MeshBasicMaterial({ map: leftPortalTexture.texture })
		);
		leftPortal.position.x = -30;
		leftPortal.position.y = 20;
		leftPortal.scale.set(0.35, 0.35, 0.35);
		scene.add(leftPortal);

		const rightPortalTexture = new WebGLRenderTarget(RESOLUTION, RESOLUTION);
		const rightPortal = new Mesh(
			planeGeo,
			new MeshBasicMaterial({ map: rightPortalTexture.texture })
		);
		rightPortal.position.y = 20;
		rightPortal.scale.set(0.35, 0.35, 0.35);
		portalScene.add(rightPortal);

		// Ground
		const planeTop = new Mesh(
			planeGeo,
			new MeshPhongMaterial({ color: 0xffffff })
		);
		planeTop.rotateX(Math.PI / 2);
		planeTop.position.set(0, 100, 0);
		scene.add(planeTop);

		const planeBack = new Mesh(
			planeGeo,
			new MeshPhongMaterial({ color: 0xff7fff })
		);
		planeBack.position.z = -50;
		planeBack.position.y = 50;
		scene.add(planeBack);

		const planeBottom = new Mesh(
			planeGeo,
			new MeshPhongMaterial({ color: 0xffffff })
		);
		planeBottom.rotateX(-Math.PI / 2);
		scene.add(planeBottom);

		const planeFront = new Mesh(
			planeGeo,
			new MeshPhongMaterial({ color: 0x7f7fff })
		);
		planeFront.position.z = 50;
		planeFront.position.y = 50;
		planeFront.rotateY(Math.PI);
		scene.add(planeFront);

		const planeRight = new Mesh(
			planeGeo,
			new MeshPhongMaterial({ color: 0x00ff00 })
		);
		planeRight.position.x = 50;
		planeRight.position.y = 50;
		planeRight.rotateY(-Math.PI / 2);
		scene.add(planeRight);

		const planeLeft = new Mesh(
			planeGeo,
			new MeshPhongMaterial({ color: 0xff0000 })
		);
		planeLeft.position.x = -50;
		planeLeft.position.y = 50;
		planeLeft.rotateY(Math.PI / 2);
		scene.add(planeLeft);

		// lights
		const mainLight = new PointLight(0xe7e7e7, 2.5, 250, 0);
		mainLight.position.y = 60;
		scene.add(mainLight);

		const greenLight = new PointLight(0x00ff00, 0.5, 1000, 0);
		greenLight.position.set(550, 50, 0);
		scene.add(greenLight);

		const redLight = new PointLight(0xff0000, 0.5, 1000, 0);
		redLight.position.set(-550, 50, 0);
		scene.add(redLight);

		const blueLight = new PointLight(0xbbbbfe, 0.5, 1000, 0);
		blueLight.position.set(0, 50, 550);
		scene.add(blueLight);

		const zPlane = new Plane(new Vector3(0, 0, 1));
		const yPlane = new Plane(new Vector3(0, 1, 0), 1);

		mccree.then((data) => {
			const model = data.scene;
			model.scale.setScalar(20);
			model.position.y = -20;
			model.rotateY(Math.PI);

			portalScene.add(model);

			const clone = model.clone(true);
			clone.position.x = -30;
			clone.rotateY(Math.PI);
			clone.traverse((object) => {
				if (object instanceof Mesh) {
					if (object.material instanceof MeshBasicMaterial) {
						object.material.side = DoubleSide;
						// object.material.clippingPlanes = [zPlane, yPlane];
					}
				}
			});
			// scene.add(clone);
		});

		const reflectedPosition = new Vector3();
		const bottomLeftCorner = new Vector3();
		const bottomRightCorner = new Vector3();
		const topLeftCorner = new Vector3();

		function renderPortal() {
			leftPortal.worldToLocal(reflectedPosition.copy(camera.position));
			reflectedPosition.x *= -1.0;
			reflectedPosition.z *= -1.0;
			rightPortal.localToWorld(reflectedPosition);
			portalCamera.position.copy(reflectedPosition);

			// grab the corners of the other portal
			// - note: the portal is viewed backwards; flip the left/right coordinates
			rightPortal.localToWorld(bottomLeftCorner.set(50.05, -50.05, 0.0));
			rightPortal.localToWorld(bottomRightCorner.set(-50.05, -50.05, 0.0));
			rightPortal.localToWorld(topLeftCorner.set(50.05, 50.05, 0.0));

			CameraUtils.frameCorners(
				portalCamera,
				bottomLeftCorner,
				bottomRightCorner,
				topLeftCorner,
				false
			);

			leftPortalTexture.texture.colorSpace = renderer.outputColorSpace;
			renderer.setRenderTarget(leftPortalTexture);
			renderer.state.buffers.depth.setMask(true);
			if (renderer.autoClear === false) renderer.clear();
			leftPortal.visible = false;
			renderer.render(portalScene, portalCamera);
			leftPortal.visible = true;
		}

		const target = {
			angle: 0,
		};

		// Pane
		const pane = new Pane({
			title: 'debug params',
		});
		pane.element.style.display = location.hash === '#debug' ? 'block' : 'none';

		pane
			.addBinding(target, 'angle', {
				min: 0,
				max: Math.PI * 2,
				step: 0.1,
			})
			.on('change', (val) => {
				const x = Math.cos(val.value) * 20;
				const z = Math.sin(val.value) * 20;

				smallSphereOne.position.x = x;
				smallSphereOne.position.z = z;
			});

		pane
			.addButton({
				label: 'docs',
				title: 'Docs',
			})
			.on('click', () => navigate('/docs/rendertarget'));

		controler.addEventListener('change', () => {});

		function render(time: number = 0) {
			controler.update(time);

			renderPortal();

			renderer.setRenderTarget(null);

			renderer.render(scene, camera);

			requestAnimationFrame(render);
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
