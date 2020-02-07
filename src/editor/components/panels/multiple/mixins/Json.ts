import {MultiplePanelProps} from 'src/editor/components/types/props';
import {onBeforeMount} from '@vue/composition-api';

import {ISetupMultiplePanelPanels} from './Panels';

export function SetupMultiplePanelJson(
	props: MultiplePanelProps,
	PanelsMixin: ISetupMultiplePanelPanels
	// image_element_ref: Ref<HTMLElement>,
	// {emit},
) {
	onBeforeMount(() => {
		// from_json(props)
	});

	function on_component_created() {
		update_component_from_json();
	}
	function update_component_from_json() {
		// let panel_json;
		// if ((panel_json = this._from_json['panel']) != null) {
		// 	if (this.$refs.current_panel != null) {
		// 		// might not exist for dynamic components
		// 		this.$refs.current_panel.from_json(panel_json);
		// 	}
		// }
	}

	return {
		on_component_created,
	};
}

// export default component = {
// 	props: {
// 		init_properties: {
// 			type: Object,
// 			default() {
// 				return {};
// 			},
// 		},
// 	},

// 	created() {
// 		return this.from_json(this.init_properties);
// 	},

// 	methods: {
// 		on_component_created() {
// 			return this.update_component_from_json();
// 		},

// 		update_component_from_json() {
// 			let panel_json;
// 			if ((panel_json = this._from_json['panel']) != null) {
// 				if (this.$refs.current_panel != null) {
// 					// might not exist for dynamic components
// 					return this.$refs.current_panel.from_json(panel_json);
// 				}
// 			}
// 		},

// 		from_json(json) {
// 			let current_panel_index, panel_types;
// 			this.split_mode = json['split_mode'];
// 			if (this.split_mode != null) {
// 				let split_panel_init_properties;
// 				if ((split_panel_init_properties = json['split_panels']) != null) {
// 					this.split_panel_init_properties = split_panel_init_properties;
// 				}
// 			}

// 			this.split_ratio = json['split_ratio'] || 0.5;

// 			if ((current_panel_index = json['current_panel_index']) != null) {
// 				this.current_panel_index = current_panel_index;
// 			}

// 			if ((panel_types = json['panel_types']) != null) {
// 				this.set_panel_types_from_json(panel_types);
// 			}
// 			// @panel_types = panel_types

// 			return this.$nextTick(() => {
// 				this._from_json = json;
// 				return this.update_component_from_json();
// 			});
// 		},

// 		to_json() {
// 			if (this.is_split) {
// 				return {
// 					split_mode: this.split_mode,
// 					split_ratio: this.split_ratio,
// 					split_panels: [this.$refs.split_panel0.to_json(), this.$refs.split_panel1.to_json()],
// 				};
// 			} else {
// 				return this.to_json_unsplit();
// 			}
// 		},

// 		to_json_unsplit() {
// 			return {
// 				panel_types: this.panel_types,
// 				current_panel_index: this.current_panel_index,
// 				panel: this.$refs.current_panel.to_json(),
// 			};
// 		},
// 	},
// };
