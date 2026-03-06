const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomToken(length: number) {
  let output = "";
  for (let index = 0; index < length; index += 1) {
    const randomIndex = Math.floor(Math.random() * CODE_ALPHABET.length);
    output += CODE_ALPHABET[randomIndex];
  }
  return output;
}

export function generateClassCode() {
  return `ICT-${randomToken(6)}`;
}
