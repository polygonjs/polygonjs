// import {Vector4} from 'three';
// import {BaseCoreObject} from '../_BaseObject';
// import {CoreObjectType, ObjectContent} from '../ObjectContent';
// import {AttributeReactiveCallback} from './_Base';
// import {_makeAttribReactiveBaseVector} from './_BaseVector';

// type Vector4Prop = 'x' | 'y' | 'z' | 'w';
// const PROPS: Vector4Prop[] = ['x', 'y', 'z', 'w'];
// type AttribValueSimple = Vector4;

// export function makeAttribReactiveVector4<V extends AttribValueSimple, T extends CoreObjectType>(
// 	object: ObjectContent<T>,
// 	attribName: string,
// 	callback: AttributeReactiveCallback<V>
// ) {
// 	const attributesDict = BaseCoreObject.attributesDictionary(object);

// 	// create a dummy val in case there is no attribute yet
// 	if (attributesDict[attribName] == null) {
// 		attributesDict[attribName] = new Vector4();
// 	}

// 	_makeAttribReactiveBaseVector(object, attribName, PROPS, callback);
// }
