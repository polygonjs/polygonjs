/**
 * get a child object
 *
 *
 */
import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {inputObject3D} from './_BaseObject3D';
import {Poly} from '../../Poly';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class GetObjectChildJsParamsConfig extends NodeParamsConfig {
	/** @param child index */
	index = ParamConfig.INTEGER(0, {
		range: [0, 9],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new GetObjectChildJsParamsConfig();

export class GetObjectChildJsNode extends TypedJsNode<GetObjectChildJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'getObjectChild';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D),
		]);
	}

	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const index = this.variableForInputParam(shadersCollectionController, this.p.index);
		const varName = this.jsVarName(JsConnectionPointType.OBJECT_3D);

		const func = Poly.namedFunctionsRegister.getFunction('getObjectChild', this, shadersCollectionController);
		const bodyLine = func.asString(object3D, index);
		shadersCollectionController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.PLANE, varName, value: bodyLine},
		]);
	}
}
