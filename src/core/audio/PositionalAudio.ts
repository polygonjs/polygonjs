import {Vector3} from 'three';
import {Quaternion} from 'three';
import {Panner3D} from 'tone/build/esm/component/channel/Panner3D';
import {Object3D} from 'three';
import {ToneAudioNode} from 'tone/build/esm/core/context/ToneAudioNode';

const _position = new Vector3();
const _quaternion = new Quaternion();
const _scale = new Vector3();
const _orientation = new Vector3();

export enum DistanceModel {
	LINEAR = 'linear',
	INVERSE = 'inverse',
	EXPONENTIAL = 'exponential',
}
export const DISTANCE_MODELS: DistanceModel[] = [
	DistanceModel.LINEAR,
	DistanceModel.INVERSE,
	DistanceModel.EXPONENTIAL,
];

export class CorePositionalAudio extends Object3D {
	private tonePanner: Panner3D;
	private pannerNode: PannerNode;
	public listenerTransformAutoUpdate: boolean = true;
	constructor() {
		super();

		this.tonePanner = new Panner3D(); //.toDestination();
		this.pannerNode = this.tonePanner.input;

		// this.panner = this.listener.context.createPanner();
		// this.panner.panningModel = 'HRTF';
		// this.panner.connect(this.gain);
	}
	disconnect() {
		this.tonePanner.disconnect();
	}
	private _currentAudioNode: ToneAudioNode | undefined;
	setInput(audioNode: ToneAudioNode | undefined) {
		if (this._currentAudioNode) {
			this._currentAudioNode.disconnect(this.tonePanner);
		}

		if (audioNode) {
			audioNode.connect(this.tonePanner);
		}
		this._currentAudioNode = audioNode;
	}
	connect(audioNode: ToneAudioNode) {
		this.tonePanner.connect(audioNode);
	}

	// getOutput() {
	// 	return this.panner;
	// }

	getRefDistance() {
		return this.pannerNode.refDistance;
	}

	setRefDistance(value: number) {
		this.pannerNode.refDistance = value;

		return this;
	}

	getRolloffFactor() {
		return this.pannerNode.rolloffFactor;
	}

	setRolloffFactor(value: number) {
		this.pannerNode.rolloffFactor = value;

		return this;
	}

	getDistanceModel() {
		return this.pannerNode.distanceModel;
	}

	setDistanceModel(value: DistanceModel) {
		this.pannerNode.distanceModel = value;

		return this;
	}

	getMaxDistance() {
		return this.pannerNode.maxDistance;
	}

	setMaxDistance(value: number) {
		this.pannerNode.maxDistance = value;

		return this;
	}

	setDirectionalCone(coneInnerAngle: number, coneOuterAngle: number, coneOuterGain: number) {
		this.pannerNode.coneInnerAngle = coneInnerAngle;
		this.pannerNode.coneOuterAngle = coneOuterAngle;
		this.pannerNode.coneOuterGain = coneOuterGain;

		return this;
	}
	coneInnerAngle() {
		return this.pannerNode.coneInnerAngle;
	}
	coneOuterAngle() {
		return this.pannerNode.coneOuterAngle;
	}

	override updateMatrixWorld(force: boolean) {
		super.updateMatrixWorld(force);
		if (!this.listenerTransformAutoUpdate) {
			return;
		}

		// if (this.hasPlaybackControl === true && this.isPlaying === false) return;

		this.matrixWorld.decompose(_position, _quaternion, _scale);

		_orientation.set(0, 0, 1).applyQuaternion(_quaternion);

		const duration = '+1';
		const panner = this.tonePanner;
		if (panner.positionX) {
			// code path for Chrome and Firefox (see threejs #14393)
			panner.positionX.linearRampToValueAtTime(_position.x, duration);
			panner.positionY.linearRampToValueAtTime(_position.y, duration);
			panner.positionZ.linearRampToValueAtTime(_position.z, duration);

			panner.orientationX.linearRampToValueAtTime(_orientation.x, duration);
			panner.orientationY.linearRampToValueAtTime(_orientation.y, duration);
			panner.orientationZ.linearRampToValueAtTime(_orientation.z, duration);
		} else {
			panner.setPosition(_position.x, _position.y, _position.z);
			panner.setOrientation(_orientation.x, _orientation.y, _orientation.z);
		}
	}
}
