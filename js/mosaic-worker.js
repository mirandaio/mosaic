self.addEventListener('message', function(e) {
  let imgData = e.data.imgData;
  let imgArray = imgData.data;
  let sectionHeight = e.data.height;
  let mosaicData = new ImageData(imgData.width, sectionHeight);
  let mosaicArray = mosaicData.data;
  let y = e.data.y;

  for (let row = y; row < y + sectionHeight; row += tileHeight) {
    for(let col = 0; col < imgData.width; col += tileWidth) {
      // get average RGB values from imgArray
      // copy those values into mosaicArray
      let endRow = row + tileHeight;
      let endCol = col + tileWidth;
      let topLeft = (row * sectionWidth + col) * 4;
      let bottomRight = (endRow * sectionWidth + endCol) * 4;
    }
  }

  self.postMessage(mosaicData);
  self.close();
});

function getAverage(imgArray, row, col, tileHeight, tileWidth) {
  let endRow = row + tileHeight;
  let endCol = col + tileWidth;
  let topLeft = (row * sectionWidth + col) * 4;
  let bottomRight = (endRow * sectionWidth + endCol) * 4;
  let r = 0;
  let g = 0;
  let b = 0;
  for (let i = topLeft; i < bottomRight; i += 4) {
    r += imgArray[i];
    g += imgArray[i + 1];
    b += imgArray[i + 2];
  }

  return [];
}
