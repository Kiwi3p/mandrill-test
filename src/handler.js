"use strict";

module.exports.mandrillTest = async (event) => {
  const randomNumber = parseInt(Math.random() * 100);
  console.log("test");
  console.log("the random generated integer is:", randomNumber);
  return randomNumber;
};
