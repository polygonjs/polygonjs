/**
 * sends a trigger from a button param
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {BaseNodeType} from '../_Base';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {ActorBuilderNode} from '../../scene/utils/ActorsManager';
import {ActorJsSopNode} from '../sop/ActorJs';

class OnManualTriggerJsParamsConfig extends NodeParamsConfig {
	trigger = ParamConfig.BUTTON(null, {
		cook: false,
		callback: (node: BaseNodeType) => {
			OnManualTriggerJsNode.PARAM_CALLBACK_sendTrigger(node as OnManualTriggerJsNode);
		},
	});
}
const ParamsConfig = new OnManualTriggerJsParamsConfig();

export class OnManualTriggerJsNode extends TypedJsNode<OnManualTriggerJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return JsType.ON_MANUAL_TRIGGER;
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
		]);
	}

	static PARAM_CALLBACK_sendTrigger(node: OnManualTriggerJsNode) {
		node._triggerWithNode();
	}

	private _triggerWithNode() {
		const functionNode = this.functionNode();
		if (!functionNode) {
			console.warn('no function node found');
			return;
		}
		const actorNode = functionNode as ActorJsSopNode as ActorBuilderNode;
		if (!actorNode.evaluatorGenerator()) {
			console.warn('no evaluator found');
		}
		this.scene().actorsManager.manualTriggerController.runTriggerFromFunctionNode(actorNode);
	}
}
