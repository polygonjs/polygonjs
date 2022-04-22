/**
 * get a sphere property
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

enum GetSpherePropertyActorNodeInputName {
	center = 'center',
	radius = 'radius',
}
const SPHERE_PROPERTIES: GetSpherePropertyActorNodeInputName[] = [
	GetSpherePropertyActorNodeInputName.center,
	GetSpherePropertyActorNodeInputName.radius,
];

export class GetSpherePropertyActorNode extends ParamlessTypedActorNode {
	static override type() {
		return 'getSphereProperty';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(
				ActorConnectionPointType.SPHERE,
				ActorConnectionPointType.SPHERE,
				CONNECTION_OPTIONS
			),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(GetSpherePropertyActorNodeInputName.center, ActorConnectionPointType.VECTOR3),
			new ActorConnectionPoint(GetSpherePropertyActorNodeInputName.radius, ActorConnectionPointType.FLOAT),
		]);
	}

	private _target = new Vector3();
	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: GetSpherePropertyActorNodeInputName | string
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
		const Sphere = this._inputValue<ActorConnectionPointType.SPHERE>(ActorConnectionPointType.SPHERE, context);
		if (SPHERE_PROPERTIES.includes(outputName as GetSpherePropertyActorNodeInputName)) {
			const propertyName = outputName as GetSpherePropertyActorNodeInputName;
			switch (propertyName) {
				case GetSpherePropertyActorNodeInputName.center: {
					return Sphere ? Sphere.center : this._target;
				}
				case GetSpherePropertyActorNodeInputName.radius: {
					return Sphere ? Sphere.radius : 0;
				}
			}
		} else {
			return 0;
		}
	}
}
