/**
 * Update the object position
 *
 *
 */

import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {Hands, Results} from '@mediapipe/hands';
import {VideoTexture, Vector3, Points, CanvasTexture} from 'three';
import {Attribute} from '../../../core/geometry/Attribute';
const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

// type OnResult = (results: Results, context:ActorNodeTriggerContext)=>void

const _pos = new Vector3();
// const _uv = new Vector2();
const _prevPos = new Vector3();

class UpdateMediapipeHandsActorParamsConfig extends NodeParamsConfig {
	/** @param selfie mode */
	// selfieMode = ParamConfig.BOOLEAN(0, {
	// 	separatorBefore: true,
	// });
	/** @param min detection confidence */
	minDetectionConfidence = ParamConfig.FLOAT(0.5, {
		range: [0, 1],
		rangeLocked: [true, true],
	});
	/** @param max detection confidence */
	maxDetectionConfidence = ParamConfig.FLOAT(0.5, {
		range: [0, 1],
		rangeLocked: [true, true],
	});
	/** @param prevents jitter between frames */
	smoothFactor = ParamConfig.FLOAT(0, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
	/** @param scale */
	scale = ParamConfig.FLOAT(1, {
		range: [0, 2],
		rangeLocked: [true, false],
		separatorBefore: true,
	});
}
const ParamsConfig = new UpdateMediapipeHandsActorParamsConfig();

export class UpdateMediapipeHandsActorNode extends TypedActorNode<UpdateMediapipeHandsActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'updateMediapipeHands';
	}
	private _inProgress = false;
	private _hands: Hands | undefined;

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new ActorConnectionPoint(
				ActorConnectionPointType.OBJECT_3D,
				ActorConnectionPointType.OBJECT_3D,
				CONNECTION_OPTIONS
			),
			new ActorConnectionPoint(
				ActorConnectionPointType.TEXTURE,
				ActorConnectionPointType.TEXTURE,
				CONNECTION_OPTIONS
			),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER),
		]);
	}
	private _createHands() {
		const hands = new Hands({
			locateFile: (file: string) => {
				return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
			},
		});
		hands.setOptions({
			maxNumHands: 1,
			modelComplexity: 1,
			minDetectionConfidence: 0.5,
			minTrackingConfidence: 0.5,
		});

		hands.onResults((results: Results) => {
			this._inProgress = false;
			if (!this._lastPoints) {
				return;
			}
			this.updateMeshFromResults(this._lastPoints, results);
		});
		return hands;
	}

	private updateMeshFromResults(HandsObject: Points, results: Results) {
		const pv = this.pv;
		if (results.multiHandLandmarks.length > 0) {
			console.log({results: results.multiHandLandmarks.length});
		}
		const landmark = results.multiHandLandmarks[0];
		if (!landmark) {
			return;
		}
		const geometry = HandsObject.geometry;
		const positionAttribute = geometry.getAttribute(Attribute.POSITION);
		const positionArray = positionAttribute.array as number[];
		const scale = pv.scale;
		let i = 0;
		const smoothFactor = pv.smoothFactor;
		const performSmooth = smoothFactor > 0;
		// try {
		for (let pt of landmark) {
			_pos.set(1 - pt.x, 1 - pt.y, pt.z);
			_pos.multiplyScalar(scale);

			if (performSmooth) {
				_prevPos.fromArray(positionArray, i * 3);
				_pos.lerp(_prevPos, smoothFactor);
			}

			_pos.toArray(positionArray, i * 3);
			i++;
		}

		positionAttribute.needsUpdate = true;
	}

	private _lastPoints: Points | undefined;
	public override receiveTrigger(context: ActorNodeTriggerContext) {
		const Object3D =
			this._inputValue<ActorConnectionPointType.OBJECT_3D>(ActorConnectionPointType.OBJECT_3D, context) ||
			context.Object3D;
		const texture = this._inputValue<ActorConnectionPointType.TEXTURE>(ActorConnectionPointType.TEXTURE, context);

		if ((Object3D as Points).geometry) {
			this._lastPoints = Object3D as Points;
		} else {
			console.log('no mesh');
			return;
		}

		if (texture) {
			let source: HTMLVideoElement | HTMLCanvasElement | undefined;
			if (texture instanceof VideoTexture) {
				source = texture.image;
			} else if (texture instanceof CanvasTexture) {
				source = texture.source.data;
			}
			// console.log(source);
			if (source && !this._inProgress) {
				this._inProgress = true;
				this._hands = this._hands || this._createHands();
				this._hands.send({image: source});
			}
		}
	}
}
