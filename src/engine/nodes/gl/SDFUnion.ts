/**
 * Union of 2 SDFs
 *
 * @remarks
 *
 * based on [https://iquilezles.org/www/articles/distfunctions/distfunctions.htm](https://iquilezles.org/www/articles/distfunctions/distfunctions.htm)
 */

import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import SDFMethods from './gl/sdf.glsl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {FunctionGLDefinition} from './utils/GLDefinition';
import {isBooleanTrue} from '../../../core/Type';

const OUTPUT_NAME = 'union';
class SphereGlParamsConfig extends NodeParamsConfig {
	sdf0 = ParamConfig.FLOAT(0);
	sdf1 = ParamConfig.FLOAT(0);
	smooth = ParamConfig.BOOLEAN(0);
	smoothFactor = ParamConfig.FLOAT(0, {
		visibleIf: {smooth: 1},
	});
}
const ParamsConfig = new SphereGlParamsConfig();
export class SDFUnionGlNode extends TypedGlNode<SphereGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDFUnion';
	}

	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.FLOAT),
		]);
	}

	override setLines(shaders_collection_controller: ShadersCollectionController) {
		const sdf0 = ThreeToGl.vector2(this.variableForInputParam(this.p.sdf0));
		const sdf1 = ThreeToGl.vector2(this.variableForInputParam(this.p.sdf1));

		const float = this.glVarName(OUTPUT_NAME);

		if (isBooleanTrue(this.pv.smooth)) {
			const smoothFactor = ThreeToGl.vector2(this.variableForInputParam(this.p.smoothFactor));
			const body_line = `float ${float} = opSmoothUnion(${sdf0}, ${sdf1}, ${smoothFactor})`;
			shaders_collection_controller.addBodyLines(this, [body_line]);
		} else {
			const body_line = `float ${float} = opUnion(${sdf0}, ${sdf1})`;
			shaders_collection_controller.addBodyLines(this, [body_line]);
		}

		shaders_collection_controller.addDefinitions(this, [new FunctionGLDefinition(this, SDFMethods)]);
	}
}