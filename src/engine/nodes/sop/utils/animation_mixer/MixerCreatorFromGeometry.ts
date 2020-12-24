// import {AnimationMixerSopNode} from '../../AnimationMixer';
// import {CoreGroup} from '../../../../../core/geometry/Group';
// import {Object3DWithAnimation} from '../../../../../core/geometry/Animation';

// export class MixerCreatorFromGeometry {
// 	_animation_target: Object3DWithAnimation | undefined;

// 	constructor(protected node: AnimationMixerSopNode) {}

// 	create_mixer(core_group: CoreGroup) {
// 		this._animation_target = core_group.objects()[0] as Object3DWithAnimation;
// 		this._mixer = new AnimationMixer(this._animation_target);

// 		this._remove_spare_params();
// 		this._actions_by_name = {};

// 		if (this._animation_target.animations) {
// 			this._animation_target.animations.forEach((animation, i) => {
// 				const param_name = animation.name;
// 				const previous_value = this._values_by_param_name[param_name];
// 				let default_value = previous_value;
// 				if (default_value == null) {
// 					default_value = i == 0 ? 1 : 0;
// 				}
// 				const param = this.add_param(ParamType.FLOAT, param_name, default_value, {spare: true});
// 				if (param) {
// 					const prev_value = this._values_by_param_name[param_name];
// 					if (prev_value) {
// 						param.set(prev_value);
// 					}
// 				}

// 				if (this._mixer) {
// 					const action = this._mixer.clipAction(animation);
// 					this._actions_by_name[animation.name] = action;
// 				}
// 			});
// 		}
// 		this.emit(NodeEvent.PARAMS_UPDATED);

// 		Object.keys(this._actions_by_name).forEach((name) => {
// 			this._actions_by_name[name].play();
// 		});

// 		// set material skinning
// 		const materials_by_id: Dictionary<Material> = {};
// 		this._animation_target.traverse((object3d: Object3D) => {
// 			const child = object3d as Mesh;
// 			if (child.material) {
// 				if (!CoreType.isArray(child.material)) {
// 					materials_by_id[child.material.uuid] = child.material;
// 				}
// 			}
// 		});
// 		Object.keys(materials_by_id).forEach((uuid) => {
// 			const material = materials_by_id[uuid] as MaterialWithSkinning;
// 			material.skinning = true;
// 			material.morphTargets = true;
// 		});
// 		this._previous_time = null;
// 		this._update_mixer();
// 		this._update_mixer_weights(); // might be redundant with _update_mixer, but ensures this is done on load
// 	}

// 	private _remove_spare_params() {
// 		this._values_by_param_name = {};
// 		const current_param_names: string[] = this.params.spare_names;
// 		const names_to_delete: string[] = [];
// 		current_param_names.forEach((param_name) => {
// 			const param = this.params.get_float(param_name);
// 			if (param) {
// 				this._values_by_param_name[param_name] = param.value;
// 				names_to_delete.push(param_name);
// 			}
// 		});
// 		if (names_to_delete.length > 0) {
// 			this.params.update_params({names_to_delete: names_to_delete});
// 		}
// 	}
// }
