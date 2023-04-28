/**
 * renders an object with a material, and returns the pixel value at the given uv coordinates
 *
 */

import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JS_CONNECTION_POINT_IN_NODE_DEF, JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {inputObject3D} from './_BaseObject3D';
import {Vector4} from 'three';
import {RefJsDefinition} from './utils/JsDefinition';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

export enum RenderPixelJsNodeOutputName {
	value = 'value',
}

class RenderPixelJsParamsConfig extends NodeParamsConfig {
	uv = ParamConfig.VECTOR2([0, 0]);
	backgroundColor = ParamConfig.COLOR([0, 0, 0]);
}
const ParamsConfig = new RenderPixelJsParamsConfig();

export class RenderPixelJsNode extends TypedJsNode<RenderPixelJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'renderPixel';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.MATERIAL, JsConnectionPointType.MATERIAL, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.CAMERA, JsConnectionPointType.CAMERA, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D),
			new JsConnectionPoint(JsConnectionPointType.MATERIAL, JsConnectionPointType.MATERIAL, CONNECTION_OPTIONS),
			new JsConnectionPoint(RenderPixelJsNodeOutputName.value, JsConnectionPointType.VECTOR4, CONNECTION_OPTIONS),
		]);
	}

	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const usedOutputNames = this.io.outputs.used_output_names();

		if (usedOutputNames.includes(RenderPixelJsNodeOutputName.value)) {
			this._addValueRef(shadersCollectionController);

			if (!usedOutputNames.includes(JsConnectionPointType.TRIGGER)) {
				this.setTriggeringLines(shadersCollectionController, '');
			}
		}
	}

	override setTriggerableLines(linesController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, linesController);
		const material = this.variableForInput(linesController, JsConnectionPointType.MATERIAL);
		const camera = this.variableForInput(linesController, JsConnectionPointType.CAMERA);
		const backgroundColor = this.variableForInputParam(linesController, this.p.backgroundColor);
		const uv = this.variableForInputParam(linesController, this.p.uv);

		const refValue = this._addValueRef(linesController);

		const func = Poly.namedFunctionsRegister.getFunction('renderPixel', this, linesController);
		const bodyLine = func.asString(object3D, material, camera, backgroundColor, uv, `this.${refValue}.value`);
		linesController.addTriggerableLines(this, [bodyLine]);
	}

	private _addValueRef(linesController: JsLinesCollectionController) {
		const outValue = this.jsVarName(RenderPixelJsNodeOutputName.value);
		const tmpVarName = linesController.addVariable(this, new Vector4());
		linesController.addDefinitions(this, [
			new RefJsDefinition(this, linesController, JsConnectionPointType.BOOLEAN, outValue, tmpVarName),
		]);
		return outValue;
	}
}
