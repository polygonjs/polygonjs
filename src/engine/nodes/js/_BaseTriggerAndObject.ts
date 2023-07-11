import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {setObject3DOutputLine} from './_BaseObject3D';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

export abstract class BaseTriggerAndObjectJsNode<K extends NodeParamsConfig> extends TypedJsNode<K> {
	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
			...this._additionalInputs(),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D),
			...this._additionalOutputs(),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		setObject3DOutputLine(this, linesController);
	}
	protected _additionalInputs(): JsConnectionPoint<JsConnectionPointType>[] {
		return [];
	}
	protected _additionalOutputs(): JsConnectionPoint<JsConnectionPointType>[] {
		return [];
	}
}
class BaseTriggerAndObjectJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new BaseTriggerAndObjectJsParamsConfig();
export abstract class ParamlessBaseTriggerAndObjectJsNode extends BaseTriggerAndObjectJsNode<BaseTriggerAndObjectJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
}
