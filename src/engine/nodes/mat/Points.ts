/**
 * Creates a Points Material
 *
 * @remarks
 * This material can be added to points.
 *
 */
import {Constructor} from '../../../types/GlobalTypes';
import {PointsMaterial} from 'three/src/materials/PointsMaterial';
import {FrontSide} from 'three/src/constants';
import {TypedMatNode} from './_Base';

import {ColorsController, ColorParamConfig} from './utils/ColorsController';
import {AdvancedCommonController, AdvancedCommonParamConfig} from './utils/AdvancedCommonController';
import {TextureMapController, MapParamConfig} from './utils/TextureMapController';
import {TextureAlphaMapController, AlphaMapParamConfig} from './utils/TextureAlphaMapController';

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
	advancedCommon: AdvancedCommonController;
	alphaMap: TextureAlphaMapController;
	map: TextureMapController;
}

export function PointsParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		size = ParamConfig.FLOAT(1);
		sizeAttenuation = ParamConfig.BOOLEAN(1);
	};
}

class PointsMatParamsConfig extends FogParamConfig(
	AdvancedCommonParamConfig(
		/* advanced */
		AdvancedFolderParamConfig(
			AlphaMapParamConfig(
				MapParamConfig(
					/* textures */
					TexturesFolderParamConfig(
						ColorParamConfig(PointsParamConfig(DefaultFolderParamConfig(NodeParamsConfig)))
					)
				)
			)
		)
	)
) {}
const ParamsConfig = new PointsMatParamsConfig();

export class PointsMatNode extends TypedMatNode<PointsMaterial, PointsMatParamsConfig> {
	paramsConfig = ParamsConfig;
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
		advancedCommon: new AdvancedCommonController(this),
		alphaMap: new TextureAlphaMapController(this, CONTROLLER_OPTIONS),
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

		this.material.size = this.pv.size;
		this.material.sizeAttenuation = isBooleanTrue(this.pv.sizeAttenuation);

		this.setMaterial(this.material);
	}
}
