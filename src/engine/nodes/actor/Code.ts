/**
 * processes input events
 *
 *
 */

import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {StringParamLanguage} from '../../params/utils/OptionsController';
import {TranspiledFilter} from '../utils/code/controllers/TranspiledFilter';
import {Poly} from '../../Poly';
import * as THREE from 'three'; // three import required to give to the function builder

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

const DEFAULT_FUNCTION_CODE = {
	TS: `
export class CodeSopProcessor extends BaseCodeActorProcessor {
	override initializeProcessor(){
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint('myBool', ActorConnectionPointType.BOOLEAN),
		]);
	}
	override receiveTrigger(context: ActorNodeTriggerContext){
		console.log(context);
	}
}
`,
	JS: `
export class CodeSopProcessor extends BaseCodeActorProcessor {
	initializeProcessor(){
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint('myBool', ActorConnectionPointType.BOOLEAN),
		]);
	}
	receiveTrigger(context){
		console.log(context);
	}
}
`,
};

export class BaseCodeActorProcessor {
	constructor(protected node: CodeActorNode) {
		this.initializeProcessor();
	}
	get pv() {
		return this.node.pv;
	}
	get p() {
		return this.node.p;
	}
	get io() {
		return this.node.io;
	}
	initializeProcessor() {}
	receiveTrigger(context: ActorNodeTriggerContext) {}
}

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {BaseNodeType} from '../_Base';
class CodeActorParamsConfig extends NodeParamsConfig {
	codeTypescript = ParamConfig.STRING(DEFAULT_FUNCTION_CODE.TS, {
		hideLabel: true,
		language: StringParamLanguage.TYPESCRIPT,
	});
	codeJavascript = ParamConfig.STRING(DEFAULT_FUNCTION_CODE.JS, {
		hidden: true,
		callback: (node: BaseNodeType) => {
			CodeActorNode.PARAM_CALLBACK_compile(node as CodeActorNode);
		},
	});
}
const ParamsConfig = new CodeActorParamsConfig();
export class CodeActorNode extends TypedActorNode<CodeActorParamsConfig> {
	override paramsConfig = ParamsConfig;
	// adding BaseCodeActorProcessor seems necessary to have the bundled types include it
	static BaseCodeActorProcessor = BaseCodeActorProcessor;
	static override type() {
		return 'code';
	}

	// private _lastCompiledCode: string | undefined;
	private _processor: BaseCodeActorProcessor | undefined;

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new ActorConnectionPoint(
				ActorConnectionPointType.OBJECT_3D,
				ActorConnectionPointType.OBJECT_3D,
				CONNECTION_OPTIONS
			),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER),
		]);
	}

	public override receiveTrigger(context: ActorNodeTriggerContext) {
		// this._compileIfRequired();
		this._processor?.receiveTrigger(context);
	}

	// private _compileIfRequired() {
	// 	if (!this._processor || this._lastCompiledCode != this.pv.codeJavascript) {
	// 		this._compile();
	// 	}
	// }

	private _compile() {
		try {
			const functionBody = `try {
	${TranspiledFilter.filter(this.pv.codeJavascript)}
} catch(e) {
		this.states.error.set(e)
}`;
			console.log(this.pv.codeJavascript);

			const processorCreatorFunction = new Function(
				'ActorConnectionPoint',
				'ActorConnectionPointType',
				'BaseCodeActorProcessor',
				'THREE',
				functionBody
			);
			const ProcessorClass: typeof BaseCodeActorProcessor | undefined = processorCreatorFunction(
				ActorConnectionPoint,
				ActorConnectionPointType,
				BaseCodeActorProcessor,
				THREE
			);
			if (ProcessorClass) {
				this._processor = new ProcessorClass(this);
				// this._lastCompiledCode = this.pv.codeJavascript;
			} else {
				this.states.error.set(`cannot generate function`);
				console.warn(functionBody);
				this._processor = undefined;
			}
		} catch (e) {
			Poly.warn(e);
			this.states.error.set(`cannot generate function (${e})`);
			this._processor = undefined;
		}
	}
	static PARAM_CALLBACK_compile(node: CodeActorNode) {
		node._compile();
	}
}
