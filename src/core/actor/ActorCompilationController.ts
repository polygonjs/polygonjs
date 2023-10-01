import {JsNodeFinder} from '../../engine/nodes/js/code/utils/NodeFinder';
import {ActorEvaluator} from '../../engine/nodes/js/code/assemblers/actor/ActorEvaluator';
import {ActorEvaluatorGenerator} from '../../engine/nodes/js/code/assemblers/actor/ActorEvaluatorGenerator';
import {ActorFunctionData} from '../../engine/nodes/js/code/assemblers/actor/ActorPersistedConfig';
import {computed, ref, watch} from '../reactivity/CoreReactivity';
import {RegisterableVariable} from '../../engine/nodes/js/code/assemblers/_BaseJsPersistedConfigUtils';
import {ActorBuilderNode} from '../../engine/scene/utils/ActorsManager';
import {Object3D} from 'three';
import {CoreObjectType, ObjectContent} from '../geometry/ObjectContent';
import {FUNC_POINTS_COUNT_FROM_OBJECT, FUNC_CORE_PRIMITIVE_CLASS_FACTORY} from '../../engine/nodes/js/utils/Common';
import {pointsCountFromObject} from '../geometry/entities/point/CorePointUtils';
import {corePrimitiveClassFactory} from '../geometry/CoreObjectFactory';
import {arrayToSet} from '../ArrayUtils';

const FUNCTION_ARGS_DICT = {
	[FUNC_POINTS_COUNT_FROM_OBJECT]: pointsCountFromObject,
	[FUNC_CORE_PRIMITIVE_CLASS_FACTORY]: corePrimitiveClassFactory,
	ActorEvaluator,
	computed,
	ref,
	watch,
};
const FUNCTION_ARG_NAMES = Object.keys(FUNCTION_ARGS_DICT);
const FUNCTION_ARGS = FUNCTION_ARG_NAMES.map((argName) => (FUNCTION_ARGS_DICT as any)[argName]);

type OnCompilationCompletedHook = () => void;
function _createDummyObject() {
	const object = new Object3D();
	object.name = 'ActorCompilationController-DUMMY';
	return object;
}
const dummyObject = _createDummyObject();
export class ActorCompilationController {
	constructor(protected node: ActorBuilderNode) {}

	compileIfRequired() {
		if (this.node.assemblerController()?.compileRequired()) {
			this.compile();
		}
		// always clear objects,
		// so that we don't try and traverse physics objects that are not in the tree anymore
		this._evaluatorGenerator.clearObjects();
	}

	private _evaluatorGenerator: ActorEvaluatorGenerator = new ActorEvaluatorGenerator(
		(object) => new ActorEvaluator(this.node, object)
	);
	evaluatorGenerator() {
		return this._evaluatorGenerator;
	}
	private _functionData: ActorFunctionData | undefined;
	functionData() {
		return this._functionData;
	}
	private _resetFunctionData() {
		this._functionData = undefined;
		// if (!this.node.isDirty()) {
		// 	this.node.setDirty();
		// }
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
			this.node.states.error.set(e.message);
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

		paramConfigs.forEach((p) => p.applyToNode(this.node));

		// args & args names
		const functionCreationArgs = [
			...FUNCTION_ARG_NAMES,
			'_setErrorFromError',
			...variableNames,
			...functionNames,
			// ...FUNCTION_UTILS.names,
			...paramConfigUniformNames,
			wrappedBody,
		];
		const functionEvalArgs = () => [
			...FUNCTION_ARGS,
			_setErrorFromError,
			// it is currently preferable to create a unique set of variables
			// for each evaluator
			...variables.map((v) => v.clone()),
			...functions,
			// ...FUNCTION_UTILS.functions,
		];
		try {
			const _function = new Function(...functionCreationArgs);
			const _createEvaluator = (object: ObjectContent<CoreObjectType>) => {
				const evaluatorClass = _function(...functionEvalArgs()) as typeof ActorEvaluator;
				const evaluator = new evaluatorClass(this.node, object);
				return evaluator;
			};
			const evaluatorGenerator = new ActorEvaluatorGenerator((object) => {
				const evaluator = _createEvaluator(object);
				return this.node.scene().dispatchController.processActorEvaluator(evaluator) || evaluator;
			});
			//
			const dummyEvaluator = _createEvaluator(dummyObject);
			evaluatorGenerator.setExpectedEvaluatorMethodNames(dummyEvaluator);

			//
			//
			// add inputEvents
			//
			//
			evaluatorGenerator.eventDatas = evaluatorGenerator.eventDatas || new Set();
			arrayToSet(eventDatas, evaluatorGenerator.eventDatas);

			//
			//
			// evaluator is ready
			//
			//
			this._setEvaluatorGenerator(evaluatorGenerator);
		} catch (e) {
			console.warn(e);
			console.log(`failed to compile actor node ${this.node.path()}`);
			console.log({functionData});
			this.node.states.error.set('failed to compile');
		}
	}
	private _setEvaluatorGenerator(evaluatorGenerator: ActorEvaluatorGenerator) {
		this.node.scene().actorsManager.unregisterEvaluatorGenerator(this._evaluatorGenerator);
		this._evaluatorGenerator.clearObjects();
		this._evaluatorGenerator = evaluatorGenerator;
		this.node.scene().actorsManager.registerEvaluatorGenerator(evaluatorGenerator);
	}
	compile() {
		const assemblerController = this.node.assemblerController();
		if (!assemblerController) {
			return;
		}

		this.node.states.error.clear();
		// main compilation (just used for reset in this assembler)
		assemblerController.assembler.updateFunction();

		// get functionData
		const paramNodes = JsNodeFinder.findParamGeneratingNodes(this.node);
		try {
			const functionData = assemblerController.assembler.createFunctionData(paramNodes);
			if (!functionData) {
				this._resetFunctionData();
				return;
			}
			this.updateFromFunctionData(functionData);
			assemblerController.post_compile();
		} catch (err) {
			console.log(err);
			this._resetFunctionData();
			// throw new Error(err);
		}
		this._runOnCompilationCompletedCallbacks();
	}

	private _onCompilationCompletedCallbacks: Set<OnCompilationCompletedHook> | undefined;
	addOnCompilationCompleted(callback: OnCompilationCompletedHook) {
		this._onCompilationCompletedCallbacks = this._onCompilationCompletedCallbacks || new Set();
		this._onCompilationCompletedCallbacks.add(callback);
	}
	removeOnCompilationCompleted(callback: OnCompilationCompletedHook) {
		if (!this._onCompilationCompletedCallbacks) {
			return;
		}
		this._onCompilationCompletedCallbacks.delete(callback);
		if (this._onCompilationCompletedCallbacks.size == 0) {
			this._onCompilationCompletedCallbacks = undefined;
		}
	}
	private _runOnCompilationCompletedCallbacks() {
		if (!this._onCompilationCompletedCallbacks) {
			return;
		}
		this._onCompilationCompletedCallbacks.forEach((callback) => callback());
	}
}
