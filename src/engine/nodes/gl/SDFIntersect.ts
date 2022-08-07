/**
 * intersects 2 SDFs
 *
 * @remarks
 *
 * based on [https://iquilezles.org/www/articles/distfunctions/distfunctions.htm](https://iquilezles.org/www/articles/distfunctions/distfunctions.htm)
 */

import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../core/ThreeToGl';
import SDFMethods from './gl/sdf.glsl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {FunctionGLDefinition} from './utils/GLDefinition';
import {isBooleanTrue} from '../../../core/Type';

enum InputName {
	SDF0 = 'sdf0',
	SDF1 = 'sdf1',
}
const OUTPUT_NAME = 'intersect';
const ALLOWED_TYPES = [GlConnectionPointType.FLOAT, GlConnectionPointType.SDF_CONTEXT];
class SDFIntersectGlParamsConfig extends NodeParamsConfig {
	smooth = ParamConfig.BOOLEAN(0);
	smoothFactor = ParamConfig.FLOAT(0, {
		visibleIf: {smooth: 1},
	});
}
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
	override setLines(shadersCollectionController: ShadersCollectionController) {
		const firstInputType = this._expectedInputTypes()[0];
		switch (firstInputType) {
			case GlConnectionPointType.FLOAT: {
				return this._setLinesFloat(shadersCollectionController);
			}
			case GlConnectionPointType.SDF_CONTEXT: {
				return this._setLinesSDFContext(shadersCollectionController);
			}
		}
	}
	private _setLinesFloat(shadersCollectionController: ShadersCollectionController) {
		const sdf0 = ThreeToGl.float(this.variableForInput(InputName.SDF0));
		const sdf1 = ThreeToGl.float(this.variableForInput(InputName.SDF1));

		const float = this.glVarName(OUTPUT_NAME);

		if (isBooleanTrue(this.pv.smooth)) {
			const smoothFactor = ThreeToGl.vector2(this.variableForInputParam(this.p.smoothFactor));
			const bodyLine = `float ${float} = opSmoothIntersection(${sdf0}, ${sdf1}, ${smoothFactor})`;
			shadersCollectionController.addBodyLines(this, [bodyLine]);
		} else {
			const bodyLine = `float ${float} = opIntersection(${sdf0}, ${sdf1})`;
			shadersCollectionController.addBodyLines(this, [bodyLine]);
		}

		shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, SDFMethods)]);
	}
	private _setLinesSDFContext(shadersCollectionController: ShadersCollectionController) {
		const sdf0 = ThreeToGl.float(this.variableForInput(InputName.SDF0));
		const sdf1 = ThreeToGl.float(this.variableForInput(InputName.SDF1));

		const sdfContext = this.glVarName(OUTPUT_NAME);
		const matId = `${sdf0}.d < ${sdf1}.d ? ${sdf0}.matId : ${sdf1}.matId`;
		if (isBooleanTrue(this.pv.smooth)) {
			const smoothFactor = ThreeToGl.vector2(this.variableForInputParam(this.p.smoothFactor));
			const bodyLine = `SDFContext ${sdfContext} = SDFContext(opSmoothIntersection(${sdf0}.d, ${sdf1}.d, ${smoothFactor}), ${matId})`;
			shadersCollectionController.addBodyLines(this, [bodyLine]);
		} else {
			const bodyLine = `SDFContext ${sdfContext} = SDFContext(opIntersection(${sdf0}.d, ${sdf1}.d), ${matId})`;
			shadersCollectionController.addBodyLines(this, [bodyLine]);
		}

		shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, SDFMethods)]);
	}
}
