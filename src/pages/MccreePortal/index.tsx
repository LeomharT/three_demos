import { useMantineTheme } from '@mantine/core';
import colorNormalize from 'color-normalize';
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import {
	AxesHelper,
	Color,
	Mesh,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	ShaderMaterial,
	Vector4,
	WebGLRenderer,
} from 'three';
import {
	DRACOLoader,
	GLTFLoader,
	OrbitControls,
} from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import MccreeModel from './assets/low_poly_mccree/scene.gltf?url';
import fragmentShader from './shader/fragment.glsl?raw';
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
		renderer.setClearAlpha(0);
		renderer.setSize(innerWidth, innerHeight);
		el.append(renderer.domElement);

		const scene = new Scene();
		scene.background = new Color(theme.colors.gray[0]);

		const camera = new PerspectiveCamera(
			75,
			innerWidth / innerHeight,
			0.1,
			1000
		);
		camera.position.set(0, 0, 2);
		camera.lookAt(scene.position);

		const controler = new OrbitControls(camera, renderer.domElement);
		controler.enableDamping = true;
		controler.dampingFactor = 0.05;
		controler.enablePan = false;
		controler.panSpeed = 1;
		controler.enabled = true;

		const axesHelper = new AxesHelper();
		scene.add(axesHelper);

		// Models
		const planeGeometry = new PlaneGeometry(WIDTH + 0.05, GOLDENRATIO + 0.05);
		const palne1Material = new ShaderMaterial({
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
		const plane = new Mesh(planeGeometry, palne1Material);
		scene.add(plane);

		const planeClone = plane.clone();
		planeClone.material;
		scene.add(planeClone);

		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath('node_modules/three/examples/jsm/libs/draco/');
		dracoLoader.setDecoderConfig({ type: 'js' });
		dracoLoader.preload();

		const gltfLoader = new GLTFLoader();
		gltfLoader.dracoLoader = dracoLoader;

		gltfLoader.load(MccreeModel, (data) => {
			// scene.add(data.scene);
		});

		// Pane
		const pane = new Pane();
		pane.element.style.visibility =
			location.hash === '#debug' ? 'visialbe' : 'hidden';
		pane
			.addButton({
				label: 'Docs',
				title: 'Docs',
			})
			.on('click', () => {
				window.location.href = '/docs/mccree';
			});

		function render(time?: number) {
			controler.update(time);

			renderer.render(scene, camera);
			requestAnimationFrame(render);
		}
		render();
	}, []);

	return <div id='container'></div>;
}
