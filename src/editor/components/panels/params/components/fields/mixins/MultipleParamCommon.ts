import {StoreController} from 'src/editor/store/controllers/StoreController';
import {EngineParamData} from 'src/editor/store/modules/Engine';

import {computed} from '@vue/composition-api';
export function SetupMultipleParamCommon(json_param: EngineParamData) {
	const json_components = computed(() => {
		return json_param.components?.map((id) => StoreController.engine.json_param(id)) || [];
	});

	const cell_class_object = computed(() => {
		const columns_count_per_components = 12 / json_components.value.length;
		const class_name = `small-${columns_count_per_components}`;
		return {
			[class_name]: true,
		};
	});

	return {
		json_components,
		cell_class_object,
	};
}
