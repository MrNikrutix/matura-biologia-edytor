import * as base64Img from 'base64-img';
import * as fs from 'fs';
const cp = require('child_process');

export class FileHelper {
  public static saveBase64ToImagePromise(data, path, filename) {
    return new Promise((resolve, reject) => {
      base64Img.img(data, path, filename, (err, filepath) => err ? reject(err) : resolve());
    });
  }

  public static deleteFilePromise(path) {
    return new Promise((resolve, reject) => {
      if(!path) resolve();
      if(!fs.existsSync(path)) {
        console.log('file does not exist: ' + path);
        resolve();
      } else {
        fs.unlink(path, (err) => err ? reject(err) : resolve());
      }
    });
  }

  public static renameFilePromise(oldFilename, newFilename) {
    return new Promise((resolve, reject) => {
      fs.rename(oldFilename, newFilename, (err) => err ? reject(err) : resolve());
    }); 
  }

  public static createFilePromise(filename) {
    return new Promise((resolve, reject) => {
      fs.writeFile(filename, '', (err) => err? reject(err) : resolve());
    });
  }

  public static renameOrCreateFilePromise(oldFilename, newFilename) {
    if(fs.existsSync(oldFilename)) {
      return this.renameFilePromise(oldFilename, newFilename);
    } else {
      return this.createFilePromise(newFilename);
    }
  }

  public static onFileSelect(event: any, cb) {
    if (event.target.files && event.target.files[0]) {
        const reader = new FileReader();
        console.log(event.target.files[0]);
        cp.exec(`copy "${event.target.files[0].path}" "matura-biologia/totally-temporary-tmp.${event.target.files[0].name}"`, (err, stdout, stderr) => {
          console.log([err, stdout, stderr]);
          if(!err) {
            base64Img.base64(`matura-biologia/totally-temporary-tmp.${event.target.files[0].name}`, (err, data) => {
              if(err) console.log(err);
              else {
                cb(data);
                console.log(`loaded: matura-biologia/tmp.${event.target.files[0].name}`);
              }
            });
          }
        }
      );
    }
  }
}