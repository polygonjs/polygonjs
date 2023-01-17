/**
 * get properties from tracked hand landmarks
 *
 *
 */

import {ActorNodeTriggerContext, ParamlessTypedActorNode} from './_Base';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
	ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Actor';
import {Vector3, Vector4} from 'three';
import {TypeAssert} from '../../poly/Assert';
import {CoreComputerVisionHandIndex} from '../../../core/computerVision/hand/Common';
const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

export enum GetTrackedHandPropertyActorNodeInputName {
	thumbDirection = 'thumbDirection',
	indexDirection = 'indexDirection',
	middleDirection = 'middleDirection',
	ringDirection = 'ringDirection',
	pinkyDirection = 'pinkyDirection',
}
const DIRECTION_PROPERTIES: GetTrackedHandPropertyActorNodeInputName[] = [
	GetTrackedHandPropertyActorNodeInputName.thumbDirection,
	GetTrackedHandPropertyActorNodeInputName.indexDirection,
	GetTrackedHandPropertyActorNodeInputName.middleDirection,
	GetTrackedHandPropertyActorNodeInputName.ringDirection,
	GetTrackedHandPropertyActorNodeInputName.pinkyDirection,
];

const tmpV3 = new Vector3();
const tmpV4 = new Vector4();
export class GetTrackedHandPropertyActorNode extends ParamlessTypedActorNode {
	static override type() {
		return 'getTrackedHandProperty';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(
				ActorConnectionPointType.VECTOR4_ARRAY,
				ActorConnectionPointType.VECTOR4_ARRAY,
				CONNECTION_OPTIONS
			),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			...DIRECTION_PROPERTIES.map((prop) => new ActorConnectionPoint(prop, ActorConnectionPointType.VECTOR3)),
		]);
	}

	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: GetTrackedHandPropertyActorNodeInputName
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
		const values = this._inputValue<ActorConnectionPointType.VECTOR4_ARRAY>(
			ActorConnectionPointType.VECTOR4_ARRAY,
			context
		);
		if (!values) {
			return tmpV3;
		}

		switch (outputName) {
			case GetTrackedHandPropertyActorNodeInputName.thumbDirection: {
				tmpV4
					.copy(values[CoreComputerVisionHandIndex.THUMB_TIP])
					.sub(values[CoreComputerVisionHandIndex.THUMB_MCP]);
				tmpV3.set(tmpV4.x, tmpV4.y, tmpV4.z).normalize();
				return tmpV3;
			}
			case GetTrackedHandPropertyActorNodeInputName.indexDirection: {
				tmpV4
					.copy(values[CoreComputerVisionHandIndex.INDEX_FINGER_TIP])
					.sub(values[CoreComputerVisionHandIndex.INDEX_FINGER_DIP]);
				tmpV3.set(tmpV4.x, tmpV4.y, tmpV4.z).normalize();
				return tmpV3;
			}
			case GetTrackedHandPropertyActorNodeInputName.middleDirection: {
				tmpV4
					.copy(values[CoreComputerVisionHandIndex.MIDDLE_FINGER_TIP])
					.sub(values[CoreComputerVisionHandIndex.MIDDLE_FINGER_DIP]);
				tmpV3.set(tmpV4.x, tmpV4.y, tmpV4.z).normalize();
				return tmpV3;
			}
			case GetTrackedHandPropertyActorNodeInputName.ringDirection: {
				tmpV4
					.copy(values[CoreComputerVisionHandIndex.RING_FINGER_TIP])
					.sub(values[CoreComputerVisionHandIndex.RING_FINGER_DIP]);
				tmpV3.set(tmpV4.x, tmpV4.y, tmpV4.z).normalize();
				return tmpV3;
			}
			case GetTrackedHandPropertyActorNodeInputName.pinkyDirection: {
				tmpV4
					.copy(values[CoreComputerVisionHandIndex.PINKY_TIP])
					.sub(values[CoreComputerVisionHandIndex.PINKY_DIP]);
				tmpV3.set(tmpV4.x, tmpV4.y, tmpV4.z).normalize();
				return tmpV3;
			}
		}
		TypeAssert.unreachable(outputName);
	}
}
