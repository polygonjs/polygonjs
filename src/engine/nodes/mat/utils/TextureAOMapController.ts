import {Constructor} from '../../../../types/GlobalTypes';
import {MeshBasicMaterial} from 'three/src/materials/MeshBasicMaterial';
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
export function TextureAOMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle if you want to use an ambient occlusion map */
		useAOMap = ParamConfig.BOOLEAN(0, BooleanParamOptions(TextureAOMapController));
		/** @param specify the AO map COP node */
		aoMap = ParamConfig.NODE_PATH(
			NODE_PATH_DEFAULT.NODE.EMPTY,
			OperatorPathOptions(TextureAOMapController, 'useAOMap')
		);
		/** @param ambient occlusion intensity */
		aoMapIntensity = ParamConfig.FLOAT(1, {range: [0, 1], rangeLocked: [false, false], visibleIf: {useAOMap: 1}});
	};
}

class TextureAOMaterial extends Material {
	aoMap!: Texture | null;
	aoMapIntensity!: number;
}
type CurrentMaterial = TextureAOMaterial | ShaderMaterial;
class TextureAOMapParamsConfig extends TextureAOMapParamConfig(NodeParamsConfig) {}
interface Controllers {
	aoMap: TextureAOMapController;
}
abstract class TextureAOMapMatNode extends TypedMatNode<CurrentMaterial, TextureAOMapParamsConfig> {
	controllers!: Controllers;
	abstract createMaterial(): CurrentMaterial;
}

export class TextureAOMapController extends BaseTextureMapController {
	constructor(protected node: TextureAOMapMatNode, _update_options: UpdateOptions) {
		super(node, _update_options);
	}
	initializeNode() {
		this.add_hooks(this.node.p.useAOMap, this.node.p.aoMap);
	}
	async update() {
		this._update(this.node.material, 'aoMap', this.node.p.useAOMap, this.node.p.aoMap);
		if (this._update_options.uniforms) {
			const mat = this.node.material as ShaderMaterial;
			mat.uniforms.aoMapIntensity.value = this.node.pv.aoMapIntensity;
		}
		if (this._update_options.directParams) {
			const mat = this.node.material as MeshBasicMaterial;
			mat.aoMapIntensity = this.node.pv.aoMapIntensity;
		}
	}
	static async update(node: TextureAOMapMatNode) {
		node.controllers.aoMap.update();
	}
}
