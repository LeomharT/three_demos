import { useEffect } from 'react';
import {
	ACESFilmicToneMapping,
	AdditiveBlending,
	BufferAttribute,
	CanvasTexture,
	ClampToEdgeWrapping,
	Color,
	DoubleSide,
	Mesh,
	MeshBasicMaterial,
	NearestFilter,
	PerspectiveCamera,
	PlaneGeometry,
	Points,
	Raycaster,
	Scene,
	ShaderMaterial,
	TextureLoader,
	Uniform,
	UVMapping,
	Vector2,
	WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';
import fragmentShader from './shader/fragment.glsl?raw';
import vertexShader from './shader/vertex.glsl?raw';

export default function ParticleCursor() {
	async function loadImage(src: string): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			const image = new Image();
			image.src = src;

			image.onload = () => resolve(image);
			image.onerror = (error) => reject(error);
		});
	}

	async function initialScene() {
		const el = document.querySelector('#container') as HTMLDivElement;
		const pixelRatio = Math.min(2, window.devicePixelRatio);

		/**
		 * Basic
		 */

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(pixelRatio);
		renderer.toneMapping = ACESFilmicToneMapping;
		el.append(renderer.domElement);

		const scene = new Scene();
		scene.background = new Color(0x181818);

		const camera = new PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		camera.position.set(0, 0, 10);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		/**
		 * Loaders
		 */

		const textureLoader = new TextureLoader();
		textureLoader.setPath('/src/assets/texture/picture/');

		/**
		 * Textures
		 */

		const particleTexture1 = textureLoader.load('picture-1.png');
		const particleTexture2 = textureLoader.load('picture-2.png');
		const particleTexture3 = textureLoader.load('picture-3.png');
		const particleTexture4 = textureLoader.load('picture-4.png');

		const texutres = [
			particleTexture1,
			particleTexture2,
			particleTexture3,
			particleTexture4,
		];

		/**
		 * Raycaster
		 */

		const raycaster = new Raycaster();

		// Coordinates
		const pointer = new Vector2(999, 999);
		const canvasCursor = new Vector2(999, 999);
		const canvasCursorPrevious = new Vector2(999, 999);

		/**
		 * 2D Canvas
		 */
		const canvas = document.createElement('canvas');
		canvas.width = canvas.height = 128;
		canvas.style.width = canvas.style.height = '256px';
		canvas.style.position = 'fixed';
		canvas.style.left = '0';
		canvas.style.top = '0';
		canvas.style.zIndex = '10';
		el.append(canvas);

		// Canvas 2D Contex
		const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

		// Load Image
		const image = await loadImage('/src/assets/texture/glow.png');

		// Canvas Texture
		const canvasTexture = new CanvasTexture(
			canvas,
			UVMapping,
			ClampToEdgeWrapping,
			ClampToEdgeWrapping,
			NearestFilter,
			NearestFilter
		);

		/**
		 * Scene
		 */

		const params = {
			picture: 0,
		};

		const uniforms = {
			uPointSize: new Uniform(0.05),
			uResolution: new Uniform(
				new Vector2(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio)
			),
			uTexture: new Uniform(particleTexture1),
			uCanvasTexture: new Uniform(canvasTexture),
			uIntensityRemapEdge: new Uniform(0.3),
		};

		// Particles
		const particleGeometry = new PlaneGeometry(10, 10, 128, 128);
		particleGeometry.setIndex(null);

		// Intensity Attribute
		const intensityArray = new Float32Array(particleGeometry.attributes.position.count);
		const intensityAttr = new BufferAttribute(intensityArray, 1);

		// Angle Attribute
		const angleArray = new Float32Array(particleGeometry.attributes.position.count);
		const angleAttr = new BufferAttribute(angleArray, 1);

		for (let i = 0; i < particleGeometry.attributes.position.count; i++) {
			intensityArray[i] = Math.random();
			angleArray[i] = Math.random() * Math.PI * 2;
		}

		particleGeometry.setAttribute('aIntensity', intensityAttr);
		particleGeometry.setAttribute('aAngle', angleAttr);

		const particleMaterial = new ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms,
			transparent: true,
			blending: AdditiveBlending,
		});
		const particles = new Points(particleGeometry, particleMaterial);
		scene.add(particles);

		// Interactive
		const planeGeometry = new PlaneGeometry(10, 10, 1, 1);
		const planeMaterial = new MeshBasicMaterial({
			color: 'purple',
			wireframe: true,
			side: DoubleSide,
		});
		const plane = new Mesh(planeGeometry, planeMaterial);
		plane.visible = false;
		scene.add(plane);

		/**
		 * Pane
		 */

		const pane = new Pane({ title: '🚧 Debug Params 🚧' });
		pane.element.parentElement!.style.width = '380px';
		{
			const pointPane = pane.addFolder({ title: '💠 Point' });
			pointPane.addBinding(uniforms.uPointSize, 'value', {
				label: 'Point Size',
				min: 0,
				max: 1,
				step: 0.001,
			});
			pointPane.addBinding(plane, 'visible', {
				label: 'Interactive Plane Visible',
			});
			pointPane.addBinding(uniforms.uIntensityRemapEdge, 'value', {
				min: 0,
				max: 1,
				step: 0.001,
			});
			pointPane
				.addBinding(params, 'picture', {
					label: 'Dot Image',
					options: [
						{ value: 0, text: 'Texture 1' },
						{ value: 1, text: 'Texture 2' },
						{ value: 2, text: 'Texture 3' },
						{ value: 3, text: 'Texture 4' },
					],
				})
				.on('change', (val) => {
					uniforms.uTexture.value = texutres[val.value];
				});
		}

		/**
		 * Events
		 */

		function render(time: number = 0) {
			requestAnimationFrame(render);

			// Update
			controls.update(time);

			// Fadeout
			ctx.save();
			ctx.globalAlpha = 0.02;
			ctx.globalCompositeOperation = 'source-over';
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.restore();

			// Speed Alpha
			const cursorDistance = canvasCursorPrevious.distanceTo(canvasCursor);
			canvasCursorPrevious.copy(canvasCursor);
			const alpha = Math.min(1, cursorDistance * 0.1);

			// Interactive
			const glowSize = canvas.width * 0.25;
			// Blending for 2D Canvas
			ctx.save();
			ctx.globalAlpha = alpha;
			ctx.globalCompositeOperation = 'lighten';
			ctx.drawImage(
				image,
				canvasCursor.x - glowSize / 2,
				canvasCursor.y - glowSize / 2,
				glowSize,
				glowSize
			);
			ctx.restore();

			// Texture Update
			canvasTexture.needsUpdate = true;

			// Render
			renderer.render(scene, camera);
		}
		render();

		function resize() {
			renderer.setSize(window.innerWidth, window.innerHeight);

			uniforms.uResolution.value.set(
				window.innerWidth * pixelRatio,
				window.innerHeight * pixelRatio
			);

			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		}
		window.addEventListener('resize', resize);

		function onPointerMove(e: PointerEvent) {
			pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
			pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

			raycaster.setFromCamera(pointer, camera);

			const intersect = raycaster.intersectObject(plane);

			if (intersect.length) {
				const uv = intersect[0].uv;

				if (!uv) return;

				canvasCursor.x = uv.x * canvas.width;
				canvasCursor.y = (1 - uv.y) * canvas.height;
			}
		}
		window.addEventListener('pointermove', onPointerMove);
	}

	useEffect(() => {
		initialScene();
	}, []);

	return <div id='container'></div>;
}
