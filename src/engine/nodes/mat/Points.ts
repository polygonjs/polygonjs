/**
 * Creates a Points Material
 *
 * @remarks
 * This material only emits a color and does not react to light. It is therefore the less resource intensive material.
 *
 */
import {Constructor} from '../../../types/GlobalTypes';
import {PointsMaterial} from 'three/src/materials/PointsMaterial';
import {FrontSide} from 'three/src/constants';
import {TypedMatNode} from './_Base';

import {ColorsController, ColorParamConfig} from './utils/ColorsController';
import {SideController, SideParamConfig} from './utils/SideController';
import {DepthController, DepthParamConfig} from './utils/DepthController';
import {TextureMapController, TextureMapParamConfig} from './utils/TextureMapController';
import {TextureAlphaMapController, TextureAlphaMapParamConfig} from './utils/TextureAlphaMapController';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {FogParamConfig, FogController} from './utils/UniformsFogController';
import {DefaultFolderParamConfig} from './utils/DefaultFolder';
import {TexturesFolderParamConfig} from './utils/TexturesFolder';
import {AdvancedFolderParamConfig} from './utils/AdvancedFolder';

const CONTROLLER_OPTIONS = {
	directParams: true,
};
interface Controllers {
	alphaMap: TextureAlphaMapController;
	depth: DepthController;
	map: TextureMapController;
}

export function PointsParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		size = ParamConfig.FLOAT(1);
		sizeAttenuation = ParamConfig.BOOLEAN(1);
	};
}

class PointsMatParamsConfig extends FogParamConfig(
	DepthParamConfig(
		SideParamConfig(
			/* advanced */
			AdvancedFolderParamConfig(
				TextureAlphaMapParamConfig(
					TextureMapParamConfig(
						/* textures */
						TexturesFolderParamConfig(
							ColorParamConfig(PointsParamConfig(DefaultFolderParamConfig(NodeParamsConfig)))
						)
					)
				)
			)
		)
	)
) {}
const ParamsConfig = new PointsMatParamsConfig();

export class PointsMatNode extends TypedMatNode<PointsMaterial, PointsMatParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'points';
	}

	createMaterial() {
		return new PointsMaterial({
			vertexColors: false,
			side: FrontSide,
			color: 0xffffff,
			opacity: 1,
		});
	}
	readonly controllers: Controllers = {
		alphaMap: new TextureAlphaMapController(this, CONTROLLER_OPTIONS),
		depth: new DepthController(this),
		map: new TextureMapController(this, CONTROLLER_OPTIONS),
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
		FogController.update(this);
		SideController.update(this);

		this.material.size = this.pv.size;
		this.material.sizeAttenuation = isBooleanTrue(this.pv.sizeAttenuation);

		this.setMaterial(this.material);
	}
}
