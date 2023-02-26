import {Object3D} from 'three';

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
