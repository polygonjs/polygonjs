import {ModuleName} from '../../poly/registers/modules/Common';

export enum SelfContainedFileName {
	MANIFEST = 'manifest.json',
	CODE = 'code.json',
	EDITOR = 'editor.json',
	ASSETS = 'assets.json',
	POLYGONJS = 'js/all.js',
	POLY_CONFIG = 'js/polyConfig.js',
	JS_FILES = 'js_files.json',
	POSTER = 'poster.png',
}
export type JsFilesManifest = {
	modules: ModuleName[];
};
export interface SelfContainedManifestContent {
	source: string;
	version: {
		polygonjs: string;
		editor: string;
	};
}
