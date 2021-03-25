import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Vector3} from 'three/src/math/Vector3';
import {Color} from 'three/src/math/Color';
import {InputCloneMode} from '../../poly/InputCloneMode';
// import {Reflector} from '../../../modules/three/examples/jsm/objects/Reflector';
import {Reflector} from '../../../modules/core/objects/Reflector';
import {CoreTransform} from '../../../core/Transform';
import {Poly} from '../../Poly';

interface ReflectorSopParams extends DefaultOperationParams {
	clipBias: number;
	color: Color;
	active: boolean;
	tblur: boolean;
	blur: number;
}

const DEFAULT_DIR = new Vector3(0, 0, 1);

export class ReflectorSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: ReflectorSopParams = {
		clipBias: 0.003,
		color: new Color(1, 1, 1),
		direction: new Vector3(0, 0, 1),
		active: true,
		tblur: false,
		blur: 1,
	};
	static readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static type(): Readonly<'reflector'> {
		return 'reflector';
	}
	private _core_transform = new CoreTransform();
	async cook(input_contents: CoreGroup[], params: ReflectorSopParams) {
		const input_core_group = input_contents[0];

		const reflectors: Reflector[] = [];
		const renderer = await Poly.renderersController.firstRenderer();
		if (!renderer) {
			return this.create_core_group_from_objects(reflectors);
		}
		const canvas = renderer.domElement;
		const w = canvas.width;
		const h = canvas.height;

		const objects = input_core_group.objectsWithGeo();

		for (let object of objects) {
			const reflector = new Reflector(object.geometry, {
				clipBias: params.clipBias,
				textureWidth: w,
				textureHeight: h,
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
			if (0 + 0) this._core_transform.rotate_geometry(object.geometry, DEFAULT_DIR, new Vector3(0, 1, 0));
		}

		return this.create_core_group_from_objects(reflectors);
	}
}
