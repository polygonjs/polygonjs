import {TypedAnimNode} from './_Base';
import {NumberKeyframeTrack} from 'three/src/animation/tracks/NumberKeyframeTrack';
import {VectorKeyframeTrack} from 'three/src/animation/tracks/VectorKeyframeTrack';
import {Vector3} from 'three/src/math/Vector3';

enum TrackType {
	FLOAT = 'float',
	VECTOR3 = 'vector3',
}
const TRACK_TYPES: TrackType[] = [TrackType.FLOAT, TrackType.VECTOR3];

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {TypeAssert} from '../../poly/Assert';
class TrackAnimParamsConfig extends NodeParamsConfig {
	type = ParamConfig.INTEGER(TRACK_TYPES.indexOf(TrackType.FLOAT), {
		menu: {
			entries: TRACK_TYPES.map((name, value) => {
				return {name, value};
			}),
		},
	});
	name = ParamConfig.STRING('.position[x]');
	duration = ParamConfig.FLOAT(-1);
	sep1 = ParamConfig.SEPARATOR();
	key0_time = ParamConfig.FLOAT(0, {
		range: [0, 10],
		range_locked: [false, false],
	});
	key0_float = ParamConfig.FLOAT(0, {
		range: [0, 10],
		range_locked: [false, false],
		visible_if: {type: TRACK_TYPES.indexOf(TrackType.FLOAT)},
	});
	key0_vector3 = ParamConfig.VECTOR3([0, 0, 0], {
		visible_if: {type: TRACK_TYPES.indexOf(TrackType.VECTOR3)},
	});
	sep2 = ParamConfig.SEPARATOR();
	key1_time = ParamConfig.FLOAT(1, {
		range: [0, 10],
		range_locked: [false, false],
	});
	key1_float = ParamConfig.FLOAT(1, {
		range: [0, 10],
		range_locked: [false, false],
		visible_if: {type: TRACK_TYPES.indexOf(TrackType.FLOAT)},
	});
	key1_vector3 = ParamConfig.VECTOR3([0, 0, 0], {
		visible_if: {type: TRACK_TYPES.indexOf(TrackType.VECTOR3)},
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
		this._clip.name = this.pv.name;
		this._clip.duration = this.pv.duration;
		this._clip.tracks = [track];
		this.set_clip(this._clip);
	}

	private _create_track() {
		const type = TRACK_TYPES[this.pv.type];
		switch (type) {
			case TrackType.FLOAT:
				return this._create_track_float();
			case TrackType.VECTOR3:
				return this._create_track_vector3();
		}
		TypeAssert.unreachable(type);
	}
	private _create_track_float() {
		const times: number[] = [this.pv.key0_time, this.pv.key1_time];
		const values: number[] = [this.pv.key0_float, this.pv.key1_float];
		return new NumberKeyframeTrack(this.pv.name, times, values);
	}
	private _create_track_vector3() {
		const times: number[] = [this.pv.key0_time, this.pv.key1_time];
		const values: Vector3[] = [this.pv.key0_vector3, this.pv.key1_vector3];
		return new VectorKeyframeTrack(this.pv.name, times, values);
	}
}
