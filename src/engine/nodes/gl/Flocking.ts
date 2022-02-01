/**
 * ImportorUV is an experimental node that helps creating importors, which are displaying a render of a higher resolution render onto different tiles of a texture
 *
 *
 *
 */

import Flocking from './gl/flocking.glsl';
import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import {ParamConfig, NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {FunctionGLDefinition} from './utils/GLDefinition';

const OUTPUT_NAME = 'force';
class FlockingGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0]);
	velocity = ParamConfig.VECTOR3([0, 0, 0]);
	minDist = ParamConfig.FLOAT(1);
	maxDist = ParamConfig.FLOAT(10);
}
const ParamsConfig = new FlockingGlParamsConfig();
export class FlockingGlNode extends TypedGlNode<FlockingGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'flocking';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.VEC3),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const bodyLines: string[] = [];

		shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, Flocking)]);

		const position = ThreeToGl.vector3(this.variableForInputParam(this.p.position));
		const velocity = ThreeToGl.vector3(this.variableForInputParam(this.p.velocity));
		const minDist = ThreeToGl.vector3(this.variableForInputParam(this.p.minDist));
		const maxDist = ThreeToGl.vector2(this.variableForInputParam(this.p.maxDist));

		// TODO:
		// - work out better math so that repulse/attract functions
		// - link position and vel textures in the function (vel may not yet be needed)
		// - how could I just have repulse?
		// - ensure that in the for loop the number of particles is known so that we don't look up non existing ones
		// - this node should probably be only available in particles
		const out = this.glVarName(OUTPUT_NAME);
		const args = ['texture_position', 'texture_velocity', position, velocity, minDist, maxDist].join(', ');
		bodyLines.push(`vec3 ${out} = flocking(${args})`);

		shadersCollectionController.addBodyLines(this, bodyLines);
	}
}
