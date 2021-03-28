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
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {HierarchyController} from './utils/HierarchyController';
import {ObjType} from '../../poly/registers/nodes/types/Obj';
class AudioListenerParamConfig extends TransformedParamConfig(NodeParamsConfig) {}
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
	}

	cook() {
		this.transformController.update();
		this.cookController.endCook();
	}
}
