import {Constructor} from '../../../../types/GlobalTypes';
import {TypedMatNode} from '../_Base';
import {BaseTextureMapController, BooleanParamOptions, NodePathOptions} from './_BaseTextureController';
import {ShaderMaterial} from 'three';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {MeshMatcapMaterial} from 'three';

export function MatcapMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle if you want to use a matcap map */
		useMatcapMap = ParamConfig.BOOLEAN(0, BooleanParamOptions(TextureMatcapMapController));
		/** @param specify the matcap map COP node */
		matcapMap = ParamConfig.NODE_PATH('', NodePathOptions(TextureMatcapMapController, 'useMatcapMap'));
	};
}

type TextureMatcapMaterial = MeshMatcapMaterial;
// class TextureMatcapMaterial extends Material {
// 	matcap!: Texture | null;
// }
type TextureMatCapControllerCurrentMaterial = TextureMatcapMaterial | ShaderMaterial;
class TextureMatcapMapParamsConfig extends MatcapMapParamConfig(NodeParamsConfig) {}
interface TextureMatCapControllers {
	matcap: TextureMatcapMapController;
}
abstract class TextureMatcapMapMatNode extends TypedMatNode<
	TextureMatCapControllerCurrentMaterial,
	TextureMatcapMapParamsConfig
> {
	controllers!: TextureMatCapControllers;
	abstract override createMaterial(): TextureMatCapControllerCurrentMaterial;
}

export class TextureMatcapMapController extends BaseTextureMapController {
	constructor(protected override node: TextureMatcapMapMatNode) {
		super(node);
	}
	override initializeNode() {
		this.add_hooks(this.node.p.useMatcapMap, this.node.p.matcapMap);
	}
	override async update() {
		this._update(this.node.material, 'matcap', this.node.p.useMatcapMap, this.node.p.matcapMap);
	}
	static override async update(node: TextureMatcapMapMatNode) {
		node.controllers.matcap.update();
	}
}
