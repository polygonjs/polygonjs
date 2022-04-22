/**
 * get an object
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
import {Object3D} from 'three';
import {BaseNodeType} from '../_Base';
import {ParamType} from '../../poly/ParamType';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

interface CachedObjectResult {
	object: Object3D | null;
}
class GetObjectActorParamsConfig extends NodeParamsConfig {
	/** @param use current object */
	getCurrentObject = ParamConfig.BOOLEAN(1);
	/** @param object mask */
	mask = ParamConfig.STRING('', {
		visibleIf: {
			getCurrentObject: 0,
		},
		objectMask: true,
		callback: (node: BaseNodeType) => {
			GetObjectActorNode.PARAM_CALLBACK_clearCache(node as GetObjectActorNode);
		},
	});
}
const ParamsConfig = new GetObjectActorParamsConfig();

export class GetObjectActorNode extends TypedActorNode<GetObjectActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'getObject';
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
			return context.Object3D;
		} else {
			const mask = this._inputValueFromParam<ParamType.STRING>(this.p.mask, context);

			const frame = this.scene().frame();
			if (this._cacheClearedOnFrame != frame) {
				// we clear the cache if we are on a new frame
				this._clearOutputValueCache();
				this._cacheClearedOnFrame = frame;
			}
			const cachedObject = this._cachedObjectByMask.get(mask);
			if (!cachedObject) {
				const matchedObject = this.scene().findObjectByMask(mask) || null;
				this._cachedObjectByMask.set(mask, {object: matchedObject});
			}

			return this._cachedObjectByMask.get(mask)?.object || context.Object3D;
		}
	}

	// cache
	private _cacheClearedOnFrame = -1;
	private _cachedObjectByMask: Map<string, CachedObjectResult> = new Map();
	private _clearOutputValueCache() {
		this._cachedObjectByMask.clear();
	}
	static PARAM_CALLBACK_clearCache(node: GetObjectActorNode) {
		node._clearOutputValueCache();
	}
}
