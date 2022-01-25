import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {RectAreaLight} from 'three/src/lights/RectAreaLight';
import {RectAreaLightUniformsLib} from '../../../modules/three/examples/jsm/lights/RectAreaLightUniformsLib';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {Group} from 'three/src/objects/Group';
import {AreaLightParams, CoreRectAreaLightHelper, DEFAULT_AREA_LIGHT_PARAMS} from '../../../core/lights/AreaLight';

export class AreaLightSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: AreaLightParams = DEFAULT_AREA_LIGHT_PARAMS;
	static override readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static override type(): Readonly<'areaLight'> {
		return 'areaLight';
	}
	override cook(input_contents: CoreGroup[], params: AreaLightParams) {
		const light = this.createLight();

		this.updateLightParams(light, params);

		if (isBooleanTrue(params.showHelper)) {
			const group = new Group();
			group.add(light);
			group.add(this._createHelper(light));
			return this.createCoreGroupFromObjects([group]);
		} else {
			return this.createCoreGroupFromObjects([light]);
		}
	}

	createLight() {
		const light = new RectAreaLight(0xffffff, 1, 1, 1);
		light.matrixAutoUpdate = false;

		if (!(RectAreaLightUniformsLib as any).initialized) {
			RectAreaLightUniformsLib.init();
			(RectAreaLightUniformsLib as any).initialized = true;
		}

		return light;
	}
	updateLightParams(light: RectAreaLight, params: AreaLightParams) {
		light.color = params.color;
		light.intensity = params.intensity;
		light.width = params.width;
		light.height = params.height;

		// this._helperController.update();
	}

	private _createHelper(light: RectAreaLight) {
		const helper = new CoreRectAreaLightHelper(light);
		helper.update();
		return helper;
	}
}
