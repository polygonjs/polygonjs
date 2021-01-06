import {Vector2} from 'three/src/math/Vector2';
import {TypedPostProcessNode, TypedPostNodeContext, PostParamOptions} from './_Base';
import {OutlinePass} from '../../../modules/three/examples/jsm/postprocessing/OutlinePass';
import {Object3D} from 'three/src/core/Object3D';
import {CoreString} from '../../../core/String';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class OutlinePostParamsConfig extends NodeParamsConfig {
	objectsMask = ParamConfig.STRING('*outlined*', {
		...PostParamOptions,
	});
	refreshObjects = ParamConfig.BUTTON(null, {
		...PostParamOptions,
	});
	edgeStrength = ParamConfig.FLOAT(3, {
		range: [0, 10],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	edgeThickness = ParamConfig.FLOAT(0, {
		range: [0, 4],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	edgeGlow = ParamConfig.FLOAT(0, {
		range: [0, 1],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	pulsePeriod = ParamConfig.FLOAT(0, {
		range: [0, 5],
		rangeLocked: [true, false],
		...PostParamOptions,
	});
	visibleEdgeColor = ParamConfig.COLOR([1, 1, 1], {
		...PostParamOptions,
	});
	hiddenEdgeColor = ParamConfig.COLOR([0, 0, 0], {
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
		pass.edgeStrength = this.pv.edgeStrength;
		pass.edgeThickness = this.pv.edgeThickness;
		pass.edgeGlow = this.pv.edgeGlow;
		pass.pulsePeriod = this.pv.pulsePeriod;
		pass.visibleEdgeColor = this.pv.visibleEdgeColor;
		pass.hiddenEdgeColor = this.pv.hiddenEdgeColor;

		this._set_selected_objects(pass);
	}
	private _set_selected_objects(pass: OutlinePass) {
		const objects: Object3D[] = [];
		const mask = this.pv.objectsMask;
		this.scene.defaultScene.traverse((object) => {
			if (CoreString.matchMask(object.name, mask)) {
				objects.push(object);
			}
		});

		pass.selectedObjects = objects;
	}
}
