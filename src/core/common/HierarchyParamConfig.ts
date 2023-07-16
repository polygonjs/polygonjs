import {ParamConfig} from '../../engine/nodes/utils/params/ParamsConfig';
import {Constructor} from '../../types/GlobalTypes';

export function HierarchyParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param group to apply this node to */
		group = ParamConfig.STRING('', {
			objectMask: true,
		});
	};
}

export function HierarchyWithApplyToChildrenParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param group to assign the material to */
		group = ParamConfig.STRING('', {
			objectMask: true,
		});
		/** @param sets if this node applies to the children */
		applyToChildren = ParamConfig.BOOLEAN(true, {separatorAfter: true});
	};
}
