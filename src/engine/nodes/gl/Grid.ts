/**
 * creates a grid pattern
 *
 */

import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import GRID from './gl/grid.glsl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {FunctionGLDefinition} from './utils/GLDefinition';
import {TypedGlNode} from './_Base';
import {isBooleanTrue} from '../../../core/Type';

const OUTPUT_NAME = 'grid';
class GridGlParamsConfig extends NodeParamsConfig {
	uv = ParamConfig.VECTOR2([0, 0]);
	lineWidth = ParamConfig.FLOAT(0.1, {
		range: [0, 1],
		rangeLocked: [false, false],
	});
	freq = ParamConfig.VECTOR2([1, 1]);
	freqMult = ParamConfig.FLOAT(1, {
		range: [0, 10],
		rangeLocked: [false, false],
	});
	filtered = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new GridGlParamsConfig();
export class GridGlNode extends TypedGlNode<GridGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'grid';
	}

	override initializeNode() {
		super.initializeNode();

		this.io.connection_points.spare_params.setInputlessParamNames(['filtered']);

		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.FLOAT),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const uv = ThreeToGl.vector2(this.variableForInputParam(this.p.uv));
		const lineWidth = ThreeToGl.float(this.variableForInputParam(this.p.lineWidth));
		const freq = ThreeToGl.vector2(this.variableForInputParam(this.p.freq));
		const freqMult = ThreeToGl.float(this.variableForInputParam(this.p.freqMult));

		const coord = this.glVarName('coord');
		const float = this.glVarName(OUTPUT_NAME);
		const coordLine = `vec2 ${coord} = ${uv}*${freq}*${freqMult}`;
		const functionCall = isBooleanTrue(this.pv.filtered)
			? `gridTextureGradBox(${coord}, ${lineWidth}, dFdx(${coord}), dFdy(${coord}))`
			: `grid(${coord}, ${lineWidth})`;
		const bodyLine = `float ${float} = ${functionCall}`;
		shadersCollectionController.addBodyLines(this, [coordLine, bodyLine]);

		shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, GRID)]);
	}
}
