import {NoColors} from 'three/src/constants';
import {MeshStandardMaterial} from 'three/src/materials/MeshStandardMaterial';
import {FrontSide} from 'three/src/constants';
import {TypedMatNode} from './_Base';

import {ParamConfig, NodeParamsConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
import {ColorsController, ColorParamConfig} from './utils/ColorsController';
import {SideController, SideParamConfig} from './utils/SideController';
import {SkinningController, SkinningParamConfig} from './utils/SkinningController';
import {TextureMapController, TextureMapParamConfig} from './utils/TextureMapController';
import {TextureAlphaMapController, TextureAlphaMapParamConfig} from './utils/TextureAlphaMapController';
import {TextureEnvMapController, TextureEnvMapParamConfig} from './utils/TextureEnvMapController';
class MeshStandardMatParamsConfig extends TextureEnvMapParamConfig(
	TextureAlphaMapParamConfig(
		TextureMapParamConfig(SkinningParamConfig(SideParamConfig(ColorParamConfig(NodeParamsConfig))))
	)
) {
	metalness = ParamConfig.FLOAT(1);
	roughness = ParamConfig.FLOAT(0);
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
		return 'mesh_standard';
	}

	create_material() {
		return new MeshStandardMaterial({
			vertexColors: NoColors,
			side: FrontSide,
			color: 0xffffff,
			opacity: 1,
			metalness: 1,
			roughness: 0,
		});
	}

	async cook() {
		ColorsController.update(this);
		SideController.update(this);
		SkinningController.update(this);
		await TextureMapController.update(this);
		await TextureAlphaMapController.update(this);
		await TextureEnvMapController.update(this);

		this._material.roughness = this.pv.roughness;
		this._material.metalness = this.pv.metalness;

		this.set_material(this._material);
	}
}
