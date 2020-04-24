import {TypedAnimNode} from './_Base';
import {AnimationClip} from 'three/src/animation/AnimationClip';
import {NumberKeyframeTrack} from 'three/src/animation/tracks/NumberKeyframeTrack';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class TrackAnimParamsConfig extends NodeParamsConfig {
	name = ParamConfig.STRING('.position[x]');
	duration = ParamConfig.FLOAT(-1);
	sep1 = ParamConfig.SEPARATOR();
	start_time = ParamConfig.FLOAT(0, {
		range: [0, 10],
		range_locked: [false, false],
	});
	start_value = ParamConfig.FLOAT(0, {
		range: [0, 10],
		range_locked: [false, false],
	});
	sep2 = ParamConfig.SEPARATOR();
	end_time = ParamConfig.FLOAT(1, {
		range: [0, 10],
		range_locked: [false, false],
	});
	end_value = ParamConfig.FLOAT(1, {
		range: [0, 10],
		range_locked: [false, false],
	});
}
const ParamsConfig = new TrackAnimParamsConfig();

export class TrackAnimNode extends TypedAnimNode<TrackAnimParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'track';
	}

	cook() {
		const track = this._create_track();
		const clip = new AnimationClip(this.name, this.pv.duration, [track]);
		this.set_clip(clip);
	}

	private _create_track() {
		const times: number[] = [this.pv.start_time, this.pv.end_time];
		const values: number[] = [this.pv.start_value, this.pv.end_value];
		return new NumberKeyframeTrack(this.pv.name, times, values);
	}
}
