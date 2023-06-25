// import {BaseSopOperation} from './_Base';
// import {InputCloneMode} from '../../poly/InputCloneMode';
// import {CSS2DObject} from '../../../core/render/CSSRenderers/CSS2DObject';
// import {CoreString} from '../../../core/String';
// import {CoreGroup} from '../../../core/geometry/Group';
// import {CoreType} from '../../../core/Type';
// import {isBooleanTrue} from '../../../core/BooleanValue';
// import {DefaultOperationParams} from '../../../core/operations/_Base';
// import {Poly} from '../../Poly';
// import {Object3D} from 'three';
// export const DEFAULT_CSS2DOBJECT_CLASS = 'CSS2DObject';

// interface CSS2DObjectParams {
// 	id: string;
// 	className: string;
// 	html: string;
// }
// const ATTRIBUTE_NAME = {
// 	id: 'id',
// 	className: 'class',
// 	html: 'html',
// };

// interface CSS2DObjectSopParams extends DefaultOperationParams {
// 	overrideId: boolean;
// 	id: string;
// 	overrideClassName: boolean;
// 	className: string;
// 	overrideHTML: boolean;
// 	html: string;
// 	copyAttributes: boolean;
// 	attributesToCopy: string;
// }

// export class CSS2DObjectSopOperation extends BaseSopOperation {
// 	static override readonly DEFAULT_PARAMS: CSS2DObjectSopParams = {
// 		overrideId: false,
// 		id: 'myCSSObject',
// 		overrideClassName: false,
// 		className: DEFAULT_CSS2DOBJECT_CLASS,
// 		overrideHTML: false,
// 		html: '<div>default html</div>',
// 		copyAttributes: false,
// 		attributesToCopy: '',
// 	};
// 	static override readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
// 	static override type(): Readonly<'CSS2DObject'> {
// 		return 'CSS2DObject';
// 	}

// 	override cook(inputCoreGroups: CoreGroup[], params: CSS2DObjectSopParams) {
// 		Poly.onObjectsAddedHooks.registerHook(this.type(), this.traverseObjectOnSopGroupAdd.bind(this));
// 		const coreGroup = inputCoreGroups[0];
// 		if (coreGroup) {
// 			const objects = this._createObjectsFromInputPoints(coreGroup, params);
// 			return this.createCoreGroupFromObjects(objects);
// 		} else {
// 			const object = this._createObjectFromScratch(params);
// 			return this.createCoreGroupFromObjects([object]);
// 		}
// 	}
// 	private _createObjectsFromInputPoints(coreGroup: CoreGroup, params: CSS2DObjectSopParams) {
// 		const points = coreGroup.points();
// 		const objects: CSS2DObject[] = [];
// 		for (let point of points) {
// 			const id = isBooleanTrue(params.useIdAttrib) ? (point.attribValue(ATTRIBUTE_NAME.id) as string) : params.id;
// 			const className = isBooleanTrue(params.useClassAttrib)
// 				? (point.attribValue(ATTRIBUTE_NAME.className) as string)
// 				: params.className;
// 			const html = isBooleanTrue(params.useHTMLAttrib)
// 				? (point.attribValue(ATTRIBUTE_NAME.html) as string)
// 				: params.html;

// 			const object = CSS2DObjectSopOperation.createCSSObject({
// 				id,
// 				className,
// 				html,
// 			});
// 			const element = object.element;
// 			if (isBooleanTrue(params.copyAttributes)) {
// 				const attribNames = CoreString.attribNames(params.attributesToCopy);
// 				for (let attribName of attribNames) {
// 					const attribValue = point.attribValue(attribName);
// 					if (CoreType.isString(attribValue)) {
// 						element.setAttribute(attribName, attribValue);
// 					} else {
// 						if (CoreType.isNumber(attribValue)) {
// 							element.setAttribute(attribName, `${attribValue}`);
// 						}
// 					}
// 				}
// 			}

// 			object.position.copy(point.position());
// 			object.updateMatrix();

// 			objects.push(object);
// 		}
// 		return objects;
// 	}

// 	private _createObjectFromScratch(params: CSS2DObjectSopParams) {
// 		const object = CSS2DObjectSopOperation.createCSSObject({
// 			id: params.id,
// 			className: params.className,
// 			html: params.html,
// 		});

// 		return object;
// 	}

// 	private static createCSSObject(params: CSS2DObjectParams) {
// 		const element = document.createElement('div');
// 		element.id = params.id;
// 		element.className = params.className;
// 		element.innerHTML = params.html;

// 		const object = new CSS2DObject(element);

// 		object.matrixAutoUpdate = false;

// 		return object;
// 	}

// 	//
// 	//
// 	//
// 	//
// 	//
// 	traverseObjectOnSopGroupAdd(object: Object3D) {}
// }
