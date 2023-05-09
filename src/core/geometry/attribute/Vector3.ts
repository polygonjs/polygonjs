// import {Vector3} from 'three';
// import {BaseCoreObject} from '../_BaseObject';
// import {CoreObjectType, ObjectContent} from '../ObjectContent';
// import {AttributeReactiveCallback} from './_Base';
// import {_makeAttribReactiveBaseVector} from './_BaseVector';

// type Vector3Prop = 'x' | 'y' | 'z';
// const PROPS: Vector3Prop[] = ['x', 'y', 'z'];
// type AttribValueSimple = Vector3;

// export function makeAttribReactiveVector3<V extends AttribValueSimple, T extends CoreObjectType>(
// 	object: ObjectContent<T>,
// 	attribName: string,
// 	callback: AttributeReactiveCallback<V>
// ) {
// 	const attributesDict = BaseCoreObject.attributesDictionary(object);

// 	// create a dummy val in case there is no attribute yet
// 	if (attributesDict[attribName] == null) {
// 		attributesDict[attribName] = new Vector3();
// 	}

// 	_makeAttribReactiveBaseVector(object, attribName, PROPS, callback);
// }
