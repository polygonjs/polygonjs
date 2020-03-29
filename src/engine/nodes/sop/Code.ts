import {TypedSopNode} from './_Base';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CoreGroup} from '../../../core/geometry/Group';
import {StringParamLanguage} from '../../params/utils/OptionsController';
import {AsyncFunction} from '../../../core/AsyncFunction';

const DEFAULT_FUNCTION_CODE = `const core_group = core_groups[0];
const object = core_group.objects()[0];
object.position.y = -1;
node.set_core_group(core_groups[0]);


`;

type EvaluatedFunction = (node: CodeSopNode, scene: PolyScene, core_groups: CoreGroup[]) => void;

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {PolyScene} from '../../scene/PolyScene';
class CodeSopParamsConfig extends NodeParamsConfig {
	cook = ParamConfig.STRING(DEFAULT_FUNCTION_CODE, {
		label: false,
		language: StringParamLanguage.TYPESCRIPT,
	});
}
const ParamsConfig = new CodeSopParamsConfig();
export class CodeSopNode extends TypedSopNode<CodeSopParamsConfig> {
	params_config = ParamsConfig;

	private _last_compiled_code: string | undefined;
	private _function: EvaluatedFunction | undefined;

	static type() {
		return 'code';
	}

	initialize_node() {
		this.io.inputs.set_count(0, 4);
		this.ui_data.set_width(100);
		this.io.inputs.init_inputs_clonable_state([InputCloneMode.FROM_NODE]);
	}

	cook(core_groups: CoreGroup[]) {
		this._compile_if_required();

		if (this._function) {
			this._function(this, this.scene, core_groups);
		} else {
			this.set_core_group(core_groups[0]);
		}
	}

	private _compile_if_required() {
		if (!this._function || this._last_compiled_code != this.pv.cook) {
			this._compile();
		}
	}

	private _compile() {
		try {
			this._function = new AsyncFunction(
				'node',
				'scene',
				'core_groups',
				`try {
					${this.pv.cook}
				} catch(e) {
					this.states.error.set(e)
				}`
			);
			this._last_compiled_code = this.pv.cook;
		} catch (e) {
			console.warn(e);
			this.states.error.set(`cannot generate function (${e})`);
			this._function = undefined;
		}
	}

	static PARAM_CALLBACK_compile(node: CodeSopNode) {
		node._compile();
	}
}
