import {NodeJsonExporter, NodeJsonExporterUIData, DataRequestOption} from '../Node';

export class PolyNodeJsonExporter extends NodeJsonExporter<any> {
	protected override nodes_data(options: DataRequestOption = {}) {
		if (options.showPolyNodesData) {
			return super.nodes_data(options);
		}
		// the PolyNode does not save it children
		return {};
	}
	override uiData(options: DataRequestOption = {}): NodeJsonExporterUIData {
		if (options.showPolyNodesData) {
			return super.uiData(options);
		} else {
			return this.ui_data_without_children();
		}
	}
}
