import {KernelSize} from 'postprocessing';
import {MenuNumericParamOptions} from '../../engine/params/utils/OptionsController';

export const KERNEL_SIZES: KernelSize[] = [
	KernelSize.VERY_SMALL,
	KernelSize.SMALL,
	KernelSize.MEDIUM,
	KernelSize.LARGE,
	KernelSize.VERY_LARGE,
	KernelSize.HUGE,
];
const KERNAL_NAME_BY_SIZE = {
	[KernelSize.VERY_SMALL]: 'VERY_SMALL',
	[KernelSize.SMALL]: 'SMALL',
	[KernelSize.MEDIUM]: 'MEDIUM',
	[KernelSize.LARGE]: 'LARGE',
	[KernelSize.VERY_LARGE]: 'VERY_LARGE',
	[KernelSize.HUGE]: 'HUGE',
};

export const KERNEL_SIZE_MENU_OPTIONS: MenuNumericParamOptions = {
	menu: {
		entries: KERNEL_SIZES.map((value) => {
			return {
				name: KERNAL_NAME_BY_SIZE[value],
				value,
			};
		}),
	},
};
