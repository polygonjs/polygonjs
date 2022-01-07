/**
 * Creates an audio listener.
 *
 * @remarks
 * You typically want to parent this under the camera.
 *
 */
import {TypedObjNode} from './_Base';
import {TransformedParamConfig, TransformController} from './utils/TransformController';
import {FlagsControllerD} from '../utils/FlagsController';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {HierarchyController} from './utils/HierarchyController';
import {ObjType} from '../../poly/registers/nodes/types/Obj';
import {isBooleanTrue} from '../../../core/Type';
import {CoreAudioListener} from '../../../core/audio/AudioListener';
import {BaseNodeType} from '../_Base';
import {AudioController} from '../../../core/audio/AudioController';
class AudioListenerParamConfig extends TransformedParamConfig(NodeParamsConfig) {
	audio = ParamConfig.FOLDER();
	/** @param soundOn */
	soundOn = ParamConfig.BOOLEAN(1, {
		cook: false,
		callback: (node: BaseNodeType) => {
			AudioListenerObjNode.PARAM_CALLBACK_update(node as AudioListenerObjNode);
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
		this.lifecycle.onAdd(() => {
			this._setPositionalAudioNodesDirty();
			this.addAudioActivationEvents();
		});
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
		this._updateListenersAndViewers();
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

	private _updateViewers() {
		this.root().audioController.update();
	}
	private _updateListenersAndViewers() {
		this._updateAudioListener();
		this._updateViewers();
	}

	static PARAM_CALLBACK_update(node: AudioListenerObjNode) {
		node._updateListenersAndViewers();
	}

	/*

	EVENTS TO ACTIVATE SOUND

	*/
	private static _eventsAdded = false;
	private static _audioActivated = false;
	private async _onpointerdown(event: PointerEvent) {
		await this.activateSound();
	}
	private async _onkeypress(event: KeyboardEvent) {
		await this.activateSound();
	}
	static soundActivated(): boolean {
		return this._audioActivated;
	}
	soundActivated(): boolean {
		return AudioListenerObjNode.soundActivated();
	}
	async activateSound() {
		if (!this.soundActivated()) {
			await AudioController.start();
			AudioListenerObjNode._audioActivated = true;
		}
		this._removeAudioActivationEvents();
	}
	private _boundEvents = {
		pointerdown: this._onpointerdown.bind(this),
		keypress: this._onkeypress.bind(this),
	};
	addAudioActivationEvents() {
		if (this.soundActivated()) {
			return;
		}
		if (AudioListenerObjNode._eventsAdded) {
			return;
		}
		AudioListenerObjNode._eventsAdded = true;
		document.body.addEventListener('pointerdown', this._boundEvents.pointerdown);
		document.body.addEventListener('keypress', this._boundEvents.keypress);
	}
	private _removeAudioActivationEvents() {
		document.body.removeEventListener('pointerdown', this._boundEvents.pointerdown);
		document.body.removeEventListener('keypress', this._boundEvents.keypress);
	}
}
