/**
 * Presses a param button
 *
 *
 */
import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {Poly} from '../../Poly';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {inputParam} from './_BaseObject3D';
import {BaseParamType} from '../../params/_Base';
import {ParamType} from '../../poly/ParamType';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class PressButtonParamJsParamsConfig extends NodeParamsConfig {
	/** @param the parameter to update */
	Param = ParamConfig.PARAM_PATH('', {
		dependentOnFoundParam: false,
		paramSelection: ParamType.BUTTON,
		computeOnDirty: true,
	});
}
const ParamsConfig = new PressButtonParamJsParamsConfig();

export class PressButtonParamJsNode extends TypedJsNode<PressButtonParamJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'pressButtonParam';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.TRIGGER, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.TRIGGER, JsConnectionPointType.TRIGGER),
		]);
	}
	setParamPath(paramPath: string) {
		this.p.Param.set(paramPath);
	}
	setParamParam(param: BaseParamType) {
		this.p.Param.setParam(param);
	}

	override setTriggerableLines(linesController: JsLinesCollectionController) {
		const param = inputParam(this, linesController);
		const func = Poly.namedFunctionsRegister.getFunction('pressButtonParam', this, linesController);
		const bodyLine = func.asString(param);

		linesController.addTriggerableLines(this, [bodyLine]);
	}
}
