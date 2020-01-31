import {TypedSopNode} from './_Base';
import lodash_isArray from 'lodash/isArray';
// import {Object3D} from 'three/src/core/Object3D';
import {AnimationMixer} from 'three/src/animation/AnimationMixer';
// import {AnimationClip} from 'three/src/animation/AnimationClip';
import {InputCloneMode} from 'src/engine/poly/InputCloneMode';
import {CoreGroup} from 'src/core/geometry/Group';
import {Object3DWithAnimation} from 'src/core/geometry/Animation';
import {ParamType} from 'src/engine/poly/ParamType';
import {AnimationAction} from 'three/src/animation/AnimationAction';
import {Mesh} from 'three/src/objects/Mesh';

import {Material} from 'three/src/materials/Materials';
import {MaterialWithSkinning} from 'src/core/geometry/Material';
import {NodeEvent} from 'src/engine/poly/NodeEvent';
import {BaseParamType} from 'src/engine/params/_Base';
import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
import {Object3D} from 'three/src/core/Object3D';
import {BaseNodeType} from '../_Base';
class AnimationMixerSopParamsConfig extends NodeParamsConfig {
	time = ParamConfig.FLOAT('$T', {range: [0, 10]});
	prepare = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType, param: BaseParamType) => {
			AnimationMixerSopNode.PARAM_CALLBACK_prepare(node as AnimationMixerSopNode, param);
		},
	});
}
const ParamsConfig = new AnimationMixerSopParamsConfig();

export class AnimationMixerSopNode extends TypedSopNode<AnimationMixerSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'animation_mixer';
	}

	_previous_time: number | null = null;
	_mixer: AnimationMixer | null = null;
	_actions_by_name: Dictionary<AnimationAction> = {};
	_values_by_param_name: Dictionary<number> = {};
	// _mixer_used_once: boolean = false
	_animation_target: Object3DWithAnimation | undefined;

	static displayed_input_names(): string[] {
		return ['geometry to be animated'];
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_clonable_state([InputCloneMode.FROM_NODE]);
	}

	cook(input_contents: CoreGroup[]) {
		if (!this._mixer) {
			this.create_mixer(input_contents[0]);
		} else {
			this._update_mixer();
			this.cook_controller.end_cook();
		}
	}

	private create_mixer(core_group: CoreGroup) {
		this._animation_target = core_group.objects()[0] as Object3DWithAnimation;
		this._mixer = new AnimationMixer(this._animation_target);

		this._remove_spare_params();
		this._actions_by_name = {};

		if (this._animation_target.animations) {
			this._animation_target.animations.forEach((animation, i) => {
				const param_name = animation.name;
				const previous_value = this._values_by_param_name[param_name];
				let default_value = previous_value;
				if (default_value == null) {
					default_value = i == 0 ? 1 : 0;
				}
				const param = this.add_param(ParamType.FLOAT, param_name, default_value, {spare: true});
				if (param) {
					const prev_value = this._values_by_param_name[param_name];
					if (prev_value) {
						param.set(prev_value);
					}
				}

				if (this._mixer) {
					const action = this._mixer.clipAction(animation);
					this._actions_by_name[animation.name] = action;
				}
			});
		}
		this.emit(NodeEvent.PARAMS_UPDATED);

		Object.keys(this._actions_by_name).forEach((name) => {
			this._actions_by_name[name].play();
		});

		// set material skinning
		const materials_by_id: Dictionary<Material> = {};
		this._animation_target.traverse((object3d: Object3D) => {
			const child = object3d as Mesh;
			if (child.material) {
				if (!lodash_isArray(child.material)) {
					materials_by_id[child.material.uuid] = child.material;
				}
			}
		});
		Object.keys(materials_by_id).forEach((uuid) => {
			const material = materials_by_id[uuid] as MaterialWithSkinning;
			material.skinning = true;
			material.morphTargets = true;
		});
		this._previous_time = null;
		this._update_mixer();
		this._update_mixer_weights(); // might be redundant with _update_mixer, but ensures this is done on load
		this.set_object(this._animation_target);
	}

	private _remove_spare_params() {
		this._values_by_param_name = {};
		const current_param_names: string[] = this.params.spare_names;
		current_param_names.forEach((param_name) => {
			const param = this.params.get_float(param_name);
			if (param) {
				this._values_by_param_name[param_name] = param.value;
				this.params.delete_param(param_name);
			}
		});
	}

	private _update_mixer() {
		if (this.pv.time != this._previous_time) {
			this._update_mixer_time();
		} else {
			this._update_mixer_weights();
		}
	}
	private _update_mixer_time() {
		const delta = this.pv.time - (this._previous_time || 0);
		if (this._mixer) {
			this._mixer.update(delta);
		}
		this._previous_time = this.pv.time;
	}

	private _update_mixer_weights() {
		for (let name of Object.keys(this._actions_by_name)) {
			const action = this._actions_by_name[name];
			const cache_value = this.params.get_float(name).value;
			if (cache_value != null) {
				action.setEffectiveWeight(cache_value);
			}
		}
	}

	static PARAM_CALLBACK_prepare(node: AnimationMixerSopNode, param: BaseParamType) {
		node.prepare_animation_mixer();
	}
	async prepare_animation_mixer() {
		this._mixer = null;
		const container = await this.io.inputs.eval_required_input(0);
		this.create_mixer(container.core_content_cloned());
		this.set_dirty();
	}
}
