/**
 * Loads multiple geometries from a url, using attributes from the input points. This can be more convenient than the File SOP if you want to load many geometries.
 *
 * @remarks
 * Note that this node will automatically use a specific loader depending on the extension of the url.
 *
 */
import {TypedSopNode} from './_Base';
import {CoreLoaderGeometry, GeometryFormat, GEOMETRY_FORMATS} from '../../../core/loader/Geometry';
import {BaseNodeType} from '../_Base';
import {FileType} from '../../params/utils/OptionsController';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {CoreBaseLoader} from '../../../core/loader/_Base';
import {ASSETS_ROOT} from '../../../core/loader/AssetsUtils';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {Object3D} from 'three';
import {CoreGeometryIndexBuilder} from '../../../core/geometry/util/IndexBuilder';
import {BufferGeometry} from 'three';
import {Mesh} from 'three';
import {Group} from 'three';
import {CoreInstancer} from '../../../core/geometry/Instancer';
import {Matrix4} from 'three';
class FileMultiSopParamsConfig extends NodeParamsConfig {
	/** @param url to load the geometry from */
	url = ParamConfig.STRING(`${ASSETS_ROOT}/models/\`@name\`.obj`, {
		fileBrowse: {type: [FileType.GEOMETRY]},
		expression: {forEntities: true},
	});
	/** @param format */
	format = ParamConfig.STRING(GeometryFormat.AUTO, {
		menuString: {
			entries: GEOMETRY_FORMATS.map((name) => {
				return {name, value: name};
			}),
		},
	});
	/** @param reload the geometry */
	reload = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			FileMultiSopNode.PARAM_CALLBACK_reload(node as FileMultiSopNode);
		},
	});
}
const ParamsConfig = new FileMultiSopParamsConfig();

export class FileMultiSopNode extends TypedSopNode<FileMultiSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'fileMulti';
	}

	override async requiredModules() {
		const ext = CoreBaseLoader.extension(this.p.url.rawInput() || '');
		const format = this.pv.format as GeometryFormat;
		return CoreLoaderGeometry.moduleNamesFromFormat(format, ext);
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
			await param.expressionController.computeExpressionForPoints(points, (point, url) => {
				// check that this index was not already set
				const index = point.index();
				if (urlByIndex.has(index)) {
					this.states.error.set(`input points have duplicate indices. Make sure to merge inputs together.`);
				} else {
					urlByIndex.set(index, url);
					uniqueUrls.add(url);
					FileMultiSopNode._incrementUrlUsageCount(url, urlUsageCount);
				}
			});
			uniqueUrls.forEach((url) => {
				urls.push(url);
			});
		} else {
			const url = this.pv.url;
			urls.push(url);
			FileMultiSopNode._incrementUrlUsageCount(url, urlUsageCount);
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
		const parent = new Group();
		parent.matrixAutoUpdate = false;
		parent.name = url;
		for (let object of objects) {
			parent.add(object);
		}
		loadedResultByUrl.set(url, parent);
	}

	private _loadObject(url: string): Promise<Object3D[]> {
		const loader = new CoreLoaderGeometry({url: url, format: this.pv.format as GeometryFormat}, this.scene(), this);

		return new Promise((resolve) => {
			loader.load(
				(objects: Object3D[]) => {
					const new_objects = this._onLoad(objects);
					resolve(new_objects);
				},
				(message: string) => {
					this._onError(message, url);
				}
			);
		});
	}

	private _onLoad(objects: Object3D[]) {
		objects = objects.flat();

		for (let object of objects) {
			object.traverse((child) => {
				this._ensureGeometryHasIndex(child);
				child.matrixAutoUpdate = false;
			});
		}
		return objects;
	}
	private _onError(message: string, url: string) {
		this.states?.error.set(`could not load geometry from ${url} (${message})`);
	}

	private _ensureGeometryHasIndex(object: Object3D) {
		const mesh = object as Mesh;
		const geometry = mesh.geometry;
		if (geometry) {
			CoreGeometryIndexBuilder.createIndexIfNone(geometry as BufferGeometry);
		}
	}

	static PARAM_CALLBACK_reload(node: FileMultiSopNode) {
		node._paramCallbackReload();
	}
	private _paramCallbackReload() {
		// set the param dirty is preferable to just the successors, in case the expression result needs to be updated
		this.p.url.setDirty();
		// this.setDirty()
	}
}
