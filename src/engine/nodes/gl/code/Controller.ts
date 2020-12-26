import {TypedNode} from '../../_Base';
import {BaseGlShaderAssembler} from './assemblers/_Base';
import {GlobalsBaseController} from './globals/_Base';
import {GlobalsGeometryHandler} from './globals/Geometry';
import {OutputGlNode} from '../Output';
import {GlobalsGlNode} from '../Globals';
import {GlNodeChildrenMap} from '../../../poly/registers/nodes/Gl';
import {BaseGlNodeType} from '../_Base';
import {AssemblerNodeSpareParamsController} from './SpareParamsController';
import {ParamsInitData} from '../../utils/io/IOController';

export class BaseGlParentNode extends TypedNode<any, any> {
	createNode<S extends keyof GlNodeChildrenMap>(
		node_class: S,
		params_init_value_overrides?: ParamsInitData
	): GlNodeChildrenMap[S];
	createNode<K extends valueof<GlNodeChildrenMap>>(
		node_class: Constructor<K>,
		params_init_value_overrides?: ParamsInitData
	): K;
	createNode<K extends valueof<GlNodeChildrenMap>>(
		node_class: Constructor<K>,
		params_init_value_overrides?: ParamsInitData
	): K {
		return super.createNode(node_class, params_init_value_overrides) as K;
	}
	children() {
		return super.children() as BaseGlNodeType[];
	}
	nodesByType<K extends keyof GlNodeChildrenMap>(type: K): GlNodeChildrenMap[K][] {
		return super.nodesByType(type) as GlNodeChildrenMap[K][];
	}
}
export class AssemblerControllerNode extends BaseGlParentNode {
	assembler_controller: GlAssemblerController<BaseGlShaderAssembler> | undefined;
}

type BaseGlShaderAssemblerConstructor<A extends BaseGlShaderAssembler> = new (...args: any[]) => A;
export class GlAssemblerController<A extends BaseGlShaderAssembler> {
	protected _assembler!: A;
	private _spare_params_controller!: AssemblerNodeSpareParamsController;
	private _globals_handler: GlobalsBaseController | undefined = new GlobalsGeometryHandler();
	private _compile_required: boolean = true;

	constructor(private node: AssemblerControllerNode, assembler_class: BaseGlShaderAssemblerConstructor<A>) {
		this._assembler = new assembler_class(this.node);
		this._spare_params_controller = new AssemblerNodeSpareParamsController(this, this.node);
	}
	set_assembler_globals_handler(globals_handler: GlobalsBaseController) {
		const current_id = this._globals_handler ? this._globals_handler.id() : null;
		const new_id = globals_handler ? globals_handler.id() : null;

		if (current_id != new_id) {
			this._globals_handler = globals_handler;
			this.set_compilation_required_and_dirty();
			this._assembler.reset_configs();
		}
	}
	get assembler() {
		return this._assembler;
	}
	get globals_handler() {
		return this._globals_handler;
	}

	add_output_inputs(output_child: OutputGlNode) {
		this._assembler.add_output_inputs(output_child);
	}
	add_globals_outputs(globals_node: GlobalsGlNode) {
		this._assembler.add_globals_outputs(globals_node);
	}
	allow_attribute_exports() {
		return this._assembler.allow_attribute_exports();
	}

	set_compilation_required(new_state = true) {
		this._compile_required = new_state;
	}
	set_compilation_required_and_dirty(trigger_node?: BaseGlNodeType) {
		this.set_compilation_required();
		this.node.set_dirty(trigger_node);
	}
	compile_required(): boolean {
		return this._compile_required;
	}

	post_compile() {
		this.create_spare_parameters();
		this.set_compilation_required(false);
	}

	//
	// Create spare params on mat nodes
	//
	create_spare_parameters() {
		this._spare_params_controller.create_spare_parameters();
	}
}

export type GlAssemblerControllerType = GlAssemblerController<BaseGlShaderAssembler>;
