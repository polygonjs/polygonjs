// import {TypeAssert} from '../../../../poly/Assert';
// import {NodeParamsConfig} from '../../../utils/params/ParamsConfig';
// import {CustomMaterialName} from '../../../../../core/geometry/Material';
// import {Constructor} from '../../../../../types/GlobalTypes';
// import {ParamConfig} from '../../../utils/params/ParamsConfig';
// import {BaseBuilderParamConfig} from '../../_BaseBuilder';
// import {isBooleanTrue} from '../../../../../core/Type';
// import {Material} from 'three';
// import {TypedMatNode} from '../../_Base';

// export function CustomMaterialPointsParamConfig<TBase extends Constructor>(Base: TBase) {
// 	return class Mixin extends Base {
// 		/** @param toggle off to choose which customMaterials will be generated */
// 		overrideCustomMaterials = ParamConfig.BOOLEAN(0);
// 		/** @param distance */
// 		createCustomMatDistance = ParamConfig.BOOLEAN(1, {
// 			visibleIf: {overrideCustomMaterials: 1},
// 		});
// 		/** @param depth */
// 		createCustomMatDepth = ParamConfig.BOOLEAN(1, {
// 			visibleIf: {overrideCustomMaterials: 1},
// 		});
// 		/** @param depth DOF */
// 		createCustomMatDepthDOF = ParamConfig.BOOLEAN(1, {
// 			visibleIf: {overrideCustomMaterials: 1},
// 		});
// 	};
// }
// class CustomMaterialPointsParamsConfig extends CustomMaterialPointsParamConfig(
// 	BaseBuilderParamConfig(NodeParamsConfig)
// ) {}

// abstract class CustomMaterialMatNode<M extends Material> extends TypedMatNode<M, CustomMaterialPointsParamsConfig> {}

// export function materialPointsAssemblerCustomMaterialRequested(
// 	node: CustomMaterialMatNode<any>,
// 	customName: CustomMaterialName
// ): boolean {
// 	const param = node.p.overrideCustomMaterials;
// 	if (!param) {
// 		console.warn(`param overrideCustomMaterials not found on ${node.path()}, creating all customMaterials`);
// 		return true;
// 	}
// 	if (!isBooleanTrue(node.pv.overrideCustomMaterials)) {
// 		return true;
// 	}
// 	switch (customName) {
// 		case CustomMaterialName.DISTANCE: {
// 			return isBooleanTrue(node.pv.createCustomMatDistance);
// 		}
// 		case CustomMaterialName.DEPTH: {
// 			return isBooleanTrue(node.pv.createCustomMatDepth);
// 		}
// 		case CustomMaterialName.DEPTH_DOF: {
// 			return isBooleanTrue(node.pv.createCustomMatDepthDOF);
// 		}
// 	}
// 	TypeAssert.unreachable(customName);
// }
