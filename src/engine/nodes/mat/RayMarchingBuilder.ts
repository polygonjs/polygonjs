/**
 * Creates a RayMarching, which can be extended with GL nodes.
 *
 *
 */
import {BaseBuilderParamConfig, TypedBuilderMatNode} from './_BaseBuilder';
import {ShaderAssemblerRayMarching} from '../gl/code/assemblers/materials/RayMarching';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {RayMarchingController, RayMarchingParamConfig} from './utils/RayMarchingController';
import {AssemblerName} from '../../poly/registers/assemblers/_BaseRegister';
import {Poly} from '../../Poly';
import {ShaderMaterialWithCustomMaterials} from '../../../core/geometry/Material';
import {DefaultFolderParamConfig} from './utils/DefaultFolder';
import {AdvancedFolderParamConfig} from './utils/AdvancedFolder';
import {Constructor} from '../../../types/GlobalTypes';
import {updateMaterialSide} from './utils/helpers/MaterialSideHelper';
// import {
// 	CustomMaterialRayMarchingParamConfig,
// 	materialRayMarchingAssemblerCustomMaterialRequested,
// } from './utils/customMaterials/CustomMaterialRayMarching';

export function AdvancedCommonParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param defines if the material is double sided or not */
		doubleSided = ParamConfig.BOOLEAN(0, {
			separatorBefore: true,
		});
		/** @param if the material is not double sided, it can be front sided, or back sided */
		front = ParamConfig.BOOLEAN(1, {
			visibleIf: {doubleSided: false},
		});
	};
}
class RayMarchingBuilderMatParamsConfig extends AdvancedCommonParamConfig(
	BaseBuilderParamConfig(
		AdvancedFolderParamConfig(RayMarchingParamConfig(DefaultFolderParamConfig(NodeParamsConfig)))
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
	// public override customMaterialRequested(customName: CustomMaterialName): boolean {
	// 	return materialRayMarchingAssemblerCustomMaterialRequested(this, customName);
	// }

	private _rayMarchingController = new RayMarchingController(this);

	override initializeNode() {}
	override async cook() {
		this._rayMarchingController.updateUniformsFromParams();

		this.compileIfRequired();

		updateMaterialSide(this.material, this.pv);
		this.setMaterial(this.material);
	}
}
