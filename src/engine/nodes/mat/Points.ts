/**
 * Creates a Points Material
 *
 * @remarks
 * This material can be added to points.
 *
 */
import {PointsMaterial} from 'three';
import {FrontSide} from 'three';
import {PrimitiveMatNode} from './_Base';
import {ColorsController, ColorParamConfig, ColorsControllers} from './utils/ColorsController';
import {
	AdvancedCommonController,
	AdvancedCommonControllers,
	AdvancedCommonParamConfig,
} from './utils/AdvancedCommonController';
import {TextureMapController, MapParamConfig, TextureMapControllers} from './utils/TextureMapController';
import {
	TextureAlphaMapController,
	AlphaMapParamConfig,
	TextureAlphaMapControllers,
} from './utils/TextureAlphaMapController';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {FogParamConfig, UniformFogController, UniformFogControllers} from './utils/UniformsFogController';
import {DefaultFolderParamConfig} from './utils/DefaultFolder';
import {TexturesFolderParamConfig} from './utils/TexturesFolder';
import {AdvancedFolderParamConfig} from './utils/AdvancedFolder';
import {PointsSizeController, PointsParamConfig, PointsSizeControllers} from './utils/PointsSizeController';
import {MatType} from '../../poly/registers/nodes/types/Mat';
interface PointsControllers
	extends AdvancedCommonControllers,
		ColorsControllers,
		PointsSizeControllers,
		TextureAlphaMapControllers,
		TextureMapControllers,
		UniformFogControllers {}

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

export class PointsMatNode extends PrimitiveMatNode<PointsMaterial, PointsMatParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): MatType.POINTS {
		return MatType.POINTS;
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
		colors: new ColorsController(this),
		advancedCommon: new AdvancedCommonController(this),
		alphaMap: new TextureAlphaMapController(this),
		map: new TextureMapController(this),
		pointsSize: new PointsSizeController(this),
		uniformFog: new UniformFogController(this),
	};
	protected override controllersList = Object.values(this.controllers);

	override async cook() {
		this._material = this._material || this.createMaterial();
		await Promise.all(this.controllersPromises(this._material));

		this.setMaterial(this._material);
	}
}
