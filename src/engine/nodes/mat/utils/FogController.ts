import type {Material, ShaderMaterial} from 'three';
import {Constructor} from '../../../../types/GlobalTypes';
import {BaseController} from './_BaseController';
import {TypedMatNode} from '../_Base';
import {
	MeshPhysicalMaterial,
	MeshToonMaterial,
	MeshStandardMaterial,
	MeshPhongMaterial,
	MeshMatcapMaterial,
	MeshLambertMaterial,
	MeshBasicMaterial,
} from 'three';

import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../../core/BooleanValue';

export interface FogControllers {
	fog: FogController;
}

export function FogParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle on if you have a fog in the scene and the material should be affected by it */
		useFog = ParamConfig.BOOLEAN(0);
	};
}
type FoggableMaterial =
	| ShaderMaterial
	| MeshToonMaterial
	| MeshStandardMaterial
	| MeshPhysicalMaterial
	| MeshPhongMaterial
	| MeshMatcapMaterial
	| MeshLambertMaterial
	| MeshBasicMaterial;
export function isValidMaterial(material?: Material): material is FoggableMaterial {
	if (!material) {
		return false;
	}
	return (material as MeshBasicMaterial).fog != null;
}
class FogParamsConfig extends FogParamConfig(NodeParamsConfig) {}
abstract class FogMatNode extends TypedMatNode<FoggableMaterial, FogParamsConfig> {
	controllers!: FogControllers;
	async material() {
		const container = await this.compute();
		return container.material() as FoggableMaterial | undefined;
	}
}

export class FogController extends BaseController {
	constructor(protected override node: FogMatNode) {
		super(node);
	}
	static async update(node: FogMatNode) {
		const container = await node.compute();
		const material = container.material();
		if (!isValidMaterial(material)) {
			return;
		}
		node.controllers.fog.updateMaterial(material);
	}
	override updateMaterial(material: FoggableMaterial) {
		const pv = this.node.pv;
		material.fog = isBooleanTrue(pv.useFog);
	}
}
