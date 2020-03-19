import {TypedObjNode} from './_Base';
import {Scene} from 'three/src/scenes/Scene';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class SceneObjParamConfig extends NodeParamsConfig {
	bg_color = ParamConfig.COLOR([0, 0, 0]);
}
const ParamsConfig = new SceneObjParamConfig();

export class SceneObjNode extends TypedObjNode<Scene, SceneObjParamConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'scene';
	}

	create_object() {
		return new Scene();
	}

	initialize_node() {
		super.initialize_node();
		this.io.outputs.set_has_one_output();
	}

	cook() {
		this.cook_controller.end_cook();
	}
}
