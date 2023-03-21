/**
 * Exports the input as STL
 *
 * @remarks
 */

import {ExporterSopNode, BaseExporterSopParamsConfig} from './_BaseExporter';
import {STLExporter, STLExporterOptions} from 'three/examples/jsm/exporters/STLExporter';
import {SopExporter} from '../../poly/registers/nodes/types/Sop';

class ExporterSTLSopParamsConfig extends BaseExporterSopParamsConfig {}
const ParamsConfig = new ExporterSTLSopParamsConfig();

export class ExporterSTLSopNode extends ExporterSopNode<ExporterSTLSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopExporter.EXPORTER_STL;
	}

	fileExtension() {
		return 'stl';
	}
	createBlob(): Promise<Blob> {
		return new Promise(async (resolve) => {
			const sceneData = await this._prepareScene();
			if (!sceneData) {
				return;
			}
			const {scene, objects} = sceneData;
			const options: STLExporterOptions = {
				binary: true,
			};
			const exporter = new STLExporter();
			const result = exporter.parse(scene, options) as any as DataView;
			this._handleResult(result.buffer, objects, resolve);
		});
	}
}
