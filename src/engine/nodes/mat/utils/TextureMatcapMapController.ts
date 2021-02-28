import {Constructor} from '../../../../types/GlobalTypes';
import {Material} from 'three/src/materials/Material';
import {Texture} from 'three/src/textures/Texture';
import {TypedMatNode} from '../_Base';
import {
	BaseTextureMapController,
	BooleanParamOptions,
	OperatorPathOptions,
	UpdateOptions,
} from './_BaseTextureController';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {NODE_PATH_DEFAULT} from '../../../../core/Walker';

export function TextureMatcapMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle if you want to use a matcap map */
		useMatcapMap = ParamConfig.BOOLEAN(0, BooleanParamOptions(TextureMatcapMapController));
		/** @param specify the matcap map COP node */
		matcapMap = ParamConfig.NODE_PATH(
			NODE_PATH_DEFAULT.NODE.EMPTY,
			OperatorPathOptions(TextureMatcapMapController, 'useMatcapMap')
		);
	};
}

class TextureMatcapMaterial extends Material {
	matcap!: Texture | null;
}
type CurrentMaterial = TextureMatcapMaterial | ShaderMaterial;
class TextureMatcapMapParamsConfig extends TextureMatcapMapParamConfig(NodeParamsConfig) {}
interface Controllers {
	matcap: TextureMatcapMapController;
}
abstract class TextureMatcapMapMatNode extends TypedMatNode<CurrentMaterial, TextureMatcapMapParamsConfig> {
	controllers!: Controllers;
	abstract createMaterial(): CurrentMaterial;
}

export class TextureMatcapMapController extends BaseTextureMapController {
	constructor(protected node: TextureMatcapMapMatNode, _update_options: UpdateOptions) {
		super(node, _update_options);
	}
	initializeNode() {
		this.add_hooks(this.node.p.useMatcapMap, this.node.p.matcapMap);
	}
	async update() {
		this._update(this.node.material, 'matcapMap', this.node.p.useMatcapMap, this.node.p.matcapMap);
	}
	static async update(node: TextureMatcapMapMatNode) {
		node.controllers.matcap.update();
	}
}
