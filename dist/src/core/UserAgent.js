export class CoreUserAgent {
  static is_chrome() {
    return navigator.userAgent.indexOf("Chrome") != -1;
  }
}
