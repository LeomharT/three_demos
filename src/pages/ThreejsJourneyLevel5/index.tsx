import { useMantineTheme } from '@mantine/core';
import rgba from 'color-normalize';
import { useEffect } from 'react';
import {
	AxesHelper,
	FrontSide,
	Mesh,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	ShaderMaterial,
	Vector4,
	WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
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

		const stats = new Stats();
		el.append(stats.dom);

		/**
		 * Scenes
		 */

		const PARAMS = {
			color: theme.colors.blue[5],
			gravity: 0.5,
			time: 0,
		};

		const planeMaterial = new PlaneGeometry(1, 1, 16, 16);
		planeMaterial.rotateX(-Math.PI / 2);

		const shaderMaterial = new ShaderMaterial({
			vertexShader,
			fragmentShader,
			transparent: true,
			wireframe: false,
			side: FrontSide,
			uniforms: {
				u_color: { value: new Vector4(...rgba(PARAMS.color)) },
				u_gravity: { value: PARAMS.gravity },
				u_time: { value: PARAMS.time },
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
		pane
			.addBinding(PARAMS, 'gravity', {
				min: 0,
				max: 10,
				step: 0.1,
			})
			.on('change', (e) => {
				shaderMaterial.uniforms.u_gravity.value = e.value;
			});
		pane.addBinding(shaderMaterial, 'wireframe');

		function render(time: number = 0) {
			requestAnimationFrame(render);

			stats.update();
			controler.update(time);
			renderer.render(scene, camera);

			shaderMaterial.uniforms.u_time.value += 0.001;
		}
		render();
	};

	useEffect(() => {
		initailScene();
	}, []);

	return <div id='container'></div>;
}
