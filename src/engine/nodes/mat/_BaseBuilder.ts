import {TypedMatNode} from './_Base';
import {GlAssemblerController} from '../gl/code/Controller';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ShaderAssemblerMaterial} from '../gl/code/assemblers/materials/_BaseMaterial';
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
	initialize_base_node() {
		super.initialize_base_node();

		this.lifecycle.add_on_create_hook(this.assembler_controller.on_create.bind(this.assembler_controller));
		this.children_controller?.init();
	}

	//
	//
	// MATERIAL
	//
	//
	create_material() {
		return this.assembler_controller.assembler.create_material() as ShaderMaterialWithCustomMaterials;
	}
	//
	//
	// ASSEMBLER
	//
	//
	get assembler_controller() {
		return (this._assembler_controller = this._assembler_controller || this._create_assembler_controller());
	}
	protected abstract _create_assembler_controller(): GlAssemblerController<A>;

	create_node<K extends keyof GlNodeChildrenMap>(type: K): GlNodeChildrenMap[K] {
		return super.create_node(type) as GlNodeChildrenMap[K];
	}
	children() {
		return super.children() as BaseGlNodeType[];
	}
	nodes_by_type<K extends keyof GlNodeChildrenMap>(type: K): GlNodeChildrenMap[K][] {
		return super.nodes_by_type(type) as GlNodeChildrenMap[K][];
	}

	//
	//
	// COMPILATION
	//
	//
	async compile_if_required() {
		if (this.assembler_controller.compile_required()) {
			this._compile();
		}
	}
	protected async _compile() {
		if (this.material) {
			await this.assembler_controller.assembler.compile_material(this.material);
			await this.assembler_controller.post_compile();
		}
	}
}

export type BaseBuilderMatNodeType = TypedBuilderMatNode<ShaderAssemblerMaterial, NodeParamsConfig>;
