import {Object3D} from 'three';

export class CSS2DObject extends Object3D {
	public readonly isCSS2DObject = true;

	constructor(public element = document.createElement('div')) {
		super();

		this.element.style.position = 'absolute';
		this.element.style.userSelect = 'none';

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
