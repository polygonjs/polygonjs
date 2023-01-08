import {ParamConfig} from '../../engine/nodes/utils/params/ParamsConfig';
import {Constructor} from '../../types/GlobalTypes';
import {DefaultOperationParams} from '../operations/_Base';
import {TypedNodePathParamValue} from '../Walker';
import {NodeContext} from '../../engine/poly/NodeContext';
import {CopType} from '../../engine/poly/registers/nodes/types/Cop';

export interface LightProbeParams extends DefaultOperationParams {
	cubeMap: TypedNodePathParamValue;
	intensity: number;
	name: string;
}

export const DEFAULT_LIGHT_PROBE_PARAMS: LightProbeParams = {
	cubeMap: new TypedNodePathParamValue(''),
	intensity: 1,
	name: 'lightProbe',
};
const DEFAULT = DEFAULT_LIGHT_PROBE_PARAMS;

export function LightProbeParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param cubeMap */
		cubeMap = ParamConfig.NODE_PATH('', {
			nodeSelection: {
				context: NodeContext.COP,
				types: [CopType.CUBE],
			},
		});
		/** @param light intensity */
		intensity = ParamConfig.FLOAT(DEFAULT.intensity, {
			range: [0, 2],
			rangeLocked: [true, false],
		});
		/** @param light name */
		name = ParamConfig.STRING('`$OS`');
	};
}
