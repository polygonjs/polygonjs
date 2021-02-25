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

export function TextureRoughnessMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle if you want to use a roughness map */
		useRoughnessMap = ParamConfig.BOOLEAN(0, BooleanParamOptions(TextureRoughnessMapController));
		/** @param specify the roughness map COP node */
		roughnessMap = ParamConfig.OPERATOR_PATH(
			NODE_PATH_DEFAULT.NODE.UV,
			OperatorPathOptions(TextureRoughnessMapController, 'useRoughnessMap')
		);
		/** @param roughness. When set to 0, reflections from environment maps will be very sharp, or blurred when 1. Any value between 0 and 1 can help modulate this. */
		roughness = ParamConfig.FLOAT(0.5);
	};
}

class TextureRoughnessMaterial extends Material {
	roughnessMap!: Texture | null;
	roughness!: number;
}
type CurrentMaterial = TextureRoughnessMaterial | ShaderMaterial;
class TextureRoughnessMapParamsConfig extends TextureRoughnessMapParamConfig(NodeParamsConfig) {}
interface Controllers {
	roughnessMap: TextureRoughnessMapController;
}
abstract class TextureRoughnessMapMatNode extends TypedMatNode<CurrentMaterial, TextureRoughnessMapParamsConfig> {
	controllers!: Controllers;
	abstract createMaterial(): CurrentMaterial;
}

export class TextureRoughnessMapController extends BaseTextureMapController {
	constructor(protected node: TextureRoughnessMapMatNode, _update_options: UpdateOptions) {
		super(node, _update_options);
	}
	initializeNode() {
		this.add_hooks(this.node.p.useRoughnessMap, this.node.p.roughnessMap);
	}
	async update() {
		this._update(this.node.material, 'roughnessMap', this.node.p.useRoughnessMap, this.node.p.roughnessMap);
		if (this._update_options.uniforms) {
			const mat = this.node.material as ShaderMaterial;
			mat.uniforms.roughness.value = this.node.pv.roughness;
		}
		if (this._update_options.directParams) {
			const mat = this.node.material as MeshStandardMaterial;
			mat.roughness = this.node.pv.roughness;
		}
	}
	static async update(node: TextureRoughnessMapMatNode) {
		node.controllers.roughnessMap.update();
	}
}
