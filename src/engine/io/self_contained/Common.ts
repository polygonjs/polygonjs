import {ModuleName} from '../../poly/registers/modules/Common';

export enum SelfContainedFileName {
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
