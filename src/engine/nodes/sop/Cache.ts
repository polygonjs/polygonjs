/**
 * Caches the input geometry.
 *
 * @remarks
 * The cache node can be very handy when the input geometry takes a long time to compute and does not need to be updated frequently.
 *
 */

import {Object3D, ObjectLoader} from 'three';
import {TypedSopNode} from './_Base';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseNodeType} from '../_Base';
import {BaseParamType} from '../../params/_Base';
import {CoreGroup} from '../../../core/geometry/Group';
class CacheSopParamsConfig extends NodeParamsConfig {
	/** @param content of the cache (hidden) */
	cache = ParamConfig.STRING('', {hidden: true});
	/** @param clears the cache */
	reset = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType, param: BaseParamType) => {
			CacheSopNode.PARAM_CALLBACK_reset(node as CacheSopNode, param);
		},
	});
}
const ParamsConfig = new CacheSopParamsConfig();

export class CacheSopNode extends TypedSopNode<CacheSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'cache';
	}

	static override displayedInputNames(): string[] {
		return ['geometry to cache'];
	}

	override initializeNode() {
		this.io.inputs.setCount(0, 1);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const isCacheEmpty = this.pv.cache == '' || this.pv.cache == null;
		const coreGroup = inputCoreGroups[0];

		function toJSON() {
			const json = [];
			for (let object of coreGroup.threejsObjects()) {
				json.push(object.toJSON());
			}
			return JSON.stringify(json);
		}
		function fromJSON(json: string) {
			const objLoader = new ObjectLoader();
			const jsons = JSON.parse(json);
			const allObjects: Object3D[] = [];
			for (let json of jsons) {
				const parent = objLoader.parse(json);
				allObjects.push(parent);
			}
			return allObjects;
		}

		if (isCacheEmpty && coreGroup) {
			const str = toJSON();
			const objects = fromJSON(str);
			this.setObjects(objects);
			this.p.cache.set(str);
		} else {
			if (this.pv.cache) {
				const objects = fromJSON(this.pv.cache);
				this.setObjects(objects);
			} else {
				this.setObjects([]);
			}
		}
	}

	static PARAM_CALLBACK_reset(node: CacheSopNode, param: BaseParamType) {
		node.param_callback_PARAM_CALLBACK_reset();
	}
	async param_callback_PARAM_CALLBACK_reset() {
		this.p.cache.set('');
		this.compute();
	}
}
