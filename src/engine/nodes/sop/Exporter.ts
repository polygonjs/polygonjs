/**
 * Exports the input as GLTF
 *
 * @remarks
 */

import {TypedSopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseNodeType} from '../../../engine/nodes/_Base';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CoreGroup} from '../../../core/geometry/Group';
import {GLTFExporter, GLTFExporterOptions} from '../../../modules/three/examples/jsm/exporters/GLTFExporter';
import {Scene} from 'three';
import {Object3D} from 'three';
import {downloadBlob} from '../../../core/BlobUtils';

// function saveString(text: string, filename: string) {
// 	downloadBlob(new Blob([text], {type: 'text/plain'}), filename);
// }

// function saveArrayBuffer(buffer: ArrayBuffer, filename: string) {
// 	downloadBlob(new Blob([buffer], {type: 'application/octet-stream'}), filename);
// }

class ExporterSopParamsConfig extends NodeParamsConfig {
	/** @param fileName */
	fileName = ParamConfig.STRING('`$OS`');
	/** @param export */
	download = ParamConfig.BUTTON(null, {
		hidden: true,
		callback: (node: BaseNodeType) => {
			ExporterSopNode.PARAM_CALLBACK_download(node as ExporterSopNode);
		},
	});
}
const ParamsConfig = new ExporterSopParamsConfig();

export class ExporterSopNode extends TypedSopNode<ExporterSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'exporter';
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		this.setCoreGroup(inputCoreGroups[0]);
	}

	static PARAM_CALLBACK_download(node: ExporterSopNode) {
		node._paramCallbackDownload();
	}
	private async _paramCallbackDownload() {
		if (this.p.fileName.isDirty()) {
			await this.p.fileName.compute();
		}
		const fileNameShort = this.pv.fileName;
		const blob = await this.createBlob();
		const fileName = `${fileNameShort}.glb`;
		downloadBlob(blob, fileName);
	}
	createBlob(): Promise<Blob> {
		return new Promise(async (resolve) => {
			const container = await this.compute();
			const coreGroup = container.coreContent();
			if (!coreGroup) {
				console.error('input invalid');
				return;
			}

			// save current parents
			const previousParentByObject: WeakMap<Object3D, Object3D | null> = new WeakMap();
			const objects = coreGroup.objects();
			for (let object of objects) {
				previousParentByObject.set(object, object.parent);
			}

			// add to exported scene
			const scene = new Scene();
			for (let object of objects) {
				scene.add(object);
			}

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
				(result) => {
					if (result instanceof ArrayBuffer) {
						const blob = new Blob([result], {type: 'application/octet-stream'});
						resolve(blob);
						// saveArrayBuffer(result, 'scene.glb');
					} else {
						const output = JSON.stringify(result, null, 2);
						const blob = new Blob([output], {type: 'text/plain'});
						resolve(blob);
						// saveString(output, 'scene.gltf');
					}

					// restore parents
					for (let object of objects) {
						const previousParent = previousParentByObject.get(object);
						if (previousParent) {
							previousParent.add(object);
						}
					}
				},
				(err) => {},
				options
			);
		});
	}
}
