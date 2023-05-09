/**
 * Exports the input as USDZ
 *
 * @remarks
 */

import {ExporterSopNode, BaseExporterSopParamsConfig} from './_BaseExporter';
import {USDZExporter} from 'three/examples/jsm/exporters/USDZExporter';
import {SopExporter} from '../../poly/registers/nodes/types/Sop';

class ExporterUSDZSopParamsConfig extends BaseExporterSopParamsConfig {}
const ParamsConfig = new ExporterUSDZSopParamsConfig();

export class ExporterUSDZSopNode extends ExporterSopNode<ExporterUSDZSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopExporter.EXPORTER_USDZ;
	}

	fileExtension() {
		return 'usdz';
	}
	createBlob(): Promise<Blob> {
		return new Promise(async (resolve) => {
			const sceneData = await this._prepareScene();
			if (!sceneData) {
				return;
			}
			const {scene, objects} = sceneData;

			const exporter = new USDZExporter();
			const result = await exporter.parse(scene);
			console.log(result);
			this._handleResult(result, objects, resolve);
		});
	}
}
