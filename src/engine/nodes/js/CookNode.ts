/**
 * cooks a node
 *
 *
 */
import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {CookNodeFunctionOptionsSerialized} from '../../functions/_CookNode';
import {triggerableMethodCalls} from './code/assemblers/actor/ActorAssemblerUtils';
import {inputNode} from './_BaseObject3D';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class CookNodeJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new CookNodeJsParamsConfig();

export class CookNodeJsNode extends TypedJsNode<CookNodeJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'cookNode';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.NODE, JsConnectionPointType.NODE, CONNECTION_OPTIONS),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
		]);
	}

	override setTriggerableLines(linesController: JsLinesCollectionController) {
		const node = inputNode(this, linesController);

		const onCookCompleted = `()=>{${triggerableMethodCalls(this)}}`;
		const options: CookNodeFunctionOptionsSerialized = {
			onCookCompleted,
		};

		const func = Poly.namedFunctionsRegister.getFunction('cookNode', this, linesController);
		const optionsStr = JSON.stringify(options).replace(/"/g, '');
		const bodyLine = func.asString(node, optionsStr);
		linesController.addTriggerableLines(this, [bodyLine], {addTriggeredLines: false});
	}
}
