import {TypedSopNode} from "./_Base";
import {InputCloneMode as InputCloneMode2} from "../../poly/InputCloneMode";
import {StringParamLanguage} from "../../params/utils/OptionsController";
import {TranspiledFilter as TranspiledFilter2} from "../utils/code/controllers/TranspiledFilter";
import {Poly as Poly2} from "../../Poly";
import * as THREE from "three";
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
  constructor() {
  }
  set_node(node) {
    this.node = node;
    this.initialize_processor();
  }
  cook(core_groups) {
  }
  initialize_processor() {
  }
  set_core_group(core_group) {
    this.node.set_core_group(core_group);
  }
  set_objects(objects) {
    this.node.set_objects(objects);
  }
}
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class CodeSopParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.code_typescript = ParamConfig.STRING(DEFAULT_FUNCTION_CODE, {
      show_label: false,
      language: StringParamLanguage.TYPESCRIPT
    });
    this.code_javascript = ParamConfig.STRING("", {hidden: true});
  }
}
const ParamsConfig2 = new CodeSopParamsConfig();
export class CodeSopNode extends TypedSopNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "code";
  }
  initialize_node() {
    this.io.inputs.set_count(0, 4);
    this.io.inputs.init_inputs_cloned_state([
      InputCloneMode2.FROM_NODE,
      InputCloneMode2.NEVER,
      InputCloneMode2.NEVER,
      InputCloneMode2.NEVER
    ]);
  }
  cook(core_groups) {
    this._compile_if_required();
    if (this._processor) {
      this._processor.cook(core_groups);
    } else {
      this.set_core_group(core_groups[0]);
    }
  }
  _compile_if_required() {
    if (!this._processor || this._last_compiled_code != this.pv.code_javascript) {
      this._compile();
    }
  }
  _compile() {
    try {
      const function_body = `try {
				${TranspiledFilter2.filter(this.pv.code_javascript)}
			} catch(e) {
				this.states.error.set(e)
			}`;
      const processor_creator_function = new Function("BaseCodeSopProcessor", "THREE", function_body);
      const processor_class = processor_creator_function(BaseCodeSopProcessor, THREE);
      if (processor_class) {
        this._processor = new processor_class();
        this._processor.set_node(this);
        this._last_compiled_code = this.pv.code_javascript;
      } else {
        this.states.error.set(`cannot generate function`);
        this._processor = void 0;
      }
    } catch (e) {
      Poly2.warn(e);
      this.states.error.set(`cannot generate function (${e})`);
      this._processor = void 0;
    }
  }
}
