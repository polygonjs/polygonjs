import {Group as Group2} from "three/src/objects/Group";
const DISPLAY_PARAM_NAME = "display";
export class ChildrenDisplayController {
  constructor(node) {
    this.node = node;
    this._children_uuids_dict = {};
    this._children_length = 0;
    this._sop_group = this._create_sop_group();
  }
  _create_sop_group() {
    const group = new Group2();
    group.matrixAutoUpdate = false;
    return group;
  }
  get sop_group() {
    return this._sop_group;
  }
  set_sop_group_name() {
    this._sop_group.name = `${this.node.name}:sop_group`;
  }
  display_node_controller_callbacks() {
    return {
      on_display_node_remove: () => {
        this.remove_children();
      },
      on_display_node_set: () => {
        setTimeout(() => {
          this.request_display_node_container();
        }, 0);
      },
      on_display_node_update: () => {
        this.request_display_node_container();
      }
    };
  }
  initialize_node() {
    this.node.object.add(this.sop_group);
    this.node.name_controller.add_post_set_full_path_hook(this.set_sop_group_name.bind(this));
    this._create_sop_group();
    const display_flag = this.node.flags?.display;
    if (display_flag) {
      display_flag.add_hook(() => {
        this._sop_group.visible = this.used_in_scene;
        if (display_flag.active) {
          this.request_display_node_container();
        }
      });
    }
  }
  get used_in_scene() {
    const has_active_param = this.node.params.has(DISPLAY_PARAM_NAME);
    const is_active_param_on = this.node.params.boolean(DISPLAY_PARAM_NAME);
    const used_in_scene = this.node.used_in_scene;
    const display_flag_on = this.node.flags?.display?.active || false;
    const param_active_on = !has_active_param || is_active_param_on;
    return used_in_scene && display_flag_on && param_active_on;
  }
  async request_display_node_container() {
    if (!this.node.scene.loading_controller.loaded) {
      return;
    }
    if (this.used_in_scene) {
      await this._set_content_under_sop_group();
    }
  }
  remove_children() {
    if (this._sop_group.children.length == 0) {
      return;
    }
    let child;
    while (child = this._sop_group.children[0]) {
      this._sop_group.remove(child);
    }
    this._children_uuids_dict = {};
    this._children_length = 0;
  }
  async _set_content_under_sop_group() {
    const display_node = this.node.display_node_controller.display_node;
    if (display_node && display_node.parent?.graph_node_id == this.node.graph_node_id) {
      const container = await display_node.request_container();
      const core_group = container.core_content();
      if (core_group) {
        const new_objects = core_group.objects();
        let new_objects_are_different = new_objects.length != this._children_length;
        if (!new_objects_are_different) {
          for (let object of new_objects) {
            if (!(object.uuid in this._children_uuids_dict)) {
              new_objects_are_different = true;
            }
          }
        }
        if (new_objects_are_different) {
          this.remove_children();
          for (let object of new_objects) {
            this._sop_group.add(object);
            this._children_uuids_dict[object.uuid] = true;
          }
          this._children_length = new_objects.length;
        }
      } else {
        this.remove_children();
      }
    } else {
      this.remove_children();
    }
  }
}
