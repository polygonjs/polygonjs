export class CoreImage {
  static overlay(img0, img1) {
    return new Promise((resolve, reject) => {
      let canvas = document.createElement("canvas");
      canvas.width = Math.max(img0.width, img1.width);
      canvas.height = Math.max(img0.height, img1.height);
      let context = canvas.getContext("2d");
      context.drawImage(img0, 0, 0, img0.width, img0.height);
      context.drawImage(img1, 0, 0, img1.width, img1.height);
      const datauri = canvas.toDataURL("image/png");
      const img = new Image();
      img.onload = () => {
        resolve(img);
      };
      img.src = datauri;
    });
  }
  static create_white_image(width, height) {
    return new Promise((resolve, reject) => {
      let canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      let context = canvas.getContext("2d");
      context.beginPath();
      context.rect(0, 0, width, height);
      context.fillStyle = "white";
      context.fill();
      const datauri = canvas.toDataURL("image/png");
      const img = new Image();
      img.onload = () => {
        resolve(img);
      };
      img.src = datauri;
    });
  }
  static make_square(src_img) {
    return new Promise((resolve, reject) => {
      let canvas = document.createElement("canvas");
      const size = Math.min(src_img.width, src_img.height);
      const ratio = src_img.width / src_img.height;
      canvas.width = size;
      canvas.height = size;
      let context = canvas.getContext("2d");
      const is_landscape = ratio > 1;
      const margin = is_landscape ? (src_img.width - size) / 2 : (src_img.height - size) / 2;
      if (is_landscape) {
        context.drawImage(src_img, margin, 0, size, size, 0, 0, size, size);
      } else {
        context.drawImage(src_img, 0, margin, size, size, 0, 0, size, size);
      }
      const datauri = canvas.toDataURL("image/png");
      const img = new Image();
      img.onload = () => {
        resolve(img);
      };
      img.src = datauri;
    });
  }
  static async image_to_blob(img) {
    return new Promise(function(resolve, reject) {
      try {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", img.src);
        xhr.responseType = "blob";
        xhr.onerror = function() {
          reject("Network error.");
        };
        xhr.onload = function() {
          if (xhr.status === 200) {
            resolve(xhr.response);
          } else {
            reject("Loading error:" + xhr.statusText);
          }
        };
        xhr.send();
      } catch (err) {
        reject(err.message);
      }
    });
  }
  static data_from_url(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const data = this.data_from_image(img);
        resolve(data);
      };
      img.src = url;
    });
  }
  static data_from_image(img) {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const context = canvas.getContext("2d");
    context.drawImage(img, 0, 0, img.width, img.height);
    return context.getImageData(0, 0, img.width, img.height);
  }
}
