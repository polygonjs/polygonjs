/**
 * Creates a RayMarching, which can be extended with GL nodes.
 *
 *
 */
import {BaseBuilderParamConfig, TypedBuilderMatNode} from './_BaseBuilder';
import {ShaderAssemblerRayMarching} from '../gl/code/assemblers/materials/RayMarching';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {RayMarchingController, RayMarchingParamConfig} from './utils/RayMarchingController';
import {AssemblerName} from '../../poly/registers/assemblers/_BaseRegister';
import {Poly} from '../../Poly';
import {ShaderMaterialWithCustomMaterials} from '../../../core/geometry/Material';
class RayMarchingBuilderMatParamsConfig extends BaseBuilderParamConfig(RayMarchingParamConfig(NodeParamsConfig)) {}
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

	private _rayMarchingController = new RayMarchingController(this);

	override initializeNode() {}
	override async cook() {
		this._rayMarchingController.updateUniformsFromParams();

		this.compileIfRequired();

		this.setMaterial(this.material);
	}
}
