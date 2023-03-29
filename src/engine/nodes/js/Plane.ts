/**
 * creates a plane
 *
 * @remarks
 *
 *
 */
import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Plane} from 'three';
import {Poly} from '../../Poly';

const OUTPUT_NAME = JsConnectionPointType.PLANE;
class PlaneJsParamsConfig extends NodeParamsConfig {
	/** @param a unit length vector defining the normal of the plane */
	normal = ParamConfig.VECTOR3([0, 1, 0]);
	/** @param the signed distance from the origin to the plane */
	constant = ParamConfig.FLOAT(0, {
		range: [-1, 1],
		rangeLocked: [false, false],
	});
}
const ParamsConfig = new PlaneJsParamsConfig();
export class PlaneJsNode extends TypedJsNode<PlaneJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'plane';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(OUTPUT_NAME, JsConnectionPointType.PLANE),
		]);
	}
	override setLines(shadersCollectionController: ShadersCollectionController) {
		const normal = this.variableForInputParam(shadersCollectionController, this.p.normal);
		const constant = this.variableForInputParam(shadersCollectionController, this.p.constant);
		const out = this.jsVarName(OUTPUT_NAME);

		shadersCollectionController.addVariable(this, out, new Plane());
		const func = Poly.namedFunctionsRegister.getFunction('planeSet', this, shadersCollectionController);
		const bodyLine = func.asString(normal, constant, out);
		shadersCollectionController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.PLANE, varName: out, value: bodyLine},
		]);
	}
}
