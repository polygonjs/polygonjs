import {NodeJsonImporter} from '../Node';
import {NodeJsonExporterData} from '../../export/Node';
import {SceneJsonImporter} from '../Scene';
import {PolyDictionary} from '../../../../../types/GlobalTypes';
import {PolyNodeController} from '../../../../nodes/utils/poly/PolyNodeController';

export class PolyNodeJsonImporter extends NodeJsonImporter<any> {
	override create_nodes(scene_importer: SceneJsonImporter, data: PolyDictionary<NodeJsonExporterData>) {
		const node = this._node;
		const polyNodeController = node.polyNodeController as PolyNodeController;
		if (polyNodeController) {
			polyNodeController.createChildNodesFromDefinition();
		}
	}
}
