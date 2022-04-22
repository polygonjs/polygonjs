import {ParamConfig} from '../../engine/nodes/utils/params/ParamsConfig';
import {Constructor, Number3} from '../../types/GlobalTypes';
import {ColorConversion} from '../Color';
import {Vector3} from 'three';
import {DefaultOperationParams} from '../operations/_Base';
import {Color} from 'three';

export interface HemisphereLightParams extends DefaultOperationParams {
	skyColor: Color;
	groundColor: Color;
	intensity: number;
	position: Vector3;
}

export const DEFAULT_POINT_LIGHT_PARAMS: HemisphereLightParams = {
	skyColor: new Color(1, 1, 1),
	groundColor: new Color(0, 0, 0),
	intensity: 1,
	position: new Vector3(0, 0, 0),
};
const DEFAULT = DEFAULT_POINT_LIGHT_PARAMS;

export function HemisphereLightParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param sky color */
		skyColor = ParamConfig.COLOR(DEFAULT.skyColor.toArray() as Number3, {
			conversion: ColorConversion.SRGB_TO_LINEAR,
		});
		/** @param ground color */
		groundColor = ParamConfig.COLOR(DEFAULT.groundColor.toArray() as Number3, {
			conversion: ColorConversion.SRGB_TO_LINEAR,
		});
		/** @param light intensity */
		intensity = ParamConfig.FLOAT(DEFAULT.intensity, {
			range: [0, 10],
			rangeLocked: [true, false],
		});
		/** @param light position */
		position = ParamConfig.VECTOR3(DEFAULT.position.toArray() as Number3);
	};
}
