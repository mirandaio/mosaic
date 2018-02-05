import Worker from './mosaic-worker.js';
import '../css/styles.css';

const TILE_WIDTH = 4; // these values are pixels
const TILE_HEIGHT = 4;

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

dropZone.addEventListener('drop', function(e) {
  setupCanvas(e.dataTransfer.files[0], source).then(function() {
    dropZone.classList.add('none');
    processBtn.classList.remove('invisible');
  });
});

dropZone.addEventListener('dragenter', function(e) {
  this.classList.remove('empty');
  this.classList.add('full');
});

dropZone.addEventListener('dragleave', function(e) {
  this.classList.remove('full');
  this.classList.add('empty');
});

window.addEventListener('drop', function(e) {
  e.preventDefault();
});

window.addEventListener('dragover', function(e) {
  e.preventDefault();
});

processBtn.addEventListener('click', function(e) {
  const ctx = source.getContext('2d');
  result.width = source.width;
  result.height = source.height;
  const resultCtx = result.getContext('2d');
  const numberRows = Math.ceil(source.height / TILE_HEIGHT);
  const numberRowsPerWorker = Math.floor(
    source.height / (TILE_HEIGHT * numCores)
  );
  let remainderRows = numberRows % numCores;
  const imgData = ctx.getImageData(0, 0, source.width, source.height);
  let promises = [];
  let y = 0; // vertical offset in pixels of the section to process

  for (let i = 0; i < numCores; i++) {
    let rows = numberRowsPerWorker;
    if (remainderRows > 0) {
      rows++;
      remainderRows--;
    }

    let height = Math.min(rows * TILE_HEIGHT, result.height - y); // height in pixels of the section
    promises.push(partialMosaic(imgData, y, height, TILE_WIDTH, TILE_HEIGHT));
    y += height;
    if (result.height === y) {
      break;
    }
  }

  Promise.all(promises).then(function(sections) {
    sections.forEach(function(sectionData) {
      resultCtx.putImageData(sectionData.mosaicData, 0, sectionData.y);
    });
  });
});

function partialMosaic(imgData, y, height, tileWidth, tileHeight) {
  return new Promise(function(resolve, reject) {
    let mosaicWorker = new Worker();

    mosaicWorker.addEventListener('message', function(e) {
      resolve({
        mosaicData: e.data,
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
