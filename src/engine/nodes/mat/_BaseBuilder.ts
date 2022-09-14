import {CustomMaterialName} from './../../../core/geometry/Material';
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {TypedMatNode} from './_Base';
import {GlAssemblerController} from '../gl/code/Controller';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ShaderAssemblerMaterial} from '../gl/code/assemblers/materials/_BaseMaterial';
import {MaterialPersistedConfig} from '../gl/code/assemblers/materials/MaterialPersistedConfig';
import {GlNodeChildrenMap} from '../../poly/registers/nodes/Gl';
import {BaseGlNodeType} from '../gl/_Base';
import {MaterialWithCustomMaterials} from '../../../core/geometry/Material';
import {NodeContext} from '../../poly/NodeContext';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {BaseNodeType} from '../_Base';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';

export function BaseBuilderParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param if toggled on, the shader will be built from the gl nodes of another material. This can be useful to have multiple materials use the same gl network, but still set the uniforms differently */
		setBuilderNode = ParamConfig.BOOLEAN(0, {
			callback: (node: BaseNodeType) => {
				TypedBuilderMatNode.PARAM_CALLBACK_setCompileRequired(node as BaseBuilderMatNodeType);
			},
		});
		/** @param builder node */
		builderNode = ParamConfig.NODE_PATH('', {
			visibleIf: {setBuilderNode: true},
			callback: (node: BaseNodeType) => {
				TypedBuilderMatNode.PARAM_CALLBACK_setCompileRequired(node as BaseBuilderMatNodeType);
			},
		});
	};
}

class MatBuilderParamsConfig extends BaseBuilderParamConfig(NodeParamsConfig) {}

export abstract class TypedBuilderMatNode<
	M extends MaterialWithCustomMaterials,
	A extends ShaderAssemblerMaterial,
	K extends MatBuilderParamsConfig
> extends TypedMatNode<M, K> {
	protected _assemblerController: GlAssemblerController<A> | undefined;
	protected override _childrenControllerContext = NodeContext.GL;
	override readonly persisted_config: MaterialPersistedConfig = new MaterialPersistedConfig(this);

	//
	//
	// MATERIAL
	//
	//
	createMaterial() {
		let material: M | undefined;
		if (this.persisted_config) {
			material = this.persisted_config.material() as M;
		}
		if (!material) {
			material = this.assemblerController()?.assembler.createMaterial() as M;
		}
		return material;
	}
	//
	//
	// ASSEMBLER
	//
	//
	assemblerController() {
		return (this._assemblerController = this._assemblerController || this._createAssemblerController());
	}
	protected abstract _createAssemblerController(): GlAssemblerController<A> | undefined;
	customMaterialRequested(customName: CustomMaterialName): boolean {
		return true;
	}

	override createNode<S extends keyof GlNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): GlNodeChildrenMap[S];
	override createNode<K extends valueof<GlNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K;
	override createNode<K extends valueof<GlNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K {
		return super.createNode(node_class, options) as K;
	}
	override children() {
		return super.children() as BaseGlNodeType[];
	}
	override nodesByType<K extends keyof GlNodeChildrenMap>(type: K): GlNodeChildrenMap[K][] {
		return super.nodesByType(type) as GlNodeChildrenMap[K][];
	}
	override childrenAllowed() {
		if (this.assemblerController()) {
			return super.childrenAllowed();
		}
		this.scene().markAsReadOnly(this);
		return false;
	}

	//
	//
	// COMPILATION
	//
	//
	compileIfRequired() {
		/* if we recompile while in player mode, there will not be any children gl node created.
		So any recompilation will be flawed. A quick way to realise this is with a time dependent material.
		And while a scene export would not have an assembler and therefore not recompile,
		a temporary display of a scene will the whole engine player will have an assembler and will therefore recompile.
		UPDATE: the creation of children is not tied to the player mode anymore, only to the presence of the assembler.
		*/
		// if (Poly.playerMode()) {
		// 	return;
		// }
		if (this.assemblerController()?.compileRequired()) {
			try {
				this._compile();
			} catch (err) {
				const message = (err as any).message || 'failed to compile';
				this.states.error.set(message);
			}
		}
	}
	protected _compile() {
		const assemblerController = this.assemblerController();
		if (this.material && assemblerController) {
			assemblerController.assembler.setGlParentNode(this);
			this._setAssemblerGlParentNode(assemblerController);
			assemblerController.assembler.compileMaterial(this.material);
			assemblerController.post_compile();
		}
	}
	private _setAssemblerGlParentNode(assemblerController: GlAssemblerController<A>) {
		if (!isBooleanTrue(this.pv.setBuilderNode)) {
			return;
		}
		const resolvedNode = this.pv.builderNode.nodeWithContext(NodeContext.MAT);
		if (!resolvedNode) {
			return;
		}

		const resolvedBuilderNode = resolvedNode as BaseBuilderMatNodeType;
		if (!resolvedBuilderNode.assemblerController()) {
			this.states.error.set(`resolved node '${resolvedNode.path()}' is not a builder node`);
			return;
		}
		if (resolvedBuilderNode.type() != this.type()) {
			this.states.error.set(
				`resolved node '${resolvedNode.path()}' does not have the same type '${resolvedNode.type()}' as current node '${this.type()}'`
			);
			return;
		}

		assemblerController.assembler.setGlParentNode(resolvedBuilderNode);
	}

	static PARAM_CALLBACK_setCompileRequired(node: BaseBuilderMatNodeType) {
		node.PARAM_CALLBACK_setCompileRequired();
	}
	private PARAM_CALLBACK_setCompileRequired() {
		this.assemblerController()?.setCompilationRequired(true);
	}
}

export type BaseBuilderMatNodeType = TypedBuilderMatNode<
	MaterialWithCustomMaterials,
	ShaderAssemblerMaterial,
	MatBuilderParamsConfig
>;
