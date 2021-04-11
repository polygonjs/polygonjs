import {TypedNode} from '../_Base';
import {Material} from 'three/src/materials/Material';
import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';

export abstract class TypedMatNode<M extends Material, K extends NodeParamsConfig> extends TypedNode<
	NodeContext.MAT,
	K
> {
	static context(): NodeContext {
		return NodeContext.MAT;
	}

	protected _material: M | undefined;

	initializeBaseNode() {
		super.initializeBaseNode();

		this.nameController.add_post_set_fullPath_hook(this.set_material_name.bind(this));

		this.addPostDirtyHook('_cook_main_without_inputs_when_dirty', () => {
			setTimeout(this._cook_main_without_inputs_when_dirty_bound, 0);
		});
	}

	private _cook_main_without_inputs_when_dirty_bound = this._cook_main_without_inputs_when_dirty.bind(this);
	private async _cook_main_without_inputs_when_dirty() {
		await this.cookController.cook_main_without_inputs();
	}

	private set_material_name() {
		if (this._material) {
			this._material.name = this.path();
		}
	}

	abstract createMaterial(): M;
	get material() {
		return (this._material = this._material || this.createMaterial());
	}
	//

	setMaterial(material: Material) {
		this._setContainer(material);
	}
}

export type BaseMatNodeType = TypedMatNode<Material, any>;
export class BaseMatNodeClass extends TypedMatNode<Material, any> {
	createMaterial() {
		return new Material();
	}
}
