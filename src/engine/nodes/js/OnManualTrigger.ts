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
import {ActorSopNode} from '../sop/Actor';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {nodeMethodName} from './code/assemblers/actor/ActorAssemblerUtils';
import {EvaluatorMethodName} from './code/assemblers/actor/Evaluator';

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
	override isTriggering() {
		return true;
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
		]);
	}

	static PARAM_CALLBACK_sendTrigger(node: OnManualTriggerJsNode) {
		node._triggerWithNode();
	}

	override setTriggeringLines(
		shadersCollectionController: JsLinesCollectionController,
		triggeredMethods: string
	): void {
		shadersCollectionController.addTriggeringLines(this, [triggeredMethods], {
			gatherable: false,
			triggeringMethodName: nodeMethodName(this) as EvaluatorMethodName,
		});
	}
	private _triggerWithNode() {
		const functionNode = this.functionNode();
		if (!functionNode) {
			console.warn('no function node found');
			return;
		}
		const actorNode = functionNode as ActorSopNode as ActorBuilderNode;
		if (!actorNode.compilationController.evaluatorGenerator()) {
			console.warn('no evaluator found');
		}
		this.scene().actorsManager.manualTriggerController.runTriggerFromFunctionNode(actorNode, nodeMethodName(this));
	}
}
