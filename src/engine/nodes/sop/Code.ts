/**
 * processes input geometry with user-defined typescript.
 *
 *
 */

import {TypedSopNode} from './_Base';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CoreGroup} from '../../../core/geometry/Group';
import {StringParamLanguage} from '../../params/utils/OptionsController';
import {TranspiledFilter} from '../utils/code/controllers/TranspiledFilter';
import {Object3D} from 'three';
import {Poly} from '../../Poly';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';

import {removeTypes} from '../../../core/code/tsUtils';
import {BaseCodeProcessor, buildCodeNodeFunction} from '../../../core/code/FunctionBuilderUtils';

const DEFAULT_TS = `
export class CodeSopProcessor extends BaseCodeSopProcessor {
	override initializeProcessor(){
	}
	override cook(inputCoreGroups: CoreGroup[]){
		const inputCoreGroup = inputCoreGroups[0];
		const object = inputCoreGroup.threejsObjects()[0];
		object.position.y = 1;
		this.setCoreGroup(inputCoreGroup);
	}
}
`;
const DEFAULT_JS = removeTypes(DEFAULT_TS);

export class BaseCodeSopProcessor extends BaseCodeProcessor {
	constructor(protected override node: CodeSopNode) {
		super(node);
		this.initializeProcessor();
	}
	get pv() {
		return this.node.pv;
	}
	get p() {
		return this.node.p;
	}
	initializeProcessor() {}
	cook(inputCoreGroups: CoreGroup[]) {}
	protected setCoreGroup(coreGroup: CoreGroup) {
		this.node.setCoreGroup(coreGroup);
	}
	protected setObjects(objects: Object3D[]) {
		this.node.setObjects(objects);
	}
}

class CodeSopParamsConfig extends NodeParamsConfig {
	codeTypescript = ParamConfig.STRING(DEFAULT_TS, {
		hideLabel: true,
		language: StringParamLanguage.TYPESCRIPT,
	});
	codeJavascript = ParamConfig.STRING(DEFAULT_JS, {hidden: true});
}
const ParamsConfig = new CodeSopParamsConfig();
export class CodeSopNode extends TypedSopNode<CodeSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	// adding BaseCodeSopProcessor seems necessary to have the bundled types include it
	static BaseCodeSopProcessor = BaseCodeSopProcessor;
	static override type() {
		return 'code';
	}

	private _lastCompiledCode: string | undefined;
	private _processor: BaseCodeSopProcessor | undefined;

	override initializeNode() {
		this.io.inputs.setCount(0, 4);
		this.io.inputs.initInputsClonedState([
			InputCloneMode.FROM_NODE,
			InputCloneMode.NEVER,
			InputCloneMode.NEVER,
			InputCloneMode.NEVER,
		]);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		this._compileIfRequired();

		if (this._processor) {
			this._processor.cook(inputCoreGroups);
		} else {
			this.setCoreGroup(inputCoreGroups[0]);
		}
	}

	private _compileIfRequired() {
		if (!this._processor || this._lastCompiledCode != this.pv.codeJavascript) {
			this._compile();
		}
	}

	private _compile() {
		this._processor = undefined;
		try {
			const functionBody = `try {
				${TranspiledFilter.filter(this.pv.codeJavascript)}
			} catch(e) {
				states.error.set(e);
			}`;

			const ProcessorClass = buildCodeNodeFunction<BaseCodeSopProcessor>({
				BaseCodeProcessor: BaseCodeSopProcessor,
				BaseCodeProcessorName: 'BaseCodeSopProcessor',
				node: this,
				functionBody,
			});
			if (ProcessorClass) {
				this._processor = new ProcessorClass(this);
				this._lastCompiledCode = this.pv.codeJavascript;
			} else {
				this.states.error.set(`cannot generate function`);
				Poly.warn(functionBody);
			}
		} catch (e) {
			Poly.warn(e);
			this.states.error.set(`cannot generate function (${e})`);
		}
	}
}
