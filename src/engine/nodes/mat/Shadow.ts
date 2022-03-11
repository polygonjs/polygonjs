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

interface ShadowControllers {
	advancedCommon: AdvancedCommonController;
}

class ShadowMatParamsConfig extends AdvancedCommonParamConfig(ColorParamConfig(NodeParamsConfig)) {}
const ParamsConfig = new ShadowMatParamsConfig();

export class ShadowMatNode extends TypedMatNode<ShadowMaterial, ShadowMatParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'shadow';
	}

	override createMaterial() {
		return new ShadowMaterial({
			vertexColors: false,
			side: FrontSide,
			color: 0xffffff,
			opacity: 1,
		});
	}
	readonly controllers: ShadowControllers = {
		advancedCommon: new AdvancedCommonController(this),
	};
	private controllerNames = Object.keys(this.controllers) as Array<keyof ShadowControllers>;

	override initializeNode() {
		this.params.onParamsCreated('init controllers', () => {
			for (let controllerName of this.controllerNames) {
				this.controllers[controllerName].initializeNode();
			}
		});
	}
	override async cook() {
		for (let controllerName of this.controllerNames) {
			this.controllers[controllerName].update();
		}
		ColorsController.update(this);

		this.setMaterial(this.material);
	}
}
