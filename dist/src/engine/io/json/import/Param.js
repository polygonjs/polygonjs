export class ParamJsonImporter {
  constructor(_param) {
    this._param = _param;
  }
  process_data(data) {
    const raw_input = data["raw_input"];
    if (raw_input !== void 0) {
      this._param.set(raw_input);
    }
    this.add_main(data);
  }
  add_main(data) {
  }
  static spare_params_data(params_data) {
    return this.params_data(true, params_data);
  }
  static non_spare_params_data_value(params_data) {
    return this.params_data_value(false, params_data);
  }
  static params_data(spare, params_data) {
    let non_spare_params_data;
    if (params_data) {
      non_spare_params_data = {};
      const param_names = Object.keys(params_data);
      let param_data;
      for (let param_name of param_names) {
        param_data = params_data[param_name];
        if (param_data) {
          non_spare_params_data[param_name] = params_data;
        }
      }
    }
    return non_spare_params_data;
  }
  static params_data_value(spare, params_data) {
    let non_spare_params_data;
    if (params_data) {
      non_spare_params_data = {};
      const param_names = Object.keys(params_data);
      let param_data;
      for (let param_name of param_names) {
        param_data = params_data[param_name];
        if (param_data != null) {
          const options = param_data.options;
          const overriden_options = param_data.overriden_options;
          if (options || overriden_options) {
            const complex_data = param_data;
            if (options && options.spare == spare) {
              if (complex_data.raw_input != null) {
                non_spare_params_data[param_name] = {complex_data};
              }
            } else {
              if (overriden_options) {
                non_spare_params_data[param_name] = {complex_data};
              }
            }
          } else {
            const simple_data = param_data;
            if (overriden_options || simple_data != null) {
              non_spare_params_data[param_name] = {
                simple_data
              };
            }
          }
        }
      }
    }
    return non_spare_params_data;
  }
}
