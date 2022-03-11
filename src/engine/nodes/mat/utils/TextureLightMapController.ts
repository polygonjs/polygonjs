import {Constructor} from '../../../../types/GlobalTypes';
import {TypedMatNode} from '../_Base';
import {BaseTextureMapController, BooleanParamOptions, NodePathOptions} from './_BaseTextureController';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {MeshBasicMaterial} from 'three/src/materials/MeshBasicMaterial';
import {MeshLambertMaterial} from 'three/src/materials/MeshLambertMaterial';
import {MeshStandardMaterial} from 'three/src/materials/MeshStandardMaterial';
import {MeshPhysicalMaterial} from 'three/src/materials/MeshPhysicalMaterial';
import {MeshToonMaterial} from 'three/src/materials/MeshToonMaterial';

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

// class TextureLightMaterial extends Material {
// 	lightMap!: Texture | null;
// 	lightMapIntensity!: number;
// }
type TextureLightMapCurrentMaterial =
	| MeshBasicMaterial
	| MeshLambertMaterial
	| MeshStandardMaterial
	| MeshPhysicalMaterial
	| MeshToonMaterial;
class TextureLightMapParamsConfig extends LightMapParamConfig(NodeParamsConfig) {}
interface LightMapControllers {
	lightMap: TextureLightMapController;
}
abstract class TextureLightMapMatNode extends TypedMatNode<
	TextureLightMapCurrentMaterial,
	TextureLightMapParamsConfig
> {
	controllers!: LightMapControllers;
	abstract override createMaterial(): TextureLightMapCurrentMaterial;
}

export class TextureLightMapController extends BaseTextureMapController {
	constructor(protected override node: TextureLightMapMatNode) {
		super(node);
	}
	initializeNode() {
		this.add_hooks(this.node.p.useLightMap, this.node.p.lightMap);
	}
	override async update() {
		this._update(this.node.material, 'lightMap', this.node.p.useLightMap, this.node.p.lightMap);
		// if (this._update_options.uniforms) {
		// 	const mat = this.node.material as ShaderMaterial;
		// 	if (mat.uniforms) {
		// 		mat.uniforms.lightMapIntensity.value = this.node.pv.lightMapIntensity;
		// 	}
		// }
		// if (this._update_options.directParams) {
		const mat = this.node.material as MeshStandardMaterial;
		mat.lightMapIntensity = this.node.pv.lightMapIntensity;
		// }
	}
	static override async update(node: TextureLightMapMatNode) {
		node.controllers.lightMap.update();
	}
}
