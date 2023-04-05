/**
 * Presses a param button
 *
 *
 */
import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {ParamType} from '../../poly/ParamType';
import {Poly} from '../../Poly';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class PressButtonParamJsParamsConfig extends NodeParamsConfig {
	/** @param the parameter to update */
	param = ParamConfig.PARAM_PATH('', {
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
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const param = this.pv.param.param();
		if (!param) {
			return;
		}
		const nodePath = `'${param.node.path()}'`;
		const paramName = `'${param.name()}'`;

		const func = Poly.namedFunctionsRegister.getFunction('pressButtonParam', this, shadersCollectionController);
		const bodyLine = func.asString(nodePath, paramName);

		shadersCollectionController.addActionBodyLines(this, [bodyLine]);
	}
}
