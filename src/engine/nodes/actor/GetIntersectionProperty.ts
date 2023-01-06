/**
 * get an intersection property
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
import {Vector2, Vector3} from 'three';
import {TypeAssert} from '../../poly/Assert';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

export enum GetIntersectionPropertyActorNodeOutputName {
	distance = 'distance',
	object = 'object',
	point = 'point',
	uv = 'uv',
	// uv2 = 'uv2',
}
const NORMAL_OUTPUT = 'normal';
const INTERSECTION_PROPERTIES: GetIntersectionPropertyActorNodeOutputName[] = [
	GetIntersectionPropertyActorNodeOutputName.distance,
	GetIntersectionPropertyActorNodeOutputName.object,
	GetIntersectionPropertyActorNodeOutputName.point,
	GetIntersectionPropertyActorNodeOutputName.uv,
	// GetIntersectionPropertyActorNodeInputName.uv2,
];

const tmpV2 = new Vector2();
const tmpV3 = new Vector3();
export class GetIntersectionPropertyActorNode extends ParamlessTypedActorNode {
	static override type() {
		return 'getIntersectionProperty';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(
				ActorConnectionPointType.INTERSECTION,
				ActorConnectionPointType.INTERSECTION,
				CONNECTION_OPTIONS
			),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(
				GetIntersectionPropertyActorNodeOutputName.distance,
				ActorConnectionPointType.FLOAT
			),
			new ActorConnectionPoint(
				GetIntersectionPropertyActorNodeOutputName.object,
				ActorConnectionPointType.OBJECT_3D
			),
			new ActorConnectionPoint(
				GetIntersectionPropertyActorNodeOutputName.point,
				ActorConnectionPointType.VECTOR3
			),
			new ActorConnectionPoint(NORMAL_OUTPUT, ActorConnectionPointType.VECTOR3),
			new ActorConnectionPoint(GetIntersectionPropertyActorNodeOutputName.uv, ActorConnectionPointType.VECTOR2),
		]);
	}

	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: GetIntersectionPropertyActorNodeOutputName | string
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
		const intersection = this._inputValue<ActorConnectionPointType.INTERSECTION>(
			ActorConnectionPointType.INTERSECTION,
			context
		);
		if (outputName == NORMAL_OUTPUT) {
			if (intersection) {
				const face = intersection.face;
				if (face && face.normal) {
					tmpV3.copy(face.normal);
				} else {
					tmpV3.set(0, 1, 0);
				}
				return tmpV3;
			}
		}
		if (INTERSECTION_PROPERTIES.includes(outputName as GetIntersectionPropertyActorNodeOutputName)) {
			const propName = outputName as GetIntersectionPropertyActorNodeOutputName;
			switch (propName) {
				case GetIntersectionPropertyActorNodeOutputName.distance: {
					return intersection?.distance || 0;
				}
				case GetIntersectionPropertyActorNodeOutputName.object: {
					return intersection?.object || context.Object3D;
				}
				case GetIntersectionPropertyActorNodeOutputName.point: {
					if (intersection) {
						tmpV3.copy(intersection.point);
					} else {
						tmpV3.set(0, 0, 0);
					}
					return tmpV3;
				}
				case GetIntersectionPropertyActorNodeOutputName.uv: {
					if (intersection && intersection.uv) {
						tmpV2.copy(intersection.uv);
					} else {
						tmpV2.set(0, 0);
					}
					return tmpV2;
				}
			}

			TypeAssert.unreachable(propName);
		}
	}
}
