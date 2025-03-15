import { PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

export default function Test() {
	function initialScene() {
		const el = document.querySelector('#container') as HTMLDivElement;

		const sizes = {
			width: window.innerWidth,
			height: window.innerHeight,
			pixelRatio: Math.min(2, window.devicePixelRatio),
		};

		/**
		 * Basic
		 */

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		renderer.setSize(sizes.width, sizes.height);
		renderer.setPixelRatio(sizes.pixelRatio);

		const scene = new Scene();

		const camera = new PerspectiveCamera();
		camera.position.set(3, 3, 3);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		/**
		 * Events
		 */

		function render() {
			requestAnimationFrame(render);

			renderer.render(scene, camera);
		}
	}
	return <div id='container'></div>;
}
