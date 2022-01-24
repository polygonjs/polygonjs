import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {Color} from 'three/src/math/Color';
import {Vector2} from 'three/src/math/Vector2';
import {PointLight} from 'three/src/lights/PointLight';
import {isBooleanTrue} from '../../../core/BooleanValue';

interface PointLightSopParams extends DefaultOperationParams {
	color: Color;
	intensity: number;
	decay: number;
	distance: number;
	castShadows: boolean;
	shadowRes: Vector2;
	shadowBias: number;
	shadowNear: number;
	shadowFar: number;
}

export class PointLightSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: PointLightSopParams = {
		color: new Color(1, 1, 1),
		intensity: 1,
		decay: 0.1,
		distance: 100,
		castShadows: false,
		shadowRes: new Vector2(1024, 1024),
		shadowBias: 0.001,
		shadowNear: 1,
		shadowFar: 100,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static override type(): Readonly<'pointLight'> {
		return 'pointLight';
	}
	override cook(input_contents: CoreGroup[], params: PointLightSopParams) {
		const light = new PointLight();
		light.matrixAutoUpdate = false;

		light.castShadow = true;
		light.shadow.bias = -0.001;
		light.shadow.mapSize.x = 1024;
		light.shadow.mapSize.y = 1024;
		light.shadow.camera.near = 0.1;

		light.color = params.color;
		light.intensity = params.intensity;
		light.decay = params.decay;
		light.distance = params.distance;

		light.castShadow = isBooleanTrue(params.castShadows);
		light.shadow.mapSize.copy(params.shadowRes);
		light.shadow.camera.near = params.shadowNear;
		light.shadow.camera.far = params.shadowFar;
		light.shadow.bias = params.shadowBias;

		return this.createCoreGroupFromObjects([light]);
	}
}
