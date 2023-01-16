/**
 * Creates a default hand to be used with SOP/HandTrackingLandmarks
 *
 */

import {TypedSopNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {DEFAULT_POSITION} from '../../../core/computerVision/hand/Data';
import {BufferGeometry, BufferAttribute} from 'three';
import {Attribute} from '../../../core/geometry/Attribute';
import {HAND_CONNECTIONS} from '@mediapipe/hands';
import {ObjectType} from '../../../core/geometry/Constant';
import {
	CoreComputerVisionHand,
	CoreComputerVisionHandParamConfig,
} from '../../../core/computerVision/hand/CoreComputerVisionHand';

class TrackingLandmarksHandSopParamsConfig extends CoreComputerVisionHandParamConfig(NodeParamsConfig) {}
const ParamsConfig = new TrackingLandmarksHandSopParamsConfig();

export class TrackingLandmarksHandSopNode extends TypedSopNode<TrackingLandmarksHandSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'trackingLandmarksHand';
	}

	override async cook() {
		const geometry = new BufferGeometry();

		// add position
		const positionArray = DEFAULT_POSITION;
		geometry.setAttribute(Attribute.POSITION, new BufferAttribute(new Float32Array(positionArray), 3));

		// add indices
		const indices: number[] = [];
		const linesCount = HAND_CONNECTIONS.length;
		for (let i = 0; i < linesCount; i++) {
			indices.push(HAND_CONNECTIONS[i][0]);
			indices.push(HAND_CONNECTIONS[i][1]);
		}
		geometry.setIndex(indices);
		geometry.computeVertexNormals();

		const object = this.createObject(geometry, ObjectType.LINE_SEGMENTS);
		CoreComputerVisionHand.setAttributes(object, this.pv);
		this.setObject(object);
	}
}
