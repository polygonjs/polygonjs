/**
 * sets the position of a cloth constraint
 *
 *
 */
import {BaseTriggerAndObjectJsNode} from './_BaseTriggerAndObject';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {inputObject3D} from './_BaseObject3D';

class SetClothConstraintPositionJsParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0]);
	lerp = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [true, true],
	});
}
const ParamsConfig = new SetClothConstraintPositionJsParamsConfig();

export class SetClothConstraintPositionJsNode extends BaseTriggerAndObjectJsNode<SetClothConstraintPositionJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setClothConstraintPosition';
	}

	override setTriggerableLines(shadersCollectionController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const position = this.variableForInputParam(shadersCollectionController, this.p.position);
		const lerp = this.variableForInputParam(shadersCollectionController, this.p.lerp);

		const func = Poly.namedFunctionsRegister.getFunction(
			'clothConstraintSetPosition',
			this,
			shadersCollectionController
		);

		const bodyLine = func.asString(object3D, position, lerp);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}
