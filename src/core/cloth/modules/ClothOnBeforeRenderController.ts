import {
	Mesh,
	MeshDepthMaterial,
	// BufferGeometry,
	// BufferAttribute,
	Material,
	// MeshPhysicalMaterial,
} from 'three';
import {ClothController} from '../ClothController';
//
import COMMON_GET_UV from '../glsl/common/getUV.glsl';
//
import MAIN_VERTEX_PREFIX from '../glsl/render/main/vertexPrefix.glsl';
import MAIN_BEGINNORMAL_VERTEX from '../glsl/render/main/beginnormal_vertex.glsl';
import DEPTH_VERTEX_PREFIX from '../glsl/render/depth/vertexPrefix.glsl';
import DEPTH_BEGINNORMAL_VERTEX from '../glsl/render/depth/begin_vertex.glsl';

export class ClothOnBeforeRenderController {
	// 	let RESOLUTION:number
	// let mesh:Mesh;

	constructor(public readonly mainController: ClothController) {}

	private _initialized: boolean = false;
	init(mesh: Mesh) {
		if (this._initialized) {
			return;
		}
		// console.log('ClothOnBeforeRenderController.init');
		this._initialized = true;

		// const RESOLUTION = this.mainController.geometryInit.resolution;
		const fbo = this.mainController.fbo;
		// const geometryInit = this.mainController.geometryInit;

		// const bmp = new THREE.TextureLoader().load('./src/textures/bmpMap.png');
		// bmp.wrapS = THREE.RepeatWrapping;
		// bmp.wrapT = THREE.RepeatWrapping;
		// bmp.repeat.set(2.5, 2.5);

		// const material = new MeshPhysicalMaterial({
		// 	color: 0xffffff,
		// 	// bumpMap: bmp,
		// 	// bumpScale: 0.012,
		// 	// metalness: 0.1,
		// 	// roughness: 0.6,
		// 	// clearcoat: 0.8,
		// 	// clearcoatRoughness: 0.35,
		// 	// sheen: new THREE.Color(0.2, 0.2, 1).multiplyScalar(1 / 6),
		// 	// dithering: true,
		// 	wireframe: false,
		// });
		const material = (mesh.material as Material).clone();
		// console.log(material.onBeforeCompile);

		// update cloth material with computed position and normals
		material.onBeforeCompile = (shader) => {
			shader.uniforms.tPosition0 = {value: fbo.positionRT[0].texture};
			shader.uniforms.tPosition1 = {value: fbo.positionRT[1].texture};
			shader.uniforms.tNormal = {value: fbo.normalsRT.texture};
			shader.uniforms.tSize = {value: this.mainController.fbo.tSize};
			shader.vertexShader = MAIN_VERTEX_PREFIX + COMMON_GET_UV + shader.vertexShader;
			shader.vertexShader = shader.vertexShader.replace('#include <beginnormal_vertex>', MAIN_BEGINNORMAL_VERTEX);
			shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '');
		};

		// update depth material for correct shadows
		const depthMaterial = new MeshDepthMaterial();
		depthMaterial.onBeforeCompile = function (shader) {
			shader.uniforms.tPosition0 = {value: fbo.positionRT[0].texture};
			shader.uniforms.tPosition1 = {value: fbo.positionRT[1].texture};
			shader.vertexShader = DEPTH_VERTEX_PREFIX + shader.vertexShader;
			shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', DEPTH_BEGINNORMAL_VERTEX);
		};

		mesh.material = material;
		mesh.customDepthMaterial = depthMaterial;

		// fill position with associated texture sampling coordinate
		// const position = new Float32Array(RESOLUTION * RESOLUTION * 3);
		// for (let i = 0, il = RESOLUTION * RESOLUTION; i < il; i++) {
		// 	const i3 = i * 3;
		// 	position[i3 + 0] = (i % RESOLUTION) / RESOLUTION + 0.5 / RESOLUTION;
		// 	position[i3 + 1] = ~~(i / RESOLUTION) / RESOLUTION + 0.5 / RESOLUTION;
		// }

		// if (1 + 1) return;
		// TODO: clarify which mesh ends up being displayed, if it is the one given as input, or this one
		// const geometry = mesh.geometry;
		// const geometry = new BufferGeometry();
		// geometry.setIndex(geometryInit.geometry.index);
		// geometry.setAttribute('position', new BufferAttribute(position, 3));
		// geometry.setAttribute('uv', geometryInit.geometry.attributes.uv);

		// console.log({geometry});
		// const mesh = new Mesh(geometry, material);
		// mesh.geometry = geometry;

		// mesh.castShadow = true;

		// scene.add(mesh);
	}
}
