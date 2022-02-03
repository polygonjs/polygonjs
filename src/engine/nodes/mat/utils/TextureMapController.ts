import {Constructor} from '../../../../types/GlobalTypes';
import {Material} from 'three/src/materials/Material';
import {TypedMatNode} from '../_Base';
import {BaseTextureMapController, BooleanParamOptions, NodePathOptions} from './_BaseTextureController';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {MeshBasicMaterial} from 'three/src/materials/MeshBasicMaterial';
import {MeshLambertMaterial} from 'three/src/materials/MeshLambertMaterial';
import {MeshPhongMaterial} from 'three/src/materials/MeshPhongMaterial';
export function MapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle on to use a map affecting color */
		useMap = ParamConfig.BOOLEAN(0, BooleanParamOptions(TextureMapController));
		/** @param texture map affecting color */
		map = ParamConfig.NODE_PATH('', NodePathOptions(TextureMapController, 'useMap'));
	};
}

type TextureMapMaterial = MeshBasicMaterial | MeshLambertMaterial | MeshPhongMaterial;
// class TextureMapMaterial extends Material {
// 	map!: Texture | null;
// }
type CurrentMaterial = TextureMapMaterial | Material;
class TextureMapParamsConfig extends MapParamConfig(NodeParamsConfig) {}
interface Controllers {
	map: TextureMapController;
}
abstract class TextureMapMatNode extends TypedMatNode<CurrentMaterial, TextureMapParamsConfig> {
	controllers!: Controllers;
	abstract override createMaterial(): CurrentMaterial;
}

export class TextureMapController extends BaseTextureMapController {
	constructor(protected override node: TextureMapMatNode) {
		super(node);
	}
	initializeNode() {
		this.add_hooks(this.node.p.useMap, this.node.p.map);
	}
	override async update() {
		this._update(this.node.material, 'map', this.node.p.useMap, this.node.p.map);
	}
	static override async update(node: TextureMapMatNode) {
		node.controllers.map.update();
	}
}
