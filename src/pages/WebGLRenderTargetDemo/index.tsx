import { useMantineTheme } from '@mantine/core';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
	ACESFilmicToneMapping,
	AxesHelper,
	Color,
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
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';

export default function WebGLRenderTargetDemo() {
	const theme = useMantineTheme();

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

		const portalScene = new Scene();
		portalScene.background = new Color(1, 0, 0);
		const portalCamera = new PerspectiveCamera(45, 1.0, 0.1, 500.0);
		scene.add(portalCamera);

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
		rightPortal.position.x = 30;
		rightPortal.position.y = 20;
		rightPortal.scale.set(0.35, 0.35, 0.35);
		scene.add(rightPortal);

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

		// Pane
		const pane = new Pane({
			title: 'debug params',
		});
		pane.element.style.display = location.hash === '#debug' ? 'block' : 'none';
		pane
			.addButton({
				label: 'docs',
				title: 'Docs',
			})
			.on('click', () => navigate('/docs/rendertarget'));

		controler.addEventListener('change', () => {});

		function render(time?: number) {
			controler.update(time);

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
