import { useMantineTheme } from '@mantine/core';
import { useEffect } from 'react';
import {
	BoxGeometry,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	WebGLRenderer,
	WebGLRenderTarget,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

export default function WebGLRenderTargetDemo() {
	const theme = useMantineTheme();

	useEffect(() => {
		const el = document.querySelector('#container') as HTMLDivElement;
		el.innerHTML = '';

		const { innerWidth, innerHeight } = window;

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});

		renderer.setSize(innerWidth, innerHeight);
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
		controler.enablePan = true;
		controler.enableDamping = true;
		controler.dampingFactor = 0.5;

		const portalScene = new Scene();

		const portalCamera = new PerspectiveCamera(75, 512 / 512, 0.1, 1000);
		portalCamera.position.set(0, 0, 0.5);
		portalCamera.lookAt(portalScene.position);

		const mesh__ = new Mesh(
			new BoxGeometry(0.2, 0.2, 0.2, 4, 4),
			new MeshBasicMaterial({ color: theme.colors.blue[5] })
		);
		portalScene.add(mesh__);

		const renderTarget = new WebGLRenderTarget(512, 512);

		const material = new MeshBasicMaterial({
			map: renderTarget.texture,
		});
		const geometry = new PlaneGeometry(2, 2);
		const mesh = new Mesh(geometry, material);
		scene.add(mesh);

		controler.addEventListener('change', () => {
			portalCamera.rotation.x = camera.rotation.x;
			portalCamera.rotation.y = camera.rotation.y;
			portalCamera.rotation.z = camera.rotation.z;
		});

		function render(time?: number) {
			controler.update(time);

			// rendered pixel wont render to canvas, store into this target
			renderer.setRenderTarget(renderTarget);
			renderer.render(portalScene, portalCamera);
			renderer.setRenderTarget(null);

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
