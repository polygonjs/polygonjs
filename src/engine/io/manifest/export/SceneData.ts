import {PolyScene} from '../../../scene/PolyScene';
import {ManifestContent} from '../import/SceneData';
import {NodeJsonExporterData} from '../../json/export/Node';
import {SceneJsonExporter, SceneJsonExporterDataProperties} from '../../json/export/Scene';
import {PolyDictionary} from '../../../../types/GlobalTypes';

interface SceneDataManifestExporterData {
	properties: SceneJsonExporterDataProperties;
	root: NodeJsonExporterData;
	nodes: PolyDictionary<NodeJsonExporterData>;
}

export interface ChildDataContainer {
	childName: string;
	childData: NodeJsonExporterData;
	nodeFullPath: string;
}

interface SaveNodeDataOptions {
	nodeName: string;
	nodeData: NodeJsonExporterData;
	parentFullPath?: string;
	now: string;
}

export class SceneDataManifestExporter {
	private _manifestContent: ManifestContent = {
		properties: '',
		root: '',
		nodes: {},
		shaders: {},
	};
	private _data: SceneDataManifestExporterData = {
		properties: {
			frame: 0,
			maxFrame: 100,
			maxFrameLocked: false,
			realtimeState: true,
			mainCameraNodePath: '/',
		},
		root: {type: 'root'},
		nodes: {},
	};
	constructor(public readonly scene: PolyScene) {}

	data() {
		const now = `${Date.now()}`;
		this._manifestContent = {
			properties: now,
			root: now,
			nodes: {},
			shaders: {},
		};

		const exporter = new SceneJsonExporter(this.scene);
		const sceneData = exporter.data({polygonjs: 'ENGINE_VERSION'});

		this._data = {
			properties: sceneData.properties!,
			root: {type: 'root'},
			nodes: {},
		};

		const rootData = sceneData.root;
		if (rootData) {
			this._saveNodeData({
				nodeName: 'root',
				nodeData: rootData,
				// parentFullPath: '',
				now: now,
			});
		}

		// check if root is present in nodes
		const rootInNode = this._data.nodes['root'];
		if (rootInNode) {
			throw 'root should not be in node';
		}

		return {sceneData: this._data, manifest: this._manifestContent};
	}

	private _saveNodeData(options: SaveNodeDataOptions) {
		const {nodeName, nodeData, parentFullPath, now} = options;

		const nodeFullPath = parentFullPath ? `${parentFullPath}/${nodeName}` : nodeName;
		// we remove the prefix 'root/' if needed
		const manifestPath = parentFullPath ? nodeFullPath.substring(5) : nodeFullPath;
		// const manifestPath = nodeFullPath;

		const children = nodeData.nodes;
		if (!children) {
			return;
		}
		const childrenDataToWriteSeparately: ChildDataContainer[] = [];
		const childrenNames = Object.keys(children);
		for (let childName of childrenNames) {
			const childData = children[childName];
			// if the child has itself children, it should end up in a separate file
			if (childData.nodes) {
				delete children[childName];
				childrenDataToWriteSeparately.push({
					childName,
					childData,
					nodeFullPath,
				});
			}
		}

		// compare with previously existing data and update node timestamp if required
		// let timestamp: string = `${Date.now()}`; //this._save_timestamp;
		// const manifest_content = main_controller.manifest.content();
		// if (manifest_content) {
		// 	const old_timestamp = manifest_content.nodes[manifest_path];
		// 	const data_changed = this._scene_data_cache.has_data_for_node_changed(manifest_path, node_data);
		// 	if (!data_changed) {
		// 		timestamp = old_timestamp;
		// 	}
		// }

		// write data
		if (parentFullPath) {
			this._manifestContent.nodes[manifestPath] = now;
			this._data.nodes[`${nodeFullPath}.json`] = nodeData;
		} else {
			this._data.root = nodeData;
		}
		// main_controller.file_writer.write_scene_data({file: node_full_path, content: node_data});
		// if (parent_full_path != '') {
		// 	this._manifest_nodes_data[manifest_path] = timestamp;
		// }
		for (let childDataContainer of childrenDataToWriteSeparately) {
			const {childName, childData, nodeFullPath} = childDataContainer;
			this._saveNodeData({
				nodeName: childName,
				nodeData: childData,
				parentFullPath: nodeFullPath,
				now: now,
			});
		}
	}
}
