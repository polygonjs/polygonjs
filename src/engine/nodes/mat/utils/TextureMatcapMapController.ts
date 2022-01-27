import {Constructor} from '../../../../types/GlobalTypes';
import {Material} from 'three/src/materials/Material';
import {Texture} from 'three/src/textures/Texture';
import {TypedMatNode} from '../_Base';
import {BaseTextureMapController, BooleanParamOptions, NodePathOptions, UpdateOptions} from './_BaseTextureController';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';

export function MatcapMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle if you want to use a matcap map */
		useMatcapMap = ParamConfig.BOOLEAN(0, BooleanParamOptions(TextureMatcapMapController));
		/** @param specify the matcap map COP node */
		matcapMap = ParamConfig.NODE_PATH('', NodePathOptions(TextureMatcapMapController, 'useMatcapMap'));
	};
}

class TextureMatcapMaterial extends Material {
	matcap!: Texture | null;
}
type CurrentMaterial = TextureMatcapMaterial | ShaderMaterial;
class TextureMatcapMapParamsConfig extends MatcapMapParamConfig(NodeParamsConfig) {}
interface Controllers {
	matcap: TextureMatcapMapController;
}
abstract class TextureMatcapMapMatNode extends TypedMatNode<CurrentMaterial, TextureMatcapMapParamsConfig> {
	controllers!: Controllers;
	abstract override createMaterial(): CurrentMaterial;
}

export class TextureMatcapMapController extends BaseTextureMapController {
	constructor(protected override node: TextureMatcapMapMatNode, _update_options: UpdateOptions) {
		super(node, _update_options);
	}
	initializeNode() {
		this.add_hooks(this.node.p.useMatcapMap, this.node.p.matcapMap);
	}
	override async update() {
		this._update(this.node.material, 'matcap', this.node.p.useMatcapMap, this.node.p.matcapMap);
	}
	static override async update(node: TextureMatcapMapMatNode) {
		node.controllers.matcap.update();
	}
}
