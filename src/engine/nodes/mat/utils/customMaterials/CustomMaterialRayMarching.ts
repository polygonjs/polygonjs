import {RAYMARCHING_UNIFORMS} from './../../../gl/gl/raymarching/uniforms';
import {Material} from 'three';
import {TypeAssert} from '../../../../poly/Assert';
import {NodeParamsConfig} from '../../../utils/params/ParamsConfig';
import {CustomMaterialName} from '../../../../../core/geometry/Material';
import {Constructor} from '../../../../../types/GlobalTypes';
import {ParamConfig} from '../../../utils/params/ParamsConfig';
import {BaseBuilderParamConfig} from '../../_BaseBuilder';
import {TypedMatNode} from '../../_Base';
import {isBooleanTrue} from '../../../../../core/Type';
import {CUSTOM_MAT_PARAM_OPTIONS} from './_CustomMaterialBase';

export function CustomMaterialRayMarchingParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle on to choose which customMaterials will be generated */
		overrideCustomMaterials = ParamConfig.BOOLEAN(0, {
			...CUSTOM_MAT_PARAM_OPTIONS,
			separatorBefore: true,
			separatorAfter: true,
		});
		/** @param creates a shadow material for point lights */
		createCustomMatDistance = ParamConfig.BOOLEAN(1, {
			visibleIf: {overrideCustomMaterials: 1},
			...CUSTOM_MAT_PARAM_OPTIONS,
		});
		/** @param min shadow depth for point lights */
		shadowDistanceMin = ParamConfig.FLOAT(RAYMARCHING_UNIFORMS.shadowDistanceMin.value, {
			range: [0, 100],
			rangeLocked: [true, false],
			step: 1,
			visibleIf: [{overrideCustomMaterials: 0}, {overrideCustomMaterials: 1, createCustomMatDistance: 1}],
		});
		/** @param max shadow depth for point lights */
		shadowDistanceMax = ParamConfig.FLOAT(RAYMARCHING_UNIFORMS.shadowDistanceMax.value, {
			range: [0, 100],
			rangeLocked: [true, false],
			step: 1,
			visibleIf: [{overrideCustomMaterials: 0}, {overrideCustomMaterials: 1, createCustomMatDistance: 1}],
		});
		/** @param creates a shadow material for spot lights and directional lights */
		createCustomMatDepth = ParamConfig.BOOLEAN(1, {
			visibleIf: {overrideCustomMaterials: 1},
			...CUSTOM_MAT_PARAM_OPTIONS,
		});
		/** @param min shadow depth for spot lights and directional lights */
		shadowDepthMin = ParamConfig.FLOAT(RAYMARCHING_UNIFORMS.shadowDepthMin.value, {
			range: [0, 100],
			rangeLocked: [true, false],
			step: 1,
			visibleIf: [{overrideCustomMaterials: 0}, {overrideCustomMaterials: 1, createCustomMatDepth: 1}],
		});
		/** @param max shadow depth for spot lights and directional lights */
		shadowDepthMax = ParamConfig.FLOAT(RAYMARCHING_UNIFORMS.shadowDepthMax.value, {
			range: [0, 100],
			rangeLocked: [true, false],
			step: 1,
			visibleIf: [{overrideCustomMaterials: 0}, {overrideCustomMaterials: 1, createCustomMatDepth: 1}],
		});
	};
}
class CustomMaterialRayMarchingParamsConfig extends CustomMaterialRayMarchingParamConfig(
	BaseBuilderParamConfig(NodeParamsConfig)
) {}

abstract class CustomMaterialMatNode<M extends Material> extends TypedMatNode<
	M,
	CustomMaterialRayMarchingParamsConfig
> {}

export function materialRayMarchingAssemblerCustomMaterialRequested(
	node: CustomMaterialMatNode<any>,
	customName: CustomMaterialName
): boolean {
	const param = node.p.overrideCustomMaterials;
	if (!param) {
		console.warn(`param overrideCustomMaterials not found on ${node.path()}, creating all customMaterials`);
		return true;
	}
	if (!isBooleanTrue(node.pv.overrideCustomMaterials)) {
		return true;
	}
	switch (customName) {
		case CustomMaterialName.DISTANCE: {
			return isBooleanTrue(node.pv.createCustomMatDistance);
		}
		case CustomMaterialName.DEPTH: {
			return isBooleanTrue(node.pv.createCustomMatDepth);
		}
		case CustomMaterialName.DEPTH_DOF: {
			return false; // isBooleanTrue(node.pv.createCustomMatDepthDOF);
		}
	}
	TypeAssert.unreachable(customName);
}
