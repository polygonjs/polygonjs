import {NodeJsonImporter} from '../Node';
import {NodeJsonExporterData} from '../../export/Node';
import {PolySopNode} from '../../../../nodes/sop/Poly';
import {SceneJsonImporter} from '../../../../example';

export class PolyNodeJsonImporter extends NodeJsonImporter<any> {
	create_nodes(scene_importer: SceneJsonImporter, data: Dictionary<NodeJsonExporterData>) {
		const node = this._node as PolySopNode;
		node.create_child_nodes_from_definition();
	}
}
