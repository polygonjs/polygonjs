/**
 * Creates an audio source.
 *
 * @remarks
 * This node also has its own transforms. And if it is set as input of other nodes, their objects will be added as children to the object of this node.
 *
 */
import {TypedObjNode} from './_Base';
import {Group} from 'three/src/objects/Group';
import {TransformedParamConfig, TransformController} from './utils/TransformController';
import {FlagsControllerD} from '../utils/FlagsController';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {HierarchyController} from './utils/HierarchyController';
import {ObjType} from '../../poly/registers/nodes/types/Obj';
import {NodeContext} from '../../poly/NodeContext';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {CorePositionalAudio, DistanceModel, DISTANCE_MODELS} from '../../../core/audio/PositionalAudio';
import {CorePositionalAudioHelper} from '../../../core/audio/PositionalAudioHelper';
import {BaseNodeType} from '../_Base';
import {AudioNodeChildrenMap} from '../../poly/registers/nodes/Audio';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {BaseAudioNodeType} from '../audio/_Base';

const paramCallback = () => {
	return {
		cook: false,
		callback: (node: BaseNodeType) => {
			PositionalAudioObjNode.PARAM_CALLBACK_updatePositionalAudio(node as PositionalAudioObjNode);
		},
	};
};

class PositionalAudioParamConfig extends TransformedParamConfig(NodeParamsConfig) {
	audio = ParamConfig.FOLDER();
	/** @param url */
	audioNode = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.AUDIO,
		},
		// dependentOnFoundNode: false,
	});

	/** @param refDistance. See https://developer.mozilla.org/en-US/docs/Web/API/PannerNode/refDistance*/
	refDistance = ParamConfig.FLOAT(10, {
		range: [0, 10],
		rangeLocked: [true, false],
		...paramCallback(),
	});
	/** @param rolloffFactor. See https://developer.mozilla.org/en-US/docs/Web/API/PannerNode/rolloffFactor */
	rolloffFactor = ParamConfig.FLOAT(10, {
		range: [0, 10],
		rangeLocked: [true, false],
		...paramCallback(),
	});
	/** @param maxDistance. See https://developer.mozilla.org/en-US/docs/Web/API/PannerNode/maxDistance */
	maxDistance = ParamConfig.FLOAT(100, {
		range: [0.001, 100],
		rangeLocked: [true, false],
		...paramCallback(),
	});
	/** @param distanceModel. See https://developer.mozilla.org/en-US/docs/Web/API/PannerNode/distanceModel */
	distanceModel = ParamConfig.INTEGER(DISTANCE_MODELS.indexOf(DistanceModel.LINEAR), {
		menu: {
			entries: DISTANCE_MODELS.map((name, value) => {
				return {name, value};
			}),
		},
		...paramCallback(),
	});
	/** @param coneInnerAngle. See https://developer.mozilla.org/en-US/docs/Web/API/PannerNode */
	coneInnerAngle = ParamConfig.FLOAT(360, {
		range: [0, 360],
		rangeLocked: [true, true],
		...paramCallback(),
	});
	/** @param coneOuterAngle. See https://developer.mozilla.org/en-US/docs/Web/API/PannerNode */
	coneOuterAngle = ParamConfig.FLOAT(230, {
		range: [0, 360],
		rangeLocked: [true, true],
		...paramCallback(),
	});
	/** @param coneOuterGain. See https://developer.mozilla.org/en-US/docs/Web/API/PannerNode */
	coneOuterGain = ParamConfig.FLOAT(0.1, {
		range: [0, 1],
		rangeLocked: [true, true],
		...paramCallback(),
	});
	/** @param show helper */
	showHelper = ParamConfig.BOOLEAN(1);
	/** @param helper size */
	helperSize = ParamConfig.FLOAT(1, {
		range: [0, 10],
		rangeLocked: [true, false],
		visibleIf: {showHelper: true},
		...paramCallback(),
	});
}
const ParamsConfig = new PositionalAudioParamConfig();

function createPositionalAudio() {
	const positionalAudio = new CorePositionalAudio();
	positionalAudio.matrixAutoUpdate = false;
	return positionalAudio;
}

export class PositionalAudioObjNode extends TypedObjNode<Group, PositionalAudioParamConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return ObjType.POSITIONAL_AUDIO;
	}
	override readonly hierarchyController: HierarchyController = new HierarchyController(this);
	override readonly transformController: TransformController = new TransformController(this);
	public override readonly flags: FlagsControllerD = new FlagsControllerD(this);
	private _positionalAudio = createPositionalAudio();
	private _helper: CorePositionalAudioHelper | undefined;

	override createObject() {
		const group = new Group();
		group.matrixAutoUpdate = false;
		group.add(this._positionalAudio);
		return group;
	}
	override initializeNode() {
		this.hierarchyController.initializeNode();
		this.transformController.initializeNode();
		this._updateHelperHierarchy();

		this.flags.display.onUpdate(async () => {
			await this._updateToDestination();
			await this._updateHelperHierarchy();
		});
	}
	private async _updateToDestination() {
		if (this.flags.display.active()) {
			const listener = this.root().audioController.audioListeners()[0];
			if (!listener) {
				this.states.error.set('a listener is required in the scene');
				return;
			}
			// this._positionalAudio.disconnect();
			listener.object.addInput(this._positionalAudio);
		} else {
			this._positionalAudio.disconnect();
		}
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

	override async cook() {
		this.transformController.update();

		await this._updateToDestination();
		this._updatePositionalAudio();
		this._connectAudioNode();

		this.cookController.endCook();
	}

	private async _updatePositionalAudio() {
		this._positionalAudio.setRefDistance(this.pv.refDistance);
		this._positionalAudio.setRolloffFactor(this.pv.rolloffFactor);
		this._positionalAudio.setMaxDistance(this.pv.maxDistance);
		this._positionalAudio.setDistanceModel(DISTANCE_MODELS[this.pv.distanceModel]);
		this._positionalAudio.setDirectionalCone(this.pv.coneInnerAngle, this.pv.coneOuterAngle, this.pv.coneOuterGain);

		if (isBooleanTrue(this.pv.showHelper)) {
			this._helper = this._helper || this._createHelper(this._positionalAudio);
			this.object.add(this._helper);
		}
		if (this._helper) {
			this._helper.visible = isBooleanTrue(this.pv.showHelper);
			this._helper.range = this.pv.helperSize;
			this._helper.update();
		}
	}
	private _createHelper(positionalAudio: CorePositionalAudio) {
		const helper = new CorePositionalAudioHelper(positionalAudio);
		helper.matrixAutoUpdate = false;
		return helper;
	}

	private _resetAudioNode() {
		this._positionalAudio.setInput(undefined);
	}
	private async _connectAudioNode() {
		this._positionalAudio.setInput(undefined);

		const baseAudioNode = this.pv.audioNode.nodeWithContext(NodeContext.AUDIO);
		if (!baseAudioNode) {
			this.states.error.set('no audio node found');
			this._resetAudioNode();
			return;
		}
		const audioContainer = await baseAudioNode.compute();
		const audioBuilder = audioContainer.coreContent();
		if (!audioBuilder) {
			this.states.error.set('invalid audio node');
			this._resetAudioNode();
			return;
		}
		const toneAudioNode = audioBuilder.audioNode();
		if (!toneAudioNode) {
			this.states.error.set('no valid audio node given');
			this._resetAudioNode();
			return;
		}
		this._positionalAudio.setInput(toneAudioNode);
	}

	static PARAM_CALLBACK_updatePositionalAudio(node: PositionalAudioObjNode) {
		node._updatePositionalAudio();
	}

	/*
	 *
	 * CHILDREN
	 *
	 */
	protected override _childrenControllerContext = NodeContext.AUDIO;
	override createNode<S extends keyof AudioNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): AudioNodeChildrenMap[S];
	override createNode<K extends valueof<AudioNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K;
	override createNode<K extends valueof<AudioNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K {
		return super.createNode(node_class, options) as K;
	}
	override children() {
		return super.children() as BaseAudioNodeType[];
	}
	override nodesByType<K extends keyof AudioNodeChildrenMap>(type: K): AudioNodeChildrenMap[K][] {
		return super.nodesByType(type) as AudioNodeChildrenMap[K][];
	}
}
