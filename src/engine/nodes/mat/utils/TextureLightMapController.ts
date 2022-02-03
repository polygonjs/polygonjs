import {Constructor} from '../../../../types/GlobalTypes';
import {Material} from 'three/src/materials/Material';
import {Texture} from 'three/src/textures/Texture';
import {TypedMatNode} from '../_Base';
import {BaseTextureMapController, BooleanParamOptions, NodePathOptions, UpdateOptions} from './_BaseTextureController';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {MeshStandardMaterial} from 'three/src/materials/MeshStandardMaterial';

export function LightMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle if you want to use a light map */
		useLightMap = ParamConfig.BOOLEAN(0, {
			separatorBefore: true,
			...BooleanParamOptions(TextureLightMapController),
		});
		/** @param specify the light map COP node */
		lightMap = ParamConfig.NODE_PATH('', NodePathOptions(TextureLightMapController, 'useLightMap'));
		/** @param light. When set to 0, reflections from environment maps will be very sharp, or blurred when 1. Any value between 0 and 1 can help modulate this. */
		lightMapIntensity = ParamConfig.FLOAT(1, {
			visibleIf: {useLightMap: 1},
		});
	};
}

class TextureLightMaterial extends Material {
	lightMap!: Texture | null;
	lightMapIntensity!: number;
}
type CurrentMaterial = TextureLightMaterial | Material;
class TextureLightMapParamsConfig extends LightMapParamConfig(NodeParamsConfig) {}
interface Controllers {
	lightMap: TextureLightMapController;
}
abstract class TextureLightMapMatNode extends TypedMatNode<CurrentMaterial, TextureLightMapParamsConfig> {
	controllers!: Controllers;
	abstract override createMaterial(): CurrentMaterial;
}

export class TextureLightMapController extends BaseTextureMapController {
	constructor(protected override node: TextureLightMapMatNode, _update_options: UpdateOptions) {
		super(node, _update_options);
	}
	initializeNode() {
		this.add_hooks(this.node.p.useLightMap, this.node.p.lightMap);
	}
	override async update() {
		this._update(this.node.material, 'lightMap', this.node.p.useLightMap, this.node.p.lightMap);
		if (this._update_options.uniforms) {
			const mat = this.node.material as ShaderMaterial;
			if (mat.uniforms) {
				mat.uniforms.lightMapIntensity.value = this.node.pv.lightMapIntensity;
			}
		}
		if (this._update_options.directParams) {
			const mat = this.node.material as MeshStandardMaterial;
			mat.lightMapIntensity = this.node.pv.lightMapIntensity;
		}
	}
	static override async update(node: TextureLightMapMatNode) {
		node.controllers.lightMap.update();
	}
}
