import {Constructor} from '../../../../types/GlobalTypes';
import {
	Material,
	MeshLambertMaterial,
	MeshMatcapMaterial,
	MeshNormalMaterial,
	MeshPhongMaterial,
	MeshStandardMaterial,
} from 'three';
import {TypedMatNode} from '../_Base';
import {BaseController, SetParamsTextureNodesRecord} from './_BaseController';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';

export function FlatShadingParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param defines if the material is flat shaded */
		flatShading = ParamConfig.BOOLEAN(0, {
			separatorAfter: true,
		});
	};
}

class FlatShadingParamsConfig extends FlatShadingParamConfig(NodeParamsConfig) {}
export interface FlatShadingControllers {
	flatShading: FlatShadingController;
}
type FlatShadingControllerCurrentMaterial =
	| MeshLambertMaterial
	| MeshMatcapMaterial
	| MeshNormalMaterial
	| MeshPhongMaterial
	| MeshStandardMaterial;
function _isValidMaterial(material?: Material): material is FlatShadingControllerCurrentMaterial {
	if (!material) {
		return false;
	}
	return (material as MeshLambertMaterial).flatShading != null;
}

abstract class FlatShadingMapMatNode extends TypedMatNode<
	FlatShadingControllerCurrentMaterial,
	FlatShadingParamsConfig
> {
	controllers!: FlatShadingControllers;
	async material() {
		const container = await this.compute();
		return container.material() as FlatShadingControllerCurrentMaterial | undefined;
	}
}

export class FlatShadingController extends BaseController {
	constructor(protected override node: FlatShadingMapMatNode) {
		super(node);
	}

	static async update(node: FlatShadingMapMatNode) {
		const material = await node.material();
		if (!_isValidMaterial(material)) {
			return;
		}
		node.controllers.flatShading.updateMaterial(material);
	}
	override updateMaterial(material: FlatShadingControllerCurrentMaterial) {
		material.flatShading = this.node.pv.flatShading;
		// if (this._material.flatShading != isBooleanTrue(this.pv.flatShading)) {
		// 	this._material.flatShading = isBooleanTrue(this.pv.flatShading);
		// 	this._material.needsUpdate = true;
		// }
	}

	override setParamsFromMaterial(
		material: FlatShadingControllerCurrentMaterial,
		record: SetParamsTextureNodesRecord
	) {
		this.node.p.flatShading.set(material.flatShading);
	}
}
