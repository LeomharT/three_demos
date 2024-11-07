import { useEffect } from 'react';
import { DRACOLoader, GLTFLoader } from 'three/examples/jsm/Addons.js';
import MccreeModel from './assets/low_poly_mccree/scene.gltf?url';

export default function MccreePortal() {
	useEffect(() => {
		const el = document.querySelector('#container') as HTMLDivElement;
		el.innerHTML = '';

		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath('node_modules/three/examples/jsm/libs/draco/');
		dracoLoader.setDecoderConfig({ type: 'js' });
		dracoLoader.preload();

		const gltfLoader = new GLTFLoader();
		gltfLoader.dracoLoader = dracoLoader;

		gltfLoader.load(MccreeModel, (data) => {
			console.log(data);
		});
	}, []);

	return <div id='container'>MccreePortal</div>;
}
