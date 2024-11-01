import { Box, useMantineTheme } from '@mantine/core';
import { IconMapPinFilled } from '@tabler/icons-react';
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
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	ShadowMaterial,
	SpotLight,
	SpotLightHelper,
	TextureLoader,
	WebGLRenderer,
} from 'three';
import {
	CSS3DObject,
	CSS3DRenderer,
	GLTFLoader,
	OrbitControls,
} from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { Pane } from 'tweakpane';
import EarthModel from './assets/earth.gltf?url';
import HDRTexture from './assets/park_sunset_sky_dome_4k.png?url';

export default function HTMLMarkers() {
	const theme = useMantineTheme();

	useEffect(() => {
		const el = document.querySelector('#container') as HTMLDivElement;

		el.innerHTML = '';

		const { innerWidth, innerHeight } = window;

		const textureLoader = new TextureLoader();

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.shadowMap.enabled = true;
		renderer.setClearAlpha(0);
		renderer.setSize(innerWidth, innerHeight);
		renderer.domElement.style.position = 'relative';
		renderer.domElement.style.zIndex = '1';
		el.append(renderer.domElement);

		const scene = new Scene();
		textureLoader.load(HDRTexture, (data) => {
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
		scene.add(axesHelper);

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
		plane.receiveShadow = true;
		scene.add(plane);

		const ambientLight = new AmbientLight();
		ambientLight.intensity = 0.8;
		scene.add(ambientLight);

		const spotLight = new SpotLight(0xffffff);
		spotLight.castShadow = true;
		spotLight.intensity = 0.2;
		spotLight.angle = 1;
		spotLight.decay = 0.5;
		spotLight.position.set(0, 10, 0);
		spotLight.shadow.bias = 0.0001;
		spotLight.shadow.radius = 5;
		scene.add(spotLight);

		const spotLightHelper = new SpotLightHelper(
			spotLight,
			theme.colors.blue[5]
		);
		spotLightHelper.visible = false;
		scene.add(spotLightHelper);

		const css3DContainer = document.createElement('div');
		css3DContainer.id = 'css3DContainer';

		const css3DRoot = ReactDOM.createRoot(css3DContainer);
		css3DRoot.render(<IconMapPinFilled color={theme.colors.blue[5]} />);

		gltfLoader.load(EarthModel, (data) => {
			const lampd = data.scene.getObjectByName('URF-Height_Lampd_0')!;
			const lampdIce = data.scene.getObjectByName('URF-Height_Lampd_Ice_0')!;
			const lampdWater = data.scene.getObjectByName('URF-Height_watr_0')!;
			lampd.castShadow = true;
			lampdIce.castShadow = true;
			lampdWater.castShadow = true;

			const markers = new CSS3DObject(css3DContainer);
			markers.scale.set(0.03, 0.03, 0.03);
			markers.position.set(0, 1.5, 0);

			lampdWater.add(markers);

			if (lampdWater instanceof Mesh) {
				if (lampdWater.material instanceof MeshStandardMaterial) {
					lampdWater.material.roughness = 0;
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

			scene.add(group);
		});

		// Debuger params
		const params = {
			debugger: false,
			environmentIntensity: 0.5,
			ambientIntensity: 0.5,
		};
		const pane = new Pane({ title: 'params' });
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

		function render(time?: number) {
			requestAnimationFrame(render);
			state.update();
			controler.update(time);
			renderer.render(scene, camera);
			css3DRenderer.render(scene, camera);
		}
		render();

		function resize() {
			renderer.setSize(window.innerWidth, window.innerHeight);
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		}
		window.addEventListener('resize', resize);
	}, []);

	return <Box id='container' pos='relative'></Box>;
}
