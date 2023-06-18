import {ParamConfig} from '../../../../engine/nodes/utils/params/ParamsConfig';
import {BaseNodeType} from '../../../../engine/nodes/_Base';
import {Constructor} from '../../../../types/GlobalTypes';

const DEFAULT = {
	scale: 1,
	displayMesh: true,
	displayLines: false,
	displaySharedFaces: false,
};
export function SOPTetTesselationParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param tet scale */
		scale = ParamConfig.FLOAT(DEFAULT.scale, {
			range: [0, 1],
			rangeLocked: [true, true],
		});
		/** @param display mesh */
		displayMesh = ParamConfig.BOOLEAN(DEFAULT.displayMesh);
		/** @param display lines */
		displayLines = ParamConfig.BOOLEAN(DEFAULT.displayLines);
		/** @param display lines */
		displaySharedFaces = ParamConfig.BOOLEAN(DEFAULT.displaySharedFaces);
	};
}

export function OBJTetTesselationParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param tet scale */
		TetScale = ParamConfig.FLOAT(DEFAULT.scale, {
			range: [0, 1],
			rangeLocked: [true, true],
		});
		/** @param display mesh */
		TetDisplayMesh = ParamConfig.BOOLEAN(DEFAULT.displayMesh);
		/** @param display lines */
		TetDisplayLines = ParamConfig.BOOLEAN(DEFAULT.displayLines);
		/** @param display lines */
		TetDisplaySharedFaces = ParamConfig.BOOLEAN(DEFAULT.displaySharedFaces);
	};
}

export const TESSELATION_PARAM_NAMES = new Set<string>([
	'TetScale',
	'TetDisplayMesh',
	'TetDisplayLines',
	'TetDisplaySharedFaces',
]);

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
