import {Constructor} from '../../../../types/GlobalTypes';
import {TypedMatNode} from '../_Base';
import {BaseTextureMapController, BooleanParamOptions, NodePathOptions} from './_BaseTextureController';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {MeshBasicMaterial} from 'three/src/materials/MeshBasicMaterial';
import {MeshLambertMaterial} from 'three/src/materials/MeshLambertMaterial';
import {MeshPhongMaterial} from 'three/src/materials/MeshPhongMaterial';
import {MeshPhysicalMaterial} from 'three/src/materials/MeshPhysicalMaterial';
import {MeshStandardMaterial} from 'three/src/materials/MeshStandardMaterial';
import {MeshMatcapMaterial} from 'three/src/materials/MeshMatcapMaterial';
import {MeshToonMaterial} from 'three/src/materials/MeshToonMaterial';
import {PointsMaterial} from 'three/src/materials/PointsMaterial';
export function AlphaMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle if you want to use an alpha map */
		useAlphaMap = ParamConfig.BOOLEAN(0, {
			separatorBefore: true,
			...BooleanParamOptions(TextureAlphaMapController),
		});
		/** @param specify the alpha map COP node */
		alphaMap = ParamConfig.NODE_PATH('', NodePathOptions(TextureAlphaMapController, 'useAlphaMap'));
	};
}

type CurrentMaterial =
	| MeshBasicMaterial
	| MeshLambertMaterial
	| MeshPhongMaterial
	| MeshStandardMaterial
	| MeshPhysicalMaterial
	| MeshMatcapMaterial
	| MeshToonMaterial
	| PointsMaterial;
class TextureAlphaMapParamsConfig extends AlphaMapParamConfig(NodeParamsConfig) {}
interface Controllers {
	alphaMap: TextureAlphaMapController;
}
abstract class TextureAlphaMapMatNode extends TypedMatNode<CurrentMaterial, TextureAlphaMapParamsConfig> {
	controllers!: Controllers;
	abstract override createMaterial(): CurrentMaterial;
}

export class TextureAlphaMapController extends BaseTextureMapController {
	constructor(protected override node: TextureAlphaMapMatNode) {
		super(node);
	}
	initializeNode() {
		this.add_hooks(this.node.p.useAlphaMap, this.node.p.alphaMap);
	}
	override async update() {
		this._update(this.node.material, 'alphaMap', this.node.p.useAlphaMap, this.node.p.alphaMap);
	}
	static override async update(node: TextureAlphaMapMatNode) {
		node.controllers.alphaMap.update();
	}
}
