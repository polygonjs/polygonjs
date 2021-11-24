/**
 * Creates an audio listener.
 *
 * @remarks
 * You typically want to parent this under the camera.
 *
 */
import {TypedObjNode} from './_Base';
import {AudioListener} from 'three/src/audio/AudioListener';
import {TransformedParamConfig, TransformController} from './utils/TransformController';
import {FlagsControllerD} from '../utils/FlagsController';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {HierarchyController} from './utils/HierarchyController';
import {ObjType} from '../../poly/registers/nodes/types/Obj';
import {isBooleanTrue} from '../../../core/Type';
class AudioListenerParamConfig extends TransformedParamConfig(NodeParamsConfig) {
	audio = ParamConfig.FOLDER();
	/** @param soundOn */
	soundOn = ParamConfig.BOOLEAN(1);
	/** @param volume */
	masterVolume = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new AudioListenerParamConfig();

export class AudioListenerObjNode extends TypedObjNode<AudioListener, AudioListenerParamConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return ObjType.AUDIO_LISTENER;
	}
	readonly hierarchyController: HierarchyController = new HierarchyController(this);
	readonly transformController: TransformController = new TransformController(this);
	public readonly flags: FlagsControllerD = new FlagsControllerD(this);

	createObject() {
		const group = new AudioListener();
		group.matrixAutoUpdate = false;
		return group;
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
	}

	cook() {
		this.transformController.update();
		this._updatePositionalAudio();
		this.cookController.endCook();
	}

	private _updatePositionalAudio() {
		const volume = isBooleanTrue(this.pv.soundOn) ? this.pv.masterVolume : 0;
		this.object.setMasterVolume(volume);
	}
}
