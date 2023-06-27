/**
 * TBD
 *
 *
 */
import {BaseTriggerJsNode} from './_BaseTrigger';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';

class SetSoftBodyConstraintPositionJsParamsConfig extends NodeParamsConfig {
	id = ParamConfig.INTEGER(0, {
		range: [-1, 100],
		rangeLocked: [true, false],
	});
	position = ParamConfig.VECTOR3([0, 0, 0]);
	lerp = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [true, true],
	});
}
const ParamsConfig = new SetSoftBodyConstraintPositionJsParamsConfig();

export class SetSoftBodyConstraintPositionJsNode extends BaseTriggerJsNode<SetSoftBodyConstraintPositionJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setSoftBodyConstraintPosition';
	}

	override setTriggerableLines(shadersCollectionController: JsLinesCollectionController) {
		const id = this.variableForInputParam(shadersCollectionController, this.p.id);
		const position = this.variableForInputParam(shadersCollectionController, this.p.position);
		const lerp = this.variableForInputParam(shadersCollectionController, this.p.lerp);

		const func = Poly.namedFunctionsRegister.getFunction(
			'softBodyConstraintSetPosition',
			this,
			shadersCollectionController
		);

		const bodyLine = func.asString(id, position, lerp);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}
