import {TypedSopNode} from './../../_Base';
import {BaseNodeType} from '../../../_Base';
import {NodeParamsConfig, ParamConfig} from '../../../utils/params/ParamsConfig';
import {CoreGroup} from '../../../../../core/geometry/Group';
import {Poly} from '../../../../Poly';
import {BaseFileSopOperation} from '../../../../operations/sop/utils/File/_BaseFileOperation';
import {Group} from 'three';

interface FileSopNodeOptions {
	type: string;
	operation: typeof BaseFileSopOperation;
	extensions: string[];
}

class BaseFileParamsConfigResult extends NodeParamsConfig {
	url = ParamConfig.STRING('');
	matrixAutoUpdate = ParamConfig.BOOLEAN(0);
	reload = ParamConfig.BUTTON(null);
}

export class FileDummySopOperation extends BaseFileSopOperation<Group> {
	static override type(): Readonly<'fileDummy'> {
		return 'fileDummy';
	}

	protected _createGeoLoaderHandler(params: any) {
		return 0 as any;
	}
}

export class BaseFileSopNodeFactoryResult extends TypedSopNode<BaseFileParamsConfigResult> {}

export function fileSopNodeFactory(options: FileSopNodeOptions): typeof BaseFileSopNodeFactoryResult {
	const DEFAULT = options.operation.DEFAULT_PARAMS;
	class BaseFileParamsConfig extends NodeParamsConfig {
		/** @param url to load the geometry from */
		url = ParamConfig.STRING(DEFAULT.url, {
			fileBrowse: {extensions: options.extensions},
		});
		/** @param sets the matrixAutoUpdate attribute for the objects loaded */
		matrixAutoUpdate = ParamConfig.BOOLEAN(DEFAULT.matrixAutoUpdate);
		/** @param reload the geometry */
		reload = ParamConfig.BUTTON(null, {
			callback: (node: BaseNodeType) => {
				BaseFileSopNode.PARAM_CALLBACK_reload(node as BaseFileSopNode);
			},
		});
	}
	const ParamsConfig = new BaseFileParamsConfig();

	class BaseFileSopNode extends TypedSopNode<BaseFileParamsConfig> {
		override paramsConfig = ParamsConfig;
		static override type() {
			return options.type;
		}
		override dispose(): void {
			super.dispose();
			Poly.blobs.clearBlobsForNode(this);
		}

		private _operation: FileDummySopOperation | undefined;
		private operation() {
			const operation = options.operation as typeof FileDummySopOperation;
			return (this._operation = this._operation || new operation(this.scene(), this.states, this));
		}
		override async cook(inputContents: CoreGroup[]) {
			const coreGroup = await this.operation().cook(inputContents, this.pv);
			this.setCoreGroup(coreGroup);
		}

		static PARAM_CALLBACK_reload(node: BaseFileSopNode) {
			node._paramCallbackReload();
		}
		private _paramCallbackReload() {
			// this.operation().clearLoadedBlob(this.pv);
			// set the param dirty is preferable to just the successors, in case the expression result needs to be updated
			this.p.url.setDirty();
			// this.setDirty()
		}
	}
	return BaseFileSopNode;
}
