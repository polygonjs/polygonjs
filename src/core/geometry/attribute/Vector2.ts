import {Object3D, Vector2} from 'three';
import {CoreObject} from '../Object';
import {AttributeReactiveCallback} from './_Base';
import {_makeAttribReactiveBaseVector} from './_BaseVector';

type Vector2Prop = 'x' | 'y';
const PROPS: Vector2Prop[] = ['x', 'y'];
type AttribValueSimple = Vector2;
export function makeAttribReactiveVector2<V extends AttribValueSimple>(
	object: Object3D,
	attribName: string,
	callback: AttributeReactiveCallback<V>
) {
	const attributesDict = CoreObject.attributesDictionary(object);

	// create a dummy val in case there is no attribute yet
	if (attributesDict[attribName] == null) {
		attributesDict[attribName] = new Vector2();
	}

	_makeAttribReactiveBaseVector(object, attribName, PROPS, callback);
}
