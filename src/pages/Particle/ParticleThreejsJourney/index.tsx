import { useMantineTheme } from '@mantine/core';
import { useEffect } from 'react';
import {
	AdditiveBlending,
	AxesHelper,
	BoxGeometry,
	BufferAttribute,
	BufferGeometry,
	CustomBlending,
	LinearFilter,
	Mesh,
	MeshBasicMaterial,
	MultiplyBlending,
	NoBlending,
	NormalBlending,
	PerspectiveCamera,
	Points,
	PointsMaterial,
	Scene,
	SubtractiveBlending,
	TextureLoader,
	WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Pane } from 'tweakpane';
import ParticleURL from './assets/particles/3.png?url';
export default function ParticleThreejsJourney() {
	const theme = useMantineTheme();

	const initialScene = async () => {
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
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setClearColor(theme.colors.dark[8]);
		el.append(renderer.domElement);

		const scene = new Scene();

		const camera = new PerspectiveCamera(
			75,
			innerWidth / innerHeight,
			0.1,
			1000
		);
		camera.position.set(0, 0, 3);
		camera.lookAt(scene.position);

		const controler = new OrbitControls(camera, renderer.domElement);
		controler.enableDamping = true;
		controler.dampingFactor = 0.05;
		controler.enablePan = true;

		const stats = new Stats();
		el.append(stats.dom);

		/**
		 * Loaders
		 */

		const textureLoader = new TextureLoader();

		/**
		 * Scenes
		 */

		const PARTICLE_COUNT = 200000;

		const particleVertices = new Float32Array(PARTICLE_COUNT * 3);
		const particleColors = new Float32Array(PARTICLE_COUNT * 3);

		for (let i = 0; i < particleVertices.length; i++) {
			particleVertices[i] = (Math.random() - 0.5) * 100;
			particleColors[i] = Math.random();
		}

		const attrPosition = new BufferAttribute(particleVertices, 3);
		const attrColors = new BufferAttribute(particleColors, 3);

		const particleGeometry = new BufferGeometry();
		particleGeometry.setAttribute('position', attrPosition);
		particleGeometry.setAttribute('color', attrColors);

		const particleTexture = await textureLoader.loadAsync(ParticleURL);
		particleTexture.minFilter = LinearFilter;
		particleTexture.magFilter = LinearFilter;

		const particleMaterial = new PointsMaterial({
			// color: theme.colors.yellow[2],
			size: 0.5,
			sizeAttenuation: true,
			transparent: true,
			alphaMap: particleTexture,
			// alphaTest: 0.001,
			depthTest: false,
			depthWrite: false,
			blending: AdditiveBlending,
			vertexColors: true,
		});
		const particles = new Points(particleGeometry, particleMaterial);
		scene.add(particles);

		const boxGeometry = new BoxGeometry(1, 1, 1, 4, 4, 4);
		const boxMaterial = new MeshBasicMaterial({ color: theme.colors.grape[4] });
		const box = new Mesh(boxGeometry, boxMaterial);
		scene.add(box);

		/**
		 * Helpers
		 */

		const axesHelper = new AxesHelper();
		axesHelper.scale.setScalar(1);
		scene.add(axesHelper);

		/**
		 * Pane
		 */

		const pane = new Pane({ title: 'Debug Params' });
		pane.addBinding(particleMaterial, 'color', {
			color: {
				type: 'float',
			},
		});
		pane.addBinding(particleMaterial, 'alphaTest', {
			min: 0,
			max: 1,
			step: 0.01,
		});
		pane.addBinding(particleMaterial, 'depthTest');
		pane.addBinding(particleMaterial, 'depthWrite');
		pane.addBinding(particleMaterial, 'blending', {
			options: [
				{ text: 'NoBlending', value: NoBlending },
				{ text: 'CustomBlending', value: CustomBlending },
				{ text: 'NormalBlending', value: NormalBlending },
				{ text: 'AdditiveBlending', value: AdditiveBlending },
				{ text: 'MultiplyBlending', value: MultiplyBlending },
				{ text: 'SubtractiveBlending', value: SubtractiveBlending },
			],
		});

		/**
		 * Events
		 */

		function render(time: number = 0) {
			requestAnimationFrame(render);

			stats.update();
			controler.update(time);
			renderer.render(scene, camera);

			const clock = time * 0.001;

			for (let i = 0; i < attrPosition.count; i++) {
				// X
				const i3 = i * 3;

				const x = particles.geometry.getAttribute('position').array[i3];

				attrPosition.array[i3 + 1] = Math.cos(clock + x / 5.0) * 5.0;
			}
			attrPosition.needsUpdate = true;
		}
		render();

		function resize() {
			renderer.setSize(window.innerWidth, window.innerHeight);
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		}
		window.addEventListener('resize', resize);
	};

	useEffect(() => {
		initialScene();
	}, []);

	return <div id='container'></div>;
}
