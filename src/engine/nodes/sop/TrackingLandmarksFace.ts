/**
 * Creates a default face mesh to be used with SOP/mediapipeFacemesh
 *
 */

import {TypedSopNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {DEFAULT_POSITION} from '../../../core/computerVision/face/Data';
import {BufferGeometry, BufferAttribute, Vector2} from 'three';
import {Attribute} from '../../../core/geometry/Attribute';
import {FACEMESH_TESSELATION} from '@mediapipe/face_mesh';
import {
	CoreComputerVisionFace,
	CoreComputerVisionFaceParamConfig,
} from '../../../core/computerVision/face/CoreComputerVisionFace';
import {ObjectType} from '../../../core/geometry/Constant';

class TrackingLandmarksFaceSopParamsConfig extends CoreComputerVisionFaceParamConfig(NodeParamsConfig) {}
const ParamsConfig = new TrackingLandmarksFaceSopParamsConfig();

export class TrackingLandmarksFaceSopNode extends TypedSopNode<TrackingLandmarksFaceSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'trackingLandmarksFace';
	}

	private _uv = new Vector2();
	override cook() {
		const geometry = new BufferGeometry();

		// add position
		const positionArray = DEFAULT_POSITION;
		geometry.setAttribute(Attribute.POSITION, new BufferAttribute(new Float32Array(positionArray), 3));

		// add uvs
		const uvs: number[] = [];
		const pointsCount = positionArray.length / 3;
		for (let i = 0; i < pointsCount; i++) {
			this._uv.fromArray(positionArray, i * 3);
			this._uv.toArray(uvs, i * 3);
		}
		geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));

		// add indices
		const indices: number[] = [];
		const polyCount = FACEMESH_TESSELATION.length / 3;
		for (let i = 0; i < polyCount; i++) {
			indices.push(FACEMESH_TESSELATION[i * 3 + 0][0]);
			indices.push(FACEMESH_TESSELATION[i * 3 + 1][0]);
			indices.push(FACEMESH_TESSELATION[i * 3 + 2][0]);
		}
		geometry.setIndex(indices);
		geometry.computeVertexNormals();

		const object = this.createObject(geometry, ObjectType.MESH);
		CoreComputerVisionFace.setAttributes(object, this.pv);
		this.setObject(object);
	}
}
