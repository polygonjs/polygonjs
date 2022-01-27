import {Constructor} from '../../../../types/GlobalTypes';
import {Material} from 'three/src/materials/Material';
import {Texture} from 'three/src/textures/Texture';
import {TypedMatNode} from '../_Base';
import {BaseTextureMapController, BooleanParamOptions, NodePathOptions, UpdateOptions} from './_BaseTextureController';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';

export function GradientMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle if you want to use a gradient map */
		useGradientMap = ParamConfig.BOOLEAN(0, BooleanParamOptions(TextureGradientMapController));
		/** Gradient map for toon shading. It's required to set Texture.minFilter and Texture.magFilter to THREE.NearestFilter when using this type of texture */
		gradientMap = ParamConfig.NODE_PATH('', NodePathOptions(TextureGradientMapController, 'useGradientMap'));
	};
}

class TextureGradientMaterial extends Material {
	gradientMap!: Texture | null;
}
type CurrentMaterial = TextureGradientMaterial | ShaderMaterial;
class TextureGradientMapParamsConfig extends GradientMapParamConfig(NodeParamsConfig) {}
interface Controllers {
	gradientMap: TextureGradientMapController;
}
abstract class TextureGradientMapMatNode extends TypedMatNode<CurrentMaterial, TextureGradientMapParamsConfig> {
	controllers!: Controllers;
	abstract override createMaterial(): CurrentMaterial;
}

export class TextureGradientMapController extends BaseTextureMapController {
	constructor(protected override node: TextureGradientMapMatNode, _update_options: UpdateOptions) {
		super(node, _update_options);
	}
	initializeNode() {
		this.add_hooks(this.node.p.useGradientMap, this.node.p.gradientMap);
	}
	override async update() {
		this._update(this.node.material, 'gradientMap', this.node.p.useGradientMap, this.node.p.gradientMap);
		// if (this._update_options.uniforms) {
		// 	const mat = this.node.material as ShaderMaterial;
		// 	mat.uniforms.gradientMapIntensity.value = this.node.pv.gradientMapIntensity;
		// }
		// if (this._update_options.directParams) {
		// 	const mat = this.node.material as MeshStandardMaterial;
		// 	mat.gradientMapIntensity = this.node.pv.gradientMapIntensity;
		// }
	}
	static override async update(node: TextureGradientMapMatNode) {
		node.controllers.gradientMap.update();
	}
}
