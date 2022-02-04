import {Constructor} from '../../../../types/GlobalTypes';
import {TypedMatNode} from '../_Base';
import {BaseTextureMapController, BooleanParamOptions, NodePathOptions} from './_BaseTextureController';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {MeshBasicMaterial} from 'three/src/materials/MeshBasicMaterial';
import {MeshLambertMaterial} from 'three/src/materials/MeshLambertMaterial';
import {MeshPhysicalMaterial} from 'three/src/materials/MeshPhysicalMaterial';
import {MeshStandardMaterial} from 'three/src/materials/MeshStandardMaterial';
import {MeshToonMaterial} from 'three/src/materials/MeshToonMaterial';
export function AOMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle if you want to use an ambient occlusion map */
		useAOMap = ParamConfig.BOOLEAN(0, {
			separatorBefore: true,
			...BooleanParamOptions(TextureAOMapController),
		});
		/** @param specify the AO map COP node */
		aoMap = ParamConfig.NODE_PATH('', NodePathOptions(TextureAOMapController, 'useAOMap'));
		/** @param ambient occlusion intensity */
		aoMapIntensity = ParamConfig.FLOAT(1, {range: [0, 1], rangeLocked: [false, false], visibleIf: {useAOMap: 1}});
	};
}

// class TextureAOMaterial extends Material {
// 	aoMap!: Texture | null;
// 	aoMapIntensity!: number;
// }
type CurrentMaterial =
	| MeshBasicMaterial
	| MeshLambertMaterial
	| MeshStandardMaterial
	| MeshPhysicalMaterial
	| MeshToonMaterial;
class TextureAOMapParamsConfig extends AOMapParamConfig(NodeParamsConfig) {}
interface Controllers {
	aoMap: TextureAOMapController;
}
abstract class TextureAOMapMatNode extends TypedMatNode<CurrentMaterial, TextureAOMapParamsConfig> {
	controllers!: Controllers;
	abstract override createMaterial(): CurrentMaterial;
}

export class TextureAOMapController extends BaseTextureMapController {
	constructor(protected override node: TextureAOMapMatNode) {
		super(node);
	}
	initializeNode() {
		this.add_hooks(this.node.p.useAOMap, this.node.p.aoMap);
	}
	override async update() {
		this._update(this.node.material, 'aoMap', this.node.p.useAOMap, this.node.p.aoMap);
		// if (this._update_options.uniforms) {
		// 	const mat = this.node.material as ShaderMaterial;
		// 	if (mat.uniforms) {
		// 		mat.uniforms.aoMapIntensity.value = this.node.pv.aoMapIntensity;
		// 	}
		// }
		// if (this._update_options.directParams) {
		const mat = this.node.material as MeshBasicMaterial;
		mat.aoMapIntensity = this.node.pv.aoMapIntensity;
		// }
	}
	static override async update(node: TextureAOMapMatNode) {
		node.controllers.aoMap.update();
	}
}
