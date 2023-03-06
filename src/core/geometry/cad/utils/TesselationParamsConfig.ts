import {ParamConfig} from '../../../../engine/nodes/utils/params/ParamsConfig';
import {BaseNodeType} from '../../../../engine/nodes/_Base';
import {Constructor} from '../../../../types/GlobalTypes';

export function TesselationParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param linear Tolerance */
		linearTolerance = ParamConfig.FLOAT(0.1, {
			range: [0.001, 1],
			rangeLocked: [true, false],
		});
		/** @param angular Tolerance */
		angularTolerance = ParamConfig.FLOAT(0.1, {
			range: [0.001, 1],
			rangeLocked: [true, false],
		});
		/** @param curve Abscissa */
		curveAbscissa = ParamConfig.FLOAT(0.1, {
			range: [0.001, 1],
			rangeLocked: [true, false],
		});
		/** @param curve Tolerance */
		curveTolerance = ParamConfig.FLOAT(0.1, {
			range: [0.001, 1],
			rangeLocked: [true, false],
		});
		/** @param display edges */
		displayEdges = ParamConfig.BOOLEAN(true, {
			separatorBefore: true,
		});
		/** @param edges color */
		edgesColor = ParamConfig.COLOR([0.1, 0.7, 0.2]);
		/** @param display meshes */
		displayMeshes = ParamConfig.BOOLEAN(true);
		/** @param meshes color */
		meshesColor = ParamConfig.COLOR([1, 1, 1], {
			visibleIf: {
				displayMeshes: true,
			},
		});
		/** @param wireframe */
		wireframe = ParamConfig.BOOLEAN(false, {
			visibleIf: {
				displayMeshes: true,
			},
		});
	};
}

export const TESSELATION_PARAM_NAMES = new Set<string>([
	'linearTolerance',
	'angularTolerance',
	'curveAbscissa',
	'curveTolerance',
	'displayEdges',
	'edgesColor',
	'displayMeshes',
	'meshesColor',
	'wireframe',
]);

export function addTesselationParamsCallback(node: BaseNodeType, callback: () => void) {
	node.params.onParamsCreated('tesselationParamsHooks', () => {
		const params = node.params.all;
		for (let param of params) {
			if (TESSELATION_PARAM_NAMES.has(param.name())) {
				param.options.setOption('callback', callback);
			}
		}
	});
}
