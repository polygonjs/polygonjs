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
import {AdvancedCommonController, AdvancedCommonParamConfig} from './utils/AdvancedCommonController';

interface Controllers {
	advancedCommon: AdvancedCommonController;
}

class MeshBasicMatParamsConfig extends AdvancedCommonParamConfig(ColorParamConfig(NodeParamsConfig)) {}
const ParamsConfig = new MeshBasicMatParamsConfig();

// TODO: allow to add customDepthMaterial: https://stackoverflow.com/questions/43848330/three-js-shadows-cast-by-partially-transparent-mesh
// this may need a mat/custom_depth and for the sop/material to select which material property to assign it to on the object3D
export class ShadowMatNode extends TypedMatNode<ShadowMaterial, MeshBasicMatParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'shadow';
	}

	createMaterial() {
		return new ShadowMaterial({
			vertexColors: false,
			side: FrontSide,
			color: 0xffffff,
			opacity: 1,
		});
	}
	readonly controllers: Controllers = {
		advancedCommon: new AdvancedCommonController(this),
	};
	private controllerNames = Object.keys(this.controllers) as Array<keyof Controllers>;

	initializeNode() {
		this.params.onParamsCreated('init controllers', () => {
			for (let controllerName of this.controllerNames) {
				this.controllers[controllerName].initializeNode();
			}
		});
	}
	async cook() {
		for (let controllerName of this.controllerNames) {
			this.controllers[controllerName].update();
		}
		ColorsController.update(this);

		this.setMaterial(this.material);
	}
}
