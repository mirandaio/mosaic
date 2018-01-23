const TILE_WIDTH = 16;
const TILE_HEIGHT = 16;

const source = document.getElementById('source');
const dropZone = document.getElementById('drop-zone');
const processBtn = document.getElementById('process-btn');
const container = document.getElementById('container');
const result = document.getElementById('result');
const numCores = navigator.hardwareConcurrency;

document.querySelector('input').addEventListener('change', function(e) {
  setupCanvas(e.target.files[0], source).then(function() {
    dropZone.classList.add('none');
    processBtn.classList.remove('invisible');
  });
});

processBtn.addEventListener('click', function(e) {
  const ctx = source.getContext('2d');
  result.width = source.width;
  result.height = source.height;
  const resultCtx = result.getContext('2d');
  const numberRows = Math.ceil(source.height / TILE_HEIGHT);
  const numberRowsPerWorker = Math.floor(source.height / (TILE_HEIGHT * numCores));
  let remainderRows = numberRows % numCores;
  const imgData = ctx.getImageData(0, 0, source.width, source.height);
  let promises = [];
  let y = 0;

  for (let i = 0; i < numCores; i++) {
    let rows = numberRowsPerWorker;
    if (remainderRows > 0) {
      rows++;
      remainderRows--;
    }
    let height = Math.min(rows * TILE_HEIGHT, result.height - y);
    promises.push(partialMosaic(imgData, y, height, TILE_WIDTH, TILE_HEIGHT));
    y += height;
  }

  Promise.all(promises).then(function(sections) {
    sections.forEach(function(sectionData) {
      resultCtx.putImageData(sectionData.imgData, 0, sectionData.y);
    });
  });
});

function partialMosaic(imgData, y, height, tileWidth, tileHeight) {
  return new Promise(function(resolve, reject) {
    let mosaicWorker = new Worker('js/mosaic-worker.js');

    mosaicWorker.addEventListener('message', function(e) {
      resolve({
        imgData: e.data,
        y: y
      });
    });

    mosaicWorker.postMessage({
      imgData: imgData,
      y: y,
      height: height,
      tileWidth: tileWidth,
      tileHeight: tileHeight
    });
  });
}

function setupCanvas(file, canvas) {
  const ctx = canvas.getContext('2d');
  const img = document.createElement('img');
  const reader = new FileReader();

  return new Promise(function(resolve, reject) {
    reader.onload = function(e) {
      img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve();
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
}