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
import {Object3D} from 'three/src/core/Object3D';
import {CoreGeometryIndexBuilder} from '../../../core/geometry/util/IndexBuilder';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Mesh} from 'three/src/objects/Mesh';
import {Group} from 'three/src/objects/Group';
import {CoreInstancer} from '../../../core/geometry/Instancer';
import {Matrix4} from 'three/src/math/Matrix4';
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
	paramsConfig = ParamsConfig;
	static type() {
		return 'fileMulti';
	}

	async requiredModules() {
		const ext = CoreBaseLoader.extension(this.p.url.rawInput() || '');
		const format = this.pv.format as GeometryFormat;
		console.log(ext, format);
		return CoreLoaderGeometry.moduleNamesFromFormat(format, ext);
	}

	initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
		this.scene().dispatchController.onAddListener(() => {
			this.params.onParamsCreated('params_label', () => {
				this.params.label.init([this.p.url], () => {
					return this.p.url.rawInput();
				});
			});
		});
	}

	async cook(inputCoreGroups: CoreGroup[]) {
		const inputCoreGroup = inputCoreGroups[0];
		const instancer = new CoreInstancer(inputCoreGroup);
		const instanceMatrices = instancer.matrices();
		const points = inputCoreGroup.points();
		const urls: string[] = new Array(points.length);
		const param = this.p.url;
		if (param.hasExpression() && param.expressionController) {
			await param.expressionController.computeExpressionForPoints(points, (point, value) => {
				// check that this index was not already set
				const index = point.index();
				const currentUrl = urls[index];
				if (currentUrl != null) {
					this.states.error.set(
						`input points have duplicate indices. Make sure to merge inputs objects together`
					);
				} else {
					urls[index] = value;
				}
			});
		} else {
			urls.fill(this.pv.url);
		}
		const loadedObjects: Object3D[] = [];
		const promises = urls.map((url, i) => {
			return this._loadFromUrlPromises(url, loadedObjects, instanceMatrices[i]);
		});
		await Promise.all(promises);
		this.setObjects(loadedObjects);
	}

	private async _loadFromUrlPromises(url: string, loadedObjects: Object3D[], matrix: Matrix4) {
		const objects = await this._loadObject(url);
		const parent = new Group();
		parent.applyMatrix4(matrix);
		parent.matrixAutoUpdate = false;
		parent.name = url;
		for (let object of objects) {
			parent.add(object);
		}
		loadedObjects.push(parent);
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
