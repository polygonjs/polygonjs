import {ModuleName} from '../../poly/registers/modules/Common';

export enum SelfContainedFileName {
	EXPORT_MANIFEST = 'scene/export_manifest.json',
	// SCENE_MANIFEST = 'scene/scene_manifest.json',
	CODE_PREFIX = 'scene/code',
	PROPERTIES = 'scene/code/properties.json',
	EDITOR = 'scene/editor.json',
	ASSETS = 'scene/assets.json',
	POLYGONJS = 'js/all.js',
	POLY_CONFIG = 'js/polyConfig.js',
	JS_FILES = 'scene/js_files.json',
	POSTER = 'images/poster.png',
}
export type JsFilesManifest = {
	modules: ModuleName[];
};
export interface SelfContainedManifestContent {
	source: string;
	useConfigureScene: boolean;
	version: {
		polygonjs: string;
		editor: string;
	};
}
