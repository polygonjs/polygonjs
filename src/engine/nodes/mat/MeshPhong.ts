/**
 * Creates a Mesh Phong Material
 *
 * @remarks
 * This material needs lights to be visible. While not as photorealistic as the MeshStandardMaterial, it is very cheap to process.
 *
 */
import {MeshPhongMaterial} from 'three/src/materials/MeshPhongMaterial';
import {FrontSide} from 'three/src/constants';
import {TypedMatNode} from './_Base';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ColorsController, ColorParamConfig} from './utils/ColorsController';
import {SideController, SideParamConfig} from './utils/SideController';
import {DepthController, DepthParamConfig} from './utils/DepthController';
import {SkinningController, SkinningParamConfig} from './utils/SkinningController';
import {TextureMapController, TextureMapParamConfig} from './utils/TextureMapController';
import {TextureAlphaMapController, TextureAlphaMapParamConfig} from './utils/TextureAlphaMapController';
class MeshPhongMatParamsConfig extends TextureAlphaMapParamConfig(
	TextureMapParamConfig(SkinningParamConfig(DepthParamConfig(SideParamConfig(ColorParamConfig(NodeParamsConfig)))))
) {
	flatShading = ParamConfig.BOOLEAN(0);
}
const ParamsConfig = new MeshPhongMatParamsConfig();

export class MeshPhongMatNode extends TypedMatNode<MeshPhongMaterial, MeshPhongMatParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'meshPhong';
	}

	create_material() {
		return new MeshPhongMaterial({
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
	initializeNode() {
		this.params.onParamsCreated('init controllers', () => {
			this.texture_map_controller.initializeNode();
			this.texture_alpha_map_controller.initializeNode();
		});
	}
	async cook() {
		ColorsController.update(this);
		SideController.update(this);
		SkinningController.update(this);
		this.texture_map_controller.update();
		this.texture_alpha_map_controller.update();

		if (this.material.flatShading != this.pv.flatShading) {
			this.material.flatShading = this.pv.flatShading;
			this.material.needsUpdate = true;
		}
		this.depth_controller.update();

		this.set_material(this.material);
	}
}
