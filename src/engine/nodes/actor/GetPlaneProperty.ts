/**
 * get a plane property
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
import {Vector3} from 'three/src/math/Vector3';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

enum GetPlanePropertyActorNodeInputName {
	normal = 'normal',
	constant = 'constant',
}
const PLANE_PROPERTIES: GetPlanePropertyActorNodeInputName[] = [
	GetPlanePropertyActorNodeInputName.normal,
	GetPlanePropertyActorNodeInputName.constant,
];

export class GetPlanePropertyActorNode extends ParamlessTypedActorNode {
	static override type() {
		return 'getPlaneProperty';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(
				ActorConnectionPointType.PLANE,
				ActorConnectionPointType.PLANE,
				CONNECTION_OPTIONS
			),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(GetPlanePropertyActorNodeInputName.normal, ActorConnectionPointType.VECTOR3),
			new ActorConnectionPoint(GetPlanePropertyActorNodeInputName.constant, ActorConnectionPointType.FLOAT),
		]);
	}

	private _target = new Vector3();
	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: GetPlanePropertyActorNodeInputName | string
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
		const Plane = this._inputValue<ActorConnectionPointType.PLANE>(ActorConnectionPointType.PLANE, context);
		if (PLANE_PROPERTIES.includes(outputName as GetPlanePropertyActorNodeInputName)) {
			const propertyName = outputName as GetPlanePropertyActorNodeInputName;
			switch (propertyName) {
				case GetPlanePropertyActorNodeInputName.normal: {
					return Plane ? Plane.normal : this._target;
				}
				case GetPlanePropertyActorNodeInputName.constant: {
					return Plane ? Plane.constant : 0;
				}
			}
		} else {
			return 0;
		}
	}
}
