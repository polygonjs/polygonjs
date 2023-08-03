/**
 * rotates an input vector
 *
 *
 *
 */

import {Number3, PolyDictionary} from '../../../types/GlobalTypes';
import {TypedGlNode} from './_Base';
import Quaternion from './gl/quaternion.glsl';
import {FunctionGLDefinition} from './utils/GLDefinition';
import {GlConnectionPointType} from '../utils/io/connections/Gl';
import {ParamConfig, NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ThreeToGl} from '../../../core/ThreeToGl';

export enum GlRotateMode {
	AXIS = 0,
	QUAT = 1,
}
const Modes: Array<GlRotateMode> = [GlRotateMode.AXIS, GlRotateMode.QUAT];

type StringByMode = {[key in GlRotateMode]: string};
const LabelByMode: StringByMode = {
	[GlRotateMode.AXIS]: 'from axis + angle',
	[GlRotateMode.QUAT]: 'from quaternion',
};
type StringArrayByMode = {[key in GlRotateMode]: string[]};
const InputNamesByMode: StringArrayByMode = {
	[GlRotateMode.AXIS]: ['vector', 'axis', 'angle'],
	[GlRotateMode.QUAT]: ['vector', 'quat'],
};
const MethodNameByMode: StringByMode = {
	[GlRotateMode.AXIS]: 'rotateWithAxisAngle',
	[GlRotateMode.QUAT]: 'rotateWithQuat',
};
type ConnectionTypeArrayByMode = {[key in GlRotateMode]: GlConnectionPointType[]};
const InputTypesByMode: ConnectionTypeArrayByMode = {
	[GlRotateMode.AXIS]: [GlConnectionPointType.VEC3, GlConnectionPointType.VEC3, GlConnectionPointType.FLOAT],
	[GlRotateMode.QUAT]: [GlConnectionPointType.VEC3, GlConnectionPointType.VEC4],
};

const DefaultValues: PolyDictionary<Number3> = {
	vector: [0, 0, 1],
	axis: [0, 1, 0],
};

class RotateParamsConfig extends NodeParamsConfig {
	signature = ParamConfig.INTEGER(GlRotateMode.AXIS, {
		menu: {
			entries: Modes.map((mode, i) => {
				const label = LabelByMode[mode];
				return {name: label, value: i};
			}),
		},
	});
}

const ParamsConfig = new RotateParamsConfig();
export class RotateGlNode extends TypedGlNode<RotateParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'rotate';
	}

	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
	}
	setSignature(mode: GlRotateMode) {
		const index = Modes.indexOf(mode);
		this.p.signature.set(index);
	}
	mode() {
		// we need the "|| GlRotateMode.AXIS",
		// as when creating a polyNode containing this node,
		// this.pv.signature is undefined
		return Modes[this.pv.signature] || GlRotateMode.AXIS;
	}
	protected _expectedInputName(index: number) {
		return InputNamesByMode[this.mode()][index];
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
		return [GlConnectionPointType.VEC3];
	}
	functionDefinitions() {
		// const type = this._expected_output_types()[0];
		// do not use type from the output, as there seem to always be a def somewhere
		// TODO: I probably don't need a data type in FunctionGLDefinition
		// const type = GlConnectionPointType.VEC4;
		return [new FunctionGLDefinition(this, Quaternion)];
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const varType: GlConnectionPointType = this._expectedInputTypes()[0];
		const args = this.io.inputs.namedInputConnectionPoints().map((connection, i) => {
			const name = connection.name();
			return ThreeToGl.any(this.variableForInput(name));
		});
		const joinedArgs = args.join(', ');

		const sum = this.glVarName(this.io.connection_points.output_name(0));
		const bodyLine = `${varType} ${sum} = ${this.functionName()}(${joinedArgs})`;
		shadersCollectionController.addBodyLines(this, [bodyLine]);
		shadersCollectionController.addDefinitions(this, this.functionDefinitions());
	}
}
