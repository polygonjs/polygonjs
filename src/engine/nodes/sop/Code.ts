import {TypedSopNode} from './_Base';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CoreGroup} from '../../../core/geometry/Group';
import {StringParamLanguage} from '../../params/utils/OptionsController';
import {AsyncFunction} from '../../../core/AsyncFunction';

const DEFAULT_FUNCTION_CODE = `import {BaseCodeSopProcessor, CoreGroup} from 'polygonjs-engine'
export class CodeSopProcessor extends BaseCodeSopProcessor {
	initialize_processor(){
	}
	cook(core_groups: CoreGroup[]){
		const core_group = core_groups[0];
		const object = core_group.objects()[0];
		object.position.y = 1;
		this.set_core_group(core_groups[0]);
	}
}


`;

export class BaseCodeSopProcessor {
	protected node!: CodeSopNode;
	constructor() {}
	set_node(node: CodeSopNode) {
		this.node = node;
		this.initialize_processor();
	}
	cook(core_groups: CoreGroup[]) {}
	initialize_processor() {}
	protected set_core_group(core_group: CoreGroup) {
		this.node.set_core_group(core_group);
	}
	protected set_objects(objects: Object3D[]) {
		this.node.set_objects(objects);
	}
}

type EvaluatedFunction = (base_processor_class: typeof BaseCodeSopProcessor) => typeof BaseCodeSopProcessor | undefined;

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TranspiledFilter} from '../utils/code/controllers/TranspiledFilter';
import {Object3D} from 'three/src/core/Object3D';
class CodeSopParamsConfig extends NodeParamsConfig {
	code_typescript = ParamConfig.STRING(DEFAULT_FUNCTION_CODE, {
		show_label: false,
		language: StringParamLanguage.TYPESCRIPT,
	});
	code_javascript = ParamConfig.STRING('', {hidden: true});
}
const ParamsConfig = new CodeSopParamsConfig();
export class CodeSopNode extends TypedSopNode<CodeSopParamsConfig> {
	params_config = ParamsConfig;

	private _last_compiled_code: string | undefined;
	private _processor: BaseCodeSopProcessor | undefined;

	static type() {
		return 'code';
	}

	initialize_node() {
		this.io.inputs.set_count(0, 4);
		this.ui_data.set_width(100);
		this.io.inputs.init_inputs_cloned_state([
			InputCloneMode.FROM_NODE,
			InputCloneMode.NEVER,
			InputCloneMode.NEVER,
			InputCloneMode.NEVER,
		]);
	}

	cook(core_groups: CoreGroup[]) {
		this._compile_if_required();

		if (this._processor) {
			this._processor.cook(core_groups);
		} else {
			this.set_core_group(core_groups[0]);
		}
	}

	private _compile_if_required() {
		if (!this._processor || this._last_compiled_code != this.pv.code_javascript) {
			this._compile();
		}
	}

	private _compile() {
		try {
			const function_body = `try {
				${TranspiledFilter.filter(this.pv.code_javascript)}
			} catch(e) {
				this.states.error.set(e)
			}`;
			console.log('function_body');
			console.log(function_body);
			const processor_creator_function: EvaluatedFunction = new AsyncFunction(
				'BaseCodeSopProcessor',
				function_body
			);
			const processor_class = processor_creator_function(BaseCodeSopProcessor);
			if (processor_class) {
				this._processor = new processor_class();
				this._processor.set_node(this);
				this._last_compiled_code = this.pv.code_javascript;
			} else {
				this.states.error.set(`cannot generate function`);
				this._processor = undefined;
			}
		} catch (e) {
			console.warn(e);
			this.states.error.set(`cannot generate function (${e})`);
			this._processor = undefined;
		}
	}
}
