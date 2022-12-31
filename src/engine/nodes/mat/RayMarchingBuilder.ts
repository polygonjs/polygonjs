/**
 * Creates a RayMarching, which can be extended with GL nodes.
 *
 *
 */
import {BaseBuilderParamConfig, TypedBuilderMatNode} from './_BaseBuilder';
import {ShaderAssemblerRayMarching} from '../gl/code/assemblers/materials/RayMarching';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	RayMarchingController,
	RayMarchingMainParamConfig,
	RayMarchingEnvMapParamConfig,
	RayMarchingDebugParamConfig,
} from './utils/RayMarchingController';
import {AssemblerName} from '../../poly/registers/assemblers/_BaseRegister';
import {Poly} from '../../Poly';
import {CustomMaterialName, ShaderMaterialWithCustomMaterials} from '../../../core/geometry/Material';
import {DefaultFolderParamConfig} from './utils/DefaultFolder';
import {TexturesFolderParamConfig} from './utils/TexturesFolder';
import {AdvancedFolderParamConfig} from './utils/AdvancedFolder';
import {Constructor} from '../../../types/GlobalTypes';
import {updateMaterialSide} from './utils/helpers/MaterialSideHelper';
import {
	CustomMaterialRayMarchingParamConfig,
	materialRayMarchingAssemblerCustomMaterialRequested,
} from './utils/customMaterials/CustomMaterialRayMarching';

export function AdvancedCommonParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param defines if the material is double sided or not */
		doubleSided = ParamConfig.BOOLEAN(0, {
			separatorBefore: true,
		});
		/** @param if the material is not double sided, it can be front sided, or back sided */
		front = ParamConfig.BOOLEAN(0, {
			visibleIf: {doubleSided: false},
		});
	};
}
class RayMarchingBuilderMatParamsConfig extends RayMarchingDebugParamConfig(
	CustomMaterialRayMarchingParamConfig(
		AdvancedCommonParamConfig(
			BaseBuilderParamConfig(
				AdvancedFolderParamConfig(
					RayMarchingEnvMapParamConfig(
						TexturesFolderParamConfig(
							RayMarchingMainParamConfig(DefaultFolderParamConfig(NodeParamsConfig))
						)
					)
				)
			)
		)
	)
) {}
const ParamsConfig = new RayMarchingBuilderMatParamsConfig();

export class RayMarchingBuilderMatNode extends TypedBuilderMatNode<
	ShaderMaterialWithCustomMaterials,
	ShaderAssemblerRayMarching,
	RayMarchingBuilderMatParamsConfig
> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'rayMarchingBuilder';
	}
	public override usedAssembler(): Readonly<AssemblerName.GL_RAYMARCHING> {
		return AssemblerName.GL_RAYMARCHING;
	}
	protected _createAssemblerController() {
		return Poly.assemblersRegister.assembler(this, this.usedAssembler());
	}
	public override customMaterialRequested(customName: CustomMaterialName): boolean {
		return materialRayMarchingAssemblerCustomMaterialRequested(this, customName);
	}

	private _rayMarchingController = new RayMarchingController(this);

	override initializeNode() {}
	override async cook() {
		this._material = this._material || this.createMaterial();
		this._rayMarchingController.updateUniformsFromParams(this._material);

		this.compileIfRequired(this._material);

		updateMaterialSide(this._material, this.pv);
		this.setMaterial(this._material);
	}
}
