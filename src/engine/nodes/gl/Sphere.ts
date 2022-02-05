/**
 * the function of a sphere
 *
 *
 *
 */

import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import DiskMethods from './gl/disk.glsl';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {FunctionGLDefinition} from './utils/GLDefinition';

const OUTPUT_NAME_VALUE = 'value';
const OUTPUT_NAME_GRADIENT = 'gradient';
class SphereGlParamsConfig extends NodeParamsConfig {
	position = ParamConfig.VECTOR3([0, 0, 0]);
	center = ParamConfig.VECTOR3([0, 0, 0]);
	radius = ParamConfig.FLOAT(1);
	feather = ParamConfig.FLOAT(0.1);
}
const ParamsConfig = new SphereGlParamsConfig();
export class SphereGlNode extends TypedGlNode<SphereGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'sphere';
	}

	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME_VALUE, GlConnectionPointType.FLOAT),
			new GlConnectionPoint(OUTPUT_NAME_GRADIENT, GlConnectionPointType.VEC3),
		]);
	}

	override setLines(shaders_collection_controller: ShadersCollectionController) {
		const position = ThreeToGl.vector2(this.variableForInputParam(this.p.position));
		const center = ThreeToGl.vector2(this.variableForInputParam(this.p.center));
		const radius = ThreeToGl.float(this.variableForInputParam(this.p.radius));
		const feather = ThreeToGl.float(this.variableForInputParam(this.p.feather));

		const value = this.glVarName(OUTPUT_NAME_VALUE);
		const gradient = this.glVarName(OUTPUT_NAME_GRADIENT);
		const bodyLineValue = `float ${value} = disk3d(${position}, ${center}, ${radius}, ${feather})`;
		const bodyLineGradient = `vec3 ${gradient} = ${value}*(${position}-${center})`;
		shaders_collection_controller.addBodyLines(this, [bodyLineValue, bodyLineGradient]);

		shaders_collection_controller.addDefinitions(this, [new FunctionGLDefinition(this, DiskMethods)]);
	}
}
