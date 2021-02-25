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
import {
	TextureDisplacementMapController,
	TextureDisplacementMapParamConfig,
} from './utils/TextureDisplacementMapController';
import {WireframeController, WireframeParamConfig} from './utils/WireframeController';
import {FogController, FogParamConfig} from './utils/FogController';
import {DefaultFolderParamConfig} from './utils/DefaultFolder';
import {TexturesFolderParamConfig} from './utils/TexturesFolder';
import {AdvancedFolderParamConfig} from './utils/AdvancedFolder';
import {Constructor} from '../../../types/GlobalTypes';

export const SHADER_DEFAULTS = {
	metalness: 1,
	roughness: 0.5,
};

export function MeshStandardParamConfigMixin<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param metalness. It's recommended to either set this value to 0 or to 1, as objects are either metallic or not. Any value in between tends to look like an alien plastic */
		metalness = ParamConfig.FLOAT(SHADER_DEFAULTS.metalness);
		/** @param roughness. When set to 0, reflections from environment maps will be very sharp, or blurred when 1. Any value between 0 and 1 can help modulate this. */
		roughness = ParamConfig.FLOAT(SHADER_DEFAULTS.roughness);
	};
}

class MeshStandardMatParamsConfig extends FogParamConfig(
	SkinningParamConfig(
		WireframeParamConfig(
			DepthParamConfig(
				SideParamConfig(
					/* advanced */
					AdvancedFolderParamConfig(
						MeshStandardParamConfigMixin(
							TextureDisplacementMapParamConfig(
								TextureEnvMapParamConfig(
									TextureAlphaMapParamConfig(
										TextureMapParamConfig(
											/* textures */
											TexturesFolderParamConfig(
												ColorParamConfig(DefaultFolderParamConfig(NodeParamsConfig))
											)
										)
									)
								)
							)
						)
					)
				)
			)
		)
	)
) {}
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

	createMaterial() {
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
	readonly texture_displacement_map_controller: TextureDisplacementMapController = new TextureDisplacementMapController(
		this,
		{
			direct_params: true,
		}
	);
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
		FogController.update(this);
		this.texture_map_controller.update();
		this.texture_alpha_map_controller.update();
		this.texture_env_map_controller.update();
		this.texture_displacement_map_controller.update();

		if (this._material) {
			this._material.roughness = this.pv.roughness;
			this._material.metalness = this.pv.metalness;
		}
		this.depth_controller.update();
		WireframeController.update(this);

		this.set_material(this.material);
	}
}
