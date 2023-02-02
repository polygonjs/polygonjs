import {TypedNode} from '../_Base';
import {Material} from 'three';
import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {FlagsControllerB} from '../utils/FlagsController';
import {BaseController, MaterialTexturesRecord, SetParamsTextureNodesRecord} from './utils/_BaseController';
import {ArrayUtils} from '../../../core/ArrayUtils';

/**
 *
 *
 * TypedMatNode is the base class for all nodes that process materials. This inherits from [TypedNode](/docs/api/TypedNode).
 *
 */
export abstract class TypedMatNode<M extends Material, K extends NodeParamsConfig> extends TypedNode<
	NodeContext.MAT,
	K
> {
	static override context(): NodeContext {
		return NodeContext.MAT;
	}

	override initializeBaseNode() {
		super.initializeBaseNode();
		this.io.outputs.setHasOneOutput();

		this.addPostDirtyHook('_cookWhenDirty', () => {
			setTimeout(this._cookWhenDirtyBound, 0);
		});
	}

	protected _cookWhenDirtyBound = this._cookMainWithoutInputsWhenDirty.bind(this);
	protected async _cookMainWithoutInputsWhenDirty() {
		await this.cookController.cookMainWithoutInputs();
	}

	abstract material(): Promise<M | undefined>;

	setMaterial(material: M) {
		this._setContainer(material);
	}
}

export abstract class PrimitiveMatNode<M extends Material, K extends NodeParamsConfig> extends TypedMatNode<M, K> {
	protected _material: M | undefined;
	abstract createMaterial(): M;
	__materialSync__() {
		return (this._material = this._material || this.createMaterial());
	}
	async material() {
		const container = await this.compute();
		// return this.materialSync();
		return container.material() as M;
	}
	override initializeBaseNode() {
		super.initializeBaseNode();
		this.nameController.add_post_set_fullPath_hook(this.set_material_name.bind(this));
	}
	private set_material_name() {
		if (this._material) {
			this._material.name = this.path();
		}
	}
	override setMaterial(material: M) {
		this._material = material;
		super.setMaterial(material);
	}
	getTextures(material: M, record: MaterialTexturesRecord) {
		for (let controller of this.controllersList) {
			controller.getTextures(material, record);
		}
	}
	setParamsFromMaterial(material: M, record: SetParamsTextureNodesRecord) {
		for (let controller of this.controllersList) {
			controller.setParamsFromMaterial(material, record);
		}
	}

	protected controllersList: Array<BaseController> = [];
	protected controllersPromises(material: M): Array<void | Promise<void>> {
		return ArrayUtils.compact(this.controllersList.map((controller) => controller.updateMaterial(material)));
	}
	override initializeNode() {
		this.params.onParamsCreated('init controllers', () => {
			for (let controller of this.controllersList) {
				controller.initializeNode();
			}
		});
	}
}

export class UpdateMatNode<M extends Material, K extends NodeParamsConfig> extends TypedMatNode<M, K> {
	public override readonly flags: FlagsControllerB = new FlagsControllerB(this);

	protected override _cookWhenDirtyBound = this._cookMainWithoutInputsWhenDirty.bind(this);
	protected override async _cookMainWithoutInputsWhenDirty() {
		await this.cookController.cookMain();
	}

	async material() {
		const container = await this.compute();
		return container.material() as M | undefined;
	}

	override initializeBaseNode() {
		super.initializeBaseNode();
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.ALWAYS);
	}
}

export type BaseMatNodeType = TypedMatNode<Material, any>;
export type BasePrimitiveMatNodeType = PrimitiveMatNode<Material, any>;
export class BaseMatNodeClass extends TypedMatNode<Material, any> {
	// createMaterial() {
	// 	return new Material();
	// }
	async material() {
		const container = await this.compute();
		return container.material() as Material | undefined;
	}
}
