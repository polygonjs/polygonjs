import {Vector2} from 'three/src/math/Vector2';
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {OutlinePass} from '../../../modules/three/examples/jsm/postprocessing/OutlinePass';
import {Object3D} from 'three/src/core/Object3D';
import {CoreString} from '../../../core/String';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class OutlinePostParamsConfig extends NodeParamsConfig {
	objects_mask = ParamConfig.STRING('*outlined*', {
		...PostParamOptions,
	});
	refresh_objects = ParamConfig.BUTTON(null, {
		...PostParamOptions,
	});
	edge_strength = ParamConfig.FLOAT(3, {
		range: [0, 10],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	edge_thickness = ParamConfig.FLOAT(0, {
		range: [0, 4],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	edge_glow = ParamConfig.FLOAT(0, {
		range: [0, 1],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	pulse_period = ParamConfig.FLOAT(0, {
		range: [0, 5],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	visible_edge_color = ParamConfig.COLOR([1, 1, 1], {
		...PostParamOptions,
	});
	hidden_edge_color = ParamConfig.COLOR([0, 0, 0], {
		...PostParamOptions,
	});
}
const ParamsConfig = new OutlinePostParamsConfig();
export class OutlinePostNode extends TypedPostProcessNode<OutlinePass, OutlinePostParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'outline';
	}

	protected _create_pass(context: TypedPostNodeContext) {
		const pass = new OutlinePass(
			new Vector2(context.resolution.x, context.resolution.y),
			context.scene,
			context.camera,
			context.scene.children
		);
		this.update_pass(pass);
		return pass;
	}
	update_pass(pass: OutlinePass) {
		pass.edgeStrength = this.pv.edge_strength;
		pass.edgeThickness = this.pv.edge_thickness;
		pass.edgeGlow = this.pv.edge_glow;
		pass.pulsePeriod = this.pv.pulse_period;
		pass.visibleEdgeColor = this.pv.visible_edge_color;
		pass.hiddenEdgeColor = this.pv.hidden_edge_color;

		this._set_selected_objects(pass);
	}
	private _set_selected_objects(pass: OutlinePass) {
		const objects: Object3D[] = [];
		const mask = this.pv.objects_mask;
		this.scene.default_scene.traverse((object) => {
			if (CoreString.match_mask(object.name, mask)) {
				objects.push(object);
			}
		});

		pass.selectedObjects = objects;
	}
}
