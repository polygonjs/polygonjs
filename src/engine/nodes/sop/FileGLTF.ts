/**
 * Loads a GLTF from a url.
 *
 * @remarks
 * This node is a specialised version of the [sop/file](/docs/nodes/sop/file), used to load GLTF or GLB files.
 *
 */
import {TypedSopNode} from './_Base';
import {BaseNodeType} from '../_Base';
import {FileType} from '../../params/utils/OptionsController';
import {FileGLTFSopOperation} from '../../operations/sop/FileGLTF';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {Poly} from '../../Poly';
import {ModuleName} from '../../poly/registers/modules/Common';
const DEFAULT = FileGLTFSopOperation.DEFAULT_PARAMS;
class FileGLTFParamsConfig extends NodeParamsConfig {
	/** @param url to load the geometry from */
	url = ParamConfig.STRING(DEFAULT.url, {
		fileBrowse: {type: [FileType.GEOMETRY]},
	});
	/** @param uses draco compression */
	draco = ParamConfig.BOOLEAN(DEFAULT.draco);
	/** @param sets the matrixAutoUpdate attribute for the objects loaded */
	matrixAutoUpdate = ParamConfig.BOOLEAN(0);
	/** @param reload the geometry */
	reload = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			FileGLTFSopNode.PARAM_CALLBACK_reload(node as FileGLTFSopNode);
		},
	});
}
const ParamsConfig = new FileGLTFParamsConfig();

export class FileGLTFSopNode extends TypedSopNode<FileGLTFParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'fileGLTF';
	}
	override async requiredModules() {
		for (let p of [this.p.draco]) {
			if (p.isDirty()) {
				await p.compute();
			}
		}
		const formats: ModuleName[] = [ModuleName.GLTFLoader];
		if (this.pv.draco) {
			formats.push(ModuleName.DRACOLoader);
		}
		return formats;
	}
	override dispose(): void {
		super.dispose();
		Poly.blobs.clearBlobsForNode(this);
	}

	private _operation: FileGLTFSopOperation | undefined;
	private operation() {
		return (this._operation = this._operation || new FileGLTFSopOperation(this.scene(), this.states, this));
	}
	override async cook(input_contents: CoreGroup[]) {
		const core_group = await this.operation().cook(input_contents, this.pv);
		this.setCoreGroup(core_group);
	}

	static PARAM_CALLBACK_reload(node: FileGLTFSopNode) {
		node._paramCallbackReload();
	}
	private _paramCallbackReload() {
		// this.operation().clearLoadedBlob(this.pv);
		// set the param dirty is preferable to just the successors, in case the expression result needs to be updated
		this.p.url.setDirty();
		// this.setDirty()
	}
}
