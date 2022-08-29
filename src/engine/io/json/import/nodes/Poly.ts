import {NodeJsonImporter} from '../Node';
import {NodeJsonExporterData} from '../../export/Node';
import {SceneJsonImporter} from '../Scene';
import {PolyDictionary} from '../../../../../types/GlobalTypes';
import {PolyNodeController} from '../../../../nodes/utils/poly/PolyNodeController';

export class PolyNodeJsonImporter extends NodeJsonImporter<any> {
	override create_nodes(
		scene_importer: SceneJsonImporter,
		data: PolyDictionary<NodeJsonExporterData>,
		nodeData: NodeJsonExporterData
	) {
		const node = this._node;
		const polyNodeController = node.polyNodeController as PolyNodeController;
		// const oldLockedState = polyNodeController.locked();
		polyNodeController.setLockedState(false);
		if (this._isDataLocked(nodeData)) {
			polyNodeController.createChildNodesFromDefinition();
		} else {
			super.create_nodes(scene_importer, data, nodeData);
		}
		// polyNodeController.setLockedState(oldLockedState);
	}
	override setCustomData(data: NodeJsonExporterData): void {
		if (this._node.polyNodeController) {
			this._node.polyNodeController.setLockedState(this._isDataLocked(data));
		}
	}
	private _isDataLocked(data: NodeJsonExporterData): boolean {
		if (data['polyNode']) {
			return data['polyNode']['locked'];
		} else {
			return false;
		}
	}
}
