import {Object3D, Vector2, Mesh, BufferAttribute, InstancedBufferAttribute} from 'three';
// import {CoreParticlesAttribute} from './CoreParticlesAttribute';
// import {isBooleanTrue} from '../Type';
// import {nearestPower2} from '../math/_Module';
import {CoreGeometry} from '../geometry/Geometry';
import {GlobalsTextureHandler} from '../../engine/nodes/gl/code/globals/Texture';
import {textureFromAttributePointsCount} from '../geometry/operation/TextureFromAttribute';

// const _maxTexturesSize = new Vector2();
// const _texturesSize = new Vector2();

// export function coreParticlesInitTextureSize(object: Object3D, target: Vector2) {
// 	const pointsCount = coreParticlesInitPointsCount(object);

// 	// const autoTexturesSize = CoreParticlesAttribute.getAutoTextureSize(object);
// 	// CoreParticlesAttribute.getMaxTextureSize(object, _maxTexturesSize);
// 	// CoreParticlesAttribute.getTextureSize(object, _texturesSize);

// 	// // get texture size
// 	// if (isBooleanTrue(autoTexturesSize)) {
// 		const nearestPowerOfTwo = nearestPower2(Math.sqrt(pointsCount));
// 		target.x = Math.min(nearestPowerOfTwo, _maxTexturesSize.x);
// 		target.y = Math.min(nearestPowerOfTwo, _maxTexturesSize.y);
// 	// } else {
// 	// 	// if (!(MathUtils.isPowerOfTwo(_texturesSize.x) && MathUtils.isPowerOfTwo(this.pv.texturesSize.y))) {
// 	// 	// 	this.states.error.set('texture size must be a power of 2');
// 	// 	// 	return;
// 	// 	// }

// 	// 	const maxParticlesCount = _texturesSize.x * _texturesSize.y;
// 	// 	if (pointsCount > maxParticlesCount) {
// 	// 		console.warn(
// 	// 			`max particles is set to (${_texturesSize.x}x${_texturesSize.y}=) ${maxParticlesCount}, which is less than the points count of the input (${pointsCount})`
// 	// 		);

// 	// 		return;
// 	// 	}
// 	// 	target.copy(_texturesSize);
// 	// }
// }

// export function coreParticlesInitPointsCount(object: Object3D): number {
// 	// let geometries = coreGroup.coreGeometries();
// 	// const firstGeometry = geometries[0];
// 	const geometry = (object as Mesh).geometry;

// 	if (geometry) {
// 		return CoreGeometry.pointsCount(geometry);
// 		// const type = CoreGeometry.markedAsInstance(geometry);
// 		// const attribute =
// 		// const selectedGeometry:BufferGeometry|undefined;
// 		// for (let geometry of geometries) {
// 		// 	if (geometry.markedAsInstance() == type) {
// 		// 		selectedGeometries.push(geometry);
// 		// 	}
// 		// }
// 		// // TODO: refactor
// 		// // const selectedGeometry = selectedGeometries[0];
// 		// return selectedGeometry.points().length;
// 		// let count=0
// 		// // for (let geometry of selectedGeometries) {
// 		// 	const points = selectedGeometry.points()
// 		// 	for (let point of points) {
// 		// 		// points.push(point);
// 		// 	}
// 		// // }
// 		// return points;
// 	} else {
// 		return 0;
// 	}
// }

export function coreParticlesInitParticlesUVs(object: Object3D, texturesSize: Vector2) {
	const geometry = (object as Mesh).geometry;
	if (!geometry) {
		return;
	}
	const pointsCount = textureFromAttributePointsCount(geometry);
	var uvs = new Float32Array(pointsCount * 2);

	let p = 0;
	var cmptr = 0;
	for (var j = 0; j < texturesSize.x; j++) {
		for (var i = 0; i < texturesSize.y; i++) {
			uvs[p++] = i / (texturesSize.x - 1);
			uvs[p++] = j / (texturesSize.y - 1);

			cmptr += 2;
			if (cmptr >= uvs.length) {
				break;
			}
		}
	}

	const uv_attrib_name = GlobalsTextureHandler.PARTICLES_SIM_UV_ATTRIB;
	const attribute_constructor = CoreGeometry.markedAsInstance(geometry) ? InstancedBufferAttribute : BufferAttribute;
	// if (this._particlesCoreGroup) {
	// for (let core_geometry of this._particlesCoreGroup.coreGeometries()) {
	// const geometry = core_geometry.geometry();

	geometry.setAttribute(uv_attrib_name, new attribute_constructor(uvs, 2));
	// }
	// }
}
