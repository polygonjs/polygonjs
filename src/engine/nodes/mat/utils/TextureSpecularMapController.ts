import {Constructor} from '../../../../types/GlobalTypes';
import {Material} from 'three/src/materials/Material';
import {TypedMatNode} from '../_Base';
import {BaseTextureMapController, BooleanParamOptions, NodePathOptions} from './_BaseTextureController';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {MeshPhongMaterial} from 'three/src/materials/MeshPhongMaterial';

export function SpecularMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle if you want to use a specular map */
		useSpecularMap = ParamConfig.BOOLEAN(0, BooleanParamOptions(TextureSpecularMapController));
		/** @param specify the specular map COP node */
		specularMap = ParamConfig.NODE_PATH('', NodePathOptions(TextureSpecularMapController, 'useSpecularMap'));
	};
}

type TextureSpecularMaterial = MeshPhongMaterial;
// class TextureSpecularMaterial extends Material {
// 	specularMap!: Texture | null;
// }
type CurrentMaterial = TextureSpecularMaterial | Material;
class TextureSpecularMapParamsConfig extends SpecularMapParamConfig(NodeParamsConfig) {}
interface Controllers {
	specularMap: TextureSpecularMapController;
}
abstract class TextureSpecularMapMatNode extends TypedMatNode<CurrentMaterial, TextureSpecularMapParamsConfig> {
	controllers!: Controllers;
	abstract override createMaterial(): CurrentMaterial;
}

export class TextureSpecularMapController extends BaseTextureMapController {
	constructor(protected override node: TextureSpecularMapMatNode) {
		super(node);
	}
	initializeNode() {
		this.add_hooks(this.node.p.useSpecularMap, this.node.p.specularMap);
	}
	override async update() {
		this._update(this.node.material, 'specularMap', this.node.p.useSpecularMap, this.node.p.specularMap);
	}
	static override async update(node: TextureSpecularMapMatNode) {
		node.controllers.specularMap.update();
	}
}
