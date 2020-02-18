import {Editor} from './Editor';
import scene_data from 'src/../public/examples/scenes/default_simple.json';
import {SceneJsonExporterData} from 'src/engine/io/json/export/Scene';

Editor.load_scene('#app', scene_data as SceneJsonExporterData);
Editor.on_save((json) => {
	console.log(JSON.stringify(json));
});
