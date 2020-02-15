import {NoColors} from 'three/src/constants';
import {MeshLambertMaterial} from 'three/src/materials/MeshLambertMaterial';
import {FrontSide} from 'three/src/constants';
import {TypedMatNode} from './_Base';

import {NodeParamsConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
import {ColorsController, ColorParamConfig} from './utils/ColorsController';
import {SideController, SideParamConfig} from './utils/SideController';
import {SkinningController, SkinningParamConfig} from './utils/SkinningController';
import {TextureMapController, TextureMapParamConfig} from './utils/TextureMapController';
import {TextureAlphaMapController, TextureAlphaMapParamConfig} from './utils/TextureAlphaMap';
class MeshLambertMatParamsConfig extends TextureAlphaMapParamConfig(
	TextureMapParamConfig(SkinningParamConfig(SideParamConfig(ColorParamConfig(NodeParamsConfig))))
) {}
const ParamsConfig = new MeshLambertMatParamsConfig();

export class MeshLambertMatNode extends TypedMatNode<MeshLambertMaterial, MeshLambertMatParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'mesh_lambert';
	}

	create_material() {
		return new MeshLambertMaterial({
			vertexColors: NoColors,
			side: FrontSide,
			color: 0xffffff,
			opacity: 1,
		});
	}

	async cook() {
		ColorsController.update(this);
		SideController.update(this);
		SkinningController.update(this);
		await TextureMapController.update(this);
		await TextureAlphaMapController.update(this);

		this.set_material(this.material);
	}
}
