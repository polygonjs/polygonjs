/**
 * rotates an input vector
 *
 *
 *
 */

import {Number3, PolyDictionary} from '../../../types/GlobalTypes';
import {TypedJsNode} from './_Base';
import {JsConnectionPointType} from '../utils/io/connections/Js';
import {ParamConfig, NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Vector3} from 'three';
import {Poly} from '../../Poly';

export enum JsRotateMode {
	AXIS = 0,
	QUAT = 1,
}
const Modes: Array<JsRotateMode> = [JsRotateMode.AXIS, JsRotateMode.QUAT];
export enum JsRotateInputNameAxisMode {
	AXIS = 'axis',
	ANGLE = 'angle',
}

type StringByMode = {[key in JsRotateMode]: string};
const LabelByMode: StringByMode = {
	[JsRotateMode.AXIS]: 'from axis + angle',
	[JsRotateMode.QUAT]: 'from quaternion',
};
type StringArrayByMode = {[key in JsRotateMode]: string[]};
const InputNamesByMode: StringArrayByMode = {
	[JsRotateMode.AXIS]: [
		JsConnectionPointType.VECTOR3,
		JsRotateInputNameAxisMode.AXIS,
		JsRotateInputNameAxisMode.ANGLE,
	],
	[JsRotateMode.QUAT]: [JsConnectionPointType.VECTOR3, JsConnectionPointType.QUATERNION],
};
const MethodNameByMode: StringByMode = {
	[JsRotateMode.AXIS]: 'rotateWithAxisAngle',
	[JsRotateMode.QUAT]: 'rotateWithQuat',
};
type ConnectionTypeArrayByMode = {[key in JsRotateMode]: JsConnectionPointType[]};
const InputTypesByMode: ConnectionTypeArrayByMode = {
	[JsRotateMode.AXIS]: [JsConnectionPointType.VECTOR3, JsConnectionPointType.VECTOR3, JsConnectionPointType.FLOAT],
	[JsRotateMode.QUAT]: [JsConnectionPointType.VECTOR3, JsConnectionPointType.QUATERNION],
};

const DefaultValues: PolyDictionary<Number3> = {
	vector: [0, 0, 1],
	axis: [0, 1, 0],
};

class RotateParamsConfig extends NodeParamsConfig {
	mode = ParamConfig.INTEGER(JsRotateMode.AXIS, {
		menu: {
			entries: Modes.map((mode, i) => {
				const label = LabelByMode[mode];
				return {name: label, value: i};
			}),
		},
	});
}

const ParamsConfig = new RotateParamsConfig();
export class RotateJsNode extends TypedJsNode<RotateParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'rotate';
	}

	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_output_name_function(this._expectedOutputName.bind(this));
	}
	setMode(mode: JsRotateMode) {
		const index = Modes.indexOf(mode);
		this.p.mode.set(index);
	}
	mode() {
		return Modes[this.pv.mode];
	}
	protected _expectedInputName(index: number) {
		return InputNamesByMode[this.mode()][index];
	}
	protected _expectedOutputName(index: number) {
		return JsConnectionPointType.VECTOR3;
	}
	override paramDefaultValue(name: string) {
		return DefaultValues[name];
	}
	functionName(): string {
		return MethodNameByMode[this.mode()];
	}

	protected _expectedInputTypes() {
		return InputTypesByMode[this.mode()];
	}
	protected _expectedOutputTypes() {
		return [JsConnectionPointType.VECTOR3];
	}

	override setLines(linesController: JsLinesCollectionController) {
		const mode = this.mode();
		switch (mode) {
			case JsRotateMode.AXIS:
				this._setLinesForAxisAngle(linesController);
				break;
			case JsRotateMode.QUAT:
				this._setLinesForQuat(linesController);
				break;
		}
	}
	private _setLinesForAxisAngle(linesController: JsLinesCollectionController) {
		const inputNames = InputNamesByMode[JsRotateMode.AXIS];
		const vector = this.variableForInput(linesController, inputNames[0]);
		const axis = this.variableForInput(linesController, inputNames[1]);
		const angle = this.variableForInput(linesController, inputNames[2]);

		const varName = this.jsVarName(JsConnectionPointType.VECTOR3);
		const tmpVarName = linesController.addVariable(this, new Vector3());

		const func = Poly.namedFunctionsRegister.getFunction('rotateWithAxisAngle', this, linesController);
		linesController.addBodyOrComputed(this, [
			{
				dataType: JsConnectionPointType.EULER,
				varName,
				value: func.asString(vector, axis, angle, tmpVarName),
			},
		]);
	}
	private _setLinesForQuat(linesController: JsLinesCollectionController) {
		const inputNames = InputNamesByMode[JsRotateMode.QUAT];
		const vector = this.variableForInput(linesController, inputNames[0]);
		const quat = this.variableForInput(linesController, inputNames[1]);

		const varName = this.jsVarName(JsConnectionPointType.VECTOR3);
		const tmpVarName = linesController.addVariable(this, new Vector3());

		const func = Poly.namedFunctionsRegister.getFunction('rotateWithQuaternion', this, linesController);
		linesController.addBodyOrComputed(this, [
			{
				dataType: JsConnectionPointType.EULER,
				varName,
				value: func.asString(vector, quat, tmpVarName),
			},
		]);
	}
}
