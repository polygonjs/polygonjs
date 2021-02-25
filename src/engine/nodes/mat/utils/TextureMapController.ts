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
export function TextureMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle on to use a map affecting color */
		useMap = ParamConfig.BOOLEAN(0, BooleanParamOptions(TextureMapController));
		/** @param texture map affecting color */
		map = ParamConfig.OPERATOR_PATH(NODE_PATH_DEFAULT.NODE.UV, OperatorPathOptions(TextureMapController, 'useMap'));
	};
}
class TextureMapMaterial extends Material {
	map!: Texture | null;
}
type CurrentMaterial = TextureMapMaterial | ShaderMaterial;
class TextureMapParamsConfig extends TextureMapParamConfig(NodeParamsConfig) {}
interface Controllers {
	map: TextureMapController;
}
abstract class TextureMapMatNode extends TypedMatNode<CurrentMaterial, TextureMapParamsConfig> {
	controllers!: Controllers;
	abstract createMaterial(): CurrentMaterial;
}

export class TextureMapController extends BaseTextureMapController {
	constructor(protected node: TextureMapMatNode, _update_options: UpdateOptions) {
		super(node, _update_options);
	}
	initializeNode() {
		this.add_hooks(this.node.p.useMap, this.node.p.map);
	}
	async update() {
		this._update(this.node.material, 'map', this.node.p.useMap, this.node.p.map);
	}
	static async update(node: TextureMapMatNode) {
		node.controllers.map.update();
	}
}
