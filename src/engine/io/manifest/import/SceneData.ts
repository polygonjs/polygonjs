import {PolyDictionary} from '../../../../types/GlobalTypes';
import {NodeJsonExporterData, NodeJsonExporterUIData} from '../../json/export/Node';
import {SceneJsonExporterData, SceneJsonExporterDataProperties} from '../../json/export/Scene';

export type ManifestNodesData = PolyDictionary<string>;
export interface ManifestContent {
	properties: string;
	root: string;
	nodes: ManifestNodesData;
}
interface ImportData {
	urlPrefix: string;
	manifest: ManifestContent;
	editor_mode?: boolean;
}

export interface SceneDataElements {
	root: NodeJsonExporterData;
	properties: SceneJsonExporterDataProperties;
	ui?: NodeJsonExporterUIData;
}

export class SceneDataManifestImporter {
	static async importSceneData(import_data: ImportData): Promise<SceneJsonExporterData> {
		if (import_data.editor_mode == null) {
			import_data.editor_mode = false;
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
		if (import_data.editor_mode) {
			const now = Date.now();
			all_urls.push(`${urlPrefix}/ui.json?t=${now}`);
			//all_urls.push(`${url_prefix}/editor.json?t=${now}`);
		}

		// add all nodes
		for (let node_url of node_urls) {
			all_urls.push(node_url);
		}

		const promises = all_urls.map((url) => fetch(url));
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
		if (import_data.editor_mode) {
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
