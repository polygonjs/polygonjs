import {TypedNode} from '../../_Base';
import {BaseJsFunctionAssembler} from './assemblers/_Base';
import {OutputJsNode} from '../Output';
import {GlobalsJsNode} from '../Globals';
import {JsNodeChildrenMap} from '../../../poly/registers/nodes/Js';
import {BaseJsNodeType} from '../_Base';
import {JsAssemblerNodeSpareParamsController} from './SpareParamsController';

export class AssemblerControllerNode extends TypedNode<any, any> {
	create_node<K extends keyof JsNodeChildrenMap>(type: K): JsNodeChildrenMap[K] {
		return super.create_node(type) as JsNodeChildrenMap[K];
	}
	children() {
		return super.children() as BaseJsNodeType[];
	}
	nodes_by_type<K extends keyof JsNodeChildrenMap>(type: K): JsNodeChildrenMap[K][] {
		return super.nodes_by_type(type) as JsNodeChildrenMap[K][];
	}

	assembler_controller!: JsAssemblerController<BaseJsFunctionAssembler>;
}

type BaseJsFunctionAssemblerConstructor<A extends BaseJsFunctionAssembler> = new (...args: any[]) => A;
export class JsAssemblerController<A extends BaseJsFunctionAssembler> {
	protected _assembler!: A;
	private _spare_params_controller!: JsAssemblerNodeSpareParamsController;
	private _compile_required: boolean = true;

	constructor(private node: AssemblerControllerNode, assembler_class: BaseJsFunctionAssemblerConstructor<A>) {
		this._assembler = new assembler_class(this.node);
		this._spare_params_controller = new JsAssemblerNodeSpareParamsController(this, this.node);
	}

	get assembler() {
		return this._assembler;
	}

	add_output_inputs(output_child: OutputJsNode) {
		this._assembler.add_output_inputs(output_child);
	}
	add_globals_outputs(globals_node: GlobalsJsNode) {
		this._assembler.add_globals_outputs(globals_node);
	}
	allow_attribute_exports() {
		return this._assembler.allow_attribute_exports();
	}

	on_create() {
		const globals = this.node.create_node('globals');
		const output = this.node.create_node('output');

		globals.ui_data.set_position(-200, 0);
		output.ui_data.set_position(200, 0);
	}

	set_compilation_required(new_state = true) {
		this._compile_required = new_state;
	}
	set_compilation_required_and_dirty(trigger_node?: BaseJsNodeType) {
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

export type JsAssemblerControllerType = JsAssemblerController<BaseJsFunctionAssembler>;
