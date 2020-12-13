var Type;
(function(Type2) {
  Type2["BOOLEAN"] = "boolean";
  Type2["BUTTON"] = "button";
})(Type || (Type = {}));
const convert_boolean = function(value) {
  return value ? 1 : 0;
};
const convert_button = function(value) {
  return value;
};
const ConvertMap = {
  [Type.BOOLEAN]: convert_boolean,
  [Type.BUTTON]: convert_button
};
export class ParamsValueToDefaultConverter {
  static convert(type, value) {
    const method = ConvertMap[type];
    return method(value);
  }
}
ParamsValueToDefaultConverter.convert(Type.BOOLEAN, false);
ParamsValueToDefaultConverter.convert(Type.BUTTON, null);
