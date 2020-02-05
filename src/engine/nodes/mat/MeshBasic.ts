import {NoColors} from 'three/src/constants';
import {MeshBasicMaterial} from 'three/src/materials/MeshBasicMaterial';
import {FrontSide} from 'three/src/constants';
import {TypedMatNode} from './_Base';

import {NodeParamsConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
import {ColorsController, ColorParamConfig} from './utils/ColorsController';
import {SideController, SideParamConfig} from './utils/SideController';
import {SkinningController, SkinningParamConfig} from './utils/SkinningController';
import {TextureMapController, TextureMapParamConfig} from './utils/TextureMapController';
import {TextureAlphaMapController, TextureAlphaMapParamConfig} from './utils/TextureAlphaMap';
class MeshBasicMatParamsConfig extends TextureAlphaMapParamConfig(
	TextureMapParamConfig(SkinningParamConfig(SideParamConfig(ColorParamConfig(NodeParamsConfig))))
) {}
const ParamsConfig = new MeshBasicMatParamsConfig();

export class MeshBasicMatNode extends TypedMatNode<MeshBasicMaterial, MeshBasicMatParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'mesh_basic';
	}

	create_material() {
		return new MeshBasicMaterial({
			vertexColors: NoColors,
			side: FrontSide,
			color: 0xffffff,
			opacity: 0.5,
		});
	}

	async cook() {
		ColorsController.update(this);
		SideController.update(this);
		SkinningController.update(this);
		await TextureMapController.update(this);
		await TextureAlphaMapController.update(this);

		this.set_material(this._material);
	}
}
