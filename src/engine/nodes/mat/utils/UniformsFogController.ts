import {Constructor} from '../../../../types/GlobalTypes';
import {BaseController, MaterialTexturesRecord, SetParamsTextureNodesRecord} from './_BaseController';
import {TypedMatNode} from '../_Base';
import {
	PointsMaterial,
	ShaderMaterial,
	MeshStandardMaterial,
	MeshPhysicalMaterial,
	MeshPhongMaterial,
	MeshLambertMaterial,
	MeshBasicMaterial,
	Material,
} from 'three';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../../core/BooleanValue';

export interface UniformFogControllers {
	uniformFog: UniformFogController;
}
export function FogParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle on if you have a fog in the scene and the material should be affected by it */
		useFog = ParamConfig.BOOLEAN(0);
	};
}

class FogParamsConfig extends FogParamConfig(NodeParamsConfig) {}
type FoggableMaterial =
	| ShaderMaterial
	| PointsMaterial
	| MeshStandardMaterial
	| MeshPhysicalMaterial
	| MeshPhongMaterial
	| MeshLambertMaterial
	| MeshBasicMaterial;
function isValidFogMaterial(material?: Material): material is FoggableMaterial {
	if (!material) {
		return false;
	}
	return (material as PointsMaterial).fog != null;
}

abstract class FogMatNode extends TypedMatNode<FoggableMaterial, FogParamsConfig> {
	// createMaterial() {
	// 	return new Material();
	// }
	controllers!: UniformFogControllers;
}

export class UniformFogController extends BaseController {
	constructor(protected override node: FogMatNode) {
		super(node);
	}
	static async update(node: FogMatNode) {
		const material = await node.material();
		if (!isValidFogMaterial(material)) {
			return;
		}
		node.controllers.uniformFog.updateMaterial(material);
	}
	override updateMaterial(material: FoggableMaterial) {
		const pv = this.node.pv;
		material.fog = isBooleanTrue(pv.useFog);
	}
	override getTextures(material: FoggableMaterial, record: MaterialTexturesRecord) {}
	override setParamsFromMaterial(material: FoggableMaterial, record: SetParamsTextureNodesRecord) {
		this.node.p.useFog.set(material.fog);
	}
}
