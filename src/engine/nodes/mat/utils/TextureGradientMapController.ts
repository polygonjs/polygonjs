import {Constructor} from '../../../../types/GlobalTypes';
import {TypedMatNode} from '../_Base';
import {BaseTextureMapController, BooleanParamOptions, NodePathOptions} from './_BaseTextureController';
import {ShaderMaterial} from 'three';
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
class TextureGradientMapParamsConfig extends GradientMapParamConfig(NodeParamsConfig) {}
interface GradientControllers {
	gradientMap: TextureGradientMapController;
}
abstract class TextureGradientMapMatNode extends TypedMatNode<
	TextureGradientMapCurrentMaterial,
	TextureGradientMapParamsConfig
> {
	controllers!: GradientControllers;
	abstract override createMaterial(): TextureGradientMapCurrentMaterial;
}

export class TextureGradientMapController extends BaseTextureMapController {
	constructor(protected override node: TextureGradientMapMatNode) {
		super(node);
	}
	override initializeNode() {
		this.add_hooks(this.node.p.useGradientMap, this.node.p.gradientMap);
	}
	override async update() {
		this._update(this.node.material, 'gradientMap', this.node.p.useGradientMap, this.node.p.gradientMap);
	}
	static override async update(node: TextureGradientMapMatNode) {
		node.controllers.gradientMap.update();
	}
}
