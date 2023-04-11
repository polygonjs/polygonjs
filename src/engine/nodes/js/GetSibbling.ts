/**
 * get the object's sibbling
 *
 *
 */

import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {inputObject3D} from './_BaseObject3D';
import {Poly} from '../../Poly';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class GetSibblingJsParamsConfig extends NodeParamsConfig {
	offset = ParamConfig.INTEGER(1, {
		range: [-10, 10],
		rangeLocked: [false, false],
	});
}
const ParamsConfig = new GetSibblingJsParamsConfig();

export class GetSibblingJsNode extends TypedJsNode<GetSibblingJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'getSibbling';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const offset = this.variableForInputParam(shadersCollectionController, this.p.offset);
		const out = this.jsVarName(JsConnectionPointType.OBJECT_3D);

		const func = Poly.namedFunctionsRegister.getFunction('getSibbling', this, shadersCollectionController);
		const bodyLine = func.asString(object3D, offset);
		shadersCollectionController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.PLANE, varName: out, value: bodyLine},
		]);
	}
}
