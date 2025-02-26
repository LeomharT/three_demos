import gsap from 'gsap';
import { useEffect } from 'react';
import {
	AdditiveBlending,
	AxesHelper,
	BufferAttribute,
	BufferGeometry,
	Color,
	PerspectiveCamera,
	Points,
	Scene,
	ShaderMaterial,
	Spherical,
	Texture,
	TextureLoader,
	Uniform,
	Vector2,
	Vector3,
	WebGLRenderer,
} from 'three';
import { OrbitControls, Sky } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import fragmentShader from './shader/fragment.glsl?raw';
import vertexShader from './shader/vertex.glsl?raw';

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
		textureLoader.setPath('/src/assets/texture/particles/');

		/**
		 * Texture
		 */
		const fireworksTexture = new Array(13).fill(0).map((_, index) => {
			return textureLoader.load(`${++index}.png`);
		});

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

		const resolution = new Vector2(
			window.innerWidth * window.devicePixelRatio,
			window.innerHeight * window.devicePixelRatio
		);

		// Fireworks
		function generateFireworks(
			_count: number,
			_position: Vector3,
			_size: number,
			_texture: Texture,
			_radius: number,
			_color: Color
		) {
			_texture.flipY = false;

			const positions = new Float32Array(_count * 3);
			const attrPosition = new BufferAttribute(positions, 3);

			const sizes = new Float32Array(_count);
			const attrSizes = new BufferAttribute(sizes, 1);

			const timeMultipliers = new Float32Array(_count);
			const attrTimeMultipliers = new BufferAttribute(timeMultipliers, 3);

			for (let i = 0; i < _count; i++) {
				const i3 = i * 3;

				const spherical = new Spherical(
					_radius * (0.75 + Math.random() * 0.25),
					Math.random() * Math.PI,
					Math.random() * Math.PI * 2
				);

				const positionSpherical = new Vector3().setFromSpherical(spherical);

				positions[i3 + 0] = positionSpherical.x;
				positions[i3 + 1] = positionSpherical.y;
				positions[i3 + 2] = positionSpherical.z;

				sizes[i] = Math.random();

				timeMultipliers[i] = 1 + Math.random();
			}

			const fireworksGeometry = new BufferGeometry();
			fireworksGeometry.setAttribute('position', attrPosition);
			fireworksGeometry.setAttribute('aSize', attrSizes);
			fireworksGeometry.setAttribute('aTimeMultipliers', attrTimeMultipliers);

			const fireworksMaterial = new ShaderMaterial({
				fragmentShader,
				vertexShader,
				transparent: true,
				depthWrite: false,
				blending: AdditiveBlending,
				uniforms: {
					uSize: new Uniform(_size),
					uResolution: new Uniform(resolution),
					uTexture: new Uniform(_texture),
					uColor: new Uniform(_color),
					uProgress: new Uniform(0),
				},
			});

			const points = new Points(fireworksGeometry, fireworksMaterial);
			points.position.copy(_position);
			scene.add(points);

			const distory = () => {
				scene.remove(points);
				fireworksGeometry.dispose();
				fireworksMaterial.dispose();
			};

			// Animation
			gsap.to(fireworksMaterial.uniforms.uProgress, {
				duration: 3,
				value: 1,
				ease: 'linear',
				onComplete: distory,
			});
		}

		function createRandomFirework() {
			const count = Math.round(400 + Math.random() * 10000);
			const position = new Vector3(
				(Math.random() - 0.5) * 2,
				Math.random(),
				(Math.random() - 0.5) * 2
			);
			const size = 0.02 + Math.random() * 0.5;
			const texture =
				fireworksTexture[Math.floor(Math.random() * fireworksTexture.length)];
			const radius = Math.random() + 1.5;
			const color = new Color();
			color.setHSL(Math.random(), 1.0, 0.7);

			generateFireworks(count, position, size, texture, radius, color);
		}

		createRandomFirework();

		/**
		 * Helpers
		 */

		const axesHelper = new AxesHelper();
		scene.add(axesHelper);

		/**
		 * Pane
		 */

		const pane = new Pane({ title: 'Debug Parameters' });
		pane.element.parentElement!.style.width = '380px';
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

			resolution.set(
				window.innerWidth * window.devicePixelRatio,
				window.innerHeight * window.devicePixelRatio
			);
		}
		window.addEventListener('resize', resize);

		window.addEventListener('pointerdown', () => {
			createRandomFirework();
		});
	}

	useEffect(() => {
		initialScene();
	}, []);

	return <div id='container'></div>;
}
