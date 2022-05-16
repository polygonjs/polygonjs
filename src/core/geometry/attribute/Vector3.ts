import {Object3D, Vector3} from 'three';
import {CoreObject} from '../Object';
import {AttributeReactiveCallback} from './_Base';
import {_makeAttribReactiveBaseVector} from './_BaseVector';

type Vector3Prop = 'x' | 'y' | 'z';
const PROPS: Vector3Prop[] = ['x', 'y', 'z'];
type AttribValueSimple = Vector3;

export function makeAttribReactiveVector3<V extends AttribValueSimple>(
	object: Object3D,
	attribName: string,
	callback: AttributeReactiveCallback<V>
) {
	const attributesDict = CoreObject.attributesDictionary(object);

	// create a dummy val in case there is no attribute yet
	if (attributesDict[attribName] == null) {
		attributesDict[attribName] = new Vector3();
	}

	_makeAttribReactiveBaseVector(object, attribName, PROPS, callback);
}
