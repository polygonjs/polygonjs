/**
 * Play a note
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {NodeContext} from '../../poly/NodeContext';
import {ALL_NOTES, DEFAULT_NOTE} from '../../../core/audio/Notes';
import {inputObject3D} from './_BaseObject3D';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Poly} from '../../Poly';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class PlayInstrumentNoteJsParamsConfig extends NodeParamsConfig {
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
const ParamsConfig = new PlayInstrumentNoteJsParamsConfig();

export class PlayInstrumentNoteJsNode extends TypedJsNode<PlayInstrumentNoteJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'playInstrumentNote';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);
	}

	override setTriggerableLines(shadersCollectionController: ShadersCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const note = this.variableForInputParam(shadersCollectionController, this.p.note);
		const duration = this.variableForInputParam(shadersCollectionController, this.p.duration);

		const node = this.pv.node.node();
		if (!node) {
			return;
		}
		const nodePath = `'${node.path()}'`;

		const func = Poly.namedFunctionsRegister.getFunction('playInstrumentNote', this, shadersCollectionController);
		const bodyLine = func.asString(object3D, nodePath, note, duration);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
}
