import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {GridHelper} from 'three/src/helpers/GridHelper';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {Color} from 'three/src/math/Color';

interface PlaneHelperSopParams extends DefaultOperationParams {
	size: number;
	colorCenterLine: Color;
	colorGrid: Color;
}

export class PlaneHelperSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: PlaneHelperSopParams = {
		size: 10,
		colorCenterLine: new Color(0, 0, 1),
		colorGrid: new Color(1, 1, 1),
	};
	static readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static type(): Readonly<'planeHelper'> {
		return 'planeHelper';
	}

	cook(input_contents: CoreGroup[], params: PlaneHelperSopParams) {
		const helper = new GridHelper(params.size, params.size, params.colorCenterLine, params.colorGrid);
		return this.createCoreGroupFromObjects([helper]);
	}
}
