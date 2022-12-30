import {TypedNode} from '../_Base';
import {Material, MeshBasicMaterial} from 'three';
import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {FlagsControllerB} from '../utils/FlagsController';

/**
 * BaseMatNode is the base class for all nodes that process materials. This inherits from [BaseNode](/docs/api/BaseNode).
 *
 */
export abstract class TypedMatNode<M extends Material, K extends NodeParamsConfig> extends TypedNode<
	NodeContext.MAT,
	K
> {
	static override context(): NodeContext {
		return NodeContext.MAT;
	}

	protected _material: M | undefined;

	override initializeBaseNode() {
		super.initializeBaseNode();
		// this.io.outputs.setHasOneOutput();

		this.nameController.add_post_set_fullPath_hook(this.set_material_name.bind(this));

		this.addPostDirtyHook('_cookWhenDirty', () => {
			setTimeout(this._cookWhenDirtyBound, 0);
		});
	}

	protected _cookWhenDirtyBound = this._cookMainWithoutInputsWhenDirty.bind(this);
	protected async _cookMainWithoutInputsWhenDirty() {
		await this.cookController.cookMainWithoutInputs();
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

	setMaterial(material: M) {
		this._material = material;
		this._setContainer(material);
	}
}

const DUMMY_MATERIAL = new MeshBasicMaterial({color: 0x0000ff});
export class UpdateMatNode<M extends Material, K extends NodeParamsConfig> extends TypedMatNode<M, K> {
	override createMaterial() {
		return DUMMY_MATERIAL as any as M;
	}
	public override readonly flags: FlagsControllerB = new FlagsControllerB(this);

	protected override _cookWhenDirtyBound = this._cookMainWithoutInputsWhenDirty.bind(this);
	protected override async _cookMainWithoutInputsWhenDirty() {
		await this.cookController.cookMain();
	}

	override initializeBaseNode() {
		super.initializeBaseNode();
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.ALWAYS);
	}
}

export type BaseMatNodeType = TypedMatNode<Material, any>;
export class BaseMatNodeClass extends TypedMatNode<Material, any> {
	createMaterial() {
		return new Material();
	}
}
