import {NodeJsonExporter, NodeJsonExporterUIData, DataRequestOption} from '../Node';

export class PolyNodeJsonExporter extends NodeJsonExporter<any> {
	protected nodes_data(options: DataRequestOption = {}) {
		if (options.showPolyNodesData) {
			return super.nodes_data(options);
		}
		// the PolyNode does not save it children
		return {};
	}
	ui_data(options: DataRequestOption = {}): NodeJsonExporterUIData {
		if (options.showPolyNodesData) {
			return super.ui_data(options);
		} else {
			return this.ui_data_without_children();
		}
	}
}
