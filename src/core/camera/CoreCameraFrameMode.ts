import {ParamConfig} from '../../engine/nodes/utils/params/ParamsConfig';
import {Constructor} from '../../types/GlobalTypes';

export enum CameraFrameMode {
	DEFAULT = 'default',
	COVER = 'cover',
	CONTAIN = 'contain',
}
export const CAMERA_FRAME_MODES: CameraFrameMode[] = [
	CameraFrameMode.DEFAULT,
	CameraFrameMode.COVER,
	CameraFrameMode.CONTAIN,
];
export function CoreCameraFrameParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param fov adjust mode */
		frameMode = ParamConfig.INTEGER(CAMERA_FRAME_MODES.indexOf(CameraFrameMode.DEFAULT), {
			menu: {
				entries: CAMERA_FRAME_MODES.map((name, value) => {
					return {name, value};
				}),
			},
		});
		/** @param expected aspect ratio */
		expectedAspectRatio = ParamConfig.FLOAT('16/9', {
			visibleIf: [
				{frameMode: CAMERA_FRAME_MODES.indexOf(CameraFrameMode.COVER)},
				{frameMode: CAMERA_FRAME_MODES.indexOf(CameraFrameMode.CONTAIN)},
			],
			range: [0, 2],
			rangeLocked: [true, false],
		});
		// vertical_fov_range = ParamConfig.VECTOR2([0, 100], {visibleIf: {lock_width: 1}});
		// horizontal_fov_range = ParamConfig.VECTOR2([0, 100], {visibleIf: {lock_width: 0}});
	};
}
