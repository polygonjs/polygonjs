import {Constructor} from '../../../../types/GlobalTypes';
import {TypedMatNode} from '../_Base';
import {BaseTextureMapController, BooleanParamOptions, NodePathOptions} from './_BaseTextureController';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {Material, MeshStandardMaterial} from 'three';
import {MeshPhysicalMaterial} from 'three';
import {MeshMatcapMaterial} from 'three';
import {MeshNormalMaterial} from 'three';
import {MeshToonMaterial} from 'three';
export function BumpMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle if you want to use a bump map */
		useBumpMap = ParamConfig.BOOLEAN(0, {
			separatorBefore: true,
			...BooleanParamOptions(TextureBumpMapController),
		});
		/** @param specify the bump map COP node */
		bumpMap = ParamConfig.NODE_PATH('', NodePathOptions(TextureBumpMapController, 'useBumpMap'));
		/** @param bump scale */
		bumpScale = ParamConfig.FLOAT(1, {
			range: [0, 1],
			rangeLocked: [false, false],
			...NodePathOptions(TextureBumpMapController, 'useBumpMap'),
		});
		/** @param bump bias */
		bumpBias = ParamConfig.FLOAT(0, {
			range: [0, 1],
			rangeLocked: [false, false],
			...NodePathOptions(TextureBumpMapController, 'useBumpMap'),
		});
	};
}

type TextureBumpMapControllerCurrentMaterial =
	| MeshMatcapMaterial
	| MeshNormalMaterial
	| MeshPhysicalMaterial
	| MeshStandardMaterial
	| MeshToonMaterial;
function _isValidMaterial(material?: Material): material is TextureBumpMapControllerCurrentMaterial {
	if (!material) {
		return false;
	}
	return (material as MeshMatcapMaterial).bumpScale != null;
}
class TextureBumpMapParamsConfig extends BumpMapParamConfig(NodeParamsConfig) {}
export interface TextureBumpMapControllers {
	bumpMap: TextureBumpMapController;
}
abstract class TextureBumpMapMatNode extends TypedMatNode<
	TextureBumpMapControllerCurrentMaterial,
	TextureBumpMapParamsConfig
> {
	controllers!: TextureBumpMapControllers;
	async material() {
		const container = await this.compute();
		return container.material() as TextureBumpMapControllerCurrentMaterial | undefined;
	}
}

export class TextureBumpMapController extends BaseTextureMapController {
	constructor(protected override node: TextureBumpMapMatNode) {
		super(node);
	}
	override initializeNode() {
		this.add_hooks(this.node.p.useBumpMap, this.node.p.bumpMap);
	}
	static override async update(node: TextureBumpMapMatNode) {
		node.controllers.bumpMap.update();
	}
	override async update() {
		const material = await this.node.material();
		if (!_isValidMaterial(material)) {
			return;
		}

		await this.updateMaterial(material);
	}
	override async updateMaterial(material: TextureBumpMapControllerCurrentMaterial) {
		await this._update(material, 'bumpMap', this.node.p.useBumpMap, this.node.p.bumpMap);

		material.bumpScale = this.node.pv.bumpScale;
	}
}
