import {ParamConfig} from '../../../../engine/nodes/utils/params/ParamsConfig';
import {BaseNodeType} from '../../../../engine/nodes/_Base';
import {Constructor} from '../../../../types/GlobalTypes';

const DEFAULT = {
	scale: 1,
};
export function SOPTetTesselationParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param tet scale */
		scale = ParamConfig.FLOAT(DEFAULT.scale, {
			range: [0, 1],
			rangeLocked: [true, true],
		});
	};
}

export function OBJTetTesselationParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param linear Tolerance */
		TetScale = ParamConfig.FLOAT(DEFAULT.scale, {
			range: [0, 1],
			rangeLocked: [true, true],
		});
	};
}

export const TESSELATION_PARAM_NAMES = new Set<string>(['TetScale']);

export function addTetTesselationParamsCallback(node: BaseNodeType, callback: () => void) {
	node.params.onParamsCreated('TettesselationParamsHooks', () => {
		const params = node.params.all;
		for (let param of params) {
			if (TESSELATION_PARAM_NAMES.has(param.name())) {
				param.options.setOption('callback', callback);
			}
		}
	});
}
