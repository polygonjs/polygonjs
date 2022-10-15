import {TypeAssert} from './../../../poly/Assert';
import {RayMarchingUniforms, RAYMARCHING_UNIFORMS} from './../../gl/gl/raymarching/uniforms';
import {Constructor} from '../../../../types/GlobalTypes';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {TypedMatNode} from '../_Base';
import {Material} from 'three';
import {ShaderMaterialWithCustomMaterials} from '../../../../core/geometry/Material';
import {isBooleanTrue} from '../../../../core/Type';
import {CustomMaterialRayMarchingParamConfig} from './customMaterials/CustomMaterialRayMarching';

enum RayMarchingDebugMode {
	STEPS_COUNT = 'Steps Count',
	DEPTH = 'Depth',
}
const RAYMARCHING_DEBUG_MODES: RayMarchingDebugMode[] = [RayMarchingDebugMode.STEPS_COUNT, RayMarchingDebugMode.DEPTH];
const DEBUG_STEPS_COUNT = RAYMARCHING_DEBUG_MODES.indexOf(RayMarchingDebugMode.STEPS_COUNT);
// const DEBUG_DEPTH = RAYMARCHING_DEBUG_MODES.indexOf(RayMarchingDebugMode.DEPTH);

export function RayMarchingParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param maximum number of steps the raymarcher will run */
		maxSteps = ParamConfig.INTEGER(RAYMARCHING_UNIFORMS.MAX_STEPS.value, {
			range: [1, 128],
			rangeLocked: [true, false],
		});
		/** @param maximum distance the raymarcher will step through */
		maxDist = ParamConfig.FLOAT(RAYMARCHING_UNIFORMS.MAX_DIST.value, {
			range: [1, 100],
			rangeLocked: [true, false],
		});
		/** @param when the ray reaches this distance from a surface it will stop marching. You can lower this value to increase the precision of the raymarcher */
		surfDist = ParamConfig.FLOAT(RAYMARCHING_UNIFORMS.SURF_DIST.value, {
			range: [0, 0.1],
			rangeLocked: [true, false],
			step: 0.0000001,
		});
		/** @param precision for normals computation */
		normalsBias = ParamConfig.FLOAT(RAYMARCHING_UNIFORMS.NORMALS_BIAS.value, {
			range: [0, 0.1],
			rangeLocked: [true, false],
			step: 0.0000001,
		});
		/** @param center */
		center = ParamConfig.VECTOR3(RAYMARCHING_UNIFORMS.CENTER.value.toArray());
	};
}
export function RayMarchingDebugParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param debug mode */
		debug = ParamConfig.BOOLEAN(0, {
			separatorBefore: true,
		});
		/** @param outputs color showing the number of steps required to solve the raymarching */
		debugMode = ParamConfig.INTEGER(DEBUG_STEPS_COUNT, {
			menu: {entries: RAYMARCHING_DEBUG_MODES.map((name, value) => ({name, value}))},
			visibleIf: {debug: true},
		});
		/** @param min steps count */
		debugMinSteps = ParamConfig.FLOAT(RAYMARCHING_UNIFORMS.debugMinSteps.value, {
			range: [0, 128],
			rangeLocked: [true, false],
			step: 1,
			// visibleIf: {debug: true, debugMode: DEBUG_STEPS_COUNT},
		});
		/** @param max steps count */
		debugMaxSteps = ParamConfig.FLOAT(RAYMARCHING_UNIFORMS.debugMaxSteps.value, {
			range: [0, 128],
			rangeLocked: [true, false],
			step: 1,
			// visibleIf: {debug: true, debugMode: DEBUG_STEPS_COUNT},
		});
		/** @param min depth */
		debugMinDepth = ParamConfig.FLOAT(RAYMARCHING_UNIFORMS.debugMinDepth.value, {
			range: [0, 128],
			rangeLocked: [true, false],
			step: 1,
			// visibleIf: {debug: true, debugMode: DEBUG_DEPTH},
		});
		/** @param max depth */
		debugMaxDepth = ParamConfig.FLOAT(RAYMARCHING_UNIFORMS.debugMaxDepth.value, {
			range: [0, 128],
			rangeLocked: [true, false],
			step: 1,
			// visibleIf: {debug: true, debugMode: DEBUG_DEPTH},
		});
	};
}
class RayMarchingMaterial extends Material {}
class RayMarchingParamsConfig extends CustomMaterialRayMarchingParamConfig(
	RayMarchingDebugParamConfig(RayMarchingParamConfig(NodeParamsConfig))
) {}

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
		const pv = this.node.pv;

		uniforms.MAX_STEPS.value = pv.maxSteps;
		uniforms.MAX_DIST.value = pv.maxDist;
		uniforms.SURF_DIST.value = pv.surfDist;
		uniforms.NORMALS_BIAS.value = pv.normalsBias;
		uniforms.CENTER.value.copy(pv.center);

		uniforms.shadowDepthMin.value = pv.shadowDepthMin;
		uniforms.shadowDepthMax.value = pv.shadowDepthMax;
		uniforms.shadowDistanceMin.value = pv.shadowDistanceMin;
		uniforms.shadowDistanceMax.value = pv.shadowDistanceMax;

		if (isBooleanTrue(pv.debug)) {
			function updateDebugMode(uniforms: RayMarchingUniforms) {
				const debugMode = RAYMARCHING_DEBUG_MODES[pv.debugMode];
				switch (debugMode) {
					case RayMarchingDebugMode.STEPS_COUNT: {
						uniforms.debugMinSteps.value = pv.debugMinSteps;
						uniforms.debugMaxSteps.value = pv.debugMaxSteps;
						shaderMaterial.defines['DEBUG_STEPS_COUNT'] = 1;
						delete shaderMaterial.defines['DEBUG_DEPTH'];
						shaderMaterial.needsUpdate = true;
						return;
					}
					case RayMarchingDebugMode.DEPTH: {
						uniforms.debugMinDepth.value = pv.debugMinDepth;
						uniforms.debugMaxDepth.value = pv.debugMaxDepth;
						shaderMaterial.defines['DEBUG_DEPTH'] = 1;
						delete shaderMaterial.defines['DEBUG_STEPS_COUNT'];
						shaderMaterial.needsUpdate = true;
						return;
					}
				}
				TypeAssert.unreachable(debugMode);
			}
			updateDebugMode(uniforms);
		} else {
			if (shaderMaterial.defines['DEBUG_STEPS_COUNT'] != null) {
				delete shaderMaterial.defines['DEBUG_STEPS_COUNT'];
				shaderMaterial.needsUpdate = true;
			}
			if (shaderMaterial.defines['DEBUG_DEPTH'] != null) {
				delete shaderMaterial.defines['DEBUG_DEPTH'];
				shaderMaterial.needsUpdate = true;
			}
		}
	}
}
