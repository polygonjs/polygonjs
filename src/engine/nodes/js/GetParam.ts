/**
 * Get a param of specific node
 *
 *
 */
import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {ParamPathParam} from '../../params/ParamPath';
import {JsType} from '../../poly/registers/nodes/types/Js';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class GetParamJsParamsConfig extends NodeParamsConfig {
	/** @param parameter to get */
	Param = ParamConfig.PARAM_PATH('', {
		dependentOnFoundParam: false,
		paramSelection: true,
		computeOnDirty: false,
	});
}
const ParamsConfig = new GetParamJsParamsConfig();

export class GetParamJsNode extends TypedJsNode<GetParamJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return JsType.GET_PARAM;
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.PARAM, JsConnectionPointType.PARAM, CONNECTION_OPTIONS),
		]);
		this.io.connection_points.spare_params.setInputlessParamNames([JsConnectionPointType.PARAM]);
	}

	setParamPath(paramPath: string) {
		this.p.Param.set(paramPath);
	}
	override setLines(linesController: JsLinesCollectionController) {
		const out = this.jsVarName(JsConnectionPointType.PARAM);

		const param = (this.params.get(JsConnectionPointType.PARAM) as ParamPathParam).value.param();
		if (!param) {
			return;
		}

		const func = Poly.namedFunctionsRegister.getFunction('getParam', this, linesController);
		const bodyLine = func.asString(`'${param.path()}'`);
		linesController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.PARAM, varName: out, value: bodyLine},
		]);
	}
}
