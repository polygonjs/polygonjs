/**
 * create a sphere
 *
 * @remarks
 *
 *
 */

import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Sphere} from 'three';
import {Poly} from '../../Poly';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class SphereJsParamsConfig extends NodeParamsConfig {
	/** @param sphere center */
	center = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param sphere radius */
	radius = ParamConfig.FLOAT(1, {
		range: [0, 10],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new SphereJsParamsConfig();
export class SphereJsNode extends TypedJsNode<SphereJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'sphere';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.SPHERE, JsConnectionPointType.SPHERE, CONNECTION_OPTIONS),
		]);
	}
	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const center = this.variableForInputParam(shadersCollectionController, this.p.center);
		const radius = this.variableForInputParam(shadersCollectionController, this.p.radius);
		const out = this.jsVarName(JsConnectionPointType.SPHERE);

		const tmpVarName = shadersCollectionController.addVariable(this, new Sphere());
		const func = Poly.namedFunctionsRegister.getFunction('sphereSet', this, shadersCollectionController);
		const bodyLine = func.asString(center, radius, tmpVarName);
		shadersCollectionController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.SPHERE, varName: out, value: bodyLine},
		]);
	}
}
