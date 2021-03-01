import {Constructor} from '../../../../types/GlobalTypes';
import {TypedMatNode} from '../_Base';
import {
	BaseTextureMapController,
	BooleanParamOptions,
	OperatorPathOptions,
	UpdateOptions,
} from './_BaseTextureController';
import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {MeshStandardMaterial} from 'three/src/materials/MeshStandardMaterial';
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
import {Material} from 'three/src/materials/Material';
import {Texture} from 'three/src/textures/Texture';
export function BumpMapParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param toggle if you want to use a bump map */
		useBumpMap = ParamConfig.BOOLEAN(0, {
			separatorBefore: true,
			...BooleanParamOptions(TextureBumpMapController),
		});
		/** @param specify the bump map COP node */
		bumpMap = ParamConfig.NODE_PATH('', OperatorPathOptions(TextureBumpMapController, 'useBumpMap'));
		/** @param bump scale */
		bumpScale = ParamConfig.FLOAT(1, {
			range: [0, 1],
			rangeLocked: [false, false],
			...OperatorPathOptions(TextureBumpMapController, 'useBumpMap'),
		});
		/** @param bump bias */
		bumpBias = ParamConfig.FLOAT(0, {
			range: [0, 1],
			rangeLocked: [false, false],
			...OperatorPathOptions(TextureBumpMapController, 'useBumpMap'),
		});
	};
}
class TextureBumpMaterial extends Material {
	bumpMap!: Texture | null;
	bumpScale!: number;
}
type CurrentMaterial = TextureBumpMaterial | ShaderMaterial;
class TextureBumpMapParamsConfig extends BumpMapParamConfig(NodeParamsConfig) {}
interface Controllers {
	bumpMap: TextureBumpMapController;
}
abstract class TextureBumpMapMatNode extends TypedMatNode<CurrentMaterial, TextureBumpMapParamsConfig> {
	controllers!: Controllers;
	abstract createMaterial(): CurrentMaterial;
}

export class TextureBumpMapController extends BaseTextureMapController {
	constructor(protected node: TextureBumpMapMatNode, _update_options: UpdateOptions) {
		super(node, _update_options);
	}
	initializeNode() {
		this.add_hooks(this.node.p.useBumpMap, this.node.p.bumpMap);
	}
	async update() {
		this._update(this.node.material, 'bumpMap', this.node.p.useBumpMap, this.node.p.bumpMap);
		if (this._update_options.uniforms) {
			const mat = this.node.material as ShaderMaterial;
			mat.uniforms.bumpScale.value = this.node.pv.bumpScale;
		}
		if (this._update_options.directParams) {
			const mat = this.node.material as MeshStandardMaterial;
			mat.bumpScale = this.node.pv.bumpScale;
		}
	}
	static async update(node: TextureBumpMapMatNode) {
		node.controllers.bumpMap.update();
	}
}
