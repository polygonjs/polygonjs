import {NodeJSONShadersData, NodeJSONFunctionBodiesData} from './../../json/export/Node';
import {sanitizeUrl} from '../../../../core/UrlHelper';
import {PolyDictionary} from '../../../../types/GlobalTypes';
import {PolyEventsDispatcher} from '../../common/EventsDispatcher';
import {PROGRESS_RATIO} from '../../common/Progress';
import {NodeJsonExporterData, NodeJsonExporterUIData} from '../../json/export/Node';
import {SceneJsonExporterData, SceneJsonExporterDataProperties} from '../../json/export/Scene';
import {SelfContainedFileName} from '../../self_contained/Common';

export type ManifestNodesData = PolyDictionary<string>;
export type NodeJSONShadersTimestampData = PolyDictionary<PolyDictionary<string>>;
export type JsFunctionBodyDataTimestampData = PolyDictionary<string>;
export interface ManifestContent {
	properties: string;
	root: string;
	nodes: ManifestNodesData;
	shaders: NodeJSONShadersTimestampData;
	jsFunctionBodies: JsFunctionBodyDataTimestampData;
}

type ProgressCallback = (ratio: number) => void;
interface ImportData {
	sceneName?: string;
	urlPrefix?: string;
	manifest: ManifestContent;
	editorMode?: boolean;
	onProgress?: ProgressCallback;
}

export interface SceneDataElements {
	root: NodeJsonExporterData;
	properties: SceneJsonExporterDataProperties;
	ui?: NodeJsonExporterUIData;
	shaders?: NodeJSONShadersData;
	jsFunctionBodies?: NodeJSONFunctionBodiesData;
}

interface ShaderUrlOptionsBasic {
	nodePath: string;
	shaderName: string;
	timestamp: string;
}
interface JsFunctionBodyUrlOptionsBasic {
	nodePath: string;
	timestamp: string;
}
interface ShaderUrlOptions extends ShaderUrlOptionsBasic {
	urlPrefix: string;
}
interface JsFunctionBodyUrlOptions extends JsFunctionBodyUrlOptionsBasic {
	urlPrefix: string;
}
function _shaderUrl(options: ShaderUrlOptions) {
	const {urlPrefix, nodePath, shaderName, timestamp} = options;
	return `${urlPrefix}/root/${nodePath}.${shaderName}.glsl?t=${timestamp}`;
}
function _jsFunctionBodyUrl(options: JsFunctionBodyUrlOptions) {
	const {urlPrefix, nodePath, timestamp} = options;
	return `${urlPrefix}/root/${nodePath}.txt?t=${timestamp}`;
}
function _iterateShaders(manifest: ManifestContent, callback: (options: ShaderUrlOptionsBasic) => void) {
	const shaderNodePaths = Object.keys(manifest.shaders);
	for (let nodePath of shaderNodePaths) {
		const nodeShaders = manifest.shaders[nodePath];
		const nodeShaderNames = Object.keys(nodeShaders);
		for (let shaderName of nodeShaderNames) {
			const timestamp = nodeShaders[shaderName];
			callback({nodePath, shaderName, timestamp});
		}
	}
}
function _iterateFunctionBodies(manifest: ManifestContent, callback: (options: JsFunctionBodyUrlOptionsBasic) => void) {
	const nodePaths = Object.keys(manifest.jsFunctionBodies);
	for (let nodePath of nodePaths) {
		const timestamp = manifest.jsFunctionBodies[nodePath];
		callback({nodePath, timestamp});
	}
}

export class SceneDataManifestImporter {
	static async importSceneData(importData: ImportData): Promise<SceneJsonExporterData> {
		if (importData.editorMode == null) {
			importData.editorMode = false;
		}
		const manifest = importData.manifest;
		const urlPrefix = importData.urlPrefix || SelfContainedFileName.CODE_PREFIX;
		const nodePaths = Object.keys(manifest.nodes);
		const nodeUrls: string[] = [];
		for (let node_path of nodePaths) {
			const timestamp = manifest.nodes[node_path];
			const url = `${urlPrefix}/root/${node_path}.json?t=${timestamp}`;
			nodeUrls.push(url);
		}
		const root_url = `${urlPrefix}/root.json?t=${manifest.root}`;
		const properties_url = `${urlPrefix}/properties.json?t=${manifest.properties}`;
		const allUrls = [root_url, properties_url];

		// add editor urls if needed
		if (importData.editorMode) {
			const now = Date.now();
			allUrls.push(`${urlPrefix}/ui.json?t=${now}`);
			//all_urls.push(`${url_prefix}/editor.json?t=${now}`);
		}

		// add all nodes
		for (let nodeUrl of nodeUrls) {
			allUrls.push(nodeUrl);
		}
		// add all shaders
		const shaderUrls: string[] = [];
		_iterateShaders(manifest, (options) => {
			const shaderUrl = _shaderUrl({urlPrefix, ...options});
			allUrls.push(shaderUrl);
			shaderUrls.push(shaderUrl);
		});
		// add all function bodies
		const jsFunctionBodiesUrls: string[] = [];
		_iterateFunctionBodies(manifest, (options) => {
			const jsFunctionBodyUrl = _jsFunctionBodyUrl({urlPrefix, ...options});
			allUrls.push(jsFunctionBodyUrl);
			jsFunctionBodiesUrls.push(jsFunctionBodyUrl);
		});

		let count = 0;
		const jsonPayloadsCount = allUrls.length - (shaderUrls.length + jsFunctionBodiesUrls.length);
		const total = allUrls.length;

		function _incrementCount() {
			count++;
			const ratio = count / total;
			const progressRatio = PROGRESS_RATIO.sceneData;
			const progress = progressRatio.start + progressRatio.mult * ratio;
			if (importData.onProgress) {
				importData.onProgress(progress);
			}
			PolyEventsDispatcher.dispatchProgressEvent(progress, importData.sceneName);
		}

		const sanitizedUrls = allUrls.map((url) => sanitizeUrl(url));
		const promises = sanitizedUrls.map((url) => fetch(url));
		const responses = await Promise.all(promises);
		const jsonResponses = responses.slice(0, jsonPayloadsCount);
		const textResponses = responses.slice(jsonPayloadsCount);
		const results = await Promise.all([
			...jsonResponses.map((response) => {
				_incrementCount();
				return response.json();
			}),
			...textResponses.map((response) => {
				_incrementCount();
				return response.text();
			}),
		]);
		const jsons = results.slice(0, jsonPayloadsCount);
		const texts = results.slice(jsonPayloadsCount);
		let textIndex = 0;
		const shadersData: NodeJSONShadersData = {};
		_iterateShaders(manifest, (options) => {
			const text = texts[textIndex];
			const {nodePath, shaderName} = options;
			shadersData[nodePath] = shadersData[nodePath] || {};
			shadersData[nodePath][shaderName] = text;
			textIndex++;
		});
		const jsFunctionBodiesData: NodeJSONFunctionBodiesData = {};
		_iterateFunctionBodies(manifest, (options) => {
			const text = texts[textIndex];
			const {nodePath} = options;
			jsFunctionBodiesData[nodePath] = text;
			textIndex++;
		});

		const assembleData: SceneDataElements = {
			root: jsons[0],
			properties: jsons[1],
			shaders: shadersData,
			jsFunctionBodies: jsFunctionBodiesData,
		};
		let responseOffset = 2;
		if (importData.editorMode) {
			assembleData['ui'] = jsons[2];
			responseOffset += 1;
		}

		const jsonByName: PolyDictionary<object> = {};
		const manifestNodes = Object.keys(manifest.nodes);
		for (let i = 0; i < manifestNodes.length; i++) {
			const manifestName = manifestNodes[i];
			const json = jsons[i + responseOffset];
			jsonByName[manifestName] = json;
		}

		return this.assemble(assembleData, manifestNodes, jsonByName);
	}

	static async assemble(
		assembleData: SceneDataElements,
		manifestNodes: string[],
		jsonByName: PolyDictionary<object>
	) {
		const sceneData: SceneJsonExporterData = {
			root: assembleData.root,
			properties: assembleData.properties,
			ui: assembleData.ui,
			shaders: assembleData.shaders,
		};

		for (let i = 0; i < manifestNodes.length; i++) {
			const manifestName = manifestNodes[i];
			const json = jsonByName[manifestName];
			this._insertChildData(sceneData.root, manifestName, json);
		}
		return sceneData;
	}

	private static _insertChildData(data: any, path: string, json: object) {
		const elements = path.split('/');
		if (elements.length == 1) {
			if (!data.nodes) {
				data.nodes = {};
			}
			data.nodes[path] = json;
		} else {
			const parentName: string = elements.shift() as string;
			const pathWithoutParent: string = elements.join('/');
			const parentData = data.nodes[parentName];
			this._insertChildData(parentData, pathWithoutParent, json);
		}
	}
}
