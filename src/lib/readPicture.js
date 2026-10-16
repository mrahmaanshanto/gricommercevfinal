// readPicture — a picture file read into a JPEG data URL at most `max` px on the long side (Batch D: service covers,
// galleries and proof of work, Grid Shop products). Front end only: a live build uploads the file to storage instead.

/** Read an image file: resolves { src (data URL), width, height }; rejects with a plain message. */
export function readPicture(file, { max = 960, quality = 0.74 } = {}) {
  return new Promise((resolve, reject) => {
    if (!file || !/^image\//.test(file.type)) { reject(new Error('Choose a picture (JPG, PNG or WebP).')); return; }
    if (file.size > 12 * 1024 * 1024) { reject(new Error('The picture is too large (12 MB at most).')); return; }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(img.width * k)); c.height = Math.max(1, Math.round(img.height * k));
      const g = c.getContext('2d');
      g.fillStyle = '#ffffff'; g.fillRect(0, 0, c.width, c.height);
      g.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve({ src: c.toDataURL('image/jpeg', quality), width: c.width, height: c.height });
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That picture could not be read.')); };
    img.src = url;
  });
}
