function roundToOneNonZeroDigit(num) {
  if (num === 0) return 0;

  const numStr = num.toString();

  if (Math.abs(num) >= 1) {
    return parseFloat(num.toFixed(1));
  } else {
    let firstNonZeroIndex = -1;
    for (let i = 2; i < numStr.length; i++) {
      // start from 2 to skip "0."
      if (numStr[i] !== "0") {
        firstNonZeroIndex = i;
        break;
      }
    }

    const digitAfterNonZero = numStr[firstNonZeroIndex + 1];
    const shouldRoundUp = parseInt(digitAfterNonZero, 10) >= 5;

    let significantPart = numStr.slice(0, firstNonZeroIndex + 1);
    if (shouldRoundUp) {
      let roundedDigit = parseInt(numStr[firstNonZeroIndex], 10) + 1;
      significantPart = significantPart.slice(0, -1) + roundedDigit;
    }

    return parseFloat(significantPart);
  }
}

module.exports = {
  roundToOneNonZeroDigit,
};
