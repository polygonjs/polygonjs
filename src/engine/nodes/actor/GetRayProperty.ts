/**
 * get a ray property
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
import {Vector3} from 'three';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

enum GetRayPropertyActorNodeInputName {
	origin = 'origin',
	direction = 'direction',
}
const RAY_PROPERTIES: GetRayPropertyActorNodeInputName[] = [
	GetRayPropertyActorNodeInputName.origin,
	GetRayPropertyActorNodeInputName.direction,
];

export class GetRayPropertyActorNode extends ParamlessTypedActorNode {
	static override type() {
		return 'getRayProperty';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(ActorConnectionPointType.RAY, ActorConnectionPointType.RAY, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(GetRayPropertyActorNodeInputName.origin, ActorConnectionPointType.VECTOR3),
			new ActorConnectionPoint(GetRayPropertyActorNodeInputName.direction, ActorConnectionPointType.VECTOR3),
		]);
	}

	private _target = new Vector3();
	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: GetRayPropertyActorNodeInputName | string
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
		const Ray = this._inputValue<ActorConnectionPointType.RAY>(ActorConnectionPointType.RAY, context);
		if (RAY_PROPERTIES.includes(outputName as GetRayPropertyActorNodeInputName)) {
			const propertyName = outputName as GetRayPropertyActorNodeInputName;
			switch (propertyName) {
				case GetRayPropertyActorNodeInputName.origin: {
					return Ray ? Ray.origin : this._target;
				}
				case GetRayPropertyActorNodeInputName.direction: {
					return Ray ? Ray.direction : this._target;
				}
			}
		} else {
			return this._target;
		}
	}
}
