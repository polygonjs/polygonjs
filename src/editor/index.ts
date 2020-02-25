import {Editor} from './Editor';
import scene_data from 'src/../public/examples/scenes/default_simple.json';
import {SceneJsonExporterData} from 'src/engine/io/json/export/Scene';
import {CoreString} from '../core/String';

var url_params = new URLSearchParams(window.location.search);
const props = {
	current_node: url_params.get('current_node') || undefined,
	perf: url_params.has('perf') ? CoreString.to_boolean(url_params.get('perf') || '') : undefined,
};

Editor.load_scene('#app', scene_data as SceneJsonExporterData, props);
Editor.on_save((json) => {
	console.log(JSON.stringify(json));
});
