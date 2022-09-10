/**
 * get the parent object
 *
 *
 */

import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
	ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Actor';
import {isBooleanTrue} from '../../../core/Type';
import {ParamType} from '../../poly/ParamType';
import {GetObjectActorNode} from './GetObject';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

class GetParentActorParamsConfig extends NodeParamsConfig {
	/** @param use current object */
	getCurrentObject = ParamConfig.BOOLEAN(1);
	/** @param object mask */
	mask = ParamConfig.STRING('', {
		visibleIf: {
			getCurrentObject: 0,
		},
		objectMask: true,
		callback: () => {
			GetParentActorNode.PARAM_CALLBACK_clearCache();
		},
	});
}
const ParamsConfig = new GetParentActorParamsConfig();

export class GetParentActorNode extends TypedActorNode<GetParentActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'getParent';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint('mask', ActorConnectionPointType.STRING, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint('object3D', ActorConnectionPointType.OBJECT_3D),
		]);
	}

	public override outputValue(
		context: ActorNodeTriggerContext
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType.OBJECT_3D] {
		const getCurrentObject = this._inputValueFromParam<ParamType.BOOLEAN>(this.p.getCurrentObject, context);
		if (isBooleanTrue(getCurrentObject)) {
			return context.Object3D.parent!;
		} else {
			const mask = this._inputValueFromParam<ParamType.STRING>(this.p.mask, context);
			const object = GetObjectActorNode.objectFromMask(mask, this.scene()) || context.Object3D;
			return object.parent!;
		}
	}

	static PARAM_CALLBACK_clearCache() {
		GetObjectActorNode.PARAM_CALLBACK_clearCache();
	}
}
