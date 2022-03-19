/**
 * Play a note
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
import {NodeContext} from '../../poly/NodeContext';
import {ParamType} from '../../poly/ParamType';
import {ALL_NOTES, DEFAULT_NOTE} from '../../../core/audio/Notes';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

class PlayInstrumentNoteActorParamsConfig extends NodeParamsConfig {
	/** @param audio node */
	node = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.AUDIO,
		},
		// dependentOnFoundNode: false,
	});
	/** @param note */
	note = ParamConfig.STRING(DEFAULT_NOTE, {
		menuString: {
			entries: ALL_NOTES.sort().map((note) => {
				return {value: note, name: note};
			}),
		},
		cook: false,
	});
	/** @param duration */
	duration = ParamConfig.FLOAT(0.125, {
		range: [0, 1],
		rangeLocked: [true, false],
		cook: false,
	});
}
const ParamsConfig = new PlayInstrumentNoteActorParamsConfig();

export class PlayInstrumentNoteActorNode extends TypedActorNode<PlayInstrumentNoteActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'playInstrumentNote';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new ActorConnectionPoint(
				ActorConnectionPointType.OBJECT_3D,
				ActorConnectionPointType.OBJECT_3D,
				CONNECTION_OPTIONS
			),
		]);
	}

	public override receiveTrigger(context: ActorNodeTriggerContext) {
		const audioNode = this.pv.node.nodeWithContext(NodeContext.AUDIO, this.states?.error);
		if (!audioNode) {
			return;
		}
		audioNode.compute().then((container) => {
			const audioBuilder = container.coreContent();
			if (!audioBuilder) {
				return;
			}
			const instrument = audioBuilder.instrument();
			if (!instrument) {
				return;
			}
			const note = this._inputValueFromParam<ParamType.STRING>(this.p.note, context);
			instrument.triggerAttackRelease(note, this.pv.duration);
		});
	}
}
