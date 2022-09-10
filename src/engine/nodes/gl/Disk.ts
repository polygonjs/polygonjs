/**
 * generates a disk
 *
 *
 * @remarks
 *
 * There are many uses to this node, but one of them is to gives a disk shape to points in a [mat/pointsBuilder](/docs/nodes/mat/pointsBuilder)
 *
 */

import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import DiskMethods from './gl/disk.glsl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {FunctionGLDefinition} from './utils/GLDefinition';

const OUTPUT_NAME = 'float';
class DiskGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR2([0, 0]);
	center = ParamConfig.VECTOR2([0, 0]);
	radius = ParamConfig.FLOAT(1);
	feather = ParamConfig.FLOAT(0.1);
}
const ParamsConfig = new DiskGlParamsConfig();
export class DiskGlNode extends TypedGlNode<DiskGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'disk';
	}

	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.FLOAT),
		]);
	}

	override setLines(shaders_collection_controller: ShadersCollectionController) {
		const position = ThreeToGl.vector2(this.variableForInputParam(this.p.position));
		const center = ThreeToGl.vector2(this.variableForInputParam(this.p.center));
		const radius = ThreeToGl.float(this.variableForInputParam(this.p.radius));
		const feather = ThreeToGl.float(this.variableForInputParam(this.p.feather));

		const float = this.glVarName(OUTPUT_NAME);
		const body_line = `float ${float} = disk2d(${position}, ${center}, ${radius}, ${feather})`;
		shaders_collection_controller.addBodyLines(this, [body_line]);

		shaders_collection_controller.addDefinitions(this, [new FunctionGLDefinition(this, DiskMethods)]);
	}
}
