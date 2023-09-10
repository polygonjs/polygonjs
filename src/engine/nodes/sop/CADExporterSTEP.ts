/**
 * Exports the input as STEP
 *
 * @remarks
 */
import {BaseExporterSopParamsConfig} from './_BaseExporter';
import {CADExporterSopNode} from './_BaseExporterCAD';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CadLoader} from '../../../core/geometry/modules/cad/CadLoader';
import {CadGC} from '../../../core/geometry/modules/cad/CadCommon';
import {CoreCadType} from '../../../core/geometry/modules/cad/CadCoreType';
import {CadLoaderSync} from '../../../core/geometry/modules/cad/CadLoaderSync';
import {MathUtils} from 'three';

class ExporterSTEPSopParamsConfig extends BaseExporterSopParamsConfig {}
const ParamsConfig = new ExporterSTEPSopParamsConfig();

export class CADExporterSTEPSopNode extends CADExporterSopNode<ExporterSTEPSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CAD_EXPORTER_STEP;
	}

	fileExtension() {
		return 'step';
	}
	createBlob(): Promise<Blob> {
		return new Promise(async (resolve) => {
			const sceneData = await this._prepareScene();
			if (!sceneData) {
				return;
			}
			const oc = await CadLoader.core();

			CadGC.withGC((r) => {
				const writer = r(new oc.STEPControl_Writer_1());
				const {cadObjects} = sceneData;
				const mode = oc.STEPControl_StepModelType.STEPControl_AsIs;
				const compgraph = true;
				for (let object of cadObjects) {
					if (CoreCadType.isShape(object)) {
						const shape = object.cadGeometry();
						writer.Transfer(shape, mode as any, compgraph, CadLoaderSync.Message_ProgressRange);
					}
				}
				const fileNameShort = MathUtils.generateUUID();
				const FSfileName: string = `file.${fileNameShort}`;
				writer.Write(FSfileName);

				const result = oc.FS.readFile(FSfileName);
				const blob = new Blob([result], {type: 'application/octet-stream'});
				resolve(blob);
			});
		});
	}
}
