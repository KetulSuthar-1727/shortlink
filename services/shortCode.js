const CHARACTERS = "0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";

function encodeBase62(number){
  if(number == 0){
    return "0";
  }

  let result = "";

  while(number > 0){
    result = CHARACTERS[number%62] + result;
    number = Math.floor(number / 62);
  }
  return result;
}

module.exports = {
  encodeBase62
}