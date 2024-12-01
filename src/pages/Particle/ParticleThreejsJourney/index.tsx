import { useEffect } from 'react';
import { WebGLRenderer } from 'three';

export default function ParticleThreejsJourney() {
	useEffect(() => {
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
	}, []);

	return <div id='container'>ParticleThreejsJourney</div>;
}
