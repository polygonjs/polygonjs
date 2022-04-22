import {
	LinearFilter,
	NearestFilter,
	NearestMipMapNearestFilter,
	NearestMipMapLinearFilter,
	LinearMipMapNearestFilter,
	LinearMipMapLinearFilter,
} from 'three';
import {PolyDictionary} from '../../types/GlobalTypes';

export const MAG_FILTERS: PolyDictionary<number>[] = [{LinearFilter}, {NearestFilter}];
export const MIN_FILTERS: PolyDictionary<number>[] = [
	{NearestFilter},
	{NearestMipMapNearestFilter},
	{NearestMipMapLinearFilter},
	{LinearFilter},
	{LinearMipMapNearestFilter},
	{LinearMipMapLinearFilter},
];
export const MAG_FILTER_DEFAULT_VALUE = Object.values(MAG_FILTERS[0])[0];
export const MIN_FILTER_DEFAULT_VALUE = Object.values(MIN_FILTERS[5])[0];
export const MAG_FILTER_MENU_ENTRIES = MAG_FILTERS.map((m) => {
	return {
		name: Object.keys(m)[0],
		value: Object.values(m)[0] as number,
	};
});
export const MIN_FILTER_MENU_ENTRIES = MIN_FILTERS.map((m) => {
	return {
		name: Object.keys(m)[0],
		value: Object.values(m)[0] as number,
	};
});
