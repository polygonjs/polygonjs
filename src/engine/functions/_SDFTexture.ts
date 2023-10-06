// import {Vector3, Data3DTexture} from 'three';
// import {NamedFunction7} from './_Base';
// import {_SDFBox} from './_SDFPrimitives';

// const _boundCenter = new Vector3();
// const _boundSize = new Vector3();
// const _posNormalized = new Vector3();
// const _SDFBoxP = new Vector3();

// export function _textureDist(texture: Data3DTexture, posNormalized: Vector3): number {
// 	// console.log(texture);
// 	// if (!texture) {
// 	// 	return 0;
// 	// }
// 	// return 0;
// 	const data = texture.source.data;
// 	const x = Math.floor(posNormalized.x * data.width);
// 	const y = Math.floor(posNormalized.y * data.height);
// 	const z = Math.floor(posNormalized.z * data.depth);
// 	// const index = x + y * data.width + z * data.width * data.height;
// 	const index = x + y * data.width + z * data.width * data.height;
// 	const dist = data.data[index];
// 	// console.log(texture, data, index, dist);
// 	return dist;
// }
// export function _SDFTexture(
// 	texture: Data3DTexture | null,
// 	p: Vector3,
// 	center: Vector3,
// 	boundMin: Vector3,
// 	boundMax: Vector3,
// 	padding: Vector3,
// 	bias: number
// ): number {
// 	if (!texture) {
// 		return p.x;
// 	}
// 	_boundCenter.copy(boundMin).add(boundMax).multiplyScalar(0.5);
// 	_boundSize.copy(boundMax).sub(boundMin);
// 	// get SDFBox dist
// 	_SDFBoxP.copy(p); //.sub(_boundCenter);
// 	const SDFBoxDist: number = _SDFBox(_SDFBoxP, _boundCenter, _boundSize.multiply(padding), 1);
// 	// return SDFBox dist if we are outside, texture value otherwise
// 	_posNormalized.copy(p).sub(center).sub(boundMin).divide(_boundSize);
// 	return SDFBoxDist < bias ? _textureDist(texture, _posNormalized) : SDFBoxDist;
// }

// export class SDFTexture extends NamedFunction7<
// 	[Data3DTexture | null, Vector3, Vector3, Vector3, Vector3, Vector3, number]
// > {
// 	static override type() {
// 		return 'SDFTexture';
// 	}
// 	func = _SDFTexture;
// }

// // vec3 v_POLY_textureSDF1_boundCenter = (v_POLY_textureSDF1BoundMax_val + v_POLY_textureSDF1BoundMin_val)*0.5;
// // vec3 v_POLY_textureSDF1_boundSize = (v_POLY_textureSDF1BoundMax_val - v_POLY_textureSDF1BoundMin_val);
// // vec3 v_POLY_textureSDF1_positionNormalised = ((p - v_POLY_textureSDF1BoundMin_val) / v_POLY_textureSDF1_boundSize);
// // float v_POLY_textureSDF1_sdBox = sdBox(p-v_POLY_textureSDF1_boundCenter, v_POLY_textureSDF1_boundSize*vec3(1.0, 1.0, 1.0));
// // float v_POLY_textureSDF1_d = v_POLY_textureSDF1_sdBox < 0.01 ? texture(v_POLY_textureSDF_textureSDF1, v_POLY_textureSDF1_positionNormalised - vec3(0.0, 0.0, 0.0)).r : v_POLY_textureSDF1_sdBox;
