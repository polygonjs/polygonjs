import {Constructor} from '../../../../types/GlobalTypes';
import {TypedMatNode} from '../_Base';
import {BaseTextureMapController, BooleanParamOptions, NodePathOptions} from './_BaseTextureController';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {MeshPhongMaterial, Material} from 'three';

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
function isTextureSpecularMapMaterial(material?: Material): material is TextureSpecularMapControllerCurrentMaterial {
	if (!material) {
		return false;
	}
	return (material as MeshPhongMaterial as any).isMeshPhongMaterial != null;
}
class TextureSpecularMapParamsConfig extends SpecularMapParamConfig(NodeParamsConfig) {}
export interface TextureSpecularMapControllers {
	specularMap: TextureSpecularMapController;
}
abstract class TextureSpecularMapMatNode extends TypedMatNode<
	TextureSpecularMapControllerCurrentMaterial,
	TextureSpecularMapParamsConfig
> {
	controllers!: TextureSpecularMapControllers;
	// abstract override createMaterial(): TextureSpecularMapControllerCurrentMaterial;
}

export class TextureSpecularMapController extends BaseTextureMapController {
	constructor(protected override node: TextureSpecularMapMatNode) {
		super(node);
	}
	override initializeNode() {
		this.add_hooks(this.node.p.useSpecularMap, this.node.p.specularMap);
	}
	static override async update(node: TextureSpecularMapMatNode) {
		node.controllers.specularMap.update();
	}
	override async update() {
		const material = await this.node.material();
		if (!isTextureSpecularMapMaterial(material)) {
			return;
		}
		this.node.controllers.specularMap.updateMaterial(material);
	}
	override async updateMaterial(material: TextureSpecularMapControllerCurrentMaterial) {
		await this._update(material, 'specularMap', this.node.p.useSpecularMap, this.node.p.specularMap);
	}
}
