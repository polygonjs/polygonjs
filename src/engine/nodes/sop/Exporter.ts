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
import {GLTFExporter, GLTFExporterOptions} from 'three/examples/jsm/exporters/GLTFExporter';
import {Scene} from 'three/src/scenes/Scene';
import {Object3D} from 'three/src/core/Object3D';

function save(blob: Blob, filename: string) {
	const link = document.createElement('a');
	link.style.display = 'none';
	document.body.appendChild(link); // Firefox workaround, see #6594

	link.href = URL.createObjectURL(blob);
	link.download = filename;
	link.click();

	// URL.revokeObjectURL( url ); breaks Firefox...

	// remove link
	setTimeout(() => {
		document.body.removeChild(link);
	}, 10);
}

function saveString(text: string, filename: string) {
	save(new Blob([text], {type: 'text/plain'}), filename);
}

function saveArrayBuffer(buffer: ArrayBuffer, filename: string) {
	save(new Blob([buffer], {type: 'application/octet-stream'}), filename);
}

class ExporterSopParamsConfig extends NodeParamsConfig {
	/** @param export */
	export = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			ExporterSopNode.PARAM_CALLBACK_export(node as ExporterSopNode);
		},
	});
}
const ParamsConfig = new ExporterSopParamsConfig();

export class ExporterSopNode extends TypedSopNode<ExporterSopParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'exporter';
	}

	initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
	}

	async cook(input_contents: CoreGroup[]) {
		this.setCoreGroup(input_contents[0]);
	}

	static PARAM_CALLBACK_export(node: ExporterSopNode) {
		node._paramCallbackExport();
	}
	private async _paramCallbackExport() {
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
					saveArrayBuffer(result, 'scene.glb');
				} else {
					const output = JSON.stringify(result, null, 2);
					saveString(output, 'scene.gltf');
				}

				// restore parents
				for (let object of objects) {
					const previousParent = previousParentByObject.get(object);
					if (previousParent) {
						previousParent.add(object);
					}
				}
			},
			options
		);
	}
}
