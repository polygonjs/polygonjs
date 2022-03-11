import {Constructor} from '../../../../types/GlobalTypes';
import {TypedMatNode} from '../_Base';
import {BaseTextureMapController, BooleanParamOptions, NodePathOptions} from './_BaseTextureController';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {MeshBasicMaterial} from 'three/src/materials/MeshBasicMaterial';
import {MeshLambertMaterial} from 'three/src/materials/MeshLambertMaterial';
import {MeshMatcapMaterial} from 'three/src/materials/MeshMatcapMaterial';
import {MeshPhongMaterial} from 'three/src/materials/MeshPhongMaterial';
import {MeshPhysicalMaterial} from 'three/src/materials/MeshPhysicalMaterial';
import {MeshStandardMaterial} from 'three/src/materials/MeshStandardMaterial';
import {PointsMaterial} from 'three/src/materials/PointsMaterial';
import {MeshToonMaterial} from 'three/src/materials/MeshToonMaterial';
export function MapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle on to use a map affecting color */
		useMap = ParamConfig.BOOLEAN(0, BooleanParamOptions(TextureMapController));
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
