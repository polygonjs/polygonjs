/**
 * updates the matrix of an object
 *
 *
 */

import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {ParamType} from '../../poly/ParamType';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;
class ObjectUpdateWorldMatrixActorParamsConfig extends NodeParamsConfig {
	/** @param updates the matrix of the parents */
	updateParents = ParamConfig.BOOLEAN(1);
	/** @param updates the matrix of the children */
	updateChildren = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new ObjectUpdateWorldMatrixActorParamsConfig();

export class ObjectUpdateWorldMatrixActorNode extends TypedActorNode<ObjectUpdateWorldMatrixActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'objectUpdateWorldMatrix';
	}

	override initializeNode() {
		super.initializeNode();
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new ActorConnectionPoint(
				ActorConnectionPointType.OBJECT_3D,
				ActorConnectionPointType.OBJECT_3D,
				CONNECTION_OPTIONS
			),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER),
		]);
	}

	public override receiveTrigger(context: ActorNodeTriggerContext) {
		const Object3D =
			this._inputValue<ActorConnectionPointType.OBJECT_3D>(ActorConnectionPointType.OBJECT_3D, context) ||
			context.Object3D;
		const updateParents = this._inputValueFromParam<ParamType.BOOLEAN>(this.p.updateParents, context);
		const updateChildren = this._inputValueFromParam<ParamType.BOOLEAN>(this.p.updateChildren, context);
		Object3D.updateWorldMatrix(updateParents, updateChildren);
		this.runTrigger(context);
	}
}
