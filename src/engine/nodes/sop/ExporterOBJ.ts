/**
 * Exports the input as OBJ
 *
 * @remarks
 */
import {ExporterSopNode, BaseExporterSopParamsConfig} from './_BaseExporter';
import {OBJExporter} from 'three/examples/jsm/exporters/OBJExporter';
import {SopExporter} from '../../poly/registers/nodes/types/Sop';

class ExporterOBJSopParamsConfig extends BaseExporterSopParamsConfig {}
const ParamsConfig = new ExporterOBJSopParamsConfig();

export class ExporterOBJSopNode extends ExporterSopNode<ExporterOBJSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopExporter.EXPORTER_OBJ;
	}

	fileExtension() {
		return 'obj';
	}
	createBlob(): Promise<Blob> {
		return new Promise(async (resolve) => {
			const sceneData = await this._prepareScene();
			if (!sceneData) {
				return;
			}
			const {scene, objects} = sceneData;

			const exporter = new OBJExporter();
			const result = exporter.parse(scene);
			this._handleResult(result, objects, resolve);
		});
	}
}
