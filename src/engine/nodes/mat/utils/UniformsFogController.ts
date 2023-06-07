import {Constructor} from '../../../../types/GlobalTypes';
import {BaseController, MaterialTexturesRecord, SetParamsTextureNodesRecord} from './_BaseController';
import {TypedMatNode} from '../_Base';
import type {
	PointsMaterial,
	ShaderMaterial,
	MeshStandardMaterial,
	MeshPhysicalMaterial,
	MeshPhongMaterial,
	MeshLambertMaterial,
	MeshBasicMaterial,
	MeshToonMaterial,
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

class FogUniformsParamsConfig extends FogParamConfig(NodeParamsConfig) {}
type FoggableUniformsMaterial =
	| ShaderMaterial
	| PointsMaterial
	| MeshStandardMaterial
	| MeshPhysicalMaterial
	| MeshPhongMaterial
	| MeshLambertMaterial
	| MeshBasicMaterial
	| MeshToonMaterial;
function isValidFogMaterial(material?: Material): material is FoggableUniformsMaterial {
	if (!material) {
		return false;
	}
	return (material as PointsMaterial).fog != null;
}

abstract class FogUniformsMatNode extends TypedMatNode<FoggableUniformsMaterial, FogUniformsParamsConfig> {
	// createMaterial() {
	// 	return new Material();
	// }
	controllers!: UniformFogControllers;
}

export class UniformFogController extends BaseController {
	constructor(protected override node: FogUniformsMatNode) {
		super(node);
	}
	static async update(node: FogUniformsMatNode) {
		const material = await node.material();
		if (!isValidFogMaterial(material)) {
			return;
		}
		node.controllers.uniformFog.updateMaterial(material);
	}
	override updateMaterial(material: FoggableUniformsMaterial) {
		const pv = this.node.pv;
		material.fog = isBooleanTrue(pv.useFog);
	}
	override getTextures(material: FoggableUniformsMaterial, record: MaterialTexturesRecord) {}
	override setParamsFromMaterial(material: FoggableUniformsMaterial, record: SetParamsTextureNodesRecord) {
		this.node.p.useFog.set(material.fog);
	}
}
