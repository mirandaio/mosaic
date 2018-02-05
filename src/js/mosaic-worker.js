self.addEventListener('message', function(e) {
  const { imgData, y, height: sectionHeight, tileWidth, tileHeight } = e.data;
  const { width: canvasWidth, height: canvasHeight } = imgData;
  const mosaicData = new ImageData(canvasWidth, sectionHeight);
  const { data: mosaicArray } = mosaicData;

  for (let row = y; row < y + sectionHeight; row += tileHeight) {
    for (let col = 0; col < imgData.width; col += tileWidth) {
      const validHeight = getValidSize(row, canvasHeight, tileHeight);
      const validWidth = getValidSize(col, canvasWidth, tileWidth);
      const averages = getAverages(imgData, row, col, validHeight, validWidth); // need to copy this into mosaicArray
      copyColors(
        averages,
        mosaicArray,
        canvasWidth,
        row - y,
        col,
        validHeight,
        validWidth
      );
    }
  }

  self.postMessage(mosaicData);
  self.close();
});

function copyColors(
  averages,
  mosaicArray,
  sectionWidth,
  row,
  col,
  tileHeight,
  tileWidth
) {
  const [r, g, b] = averages;
  for (let y = row; y < row + tileHeight; y++) {
    for (let x = col; x < col + tileWidth; x++) {
      const index = (sectionWidth * y + x) * 4;
      const beforeMosaicArray = mosaicArray[index];
      mosaicArray[index] = r;
      mosaicArray[index + 1] = g;
      mosaicArray[index + 2] = b;
      mosaicArray[index + 3] = 255;
    }
  }
}

// row and col are in pixels
function getAverages(imgData, row, col, tileHeight, tileWidth) {
  const { data: imgArray, width: sectionWidth } = imgData;
  let r = 0;
  let g = 0;
  let b = 0;
  const numPixels = tileHeight * tileWidth;

  for (let y = row; y < row + tileHeight; y++) {
    for (let x = col; x < col + tileWidth; x++) {
      const index = (sectionWidth * y + x) * 4;
      r += imgArray[index];
      g += imgArray[index + 1];
      b += imgArray[index + 2];
    }
  }
  return [
    Math.floor(r / numPixels),
    Math.floor(g / numPixels),
    Math.floor(b / numPixels)
  ];
}

function getValidSize(offset, canvasSize, tileSize) {
  return offset + tileSize > canvasSize ? canvasSize - offset : tileSize;
}
