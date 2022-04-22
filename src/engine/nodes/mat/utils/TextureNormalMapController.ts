import {Constructor} from '../../../../types/GlobalTypes';
import {TypedMatNode} from '../_Base';
import {BaseTextureMapController, BooleanParamOptions, NodePathOptions} from './_BaseTextureController';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {TangentSpaceNormalMap, ObjectSpaceNormalMap} from 'three';
import {MeshPhysicalMaterial} from 'three';
import {MeshStandardMaterial} from 'three';
import {MeshPhongMaterial} from 'three';
import {MeshMatcapMaterial} from 'three';
import {MeshNormalMaterial} from 'three';
import {MeshToonMaterial} from 'three';
enum NormalMapMode {
	TANGENT = 'tangent',
	OBJECT = 'object',
}
const NORMAL_MAP_MODES: NormalMapMode[] = [NormalMapMode.TANGENT, NormalMapMode.OBJECT];
const NormalMapModeByName = {
	[NormalMapMode.TANGENT]: TangentSpaceNormalMap,
	[NormalMapMode.OBJECT]: ObjectSpaceNormalMap,
};

export function NormalMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle if you want to use a normal map */
		useNormalMap = ParamConfig.BOOLEAN(0, {
			separatorBefore: true,
			...BooleanParamOptions(TextureNormalMapController),
		});
		/** @param specify the normal map COP node */
		normalMap = ParamConfig.NODE_PATH('', NodePathOptions(TextureNormalMapController, 'useNormalMap'));
		/** @param type of normal map being used */
		normalMapType = ParamConfig.INTEGER(0, {
			visibleIf: {useNormalMap: 1},
			menu: {
				entries: NORMAL_MAP_MODES.map((name, value) => {
					return {name, value};
				}),
			},
		});
		/** @param How much the normal map affects the material. Typical ranges are 0-1 */
		normalScale = ParamConfig.VECTOR2([1, 1], {visibleIf: {useNormalMap: 1}});
		/** @param Normal Map Scale Multiplier, which multiples normalScale */
		normalScaleMult = ParamConfig.FLOAT(1, {
			range: [0, 1],
			rangeLocked: [false, false],
			visibleIf: {useNormalMap: 1},
		});
	};
}

// class TextureNormalMaterial extends Material {
// 	normalMap!: Texture | null;
// 	normalMapType!: number;
// 	normalScale!: Vector2;
// }
type TextureNormalMapControllerCurrentMaterial =
	| MeshPhongMaterial
	| MeshNormalMaterial
	| MeshMatcapMaterial
	| MeshPhysicalMaterial
	| MeshToonMaterial
	| MeshStandardMaterial;
class TextureNormalMapParamsConfig extends NormalMapParamConfig(NodeParamsConfig) {}
interface NormalMapControllers {
	normalMap: TextureNormalMapController;
}
abstract class TextureNormalMapMatNode extends TypedMatNode<
	TextureNormalMapControllerCurrentMaterial,
	TextureNormalMapParamsConfig
> {
	controllers!: NormalMapControllers;
	abstract override createMaterial(): TextureNormalMapControllerCurrentMaterial;
}

export class TextureNormalMapController extends BaseTextureMapController {
	constructor(protected override node: TextureNormalMapMatNode) {
		super(node);
	}
	initializeNode() {
		this.add_hooks(this.node.p.useNormalMap, this.node.p.normalMap);
	}
	override async update() {
		const {p, pv, material} = this.node;
		this._update(this.node.material, 'normalMap', p.useNormalMap, p.normalMap);
		const normalMapType = NormalMapModeByName[NORMAL_MAP_MODES[pv.normalMapType]];
		// if (this._update_options.uniforms) {
		// 	const mat = material as ShaderMaterial;
		// 	if (mat.uniforms) {
		// 		// mat.uniforms.normalMapType.value = normalMapType; // not present in uniforms
		// 		(mat.uniforms.normalScale as IUniformV2).value.copy(pv.normalScale).multiplyScalar(pv.normalScaleMult);
		// 	}
		// }
		const mat = material as MeshPhongMaterial;
		// normalMapType is set for uniforms AND directParams
		// to ensure that the USE_* defines are set
		mat.normalMapType = normalMapType;
		// if (this._update_options.directParams) {
		mat.normalScale.copy(pv.normalScale).multiplyScalar(pv.normalScaleMult);
		// }
	}
	static override async update(node: TextureNormalMapMatNode) {
		node.controllers.normalMap.update();
	}
}
