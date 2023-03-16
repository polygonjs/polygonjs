import {Constructor, valueof} from '../../../types/GlobalTypes';
import {TypedSopNode} from './_Base';
// import {ShaderAssemblerParticles} from '../gl/code/assemblers/particles/Particles';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {NodeContext} from '../../poly/NodeContext';
import {CoreGroup} from '../../../core/geometry/Group';
// import {GlAssemblerController} from '../gl/code/Controller';
import {JsNodeChildrenMap} from '../../poly/registers/nodes/Js';
import {BaseJsNodeType} from '../js/_Base';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {AssemblerName} from '../../poly/registers/assemblers/_BaseRegister';
import {Poly} from '../../Poly';
import {JsAssemblerController} from '../js/code/Controller';
import {JsAssemblerSDF} from '../js/code/assemblers/sdf/SDF';
import {JsNodeFinder} from '../js/code/utils/NodeFinder';
import {Vector3} from 'three';
import {FunctionData, RegisterableVariable} from '../js/code/assemblers/_Base';

type SDFFunction = Function; //(p: any) => number;

class JSSDFSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new JSSDFSopParamsConfig();
export class JSSDFSopNode extends TypedSopNode<JSSDFSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.JS_SDF;
	}
	assemblerController() {
		return this._assemblerController;
	}
	public override usedAssembler(): Readonly<AssemblerName.JS_SDF> {
		return AssemblerName.JS_SDF;
	}
	protected _assemblerController = this._createAssemblerController();
	private _createAssemblerController(): JsAssemblerController<JsAssemblerSDF> | undefined {
		return Poly.assemblersRegister.assembler(this, this.usedAssembler());
	}

	// static PARAM_CALLBACK_reset(node: ParticlesSystemGpuSopNode) {
	// 	node.PARAM_CALLBACK_reset();
	// }
	// PARAM_CALLBACK_reset() {
	// 	// this.gpu_controller.reset_gpu_compute_and_set_dirty();
	// }

	// private _reset_material_if_dirty_bound = this._reset_material_if_dirty.bind(this);
	protected override _childrenControllerContext = NodeContext.JS;
	// private _on_create_prepare_material_bound = this._on_create_prepare_material.bind(this);
	override initializeNode() {
		this.io.inputs.setCount(1);
		// set to never at the moment
		// otherwise the input is cloned on every frame inside cook_main()
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);

		// this.addPostDirtyHook('_reset_material_if_dirty', this._reset_material_if_dirty_bound);

		// this.lifecycle.onCreated(this.assembler_controller.on_create.bind(this.assembler_controller));
		// this.lifecycle.onCreated(this._on_create_prepare_material_bound);
		// this.children_controller?.init({dependent: false});
	}

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

	override async cook(inputCoreGroups: CoreGroup[]) {
		// this.gpu_controller.set_restart_not_required();
		const coreGroup = inputCoreGroups[0];

		this.compileIfRequired();

		if (this._function) {
			this._position.set(0, 0, 0);
			console.log(this._function(...this._functionEvalArgs));
			this._position.set(1, 0, 0);
			console.log(this._function(...this._functionEvalArgs));
			this._position.set(2, 0, 0);
			console.log(this._function(...this._functionEvalArgs));
		}
		// const val = assemblerController.assembler

		// if (!this.render_controller.initialized) {
		// 	this.render_controller.init_core_group(core_group);
		// 	await this.render_controller.init_render_material();
		// }

		// this.gpu_controller.restart_simulation_if_required();
		// this.gpu_controller.compute_similation_if_required();

		// if (this.is_on_frame_start()) {
		// 	this.setCoreGroup(core_group);
		// } else {
		// 	this.cookController.end_cook();
		// }
		this.setCoreGroup(coreGroup);
	}
	async compileIfRequired() {
		if (this.assemblerController()?.compileRequired()) {
			await this.compile();
		}
	}
	private _position = new Vector3();
	private _functionData: FunctionData | undefined;
	private _functionCreationArgs: string[] = [];
	private _functionEvalArgs: (Function | RegisterableVariable)[] = [];
	private _function: SDFFunction | undefined;
	async compile() {
		const assemblerController = this.assemblerController();
		if (!assemblerController) {
			return;
		}
		const outputNodes: BaseJsNodeType[] = JsNodeFinder.findOutputNodes(this);
		if (outputNodes.length == 0) {
			this.states.error.set('one output node is required');
			return;
		}
		if (outputNodes.length > 1) {
			this.states.error.set('only one output node allowed');
			return;
		}
		const outputNode = outputNodes[0];
		if (outputNode) {
			//const param_nodes = GlNodeFinder.find_param_generating_nodes(this);
			const rootNodes = outputNodes; //.concat(param_nodes);
			assemblerController.assembler.set_root_nodes(rootNodes);

			// main compilation
			assemblerController.assembler.updateFragmentShader();

			// receives fragment and uniforms
			this._functionData = assemblerController.assembler.functionData();
			if (!this._functionData) {
				this.states.error.set('failed to compile ');
				return;
			}
			const {functionBody, variableNames, variablesByName, functionNames, functionsByName} = this._functionData;

			console.log(functionBody, variableNames, variablesByName, functionNames, functionsByName);
			const wrappedBody = `
			try {
				${functionBody}
			} catch(e) {
				_setErrorFromError(e)
				return 0;
			}`;
			// console.log(wrappedBody);
			const _setErrorFromError = (e: Error) => {
				this.states.error.set(e.message);
			};
			this._functionCreationArgs = [
				'position',
				...variableNames,
				...functionNames,
				'_setErrorFromError',
				wrappedBody,
			];
			const variables: RegisterableVariable[] = [];
			const functions: Function[] = [];
			for (const variableName of variableNames) {
				const variable = variablesByName[variableName];
				variables.push(variable);
			}
			for (const functionName of functionNames) {
				const _func = functionsByName[functionName];
				functions.push(_func);
			}
			this._functionEvalArgs = [this._position, ...variables, ...functions, _setErrorFromError];

			// console.log(this._functionCreationArgs, this._functionEvalArgs);
			try {
				this._function = new Function(...this._functionCreationArgs) as SDFFunction;
			} catch (e) {
				console.warn(e);
				// this.set_error('cannot generate function');
			}

			// console.log('fragmentShader', fragmentShader);
			// const uniforms = assemblerController.assembler.uniforms();
			// if (fragmentShader && uniforms) {
			// this._fragmentShader = fragmentShader;
			// this._uniforms = uniforms;
			// }

			// handleCopBuilderDependencies({
			// 	node: this,
			// 	timeDependent: assemblerController.assembler.uniformsTimeDependent(),
			// 	uniforms: undefined,
			// });
		}

		// if (this._fragmentShader && this._uniforms) {
		// 	this.textureMaterial.fragmentShader = this._fragmentShader;
		// 	this.textureMaterial.uniforms = this._uniforms;
		// 	this.textureMaterial.needsUpdate = true;
		// 	this.textureMaterial.uniforms.resolution = {
		// 		value: this.pv.resolution,
		// 	};
		// }
		assemblerController.post_compile();

		// const root_nodes = this._find_root_nodes();
		// if (root_nodes.length > 0) {
		// 	this.assembler_controller.set_assembler_globalsHandler(globalsHandler);
		// 	this.assembler_controller.assembler.set_root_nodes(root_nodes);
		// 	await this.assembler_controller.assembler.compile();
		// 	await this.assembler_controller.post_compile();
		// }
		// const shaders_by_name: Map<ShaderName, string> = this.assembler_controller.assembler.shaders_by_name();
	}

	// private _find_root_nodes() {
	// 	// const nodes: BaseGlNodeType[] = GlNodeFinder.find_attribute_export_nodes(this);
	// 	// const output_nodes = GlNodeFinder.find_output_nodes(this);
	// 	// if (output_nodes.length > 1) {
	// 	// 	this.states.error.set('only one output node is allowed');
	// 	// 	return [];
	// 	// }
	// 	// const output_node = output_nodes[0];
	// 	// if (output_node) {
	// 	// 	nodes.push(output_node);
	// 	// }
	// 	// return nodes;
	// }
}
