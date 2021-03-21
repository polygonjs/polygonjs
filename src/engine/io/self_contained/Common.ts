import {ModuleName} from '../../poly/registers/modules/Common';

export enum SelfContainedFileName {
	CODE = 'code.json',
	EDITOR = 'editor.json',
	ASSETS = 'assets.json',
	POLYGONJS = 'js/all.js',
	JS_FILES = 'js_files.json',
}
export type JsFilesManifest = {
	modules: ModuleName[];
};
