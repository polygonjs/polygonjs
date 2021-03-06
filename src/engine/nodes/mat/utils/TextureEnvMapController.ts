import {Constructor} from '../../../../types/GlobalTypes';
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
import {MeshStandardMaterial} from 'three/src/materials/MeshStandardMaterial';
export function EnvMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle if you want to use an environment map */
		useEnvMap = ParamConfig.BOOLEAN(0, {
			separatorBefore: true,
			...BooleanParamOptions(TextureEnvMapController),
		});
		/** @param specify the environment map COP node */
		envMap = ParamConfig.NODE_PATH(
			NODE_PATH_DEFAULT.NODE.EMPTY,
			OperatorPathOptions(TextureEnvMapController, 'useEnvMap')
		);
		/** @param environment intensity */
		envMapIntensity = ParamConfig.FLOAT(1, {visibleIf: {useEnvMap: 1}});
		/** @param refraction ratio */
		refractionRatio = ParamConfig.FLOAT(0.98, {
			range: [-1, 1],
			rangeLocked: [false, false],
			visibleIf: {useEnvMap: 1},
		});
	};
}
// class TextureEnvMaterial extends Material {
// 	envMap!: Texture | null;
// 	envMapIntensity!: number;
// }
type CurrentMaterial = MeshStandardMaterial | ShaderMaterial;
class TextureEnvMapParamsConfig extends EnvMapParamConfig(NodeParamsConfig) {}
interface Controllers {
	envMap: TextureEnvMapController;
}
abstract class TextureEnvMapMatNode extends TypedMatNode<CurrentMaterial, TextureEnvMapParamsConfig> {
	controllers!: Controllers;
	abstract createMaterial(): CurrentMaterial;
}

export class TextureEnvMapController extends BaseTextureMapController {
	constructor(protected node: TextureEnvMapMatNode, _update_options: UpdateOptions) {
		super(node, _update_options);
	}
	initializeNode() {
		this.add_hooks(this.node.p.useEnvMap, this.node.p.envMap);
	}
	async update() {
		this._update(this.node.material, 'envMap', this.node.p.useEnvMap, this.node.p.envMap);
		if (this._update_options.uniforms) {
			const mat = this.node.material as ShaderMaterial;
			mat.uniforms.envMapIntensity.value = this.node.pv.envMapIntensity;
			mat.uniforms.refractionRatio.value = this.node.pv.refractionRatio;
		}
		if (this._update_options.directParams) {
			const mat = this.node.material as MeshStandardMaterial;
			mat.envMapIntensity = this.node.pv.envMapIntensity;
			mat.refractionRatio = this.node.pv.refractionRatio;
		}
	}
	static async update(node: TextureEnvMapMatNode) {
		node.controllers.envMap.update();
	}
}
