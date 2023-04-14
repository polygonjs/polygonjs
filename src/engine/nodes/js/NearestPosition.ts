/**
 * returns the vector3 that is the closest to a given position
 *
 *
 *
 */
import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {createVariable} from './code/assemblers/_BaseJsPersistedConfigUtils';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

const OUTPUT_NAME = 'position';
class NearestPositionJsParamsConfig extends NodeParamsConfig {
	/** @param vector3 */
	Vector3 = ParamConfig.VECTOR3([0, 0, 0]);
}
const ParamsConfig = new NearestPositionJsParamsConfig();
export class NearestPositionJsNode extends TypedJsNode<NearestPositionJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'nearestPosition';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.VECTOR3, JsConnectionPointType.VECTOR3, CONNECTION_OPTIONS),
			new JsConnectionPoint(
				JsConnectionPointType.VECTOR3_ARRAY,
				JsConnectionPointType.VECTOR3_ARRAY,
				CONNECTION_OPTIONS
			),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(OUTPUT_NAME, JsConnectionPointType.VECTOR3),
		]);
	}
	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const v3 = this.variableForInputParam(shadersCollectionController, this.p.Vector3);
		const positions = this.variableForInput(shadersCollectionController, JsConnectionPointType.VECTOR3_ARRAY);
		const varName = this.jsVarName(OUTPUT_NAME);

		// create target var
		const variable = createVariable(JsConnectionPointType.VECTOR3);
		if (variable) {
			shadersCollectionController.addVariable(this, varName, variable);
		}

		const func = Poly.namedFunctionsRegister.getFunction('nearestPosition', this, shadersCollectionController);
		shadersCollectionController.addBodyOrComputed(this, [
			{dataType: JsConnectionPointType.VECTOR3, varName, value: func.asString(v3, positions, varName)},
		]);
	}
}
