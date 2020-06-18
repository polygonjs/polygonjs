// import {TypedAnimNode} from './_Base';
// import {AnimationClip} from 'three/src/animation/AnimationClip';
// import {VectorKeyframeTrack} from 'three/src/animation/tracks/VectorKeyframeTrack';
// import {QuaternionKeyframeTrack} from 'three/src/animation/tracks/QuaternionKeyframeTrack';
// import {NodeContext} from '../../poly/NodeContext';
// import {BaseNodeType} from '../_Base';
// import {BaseSopNodeType} from '../sop/_Base';
// import {Vector3} from 'three/src/math/Vector3';
// import {Quaternion} from 'three/src/math/Quaternion';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// class TransformAnimParamsConfig extends NodeParamsConfig {
// 	object = ParamConfig.OPERATOR_PATH('/geo1/OUT', {
// 		node_selection: {
// 			context: NodeContext.SOP,
// 		},
// 		dependent_on_found_node: false,
// 	});
// 	start_frame = ParamConfig.FLOAT(0, {
// 		range: [1, 100],
// 		range_locked: [false, false],
// 	});
// 	end_frame = ParamConfig.FLOAT(100, {
// 		range: [1, 100],
// 		range_locked: [false, false],
// 	});
// 	cache = ParamConfig.BUTTON(null, {
// 		callback: (node: BaseNodeType) => {
// 			TransformAnimNode.PARAM_CALLBACK_cache(node as TransformAnimNode);
// 		},
// 	});
// }
// const ParamsConfig = new TransformAnimParamsConfig();

// export class TransformAnimNode extends TypedAnimNode<TransformAnimParamsConfig> {
// 	params_config = ParamsConfig;
// 	static type(): Readonly<'transform'> {
// 		return 'transform';
// 	}

// 	private _dummy_clip = new AnimationClip(this.name, -1, []);
// 	private _cached_clip: AnimationClip | undefined;
// 	cook() {
// 		if (this._cached_clip) {
// 			this.set_clip(this._cached_clip);
// 		} else {
// 			this._dummy_clip = new AnimationClip(this.name, -1, []);
// 			this.set_clip(this._dummy_clip);
// 		}
// 	}

// 	static PARAM_CALLBACK_cache(node: TransformAnimNode) {
// 		node._cache();
// 	}

// 	private _resolved_node: BaseSopNodeType | undefined;
// 	private _times: number[] = [];
// 	private _values_t: number[] = [];
// 	private _values_r: number[] = [];
// 	private _values_s: number[] = [];
// 	private async _cache() {
// 		this.init_cache();
// 		const frames_count = this.pv.end_frame - this.pv.start_frame + 1;
// 		if (frames_count <= 0) {
// 			return;
// 		}
// 		for (let i = this.pv.start_frame; i <= this.pv.end_frame; i++) {
// 			this.scene.set_frame(i);
// 			await this.cache_current_frame();
// 		}
// 		this.create_clip_from_cached_frames();
// 	}
// 	async init_cache() {
// 		this._reset_cache();

// 		if (!this._resolved_node) {
// 			await this._get_resolved_object();
// 		}
// 	}

// 	async cache_current_frame() {
// 		if (!this._resolved_node) {
// 			console.warn(`no resolved node for ${this.full_path()}`);
// 			return;
// 		}
// 		const container = await this._resolved_node.request_container();
// 		const core_group = container.core_content();
// 		if (core_group) {
// 			const object = core_group.objects()[0];
// 			object.updateMatrix();
// 			object.updateWorldMatrix(true, false);
// 			object.updateMatrixWorld(true);
// 			// TODO: should I test that the resolved node is the display node of its containing obj node?
// 			// Because if it isn't, it will not have a parent, and therefore the matrix will be flawed.
// 			object.matrixWorld.decompose(this._object_t, this._object_q, this._object_s);
// 			console.log(object, object.matrixWorld.elements, this._object_t.x, this._object_t.y, this._object_t.z);

// 			const i = this._times.length;
// 			this._times.push(i);
// 			this._object_t.toArray(this._values_t, i * 3);
// 			this._object_q.toArray(this._values_r, i * 4);
// 			this._object_s.toArray(this._values_s, i * 3);
// 		} else {
// 			console.warn(`no resolved object for ${this.full_path()}`);
// 		}
// 	}
// 	create_clip_from_cached_frames() {
// 		const track_t = new VectorKeyframeTrack('.position', this._times, this._values_t);
// 		const track_r = new QuaternionKeyframeTrack('.quaternion', this._times, this._values_r);
// 		const track_s = new VectorKeyframeTrack('.scale', this._times, this._values_s);

// 		this._cached_clip = new AnimationClip(this.name, -1, [track_t, track_r, track_s]);
// 		this.set_clip(this._cached_clip);
// 		this.set_successors_dirty();
// 	}

// 	private _reset_cache() {
// 		console.log('reset');
// 		this._resolved_node = undefined;
// 		this._cached_clip = undefined;
// 		this._times = [];
// 		this._values_t = [];
// 		this._values_r = [];
// 		this._values_s = [];
// 	}

// 	private _object_t = new Vector3();
// 	private _object_q = new Quaternion();
// 	private _object_s = new Vector3();

// 	private async _get_resolved_object() {
// 		const param = this.p.object;
// 		if (param.is_dirty) {
// 			await param.compute();
// 		}
// 		this._resolved_node = param.found_node_with_context(NodeContext.SOP);
// 	}
// }
