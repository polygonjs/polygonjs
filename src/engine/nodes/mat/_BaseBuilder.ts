import {TypedMatNode} from './_Base';
import {GlAssemblerController} from '../gl/code/Controller';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ShaderAssemblerMaterial} from '../gl/code/assemblers/materials/_BaseMaterial';
import {BaseMaterialPersistedConfig} from '../gl/code/assemblers/materials/PersistedConfig';
import {GlNodeChildrenMap} from '../../poly/registers/nodes/Gl';
import {BaseGlNodeType} from '../gl/_Base';
import {ShaderMaterialWithCustomMaterials} from '../../../core/geometry/Material';
import {NodeContext} from '../../poly/NodeContext';

export abstract class TypedBuilderMatNode<
	A extends ShaderAssemblerMaterial,
	K extends NodeParamsConfig
> extends TypedMatNode<ShaderMaterialWithCustomMaterials, K> {
	protected _assembler_controller: GlAssemblerController<A> | undefined;
	protected _children_controller_context = NodeContext.GL;
	readonly persisted_config: BaseMaterialPersistedConfig = new BaseMaterialPersistedConfig(this);

	initialize_base_node() {
		super.initialize_base_node();

		if (this.assembler_controller) {
			this.lifecycle.add_on_create_hook(this.assembler_controller.on_create.bind(this.assembler_controller));
		}
	}

	//
	//
	// MATERIAL
	//
	//
	create_material() {
		let material: ShaderMaterialWithCustomMaterials | undefined;
		if (this.persisted_config) {
			material = this.persisted_config.material();
		}
		if (!material) {
			material = this.assembler_controller?.assembler.create_material() as ShaderMaterialWithCustomMaterials;
		}
		return material;
	}
	//
	//
	// ASSEMBLER
	//
	//
	get assembler_controller() {
		return (this._assembler_controller = this._assembler_controller || this._create_assembler_controller());
	}
	protected abstract _create_assembler_controller(): GlAssemblerController<A> | undefined;

	create_node<K extends keyof GlNodeChildrenMap>(type: K): GlNodeChildrenMap[K] {
		return super.create_node(type) as GlNodeChildrenMap[K];
	}
	children() {
		return super.children() as BaseGlNodeType[];
	}
	nodes_by_type<K extends keyof GlNodeChildrenMap>(type: K): GlNodeChildrenMap[K][] {
		return super.nodes_by_type(type) as GlNodeChildrenMap[K][];
	}
	children_allowed() {
		if (this.assembler_controller) {
			return super.children_allowed();
		}
		return false;
	}

	//
	//
	// COMPILATION
	//
	//
	compile_if_required() {
		/* if we recompile while in player mode, there will not be any children gl node created.
		So any recompilation will be flawed. A quick way to realise this is with a time dependent material.
		And while a scene export would not have an assembler and therefore not recompile,
		a temporary display of a scene will the whole engine player will have an assembler and will therefore recompile.
		UPDATE: the creation of children is not tied to the player mode anymore, only to the presence of the assembler.
		*/
		// if (Poly.instance().player_mode()) {
		// 	return;
		// }
		if (this.assembler_controller?.compile_required()) {
			this._compile();
		}
	}
	protected _compile() {
		if (this.material && this.assembler_controller) {
			this.assembler_controller.assembler.compile_material(this.material);
			this.assembler_controller.post_compile();
		}
	}
}

export type BaseBuilderMatNodeType = TypedBuilderMatNode<ShaderAssemblerMaterial, NodeParamsConfig>;
