import {TypedNode} from '../_Base';
import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {BaseEventConnectionPoint} from '../utils/io/connections/Event';
import {MapUtils} from '../../../core/MapUtils';
import {Poly} from '../../Poly';

type DispatchHook = (event_context: EventContext<Event>) => void;

/**
 *
 *
 * TypedEventNode is the base class for all nodes that process events. This inherits from [TypedNode](/docs/api/TypedNode).
 *
 */

export class TypedEventNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.EVENT, K> {
	static override context(): NodeContext {
		return NodeContext.EVENT;
	}

	override initializeBaseNode() {
		this.uiData.setLayoutHorizontal();
		// this.addPostDirtyHook('_eval_all_params_on_dirty', this._eval_all_params_on_dirty_bound);
		// cook is required for some nodes like event/animation
		this.addPostDirtyHook('cookWithoutInputsOnDirty', this._cookWithoutInputsBound);

		this.io.inputs.setDependsOnInputs(false);
		this.io.connections.initInputs();
		this.io.connection_points.spare_params.initializeNode();
	}

	// ensures that event nodes are cooked when scene is loaded
	// private _eval_all_params_on_dirty_bound = this._eval_all_params_on_dirty.bind(this);
	// _eval_all_params_on_dirty() {
	// 	this.params.eval_all();
	// }
	private _cookWithoutInputsBound = this._cookWithoutInputs.bind(this);
	_cookWithoutInputs() {
		this.cookController.cookMainWithoutInputs();
	}
	override cook() {
		this.cookController.endCook();
	}
	// eval_params_and_processEvent(event_context: EventContext<Event>, connection_point: BaseEventConnectionPoint) {
	// 	// not evaluation params now, since we are evaluating them on dirty
	// 	// this.params.eval_all().then(()=>{
	// 		this.processEvent(event_context, connection_point)
	// 	// })
	// }
	processEventViaConnectionPoint(eventContext: EventContext<Event>, connectionPoint: BaseEventConnectionPoint) {
		if (connectionPoint.event_listener) {
			connectionPoint.event_listener(eventContext);
		} else {
			this.processEvent(eventContext);
		}
	}
	processEvent(event_context: EventContext<Event>) {}

	//
	//
	// It may be more practical to use cook, rather than process_event
	// to benefit from params evaluation.
	// But that would mean that each node receiving an event would make the successors dirty,
	// which may also be problematic. So for now, I use process_event
	//
	//
	protected async dispatchEventToOutput(output_name: string, event_context: EventContext<Event>) {
		this.run_on_dispatch_hook(output_name, event_context);
		const index = this.io.outputs.getOutputIndex(output_name);
		if (index >= 0) {
			// const connections = this.io.connections.outputConnections();
			// const current_connections = connections.filter((connection) => connection.output_index == index);
			const outputConnections = this.io.connections.outputConnectionsByOutputIndex(index);
			if (outputConnections) {
				let destNode: BaseEventNodeType;

				if (!Poly.playerMode()) {
					const dispatcher = this.scene().eventsDispatcher.connectionTriggerDispatcher;
					outputConnections.forEach((connection) => {
						dispatcher.dispatchTrigger(connection);
					});
				}

				outputConnections.forEach((connection) => {
					destNode = connection.nodeDest();
					const destNodeConnectionPoints = destNode.io.inputs.namedInputConnectionPoints();
					if (destNodeConnectionPoints) {
						const connection_point = destNodeConnectionPoints[connection.inputIndex()];
						destNode.processEventViaConnectionPoint(event_context, connection_point);
					}
				});
			}

			// let destNode: BaseEventNodeType;
			// for (let connection of current_connections) {
			// 	destNode = connection.node_dest;
			// 	const connection_point = destNode.io.inputs.namedInputConnectionPoints()[connection.input_index];
			// 	destNode.processEventViaConnectionPoint(event_context, connection_point);
			// }
			// const nodes = current_connections.map((connection) => connection.node_dest);
			// for (let node of nodes) {
			// 	node.processEvent(event_context);
			// }
		} else {
			console.warn(`requested output '${output_name}' does not exist on node '${this.path()}'`);
		}
	}

	private _on_dispatch_hooks_by_output_name: Map<string, DispatchHook[]> | undefined;
	/**
	 * onDispatch is called when an output triggers an event.
	 *
	 * Here is an example usage to listen to events:
	 *
	 * ``` ts
	 *let _currentState = false;
	 *function setHit( newState ){
	 *  if( _currentState != newState ){
	 *    if( newState ){
	 *      playSound();
	 *    }
	 *    _currentState = newState;
	 *  }
	 *}
	 *
	 *const raycastNode = scene.node('<path to the node>');
	 *raycastNode.onDispatch('hit', ()=>setHit(true) );
	 *raycastNode.onDispatch('miss', ()=>setHit(false) );
	 * ```
	 *
	 * Alternatively, you can also have the following arguments from the callback
	 *
	 * - viewer: the [viewer](https://polygonjs.com/docs/api/TypedViewer) displaying the scene.
	 * - event: the mouse/pointer/keyboard event that originally triggered the event
	 * - emitter: the domElement the event was triggered from (either the canvas or the document)
	 * - value: an optional value linked to the event.
	 *
	 * ``` ts
	 *raycastNode.onDispatch('hit',(eventContext)=>{
	 *  const {viewer, event, emitter, value} = eventContext;
	 *});
	 * ```
	 *
	 */
	public onDispatch(outputName: string, callback: DispatchHook) {
		this._on_dispatch_hooks_by_output_name = this._on_dispatch_hooks_by_output_name || new Map();
		MapUtils.pushOnArrayAtEntry(this._on_dispatch_hooks_by_output_name, outputName, callback);
	}
	private run_on_dispatch_hook(output_name: string, event_context: EventContext<Event>) {
		if (this._on_dispatch_hooks_by_output_name) {
			const hooks = this._on_dispatch_hooks_by_output_name.get(output_name);
			if (hooks) {
				for (const hook of hooks) {
					hook(event_context);
				}
			}
		}
	}
}

export type BaseEventNodeType = TypedEventNode<any>;
export class BaseEventNodeClass extends TypedEventNode<any> {}
