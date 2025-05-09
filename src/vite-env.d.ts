/// <reference types="vite/client" />

declare module 'color-normalize' {
	const content: (...args: any) => any;
	export default content;
}

declare module '*.gltf' {
	const content: string;
	export default content;
}

export declare global {
	namespace JSX {
		interface IntrinsicElements {
			roundedPlaneGeometry: any;
		}
	}
}
