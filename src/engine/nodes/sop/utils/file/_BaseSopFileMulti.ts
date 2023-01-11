import {ParamEvent} from './../../../../poly/ParamEvent';
import {TypedSopNode} from './../../_Base';
import {BaseNodeType} from '../../../_Base';
import {NodeParamsConfig, ParamConfig} from '../../../utils/params/ParamsConfig';
import {CoreGroup} from '../../../../../core/geometry/Group';
import {InputCloneMode} from '../../../../poly/InputCloneMode';
import {Object3D} from 'three';
import {Group} from 'three';
import {CoreInstancer} from '../../../../../core/geometry/Instancer';
import {Matrix4} from 'three';
import {Poly} from '../../../../Poly';
import {BaseGeoLoaderHandler, BaseGeoLoaderOutput} from '../../../../../core/loader/geometry/_BaseLoaderHandler';
import {CorePoint} from '../../../../../core/geometry/Point';
// import { Constructor } from 'vue/types/options';

// interface FileMultSopNodeParamConfigOptions {
// 	extensions: string[];
// 	defaultUrlExpression: string;
// }

// interface FileMultSopNodeOptions<O extends BaseGeoLoaderOutput> {
// 	type: string;
// 	extensions: string[];
// 	defaultUrlExpression: string;
// 	createLoader: (url: string, node: BaseNodeType) => BaseGeoLoaderHandler<O>;
// }

class BaseFileMultiParamsConfigResult extends NodeParamsConfig {
	url = ParamConfig.STRING('');
	matrixAutoUpdate = ParamConfig.BOOLEAN(0);
	reload = ParamConfig.BUTTON(null);
}

export class BaseFileMultiSopNodeFactoryResult extends TypedSopNode<BaseFileMultiParamsConfigResult> {}

// export function fileMultiSopNodeParamConfigFactory(
// 	options: FileMultSopNodeParamConfigOptions
// ): typeof NodeParamsConfig {
export class BaseFileMultiParamsConfig extends NodeParamsConfig {
	/** @param url to load the geometry from */
	url = ParamConfig.STRING('', {
		fileBrowse: {extensions: []},
		expression: {forEntities: true},
	});
	/** @param sets the matrixAutoUpdate attribute for the objects loaded */
	matrixAutoUpdate = ParamConfig.BOOLEAN(false);
	/** @param reload the geometry */
	reload = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			BaseFileMultiSopNode.PARAM_CALLBACK_reload(
				node as BaseFileMultiSopNode<BaseGeoLoaderOutput, BaseFileMultiParamsConfig>
			);
		},
	});
}
// return BaseFileMultiParamsConfig
// }
// const BaseFileMultiParamsConfig = fileMultiSopNodeParamConfigFactory({defaultUrlExpression: '', extensions:[]});
export abstract class BaseFileMultiSopNode<
	O extends BaseGeoLoaderOutput,
	K extends BaseFileMultiParamsConfig
> extends TypedSopNode<K> {
	// override paramsConfig = ParamsConfig;
	// static override type() {
	// 	return options.type;
	// }
	protected abstract _createLoader(url: string): BaseGeoLoaderHandler<O>;

	override dispose(): void {
		super.dispose();
		Poly.blobs.clearBlobsForNode(this);
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
	}

	private _instancer = new CoreInstancer();
	private _instanceMatrix = new Matrix4();
	override async cook(inputCoreGroups: CoreGroup[]) {
		const inputCoreGroup = inputCoreGroups[0];

		const points = inputCoreGroup.points();
		// const urls: string[] = new Array(points.length);
		const urls: string[] = [];
		const urlByIndex: Map<number, string> = new Map();
		const loadedResultByUrl: Map<string, Object3D> = new Map();
		const urlUsageCount: Map<string, number> = new Map();
		const param = this.p.url;
		// gather all unique urls
		if (param.hasExpression() && param.expressionController) {
			const uniqueUrls: Set<string> = new Set();
			const _applyUrlToPoint = (point: CorePoint, url: string) => {
				// check that this index was not already set
				const index = point.index();
				if (urlByIndex.has(index)) {
					this.states.error.set(`input points have duplicate indices. Make sure to merge inputs together.`);
				} else {
					urlByIndex.set(index, url);
					uniqueUrls.add(url);
					BaseFileMultiSopNode._incrementUrlUsageCount(url, urlUsageCount);
				}
			};
			if (param.expressionController.entitiesDependent()) {
				await param.expressionController.computeExpressionForPoints(points, _applyUrlToPoint);
			} else {
				for (const point of points) {
					_applyUrlToPoint(point, param.value);
				}
			}
			uniqueUrls.forEach((url) => {
				urls.push(url);
			});
		} else {
			const url = this.pv.url;
			urls.push(url);
			BaseFileMultiSopNode._incrementUrlUsageCount(url, urlUsageCount);
		}
		// load each url and place the result under a parent

		const loadedObjects: Object3D[] = [];
		const promises = urls.map((url) => this._loadFromUrlPromises(url, loadedResultByUrl));
		await Promise.all(promises);
		// move each loaded result and transform it according to its template point
		this._instancer.setCoreGroup(inputCoreGroup);
		for (let point of points) {
			const index = point.index();
			const url = urlByIndex.get(index) || this.pv.url;

			this._instancer.matrixFromPoint(point, this._instanceMatrix);
			const usageCount = urlUsageCount.get(url) || 1;
			let parent = loadedResultByUrl.get(url);
			if (parent) {
				// if this url is used more than 1x, we clone the loaded result
				if (usageCount > 1) {
					parent = parent.clone();
				}
				parent.applyMatrix4(this._instanceMatrix);
				loadedObjects.push(parent);
			}
		}

		this.setObjects(loadedObjects);
	}
	private static _incrementUrlUsageCount(url: string, map: Map<string, number>) {
		const currentUsage = map.get(url);
		if (currentUsage != null) {
			map.set(url, currentUsage + 1);
		} else {
			map.set(url, 1);
		}
	}

	private async _loadFromUrlPromises(url: string, loadedResultByUrl: Map<string, Object3D>) {
		const objects = await this._loadObject(url);
		if (objects) {
			const parent = new Group();
			parent.matrixAutoUpdate = false;
			parent.name = url;
			for (let object of objects) {
				parent.add(object);
			}
			loadedResultByUrl.set(url, parent);
		}
	}

	private _loadObject(url: string) {
		const loader = this._createLoader(url);
		return this._loadWithLoader(loader);
	}
	protected _loadWithLoader(loader: BaseGeoLoaderHandler<O>) {
		return loader.load({node: this});
	}

	static PARAM_CALLBACK_reload(node: BaseFileMultiSopNode<BaseGeoLoaderOutput, BaseFileMultiParamsConfig>) {
		node._paramCallbackReload();
	}
	private _paramCallbackReload() {
		// set the param dirty is preferable to just the successors, in case the expression result needs to be updated
		this.p.url.setDirty();
		this.p.url.emit(ParamEvent.ASSET_RELOAD_REQUEST);
		// this.setDirty()
	}
}
