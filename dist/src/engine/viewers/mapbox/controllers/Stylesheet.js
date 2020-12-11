import {CoreMapboxClient} from "../../../../core/mapbox/Client";
import {CoreStylesheetLoader} from "../../../../core/loader/Stylesheet";
export class MapboxViewerStylesheetController {
  static load() {
    CoreStylesheetLoader.load_url(CoreMapboxClient.CSS_URL);
  }
}
