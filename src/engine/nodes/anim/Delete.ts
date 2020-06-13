import {TypedAnimNode} from './_Base';
import {AnimationClip} from 'three/src/animation/AnimationClip';
import {CoreString} from '../../../core/String';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';

class DeleteAnimParamsConfig extends NodeParamsConfig {
	pattern = ParamConfig.STRING('*quat*');
	invert = ParamConfig.BOOLEAN(0);
}
const ParamsConfig = new DeleteAnimParamsConfig();

export class DeleteAnimNode extends TypedAnimNode<DeleteAnimParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'delete';
	}

	initialize_node() {
		this.io.inputs.set_count(1);
	}

	cook(input_clips: AnimationClip[]) {
		const kept_tracks = input_clips[0].tracks.filter((track) => {
			const match = CoreString.match_mask(track.name, this.pv.pattern);
			return this.pv.invert ? match : !match;
		});

		this._clip.name = this.name;
		this._clip.duration = -1;
		this._clip.tracks = kept_tracks;

		this.set_clip(this._clip);
	}
}
