/**
 * get an object
 *
 *
 */
import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Poly} from '../../Poly';
import {inputObject3D} from './_BaseObject3D';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class GetObjectJsParamsConfig extends NodeParamsConfig {
	/** @param use current object */
	getCurrentObject = ParamConfig.BOOLEAN(1);
	/** @param object mask */
	mask = ParamConfig.STRING('', {
		visibleIf: {
			getCurrentObject: 0,
		},
		objectMask: true,
	});
}
const ParamsConfig = new GetObjectJsParamsConfig();

export class GetObjectJsNode extends TypedJsNode<GetObjectJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'getObject';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint('mask', JsConnectionPointType.STRING, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D),
		]);
	}
	override setLines(shadersCollectionController: ShadersCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const getCurrentObject = this.variableForInputParam(shadersCollectionController, this.p.getCurrentObject);
		const mask = this.variableForInputParam(shadersCollectionController, this.p.mask);
		const out = this.jsVarName(JsConnectionPointType.OBJECT_3D);

		const func = Poly.namedFunctionsRegister.getFunction('getObject', this, shadersCollectionController);
		const bodyLine = func.asString(object3D, getCurrentObject, mask);
		shadersCollectionController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.PLANE, varName: out, value: bodyLine},
		]);
	}
}
