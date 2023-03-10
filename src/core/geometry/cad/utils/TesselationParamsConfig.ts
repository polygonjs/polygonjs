import {ParamConfig} from '../../../../engine/nodes/utils/params/ParamsConfig';
import {BaseNodeType} from '../../../../engine/nodes/_Base';
import {Constructor, Number3} from '../../../../types/GlobalTypes';

const DEFAULT = {
	edgesColor: [0.1, 0.7, 0.2] as Number3,
};

export function SOPCADTesselationParamConfig<TBase extends Constructor>(Base: TBase) {
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
		edgesColor = ParamConfig.COLOR(DEFAULT.edgesColor);
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

export function OBJCADTesselationParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param linear Tolerance */
		CADLinearTolerance = ParamConfig.FLOAT(0.1, {
			range: [0.001, 1],
			rangeLocked: [true, false],
		});
		/** @param angular Tolerance */
		CADAngularTolerance = ParamConfig.FLOAT(0.1, {
			range: [0.001, 1],
			rangeLocked: [true, false],
		});
		/** @param curve Abscissa */
		CADCurveAbscissa = ParamConfig.FLOAT(0.1, {
			range: [0.001, 1],
			rangeLocked: [true, false],
		});
		/** @param curve Tolerance */
		CADCurveTolerance = ParamConfig.FLOAT(0.1, {
			range: [0.001, 1],
			rangeLocked: [true, false],
		});
		/** @param display edges */
		CADDisplayEdges = ParamConfig.BOOLEAN(true, {
			separatorBefore: true,
		});
		/** @param edges color */
		CADEdgesColor = ParamConfig.COLOR(DEFAULT.edgesColor);
		/** @param display meshes */
		CADDisplayMeshes = ParamConfig.BOOLEAN(true);
		/** @param meshes color */
		CADMeshesColor = ParamConfig.COLOR([1, 1, 1], {
			visibleIf: {
				CADDisplayMeshes: true,
			},
		});
		/** @param wireframe */
		CADWireframe = ParamConfig.BOOLEAN(false, {
			visibleIf: {
				CADDisplayMeshes: true,
			},
		});
	};
}

export const TESSELATION_PARAM_NAMES = new Set<string>([
	'CADLinearTolerance',
	'CADAngularTolerance',
	'CADCurveAbscissa',
	'CADCurveTolerance',
	'CADDisplayEdges',
	'CADEdgesColor',
	'CADDisplayMeshes',
	'CADMeshesColor',
	'CADWireframe',
]);

export function addCADTesselationParamsCallback(node: BaseNodeType, callback: () => void) {
	node.params.onParamsCreated('CADtesselationParamsHooks', () => {
		const params = node.params.all;
		for (let param of params) {
			if (TESSELATION_PARAM_NAMES.has(param.name())) {
				param.options.setOption('callback', callback);
			}
		}
	});
}
