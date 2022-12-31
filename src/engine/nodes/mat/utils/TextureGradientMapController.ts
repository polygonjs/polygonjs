import {Constructor} from '../../../../types/GlobalTypes';
import {TypedMatNode} from '../_Base';
import {BaseTextureMapController, BooleanParamOptions, NodePathOptions} from './_BaseTextureController';
import {Material, ShaderMaterial} from 'three';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {MeshToonMaterial} from 'three';

export function GradientMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle if you want to use a gradient map */
		useGradientMap = ParamConfig.BOOLEAN(0, BooleanParamOptions(TextureGradientMapController));
		/** Gradient map for toon shading. It's required to set Texture.minFilter and Texture.magFilter to THREE.NearestFilter when using this type of texture */
		gradientMap = ParamConfig.NODE_PATH('', NodePathOptions(TextureGradientMapController, 'useGradientMap'));
	};
}

type TextureGradientMaterial = MeshToonMaterial;
type TextureGradientMapCurrentMaterial = TextureGradientMaterial | ShaderMaterial;
function _isValidMaterial(material?: Material): material is TextureGradientMapCurrentMaterial {
	if (!material) {
		return false;
	}
	return true; //(material as TextureGradientMaterial).gradientMap != null;
}
class TextureGradientMapParamsConfig extends GradientMapParamConfig(NodeParamsConfig) {}
export interface TextureGradientMapControllers {
	gradientMap: TextureGradientMapController;
}
abstract class TextureGradientMapMatNode extends TypedMatNode<
	TextureGradientMapCurrentMaterial,
	TextureGradientMapParamsConfig
> {
	controllers!: TextureGradientMapControllers;
	async material() {
		const container = await this.compute();
		return container.material() as TextureGradientMapCurrentMaterial | undefined;
	}
}

export class TextureGradientMapController extends BaseTextureMapController {
	constructor(protected override node: TextureGradientMapMatNode) {
		super(node);
	}
	override initializeNode() {
		this.add_hooks(this.node.p.useGradientMap, this.node.p.gradientMap);
	}
	static override async update(node: TextureGradientMapMatNode) {
		node.controllers.gradientMap.update();
	}
	override async update() {
		const material = await this.node.material();
		if (!_isValidMaterial(material)) {
			return;
		}
		await this.updateMaterial(material);
	}
	override async updateMaterial(material: TextureGradientMapCurrentMaterial) {
		await this._update(material, 'gradientMap', this.node.p.useGradientMap, this.node.p.gradientMap);
	}
}
