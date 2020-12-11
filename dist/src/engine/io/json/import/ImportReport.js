export class ImportReport {
  constructor(_scene_importer) {
    this._warnings = [];
  }
  get warnings() {
    return this._warnings;
  }
  reset() {
    this._warnings = [];
  }
  add_warning(message) {
    this._warnings.push(message);
  }
}
