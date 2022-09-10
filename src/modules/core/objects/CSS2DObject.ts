import {Object3D} from 'three';

export class CSS2DObject extends Object3D {
	constructor(protected _element: HTMLElement) {
		super();

		this._element.style.position = 'absolute';

		this.addEventListener('removed', this._onRemoved.bind(this));
	}

	private _onRemoved() {
		this.traverse(function (object) {
			if (object instanceof CSS2DObject) {
				if (object.element instanceof Element && object.element.parentNode !== null) {
					object.element.parentNode.removeChild(object.element);
				}
			}
		});
	}

	get element() {
		return this._element;
	}
	override clone(recursive: boolean | undefined): this {
		const element = this._element.cloneNode(true) as HTMLElement;
		const cloned = new CSS2DObject(element).copy(this, recursive);
		return cloned as this;
	}

	override copy(source: CSS2DObject, recursive: boolean | undefined) {
		Object3D.prototype.copy.call(this, source, recursive);

		this._element = source.element.cloneNode(true) as HTMLElement;
		this.matrixAutoUpdate = source.matrixAutoUpdate;

		return this;
	}
}
