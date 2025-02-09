declare module 'color-normalize' {
	const content: (...args: any) => any;
	export default content;
}
declare module 'three-bas' {
	export { PhongAnimationMaterial, PrefabBufferGeometry, ShaderChunk };
}

declare module '*.glsl' {
	const content: string;
	export default content;
}
