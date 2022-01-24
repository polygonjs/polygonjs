/**
 * vector cross product
 *
 *
 */

import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPoint, GlConnectionPointType} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';

const OUTPUT_NAME = 'cross';

class CrossGlParamsConfig extends NodeParamsConfig {
	x = ParamConfig.VECTOR3([0, 0, 1]);
	y = ParamConfig.VECTOR3([0, 1, 0]);
}
const ParamsConfig = new CrossGlParamsConfig();
export class CrossGlNode extends TypedGlNode<CrossGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'cross';
	}

	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.VEC3),
		]);
	}

	override setLines(shaders_collection_controller: ShadersCollectionController) {
		const x = ThreeToGl.float(this.variableForInputParam(this.p.x));
		const y = ThreeToGl.float(this.variableForInputParam(this.p.y));

		const result = this.glVarName(OUTPUT_NAME);
		const body_line = `vec3 ${result} = cross(${x}, ${y})`;
		shaders_collection_controller.addBodyLines(this, [body_line]);
	}
}
