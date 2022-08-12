import {RayMarchingUniforms, RAYMARCHING_UNIFORMS} from './../../gl/gl/raymarching/uniforms';
import {Constructor} from '../../../../types/GlobalTypes';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {TypedMatNode} from '../_Base';
import {Material} from 'three';

import {ShaderMaterialWithCustomMaterials} from '../../../../core/geometry/Material';

export function RayMarchingParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param maximum number of steps the raymarcher will run */
		maxSteps = ParamConfig.INTEGER(RAYMARCHING_UNIFORMS.MAX_STEPS.value, {
			range: [1, 1024],
			rangeLocked: [true, false],
		});
		/** @param maximum distance the raymarcher will step through */
		maxDist = ParamConfig.FLOAT(RAYMARCHING_UNIFORMS.MAX_DIST.value, {
			range: [1, 100],
			rangeLocked: [true, false],
		});
		/** @param when the ray reaches this distance from a surface it will stop marching. You can lower this value to increase the precision of the raymarcher */
		surfDist = ParamConfig.FLOAT(RAYMARCHING_UNIFORMS.SURF_DIST.value, {
			range: [0, 1],
			rangeLocked: [true, false],
			step: 0.0000001,
		});
	};
}
class RayMarchingMaterial extends Material {}
class RayMarchingParamsConfig extends RayMarchingParamConfig(NodeParamsConfig) {}

abstract class RayMarchingMatNode extends TypedMatNode<RayMarchingMaterial, RayMarchingParamsConfig> {}

// const worldPos = new Vector3();

export class RayMarchingController {
	constructor(protected node: RayMarchingMatNode) {}

	updateUniformsFromParams() {
		const shaderMaterial = this.node.material as ShaderMaterialWithCustomMaterials;
		const uniforms = shaderMaterial.uniforms as unknown as RayMarchingUniforms | undefined;
		if (!uniforms) {
			return;
		}

		uniforms.MAX_STEPS.value = this.node.pv.maxSteps;
		uniforms.MAX_DIST.value = this.node.pv.maxDist;
		uniforms.SURF_DIST.value = this.node.pv.surfDist;
	}
}
