import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Color} from 'three/src/math/Color';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {Reflector} from '../../../modules/core/objects/Reflector';
import {Poly} from '../../Poly';
interface ReflectorSopParams extends DefaultOperationParams {
	active: boolean;
	clipBias: number;
	color: Color;
	opacity: number;
	pixelRatio: number;
	tblur: boolean;
	blur: number;
	verticalBlurMult: number;
	tblur2: boolean;
	blur2: number;
	verticalBlur2Mult: number;
}

export class ReflectorSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: ReflectorSopParams = {
		active: true,
		clipBias: 0.003,
		color: new Color(1, 1, 1),
		opacity: 1,
		pixelRatio: 1,
		tblur: false,
		blur: 1,
		verticalBlurMult: 1,
		tblur2: false,
		blur2: 1,
		verticalBlur2Mult: 1,
	};
	static readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static type(): Readonly<'reflector'> {
		return 'reflector';
	}

	async cook(input_contents: CoreGroup[], params: ReflectorSopParams) {
		const input_core_group = input_contents[0];

		const reflectors: Reflector[] = [];
		const renderer = await Poly.renderersController.firstRenderer();
		if (!renderer) {
			return this.createCoreGroupFromObjects(reflectors);
		}

		const objects = input_core_group.objectsWithGeo();

		for (let object of objects) {
			const reflector = new Reflector(object.geometry, {
				clipBias: params.clipBias,
				renderer,
				scene: this.scene().threejsScene(),
				pixelRatio: params.pixelRatio,
				color: params.color,
				opacity: params.opacity,
				active: params.active,
				tblur: params.tblur,
				blur: params.blur,
				verticalBlurMult: params.verticalBlurMult,
				tblur2: params.tblur2,
				blur2: params.blur2,
				verticalBlur2Mult: params.verticalBlur2Mult,
			});
			reflector.position.copy(object.position);
			reflector.rotation.copy(object.rotation);
			reflector.scale.copy(object.scale);
			reflector.updateMatrix();
			reflectors.push(reflector);
		}

		return this.createCoreGroupFromObjects(reflectors);
	}
}
