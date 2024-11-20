const ones = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const tens = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

const scales = ["", "Thousand", "Lakh", "Crore"];

function convertToWords(amount) {
  try {
    if (amount === 0) return "Zero Rupees Only";

    // Split amount into whole and decimal parts
    const [rupees, paise = 0] = amount.toFixed(2).split(".");

    // Convert rupees to words
    let rupeesInWords = convertWholeNumber(parseInt(rupees));

    // Convert paise to words
    let paiseInWords = "";
    if (parseInt(paise) > 0) {
      paiseInWords = ` and ${convertWholeNumber(parseInt(paise))} Paise`;
    }

    return `${rupeesInWords} Rupees${paiseInWords} Only`;
  } catch (error) {
    console.error("Error converting number to words:", error);
    return "";
  }
}

function convertWholeNumber(num) {
  if (num === 0) return "";
  if (num < 20) return ones[num];

  if (num < 100) {
    return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
  }

  if (num < 1000) {
    return (
      ones[Math.floor(num / 100)] +
      " Hundred" +
      (num % 100 ? " and " + convertWholeNumber(num % 100) : "")
    );
  }

  let words = "";
  let scaleIndex = 0;

  while (num > 0) {
    if (num % 1000 !== 0) {
      let chunk = convertWholeNumber(num % 1000);
      words =
        chunk +
        (scales[scaleIndex] ? " " + scales[scaleIndex] + " " : "") +
        words;
    }
    num = Math.floor(num / 1000);
    scaleIndex++;
  }

  return words.trim();
}

module.exports = {
  convertToWords,
};
