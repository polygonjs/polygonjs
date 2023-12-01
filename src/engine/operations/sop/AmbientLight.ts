import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {AmbientLight} from 'three';
import {AmbientLightParams, DEFAULT_AMBIENT_LIGHT_PARAMS} from '../../../core/lights/AmbientLight';
import {ObjectType, registerObjectType} from '../../../core/geometry/Constant';

export class AmbientLightSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: AmbientLightParams = DEFAULT_AMBIENT_LIGHT_PARAMS;
	static override readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static override type(): Readonly<'ambientLight'> {
		return 'ambientLight';
	}
	override cook(_: CoreGroup[], params: AmbientLightParams) {
		const light = this.createLight();
		light.name = params.name;

		this.updateLightParams(light, params);
		return this.createCoreGroupFromObjects([light]);
	}

	createLight() {
		registerObjectType({
			type: ObjectType.AMBIENT_LIGHT,
			checkFunc: (o) => {
				if ((o as AmbientLight).isAmbientLight) {
					return ObjectType.AMBIENT_LIGHT;
				}
			},
			ctor: AmbientLight,
			humanName: 'AmbientLight',
		});
		const light = new AmbientLight();
		light.matrixAutoUpdate = false;
		light.name = `AmbientLight_${this._node?.name() || ''}`;
		return light;
	}
	updateLightParams(light: AmbientLight, params: AmbientLightParams) {
		light.color.copy(params.color);
		light.intensity = params.intensity;
	}
}
