import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {inputObject3DMaterial, setObject3DOutputLine} from './_BaseObject3D';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class BaseSetMaterialTextureJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new BaseSetMaterialTextureJsParamsConfig();

export abstract class BaseSetMaterialTextureJsNode extends TypedJsNode<BaseSetMaterialTextureJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.MATERIAL, JsConnectionPointType.MATERIAL, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.TEXTURE, JsConnectionPointType.TEXTURE, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
			new JsConnectionPoint(JsConnectionPointType.MATERIAL, JsConnectionPointType.MATERIAL, CONNECTION_OPTIONS),
		]);
	}
	override setLines(linesController: JsLinesCollectionController) {
		setObject3DOutputLine(this, linesController);
	}
	override setTriggerableLines(linesController: JsLinesCollectionController) {
		const material = inputObject3DMaterial(this, linesController);
		const texture = this.variableForInput(linesController, JsConnectionPointType.TEXTURE);

		const func = Poly.namedFunctionsRegister.getFunction(this._functionName(), this, linesController);
		const bodyLine = func.asString(material, texture);
		linesController.addTriggerableLines(this, [bodyLine]);
	}
	abstract _functionName():
		| 'setMaterialMap'
		| 'setMaterialAlphaMap'
		| 'setMaterialAOMap'
		| 'setMaterialEnvMap'
		| 'setMaterialEmissiveMap';
}
