/**
 * Creates a Mesh Basic Material
 *
 * @remarks
 * This material only emits a color and does not react to light. It is therefore the less resource intensive material.
 *
 */

import {MeshBasicMaterial} from 'three/src/materials/MeshBasicMaterial';
import {FrontSide} from 'three/src/constants';
import {TypedMatNode} from './_Base';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ColorsController, ColorParamConfig} from './utils/ColorsController';
import {FogController, FogParamConfig} from './utils/FogController';
import {SideController, SideParamConfig} from './utils/SideController';
import {DepthController, DepthParamConfig} from './utils/DepthController';
import {SkinningController, SkinningParamConfig} from './utils/SkinningController';
import {TextureMapController, TextureMapParamConfig} from './utils/TextureMapController';
import {TextureAlphaMapController, TextureAlphaMapParamConfig} from './utils/TextureAlphaMapController';
import {WireframeController, WireframeParamConfig} from './utils/WireframeController';
import {DefaultFolderParamConfig} from './utils/DefaultFolder';
import {TexturesFolderParamConfig} from './utils/TexturesFolder';
import {AdvancedFolderParamConfig} from './utils/AdvancedFolder';

class MeshBasicMatParamsConfig extends FogParamConfig(
	SkinningParamConfig(
		WireframeParamConfig(
			DepthParamConfig(
				SideParamConfig(
					/* advanced */
					AdvancedFolderParamConfig(
						TextureAlphaMapParamConfig(
							TextureMapParamConfig(
								/* textures */
								TexturesFolderParamConfig(ColorParamConfig(DefaultFolderParamConfig(NodeParamsConfig)))
							)
						)
					)
				)
			)
		)
	)
) {}
const ParamsConfig = new MeshBasicMatParamsConfig();

export class MeshBasicMatNode extends TypedMatNode<MeshBasicMaterial, MeshBasicMatParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'meshBasic';
	}

	createMaterial() {
		return new MeshBasicMaterial({
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
		FogController.update(this);
		this.texture_map_controller.update();
		this.texture_alpha_map_controller.update();
		this.depth_controller.update();
		WireframeController.update(this);

		this.set_material(this.material);
	}
}
