import {NodeJsonImporter} from '../Node';
import {NodeJsonExporterData} from '../../export/Node';
import {SceneJsonImporter} from '../Scene';

export class PolyNodeJsonImporter extends NodeJsonImporter<any> {
	create_nodes(scene_importer: SceneJsonImporter, data: Dictionary<NodeJsonExporterData>) {
		const node = this._node;
		if (node.poly_node_controller) {
			node.poly_node_controller.create_child_nodes_from_definition();
		}
	}
}
