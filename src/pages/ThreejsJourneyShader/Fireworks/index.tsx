import { useEffect } from 'react';
import {
	AxesHelper,
	PerspectiveCamera,
	Scene,
	TextureLoader,
	Vector3,
	WebGLRenderer,
} from 'three';
import { OrbitControls, Sky } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';

export default function Fireworks() {
	async function initialScene() {
		const el = document.querySelector('#root') as HTMLDivElement;

		/**
		 * Basic
		 */

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(window.devicePixelRatio);
		el.append(renderer.domElement);

		const scene = new Scene();

		const camera = new PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		camera.position.set(2, 2, 2);
		camera.updateProjectionMatrix();

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		/**
		 * Loaders
		 */

		const textureLoader = new TextureLoader();

		/**
		 * Scenes
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

		const sunPosition = new Vector3().setFromSphericalCoords(
			effectController.radius,
			effectController.phi,
			effectController.theta
		);

		sky.material.uniforms.sunPosition.value = sunPosition;
		scene.add(sky);

		function generateFireworks() {}

		/**
		 * Helpers
		 */

		const axesHelper = new AxesHelper();
		scene.add(axesHelper);

		/**
		 * Pane
		 */

		const pane = new Pane({ title: 'Debug Parameters' });
		{
			const skyPane = pane.addFolder({ title: 'Sky' });
			skyPane
				.addBinding(effectController, 'radius', {
					label: 'Sky Radius',
					step: 0.001,
					min: 0,
					max: 5.0,
				})
				.on('change', updateSky);
			skyPane
				.addBinding(effectController, 'phi', {
					label: 'Sky Phi',
					step: 0.001,
					min: -Math.PI,
					max: Math.PI,
				})
				.on('change', updateSky);
			skyPane
				.addBinding(effectController, 'theta', {
					label: 'Sky Theta',
					step: 0.001,
					min: -Math.PI,
					max: Math.PI,
				})
				.on('change', updateSky);
		}

		/**
		 * Events
		 */

		function render(time: number = 0) {
			requestAnimationFrame(render);

			controls.update(time);

			renderer.render(scene, camera);
		}
		render();

		function resize() {
			renderer.setSize(window.innerWidth, window.innerHeight);
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		}
		window.addEventListener('resize', resize);
	}

	useEffect(() => {
		initialScene();
	}, []);

	return <div id='container'></div>;
}
