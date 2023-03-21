/**
 * Exports the input as PLY
 *
 * @remarks
 */
import {ExporterSopNode, BaseExporterSopParamsConfig} from './_BaseExporter';
import {PLYExporter, PLYExporterOptions} from 'three/examples/jsm/exporters/PLYExporter';
import {SopExporter} from '../../poly/registers/nodes/types/Sop';

class ExporterPLYSopParamsConfig extends BaseExporterSopParamsConfig {}
const ParamsConfig = new ExporterPLYSopParamsConfig();

export class ExporterPLYSopNode extends ExporterSopNode<ExporterPLYSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopExporter.EXPORTER_PLY;
	}

	fileExtension() {
		return 'ply';
	}
	createBlob(): Promise<Blob> {
		return new Promise(async (resolve) => {
			const sceneData = await this._prepareScene();
			if (!sceneData) {
				return;
			}
			const {scene, objects} = sceneData;
			const options: PLYExporterOptions = {
				binary: true,
				// excludeAttributes?: string[];
				// littleEndian: boolean;
			};
			const exporter = new PLYExporter();
			exporter.parse(
				scene,
				(result) => {
					this._handleResult(result, objects, resolve);
				},
				options
			);
		});
	}
}
