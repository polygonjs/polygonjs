/**
 * computes velocity from forces
 *
 *
 *
 */
import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {Vector3} from 'three';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';

const OUTPUT_NAME = 'velocity';
class ComputeVelocityJsParamsConfig extends NodeParamsConfig {
	/** @param forces */
	forces = ParamConfig.VECTOR3([0, -9.8, 0]);
	/** @param velocity */
	velocity = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param dt */
	delta = ParamConfig.FLOAT(1);
	/** @param drag */
	drag = ParamConfig.FLOAT(1);
}
const ParamsConfig = new ComputeVelocityJsParamsConfig();
export class ComputeVelocityJsNode extends TypedJsNode<ComputeVelocityJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'computeVelocity';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(OUTPUT_NAME, JsConnectionPointType.VECTOR3),
		]);
	}
	override setLines(linesController: JsLinesCollectionController) {
		const velocity = this.variableForInputParam(linesController, this.p.velocity);
		const forces = this.variableForInputParam(linesController, this.p.forces);
		const delta = this.variableForInputParam(linesController, this.p.delta);
		const drag = this.variableForInputParam(linesController, this.p.drag);
		const out = this.jsVarName(OUTPUT_NAME);

		const tmpVarName = linesController.addVariable(this, new Vector3());
		const func = Poly.namedFunctionsRegister.getFunction('computeVelocity', this, linesController);
		const bodyLine = func.asString(velocity, forces, delta, drag, tmpVarName);
		linesController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.VECTOR3, varName: out, value: bodyLine},
		]);
	}
}
