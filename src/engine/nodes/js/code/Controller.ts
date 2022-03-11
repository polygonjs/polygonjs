import {Constructor, valueof} from '../../../../types/GlobalTypes';
import {TypedNode} from '../../_Base';
import {BaseJsFunctionAssembler} from './assemblers/_Base';
import {OutputJsNode} from '../Output';
import {GlobalsJsNode} from '../Globals';
import {JsNodeChildrenMap} from '../../../poly/registers/nodes/Js';
import {BaseJsNodeType} from '../_Base';
import {JsAssemblerNodeSpareParamsController} from './JsAssemblerNodeSpareParamsController';
import {NodeCreateOptions} from '../../utils/hierarchy/ChildrenController';

export class JsAssemblerControllerNode extends TypedNode<any, any> {
	override createNode<S extends keyof JsNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): JsNodeChildrenMap[S];
	override createNode<K extends valueof<JsNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K;
	override createNode<K extends valueof<JsNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K {
		return super.createNode(node_class, options) as K;
	}
	override children() {
		return super.children() as BaseJsNodeType[];
	}
	override nodesByType<K extends keyof JsNodeChildrenMap>(type: K): JsNodeChildrenMap[K][] {
		return super.nodesByType(type) as JsNodeChildrenMap[K][];
	}

	assembler_controller!: JsAssemblerController<BaseJsFunctionAssembler>;
}

type BaseJsFunctionAssemblerConstructor<A extends BaseJsFunctionAssembler> = new (...args: any[]) => A;
export class JsAssemblerController<A extends BaseJsFunctionAssembler> {
	protected _assembler!: A;
	private _spare_params_controller!: JsAssemblerNodeSpareParamsController;
	private _compile_required: boolean = true;

	constructor(private node: JsAssemblerControllerNode, assembler_class: BaseJsFunctionAssemblerConstructor<A>) {
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
		const globals = this.node.createNode('globals');
		const output = this.node.createNode('output');

		globals.uiData.setPosition(-200, 0);
		output.uiData.setPosition(200, 0);
	}

	set_compilation_required(new_state = true) {
		this._compile_required = new_state;
	}
	set_compilation_required_and_dirty(trigger_node?: BaseJsNodeType) {
		this.set_compilation_required();
		this.node.setDirty(trigger_node);
	}
	compileRequired(): boolean {
		return this._compile_required;
	}

	post_compile() {
		this.createSpareParameters();
		this.set_compilation_required(false);
	}

	//
	// Create spare params on mat nodes
	//
	createSpareParameters() {
		this._spare_params_controller.createSpareParameters();
	}
}

export type JsAssemblerControllerType = JsAssemblerController<BaseJsFunctionAssembler>;
