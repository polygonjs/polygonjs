const PLAYER_BASE_URLS = ["root", "properties"];
const EDITOR_BASE_URLS = PLAYER_BASE_URLS.concat(["ui", "editor"]);
export class SceneDataManifestImporter {
  static async import_scene_data(import_data) {
    if (import_data.editor_mode == null) {
      import_data.editor_mode = false;
    }
    const base_urls = import_data.editor_mode ? EDITOR_BASE_URLS : PLAYER_BASE_URLS;
    const {manifest, url_prefix} = import_data;
    const manifest_urls = manifest.nodes.map((url) => `${url_prefix}/root/${url}`);
    const full_urls = base_urls.map((url) => `${url_prefix}/${url}`);
    const scene_asset_urls = full_urls.concat(manifest_urls);
    const promises = scene_asset_urls.map((url) => fetch(`${url}.json?t=${manifest.timestamp}`));
    const responses = await Promise.all(promises);
    const jsons = [];
    for (let response of responses) {
      jsons.push(await response.json());
    }
    const assemble_data = {
      root: jsons[0],
      properties: jsons[1]
    };
    let response_offset = 2;
    if (import_data.editor_mode) {
      assemble_data["ui"] = jsons[2];
      response_offset += 1;
    }
    const json_by_name = {};
    const manifest_nodes = manifest.nodes;
    for (let i = 0; i < manifest_nodes.length; i++) {
      const manifest_name = manifest_nodes[i];
      const json = jsons[i + response_offset];
      json_by_name[manifest_name] = json;
    }
    return this.assemble(assemble_data, manifest_nodes, json_by_name);
  }
  static async assemble(assemble_data, manifest_nodes, json_by_name) {
    const scene_data = {
      root: assemble_data.root,
      properties: assemble_data.properties,
      ui: assemble_data.ui
    };
    for (let i = 0; i < manifest_nodes.length; i++) {
      const manifest_name = manifest_nodes[i];
      const json = json_by_name[manifest_name];
      this.insert_child_data(scene_data.root, manifest_name, json);
    }
    return scene_data;
  }
  static insert_child_data(data, path, json) {
    const elements = path.split("/");
    if (elements.length == 1) {
      if (!data.nodes) {
        data.nodes = {};
      }
      data.nodes[path] = json;
    } else {
      const parent_name = elements.shift();
      const path_without_parent = elements.join("/");
      const parent_data = data.nodes[parent_name];
      this.insert_child_data(parent_data, path_without_parent, json);
    }
  }
}
