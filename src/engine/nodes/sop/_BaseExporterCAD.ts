/**
 * Base class of Exporter nodes
 *
 * @remarks
 */

import {CADSopNode} from './_BaseCAD';
import {BaseExporterSopParamsConfig, exporterSopFileName} from './_BaseExporter';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CoreGroup} from '../../../core/geometry/Group';
// import {Object3D} from 'three';
import {downloadBlob} from '../../../core/BlobUtils';

export abstract class CADExporterSopNode<K extends BaseExporterSopParamsConfig> extends CADSopNode<K> {
	abstract fileExtension(): string;
	abstract createBlob(): Promise<Blob>;

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		this.setCoreGroup(inputCoreGroups[0]);
	}

	static PARAM_CALLBACK_download(node: CADExporterSopNode<BaseExporterSopParamsConfig>) {
		node._paramCallbackDownload();
	}
	async fileName() {
		return await exporterSopFileName(this.p.fileName, this.fileExtension());
	}
	async _paramCallbackDownload() {
		const blob = await this.createBlob();
		const fileName = await this.fileName();
		downloadBlob(blob, fileName);
	}
	protected async _prepareScene() {
		const container = await this.compute();
		const coreGroup = container.coreContent();
		if (!coreGroup) {
			console.error('input invalid');
			return;
		}

		// save current parents
		const cadObjects = coreGroup.cadObjects();
		if (!cadObjects) {
			return;
		}

		return {cadObjects};
		// return await exporterSopPrepareScene(this);
	}
	// protected async _handleResult(result: any, objects: Object3D[], resolve: (blob: Blob) => void) {
	// 	return await exporterSopHandleResult(result, objects, resolve);
	// }
}
