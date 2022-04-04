import {Constructor} from '../../../../types/GlobalTypes';
import {TypedMatNode} from '../_Base';
import {BaseTextureMapController, BooleanParamOptions, NodePathOptions} from './_BaseTextureController';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {MeshPhongMaterial} from 'three/src/materials/MeshPhongMaterial';
import {MeshStandardMaterial} from 'three/src/materials/MeshStandardMaterial';
import {MeshPhysicalMaterial} from 'three/src/materials/MeshPhysicalMaterial';
export function EnvMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle if you want to use an environment map */
		useEnvMap = ParamConfig.BOOLEAN(0, {
			separatorBefore: true,
			...BooleanParamOptions(TextureEnvMapController),
		});
		/** @param specify the environment map COP node */
		envMap = ParamConfig.NODE_PATH('', NodePathOptions(TextureEnvMapController, 'useEnvMap'));
		/** @param environment intensity */
		envMapIntensity = ParamConfig.FLOAT(1, {visibleIf: {useEnvMap: 1}});
		/** @param refraction ratio */
		// refractionRatio = ParamConfig.FLOAT(0.98, {
		// 	range: [-1, 1],
		// 	rangeLocked: [false, false],
		// 	visibleIf: {useEnvMap: 1},
		// });
	};
}
// class TextureEnvMaterial extends Material {
// 	envMap!: Texture | null;
// 	envMapIntensity!: number;
// }
type TextureEnvMapControllerCurrentMaterial = MeshPhongMaterial | MeshStandardMaterial | MeshPhysicalMaterial;
class TextureEnvMapParamsConfig extends EnvMapParamConfig(NodeParamsConfig) {}
interface EnvMapControllers {
	envMap: TextureEnvMapController;
}
abstract class TextureEnvMapMatNode extends TypedMatNode<
	TextureEnvMapControllerCurrentMaterial,
	TextureEnvMapParamsConfig
> {
	controllers!: EnvMapControllers;
	abstract override createMaterial(): TextureEnvMapControllerCurrentMaterial;
}

export class TextureEnvMapController extends BaseTextureMapController {
	constructor(protected override node: TextureEnvMapMatNode) {
		super(node);
	}
	initializeNode() {
		this.add_hooks(this.node.p.useEnvMap, this.node.p.envMap);
	}
	override async update() {
		this._update(this.node.material, 'envMap', this.node.p.useEnvMap, this.node.p.envMap);
		const mat = this.node.material as MeshStandardMaterial;
		mat.envMapIntensity = this.node.pv.envMapIntensity;
		// mat.refractionRatio = this.node.pv.refractionRatio; // TODO: consider re-allowing this for Phong and Basic materials
	}
	static override async update(node: TextureEnvMapMatNode) {
		node.controllers.envMap.update();
	}
}
