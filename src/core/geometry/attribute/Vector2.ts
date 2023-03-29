// import {Vector2} from 'three';
// import {BaseCoreObject} from '../_BaseObject';
// import {CoreObjectType, ObjectContent} from '../ObjectContent';
// import {AttributeReactiveCallback} from './_Base';
// import {_makeAttribReactiveBaseVector} from './_BaseVector';

// type Vector2Prop = 'x' | 'y';
// const PROPS: Vector2Prop[] = ['x', 'y'];
// type AttribValueSimple = Vector2;
// export function makeAttribReactiveVector2<V extends AttribValueSimple, T extends CoreObjectType>(
// 	object: ObjectContent<T>,
// 	attribName: string,
// 	callback: AttributeReactiveCallback<V>
// ) {
// 	const attributesDict = BaseCoreObject.attributesDictionary(object);

// 	// create a dummy val in case there is no attribute yet
// 	if (attributesDict[attribName] == null) {
// 		attributesDict[attribName] = new Vector2();
// 	}

// 	_makeAttribReactiveBaseVector(object, attribName, PROPS, callback);
// }
