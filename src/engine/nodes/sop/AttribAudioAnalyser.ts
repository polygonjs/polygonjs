/**
 * Accumulates attributes based on audio analyser nodes
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AUDIO_ANALYSER_NODES, NodeContext} from '../../poly/NodeContext';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {BufferAttribute} from 'three';
import {NodePathParam} from '../../params/NodePath';
import {BooleanParam} from '../../params/Boolean';
import {StringParam} from '../../params/String';
import {isBooleanTrue} from '../../../core/Type';
import {BaseAnalyserAudioNode} from '../audio/_BaseAnalyser';
import {CoreObjectType, ObjectContent} from '../../../core/geometry/ObjectContent';
import {corePointClassFactory} from '../../../core/geometry/CoreObjectFactory';

interface ParamSet {
	active: BooleanParam;
	attribName: StringParam;
	node: NodePathParam;
}

interface ParamSetByIndex {
	'0': ParamSet;
	'1': ParamSet;
	'2': ParamSet;
}
type ParaSetIndex = keyof ParamSetByIndex;

class AttribAudioAnalyserSopParamsConfig extends NodeParamsConfig {
	/** @param the point or object index this applies to */
	index = ParamConfig.INTEGER('$F', {
		range: [0, 100],
		rangeLocked: [true, false],
	});
	/** @param values size */
	valuesSize = ParamConfig.INTEGER(8);
	/** @param sets if audioNode0 is read */
	active0 = ParamConfig.BOOLEAN(0);
	/** @param attribute name */
	attrib0 = ParamConfig.STRING('audioNode0', {visibleIf: {active0: 1}});
	/** @param audio node to read data from */
	audioNode0 = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.AUDIO,
			types: AUDIO_ANALYSER_NODES,
		},
		visibleIf: {active0: 1},
	});

	/** @param sets if audioNode0 is read */
	active1 = ParamConfig.BOOLEAN(0);
	/** @param attribute name */
	attrib1 = ParamConfig.STRING('audioNode0', {visibleIf: {active1: 1}});
	/** @param audio node to read data from */
	audioNode1 = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.AUDIO,
			types: AUDIO_ANALYSER_NODES,
		},
		visibleIf: {active1: 1},
	});

	/** @param sets if audioNode0 is read */
	active2 = ParamConfig.BOOLEAN(0);
	/** @param attribute name */
	attrib2 = ParamConfig.STRING('audioNode0', {visibleIf: {active2: 1}});
	/** @param audio node to read data from */
	audioNode2 = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.AUDIO,
			types: AUDIO_ANALYSER_NODES,
		},
		visibleIf: {active2: 1},
	});
}
const ParamsConfig = new AttribAudioAnalyserSopParamsConfig();
export class AttribAudioAnalyserSopNode extends TypedSopNode<AttribAudioAnalyserSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'attribAudioAnalyser';
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
	}

	// private _attribIndex: number = 0;
	override cook(inputCoreGroups: CoreGroup[]) {
		this._initParamsByIndex();
		this._registerOnTickHook();
		const coreGroup = inputCoreGroups[0];

		// if (this.scene().frame() == TimeController.START_FRAME) {
		// 	this._attribIndex = 0;
		// } else {
		// 	this._attribIndex += 1;
		// }

		const objects = coreGroup.allObjects();
		for (let object of objects) {
			this._updateGeometry(object);
		}

		this.setCoreGroup(coreGroup);
	}
	override dispose() {
		this._unRegisterOnTickHook();
	}

	private _updateGeometry<T extends CoreObjectType>(object: ObjectContent<T>) {
		this._updateWithParamSet(object, '0');
		this._updateWithParamSet(object, '1');
		this._updateWithParamSet(object, '2');
	}

	private _updateWithParamSet<T extends CoreObjectType>(object: ObjectContent<T>, paramSetIndex: ParaSetIndex) {
		if (!this._paramSetByIndex) {
			return;
		}
		const corePointClass = corePointClassFactory(object);
		const paramSet = this._paramSetByIndex[paramSetIndex];
		if (!isBooleanTrue(paramSet.active.value)) {
			return;
		}
		const attribName = paramSet.attribName.value;
		let attrib = corePointClass.attribute(object, attribName) as BufferAttribute | undefined;
		// create attrib if needed
		if (!attrib) {
			// const coreGeometry = new CoreGeometry(geometry);
			corePointClass.addNumericAttribute(object, attribName, 1, 0);
			attrib = corePointClass.attribute(object, attribName) as BufferAttribute;
		}

		// update buffer
		const audioNode = paramSet.node.value.nodeWithContext(NodeContext.AUDIO);
		const audioAnalyserNode = audioNode as BaseAnalyserAudioNode<any>;
		if (!audioAnalyserNode.getAnalyserValue) {
			return;
		}
		const values = audioAnalyserNode.getAnalyserValue();
		if (!values) {
			return;
		}
		const array = attrib.array as number[];
		const valuesSize = this.pv.valuesSize;
		const analyserValuesCount = values.length;
		const index = this.pv.index;
		const offset = index * valuesSize;

		for (let i = 0; i < valuesSize; i++) {
			const value = i < analyserValuesCount ? values[i] : values[0];
			array[offset + i] = value;
		}
		attrib.needsUpdate = true;
	}

	/*
	 * INIT
	 */
	private _paramSetByIndex: ParamSetByIndex | undefined;
	private _initParamsByIndex() {
		this._paramSetByIndex = this._paramSetByIndex || {
			'0': {
				active: this.p.active0,
				attribName: this.p.attrib0,
				node: this.p.audioNode0,
			},
			'1': {
				active: this.p.active1,
				attribName: this.p.attrib1,
				node: this.p.audioNode1,
			},
			'2': {
				active: this.p.active2,
				attribName: this.p.attrib2,
				node: this.p.audioNode2,
			},
		};
	}
	/*
	 * REGISTER TICK CALLBACK
	 */
	private async _registerOnTickHook() {
		if (this.scene().registeredBeforeTickCallbacks().has(this._tickCallbackName())) {
			return;
		}
		this.scene().registerOnBeforeTick(this._tickCallbackName(), () => this.setDirty());
	}
	private async _unRegisterOnTickHook() {
		this.scene().unRegisterOnBeforeTick(this._tickCallbackName());
	}
	private _tickCallbackName() {
		return `cop/audioAnalyserNode-${this.graphNodeId()}`;
	}
}
