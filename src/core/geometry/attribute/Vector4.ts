import {Object3D, Vector4} from 'three';
import {CoreObject} from '../Object';
import {AttributeReactiveCallback} from './_Base';
import {_makeAttribReactiveBaseVector} from './_BaseVector';

type Vector4Prop = 'x' | 'y' | 'z' | 'w';
const PROPS: Vector4Prop[] = ['x', 'y', 'z', 'w'];
type AttribValueSimple = Vector4;

export function makeAttribReactiveVector4<V extends AttribValueSimple>(
	object: Object3D,
	attribName: string,
	callback: AttributeReactiveCallback<V>
) {
	const attributesDict = CoreObject.attributesDictionary(object);

	// create a dummy val in case there is no attribute yet
	if (attributesDict[attribName] == null) {
		attributesDict[attribName] = new Vector4();
	}

	_makeAttribReactiveBaseVector(object, attribName, PROPS, callback);
}
