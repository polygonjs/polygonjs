/**
 * Min of 2 SDFs
 *
 * @remarks
 *
 * based on [https://iquilezles.org/articles/distfunctions/](https://iquilezles.org/articles/distfunctions/)
 *
 * unlike the [gl/min](/docs/nodes/gl/min), this node accepts SDFContexts as inputs as well as floats.
 *
 */

import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import SDFMethods from './gl/raymarching/sdf.glsl';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {FunctionGLDefinition} from './utils/GLDefinition';

enum InputName {
	SDF0 = 'sdf0',
	SDF1 = 'sdf1',
}
const OUTPUT_NAME = 'min';
const ALLOWED_TYPES = [GlConnectionPointType.FLOAT, GlConnectionPointType.SDF_CONTEXT];
class SDFMinGlParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SDFMinGlParamsConfig();
export class SDFMinGlNode extends TypedGlNode<SDFMinGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDFMin';
	}

	override initializeNode() {
		super.initializeNode();

		this.io.connection_points.set_input_name_function(this._glInputName.bind(this));
		this.io.connection_points.set_output_name_function(this._glOutputName.bind(this));
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
	}

	private _glInputName(index: number) {
		return [InputName.SDF0, InputName.SDF1][index];
	}
	private _glOutputName(index: number) {
		return OUTPUT_NAME;
	}
	private _expectedInputTypes() {
		let firstInputType = this.io.connection_points.first_input_connection_type();
		if (firstInputType && ALLOWED_TYPES.includes(firstInputType)) {
			return [firstInputType, firstInputType];
		}
		return [GlConnectionPointType.FLOAT, GlConnectionPointType.FLOAT];
	}
	private _expectedOutputTypes() {
		return [this._expectedInputTypes()[0]];
	}

	override setLines(shaders_collection_controller: ShadersCollectionController) {
		const firstInputType = this._expectedInputTypes()[0];
		switch (firstInputType) {
			case GlConnectionPointType.FLOAT: {
				return this._setLinesFloat(shaders_collection_controller);
			}
			case GlConnectionPointType.SDF_CONTEXT: {
				return this._setLinesSDFContext(shaders_collection_controller);
			}
		}
	}
	private _setLinesFloat(shaders_collection_controller: ShadersCollectionController) {
		const sdf0 = ThreeToGl.float(this.variableForInput(InputName.SDF0));
		const sdf1 = ThreeToGl.float(this.variableForInput(InputName.SDF1));

		const float = this.glVarName(OUTPUT_NAME);

		const bodyLine = `float ${float} = min(${sdf0}, ${sdf1})`;
		shaders_collection_controller.addBodyLines(this, [bodyLine]);

		shaders_collection_controller.addDefinitions(this, [new FunctionGLDefinition(this, SDFMethods)]);
	}
	private _setLinesSDFContext(shaders_collection_controller: ShadersCollectionController) {
		const sdf0 = ThreeToGl.vector2(this.variableForInput(InputName.SDF0));
		const sdf1 = ThreeToGl.vector2(this.variableForInput(InputName.SDF1));

		const sdfContext = this.glVarName(OUTPUT_NAME);

		const bodyLine = `SDFContext ${sdfContext} = SDFContext(min(${sdf0}.d, ${sdf1}.d), ${sdf0}.d < ${sdf1}.d ? ${sdf0}.matId : ${sdf1}.matId)`;
		shaders_collection_controller.addBodyLines(this, [bodyLine]);

		shaders_collection_controller.addDefinitions(this, [new FunctionGLDefinition(this, SDFMethods)]);
	}
}
