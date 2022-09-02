/**
 * Export an SDF texture created by [mat/raymarchingBuilder](/doc/nodes/mat/raymarchingBuilder) to disk
 *
 *
 */
import {Data3DTexture, Texture} from 'three';
import {TypedCopNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseNodeType} from '../_Base';
import {downloadBlob} from '../../../core/BlobUtils';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {saveSDFMetadata} from '../../../core/loader/geometry/SDF';

class SDFExporterCopParamsConfig extends NodeParamsConfig {
	/** @param download texture */
	download = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			SDFExporterCopNode.PARAM_CALLBACK_download(node as SDFExporterCopNode);
		},
	});
}

const ParamsConfig = new SDFExporterCopParamsConfig();

export class SDFExporterCopNode extends TypedCopNode<SDFExporterCopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'SDFExporter';
	}
	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
	}

	override async cook(inputContents: Texture[]) {
		this.setTexture(inputContents[0]);
	}

	/*
	 *
	 * CALLBACK
	 *
	 */
	static PARAM_CALLBACK_download(node: SDFExporterCopNode) {
		node._downloadTexture();
	}
	private async _downloadTexture() {
		const container = await this.compute();
		const texture = container.content() as Data3DTexture;
		const dataContainer = texture?.image;
		if (!dataContainer) {
			this.states.error.set('the input must be a 3D texture');
			return;
		}

		const dataWithMetadata = saveSDFMetadata(texture);
		if (!dataWithMetadata) {
			return;
		}

		// download blob
		const blob = new Blob([dataWithMetadata], {type: 'octet/stream'});
		downloadBlob(blob, `${this.name()}.bin`);
	}
}
