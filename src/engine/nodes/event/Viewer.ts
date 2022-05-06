/**
 * Activates events for the viewer
 *
 * @param
 * For instance, this can be useful after a raycast node to set an 'active' class on the html canvas, so that the cursor reflect what the mouse is hovering over.
 *
 */
import {TypedEventNode} from './_Base';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class ViewerParamsConfig extends NodeParamsConfig {
	/** @param sets the class of the viewer */
	className = ParamConfig.STRING('active');
}
const ParamsConfig = new ViewerParamsConfig();

export class ViewerEventNode extends TypedEventNode<ViewerParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'viewer';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			// class
			new EventConnectionPoint(
				'setCss',
				EventConnectionPointType.BASE,
				this._process_trigger_setClass.bind(this)
			),
			new EventConnectionPoint(
				'unSetCss',
				EventConnectionPointType.BASE,
				this._process_trigger_unsetClass.bind(this)
			),
			// controls
			// new EventConnectionPoint(
			// 	'createControls',
			// 	EventConnectionPointType.BASE,
			// 	this._process_trigger_createControls.bind(this)
			// ),
			// new EventConnectionPoint(
			// 	'disposeControls',
			// 	EventConnectionPointType.BASE,
			// 	this._process_trigger_disposeControls.bind(this)
			// ),
		]);
	}

	private _getViewer(context: EventContext<Event>) {
		if (context.viewer) {
			return context.viewer;
		} else {
			return this.scene().viewersRegister.firstViewer();
		}
	}

	private _process_trigger_setClass(context: EventContext<Event>) {
		const canvas = this._getViewer(context)?.canvas();
		if (canvas) {
			canvas.classList.add(this.pv.className);
		}
	}

	private _process_trigger_unsetClass(context: EventContext<Event>) {
		const canvas = this._getViewer(context)?.canvas();
		if (canvas) {
			canvas.classList.remove(this.pv.className);
		}
	}
	// private _process_trigger_createControls(context: EventContext<Event>) {
	// 	this.scene().viewersRegister.traverseViewers((v) => {
	// 		v.controlsController()?.create_controls();
	// 	});
	// }
	// private _process_trigger_disposeControls(context: EventContext<Event>) {
	// 	this.scene().viewersRegister.traverseViewers((v) => {
	// 		v.controlsController()?.dispose_controls();
	// 	});
	// }
}
