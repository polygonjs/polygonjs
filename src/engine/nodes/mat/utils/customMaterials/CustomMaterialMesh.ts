import {Material} from 'three';
import {TypeAssert} from '../../../../poly/Assert';
import {NodeParamsConfig} from '../../../utils/params/ParamsConfig';
import {CustomMaterialName} from '../../../../../core/geometry/Material';
import {Constructor} from '../../../../../types/GlobalTypes';
import {ParamConfig} from '../../../utils/params/ParamsConfig';
import {BaseBuilderParamConfig} from '../../_BaseBuilder';
import {isBooleanTrue} from '../../../../../core/Type';
import {TypedMatNode} from '../../_Base';
import {CUSTOM_MAT_PARAM_OPTIONS} from './_CustomMaterialBase';

export function CustomMaterialMeshParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle on to choose which customMaterials will be generated */
		overrideCustomMaterials = ParamConfig.BOOLEAN(0, {
			...CUSTOM_MAT_PARAM_OPTIONS,
			separatorBefore: true,
			separatorAfter: true,
		});
		/** @param distance material used for shadows from points lights */
		createCustomMatDistance = ParamConfig.BOOLEAN(1, {
			visibleIf: {overrideCustomMaterials: 1},
			...CUSTOM_MAT_PARAM_OPTIONS,
		});
		/** @param depth material used for shadows from spot lights and directional lights */
		createCustomMatDepth = ParamConfig.BOOLEAN(1, {
			visibleIf: {overrideCustomMaterials: 1},
			...CUSTOM_MAT_PARAM_OPTIONS,
		});
		/** @param depth DOF */
		createCustomMatDepthDOF = ParamConfig.BOOLEAN(1, {
			visibleIf: {overrideCustomMaterials: 1},
			...CUSTOM_MAT_PARAM_OPTIONS,
			separatorAfter: true,
		});
	};
}
class CustomMaterialMeshParamsConfig extends CustomMaterialMeshParamConfig(BaseBuilderParamConfig(NodeParamsConfig)) {}

abstract class CustomMaterialMatNode<M extends Material> extends TypedMatNode<M, CustomMaterialMeshParamsConfig> {}

export function materialMeshAssemblerCustomMaterialRequested(
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
			return isBooleanTrue(node.pv.createCustomMatDepthDOF);
		}
	}
	TypeAssert.unreachable(customName);
}
