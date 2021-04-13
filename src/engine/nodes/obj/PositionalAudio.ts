/**
 * Creates an audio source.
 *
 * @remarks
 * This node also has its own transforms. And if it is set as input of other nodes, their objects will be added as children to the object of this node.
 *
 */
import {TypedObjNode} from './_Base';
import {Group} from 'three/src/objects/Group';
import {PositionalAudio} from 'three/src/audio/PositionalAudio';
import {TransformedParamConfig, TransformController} from './utils/TransformController';
import {FlagsControllerD} from '../utils/FlagsController';
import {PositionalAudioHelper} from '../../../modules/three/examples/jsm/helpers/PositionalAudioHelper';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {HierarchyController} from './utils/HierarchyController';
import {ObjType} from '../../poly/registers/nodes/types/Obj';
import {NodeContext} from '../../poly/NodeContext';
import {AudioListenerObjNode} from './AudioListener';
import {CoreLoaderAudio} from '../../../core/loader/Audio';
import {BaseNodeType} from '../_Base';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {FileType} from '../../params/utils/OptionsController';

enum DistanceModel {
	LINEAR = 'linear',
	INVERSE = 'inverse',
	EXPONENTIAL = 'exponential',
}
const DISTANCE_MODELS: DistanceModel[] = [DistanceModel.LINEAR, DistanceModel.INVERSE, DistanceModel.EXPONENTIAL];

class PositionalAudioParamConfig extends TransformedParamConfig(NodeParamsConfig) {
	audio = ParamConfig.FOLDER();
	/** @param listener */
	listener = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.OBJ,
			types: [ObjType.AUDIO_LISTENER],
		},
	});
	/** @param url */
	url = ParamConfig.STRING('', {
		fileBrowse: {type: [FileType.AUDIO]},
	});

	/** @param refDistance. See https://developer.mozilla.org/en-US/docs/Web/API/PannerNode/refDistance*/
	refDistance = ParamConfig.FLOAT(10, {
		range: [0, 10],
		rangeLocked: [true, false],
	});
	/** @param rolloffFactor. See https://developer.mozilla.org/en-US/docs/Web/API/PannerNode/rolloffFactor */
	rolloffFactor = ParamConfig.FLOAT(10, {
		range: [0, 10],
		rangeLocked: [true, false],
	});
	/** @param maxDistance. See https://developer.mozilla.org/en-US/docs/Web/API/PannerNode/maxDistance */
	maxDistance = ParamConfig.FLOAT(100, {
		range: [0.001, 100],
		rangeLocked: [true, false],
	});
	/** @param distanceModel. See https://developer.mozilla.org/en-US/docs/Web/API/PannerNode/distanceModel */
	distanceModel = ParamConfig.INTEGER(DISTANCE_MODELS.indexOf(DistanceModel.LINEAR), {
		menu: {
			entries: DISTANCE_MODELS.map((name, value) => {
				return {name, value};
			}),
		},
	});
	/** @param coneInnerAngle. See https://developer.mozilla.org/en-US/docs/Web/API/PannerNode */
	coneInnerAngle = ParamConfig.FLOAT(180, {
		range: [0, 360],
		rangeLocked: [true, true],
	});
	/** @param coneOuterAngle. See https://developer.mozilla.org/en-US/docs/Web/API/PannerNode */
	coneOuterAngle = ParamConfig.FLOAT(230, {
		range: [0, 360],
		rangeLocked: [true, true],
	});
	/** @param coneOuterGain. See https://developer.mozilla.org/en-US/docs/Web/API/PannerNode */
	coneOuterGain = ParamConfig.FLOAT(0.1, {
		range: [0, 1],
		rangeLocked: [true, true],
	});
	/** @param autoplay */
	autoplay = ParamConfig.BOOLEAN(1);
	/** @param show helper */
	showHelper = ParamConfig.BOOLEAN(0);
	/** @param play */
	play = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			PositionalAudioObjNode.PARAM_CALLBACK_play(node as PositionalAudioObjNode);
		},
	});
	/** @param pause */
	pause = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			PositionalAudioObjNode.PARAM_CALLBACK_pause(node as PositionalAudioObjNode);
		},
	});
}
const ParamsConfig = new PositionalAudioParamConfig();

export class PositionalAudioObjNode extends TypedObjNode<Group, PositionalAudioParamConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return ObjType.POSITIONAL_AUDIO;
	}
	readonly hierarchyController: HierarchyController = new HierarchyController(this);
	readonly transformController: TransformController = new TransformController(this);
	public readonly flags: FlagsControllerD = new FlagsControllerD(this);
	private _helper: PositionalAudioHelper | undefined;
	private _positionalAudio: PositionalAudio | undefined;
	private _loadedUrl: string | undefined;

	createObject() {
		const group = new Group();
		group.matrixAutoUpdate = false;
		return group;
	}
	initializeNode() {
		this.hierarchyController.initializeNode();
		this.transformController.initializeNode();
		this._updateHelperHierarchy();
		this.flags.display.onUpdate(() => {
			this._updateHelperHierarchy();
		});
	}
	private _updateHelperHierarchy() {
		if (!this._helper) {
			return;
		}
		if (this.flags.display.active()) {
			this.object.add(this._helper);
		} else {
			this.object.remove(this._helper);
		}
	}

	cook() {
		this.transformController.update();

		this._updatePositionalAudio();

		this.cookController.endCook();
	}

	private async _updatePositionalAudio() {
		if (this.p.listener.isDirty()) {
			await this.p.listener.compute();
		}

		const newUrl = this.pv.url;
		if (this._loadedUrl != newUrl) {
			this._createPositionalAudio();
		}

		if (this._positionalAudio) {
			this._positionalAudio.setRefDistance(this.pv.refDistance);
			this._positionalAudio.setRolloffFactor(this.pv.rolloffFactor);
			this._positionalAudio.setMaxDistance(this.pv.maxDistance);
			this._positionalAudio.setDistanceModel(DISTANCE_MODELS[this.pv.distanceModel]);
			this._positionalAudio.setDirectionalCone(
				this.pv.coneInnerAngle,
				this.pv.coneOuterAngle,
				this.pv.coneOuterGain
			);

			if (isBooleanTrue(this.pv.showHelper)) {
				this._helper = this._helper || this._createHelper(this._positionalAudio);
				this.object.add(this._helper);
			}
			if (this._helper) {
				this._helper.visible = isBooleanTrue(this.pv.showHelper);
				this._helper.update();
			}

			if (isBooleanTrue(this.pv.autoplay)) {
				if (!isBooleanTrue(this._positionalAudio.isPlaying)) {
					console.log('play');
					this._positionalAudio.play();
				}
			}
		}
	}
	private _createHelper(positionalAudio: PositionalAudio) {
		const helper = new PositionalAudioHelper(positionalAudio);

		helper.matrixAutoUpdate = false;
		return helper;
	}

	private async _createPositionalAudio() {
		const node = this.pv.listener.nodeWithContext(NodeContext.OBJ) as AudioListenerObjNode | undefined;
		if (!node) {
			return;
		}
		const listener = node.object;

		if (this._positionalAudio) {
			this._positionalAudio.stop();
			if (this._positionalAudio.source) {
				this._positionalAudio.disconnect();
			}
			this.object.remove(this._positionalAudio);
			this._positionalAudio = undefined;
		}
		if (this._helper) {
			this._helper.dispose();
			this._helper = undefined;
		}

		this._positionalAudio = new PositionalAudio(listener);
		this._positionalAudio.matrixAutoUpdate = false;

		const loader = new CoreLoaderAudio(this.pv.url, this.scene(), this);
		const buffer = await loader.load();
		this._loadedUrl = this.pv.url;
		this._positionalAudio.setBuffer(buffer);

		this.object.add(this._positionalAudio);
	}

	static PARAM_CALLBACK_play(node: PositionalAudioObjNode) {
		node.PARAM_CALLBACK_play();
	}
	static PARAM_CALLBACK_pause(node: PositionalAudioObjNode) {
		node.PARAM_CALLBACK_pause();
	}
	private PARAM_CALLBACK_play() {
		if (!this._positionalAudio) {
			return;
		}
		this._positionalAudio.play();
	}
	private PARAM_CALLBACK_pause() {
		if (!this._positionalAudio) {
			return;
		}
		this._positionalAudio.pause();
	}
}
