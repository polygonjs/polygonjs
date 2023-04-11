import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {inputObject3DMaterial} from './_BaseObject3D';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Poly} from '../../Poly';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class BaseSetMaterialFloatJsParamsConfig extends NodeParamsConfig {
	/** @param float */
	float = ParamConfig.FLOAT(1);
	/** @param lerp factor */
	lerp = ParamConfig.FLOAT(1);
}
const ParamsConfig = new BaseSetMaterialFloatJsParamsConfig();

export abstract class BaseSetMaterialFloatJsNode extends TypedJsNode<BaseSetMaterialFloatJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.MATERIAL, JsConnectionPointType.MATERIAL, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
			new JsConnectionPoint(JsConnectionPointType.MATERIAL, JsConnectionPointType.MATERIAL, CONNECTION_OPTIONS),
		]);
	}
	override setTriggerableLines(shadersCollectionController: ShadersCollectionController) {
		const material = inputObject3DMaterial(this, shadersCollectionController);
		const float = this.variableForInputParam(shadersCollectionController, this.p.float);
		const lerp = this.variableForInputParam(shadersCollectionController, this.p.lerp);

		const func = Poly.namedFunctionsRegister.getFunction(this._functionName(), this, shadersCollectionController);
		const bodyLine = func.asString(material, float, lerp);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
	abstract _functionName(): 'setMaterialOpacity';
}
