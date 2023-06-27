import {Object3D} from 'three';
import {CSSObjectElementCopyObjectAttributes} from './CSSObjectAttribute';
export class CSS3DObject extends Object3D {
	public readonly isCSS3DObject = true;
	constructor(public element = document.createElement('div')) {
		super();

		this.element = element;
		this.element.style.position = 'absolute';

		this.element.setAttribute('draggable', false as any);

		// this.addEventListener('removed', function () {
		// 	this.traverse(function (object) {
		// 		if (object.element instanceof Element && object.element.parentNode !== null) {
		// 			object.element.parentNode.removeChild(object.element);
		// 		}
		// 	});
		// });
	}
	override copy(source: CSS3DObject, recursive: boolean) {
		super.copy(source as this, recursive);

		this.element = source.element.cloneNode(true) as HTMLDivElement;

		return this;
	}
}

export class CSS3DSprite extends CSS3DObject {
	public readonly isCSS3DSprite = true;
	public rotation2D = 0;
	constructor(element: HTMLDivElement) {
		super(element);

		this.rotation2D = 0;
	}

	override copy(source: CSS3DSprite, recursive: boolean) {
		super.copy(source, recursive);

		this.rotation2D = source.rotation2D;

		return this;
	}
}

export interface CSS3DObjectOptions {
	object?: Object3D;
	id: string;
	className: string;
	html: string;
	copyAttributes: boolean;
	attributesToCopy: string[];
	scale: number;
}

export function createCSS3DObject(options: CSS3DObjectOptions) {
	const {id, className, html, scale} = options;
	const element = document.createElement('div');
	element.id = id;
	element.className = className;
	element.innerHTML = html;
	const CSSObject = new CSS3DObject(element);
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
		CSSObject.quaternion.copy(options.object.quaternion);
		CSSObject.scale.copy(options.object.scale);
		CSSObject.scale.multiplyScalar(scale);
		CSSObject.updateMatrix();
	}

	return CSSObject;
}
