import {TypedSopNode} from './_Base';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CoreGroup} from '../../../core/geometry/Group';
import {StringParamLanguage} from '../../params/utils/OptionsController';
import {TranspiledFilter} from '../utils/code/controllers/TranspiledFilter';
import {Object3D} from 'three/src/core/Object3D';
import {Poly} from '../../Poly';
import * as THREE from 'three'; // three import required to give to the function builder

const DEFAULT_FUNCTION_CODE = `import {BaseCodeSopProcessor, CoreGroup} from '@polygonjs/polygonjs'
export class CodeSopProcessor extends BaseCodeSopProcessor {
	initialize_processor(){
	}
	cook(inputCoreGroups: CoreGroup[]){
		const inputCoreGroup = inputCoreGroups[0];
		const object = inputCoreGroup.objects()[0];
		object.position.y = 1;
		this.setCoreGroup(inputCoreGroup[0]);
	}
}

`;

export class BaseCodeSopProcessor {
	protected node!: CodeSopNode;
	constructor() {}
	setNode(node: CodeSopNode) {
		this.node = node;
		this.initializeProcessor();
	}
	cook(inputCoreGroups: CoreGroup[]) {}
	initializeProcessor() {}
	protected setCoreGroup(coreGroup: CoreGroup) {
		this.node.setCoreGroup(coreGroup);
	}
	protected setObjects(objects: Object3D[]) {
		this.node.setObjects(objects);
	}
}

// type EvaluatedFunction = (base_processor_class: typeof BaseCodeSopProcessor) => typeof BaseCodeSopProcessor | undefined;

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class CodeSopParamsConfig extends NodeParamsConfig {
	codeTypescript = ParamConfig.STRING(DEFAULT_FUNCTION_CODE, {
		hideLabel: true,
		language: StringParamLanguage.TYPESCRIPT,
	});
	codeJavascript = ParamConfig.STRING('', {hidden: true});
}
const ParamsConfig = new CodeSopParamsConfig();
export class CodeSopNode extends TypedSopNode<CodeSopParamsConfig> {
	override paramsConfig = ParamsConfig;
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
		try {
			const function_body = `try {
				${TranspiledFilter.filter(this.pv.codeJavascript)}
			} catch(e) {
				this.states.error.set(e)
			}`;

			const processorCreatorFunction = new Function('BaseCodeSopProcessor', 'THREE', function_body);
			const ProcessorClass: typeof BaseCodeSopProcessor | undefined = processorCreatorFunction(
				BaseCodeSopProcessor,
				THREE
			);
			if (ProcessorClass) {
				this._processor = new ProcessorClass();
				this._processor.setNode(this);
				this._lastCompiledCode = this.pv.codeJavascript;
			} else {
				this.states.error.set(`cannot generate function`);
				this._processor = undefined;
			}
		} catch (e) {
			Poly.warn(e);
			this.states.error.set(`cannot generate function (${e})`);
			this._processor = undefined;
		}
	}
}
