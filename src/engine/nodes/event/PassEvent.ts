import {TypedEventNode, BaseEventNodeType} from './_Base';
import {TypedNamedConnectionPoint} from '../utils/connections/NamedConnectionPoint';
import {ConnectionPointType} from '../utils/connections/ConnectionPointType';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {BaseCameraObjNodeType} from '../obj/_BaseCamera';

class PassEventParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new PassEventParamsConfig();

export class PassEventNode extends TypedEventNode<PassEventParamsConfig> {
	params_config = ParamsConfig;

	static type() {
		return 'pass';
	}
	initialize_node() {
		// TODO: do not use GL connection Types here
		this.io.inputs.set_named_input_connection_points(
			[0, 1, 2, 3].map((i) => new TypedNamedConnectionPoint(`trigger${i}`, ConnectionPointType.BOOL))
		);
		this.io.outputs.set_named_output_connection_points([
			new TypedNamedConnectionPoint('event', ConnectionPointType.BOOL),
		]);
	}

	process_event(event: Event, canvas: HTMLCanvasElement, camera_node: BaseCameraObjNodeType) {
		const connections = this.io.connections.output_connections();
		const nodes: BaseEventNodeType[] = connections.map((connection) => connection.node_dest) as BaseEventNodeType[];
		for (let node of nodes) {
			node.process_event(event, canvas, camera_node);
		}
	}
}
