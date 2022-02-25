/**
 * Utility to transform the input uv into the uv to a tiled texture.
 *
 *
 *
 */

import TileUv from './gl/tileUv.glsl';
import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import {ParamConfig, NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {FunctionGLDefinition} from './utils/GLDefinition';

const OUTPUT_NAME = 'uv';
class TileUvGlParamsConfig extends NodeParamsConfig {
	uv = ParamConfig.VECTOR2([0, 0]);
	tile = ParamConfig.FLOAT(0, {
		range: [0, 64],
		rangeLocked: [true, false],
	});
	tilesCount = ParamConfig.VECTOR2([8, 8]);
}
const ParamsConfig = new TileUvGlParamsConfig();
export class TileUvGlNode extends TypedGlNode<TileUvGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'tileUv';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.VEC2),
		]);
	}

	override setLines(shaders_collection_controller: ShadersCollectionController) {
		const body_lines: string[] = [];

		shaders_collection_controller.addDefinitions(this, [new FunctionGLDefinition(this, TileUv)]);

		const uv = ThreeToGl.vector2(this.variableForInputParam(this.p.uv));
		const tile = ThreeToGl.float(this.variableForInputParam(this.p.tile));
		const tilesCount = ThreeToGl.vector2(this.variableForInputParam(this.p.tilesCount));

		const out = this.glVarName(OUTPUT_NAME);
		const args = [uv, tile, tilesCount].join(', ');
		body_lines.push(`vec2 ${out} = tileUv(${args})`);

		shaders_collection_controller.addBodyLines(this, body_lines);
	}
}
