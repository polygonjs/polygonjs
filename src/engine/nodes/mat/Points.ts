import {NoColors} from 'three/src/constants';
import {PointsMaterial} from 'three/src/materials/PointsMaterial';
import {FrontSide} from 'three/src/constants';
import {TypedMatNode} from './_Base';

import {ColorsController, ColorParamConfig} from './utils/ColorsController';
import {SideController, SideParamConfig} from './utils/SideController';
// import {TextureMapController, TextureMapParamConfig} from './utils/TextureMapController';
// import {TextureAlphaMapController, TextureAlphaMapParamConfig} from './utils/TextureAlphaMapController';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
export function PointsParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		size = ParamConfig.FLOAT(1);
		size_attenuation = ParamConfig.BOOLEAN(1);
	};
}

class PointsMatParamsConfig extends SideParamConfig(ColorParamConfig(PointsParamConfig(NodeParamsConfig))) {}
const ParamsConfig = new PointsMatParamsConfig();

export class PointsMatNode extends TypedMatNode<PointsMaterial, PointsMatParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'points';
	}

	create_material() {
		return new PointsMaterial({
			vertexColors: NoColors,
			side: FrontSide,
			color: 0xffffff,
			opacity: 1,
		});
	}

	async cook() {
		ColorsController.update(this);
		SideController.update(this);
		// await TextureMapController.update(this);
		// await TextureAlphaMapController.update(this);

		this.material.size = this.pv.size;
		this.material.sizeAttenuation = this.pv.size_attenuation;

		this.set_material(this.material);
	}
}
