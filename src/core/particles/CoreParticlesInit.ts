import {Object3D, Vector2, Mesh, BufferAttribute, InstancedBufferAttribute} from 'three';
import {GlobalsTextureHandler} from '../../engine/nodes/gl/code/globals/Texture';
import {textureFromAttributePointsCount} from '../geometry/operation/TextureFromAttribute';
import {markedAsInstance} from '../geometry/GeometryUtils';

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
	const attribute_constructor = markedAsInstance(geometry) ? InstancedBufferAttribute : BufferAttribute;
	// if (this._particlesCoreGroup) {
	// for (let core_geometry of this._particlesCoreGroup.coreGeometries()) {
	// const geometry = core_geometry.geometry();

	geometry.setAttribute(uv_attrib_name, new attribute_constructor(uvs, 2));
	// }
	// }
}
