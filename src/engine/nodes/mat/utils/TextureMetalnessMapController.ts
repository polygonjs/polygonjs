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
import {MeshStandardMaterial} from 'three/src/materials/MeshStandardMaterial';

export function TextureMetalnessMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle if you want to use a metalness map */
		useMetalnessMap = ParamConfig.BOOLEAN(0, BooleanParamOptions(TextureMetalnessMapController));
		/** @param specify the metalness map COP node */
		metalnessMap = ParamConfig.NODE_PATH(
			NODE_PATH_DEFAULT.NODE.EMPTY,
			OperatorPathOptions(TextureMetalnessMapController, 'useMetalnessMap')
		);
		/** @param metalness. It's recommended to either set this value to 0 or to 1, as objects are either metallic or not. Any value in between tends to look like an alien plastic */
		metalness = ParamConfig.FLOAT(1);
	};
}

class TextureMetalnessMaterial extends Material {
	metalnessMap!: Texture | null;
	metalness!: number;
}
type CurrentMaterial = TextureMetalnessMaterial | ShaderMaterial;
class TextureMetalnessMapParamsConfig extends TextureMetalnessMapParamConfig(NodeParamsConfig) {}
interface Controllers {
	metalnessMap: TextureMetalnessMapController;
}
abstract class TextureMetalnessMapMatNode extends TypedMatNode<CurrentMaterial, TextureMetalnessMapParamsConfig> {
	controllers!: Controllers;
	abstract createMaterial(): CurrentMaterial;
}

export class TextureMetalnessMapController extends BaseTextureMapController {
	constructor(protected node: TextureMetalnessMapMatNode, _update_options: UpdateOptions) {
		super(node, _update_options);
	}
	initializeNode() {
		this.add_hooks(this.node.p.useMetalnessMap, this.node.p.metalnessMap);
	}
	async update() {
		this._update(this.node.material, 'metalnessMap', this.node.p.useMetalnessMap, this.node.p.metalnessMap);
		if (this._update_options.uniforms) {
			const mat = this.node.material as ShaderMaterial;
			mat.uniforms.metalness.value = this.node.pv.metalness;
		}
		if (this._update_options.directParams) {
			const mat = this.node.material as MeshStandardMaterial;
			mat.metalness = this.node.pv.metalness;
		}
	}
	static async update(node: TextureMetalnessMapMatNode) {
		node.controllers.metalnessMap.update();
	}
}
