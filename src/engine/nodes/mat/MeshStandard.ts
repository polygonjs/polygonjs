/**
 * Creates a Mesh Standard Material
 *
 * @remarks
 * This material needs lights to be visible.
 *
 */
import {MeshStandardMaterial} from 'three/src/materials/MeshStandardMaterial';
import {FrontSide} from 'three/src/constants';
import {TypedMatNode} from './_Base';

import {ParamConfig, NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ColorsController, ColorParamConfig} from './utils/ColorsController';
import {SideController, SideParamConfig} from './utils/SideController';
import {DepthController, DepthParamConfig} from './utils/DepthController';
import {SkinningController, SkinningParamConfig} from './utils/SkinningController';
import {TextureMapController, TextureMapParamConfig} from './utils/TextureMapController';
import {TextureAlphaMapController, TextureAlphaMapParamConfig} from './utils/TextureAlphaMapController';
import {TextureEnvMapController, TextureEnvMapParamConfig} from './utils/TextureEnvMapController';

export const SHADER_DEFAULTS = {
	metalness: 1,
	roughness: 0.5,
};

class MeshStandardMatParamsConfig extends TextureEnvMapParamConfig(
	TextureAlphaMapParamConfig(
		TextureMapParamConfig(
			SkinningParamConfig(DepthParamConfig(SideParamConfig(ColorParamConfig(NodeParamsConfig))))
		)
	)
) {
	metalness = ParamConfig.FLOAT(SHADER_DEFAULTS.metalness);
	roughness = ParamConfig.FLOAT(SHADER_DEFAULTS.roughness);
}
// TODO: add the following texture params:
// - aoMap+aoMapIntensity
// - bumpMap+bumpScale
// - displacementMap+displaycementScale+displacementBias
// - emissiveMap
// - envMap
// - lightMap
// - metalnessMap
// - normalMap
// - roughnessMap,
const ParamsConfig = new MeshStandardMatParamsConfig();

export class MeshStandardMatNode extends TypedMatNode<MeshStandardMaterial, MeshStandardMatParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'meshStandard';
	}

	create_material() {
		return new MeshStandardMaterial({
			vertexColors: false,
			side: FrontSide,
			color: 0xffffff,
			opacity: 1,
			metalness: 1,
			roughness: 0,
		});
	}

	readonly texture_map_controller: TextureMapController = new TextureMapController(this, {direct_params: true});
	readonly texture_alpha_map_controller: TextureAlphaMapController = new TextureAlphaMapController(this, {
		direct_params: true,
	});
	readonly texture_env_map_controller: TextureEnvMapController = new TextureEnvMapController(this, {
		direct_params: true,
	});
	readonly depth_controller: DepthController = new DepthController(this);
	initializeNode() {
		this.params.onParamsCreated('init controllers', () => {
			this.texture_map_controller.initializeNode();
			this.texture_alpha_map_controller.initializeNode();
			this.texture_env_map_controller.initializeNode();
		});
	}

	async cook() {
		ColorsController.update(this);
		SideController.update(this);
		SkinningController.update(this);
		this.texture_map_controller.update();
		this.texture_alpha_map_controller.update();
		this.texture_env_map_controller.update();

		if (this._material) {
			this._material.envMapIntensity = this.pv.envMapIntensity;
			this._material.roughness = this.pv.roughness;
			this._material.metalness = this.pv.metalness;
		}
		this.depth_controller.update();

		this.set_material(this.material);
	}
}
