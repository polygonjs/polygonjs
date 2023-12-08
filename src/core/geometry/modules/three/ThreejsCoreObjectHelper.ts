import {Object3D} from 'three';
import {watch, WatchStopHandle} from '@vue-reactivity/watch';
import {PolyScene} from '../../../../engine/scene/PolyScene';
import {BaseSopNodeType} from '../../../../../src/engine/nodes/sop/_Base';
import {ThreejsCoreObject} from './ThreejsCoreObject';
import {
	JsIConnectionPointTypeToDataTypeMap,
	ParamConvertibleJsType,
} from '../../../../engine/nodes/utils/io/connections/Js';

export interface CoreObjectHelperOptions<S extends PolyScene> {
	scene: S;
	object: Object3D;
}
interface CreateObjectOptions<S extends PolyScene> {
	object: Object3D;
}
type OnAttributeChangeCallback<T> = (newValue: T, prevValue: T) => void;

export class CoreObjectHelper<S extends PolyScene> {
	private _watchStopHandles: WatchStopHandle[] = [];
	public readonly object: Object3D;
	constructor(public readonly options: CoreObjectHelperOptions<S>) {
		this.object = options.object;
	}
	dispose() {
		for (const watchStopHandle of this._watchStopHandles) {
			watchStopHandle();
		}
	}
	onAttributeUpdate<T extends ParamConvertibleJsType>(
		attribName: string,
		attribType: T,
		defaultValue: JsIConnectionPointTypeToDataTypeMap[T],
		callback: OnAttributeChangeCallback<JsIConnectionPointTypeToDataTypeMap[T]>
	) {
		const attributeRef = ThreejsCoreObject.attributeRef(this.object, attribName, attribType, defaultValue);
		if (attributeRef == null) {
			console.error(`attrib not found:'${attribName}'`);
			return;
		}
		const watchStopHandle = watch(attributeRef.current, callback);
		this._watchStopHandles.push(watchStopHandle);
	}
}

type CreateCoreObjectHelper<S extends PolyScene, T extends CoreObjectHelper<S>> = (
	options: CreateObjectOptions<S>
) => T;

export async function objectFromNode<S extends PolyScene, T extends CoreObjectHelper<S>>(
	node: BaseSopNodeType,
	objectName: string,
	creatFunction: CreateCoreObjectHelper<S, T>
) {
	const container = await node.compute();
	const coreGroup = container.coreContent();
	if (!coreGroup) {
		console.error('no core group');
		console.log(node.states.error.message());
		return;
	}
	const objects = coreGroup.threejsObjects();
	const object = objects.find((o) => o.name == objectName);
	if (!object) {
		console.error('no click target');
		return;
	}
	return creatFunction({object});
}
