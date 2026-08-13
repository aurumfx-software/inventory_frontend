import React, { useMemo } from 'react';

/**
 * GF(256) tables for Reed-Solomon error correction
 */
const GF256_EXP = new Uint8Array(512);
const GF256_LOG = new Uint8Array(256);

(function initGF() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF256_EXP[i] = x;
    GF256_EXP[i + 255] = x;
    GF256_LOG[x] = i;
    x = (x << 1) ^ (x & 0x80 ? 0x11d : 0);
  }
})();

function gfMul(x, y) {
  if (x === 0 || y === 0) return 0;
  return GF256_EXP[GF256_LOG[x] + GF256_LOG[y]];
}

function rsPolyMul(p1, p2) {
  const result = new Uint8Array(p1.length + p2.length - 1);
  for (let i = 0; i < p1.length; i++) {
    for (let j = 0; j < p2.length; j++) {
      result[i + j] ^= gfMul(p1[i], p2[j]);
    }
  }
  return result;
}

function getGeneratorPoly(degree) {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    poly = rsPolyMul(poly, new Uint8Array([1, GF256_EXP[i]]));
  }
  return poly;
}

function calcECC(data, eccCount) {
  const gen = getGeneratorPoly(eccCount);
  const res = new Uint8Array(data.length + eccCount);
  res.set(data);
  for (let i = 0; i < data.length; i++) {
    const coef = res[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        res[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  return res.slice(data.length);
}

// Version metadata table for Error Correction Level M
const VERSION_TABLE = [
  null,
  { version: 1, size: 21, dataBytes: 16, eccBytes: 10, align: [] },
  { version: 2, size: 25, dataBytes: 28, eccBytes: 16, align: [6, 18] },
  { version: 3, size: 29, dataBytes: 44, eccBytes: 26, align: [6, 22] },
  { version: 4, size: 33, dataBytes: 64, eccBytes: 36, align: [6, 26] },
  { version: 5, size: 37, dataBytes: 86, eccBytes: 48, align: [6, 30] },
  { version: 6, size: 41, dataBytes: 108, eccBytes: 64, align: [6, 34] },
  { version: 7, size: 45, dataBytes: 124, eccBytes: 72, align: [6, 22, 38] },
  { version: 8, size: 49, dataBytes: 154, eccBytes: 88, align: [6, 24, 42] },
  { version: 9, size: 53, dataBytes: 182, eccBytes: 110, align: [6, 26, 46] },
  { version: 10, size: 57, dataBytes: 216, eccBytes: 130, align: [6, 28, 50] }
];

function getFormatInfo(mask) {
  // Level M: 00 binary
  const levelBits = 0;
  const data = (levelBits << 3) | mask;
  let d = data << 10;
  for (let i = 4; i >= 0; i--) {
    if (d & (1 << (i + 10))) {
      d ^= 0x537 << i;
    }
  }
  return ((data << 10) | d) ^ 0x5412;
}

function generateQRCodeMatrix(inputText) {
  const encoder = new TextEncoder();
  const textBytes = encoder.encode(inputText || ' ');

  // Select appropriate version
  let info = VERSION_TABLE[1];
  for (let v = 1; v <= 10; v++) {
    // 4 bits mode + 8 bits count + data bytes
    const requiredDataBytes = Math.ceil((4 + 8 + textBytes.length * 8) / 8);
    if (requiredDataBytes <= VERSION_TABLE[v].dataBytes) {
      info = VERSION_TABLE[v];
      break;
    }
    if (v === 10) {
      info = VERSION_TABLE[10];
    }
  }

  const { size, dataBytes, eccBytes, align } = info;

  // Initialize matrix and reserved grid
  const matrix = Array.from({ length: size }, () => new Array(size).fill(false));
  const reserved = Array.from({ length: size }, () => new Array(size).fill(false));

  function setModule(r, c, val, isRes = true) {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      matrix[r][c] = val;
      if (isRes) reserved[r][c] = true;
    }
  }

  // 1. Finder patterns (7x7)
  const finders = [
    [0, 0],
    [0, size - 7],
    [size - 7, 0]
  ];

  finders.forEach(([r0, c0]) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rPos = r0 + r;
        const cPos = c0 + c;
        if (rPos >= 0 && rPos < size && cPos >= 0 && cPos < size) {
          if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
            const isDark = r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
            setModule(rPos, cPos, isDark);
          } else {
            setModule(rPos, cPos, false); // Quiet zone separator
          }
        }
      }
    }
  });

  // 2. Alignment patterns (5x5)
  if (align.length > 0) {
    for (let i = 0; i < align.length; i++) {
      for (let j = 0; j < align.length; j++) {
        const rCenter = align[i];
        const cCenter = align[j];
        // Skip if overlaps finder patterns
        if (
          (rCenter < 9 && cCenter < 9) ||
          (rCenter < 9 && cCenter > size - 9) ||
          (rCenter > size - 9 && cCenter < 9)
        ) {
          continue;
        }

        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            const isDark = Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0);
            setModule(rCenter + r, cCenter + c, isDark);
          }
        }
      }
    }
  }

  // 3. Timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (!reserved[6][i]) setModule(6, i, i % 2 === 0);
    if (!reserved[i][6]) setModule(i, 6, i % 2 === 0);
  }

  // 4. Dark module
  setModule(4 * info.version + 9, 8, true);

  // 5. Reserve Format Info areas
  for (let i = 0; i <= 8; i++) {
    if (i !== 6) {
      setModule(8, i, false);
      setModule(i, 8, false);
    }
  }
  for (let i = size - 8; i < size; i++) {
    setModule(8, i, false);
  }
  for (let i = size - 7; i < size; i++) {
    setModule(i, 8, false);
  }

  // 6. Build Bit Stream
  const bitStream = [];
  const pushBits = (val, length) => {
    for (let i = length - 1; i >= 0; i--) {
      bitStream.push((val >> i) & 1);
    }
  };

  // Byte Mode: 0100
  pushBits(4, 4);

  // Char count (8 bits for Version 1-9)
  const charCount = Math.min(textBytes.length, dataBytes - 2);
  pushBits(charCount, 8);

  // Data bytes
  for (let i = 0; i < charCount; i++) {
    pushBits(textBytes[i], 8);
  }

  // Terminator
  const totalDataBits = dataBytes * 8;
  const termLength = Math.min(4, totalDataBits - bitStream.length);
  for (let i = 0; i < termLength; i++) bitStream.push(0);

  // Byte align
  while (bitStream.length % 8 !== 0) bitStream.push(0);

  // Pad bytes: 0xEC (236) and 0x11 (17)
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bitStream.length < totalDataBits) {
    pushBits(padBytes[padIdx % 2], 8);
    padIdx++;
  }

  // Convert bitStream to byte array
  const rawData = new Uint8Array(dataBytes);
  for (let i = 0; i < dataBytes; i++) {
    let byteVal = 0;
    for (let b = 0; b < 8; b++) {
      byteVal = (byteVal << 1) | bitStream[i * 8 + b];
    }
    rawData[i] = byteVal;
  }

  // Calculate ECC
  const eccData = calcECC(rawData, eccBytes);

  // Combine Data + ECC bits
  const finalBits = [];
  rawData.forEach((b) => {
    for (let i = 7; i >= 0; i--) finalBits.push((b >> i) & 1);
  });
  eccData.forEach((b) => {
    for (let i = 7; i >= 0; i--) finalBits.push((b >> i) & 1);
  });

  // 7. Place bits in matrix
  let bitIdx = 0;
  let upward = true;

  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--; // Skip timing column

    const rows = [];
    if (upward) {
      for (let r = size - 1; r >= 0; r--) rows.push(r);
    } else {
      for (let r = 0; r < size; r++) rows.push(r);
    }
    upward = !upward;

    for (const r of rows) {
      for (const c of [col, col - 1]) {
        if (!reserved[r][c]) {
          const bit = bitIdx < finalBits.length ? finalBits[bitIdx++] : 0;
          matrix[r][c] = bit === 1;
        }
      }
    }
  }

  // 8. Mask pattern (Mask 0: (row + col) % 2 === 0)
  const mask = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!reserved[r][c]) {
        if ((r + c) % 2 === 0) {
          matrix[r][c] = !matrix[r][c];
        }
      }
    }
  }

  // 9. Format Info Placement
  const formatVal = getFormatInfo(mask);
  const formatBits = [];
  for (let i = 14; i >= 0; i--) {
    formatBits.push((formatVal >> i) & 1);
  }

  // Placement 1 (Top-Left)
  const pos1 = [
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
    [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8]
  ];
  pos1.forEach(([r, c], idx) => {
    matrix[r][c] = formatBits[idx] === 1;
  });

  // Placement 2 (Top-Right and Bottom-Left)
  const pos2 = [
    [size - 1, 8], [size - 2, 8], [size - 3, 8], [size - 4, 8], [size - 5, 8], [size - 6, 8], [size - 7, 8],
    [8, size - 8], [8, size - 7], [8, size - 6], [8, size - 5], [8, size - 4], [8, size - 3], [8, size - 2], [8, size - 1]
  ];
  pos2.forEach(([r, c], idx) => {
    matrix[r][c] = formatBits[idx] === 1;
  });

  return matrix;
}

export default function QRCodeSVG({
  text = '',
  value = '',
  size = 128,
  fgColor = '#000000',
  bgColor = '#ffffff',
  includeMargin = true,
  className = '',
  style = {}
}) {
  const content = value || text || ' ';

  const matrix = useMemo(() => {
    try {
      return generateQRCodeMatrix(content);
    } catch {
      return generateQRCodeMatrix(' ');
    }
  }, [content]);

  const matrixSize = matrix.length;
  const margin = includeMargin ? 2 : 0;
  const viewBoxSize = matrixSize + margin * 2;

  let pathD = '';
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (matrix[r][c]) {
        pathD += `M${c + margin},${r + margin}h1v1h-1z`;
      }
    }
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      width={size}
      height={size}
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    >
      {bgColor && bgColor !== 'transparent' && (
        <rect width={viewBoxSize} height={viewBoxSize} fill={bgColor} />
      )}
      <path d={pathD} fill={fgColor} shapeRendering="crispEdges" />
    </svg>
  );
}

export { QRCodeSVG };
