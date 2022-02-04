import {Constructor} from '../../../../types/GlobalTypes';
import {TypedMatNode} from '../_Base';
import {BaseTextureMapController, BooleanParamOptions, NodePathOptions} from './_BaseTextureController';
import {MeshBasicMaterial} from 'three/src/materials/MeshBasicMaterial';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {MultiplyOperation, MixOperation, AddOperation} from 'three/src/constants';
import {CopType} from '../../../poly/registers/nodes/types/Cop';
import {MeshLambertMaterial} from 'three/src/materials/MeshLambertMaterial';
import {MeshPhongMaterial} from 'three/src/materials/MeshPhongMaterial';

enum CombineOperation {
	MULT = 'mult',
	ADD = 'add',
	MIX = 'mix',
}
const COMBINE_OPERATIONS: CombineOperation[] = [CombineOperation.MULT, CombineOperation.ADD, CombineOperation.MIX];
const OperationByName = {
	[CombineOperation.MULT]: MultiplyOperation,
	[CombineOperation.ADD]: AddOperation,
	[CombineOperation.MIX]: MixOperation,
};

export function EnvMapSimpleParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle if you want to use an environment map */
		useEnvMap = ParamConfig.BOOLEAN(0, {
			separatorBefore: true,
			...BooleanParamOptions(TextureEnvMapSimpleController),
		});
		/** @param specify the environment map COP node. Note that this only works with CubeCamera */
		envMap = ParamConfig.NODE_PATH(
			'',
			NodePathOptions(TextureEnvMapSimpleController, 'useEnvMap', {types: [CopType.CUBE_CAMERA]})
		);
		/** @param defines how the env map is combined with the color */
		combine = ParamConfig.INTEGER(0, {
			visibleIf: {useEnvMap: 1},
			menu: {
				entries: COMBINE_OPERATIONS.map((name, value) => {
					return {name, value};
				}),
			},
		});
		/** @param environment intensity */
		reflectivity = ParamConfig.FLOAT(1, {visibleIf: {useEnvMap: 1}});
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
type CurrentMaterial = MeshBasicMaterial | MeshLambertMaterial | MeshPhongMaterial;
class TextureEnvMapParamsConfig extends EnvMapSimpleParamConfig(NodeParamsConfig) {}
interface Controllers {
	envMap: TextureEnvMapSimpleController;
}
abstract class TextureEnvMapMatNode extends TypedMatNode<CurrentMaterial, TextureEnvMapParamsConfig> {
	controllers!: Controllers;
	abstract override createMaterial(): CurrentMaterial;
}

export class TextureEnvMapSimpleController extends BaseTextureMapController {
	constructor(protected override node: TextureEnvMapMatNode) {
		super(node);
	}
	initializeNode() {
		this.add_hooks(this.node.p.useEnvMap, this.node.p.envMap);
	}
	override async update() {
		this._update(this.node.material, 'envMap', this.node.p.useEnvMap, this.node.p.envMap);
		const combine = OperationByName[COMBINE_OPERATIONS[this.node.pv.combine]];
		// if (this._update_options.uniforms) {
		// 	const mat = this.node.material as ShaderMaterial;
		// 	if (mat.uniforms) {
		// 		// mat.uniforms.combine.value = combine; // combine is not present in the uniforms
		// 		mat.uniforms.reflectivity.value = this.node.pv.reflectivity;
		// 		mat.uniforms.refractionRatio.value = this.node.pv.refractionRatio;
		// 	}
		// }
		// if (this._update_options.directParams) {
		const mat = this.node.material as MeshBasicMaterial;
		mat.combine = combine;
		mat.reflectivity = this.node.pv.reflectivity;
		mat.refractionRatio = this.node.pv.refractionRatio;
		// }
	}
	static override async update(node: TextureEnvMapMatNode) {
		node.controllers.envMap.update();
	}
}
