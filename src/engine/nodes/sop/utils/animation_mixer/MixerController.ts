// import {AnimationMixerSopNode} from '../../AnimationMixer';
// import {CoreGroup} from '../../../../../core/geometry/Group';
// import {Object3DWithAnimation} from '../../../../../core/geometry/Animation';

// export class MixerController {

// 	_previous_time: number=-1

// 	constructor(protected node: AnimationMixerSopNode) {}

// 	private _set_mixer_time() {
// 		if (this.node.pv.time != this._previous_time) {
// 			if (this._mixer) {
// 				this._mixer.setTime(this.pv.time);
// 			}
// 			this._previous_time = this.pv.time;
// 		}
// 	}

// 	private _update_mixer_weights() {
// 		for (let name of Object.keys(this._actions_by_name)) {
// 			const action = this._actions_by_name[name];
// 			const cache_value = this.params.get_float(name).value;
// 			if (cache_value != null) {
// 				action.setEffectiveWeight(cache_value);
// 			}
// 		}
// 	}
// }
