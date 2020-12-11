import mapboxgl from "mapbox-gl";
export class CoreMapboxClient {
  static ensure_token_is_set() {
    if (!mapboxgl.accessToken) {
      this.fetch_token();
    }
  }
  static token() {
    if (!this._token) {
      this.fetch_token();
    }
    return this._token;
  }
  static set_token(token) {
    this._token = token;
    mapboxgl.accessToken = this._token;
  }
  static fetch_token() {
    if (this._token) {
      return this._token;
    } else {
      let token = this._read_token_from_html();
      if (token) {
        this.set_token(token);
        return;
      }
    }
  }
  static _read_token_from_html() {
    const integrations_element = document.getElementById("integrations-data");
    if (!integrations_element) {
      console.error("mapbox element not found");
    }
    return integrations_element?.dataset["mapboxToken"];
  }
  static integration_data() {
    const token = this._read_token_from_html();
    if (token) {
      return {
        name: "mapbox",
        data: {token}
      };
    }
  }
}
CoreMapboxClient.CSS_URL = "https://api.mapbox.com/mapbox-gl-js/v1.9.1/mapbox-gl.css";
