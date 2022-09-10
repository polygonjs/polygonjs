import {NodeJsonExporter, NodeJsonExporterUIData, JSONExporterDataRequestOption} from '../Node';

export class PolyNodeJsonExporter extends NodeJsonExporter<any> {
	protected override nodes_data(options: JSONExporterDataRequestOption = {}) {
		if (options.showPolyNodesData || !this._node.polyNodeController?.locked()) {
			return super.nodes_data(options);
		}
		// the PolyNode does not save it children
		return {};
	}
	override uiData(options: JSONExporterDataRequestOption = {}): NodeJsonExporterUIData {
		if (options.showPolyNodesData || !this._node.polyNodeController?.locked()) {
			return super.uiData(options);
		} else {
			return this.ui_data_without_children();
		}
	}
}
