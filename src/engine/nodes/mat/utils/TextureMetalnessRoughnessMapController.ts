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
import {MeshStandardMaterial} from 'three/src/materials/MeshStandardMaterial';

export function MetalnessRoughnessMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle if you want to use a metalness map */
		useMetalnessMap = ParamConfig.BOOLEAN(0, {
			separatorBefore: true,
			...BooleanParamOptions(TextureMetalnessRoughnessMapController),
		});
		/** @param specify the metalness map COP node */
		metalnessMap = ParamConfig.NODE_PATH(
			'',
			OperatorPathOptions(TextureMetalnessRoughnessMapController, 'useMetalnessMap')
		);
		/** @param metalness. It's recommended to either set this value to 0 or to 1, as objects are either metallic or not. Any value in between tends to look like an alien plastic */
		metalness = ParamConfig.FLOAT(1);
		/** @param toggle if you want to use a roughness map */
		useRoughnessMap = ParamConfig.BOOLEAN(0, {
			separatorBefore: true,
			...BooleanParamOptions(TextureMetalnessRoughnessMapController),
		});
		/** @param specify the roughness map COP node */
		roughnessMap = ParamConfig.NODE_PATH(
			'',
			OperatorPathOptions(TextureMetalnessRoughnessMapController, 'useRoughnessMap')
		);
		/** @param roughness. When set to 0, reflections from environment maps will be very sharp, or blurred when 1. Any value between 0 and 1 can help modulate this. */
		roughness = ParamConfig.FLOAT(0.5);
	};
}

class TextureMetalnessMaterial extends Material {
	metalnessMap!: Texture | null;
	metalness!: number;
}
type CurrentMaterial = TextureMetalnessMaterial | ShaderMaterial;
class TextureMetalnessMapParamsConfig extends MetalnessRoughnessMapParamConfig(NodeParamsConfig) {}
interface Controllers {
	metalnessRoughnessMap: TextureMetalnessRoughnessMapController;
}
abstract class TextureMetalnessMapMatNode extends TypedMatNode<CurrentMaterial, TextureMetalnessMapParamsConfig> {
	controllers!: Controllers;
	abstract override createMaterial(): CurrentMaterial;
}

export class TextureMetalnessRoughnessMapController extends BaseTextureMapController {
	constructor(protected override node: TextureMetalnessMapMatNode, _update_options: UpdateOptions) {
		super(node, _update_options);
	}
	initializeNode() {
		this.add_hooks(this.node.p.useMetalnessMap, this.node.p.metalnessMap);
	}
	override async update() {
		this._update(this.node.material, 'metalnessMap', this.node.p.useMetalnessMap, this.node.p.metalnessMap);
		if (this._update_options.uniforms) {
			const mat = this.node.material as ShaderMaterial;
			mat.uniforms.metalness.value = this.node.pv.metalness;
		}
		if (this._update_options.directParams) {
			const mat = this.node.material as MeshStandardMaterial;
			mat.metalness = this.node.pv.metalness;
		}

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
	static override async update(node: TextureMetalnessMapMatNode) {
		node.controllers.metalnessRoughnessMap.update();
	}
}
