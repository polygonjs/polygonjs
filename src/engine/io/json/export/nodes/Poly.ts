import {NodeJsonExporter} from '../Node';

export class PolyNodeJsonExporter extends NodeJsonExporter<any> {
	protected nodes_data() {
		// the PolyNode does not save it children
		return {};
	}
}
