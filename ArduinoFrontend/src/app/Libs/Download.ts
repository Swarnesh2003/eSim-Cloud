export enum ImageType { PNG, JPG, SVG }
declare var canvg;

export class Download {
  static async ExportImage(type: ImageType) {
    const svg = (document.querySelector('#holder > svg').cloneNode(true) as SVGSVGElement);
    svg.getElementsByTagName('g')[0].removeAttribute('transform');
    const images = (svg.getElementsByTagName('image') as any);
    for (const image of images) {
      const data = await fetch(image.getAttribute('href'))
        .then((v) => {
          return v.text();
        });
      // data = (data.replace('<svg ', `<svg width="${image.getAttribute('width')}" height="${image.getAttribute('height')}" `));
      image.setAttribute(
        'href',
        'data:image/svg+xml;base64,' + window.btoa(data)
      );
    }
    return new Promise((res, _) => {
      if (type === ImageType.SVG) {
        res(svg.outerHTML);
        return;
      }
      const pixelRatio = window.devicePixelRatio || 1;
      const gtag = (document.querySelector('#holder > svg > g') as SVGSVGElement).getBBox();
      svg.getElementsByTagName('g')[0].setAttribute('transform', `scale(1,1)translate(${-gtag.x},${-gtag.y})`);

      const canvas = document.createElement('canvas');
      canvas.width = (gtag.width + gtag.x) * pixelRatio;
      canvas.height = (gtag.height + gtag.y) * pixelRatio;
      canvas.style.width = canvas.width + 'px';
      canvas.style.height = canvas.width + 'px';
      svg.setAttribute('width', '' + canvas.width);
      svg.setAttribute('height', '' + canvas.height);

      const ctx = (canvas.getContext('2d') as any);
      ctx.mozImageSmoothingEnabled = true;
      ctx.webkitImageSmoothingEnabled = true;
      ctx.msImageSmoothingEnabled = true;
      ctx.imageSmoothingEnabled = true;
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      const v = canvg.Canvg.fromString(ctx, svg.outerHTML);
      v.render().then(() => {
        let image;
        if (type === ImageType.JPG) {
          const imgdata = ctx.getImageData(0, 0, canvas.width, canvas.height);
          for (let i = 0; i < imgdata.data.length; i += 4) {
            if (imgdata.data[i + 3] === 0) {
              imgdata.data[i] = 255;
              imgdata.data[i + 1] = 255;
              imgdata.data[i + 2] = 255;
              imgdata.data[i + 3] = 255;
            }
          }
          ctx.putImageData(imgdata, 0, 0);
          image = canvas.toDataURL('image/jpeg');
        } else {
          if (type === ImageType.PNG) {
            image = canvas.toDataURL('image/png');
          }
        }
        res(image);
      });
    });
  }
}
