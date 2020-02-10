import {EngineNodeData} from 'src/editor/store/modules/Engine';
import {SetupContext} from '@vue/composition-api';

export interface SetupCaptureOptions {
	capture_node_for_move: () => void;
	capture_node_src_for_connection: (index: number) => void;
	capture_node_dest_for_connection: (index: number) => void;
	capture_node_final_for_connection: () => void;
}

export function SetupCapture(json_node: EngineNodeData, context: SetupContext): SetupCaptureOptions {
	function capture_node_for_move() {
		context.emit('capture_node_for_move', json_node.graph_node_id);
	}
	function capture_node_src_for_connection(index: number) {
		context.emit('capture_node_src_for_connection', json_node.graph_node_id, index);
	}
	function capture_node_dest_for_connection(index: number) {
		context.emit('capture_node_dest_for_connection', json_node.graph_node_id, index);
	}
	function capture_node_final_for_connection() {
		context.emit('capture_node_final_for_connection', json_node.graph_node_id);
	}

	return {
		capture_node_for_move,
		capture_node_src_for_connection,
		capture_node_dest_for_connection,
		capture_node_final_for_connection,
	};
}
