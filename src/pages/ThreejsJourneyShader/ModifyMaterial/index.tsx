import { useEffect } from 'react';
import {
	ACESFilmicToneMapping,
	AxesHelper,
	CubeReflectionMapping,
	CubeTextureLoader,
	DirectionalLight,
	Mesh,
	MeshDepthMaterial,
	MeshStandardMaterial,
	PCFSoftShadowMap,
	PerspectiveCamera,
	PlaneGeometry,
	RGBADepthPacking,
	Scene,
	SRGBColorSpace,
	TextureLoader,
	WebGLRenderer,
} from 'three';
import { GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons.js';
import { Pane } from 'tweakpane';

export default function ModifyMaterial() {
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
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = PCFSoftShadowMap;
		renderer.toneMapping = ACESFilmicToneMapping;
		renderer.toneMappingExposure = 1;
		el.append(renderer.domElement);

		const scene = new Scene();

		const camera = new PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		camera.position.set(4, 1, -4);
		camera.lookAt(scene.position);

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;

		/**
		 * Loaders
		 */

		const gltfLoader = new GLTFLoader();
		gltfLoader.setPath('/src/assets/models/');

		const cubeTextureLoader = new CubeTextureLoader();
		cubeTextureLoader.setPath('/src/assets/texture/env/5/');

		const textureLoader = new TextureLoader();
		textureLoader.setPath('/src/assets/models/LeePerrySmith/');

		/**
		 * Textures
		 */

		cubeTextureLoader.load(
			['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg'],
			(data) => {
				data.mapping = CubeReflectionMapping;

				scene.environment = data;
				scene.background = data;
			}
		);

		const leePerrySmithColorTexture = await textureLoader.loadAsync('Map-COL.jpg');
		leePerrySmithColorTexture.colorSpace = SRGBColorSpace;
		const leePerrySmithNormalTexture = await textureLoader.loadAsync(
			'Infinite-Level_02_Tangent_SmoothUV.jpg'
		);

		/**
		 * Scene
		 */

		function updateAllMaterial() {
			scene.traverse((child) => {
				if (child instanceof Mesh && child.material instanceof MeshStandardMaterial) {
					child.material.envMapIntensity = 1;
					child.material.needsUpdate = true;
					child.castShadow = true;
					child.receiveShadow = true;
				}
			});
		}

		const planeGeometry = new PlaneGeometry(15, 15, 16, 16);
		const planeMaterial = new MeshStandardMaterial({});
		const plane = new Mesh(planeGeometry, planeMaterial);
		plane.receiveShadow = true;
		plane.rotation.y = Math.PI;
		plane.position.z = 5;
		scene.add(plane);

		/**
		 * To fix drop shadow
		 */
		const customDepthMaterial = new MeshDepthMaterial({
			depthPacking: RGBADepthPacking,
		});

		const uniforms = {
			uTime: { value: 0 },
		};

		gltfLoader.load('LeePerrySmith/LeePerrySmith.glb', (gltf) => {
			const material = new MeshStandardMaterial({
				map: leePerrySmithColorTexture,
				normalMap: leePerrySmithNormalTexture,
			});
			material.onBeforeCompile = (shader) => {
				shader.uniforms = {
					...shader.uniforms,
					...uniforms,
				};

				shader.vertexShader = shader.vertexShader.replace(
					'#include <common>',
					`
                        #include <common>

                        uniform float uTime;
                        
                        mat2 get2dRotateMatrix(float _angle)
                        {
                            return mat2(cos(_angle), - sin(_angle), sin(_angle), cos(_angle));
                        }
                    `
				);

				shader.vertexShader = shader.vertexShader.replace(
					'#include <begin_vertex>',
					`
                        #include <begin_vertex>

                        float angle = (transformed.y + uTime) * 0.9;

                        mat2 rotateMatrix = get2dRotateMatrix(angle);

                        transformed.xz = rotateMatrix * transformed.xz; 
                    `
				);
			};
			customDepthMaterial.onBeforeCompile = (shader) => {
				shader.uniforms = {
					...shader.uniforms,
					...uniforms,
				};

				shader.vertexShader = shader.vertexShader.replace(
					'#include <common>',
					`
                        #include <common>

                        uniform float uTime;
                        
                        mat2 get2dRotateMatrix(float _angle)
                        {
                            return mat2(cos(_angle), - sin(_angle), sin(_angle), cos(_angle));
                        }
                    `
				);

				shader.vertexShader = shader.vertexShader.replace(
					'#include <begin_vertex>',
					`
                        #include <begin_vertex>

                        float angle = (transformed.y + uTime) * 0.9;

                        mat2 rotateMatrix = get2dRotateMatrix(angle);

                        transformed.xz = rotateMatrix * transformed.xz; 
                    `
				);
			};

			const mesh = gltf.scene.children[0] as Mesh;
			mesh.rotation.y = Math.PI * 0.5;
			mesh.material = material;
			mesh.customDepthMaterial = customDepthMaterial;

			scene.add(mesh);

			updateAllMaterial();
		});

		/**
		 * Lights
		 */

		const directionalLight = new DirectionalLight('#ffffff', 3);
		directionalLight.castShadow = true;
		directionalLight.shadow.mapSize.set(1024, 1024);
		directionalLight.shadow.camera.far = 15;
		directionalLight.shadow.normalBias = 0.05;
		directionalLight.position.set(0.25, 2, -2.25);
		scene.add(directionalLight);

		/**
		 * Helpers
		 */

		const axesHelper = new AxesHelper();
		scene.add(axesHelper);

		/**
		 * Pane
		 */
		const pane = new Pane({ title: 'Debug Params' });
		{
			const rendererPane = pane.addFolder({ title: 'Renderer' });
			rendererPane.addBinding(renderer.shadowMap, 'enabled');
		}

		function render(time: number = 0) {
			requestAnimationFrame(render);

			controls.update(time);

			uniforms.uTime.value += 0.1;

			renderer.render(scene, camera);
		}
		render();

		function resize() {
			renderer.setSize(window.innerWidth, window.innerHeight);
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		}
		window.addEventListener('resize', resize);
	}

	useEffect(() => {
		initialScene();
	}, []);

	return <div></div>;
}
