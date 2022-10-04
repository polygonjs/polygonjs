import {Constructor} from '../../../../types/GlobalTypes';
import {TypedMatNode} from '../_Base';
import {BaseTextureMapController, BooleanParamOptions, NodePathOptions} from './_BaseTextureController';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {MeshBasicMaterial} from 'three';
import {MeshLambertMaterial} from 'three';
import {MeshMatcapMaterial} from 'three';
import {MeshPhongMaterial} from 'three';
import {MeshPhysicalMaterial} from 'three';
import {MeshStandardMaterial} from 'three';
import {PointsMaterial} from 'three';
import {MeshToonMaterial} from 'three';
export function MapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle on to use a map affecting color */
		useMap = ParamConfig.BOOLEAN(0, {
			...BooleanParamOptions(TextureMapController),
			separatorBefore: true,
		});
		/** @param texture map affecting color */
		map = ParamConfig.NODE_PATH('', NodePathOptions(TextureMapController, 'useMap'));
	};
}

// class TextureMapMaterial extends Material {
// 	map!: Texture | null;
// }
type TextureMapCurrentMaterial =
	| MeshBasicMaterial
	| MeshLambertMaterial
	| MeshMatcapMaterial
	| MeshPhongMaterial
	| MeshStandardMaterial
	| MeshPhysicalMaterial
	| MeshToonMaterial
	| PointsMaterial;
class TextureMapParamsConfig extends MapParamConfig(NodeParamsConfig) {}
interface TextureMapControllers {
	map: TextureMapController;
}
abstract class TextureMapMatNode extends TypedMatNode<TextureMapCurrentMaterial, TextureMapParamsConfig> {
	controllers!: TextureMapControllers;
	abstract override createMaterial(): TextureMapCurrentMaterial;
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
