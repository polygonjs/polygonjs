/**
 * dispatches the received trigger in 1 of the 2 outputs depending on the condition
 *
 *
 *
 */
import {SetUtils} from '../../../core/SetUtils';
import {Poly} from '../../Poly';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	getConnectedOutputNodes,
	getOutputIndices,
	nodeMethodName,
	triggerInputIndex,
} from './code/assemblers/actor/ActorAssemblerUtils';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {BaseJsNodeType, TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class TriggerTwoWaySwitchJsParamsConfig extends NodeParamsConfig {
	/** @param if true, trigger will be forward through the 1st output. If false, it will be forwarded through the 2nd output. */
	condition = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new TriggerTwoWaySwitchJsParamsConfig();

export class TriggerTwoWaySwitchJsNode extends TypedJsNode<TriggerTwoWaySwitchJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'triggerTwoWaySwitch';
	}

	static OUTPUT_NAME_IF_TRUE = `${TRIGGER_CONNECTION_NAME}IfTrue`;
	static OUTPUT_NAME_IF_FALSE = `${TRIGGER_CONNECTION_NAME}IfFalse`;

	override initializeNode() {
		super.initializeNode();
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(
				TriggerTwoWaySwitchJsNode.OUTPUT_NAME_IF_TRUE,
				JsConnectionPointType.TRIGGER,
				CONNECTION_OPTIONS
			),
			new JsConnectionPoint(
				TriggerTwoWaySwitchJsNode.OUTPUT_NAME_IF_FALSE,
				JsConnectionPointType.TRIGGER,
				CONNECTION_OPTIONS
			),
		]);
	}

	override setTriggerableLines(shadersCollectionController: JsLinesCollectionController) {
		const condition = this.variableForInputParam(shadersCollectionController, this.p.condition);
		const methodNamesIfTrue = triggerMethod(this, TriggerTwoWaySwitchJsNode.OUTPUT_NAME_IF_TRUE);
		const methodNamesIfFalse = triggerMethod(this, TriggerTwoWaySwitchJsNode.OUTPUT_NAME_IF_FALSE);

		const func = Poly.namedFunctionsRegister.getFunction('triggerTwoWaySwitch', this, shadersCollectionController);
		const bodyLine = func.asString(condition, methodNamesIfTrue, methodNamesIfFalse);
		shadersCollectionController.addTriggerableLines(this, [bodyLine], {addTriggeredLines: false});
	}
}

function triggerMethod(node: TriggerTwoWaySwitchJsNode, outputName: string): string {
	const outputIndex = getOutputIndices(node, (c) => c.name() == outputName)[0];
	const triggerableNodes = new Set<BaseJsNodeType>();
	getConnectedOutputNodes({
		node,
		triggerOutputIndices: [outputIndex],
		triggerableNodes,
		recursive: false,
	});
	const triggerableMethodNames = SetUtils.toArray(triggerableNodes).map((triggerableNode) => {
		const argIndex = triggerInputIndex(node, triggerableNode);
		const m = nodeMethodName(triggerableNode);
		return `this.${m}(${argIndex})`;
	});
	return `()=>{ ${triggerableMethodNames.join(';')} }`;
}
