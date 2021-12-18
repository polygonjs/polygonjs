import {CoreType} from '../../../../core/Type';
import {PolyDictionary} from '../../../../types/GlobalTypes';
import {SceneJsonImporter} from '../../../io/json/import/Scene';
import {NodeJsonExporterData, NodeJsonExporterUIData} from '../../json/export/Node';
import {SceneJsonExporterData, SceneJsonExporterDataProperties} from '../../json/export/Scene';

export type ManifestNodesData = PolyDictionary<string>;
export interface ManifestContent {
	properties: string;
	root: string;
	nodes: ManifestNodesData;
}

export interface ProgressCallbackArgs {
	count: number;
	total: number;
}
type ProgressCallback = (args: ProgressCallbackArgs) => void;
interface ImportData {
	urlPrefix: string;
	manifest: ManifestContent;
	editorMode?: boolean;
	onProgress?: ProgressCallback;
}

export interface SceneDataElements {
	root: NodeJsonExporterData;
	properties: SceneJsonExporterDataProperties;
	ui?: NodeJsonExporterUIData;
}

export class SceneDataManifestImporter {
	static async importSceneData(import_data: ImportData): Promise<SceneJsonExporterData> {
		if (import_data.editorMode == null) {
			import_data.editorMode = false;
		}
		const {manifest, urlPrefix} = import_data;
		const node_paths = Object.keys(manifest.nodes);
		const node_urls: string[] = [];
		for (let node_path of node_paths) {
			const timestamp = manifest.nodes[node_path];
			const url = `${urlPrefix}/root/${node_path}.json?t=${timestamp}`;
			node_urls.push(url);
		}
		const root_url = `${urlPrefix}/root.json?t=${manifest.root}`;
		const properties_url = `${urlPrefix}/properties.json?t=${manifest.properties}`;
		const all_urls = [root_url, properties_url];

		// add editor urls if needed
		if (import_data.editorMode) {
			const now = Date.now();
			all_urls.push(`${urlPrefix}/ui.json?t=${now}`);
			//all_urls.push(`${url_prefix}/editor.json?t=${now}`);
		}

		// add all nodes
		for (let node_url of node_urls) {
			all_urls.push(node_url);
		}

		let count = 0;
		const total = all_urls.length;
		const promises = all_urls.map(async (url) => {
			const response = await fetch(url);
			if (import_data.onProgress) {
				count++;
				import_data.onProgress({count, total});
			}
			return response;
		});
		const responses = await Promise.all(promises);

		const jsons = [];
		for (let response of responses) {
			jsons.push(await response.json());
		}

		const assemble_data: SceneDataElements = {
			root: jsons[0],
			properties: jsons[1],
		};
		let response_offset = 2;
		if (import_data.editorMode) {
			assemble_data['ui'] = jsons[2];
			response_offset += 1;
		}

		const json_by_name: PolyDictionary<object> = {};
		const manifest_nodes = Object.keys(manifest.nodes);
		for (let i = 0; i < manifest_nodes.length; i++) {
			const manifest_name = manifest_nodes[i];
			const json = jsons[i + response_offset];
			json_by_name[manifest_name] = json;
		}

		return this.assemble(assemble_data, manifest_nodes, json_by_name);
	}

	static async assemble(
		assemble_data: SceneDataElements,
		manifest_nodes: string[],
		json_by_name: PolyDictionary<object>
	) {
		const scene_data: SceneJsonExporterData = {
			root: assemble_data.root,
			properties: assemble_data.properties,
			ui: assemble_data.ui,
		};

		for (let i = 0; i < manifest_nodes.length; i++) {
			const manifest_name = manifest_nodes[i];
			const json = json_by_name[manifest_name];
			this.insert_child_data(scene_data.root, manifest_name, json);
		}
		return scene_data;
	}

	private static insert_child_data(data: any, path: string, json: object) {
		const elements = path.split('/');
		if (elements.length == 1) {
			if (!data.nodes) {
				data.nodes = {};
			}
			data.nodes[path] = json;
		} else {
			const parent_name: string = elements.shift() as string;
			const path_without_parent: string = elements.join('/');
			const parent_data = data.nodes[parent_name];
			this.insert_child_data(parent_data, path_without_parent, json);
		}
	}
}

interface loadSceneData {
	sceneName: string;
	domElement: string | HTMLElement;
	scenesSrcRoot?: string;
	scenesDataRoot?: string;
}

export async function mountScene(data: loadSceneData) {
	const scenesSrcRoot = data.scenesSrcRoot || '/src/polygonjs/scenes';
	const scenesDataRoot = data.scenesSrcRoot || '/public/polygonjs/scenes';
	const sceneName = data.sceneName;

	async function loadManifest(): Promise<ManifestContent> {
		const response = await fetch(`${scenesSrcRoot}/${sceneName}/manifest.json`);
		const json = await response.json();
		return json;
	}

	async function loadSceneData(manifest: ManifestContent) {
		return await SceneDataManifestImporter.importSceneData({
			manifest: manifest,
			urlPrefix: `${scenesDataRoot}/${sceneName}`,
		});
	}

	async function loadScene(sceneData: SceneJsonExporterData) {
		const importer = new SceneJsonImporter(sceneData);
		const scene = await importer.scene();

		const cameraNode = scene.mainCameraNode();
		if (!cameraNode) {
			console.warn('no master camera found');
			return;
		}
		const element = CoreType.isString(data.domElement) ? document.getElementById(data.domElement) : data.domElement;
		if (!element) {
			console.warn('no element to mount the viewer onto');
			return;
		}
		const viewer = cameraNode.createViewer({element});

		return {scene, cameraNode, viewer};
	}

	const manifest = await loadManifest();
	const sceneData = await loadSceneData(manifest);
	return await loadScene(sceneData);
}
