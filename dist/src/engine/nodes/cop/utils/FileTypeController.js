const VIDEO_EXTENSIONS = ["mp4", "ogv"];
export class CopFileTypeController {
  static is_static_image_url(url) {
    const url_without_query_params = url.split("?")[0];
    const url_elements = url_without_query_params.split(".");
    const ext = url_elements[url_elements.length - 1];
    return !VIDEO_EXTENSIONS.includes(ext);
  }
}
