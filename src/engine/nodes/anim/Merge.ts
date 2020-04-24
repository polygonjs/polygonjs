import {TypedAnimNode} from './_Base';
import {AnimationClip} from 'three/src/animation/AnimationClip';
import {KeyframeTrack} from 'three/src/animation/KeyframeTrack';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';

const INPUT_NAME = 'clips to merge';

class MergeAnimParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new MergeAnimParamsConfig();

export class MergeAnimNode extends TypedAnimNode<MergeAnimParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'merge';
	}
	static displayed_input_names(): string[] {
		return [INPUT_NAME, INPUT_NAME, INPUT_NAME, INPUT_NAME];
	}

	initialize_node() {
		this.io.inputs.set_count(1, 4);
		this.ui_data.set_width(100);
	}

	private _merged_names: Map<string, boolean> = new Map();
	cook(input_clips: AnimationClip[]) {
		let tracks_count = 0;
		let max_duration = -1;
		for (let clip of input_clips) {
			if (clip) {
				tracks_count += clip.tracks.length;
			}
		}
		const merged_tracks: KeyframeTrack[] = new Array(tracks_count);
		let i = 0;
		this._merged_names.clear();
		for (let clip of input_clips) {
			if (clip) {
				max_duration = Math.max(clip.duration, max_duration);
				for (let track of clip.tracks) {
					if (!this._merged_names.get(track.name)) {
						merged_tracks[i] = track;
						this._merged_names.set(track.name, true);
						i++;
					}
				}
			}
		}

		const clip = new AnimationClip(this.name, max_duration, merged_tracks);

		this.set_clip(clip);
	}
}
