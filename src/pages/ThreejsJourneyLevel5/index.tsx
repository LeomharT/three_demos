import { useMantineTheme } from '@mantine/core';
import rgba from 'color-normalize';
import { useEffect } from 'react';
import {
	AxesHelper,
	Mesh,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	ShaderMaterial,
	Vector4,
	WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import fragmentShader from './shader/fragment.glsl?raw';
import vertexShader from './shader/vertex.glsl?raw';

export default function ThreejsJourneyLevel5() {
	const theme = useMantineTheme();

	const initailScene = async () => {
		const { innerWidth, innerHeight } = window;

		const el = document.querySelector('#container') as HTMLDivElement;
		el.innerHTML = '';

		/**
		 * Basic
		 */

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.setSize(innerWidth, innerHeight);
		renderer.setClearColor(theme.colors.gray[1]);
		renderer.setPixelRatio(window.devicePixelRatio);
		el.append(renderer.domElement);

		const scene = new Scene();

		const camera = new PerspectiveCamera(
			75,
			innerWidth / innerHeight,
			0.1,
			1000
		);
		camera.position.set(1, 1, 1);
		camera.lookAt(scene.position);

		const controler = new OrbitControls(camera, renderer.domElement);
		controler.enableDamping = true;
		controler.dampingFactor = 0.05;

		/**
		 * Scenes
		 */

		const PARAMS = {
			color: theme.colors.blue[5],
		};

		const planeMaterial = new PlaneGeometry(1, 1, 16, 16);
		planeMaterial.rotateX(-Math.PI / 2);

		const shaderMaterial = new ShaderMaterial({
			vertexShader,
			fragmentShader,
			transparent: true,
			wireframe: true,
			uniforms: {
				u_color: { value: new Vector4(...rgba(PARAMS.color)) },
			},
		});
		shaderMaterial.uniformsNeedUpdate = true;

		const planeMesh = new Mesh(planeMaterial, shaderMaterial);
		scene.add(planeMesh);

		/**
		 * Helpers
		 */

		const axesHelper = new AxesHelper(1);
		scene.add(axesHelper);

		/**
		 * Pane
		 */

		const pane = new Pane({ title: 'Debug Params' });
		pane.addBinding(PARAMS, 'color').on('change', (e) => {
			shaderMaterial.uniforms.u_color.value = new Vector4(...rgba(e.value));
		});

		function render(time: number = 0) {
			requestAnimationFrame(render);

			controler.update(time);
			renderer.render(scene, camera);
		}
		render();
	};

	useEffect(() => {
		initailScene();
	}, []);

	return <div id='container'></div>;
}
