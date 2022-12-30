import {Constructor} from '../../../../types/GlobalTypes';
import {TypedMatNode} from '../_Base';
import {BaseTextureMapController, BooleanParamOptions, NodePathOptions} from './_BaseTextureController';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {MeshPhongMaterial} from 'three';

export function SpecularMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle if you want to use a specular map */
		useSpecularMap = ParamConfig.BOOLEAN(0, BooleanParamOptions(TextureSpecularMapController));
		/** @param specify the specular map COP node */
		specularMap = ParamConfig.NODE_PATH('', NodePathOptions(TextureSpecularMapController, 'useSpecularMap'));
	};
}

// class TextureSpecularMaterial extends Material {
// 	specularMap!: Texture | null;
// }
type TextureSpecularMapControllerCurrentMaterial = MeshPhongMaterial;
class TextureSpecularMapParamsConfig extends SpecularMapParamConfig(NodeParamsConfig) {}
interface SpecularControllers {
	specularMap: TextureSpecularMapController;
}
abstract class TextureSpecularMapMatNode extends TypedMatNode<
	TextureSpecularMapControllerCurrentMaterial,
	TextureSpecularMapParamsConfig
> {
	controllers!: SpecularControllers;
	abstract override createMaterial(): TextureSpecularMapControllerCurrentMaterial;
}

export class TextureSpecularMapController extends BaseTextureMapController {
	constructor(protected override node: TextureSpecularMapMatNode) {
		super(node);
	}
	override initializeNode() {
		this.add_hooks(this.node.p.useSpecularMap, this.node.p.specularMap);
	}
	override async update() {
		this._update(this.node.material, 'specularMap', this.node.p.useSpecularMap, this.node.p.specularMap);
	}
	static override async update(node: TextureSpecularMapMatNode) {
		node.controllers.specularMap.update();
	}
}
