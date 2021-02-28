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
import {Color} from 'three/src/math/Color';

export function TextureEmissiveMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param emissive color */
		emissive = ParamConfig.COLOR([0, 0, 0]);
		/** @param toggle if you want to use a emissive map */
		useEmissiveMap = ParamConfig.BOOLEAN(0, BooleanParamOptions(TextureEmissiveMapController));
		/** @param specify the emissive map COP node */
		emissiveMap = ParamConfig.NODE_PATH(
			NODE_PATH_DEFAULT.NODE.EMPTY,
			OperatorPathOptions(TextureEmissiveMapController, 'useEmissiveMap')
		);
		/** @param emissive intensity */
		emissiveIntensity = ParamConfig.FLOAT(1);
	};
}

class TextureEmissiveMaterial extends Material {
	emissive!: Color;
	emissiveMap!: Texture | null;
	emissiveIntensity!: number;
}
type CurrentMaterial = TextureEmissiveMaterial | ShaderMaterial;
class TextureEmissiveMapParamsConfig extends TextureEmissiveMapParamConfig(NodeParamsConfig) {}
interface Controllers {
	emissiveMap: TextureEmissiveMapController;
}
abstract class TextureEmissiveMapMatNode extends TypedMatNode<CurrentMaterial, TextureEmissiveMapParamsConfig> {
	controllers!: Controllers;
	abstract createMaterial(): CurrentMaterial;
}

export class TextureEmissiveMapController extends BaseTextureMapController {
	constructor(protected node: TextureEmissiveMapMatNode, _update_options: UpdateOptions) {
		super(node, _update_options);
	}
	initializeNode() {
		this.add_hooks(this.node.p.useEmissiveMap, this.node.p.emissiveMap);
	}
	async update() {
		this._update(this.node.material, 'emissiveMap', this.node.p.useEmissiveMap, this.node.p.emissiveMap);
		if (this._update_options.uniforms) {
			const mat = this.node.material as ShaderMaterial;
			mat.uniforms.emissive.value.copy(this.node.pv.emissive);
			// mat.uniforms.emissiveIntensity.value = this.node.pv.emissiveIntensity; // not found in uniforms
		}
		if (this._update_options.directParams) {
			const mat = this.node.material as TextureEmissiveMaterial;
			mat.emissive.copy(this.node.pv.emissive);
			mat.emissiveIntensity = this.node.pv.emissiveIntensity;
		}
	}
	static async update(node: TextureEmissiveMapMatNode) {
		node.controllers.emissiveMap.update();
	}
}
