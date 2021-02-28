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

export function TextureSpecularMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle if you want to use a specular map */
		useSpecularMap = ParamConfig.BOOLEAN(0, BooleanParamOptions(TextureSpecularMapController));
		/** @param specify the specular map COP node */
		specularMap = ParamConfig.NODE_PATH(
			NODE_PATH_DEFAULT.NODE.EMPTY,
			OperatorPathOptions(TextureSpecularMapController, 'useSpecularMap')
		);
	};
}

class TextureSpecularMaterial extends Material {
	specularMap!: Texture | null;
}
type CurrentMaterial = TextureSpecularMaterial | ShaderMaterial;
class TextureSpecularMapParamsConfig extends TextureSpecularMapParamConfig(NodeParamsConfig) {}
interface Controllers {
	specularMap: TextureSpecularMapController;
}
abstract class TextureSpecularMapMatNode extends TypedMatNode<CurrentMaterial, TextureSpecularMapParamsConfig> {
	controllers!: Controllers;
	abstract createMaterial(): CurrentMaterial;
}

export class TextureSpecularMapController extends BaseTextureMapController {
	constructor(protected node: TextureSpecularMapMatNode, _update_options: UpdateOptions) {
		super(node, _update_options);
	}
	initializeNode() {
		this.add_hooks(this.node.p.useSpecularMap, this.node.p.specularMap);
	}
	async update() {
		this._update(this.node.material, 'specularMap', this.node.p.useSpecularMap, this.node.p.specularMap);
	}
	static async update(node: TextureSpecularMapMatNode) {
		node.controllers.specularMap.update();
	}
}
