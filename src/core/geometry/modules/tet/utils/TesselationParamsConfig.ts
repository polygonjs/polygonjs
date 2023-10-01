import {ParamConfig} from '../../../../../engine/nodes/utils/params/ParamsConfig';
import {BaseNodeType} from '../../../../../engine/nodes/_Base';
import {Constructor} from '../../../../../types/GlobalTypes';

export const DEFAULT = {
	scale: 1,
	displayOuterMesh: false,
	displayTetMesh: true,
	displayLines: false,
	displaySharedFaces: false,
	displayPoints: false,
	displayCenter: false,
	displaySphere: false,
};
export function SOPTetTesselationParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param tet scale */
		scale = ParamConfig.FLOAT(DEFAULT.scale, {
			range: [0, 1],
			rangeLocked: [true, true],
		});
		/** @param display outer mesh */
		displayOuterMesh = ParamConfig.BOOLEAN(DEFAULT.displayOuterMesh);
		/** @param display tet mesh */
		displayTetMesh = ParamConfig.BOOLEAN(DEFAULT.displayTetMesh);
		/** @param display lines */
		displayLines = ParamConfig.BOOLEAN(DEFAULT.displayLines);
		/** @param display shared faces */
		displaySharedFaces = ParamConfig.BOOLEAN(DEFAULT.displaySharedFaces);
		/** @param display points */
		displayPoints = ParamConfig.BOOLEAN(DEFAULT.displayCenter);
		/** @param display center */
		displayCenter = ParamConfig.BOOLEAN(DEFAULT.displayCenter);
		/** @param display sphere */
		displaySphere = ParamConfig.BOOLEAN(DEFAULT.displaySphere);
	};
}

export function OBJTetTesselationParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param tet scale */
		TetScale = ParamConfig.FLOAT(DEFAULT.scale, {
			range: [0, 1],
			rangeLocked: [true, true],
		});
		/** @param display outer mesh */
		TetDisplayOuterMesh = ParamConfig.BOOLEAN(DEFAULT.displayOuterMesh);
		/** @param display tet mesh */
		TetDisplayTetMesh = ParamConfig.BOOLEAN(DEFAULT.displayTetMesh);
		/** @param display lines */
		TetDisplayLines = ParamConfig.BOOLEAN(DEFAULT.displayLines);
		/** @param display lines */
		TetDisplaySharedFaces = ParamConfig.BOOLEAN(DEFAULT.displaySharedFaces);
		/** @param display points */
		TetDisplayPoints = ParamConfig.BOOLEAN(DEFAULT.displayPoints);
		/** @param display center */
		TetDisplayCenter = ParamConfig.BOOLEAN(DEFAULT.displayCenter);
		/** @param display sphere */
		TetDisplaySphere = ParamConfig.BOOLEAN(DEFAULT.displaySphere);
	};
}

export const TESSELATION_PARAM_NAMES = new Set<string>([
	'TetScale',
	'TetDisplayMesh',
	'TetDisplayLines',
	'TetDisplaySharedFaces',
	'TetDisplayPoints',
	'TetDisplayCenter',
	'TetDisplaySphere',
]);

export function addTetTesselationParamsCallback(node: BaseNodeType, callback: () => void) {
	node.params.onParamsCreated('TettesselationParamsHooks', () => {
		const params = node.params.all;
		for (const param of params) {
			if (TESSELATION_PARAM_NAMES.has(param.name())) {
				param.options.setOption('callback', callback);
			}
		}
	});
}
