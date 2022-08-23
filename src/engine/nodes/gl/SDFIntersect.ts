/**
 * intersects 2 SDFs
 *
 * @remarks
 *
 * based on [https://iquilezles.org/articles/distfunctions/](https://iquilezles.org/articles/distfunctions/)
 */

import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../core/ThreeToGl';
import SDFMethods from './gl/raymarching/sdf.glsl';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {FunctionGLDefinition} from './utils/GLDefinition';

enum InputName {
	SDF0 = 'sdf0',
	SDF1 = 'sdf1',
	SMOOTH = 'smooth',
	SMOOTH_FACTOR = 'smoothFactor',
}
const OUTPUT_NAME = 'intersect';
const ALLOWED_TYPES = [GlConnectionPointType.FLOAT, GlConnectionPointType.SDF_CONTEXT];
class SDFIntersectGlParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SDFIntersectGlParamsConfig();
export class SDFIntersectGlNode extends TypedGlNode<SDFIntersectGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDFIntersect';
	}

	override initializeNode() {
		super.initializeNode();

		this.io.connection_points.set_input_name_function(this._glInputName.bind(this));
		this.io.connection_points.set_output_name_function(this._glOutputName.bind(this));
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
	}
	private _glInputName(index: number) {
		return [InputName.SDF0, InputName.SDF1, InputName.SMOOTH, InputName.SMOOTH_FACTOR][index];
	}
	private _glOutputName(index: number) {
		return OUTPUT_NAME;
	}
	private _expectedInputTypes() {
		let firstInputType = this.io.connection_points.first_input_connection_type();
		if (!firstInputType || ALLOWED_TYPES.includes(firstInputType)) {
			firstInputType = GlConnectionPointType.FLOAT;
		}
		return [firstInputType, firstInputType, GlConnectionPointType.BOOL, GlConnectionPointType.FLOAT];
	}
	private _expectedOutputTypes() {
		return [this._expectedInputTypes()[0]];
	}
	override setLines(shadersCollectionController: ShadersCollectionController) {
		const sdf0 = ThreeToGl.float(this.variableForInput(InputName.SDF0));
		const sdf1 = ThreeToGl.float(this.variableForInput(InputName.SDF1));
		const smooth = ThreeToGl.bool(this.variableForInput(InputName.SMOOTH));
		const smoothFactor = ThreeToGl.float(this.variableForInput(InputName.SMOOTH_FACTOR));

		const firstInputType = this._expectedInputTypes()[0];
		const bodyLines: string[] = [];
		if (firstInputType == GlConnectionPointType.FLOAT) {
			const float = this.glVarName(OUTPUT_NAME);
			const withSmooth = `SDFSmoothIntersect(${sdf0}, ${sdf1}, ${smoothFactor})`;
			const withoutSmooth = `SDFIntersect(${sdf0}, ${sdf1})`;
			const bodyLine = `float ${float} = ${smooth} ? ${withSmooth} : ${withoutSmooth}`;
			bodyLines.push(bodyLine);
		} else {
			const sdfContext = this.glVarName(OUTPUT_NAME);
			const matId = `${sdf0}.d < ${sdf1}.d ? ${sdf0}.matId : ${sdf1}.matId`;
			const withSmooth = `SDFContext(SDFSmoothIntersect(${sdf0}.d, ${sdf1}.d, ${smoothFactor}), ${matId})`;
			const withoutSmooth = `SDFContext(SDFIntersect(${sdf0}.d, ${sdf1}.d), ${matId})`;
			const bodyLine = `SDFContext ${sdfContext} = ${smooth} ? ${withSmooth} : ${withoutSmooth}`;
			bodyLines.push(bodyLine);
		}
		shadersCollectionController.addBodyLines(this, bodyLines);
		shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, SDFMethods)]);
	}
}
