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
	pixelRatio: number;
	tblur: boolean;
	blur: number;
}

export class ReflectorSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: ReflectorSopParams = {
		active: true,
		clipBias: 0.003,
		color: new Color(1, 1, 1),
		pixelRatio: 1,
		tblur: false,
		blur: 1,
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
			return this.create_core_group_from_objects(reflectors);
		}

		const objects = input_core_group.objectsWithGeo();

		for (let object of objects) {
			const reflector = new Reflector(object.geometry, {
				clipBias: params.clipBias,
				renderer,
				scene: this.scene().threejsScene(),
				pixelRatio: params.pixelRatio,
				color: params.color,
				active: params.active,
				tblur: params.tblur,
				blur: params.blur,
			});
			reflector.position.copy(object.position);
			reflector.rotation.copy(object.rotation);
			reflector.scale.copy(object.scale);
			reflector.updateMatrix();
			reflectors.push(reflector);
		}

		return this.create_core_group_from_objects(reflectors);
	}
}
