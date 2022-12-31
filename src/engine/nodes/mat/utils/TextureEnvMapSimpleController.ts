import {Constructor} from '../../../../types/GlobalTypes';
import {TypedMatNode} from '../_Base';
import {BaseTextureMapController, BooleanParamOptions, NodePathOptions} from './_BaseTextureController';
import {Material, MeshBasicMaterial} from 'three';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {MultiplyOperation, MixOperation, AddOperation} from 'three';
import {CopType} from '../../../poly/registers/nodes/types/Cop';
import {MeshLambertMaterial} from 'three';
import {MeshPhongMaterial} from 'three';

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

type TextureEnvMapSimpleCurrentMaterial = MeshBasicMaterial | MeshLambertMaterial | MeshPhongMaterial;
function _isValidMaterial(material?: Material): material is TextureEnvMapSimpleCurrentMaterial {
	if (!material) {
		return false;
	}
	return (material as MeshBasicMaterial).reflectivity != null;
}
class TextureEnvMapSimpleParamsConfig extends EnvMapSimpleParamConfig(NodeParamsConfig) {}
export interface TextureEnvMapSimpleControllers {
	envMap: TextureEnvMapSimpleController;
}
abstract class TextureEnvMapSimpleMatNode extends TypedMatNode<
	TextureEnvMapSimpleCurrentMaterial,
	TextureEnvMapSimpleParamsConfig
> {
	controllers!: TextureEnvMapSimpleControllers;
	async material() {
		const container = await this.compute();
		return container.material() as TextureEnvMapSimpleCurrentMaterial | undefined;
	}
}

export class TextureEnvMapSimpleController extends BaseTextureMapController {
	constructor(protected override node: TextureEnvMapSimpleMatNode) {
		super(node);
	}
	override initializeNode() {
		this.add_hooks(this.node.p.useEnvMap, this.node.p.envMap);
	}
	static override async update(node: TextureEnvMapSimpleMatNode) {
		node.controllers.envMap.update();
	}
	override async update() {
		const material = await this.node.material();
		if (!_isValidMaterial(material)) {
			return;
		}

		await this.updateMaterial(material);
	}
	override async updateMaterial(material: TextureEnvMapSimpleCurrentMaterial) {
		await this._update(material, 'envMap', this.node.p.useEnvMap, this.node.p.envMap);
		const combine = OperationByName[COMBINE_OPERATIONS[this.node.pv.combine]];

		material.combine = combine;
		material.reflectivity = this.node.pv.reflectivity;
		material.refractionRatio = this.node.pv.refractionRatio;
	}
}
