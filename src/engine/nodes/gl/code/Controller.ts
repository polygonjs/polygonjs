import {Constructor, valueof} from '../../../../types/GlobalTypes';
import {TypedNode} from '../../_Base';
import {BaseGlShaderAssembler} from './assemblers/_Base';
import {GlobalsBaseController} from './globals/_Base';
import {GlobalsGeometryHandler} from './globals/Geometry';
import {OutputGlNode} from '../Output';
import {GlobalsGlNode} from '../Globals';
import {GlNodeChildrenMap} from '../../../poly/registers/nodes/Gl';
import {BaseGlNodeType} from '../_Base';
import {GlAssemblerNodeSpareParamsController} from './GlAssemblerNodeSpareParamsController';
import {NodeCreateOptions} from '../../utils/hierarchy/ChildrenController';

export class BaseGlParentNode extends TypedNode<any, any> {
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
}
export abstract class AssemblerGlControllerNode extends BaseGlParentNode {
	abstract assemblerController(): GlAssemblerController<BaseGlShaderAssembler> | undefined;
}

type BaseGlShaderAssemblerConstructor<A extends BaseGlShaderAssembler> = new (...args: any[]) => A;
export class GlAssemblerController<A extends BaseGlShaderAssembler> {
	protected _assembler!: A;
	private _spareParamsController!: GlAssemblerNodeSpareParamsController;
	private _globalsHandler: GlobalsBaseController | undefined = new GlobalsGeometryHandler();
	private _compile_required: boolean = true;

	constructor(private node: AssemblerGlControllerNode, assembler_class: BaseGlShaderAssemblerConstructor<A>) {
		this._assembler = new assembler_class(this.node);
		this._spareParamsController = new GlAssemblerNodeSpareParamsController(this, this.node);
	}
	setAssemblerGlobalsHandler(globalsHandler: GlobalsBaseController) {
		const current_id = this._globalsHandler ? this._globalsHandler.id() : null;
		const new_id = globalsHandler ? globalsHandler.id() : null;

		if (current_id != new_id) {
			this._globalsHandler = globalsHandler;
			this.setCompilationRequiredAndDirty();
			this._assembler.reset_configs();
		}
	}
	get assembler() {
		return this._assembler;
	}
	globalsHandler() {
		return this._globalsHandler;
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

	setCompilationRequired(newState = true) {
		this._compile_required = newState;
	}
	setCompilationRequiredAndDirty(triggerNode?: BaseGlNodeType) {
		this.setCompilationRequired();
		this.node.setDirty(triggerNode);
	}
	compileRequired(): boolean {
		return this._compile_required;
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

	addFilterFragmentShaderCallback(callbackName: string, callback: (s: string) => string) {
		this.assembler._addFilterFragmentShaderCallback(callbackName, callback);
		this.setCompilationRequired();
	}
	removeFilterFragmentShaderCallback(callbackName: string) {
		this.assembler._removeFilterFragmentShaderCallback(callbackName);
		this.setCompilationRequired();
	}
}

export type GlAssemblerControllerType = GlAssemblerController<BaseGlShaderAssembler>;
