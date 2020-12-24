/**
 * Creates a Shadow Material
 *
 *
 */
import {ShadowMaterial} from 'three/src/materials/ShadowMaterial';
import {FrontSide} from 'three/src/constants';
import {TypedMatNode} from './_Base';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ColorsController, ColorParamConfig} from './utils/ColorsController';
import {SideController, SideParamConfig} from './utils/SideController';
class MeshBasicMatParamsConfig extends SideParamConfig(ColorParamConfig(NodeParamsConfig)) {}
const ParamsConfig = new MeshBasicMatParamsConfig();

// TODO: allow to add customDepthMaterial: https://stackoverflow.com/questions/43848330/three-js-shadows-cast-by-partially-transparent-mesh
// this may need a mat/custom_depth and for the sop/material to select which material property to assign it to on the object3D
export class ShadowMatNode extends TypedMatNode<ShadowMaterial, MeshBasicMatParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'shadow';
	}

	create_material() {
		return new ShadowMaterial({
			vertexColors: false,
			side: FrontSide,
			color: 0xffffff,
			opacity: 1,
		});
	}
	initialize_node() {}
	async cook() {
		ColorsController.update(this);
		SideController.update(this);

		this.set_material(this.material);
	}
}
