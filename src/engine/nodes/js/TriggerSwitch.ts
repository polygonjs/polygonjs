/**
 * dispatches the received trigger in one of the outputs depending on the index
 *
 *
 *
 */
import {setToArray} from '../../../core/SetUtils';
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
import {BaseJsNodeType, TypedJsNode} from './_Base';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class TriggerSwitchJsParamsConfig extends NodeParamsConfig {
	/** @param triggersCount */
	triggersCount = ParamConfig.INTEGER(4, {
		range: [1, 10],
		rangeLocked: [true, false],
	});
	/** @param defines which trigger will be dispatched */
	index = ParamConfig.INTEGER(0, {
		range: [0, 10],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new TriggerSwitchJsParamsConfig();

export class TriggerSwitchJsNode extends TypedJsNode<TriggerSwitchJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'triggerSwitch';
	}

	override initializeNode() {
		super.initializeNode();
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.TRIGGER, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint('index', JsConnectionPointType.INT, CONNECTION_OPTIONS),
		]);
		this.io.connection_points.set_output_name_function(this._expectedOutputNames.bind(this));
		this.io.connection_points.set_expected_input_types_function(() => []);
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
	}
	private _expectedOutputNames(index: number) {
		return `${JsConnectionPointType.TRIGGER}${index}`;
	}
	private _expectedOutputTypes() {
		const array: JsConnectionPointType[] = new Array(this.pv.triggersCount).fill(JsConnectionPointType.TRIGGER);
		return array;
	}

	override setTriggerableLines(shadersCollectionController: JsLinesCollectionController) {
		const index = this.variableForInputParam(shadersCollectionController, this.p.index);
		const methodNames = this._expectedOutputTypes()
			.map((_, i) => triggerMethod(this, this._expectedOutputNames(i)))
			.join(',');

		const func = Poly.namedFunctionsRegister.getFunction('triggerSwitch', this, shadersCollectionController);
		const bodyLine = func.asString(index, `[${methodNames}]`);
		shadersCollectionController.addTriggerableLines(this, [bodyLine], {addTriggeredLines: false});
	}
}

function triggerMethod(node: TriggerSwitchJsNode, outputName: string): string {
	const outputIndex = getOutputIndices(node, (c) => c.name() == outputName)[0];
	const triggerableNodes = new Set<BaseJsNodeType>();
	getConnectedOutputNodes({
		node,
		triggerOutputIndices: [outputIndex],
		triggerableNodes,
		recursive: false,
	});
	const triggerableMethodNames = setToArray(triggerableNodes,[]).map((triggerableNode) => {
		const argIndex = triggerInputIndex(node, triggerableNode);
		const m = nodeMethodName(triggerableNode);
		return `this.${m}(${argIndex})`;
	});
	return `()=>{ ${triggerableMethodNames.join(';')} }`;
}
