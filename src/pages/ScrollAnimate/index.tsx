import { useMantineTheme } from '@mantine/core';
import { Easing, Tween } from '@tweenjs/tween.js';
import { useEffect } from 'react';
import {
	AmbientLight,
	AxesHelper,
	BufferAttribute,
	BufferGeometry,
	ConeGeometry,
	DirectionalLight,
	Group,
	Mesh,
	MeshToonMaterial,
	NearestFilter,
	PerspectiveCamera,
	Points,
	PointsMaterial,
	Scene,
	TextureLoader,
	TorusGeometry,
	TorusKnotGeometry,
	WebGLRenderer,
} from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Pane } from 'tweakpane';
import classes from './style.module.css';

export default function ScrollAnimate() {
	const theme = useMantineTheme();

	async function initialScene() {
		const el = document.querySelector('#container') as HTMLDivElement;

		/**
		 * Basic
		 */

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setClearColor(theme.colors.dark[9]);
		renderer.setClearAlpha(0);
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.domElement.className = classes['webgl'];
		el.append(renderer.domElement);

		const scene = new Scene();

		const camera = new PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		camera.position.set(0, 0, 3);

		const cameraGroup = new Group();
		cameraGroup.add(camera);
		scene.add(cameraGroup);

		const stats = new Stats();
		el.append(stats.dom);

		/**
		 * Loader
		 */

		const textureLoader = new TextureLoader();
		textureLoader.setPath('/src/pages/ScrollAnimate/assets/');

		/**
		 * Texture
		 */

		const gradientTexture = await textureLoader.loadAsync('3.jpg');
		gradientTexture.minFilter = NearestFilter;
		gradientTexture.magFilter = NearestFilter;

		/**
		 * Scene
		 */

		const material = new MeshToonMaterial({
			color: '#ffeded',
			wireframe: false,
			gradientMap: gradientTexture,
		});

		const distance = 4;

		const torusGeometry = new TorusGeometry(1, 0.4, 16, 60, Math.PI * 2);
		const torus = new Mesh(torusGeometry, material);
		torus.receiveShadow = true;
		torus.castShadow = true;
		torus.position.x = 2;
		torus.position.y = -distance * 0;
		scene.add(torus);

		const coneGeometry = new ConeGeometry(1, 2, 32);
		const cone = new Mesh(coneGeometry, material);
		cone.receiveShadow = true;
		cone.castShadow = true;
		cone.position.x = -2;
		cone.position.y = -distance * 1;
		scene.add(cone);

		const torusKnotGeometry = new TorusKnotGeometry(0.8, 0.35, 100, 16);
		const torusKnot = new Mesh(torusKnotGeometry, material);
		torusKnot.receiveShadow = true;
		torusKnot.castShadow = true;
		torusKnot.position.x = 2;
		torusKnot.position.y = -distance * 2;
		scene.add(torusKnot);

		const sectionMeshs = [torus, cone, torusKnot];

		const PARTICLE_COUNT = 500;

		const particlesGeometry = new BufferGeometry();
		const position = new Float32Array(PARTICLE_COUNT * 3);
		const attrPosition = new BufferAttribute(position, 3);
		for (let i = 0; i < PARTICLE_COUNT; i++) {
			const i3 = i * 3;

			position[i3 + 0] = (Math.random() - 0.5) * 10;
			position[i3 + 1] = distance * 0.5 - Math.random() * distance * sectionMeshs.length;
			position[i3 + 2] = (Math.random() - 0.5) * 10;
		}
		particlesGeometry.setAttribute('position', attrPosition);

		const particlesMaterial = new PointsMaterial({
			sizeAttenuation: true,
			size: 0.03,
			color: '#ffeded',
		});

		const particles = new Points(particlesGeometry, particlesMaterial);
		scene.add(particles);

		/**
		 * Light
		 */

		const ambientLight = new AmbientLight();
		ambientLight.intensity = 0;
		scene.add(ambientLight);

		const directionalLight = new DirectionalLight('#ffffff');
		directionalLight.intensity = 3;
		directionalLight.position.set(1, 1, 0);
		scene.add(directionalLight);

		/**
		 * Helpers
		 */

		const axexHelper = new AxesHelper();
		scene.add(axexHelper);

		/**
		 * Pane
		 */

		const pane = new Pane({ title: 'Debug Params' });
		pane.addBinding(material, 'color', {
			color: { type: 'float' },
		});
		// Camera
		const cameraPane = pane.addFolder({ title: 'Camera' });
		cameraPane
			.addBinding(camera, 'fov')
			.on('change', () => camera.updateProjectionMatrix());
		// Ambient Light
		const ambientLightPane = pane.addFolder({ title: 'Ambient Light' });
		ambientLightPane.addBinding(ambientLight, 'intensity', {
			step: 0.01,
			min: 0,
			max: 10,
		});
		// Directional Light
		const directionalLightPane = pane.addFolder({ title: 'Directional Light' });
		directionalLightPane.addBinding(directionalLight, 'intensity', {
			step: 0.01,
			min: 0,
			max: 10,
		});
		directionalLightPane.addBinding(directionalLight, 'color', {
			color: { type: 'float' },
		});

		/**
		 * Events
		 */

		const cursor = {
			x: 0,
			y: 0,
		};

		let previousTime = 0;

		const rotations = {
			x: 0,
			y: 0,
			z: 0,
		};

		const tween = new Tween(rotations)
			.to({
				x: (rotations.x += 6),
				y: (rotations.y += 3),
				z: (rotations.z += 1.5),
			})
			.duration(2000)
			.easing(Easing.Quadratic.InOut)
			.onUpdate(console.log)
			.onComplete(() => console.log(rotations));

		function render(time: number = 0) {
			requestAnimationFrame(render);

			const deltaTime = time - previousTime;
			previousTime = time;

			for (const mesh of sectionMeshs) {
				mesh.rotation.x += deltaTime * 0.0001;
				mesh.rotation.y += deltaTime * 0.00012;
			}

			// ?
			cameraGroup.position.x += (-cursor.x - cameraGroup.position.x) * 0.002 * deltaTime;
			cameraGroup.position.y += (cursor.y - cameraGroup.position.y) * 0.002 * deltaTime;

			tween.update(time);
			stats.update();
			renderer.render(scene, camera);
		}
		render();

		function resize() {
			renderer.setSize(window.innerWidth, window.innerHeight);
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		}
		window.addEventListener('resize', resize);

		function scroll(e: Event) {
			if (e.target instanceof HTMLDivElement) {
				const scrollY = e.target.scrollTop;

				const nextSection = Math.round(scrollY / window.innerHeight);

				if (nextSection === 1 && !tween.isPlaying()) {
					tween.start();
				} else {
					tween.stop();
				}

				camera.position.y = -(scrollY / window.innerHeight) * distance;
				camera.updateProjectionMatrix();
			}
		}
		el.addEventListener('scroll', scroll);

		function move(e: MouseEvent) {
			const x = window.innerWidth / 2 - e.clientX;
			const y = window.innerHeight / 2 - e.clientY;

			cursor.x = x / window.innerWidth;
			cursor.y = y / window.innerHeight;
		}
		el.addEventListener('mousemove', move);
	}

	useEffect(() => {
		initialScene();
	}, []);

	return (
		<div id='container' className={classes['container']}>
			<section className={classes['section']}>
				<h1>MY PORTFOLIO</h1>
				<h1>MY PROJECTS</h1>
				<h1>CONTACT ME</h1>
			</section>
		</div>
	);
}
