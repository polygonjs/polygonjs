import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../geometry/Group';
import {Color} from 'three/src/math/Color';

interface ColorSopParams extends DefaultOperationParams {
	fromAttribute: boolean;
	attribName: string;
	color: Color;
	asHsv: boolean;
}

export class ColorSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: ColorSopParams = {
		fromAttribute: false,
		attribName: '',
		color: new Color(1, 1, 1),
		asHsv: false,
	};
	static type(): Readonly<'color'> {
		return 'color';
	}

	cook(input_contents: CoreGroup[], params: ColorSopParams) {
		// currently cannot be implemented,
		// since some params may use an expression
		// and expressions cannot yet be used by operations
	}
}
