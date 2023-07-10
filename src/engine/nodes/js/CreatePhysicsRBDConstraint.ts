/**
 * TBD
 *
 *
 */
import {BaseTriggerAndObjectJsNode} from './_BaseTriggerAndObject';
import {inputObject3D} from './_BaseObject3D';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';

class CreatePhysicsRBDConstraintJsParamsConfig extends NodeParamsConfig {
	anchor = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new CreatePhysicsRBDConstraintJsParamsConfig();

export class CreatePhysicsRBDConstraintJsNode extends BaseTriggerAndObjectJsNode<CreatePhysicsRBDConstraintJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'createPhysicsRBDConstraint';
	}

	override setTriggerableLines(linesController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, linesController);
		const anchor = this.variableForInputParam(linesController, this.p.anchor);

		const func = Poly.namedFunctionsRegister.getFunction('physicsRBDCreateConstraint', this, linesController);

		const bodyLine = func.asString(object3D, anchor);
		linesController.addTriggerableLines(this, [bodyLine]);
	}
}
