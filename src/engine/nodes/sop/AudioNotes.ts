/**
 * Adds the name of notes into a string attribute.
 *
 * @remarks
 * This node is designed to work with audio nodes, and the event/raycast
 *
 */
import {TypedSopNode} from './_Base';
import {AttribClassMenuEntries, AttribClass, ATTRIBUTE_CLASSES} from '../../../core/geometry/Constant';
import {CoreGroup} from '../../../core/geometry/Group';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioNotesSopOperation, OUT_OF_RANGE_BEHAVIOR} from '../../operations/sop/AudioNotes';
import {SopType} from '../../poly/registers/nodes/types/Sop';

const DEFAULT = AudioNotesSopOperation.DEFAULT_PARAMS;

class AudioNotesSopParamsConfig extends NodeParamsConfig {
	/** @param the attribute class (geometry or object) */
	class = ParamConfig.INTEGER(DEFAULT.class, {
		menu: {
			entries: AttribClassMenuEntries,
		},
	});
	/** @param attribute name */
	name = ParamConfig.STRING(DEFAULT.name);
	/** @param adds an octave attribute */
	toctave = ParamConfig.BOOLEAN(0);
	/** @param octave attribute name */
	octaveName = ParamConfig.STRING(DEFAULT.octaveName, {
		visibleIf: {toctave: 1},
	});
	/** @param octave to start iterating the notes from */
	startOctave = ParamConfig.INTEGER(DEFAULT.startOctave, {range: [1, 8], rangeLocked: [true, true]});
	/** @param last octave up to which the nodes will be added */
	endOctave = ParamConfig.INTEGER(DEFAULT.endOctave, {range: [1, 8], rangeLocked: [true, true]});
	/** @param behavior if there are more objects than notes within the selected octave range */
	outOfRangeBehavior = ParamConfig.INTEGER(DEFAULT.outOfRangeBehavior, {
		menu: {
			entries: OUT_OF_RANGE_BEHAVIOR.map((name, i) => {
				return {value: i, name};
			}),
		},
	});
}
const ParamsConfig = new AudioNotesSopParamsConfig();
export class AudioNotesSopNode extends TypedSopNode<AudioNotesSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.AUDIO_NOTES;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(AudioNotesSopOperation.INPUT_CLONED_STATE);
	}

	private _operation: AudioNotesSopOperation | undefined;
	override cook(input_contents: CoreGroup[]) {
		this._operation = this._operation || new AudioNotesSopOperation(this.scene(), this.states);
		const core_group = this._operation.cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}

	//
	//
	// API UTILS
	//
	//
	setAttribClass(attribClass: AttribClass) {
		this.p.class.set(ATTRIBUTE_CLASSES.indexOf(attribClass));
	}
	attribClass() {
		return ATTRIBUTE_CLASSES[this.pv.class];
	}
}
