import {Object3D} from 'three';
import {CoreObject} from '../Object';
import {AttributeProxy, AttributeReactiveCallback} from './_Base';

type AttribValueSimple = string | number;
export function makeAttribReactiveSimple<V extends AttribValueSimple>(
	object: Object3D,
	attribName: string,
	callback: AttributeReactiveCallback<V>
) {
	const attributesDict = CoreObject.attributesDictionary(object);
	const attributesPreviousValuesDict = CoreObject.attributesPreviousValuesDictionary(object);

	// create a dummy val in case there is no attribute yet
	if (attributesDict[attribName] == null) {
		attributesDict[attribName] = 0;
	}

	const proxy: AttributeProxy<V> = {
		value: attributesDict[attribName] as V,
		previousValue: attributesDict[attribName] as V,
		// callbackRanAtFrame: 0,
	};
	Object.defineProperties(attributesDict, {
		[attribName]: {
			get: function () {
				return proxy.value;
			},
			set: function (x: V) {
				if (x != proxy.value) {
					proxy.previousValue = proxy.value;
					proxy.value = x;
					callback(proxy);
				}
				return proxy.value;
			},
			configurable: true,
		},
	});
	Object.defineProperties(attributesPreviousValuesDict, {
		[attribName]: {
			get: function () {
				return proxy.previousValue;
			},
			configurable: true,
		},
	});
}
