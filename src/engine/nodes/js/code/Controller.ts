import {Constructor, valueof} from '../../../../types/GlobalTypes';
import {TypedNode} from '../../_Base';
import {BaseJsShaderAssembler} from './assemblers/_Base';
import {GlobalsBaseController} from './globals/_Base';
import {GlobalsGeometryHandler} from './globals/Geometry';
import {OutputJsNode} from '../Output';
import {GlobalsJsNode} from '../Globals';
import {JsNodeChildrenMap} from '../../../poly/registers/nodes/Js';
import {BaseJsNodeType} from '../_Base';
import {JsAssemblerNodeSpareParamsController} from './JsAssemblerNodeSpareParamsController';
import {NodeCreateOptions} from '../../utils/hierarchy/ChildrenController';

export class BaseJsParentNode extends TypedNode<any, any> {
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
}
export abstract class AssemblerControllerNode extends BaseJsParentNode {
	abstract assemblerController(): JsAssemblerController<BaseJsShaderAssembler> | undefined;
	abstract compile(): void;
}

type BaseJsShaderAssemblerConstructor<A extends BaseJsShaderAssembler> = new (...args: any[]) => A;
export class JsAssemblerController<A extends BaseJsShaderAssembler> {
	protected _assembler!: A;
	private _spareParamsController!: JsAssemblerNodeSpareParamsController;
	private _globalsHandler: GlobalsBaseController | undefined = new GlobalsGeometryHandler();
	private _compileRequired: boolean = true;

	constructor(private node: AssemblerControllerNode, assembler_class: BaseJsShaderAssemblerConstructor<A>) {
		this._assembler = new assembler_class(this.node);
		this._spareParamsController = new JsAssemblerNodeSpareParamsController(this, this.node);
	}
	setAssemblerGlobalsHandler(globalsHandler: GlobalsBaseController) {
		const current_id = this._globalsHandler ? this._globalsHandler.id() : null;
		const new_id = globalsHandler ? globalsHandler.id() : null;

		if (current_id != new_id) {
			this._globalsHandler = globalsHandler;
			this.setCompilationRequiredAndDirty();
			this._assembler.resetConfigs();
		}
	}
	get assembler() {
		return this._assembler;
	}
	globalsHandler() {
		return this._globalsHandler;
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

	setCompilationRequired(newState = true) {
		this._compileRequired = newState;
	}
	setCompilationRequiredAndDirty(triggerNode?: BaseJsNodeType) {
		this.setCompilationRequired();
		if (this._assembler.makeFunctionNodeDirtyOnRecompileRequired()) {
			this.node.setDirty(triggerNode);
		} else {
			this.node.compile();
		}
	}
	compileRequired(): boolean {
		return this._compileRequired;
	}

	post_compile() {
		this.createSpareParameters();
		this.setCompilationRequired(false);
	}

	//
	// Create spare params on mat nodes
	//
	createSpareParameters() {
		this._spareParamsController.createSpareParameters();
	}

	// addFilterFragmentShaderCallback(callbackName: string, callback: (s: string) => string) {
	// 	this.assembler._addFilterFragmentShaderCallback(callbackName, callback);
	// 	this.setCompilationRequired();
	// }
	// removeFilterFragmentShaderCallback(callbackName: string) {
	// 	this.assembler._removeFilterFragmentShaderCallback(callbackName);
	// 	this.setCompilationRequired();
	// }
}

export type JsAssemblerControllerType = JsAssemblerController<BaseJsShaderAssembler>;
