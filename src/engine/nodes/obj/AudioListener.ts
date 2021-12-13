/**
 * Creates an audio listener.
 *
 * @remarks
 * You typically want to parent this under the camera.
 *
 */
import {TypedObjNode} from './_Base';
// import {Object3D} from 'three/src/core/Object3D';
// import {AudioListener} from 'three/src/audio/AudioListener';
import {TransformedParamConfig, TransformController} from './utils/TransformController';
import {FlagsControllerD} from '../utils/FlagsController';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {HierarchyController} from './utils/HierarchyController';
import {ObjType} from '../../poly/registers/nodes/types/Obj';
import {isBooleanTrue} from '../../../core/Type';

// import {AudioContext} from 'three/src/audio/AudioContext.js';
import {CoreAudioListener} from '../../../core/audio/AudioListener';
import {BaseNodeType} from '../_Base';
class AudioListenerParamConfig extends TransformedParamConfig(NodeParamsConfig) {
	audio = ParamConfig.FOLDER();
	/** @param soundOn */
	soundOn = ParamConfig.BOOLEAN(1, {
		cook: false,
		callback: (node: BaseNodeType) => {
			AudioListenerObjNode.PARAM_CALLBACK_updateListener(node as AudioListenerObjNode);
		},
	});
	/** @param volume */
	masterVolume = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new AudioListenerParamConfig();

export class AudioListenerObjNode extends TypedObjNode<CoreAudioListener, AudioListenerParamConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return ObjType.AUDIO_LISTENER;
	}
	readonly hierarchyController: HierarchyController = new HierarchyController(this);
	readonly transformController: TransformController = new TransformController(this);
	public readonly flags: FlagsControllerD = new FlagsControllerD(this);

	createObject() {
		// const group = new AudioListener();
		const object = new CoreAudioListener();
		object.matrixAutoUpdate = false;

		// const listener = new Listener();
		// console.log(listener.get());
		// console.log(listener.context);
		// (window as any).context2 = listener.context;
		// (window as any).context3 = listener.context.rawContext.listener;
		// (window as any).context4 = AudioContext.getContext();

		return object;
	}
	initializeNode() {
		this.hierarchyController.initializeNode();
		this.transformController.initializeNode();
		this.scene().dispatchController.onAddListener(() => {
			this.params.onParamsCreated('params_label', () => {
				this.params.label.init([this.p.soundOn], () => {
					return this.pv.soundOn ? 'on' : 'off';
				});
			});
		});
		this.lifecycle.onAdd(this._setPositionalAudioNodesDirty.bind(this));
	}
	dispose() {
		super.dispose();
		this.object.dispose();
		this._setPositionalAudioNodesDirty();
	}
	toggleSound() {
		this.p.soundOn.set(!isBooleanTrue(this.pv.soundOn));
	}
	private _setPositionalAudioNodesDirty() {
		// set the positionalAudio dirty
		// so that they can raise an error if no other listener is found
		this.root()
			.nodesByType('positionalAudio')
			.forEach((n) => n.setDirty());
	}

	cook() {
		this.transformController.update();
		this._validateUniq();
		this._updateAudioListener();
		this.cookController.endCook();
	}
	private _validateUniq() {
		const existingListeners = this.root().audioController.audioListeners();
		if (existingListeners.length > 1) {
			this.states.error.set('only 1 audioListener can exist in a scene');
		}
	}

	private _updateAudioListener() {
		const volume = isBooleanTrue(this.pv.soundOn) ? this.pv.masterVolume : 0;
		this.object.setMasterVolume(volume);
	}
	static PARAM_CALLBACK_updateListener(node: AudioListenerObjNode) {
		node._updateAudioListener();
	}
}
