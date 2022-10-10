/**
 * Subtracts 2 SDFs
 *
 * @remarks
 *
 * based on [https://iquilezles.org/articles/distfunctions/](https://iquilezles.org/articles/distfunctions/)
 */
import {ParamConfig} from './../utils/params/ParamsConfig';
import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../core/ThreeToGl';
import SDFMethods from './gl/raymarching/sdf.glsl';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {FunctionGLDefinition} from './utils/GLDefinition';
import {isBooleanTrue} from '../../../core/Type';
import {sdfSmoothLines} from './utils/SDFSmoothUtils';
enum InputName {
	SDF0 = 'sdf0',
	SDF1 = 'sdf1',
	SMOOTH_FACTOR = 'smoothFactor',
	MAT_BLEND_DIST = 'matBlendDist',
}
const OUTPUT_NAME = 'subtract';
const ALLOWED_TYPES = [GlConnectionPointType.FLOAT, GlConnectionPointType.SDF_CONTEXT];
class SDFSubtractGlParamsConfig extends NodeParamsConfig {
	smooth = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new SDFSubtractGlParamsConfig();
export class SDFSubtractGlNode extends TypedGlNode<SDFSubtractGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDFSubtract';
	}

	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.spare_params.setInputlessParamNames(['smooth']);
		this.io.connection_points.set_input_name_function(this._glInputName.bind(this));
		this.io.connection_points.set_output_name_function(this._glOutputName.bind(this));
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
	}
	private _glInputName(index: number) {
		return [InputName.SDF0, InputName.SDF1, InputName.SMOOTH_FACTOR, InputName.MAT_BLEND_DIST][index];
	}
	private _glOutputName(index: number) {
		return OUTPUT_NAME;
	}
	private _expectedInputTypes() {
		let firstInputType = this.io.connection_points.first_input_connection_type();
		if (!firstInputType || !ALLOWED_TYPES.includes(firstInputType)) {
			firstInputType = GlConnectionPointType.FLOAT;
		}
		return [firstInputType, firstInputType, GlConnectionPointType.FLOAT, GlConnectionPointType.FLOAT];
	}
	private _expectedOutputTypes() {
		return [this._expectedInputTypes()[0]];
	}
	override setLines(shadersCollectionController: ShadersCollectionController) {
		const smooth = isBooleanTrue(this.pv.smooth);
		const sdf0 = ThreeToGl.float(this.variableForInput(InputName.SDF0));
		const sdf1 = ThreeToGl.float(this.variableForInput(InputName.SDF1));
		const smoothFactor = ThreeToGl.float(this.variableForInput(InputName.SMOOTH_FACTOR));

		const firstInputType = this._expectedInputTypes()[0];
		const bodyLines: string[] = [];
		if (firstInputType == GlConnectionPointType.FLOAT) {
			const float = this.glVarName(OUTPUT_NAME);
			const withSmooth = `SDFSmoothSubtract(${sdf0}, ${sdf1}, ${smoothFactor})`;
			const withoutSmooth = `SDFSubtract(${sdf0}, ${sdf1})`;
			const functionCall = smooth ? withSmooth : withoutSmooth;
			const bodyLine = `float ${float} = ${functionCall}`;
			bodyLines.push(bodyLine);
		} else {
			const sdfContext = this.glVarName(OUTPUT_NAME);
			const matBlendDist = ThreeToGl.float(this.variableForInput(InputName.MAT_BLEND_DIST));
			sdfSmoothLines({
				node: this,
				vars: {
					sdf0,
					sdf1,
					sdfContext,
					smooth,
					matBlendDist,
					smoothFactor,
				},
				functionNames: {
					smooth: 'SDFSmoothSubtract',
					default: 'SDFSubtract',
				},
				bodyLines,
			});
		}
		shadersCollectionController.addBodyLines(this, bodyLines);
		shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, SDFMethods)]);
	}
}
