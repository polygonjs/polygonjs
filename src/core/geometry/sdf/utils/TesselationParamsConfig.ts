import {ParamConfig} from '../../../../engine/nodes/utils/params/ParamsConfig';
import {BaseNodeType} from '../../../../engine/nodes/_Base';
import {Constructor} from '../../../../types/GlobalTypes';

const DEFAULT = {
	facetAngle: 45,
};
export function SOPSDFTesselationParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param linear Tolerance */
		facetAngle = ParamConfig.FLOAT(DEFAULT.facetAngle, {
			range: [0, 180],
			rangeLocked: [true, false],
		});
		/** @param meshes color */
		meshesColor = ParamConfig.COLOR([1, 1, 1]);
		/** @param wireframe */
		wireframe = ParamConfig.BOOLEAN(false);
	};
}

export function OBJSDFTesselationParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param linear Tolerance */
		SDFFacetAngle = ParamConfig.FLOAT(DEFAULT.facetAngle, {
			range: [0, 180],
			rangeLocked: [true, false],
		});

		/** @param meshes color */
		SDFMeshesColor = ParamConfig.COLOR([1, 1, 1]);
		/** @param wireframe */
		SDFWireframe = ParamConfig.BOOLEAN(false);
	};
}

export const TESSELATION_PARAM_NAMES = new Set<string>(['SDFFacetAngle', 'SDFMeshesColor', 'SDFWireframe']);

export function addSDFTesselationParamsCallback(node: BaseNodeType, callback: () => void) {
	node.params.onParamsCreated('SDFtesselationParamsHooks', () => {
		const params = node.params.all;
		for (let param of params) {
			if (TESSELATION_PARAM_NAMES.has(param.name())) {
				param.options.setOption('callback', callback);
			}
		}
	});
}
