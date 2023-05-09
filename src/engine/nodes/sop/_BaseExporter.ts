/**
 * Base class of Exporter nodes
 *
 * @remarks
 */

import {BaseSopNodeType, TypedSopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseNodeType} from '../_Base';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CoreGroup} from '../../../core/geometry/Group';
import {Scene} from 'three';
import {Object3D} from 'three';
import {downloadBlob} from '../../../core/BlobUtils';
import {StringParam} from '../../params/String';
import {CoreType} from '../../../core/Type';

type Result = ArrayBuffer | string | object;
const previousParentByObject: WeakMap<Object3D, Object3D | null> = new WeakMap();

export class BaseExporterSopParamsConfig extends NodeParamsConfig {
	/** @param fileName */
	fileName = ParamConfig.STRING('`$OS`');
	/** @param export */
	download = ParamConfig.BUTTON(null, {
		hidden: true,
		callback: (node: BaseNodeType) => {
			ExporterSopNode.PARAM_CALLBACK_download(node as ExporterSopNode<BaseExporterSopParamsConfig>);
		},
	});
}

export abstract class ExporterSopNode<K extends BaseExporterSopParamsConfig> extends TypedSopNode<K> {
	abstract fileExtension(): string;
	abstract createBlob(): Promise<Blob>;

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
	}

	override async cook(inputCoreGroups: CoreGroup[]) {
		this.setCoreGroup(inputCoreGroups[0]);
	}

	static PARAM_CALLBACK_download(node: ExporterSopNode<BaseExporterSopParamsConfig>) {
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
		return await exporterSopPrepareScene(this);
	}
	protected _handleResult(result: Result, objects: Object3D[], resolve: (blob: Blob) => void) {
		exporterSopHandleResult(result, objects, resolve);
	}
}

export async function exporterSopFileName(fileNameParam: StringParam, fileExtension: string) {
	if (fileNameParam.isDirty()) {
		await fileNameParam.compute();
	}
	const fileNameShort = fileNameParam.value;
	const fileName = `${fileNameShort}.${fileExtension}`;
	return fileName;
}

export async function exporterSopPrepareScene(node: BaseSopNodeType) {
	const container = await node.compute();
	const coreGroup = container.coreContent();
	if (!coreGroup) {
		console.error('input invalid');
		return;
	}

	// save current parents
	const objects = coreGroup.threejsObjects();
	for (let object of objects) {
		previousParentByObject.set(object, object.parent);
	}

	// add to exported scene
	const scene = new Scene();
	for (let object of objects) {
		scene.add(object);
	}
	return {scene, objects};
}
function _createBlob(result: Result) {
	if (result instanceof Uint8Array || result instanceof ArrayBuffer) {
		return new Blob([result], {type: 'application/octet-stream'});
	}

	if (CoreType.isString(result)) {
		return new Blob([result], {type: 'text/plain'});
	}

	const output = JSON.stringify(result, null, 2);
	return new Blob([output], {type: 'text/plain'});
}
export function exporterSopHandleResult(result: Result, objects: Object3D[], resolve: (blob: Blob) => void) {
	const blob = _createBlob(result);

	// restore parents
	for (let object of objects) {
		const previousParent = previousParentByObject.get(object);
		if (previousParent) {
			previousParent.add(object);
		}
	}

	resolve(blob);
}
