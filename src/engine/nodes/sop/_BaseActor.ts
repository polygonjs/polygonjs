/**
 * Assigns actor nodes to input objects
 *
 *
 */

import {TypedSopNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {NodeContext} from '../../poly/NodeContext';
import {JsNodeChildrenMap} from '../../poly/registers/nodes/Js';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {BaseJsNodeType} from '../js/_Base';
import {AssemblerName} from '../../poly/registers/assemblers/_BaseRegister';
import {JsAssemblerController} from '../js/code/Controller';
import {JsAssemblerActor} from '../js/code/assemblers/actor/ActorAssembler';
import {Poly} from '../../Poly';
import {JsNodeFinder} from '../js/code/utils/NodeFinder';
import {ActorEvaluator} from '../js/code/assemblers/actor/Evaluator';
// import {SopType} from '../../poly/registers/nodes/types/Sop';
import {ActorEvaluatorGenerator} from '../js/code/assemblers/actor/EvaluatorGenerator';
import {ActorFunctionData, ActorPersistedConfig} from '../js/code/assemblers/actor/ActorPersistedConfig';
import {computed, ref, watch} from '../../../core/reactivity/CoreReactivity';
import {RegisterableVariable} from '../js/code/assemblers/_BaseJsPersistedConfigUtils';
import {SetUtils} from '../../../core/SetUtils';
import {FUNCTION_UTILS} from '../../functions/_FunctionUtils';
// class ActorJsSopParamsConfig extends NodeParamsConfig {
// 	/** @param select which objects this applies the actor behavior to */
// 	// objectsMask = ParamConfig.STRING('', {
// 	// 	objectMask: true,
// 	// });
// 	/** @param build actor from child nodes */
// 	// useThisNode = ParamConfig.BOOLEAN(1, {
// 	// 	separatorAfter: true,
// 	// });
// 	// /** @param actor node */
// 	// node = ParamConfig.NODE_PATH('', {
// 	// 	visibleIf: {useThisNode: 0},
// 	// 	nodeSelection: {
// 	// 		types: [NetworkNodeType.ACTOR],
// 	// 	},
// 	// 	dependentOnFoundNode: false,
// 	// 	separatorAfter: true,
// 	// });
// }
// const ParamsConfig = new ActorJsSopParamsConfig();

export class TypedActorSopNode<K extends NodeParamsConfig> extends TypedSopNode<K> {
	// override readonly paramsConfig = ParamsConfig;
	// static override type() {
	// 	return SopType.ACTOR_JS;
	// }

	//
	// ASSEMBLERS
	//
	override readonly persisted_config: ActorPersistedConfig = new ActorPersistedConfig(this);
	assemblerController() {
		return this._assemblerController;
	}
	public override usedAssembler(): Readonly<AssemblerName.JS_ACTOR> {
		return AssemblerName.JS_ACTOR;
	}
	protected _assemblerController = this._createAssemblerController();
	private _createAssemblerController(): JsAssemblerController<JsAssemblerActor> | undefined {
		return Poly.assemblersRegister.assembler(this, this.usedAssembler());
	}

	//
	// CHILDREN
	//
	protected override _childrenControllerContext = NodeContext.JS;
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
	override childrenAllowed() {
		if (this.assemblerController()) {
			return super.childrenAllowed();
		}
		return false;
	}
	override sceneReadonly() {
		return this.assemblerController() == null;
	}

	//
	//
	//

	// override cook(inputCoreGroups: CoreGroup[]) {
	// 	// compile
	// 	this.compileIfRequired();

	// 	//
	// 	const coreGroup = inputCoreGroups[0];
	// 	const objects = coreGroup.threejsObjects();
	// 	const actorNode = this._findActorNode();
	// 	if (actorNode) {
	// 		const objectsMask = this.pv.objectsMask.trim();
	// 		if (objectsMask == '') {
	// 			for (let object of objects) {
	// 				this.scene().actorsManager.assignActorBuilder(object, actorNode);
	// 			}
	// 		} else {
	// 			for (let object of objects) {
	// 				const children = CorePath.objectsByMaskInObject(objectsMask, object);
	// 				for (let child of children) {
	// 					this.scene().actorsManager.assignActorBuilder(child, actorNode);
	// 				}
	// 			}
	// 		}
	// 	}

	// 	this.setCoreGroup(coreGroup);
	// }
	// protected _findActorNode() {
	// 	if (isBooleanTrue(this.pv.useThisNode)) {
	// 		return this;
	// 	} else {
	// 		return this.pv.node.node() as ActorBuilderNode | undefined;
	// 	}
	// }
	async compileIfRequired() {
		if (this.assemblerController()?.compileRequired()) {
			await this.compile();
		}
	}

	private _evaluatorGenerator: ActorEvaluatorGenerator = new ActorEvaluatorGenerator(
		(object) => new ActorEvaluator(this, object)
	);
	evaluatorGenerator() {
		return this._evaluatorGenerator;
	}
	private _functionData: ActorFunctionData | undefined;
	functionData() {
		return this._functionData;
	}
	updateFromFunctionData(functionData: ActorFunctionData) {
		this._functionData = functionData;
		const {functionBody, variableNames, variablesByName, functionNames, functionsByName, paramConfigs, eventDatas} =
			this._functionData;

		const wrappedBody = `
			try {
				${functionBody}
			} catch(e) {
				console.log(e);
				_setErrorFromError(e)
				return null
			}`;
		const _setErrorFromError = (e: Error) => {
			this.states.error.set(e.message);
		};

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

		const paramConfigUniformNames: string[] = paramConfigs.map((pc) => pc.uniformName());

		paramConfigs.forEach((p) => p.applyToNode(this));

		// args & args names
		const functionCreationArgs = [
			'ActorEvaluator',
			'computed',
			'ref',
			'watch',
			'_setErrorFromError',
			...variableNames,
			...functionNames,
			...FUNCTION_UTILS.names,
			...paramConfigUniformNames,
			wrappedBody,
		];
		const functionEvalArgs = () => [
			ActorEvaluator,
			computed,
			ref,
			watch,
			_setErrorFromError,
			// it is currently preferable to create a unique set of variables
			// for each evaluator
			...variables.map((v) => v.clone()),
			...functions,
			...FUNCTION_UTILS.functions,
		];
		try {
			const _function = new Function(...functionCreationArgs);
			const evaluatorGenerator = new ActorEvaluatorGenerator((object) => {
				const evaluatorClass = _function(...functionEvalArgs()) as typeof ActorEvaluator;
				const evaluator = new evaluatorClass(this, object);
				return this.scene().dispatchController.processActorEvaluator(evaluator) || evaluator;
			});

			//
			//
			// add inputEvents
			//
			//
			evaluatorGenerator.eventDatas = SetUtils.fromArray(eventDatas);

			//
			//
			// evaluator is ready
			//
			//
			this._setEvaluatorGenerator(evaluatorGenerator);
		} catch (e) {
			console.warn(e);
			this.states.error.set('failed to compile');
		}
	}
	private _setEvaluatorGenerator(evaluatorGenerator: ActorEvaluatorGenerator) {
		this.scene().actorsManager.unregisterEvaluatorGenerator(this._evaluatorGenerator);
		this._evaluatorGenerator.dispose();
		this._evaluatorGenerator = evaluatorGenerator;
		this.scene().actorsManager.registerEvaluatorGenerator(evaluatorGenerator);
	}
	async compile() {
		const assemblerController = this.assemblerController();
		if (!assemblerController) {
			return;
		}

		// main compilation (just used for reset in this assembler)
		assemblerController.assembler.updateFunction();

		// get functionData
		const paramNodes = JsNodeFinder.findParamGeneratingNodes(this);
		const functionData = assemblerController.assembler.createFunctionData(paramNodes);
		if (!functionData) {
			return;
		}
		this.updateFromFunctionData(functionData);
		assemblerController.post_compile();
	}
}

export type BaseActorSopNodeType = TypedActorSopNode<NodeParamsConfig>;
