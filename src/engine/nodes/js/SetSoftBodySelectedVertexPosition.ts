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

class SetSoftBodySelectedVertexPositionJsParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new SetSoftBodySelectedVertexPositionJsParamsConfig();

export class SetSoftBodySelectedVertexPositionJsNode extends BaseTriggerAndObjectJsNode<SetSoftBodySelectedVertexPositionJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setSoftBodySelectedVertexPosition';
	}

	override setTriggerableLines(shadersCollectionController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const position = this.variableForInputParam(shadersCollectionController, this.p.position);

		const func = Poly.namedFunctionsRegister.getFunction(
			'setSoftBodySelectedVertexPosition',
			this,
			shadersCollectionController
		);

		const bodyLine = func.asString(object3D, position);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}
