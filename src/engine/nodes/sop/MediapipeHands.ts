/**
 * Creates a default face mesh to be used with SOP/mediapipeHands
 *
 */

import {TypedSopNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {DEFAULT_POSITION} from '../../../core/mediapipe/Hands';
import {BufferGeometry, BufferAttribute} from 'three';
import {Attribute} from '../../../core/geometry/Attribute';
import {HAND_CONNECTIONS} from '@mediapipe/hands';
import {ObjectType} from '../../../core/geometry/Constant';

class MediapipeHandsSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new MediapipeHandsSopParamsConfig();

export class MediapipeHandsSopNode extends TypedSopNode<MediapipeHandsSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'mediapipeHands';
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

		this.setGeometry(geometry, ObjectType.LINE_SEGMENTS);
	}
}
