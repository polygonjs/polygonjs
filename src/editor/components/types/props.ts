// importing scene to make it a module
import 'src/engine/scene/PolyScene';

export enum MultiplePanelSplitMode {
	HORIZONTAL = 'horizontal',
	VERTICAL = 'vertical',
}

type ViewerPanelInitProperties = object;
export interface PanelInitProperties {
	panel_types?: string[];
	current_panel_index?: number;
	split_mode?: MultiplePanelSplitMode;
	sub_panels_init_properties?: [PanelInitProperties, PanelInitProperties];
	viewer?: ViewerPanelInitProperties;
}

export interface MultiplePanelProps {
	init_properties: PanelInitProperties;
	level: number;
	panel_id: string;
	scene_update_allowed: boolean;
}

export interface DropDownMenuEntry {
	id: string;
	label?: string;
	disabled?: boolean;
	children?: DropDownMenuEntry[];
}
