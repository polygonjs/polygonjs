/**
 * Update the material color
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {inputObject3D, setObject3DOutputLine} from './_BaseObject3D';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class SetObjectMaterialColorJsParamsConfig extends NodeParamsConfig {
	/** @param color */
	color = ParamConfig.COLOR([1, 1, 1]);
	/** @param lerp factor */
	lerp = ParamConfig.FLOAT(1);
}
const ParamsConfig = new SetObjectMaterialColorJsParamsConfig();

export class SetObjectMaterialColorJsNode extends TypedJsNode<SetObjectMaterialColorJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'setObjectMaterialColor';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
		]);
	}
	override setLines(linesController: JsLinesCollectionController) {
		setObject3DOutputLine(this, linesController);
	}
	override setTriggerableLines(shadersCollectionController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const color = this.variableForInputParam(shadersCollectionController, this.p.color);
		const lerp = this.variableForInputParam(shadersCollectionController, this.p.lerp);

		const func = Poly.namedFunctionsRegister.getFunction(
			'setObjectMaterialColor',
			this,
			shadersCollectionController
		);
		const bodyLine = func.asString(object3D, color, lerp);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}
