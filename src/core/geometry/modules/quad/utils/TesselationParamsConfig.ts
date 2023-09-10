import {ParamConfig} from '../../../../../engine/nodes/utils/params/ParamsConfig';
import {BaseNodeType} from '../../../../../engine/nodes/_Base';
import {Constructor} from '../../../../../types/GlobalTypes';

export function SOPQUADTesselationParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param triangles */
		triangles = ParamConfig.BOOLEAN(true);
		/** @param wireframe */
		wireframe = ParamConfig.BOOLEAN(false);
	};
}

export function OBJQUADTesselationParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param wireframe */
		QUADTriangles = ParamConfig.BOOLEAN(true);
		/** @param wireframe */
		QUADWireframe = ParamConfig.BOOLEAN(false);
	};
}

export const TESSELATION_PARAM_NAMES = new Set<string>(['QUADTriangles', 'QUADWireframe']);

export function addQUADTesselationParamsCallback(node: BaseNodeType, callback: () => void) {
	node.params.onParamsCreated('QUADtesselationParamsHooks', () => {
		const params = node.params.all;
		for (let param of params) {
			if (TESSELATION_PARAM_NAMES.has(param.name())) {
				param.options.setOption('callback', callback);
			}
		}
	});
}
