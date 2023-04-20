import {JsNodeFinder} from '../../engine/nodes/js/code/utils/NodeFinder';
import {ActorEvaluator} from '../../engine/nodes/js/code/assemblers/actor/Evaluator';
import {ActorEvaluatorGenerator} from '../../engine/nodes/js/code/assemblers/actor/EvaluatorGenerator';
import {ActorFunctionData} from '../../engine/nodes/js/code/assemblers/actor/ActorPersistedConfig';
import {computed, ref, watch} from '../reactivity/CoreReactivity';
import {RegisterableVariable} from '../../engine/nodes/js/code/assemblers/_BaseJsPersistedConfigUtils';
import {SetUtils} from '../SetUtils';
import {ActorBuilderNode} from '../../engine/scene/utils/ActorsManager';

export class ActorCompilationController {
	constructor(protected node: ActorBuilderNode) {}

	compileIfRequired() {
		if (this.node.assemblerController()?.compileRequired()) {
			this.compile();
		}
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
			'ActorEvaluator',
			'computed',
			'ref',
			'watch',
			'_setErrorFromError',
			...variableNames,
			...functionNames,
			// ...FUNCTION_UTILS.names,
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
			// ...FUNCTION_UTILS.functions,
		];
		try {
			const _function = new Function(...functionCreationArgs);
			const evaluatorGenerator = new ActorEvaluatorGenerator((object) => {
				const evaluatorClass = _function(...functionEvalArgs()) as typeof ActorEvaluator;
				const evaluator = new evaluatorClass(this.node, object);
				return this.node.scene().dispatchController.processActorEvaluator(evaluator) || evaluator;
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
			this.node.states.error.set('failed to compile');
		}
	}
	private _setEvaluatorGenerator(evaluatorGenerator: ActorEvaluatorGenerator) {
		this.node.scene().actorsManager.unregisterEvaluatorGenerator(this._evaluatorGenerator);
		this._evaluatorGenerator.dispose();
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
	}
}
