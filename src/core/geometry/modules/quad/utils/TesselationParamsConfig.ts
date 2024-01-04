import {ParamConfig} from '../../../../../engine/nodes/utils/params/ParamsConfig';
import {BaseNodeType} from '../../../../../engine/nodes/_Base';
import {Constructor} from '../../../../../types/GlobalTypes';

export function SOPQUADTesselationParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param triangles */
		triangles = ParamConfig.BOOLEAN(true);
		/** @param wireframe */
		wireframe = ParamConfig.BOOLEAN(true, {
			separatorBefore: true,
		});
		/** @param unsharedEdges */
		unsharedEdges = ParamConfig.BOOLEAN(false, {
			visibleIf: {wireframe: true},
		});
		/** @param wireframe color */
		wireframeColor = ParamConfig.COLOR([0, 0, 0], {
			visibleIf: {wireframe: true},
		});
		/** @param center */
		center = ParamConfig.BOOLEAN(false, {
			separatorBefore: true,
		});
		/** @param innerRadius */
		innerRadius = ParamConfig.BOOLEAN(false, {
			visibleIf: {center: true},
		});
		/** @param outerRadius */
		outerRadius = ParamConfig.BOOLEAN(false, {
			visibleIf: {center: true},
		});
		/** @param edgeCenterVectors */
		edgeCenterVectors = ParamConfig.BOOLEAN(false, {
			visibleIf: {center: true},
		});
		/** @param split quads */
		splitQuads = ParamConfig.BOOLEAN(false, {
			separatorBefore: true,
			visibleIf: [{triangles: true}, {wireframe: true}],
		});
		/** @param pointAttributes */
		pointAttributes = ParamConfig.STRING('*', {
			visibleIf: [{triangles: true}],
		});
		/** @param primitiveAttributes */
		primitiveAttributes = ParamConfig.STRING('*');
	};
}

export function OBJQUADTesselationParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param wireframe */
		QUADTriangles = ParamConfig.BOOLEAN(true);
		/** @param wireframe */
		QUADWireframe = ParamConfig.BOOLEAN(true, {
			separatorBefore: true,
		});
		/** @param unsharedEdges */
		QUADUnsharedEdges = ParamConfig.BOOLEAN(false, {
			visibleIf: {wireframe: true},
		});
		/** @param wireframe color */
		QUADWireframeColor = ParamConfig.COLOR([0, 0, 0], {
			visibleIf: {QUADWireframe: true},
		});
		/** @param center */
		QUADCenter = ParamConfig.BOOLEAN(false, {
			separatorBefore: true,
		});
		/** @param QUADInnerRadius */
		QUADInnerRadius = ParamConfig.BOOLEAN(false, {
			visibleIf: {QUADCenter: true},
		});
		/** @param QUADOuterRadius */
		QUADOuterRadius = ParamConfig.BOOLEAN(false, {
			visibleIf: {QUADCenter: true},
		});
		/** @param QUADEdgeCenterVectors */
		QUADEdgeCenterVectors = ParamConfig.BOOLEAN(false, {
			visibleIf: {QUADCenter: true},
		});
		/** @param split quads */
		QUADSplitQuads = ParamConfig.BOOLEAN(false, {
			separatorBefore: true,
			visibleIf: [{QUADTriangles: true}, {QUADWireframe: true}],
		});
		/** @param pointAttributes */
		QUADPointAttributes = ParamConfig.STRING('*', {
			visibleIf: [{QUADTriangles: true}],
		});
		/** @param primitiveAttributes */
		QUADPrimitiveAttributes = ParamConfig.STRING('*');
	};
}

export const TESSELATION_PARAM_NAMES = new Set<string>(['QUADTriangles', 'QUADWireframe']);

export function addQUADTesselationParamsCallback(node: BaseNodeType, callback: () => void) {
	node.params.onParamsCreated('QUADtesselationParamsHooks', () => {
		const params = node.params.all;
		for (const param of params) {
			if (TESSELATION_PARAM_NAMES.has(param.name())) {
				param.options.setOption('callback', callback);
			}
		}
	});
}
