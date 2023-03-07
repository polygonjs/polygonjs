import {ParamConfig} from '../../../../engine/nodes/utils/params/ParamsConfig';
import {BaseNodeType} from '../../../../engine/nodes/_Base';
import {Constructor, Number3} from '../../../../types/GlobalTypes';

const DEFAULT = {
	facetAngle: 45,
	linesColor: [0.4, 0.1, 0.6] as Number3,
};
export function SOPCSGTesselationParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param linear Tolerance */
		facetAngle = ParamConfig.FLOAT(DEFAULT.facetAngle, {
			range: [0, 180],
			rangeLocked: [true, false],
		});
		/** @param edges color */
		linesColor = ParamConfig.COLOR(DEFAULT.linesColor);
		/** @param meshes color */
		meshesColor = ParamConfig.COLOR([1, 1, 1]);
		/** @param wireframe */
		wireframe = ParamConfig.BOOLEAN(false);
	};
}

export function OBJCSGTesselationParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param linear Tolerance */
		CSGFacetAngle = ParamConfig.FLOAT(DEFAULT.facetAngle, {
			range: [0, 180],
			rangeLocked: [true, false],
		});
		/** @param edges color */
		CSGLinesColor = ParamConfig.COLOR(DEFAULT.linesColor);
		/** @param meshes color */
		CSGMeshesColor = ParamConfig.COLOR([1, 1, 1]);
		/** @param wireframe */
		CSGWireframe = ParamConfig.BOOLEAN(false);
	};
}

export const TESSELATION_PARAM_NAMES = new Set<string>([
	'CSGFacetAngle',
	'CSGLinesColor',
	'CSGMeshesColor',
	'CSGWireframe',
]);

export function addCSGTesselationParamsCallback(node: BaseNodeType, callback: () => void) {
	node.params.onParamsCreated('CSGtesselationParamsHooks', () => {
		const params = node.params.all;
		for (let param of params) {
			if (TESSELATION_PARAM_NAMES.has(param.name())) {
				param.options.setOption('callback', callback);
			}
		}
	});
}
