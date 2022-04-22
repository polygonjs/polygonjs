/**
 * Creates a Points Material
 *
 * @remarks
 * This material can be added to points.
 *
 */
import {PointsMaterial} from 'three';
import {FrontSide} from 'three';
import {TypedMatNode} from './_Base';
import {ColorsController, ColorParamConfig} from './utils/ColorsController';
import {AdvancedCommonController, AdvancedCommonParamConfig} from './utils/AdvancedCommonController';
import {TextureMapController, MapParamConfig} from './utils/TextureMapController';
import {TextureAlphaMapController, AlphaMapParamConfig} from './utils/TextureAlphaMapController';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {FogParamConfig, FogController} from './utils/UniformsFogController';
import {DefaultFolderParamConfig} from './utils/DefaultFolder';
import {TexturesFolderParamConfig} from './utils/TexturesFolder';
import {AdvancedFolderParamConfig} from './utils/AdvancedFolder';
import {PointsSizeController, PointsParamConfig} from './utils/PointsSizeController';
interface PointsControllers {
	advancedCommon: AdvancedCommonController;
	alphaMap: TextureAlphaMapController;
	map: TextureMapController;
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
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'points';
	}

	override createMaterial() {
		return new PointsMaterial({
			vertexColors: false,
			side: FrontSide,
			color: 0xffffff,
			opacity: 1,
		});
	}
	readonly controllers: PointsControllers = {
		advancedCommon: new AdvancedCommonController(this),
		alphaMap: new TextureAlphaMapController(this),
		map: new TextureMapController(this),
	};
	private controllerNames = Object.keys(this.controllers) as Array<keyof PointsControllers>;

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
		FogController.update(this);
		PointsSizeController.update(this);

		this.setMaterial(this.material);
	}
}
