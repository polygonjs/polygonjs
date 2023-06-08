/**
 * multiply a vector by a matrix
 *
 *
 *
 */

import {TypedGlNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ShaderName} from '../utils/shaders/ShaderName';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {glConnectionType} from './code/utils/ConnectionsUtils';

const DEFAULT_INPUT_TYPES = [GlConnectionPointType.VEC4, GlConnectionPointType.MAT4];

class MultVectorMatrixGlParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new MultVectorMatrixGlParamsConfig();
export class MultVectorMatrixGlNode extends TypedGlNode<MultVectorMatrixGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): Readonly<'multVectorMatrix'> {
		return 'multVectorMatrix';
	}

	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_input_name_function(this._glInputName.bind(this));
		this.io.connection_points.set_output_name_function(this._glOutputName.bind(this));
	}

	protected _expectedInputTypes() {
		const inputConnections = this.io.connections.existingInputConnections();
		if (!inputConnections) {
			return DEFAULT_INPUT_TYPES;
		}
		const connection0 = inputConnections[0];
		if (!connection0) {
			return DEFAULT_INPUT_TYPES;
		}
		const type0 = glConnectionType(connection0);
		const connection1 = inputConnections[1];
		const type1 = connection1 ? glConnectionType(connection1) : GlConnectionPointType.MAT4;

		switch (type0) {
			case GlConnectionPointType.VEC4: {
				return [type0, type1];
			}
			case GlConnectionPointType.VEC3: {
				return [type0, type1];
			}
			default: {
				return DEFAULT_INPUT_TYPES;
			}
		}
	}
	protected _expectedOutputTypes() {
		return [this._expectedInputTypes()[0]];
	}
	_glInputName(index: number): string {
		return this._expectedInputTypes()[index];
	}
	_glOutputName(index: number): string {
		return this._expectedOutputTypes()[index];
	}

	override setLines(linesController: ShadersCollectionController) {
		const inputVec = ThreeToGl.mat4(this.variableForInput(this._glInputName(0)));
		const inputMat = ThreeToGl.mat4(this.variableForInput(this._glInputName(1)));
		const outValue = this.glVarName(this._glOutputName(0));
		const outType = this._expectedOutputTypes()[0];
		const bodyLine = `${outType} ${outValue} = ${inputMat} * ${inputVec}`;
		linesController.addBodyLines(this, [bodyLine], ShaderName.VERTEX);
	}
}
