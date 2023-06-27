import {Object3D} from 'three';
import {CSSObjectElementCopyObjectAttributes} from './CSSObjectAttribute';

export class CSS2DObject extends Object3D {
	public readonly isCSS2DObject = true;

	constructor(public element = document.createElement('div')) {
		super();

		this.element.style.position = 'absolute';

		this.element.setAttribute('draggable', false as any);

		// this.addEventListener( 'removed', function () {

		// 	this.traverse( function ( object ) {

		// 		if ( object.element instanceof Element && object.element.parentNode !== null ) {

		// 			object.element.parentNode.removeChild( object.element );

		// 		}

		// 	} );

		// } );
	}

	override copy(source: CSS2DObject, recursive: boolean) {
		super.copy(source as this, recursive);

		this.element = source.element.cloneNode(true) as HTMLDivElement;

		return this;
	}
}

export interface CSS2DObjectOptions {
	object?: Object3D;
	id: string;
	className: string;
	html: string;
	copyAttributes: boolean;
	attributesToCopy: string[];
}

export function createCSS2DObject(options: CSS2DObjectOptions) {
	const {id, className, html} = options;
	const element = document.createElement('div');
	element.id = id;
	element.className = className;
	element.innerHTML = html;
	const CSSObject = new CSS2DObject(element);
	CSSObject.matrixAutoUpdate = false;

	if (options.object) {
		CSSObjectElementCopyObjectAttributes(element, {
			...options,
			object: options.object,
			CSSObject,
		});
		// ensure children are also copied
		let child: Object3D | undefined;
		while ((child = options.object.children.pop())) {
			CSSObject.add(child);
		}

		CSSObject.position.copy(options.object.position);
		// CSSObject.quaternion.copy(options.object.quaternion);
		// CSSObject.scale.copy(options.object.scale);
		CSSObject.updateMatrix();
	}

	return CSSObject;
}
