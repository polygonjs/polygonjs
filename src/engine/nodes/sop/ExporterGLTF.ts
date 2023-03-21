/**
 * Exports the input as GLTF
 *
 * @remarks
 */
import {ExporterSopNode, BaseExporterSopParamsConfig} from './_BaseExporter';
import {GLTFExporter, GLTFExporterOptions} from 'three/examples/jsm/exporters/GLTFExporter';
import {SopExporter} from '../../poly/registers/nodes/types/Sop';

class ExporterGLTFSopParamsConfig extends BaseExporterSopParamsConfig {}
const ParamsConfig = new ExporterGLTFSopParamsConfig();

export class ExporterGLTFSopNode extends ExporterSopNode<ExporterGLTFSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopExporter.EXPORTER_GLTF;
	}

	fileExtension() {
		return 'glb';
	}
	createBlob(): Promise<Blob> {
		return new Promise(async (resolve) => {
			const sceneData = await this._prepareScene();
			if (!sceneData) {
				return;
			}
			const {scene, objects} = sceneData;

			const options: GLTFExporterOptions = {
				embedImages: true,
				// trs: true,
				// onlyVisible: true,
				// truncateDrawRange: false,
				// binary: true,
				// maxTextureSize: Infinity
			};
			const exporter = new GLTFExporter();
			exporter.parse(
				scene,
				async (result) => {
					this._handleResult(result, objects, resolve);
				},
				(err) => {},
				options
			);
		});
	}
}
