export class TranspiledFilter {
  static filter(transpiled_javascript) {
    const lines = transpiled_javascript.split("\n");
    const filtered_lines = [];
    for (let line of lines) {
      if (!line.match(/import {.*} from '.*'/)) {
        line = line.replace("export ", "return ");
        filtered_lines.push(line);
      }
    }
    return filtered_lines.join("\n");
  }
}
