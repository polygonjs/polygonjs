import {ParamConfig} from '../../../../../engine/nodes/utils/params/ParamsConfig';
import {BaseNodeType} from '../../../../../engine/nodes/_Base';
import {Constructor} from '../../../../../types/GlobalTypes';

export function SOPQUADTesselationParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param triangles */
		triangles = ParamConfig.BOOLEAN(true);
		/** @param split quads */
		splitQuads = ParamConfig.BOOLEAN(false, {
			visibleIf: [{triangles: true}],
		});
		/** @param wireframe */
		wireframe = ParamConfig.BOOLEAN(true, {
			separatorBefore: true,
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
		/** @param pointAttributes */
		pointAttributes = ParamConfig.STRING('*', {
			separatorBefore: true,
			visibleIf: [{triangles: true}],
		});
		/** @param primitiveAttributes */
		primitiveAttributes = ParamConfig.STRING('*', {
			visibleIf: [{triangles: true}, {center: true}],
		});
	};
}

export function OBJQUADTesselationParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param wireframe */
		QUADTriangles = ParamConfig.BOOLEAN(true);
		/** @param split quads */
		QUADSplitQuads = ParamConfig.BOOLEAN(false, {
			visibleIf: [{QUADTriangles: true}],
		});
		/** @param wireframe */
		QUADWireframe = ParamConfig.BOOLEAN(true, {
			separatorBefore: true,
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
		/** @param pointAttributes */
		QUADPointAttributes = ParamConfig.STRING('*', {
			separatorBefore: true,
			visibleIf: [{QUADTriangles: true}],
		});
		/** @param primitiveAttributes */
		QUADPrimitiveAttributes = ParamConfig.STRING('*', {
			visibleIf: [{QUADTriangles: true}, {QUADCenter: true}],
		});
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
