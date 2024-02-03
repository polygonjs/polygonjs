import {Object3D} from 'three';
import {watch, WatchStopHandle, WatchCallback, WatchOptions, WatchSource} from '@vue-reactivity/watch';
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
	scene: S;
	object: Object3D;
}
type OnAttributeChangeCallback<T> = (newValue: T, prevValue: T) => void;

export class CoreObjectHelper<S extends PolyScene> {
	private _watchStopHandles: WatchStopHandle[] = [];
	public readonly scene: S;
	public readonly object: Object3D;
	constructor(public readonly options: CoreObjectHelperOptions<S>) {
		this.scene = options.scene;
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
	watch<T, Immediate extends Readonly<boolean> = false>(
		source: WatchSource<T>,
		cb: WatchCallback<T, Immediate extends true ? T | undefined : T>,
		options?: WatchOptions<Immediate>
	): void {
		const watchHandle = watch(source, cb, options);
		this._watchStopHandles.push(watchHandle);
	}
}

type CreateCoreObjectHelper<S extends PolyScene, T extends CoreObjectHelper<S>> = (
	options: CreateObjectOptions<S>
) => T;

interface ObjectFromNodeOptions {
	traverse?: boolean;
}
export async function objectFromNode<S extends PolyScene, T extends CoreObjectHelper<S>>(
	node: BaseSopNodeType,
	objectName: string,
	creatFunction: CreateCoreObjectHelper<S, T>,
	options?: ObjectFromNodeOptions
) {
	const container = await node.compute();
	const coreGroup = container.coreContent();
	if (!coreGroup) {
		console.error(`no core group found in node '${node.path()}'`);
		console.log(node.states.error.message());
		return;
	}
	const objects = coreGroup.threejsObjects();
	let foundObject = objects.find((o) => o.name == objectName);
	if (!foundObject && options?.traverse == true) {
		for (const object of objects) {
			if (foundObject == null) {
				object.traverse((child) => {
					if (child.name == objectName) {
						foundObject = child;
					}
				});
			}
		}
	}
	if (!foundObject) {
		console.error(`no object with name '${objectName}'`);
		return;
	}
	return creatFunction({scene: node.scene() as S, object: foundObject});
}
