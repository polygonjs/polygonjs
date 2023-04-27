/**
 * creates a Euler
 *
 * @remarks
 *
 *
 */
import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Euler} from 'three';
import {Poly} from '../../Poly';
import {ROTATION_ORDERS, RotationOrder} from '../../../core/Transform';

class EulerJsParamsConfig extends NodeParamsConfig {
	/** @param euler value */
	Euler = ParamConfig.VECTOR3([0, 0, 0]);
	/** @param rotation order */
	order = ParamConfig.INTEGER(ROTATION_ORDERS.indexOf(RotationOrder.XYZ), {
		menu: {
			entries: ROTATION_ORDERS.map((order, v) => {
				return {name: order, value: v};
			}),
		},
	});
}
const ParamsConfig = new EulerJsParamsConfig();
export class EulerJsNode extends TypedJsNode<EulerJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'euler';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.EULER, JsConnectionPointType.EULER),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		const inputValue = this.variableForInputParam(linesController, this.p.Euler);
		const order = this.variableForInputParam(linesController, this.p.order);
		const varName = this.jsVarName(JsConnectionPointType.EULER);
		const tmpVarName = linesController.addVariable(this, new Euler());

		const func = Poly.namedFunctionsRegister.getFunction('eulerSetFromVector3', this, linesController);
		linesController.addBodyOrComputed(this, [
			{
				dataType: JsConnectionPointType.EULER,
				varName,
				value: func.asString(inputValue, order, tmpVarName),
			},
		]);
	}
}
