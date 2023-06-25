import {CoreObjectType, ObjectContent} from '../../geometry/ObjectContent';
import {
	setObjectNumber,
	getObjectNumber,
	setObjectBoolean,
	getObjectBoolean,
	getObjectString,
	setObjectString,
} from '../../geometry/AttributeUtils';
import {Object3D} from 'three';
import {CoreObject} from '../../geometry/Object';
import {isString, isNumber} from '../../Type';
import type {CSS2DObject} from './CSS2DObject';
import type {CSS3DObject} from './CSS3DObject';
import {ObjectUtils} from '../../ObjectUtils';

// export enum CSSObjectAttributeId {
// 	NODE_ID = 'CSSObject_nodeId',
// }

export enum CSSObjectAttribute {
	ID = 'htmlId',
	CLASS = 'htmlClass',
	HTML = 'html',
	COPY_ATTRIBUTES = 'htmlCopyAttributes',
	ATTRIBUTES_TO_COPY = 'htmlAttributesToCopy',
	SCALE = 'htmlScale',
}

export const DEFAULT_CSS2DOBJECT = {
	id: 'myCSSObject',
	className: 'CSS2DObject',
	html: '<div>default html</div>',
};
export const DEFAULT_CSS3DOBJECT = {
	id: 'myCSSObject',
	className: 'CSS3DObject',
	html: '<div>default html</div>',
};

export class CoreCSSObjectAttribute {
	// node id
	// static setNodeId(object: ObjectContent<CoreObjectType>, value: number) {
	// 	setObjectNumber(object, CSSObjectAttributeId.NODE_ID, value);
	// }
	// static getNodeId(object: ObjectContent<CoreObjectType>): number {
	// 	return getObjectNumber(object, CSSObjectAttributeId.NODE_ID, -1);
	// }
	// html properties
	static setElementId(object: ObjectContent<CoreObjectType>, value: string) {
		setObjectString(object, CSSObjectAttribute.ID, value);
	}
	static getElementId(object: ObjectContent<CoreObjectType>): string {
		return getObjectString(object, CSSObjectAttribute.ID) as string;
	}
	static setElementClass(object: ObjectContent<CoreObjectType>, value: string) {
		setObjectString(object, CSSObjectAttribute.CLASS, value);
	}
	static getElementClass(object: ObjectContent<CoreObjectType>): string {
		return getObjectString(object, CSSObjectAttribute.CLASS) as string;
	}
	static setElementHTML(object: ObjectContent<CoreObjectType>, value: string) {
		setObjectString(object, CSSObjectAttribute.HTML, value);
	}
	static getElementHTML(object: ObjectContent<CoreObjectType>): string {
		return getObjectString(object, CSSObjectAttribute.HTML) as string;
	}
	// attributes copy
	static setCopyAttributes(object: ObjectContent<CoreObjectType>, value: boolean) {
		setObjectBoolean(object, CSSObjectAttribute.COPY_ATTRIBUTES, value);
	}
	static getCopyAttributes(object: ObjectContent<CoreObjectType>): boolean {
		return getObjectBoolean(object, CSSObjectAttribute.COPY_ATTRIBUTES, false) as boolean;
	}
	static setAttributesToCopy(object: ObjectContent<CoreObjectType>, value: string) {
		setObjectString(object, CSSObjectAttribute.ATTRIBUTES_TO_COPY, value);
	}
	static getAttributesToCopy(object: ObjectContent<CoreObjectType>): string {
		return getObjectString(object, CSSObjectAttribute.ATTRIBUTES_TO_COPY) as string;
	}
	// CSS3DObject
	static setScale(object: ObjectContent<CoreObjectType>, value: number) {
		setObjectNumber(object, CSSObjectAttribute.SCALE, value);
	}
	static getScale(object: ObjectContent<CoreObjectType>): number {
		return getObjectNumber(object, CSSObjectAttribute.SCALE, 1);
	}
}

interface CopyAttributesOptions {
	CSSObject: CSS2DObject | CSS3DObject;
	copyAttributes: boolean;
	attributesToCopy: string[];
	object: Object3D;
}
export function CSSObjectElementCopyObjectAttributes(element: HTMLElement, options: CopyAttributesOptions) {
	const {CSSObject, copyAttributes, attributesToCopy, object} = options;

	CSSObject.name = object.name;
	CSSObject.userData = ObjectUtils.cloneDeep(object.userData);

	if (copyAttributes == true) {
		for (let attribName of attributesToCopy) {
			const attribValue = CoreObject.attribValue(object, attribName);
			if (isString(attribValue)) {
				element.setAttribute(attribName, attribValue);
			} else {
				if (isNumber(attribValue)) {
					element.setAttribute(attribName, `${attribValue}`);
				}
			}
		}
	}
}
