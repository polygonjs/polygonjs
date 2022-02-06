import {ParamConfig} from '../../engine/nodes/utils/params/ParamsConfig';
import {Constructor, Number3} from '../../types/GlobalTypes';
import {ColorConversion} from '../Color';
import {DefaultOperationParams} from '../operations/_Base';
import {Color} from 'three/src/math/Color';

export interface AmbientLightParams extends DefaultOperationParams {
	color: Color;
	intensity: number;
}

export const DEFAULT_AMBIENT_LIGHT_PARAMS: AmbientLightParams = {
	color: new Color(1, 1, 1),
	intensity: 1,
};
const DEFAULT = DEFAULT_AMBIENT_LIGHT_PARAMS;

export function AmbientLightParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param sky color */
		color = ParamConfig.COLOR(DEFAULT.color.toArray() as Number3, {
			conversion: ColorConversion.SRGB_TO_LINEAR,
		});
		/** @param light intensity */
		intensity = ParamConfig.FLOAT(DEFAULT.intensity, {
			range: [0, 10],
			rangeLocked: [true, false],
		});
	};
}
