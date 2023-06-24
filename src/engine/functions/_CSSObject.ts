import {ObjectNamedFunction2} from './_Base';
import type {CSS2DObject} from '../../core/render/CSSRenderers/CSS2DObject';
import type {CSS3DObject} from '../../core/render/CSSRenderers/CSS3DObject';

type CSSObject = CSS2DObject | CSS3DObject;

export class setCSSObjectClass extends ObjectNamedFunction2<[string, boolean]> {
	static override type() {
		return 'setCSSObjectClass';
	}
	func(CSSObject: CSSObject, className: string, addRemove: boolean): void {
		if (addRemove == true) {
			CSSObject.element.classList.add(className);
		} else {
			CSSObject.element.classList.remove(className);
		}
	}
}
