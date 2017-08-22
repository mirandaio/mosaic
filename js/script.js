const TITLE_WIDTH = 16;
const TITLE_HEIGHT = 16;

const canvas = document.getElementById('source');
const dropZone = document.getElementById('drop-zone');
const button = document.getElementById('process');

document.querySelector('input').addEventListener('change', function(e) {
  setupCanvas(e.target.files[0], canvas).then(function() {
    dropZone.classList.add('none');
    button.classList.remove('invisible');
  });
});

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
