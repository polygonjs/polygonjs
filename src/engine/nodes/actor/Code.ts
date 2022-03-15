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

const CONNECTION_OPTIONS = {
	inNodeDefinition: true,
};

const DEFAULT_FUNCTION_CODE = {
	TS: `
 export class CodeSopProcessor extends BaseCodeActorProcessor {
	 override initializeProcessor(){
	 }
	 override receiveTrigger(context: ActorNodeTriggerContext){
		 console.log(context);
	 }
 }
 `,
	JS: `
 `,
};

export class BaseCodeActorProcessor {
	constructor(protected node: CodeActorNode) {
		this.initializeProcessor();
	}
	initializeProcessor() {}
	//
}

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ActorConnectionPoint, ActorConnectionPointType} from '../utils/io/connections/Actor';
class CodeActorParamsConfig extends NodeParamsConfig {
	codeTypescript = ParamConfig.STRING(DEFAULT_FUNCTION_CODE.TS, {
		hideLabel: true,
		language: StringParamLanguage.TYPESCRIPT,
	});
	codeJavascript = ParamConfig.STRING(DEFAULT_FUNCTION_CODE.JS, {hidden: true});
}
const ParamsConfig = new CodeActorParamsConfig();
export class CodeActorNode extends TypedActorNode<CodeActorParamsConfig> {
	override paramsConfig = ParamsConfig;
	// adding BaseCodeActorProcessor seems necessary to have the bundled types include it
	static BaseCodeActorProcessor = BaseCodeActorProcessor;
	static override type() {
		return 'code';
	}

	private _lastCompiledCode: string | undefined;
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
		this._compileIfRequired();
	}

	private _compileIfRequired() {
		if (!this._processor || this._lastCompiledCode != this.pv.codeJavascript) {
			this._compile();
		}
	}

	private _compile() {
		try {
			const functionBody = `try {
				 ${TranspiledFilter.filter(this.pv.codeJavascript)}
			 } catch(e) {
				 this.states.error.set(e)
			 }`;

			const processorCreatorFunction = new Function('BaseCodeActorProcessor', 'THREE', functionBody);
			const ProcessorClass: typeof BaseCodeActorProcessor | undefined = processorCreatorFunction(
				BaseCodeActorProcessor,
				THREE
			);
			if (ProcessorClass) {
				this._processor = new ProcessorClass(this);
				this._lastCompiledCode = this.pv.codeJavascript;
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
}
