import type {Color, Vector2, Vector3, Vector4, Quaternion} from 'three';

export type Copyable = Color | Vector2 | Vector3 | Vector4 | Quaternion;

export type CreateCopyableItemFunc<V extends Copyable> = () => V;
export function updateCopyableArrayLength<V extends Copyable>(
	targetArray: V[],
	targetArrayLength: number,
	createItem: CreateCopyableItemFunc<V>
) {
	if (targetArray.length < targetArrayLength) {
		for (let i = targetArray.length; i < targetArrayLength; i++) {
			if (targetArray[i] == null) {
				targetArray[i] = createItem();
			}
		}
	}
	targetArray.length = targetArrayLength;
}

export function updatePrimitiveArrayLength<T extends boolean | number | string>(
	targetArray: T[],
	targetArrayLength: number,
	defaultValue: T
) {
	if (targetArray.length < targetArrayLength) {
		for (let i = targetArray.length; i < targetArrayLength; i++) {
			if (targetArray[i] == null) {
				targetArray[i] = defaultValue;
			}
		}
	}
	targetArray.length = targetArrayLength;
}
