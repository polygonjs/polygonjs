export var NodeContext;
(function(NodeContext2) {
  NodeContext2["ANIM"] = "anim";
  NodeContext2["COP"] = "cop";
  NodeContext2["EVENT"] = "event";
  NodeContext2["GL"] = "gl";
  NodeContext2["JS"] = "js";
  NodeContext2["MANAGER"] = "manager";
  NodeContext2["MAT"] = "mat";
  NodeContext2["OBJ"] = "obj";
  NodeContext2["POST"] = "post";
  NodeContext2["ROP"] = "rop";
  NodeContext2["SOP"] = "sop";
})(NodeContext || (NodeContext = {}));
export var NetworkNodeType;
(function(NetworkNodeType2) {
  NetworkNodeType2["ANIM"] = "animations";
  NetworkNodeType2["COP"] = "cop";
  NetworkNodeType2["EVENT"] = "events";
  NetworkNodeType2["MAT"] = "materials";
  NetworkNodeType2["POST"] = "post_process";
  NetworkNodeType2["ROP"] = "renderers";
})(NetworkNodeType || (NetworkNodeType = {}));
export var NetworkChildNodeType;
(function(NetworkChildNodeType2) {
  NetworkChildNodeType2["INPUT"] = "subnet_input";
  NetworkChildNodeType2["OUTPUT"] = "subnet_output";
})(NetworkChildNodeType || (NetworkChildNodeType = {}));
export var CameraNodeType;
(function(CameraNodeType2) {
  CameraNodeType2["PERSPECTIVE"] = "perspective_camera";
  CameraNodeType2["ORTHOGRAPHIC"] = "orthographic_camera";
  CameraNodeType2["MAPBOX"] = "mapbox_camera";
})(CameraNodeType || (CameraNodeType = {}));
export var GlNodeType;
(function(GlNodeType2) {
  GlNodeType2["ATTRIBUTE"] = "attribute";
})(GlNodeType || (GlNodeType = {}));
export var CameraControlsNodeType;
(function(CameraControlsNodeType2) {
  CameraControlsNodeType2["DEVICE_ORIENTATION"] = "camera_device_orientation_controls";
  CameraControlsNodeType2["MAP"] = "camera_map_controls";
  CameraControlsNodeType2["ORBIT"] = "camera_orbit_controls";
})(CameraControlsNodeType || (CameraControlsNodeType = {}));
export const CAMERA_CONTROLS_NODE_TYPES = [
  CameraControlsNodeType.DEVICE_ORIENTATION,
  CameraControlsNodeType.MAP,
  CameraControlsNodeType.ORBIT
];
