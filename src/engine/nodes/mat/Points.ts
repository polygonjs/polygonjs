import {PointsMaterial} from 'three/src/materials/PointsMaterial';
import {FrontSide} from 'three/src/constants';
import {TypedMatNode} from './_Base';

import {ColorsController, ColorParamConfig} from './utils/ColorsController';
import {SideController, SideParamConfig} from './utils/SideController';
import {DepthController, DepthParamConfig} from './utils/DepthController';
import {TextureMapController, TextureMapParamConfig} from './utils/TextureMapController';
import {TextureAlphaMapController, TextureAlphaMapParamConfig} from './utils/TextureAlphaMapController';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
export function PointsParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		size = ParamConfig.FLOAT(1);
		size_attenuation = ParamConfig.BOOLEAN(1);
	};
}

class PointsMatParamsConfig extends TextureAlphaMapParamConfig(
	TextureMapParamConfig(DepthParamConfig(SideParamConfig(ColorParamConfig(PointsParamConfig(NodeParamsConfig)))))
) {}
const ParamsConfig = new PointsMatParamsConfig();

export class PointsMatNode extends TypedMatNode<PointsMaterial, PointsMatParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'points';
	}

	create_material() {
		return new PointsMaterial({
			vertexColors: false,
			side: FrontSide,
			color: 0xffffff,
			opacity: 1,
		});
	}
	readonly texture_map_controller: TextureMapController = new TextureMapController(this, {direct_params: true});
	readonly texture_alpha_map_controller: TextureAlphaMapController = new TextureAlphaMapController(this, {
		direct_params: true,
	});
	readonly depth_controller: DepthController = new DepthController(this);
	initialize_node() {
		this.params.on_params_created('init controllers', () => {
			this.texture_map_controller.initialize_node();
			this.texture_alpha_map_controller.initialize_node();
		});
	}

	async cook() {
		ColorsController.update(this);
		SideController.update(this);
		this.texture_map_controller.update();
		this.texture_alpha_map_controller.update();
		this.depth_controller.update();

		this.material.size = this.pv.size;
		this.material.sizeAttenuation = this.pv.size_attenuation;

		this.set_material(this.material);
	}
}
