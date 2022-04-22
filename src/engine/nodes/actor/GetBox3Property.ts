/**
 * get a box3 property
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

enum GetBox3PropertyActorNodeInputName {
	min = 'min',
	max = 'max',
}
const BOX3_PROPERTIES: GetBox3PropertyActorNodeInputName[] = [
	GetBox3PropertyActorNodeInputName.min,
	GetBox3PropertyActorNodeInputName.max,
];

export class GetBox3PropertyActorNode extends ParamlessTypedActorNode {
	static override type() {
		return 'getBox3Property';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(ActorConnectionPointType.BOX3, ActorConnectionPointType.BOX3, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(GetBox3PropertyActorNodeInputName.min, ActorConnectionPointType.VECTOR3),
			new ActorConnectionPoint(GetBox3PropertyActorNodeInputName.max, ActorConnectionPointType.VECTOR3),
		]);
	}

	private _target = new Vector3();
	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: GetBox3PropertyActorNodeInputName | string
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
		const Box3 = this._inputValue<ActorConnectionPointType.BOX3>(ActorConnectionPointType.BOX3, context);
		if (!Box3) {
			return this._target;
		}
		if (BOX3_PROPERTIES.includes(outputName as GetBox3PropertyActorNodeInputName)) {
			const propValue = Box3[outputName as GetBox3PropertyActorNodeInputName];
			return propValue;
		} else {
			return this._target;
		}
	}
}
