import {NodeJsonImporter} from '../Node';
import {NodeJsonExporterData} from '../../export/Node';
import {SceneJsonImporter} from '../Scene';
import {PolyDictionary} from '../../../../../types/GlobalTypes';

export class PolyNodeJsonImporter extends NodeJsonImporter<any> {
	create_nodes(scene_importer: SceneJsonImporter, data: PolyDictionary<NodeJsonExporterData>) {
		const node = this._node;
		if (node.poly_node_controller) {
			node.poly_node_controller.create_child_nodes_from_definition();
		}
	}
}
