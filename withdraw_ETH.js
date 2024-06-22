const Web3 = require('web3');
const swap_ABI = require('./abi/weth_abi');

require('dotenv').config();

const rpcUrl = process.env.RPC_URL;
const privateKey = process.env.WALLET_PRIVATEKEY;
const withdrawCA = process.env.WETH_CA;

const web3 = new Web3(rpcUrl);
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  web3.eth.accounts.wallet.add(account);

const wethContract = new web3.eth.Contract(
  swap_ABI,
  withdrawCA
);

let totalAmountWithdrew = 0;
let totalGasSpent = 0;
let totalWETHBalance = 0;
let jumpIndex = 0;

//====================================//
async function withdrawETH(sendIndex) {

  const wethBalance = await wethContract.methods.balanceOf(account.address).call();

  const initialWETHBalance = parseInt(wethBalance);

  const gasLimit = parseInt(process.env.GAS_LIMIT);

  const randomAmount = getRandomAmount();

  const amountToWithdraw = randomAmount + '0000000000';

  let valueToWithdraw = parseInt(amountToWithdraw);

  if (initialWETHBalance <= valueToWithdraw){
    valueToWithdraw = initialWETHBalance;
    jumpIndex = 50;
  }

  if (initialWETHBalance == 0.000000000000000000) {
    finalizeTransaction();
    return;
  }

  const withETH = wethContract.methods.withdraw(valueToWithdraw).encodeABI();

  const transactionObject = {
    from: account.address,
    to: withdrawCA,
    value: 0,
    maxPriorityFeePerGas: web3.utils.toHex(web3.utils.toWei(process.env.MAX_PRIORITY_FEE_PER_GAS, "gwei")),
    maxFeePerGas: web3.utils.toHex(web3.utils.toWei(process.env.MAX_FEE_PER_GAS, "gwei")),
    type: 2,
    chainId: 167000,
    data: withETH,
    gasLimit: web3.utils.toHex(gasLimit)
  };

  const amountSent = web3.utils.fromWei(valueToWithdraw.toString(), 'ether');

  totalAmountWithdrew += parseFloat(amountSent);

  try {
    const transactionReceipt = await web3.eth.sendTransaction(transactionObject);

    totalGasSpent += parseFloat(web3.utils.fromWei((transactionReceipt.gasUsed * transactionReceipt.effectiveGasPrice).toString(), 'ether'));

    const blockNumber = transactionReceipt.blockNumber;

    const blockDetails = await web3.eth.getBlock(blockNumber);

    const timestamp = blockDetails.timestamp;

    const date = new Date(timestamp * 1000);

    const formattedDate = formatDateToTimezone(date, 'Asia/Manila');

    console.log(`\n${sendIndex + 1}. \x1b[91m${amountSent}\x1b[0m ETH withdrawal success @ \x1b[93m${formattedDate}\x1b[0m with Block # \x1b[32m${blockNumber}\x1b[0m`);

    console.log(`   Transaction hash: \x1b[96m${transactionReceipt.transactionHash}\x1b[0m`);

    console.log(`   Transaction details -> \x1b[1;94mhttps://taikoscan.network/tx/${transactionReceipt.transactionHash}\x1b[0m`);

    const wethBalance = await wethContract.methods.balanceOf(account.address).call();

    totalWETHBalance = parseFloat(web3.utils.fromWei((wethBalance).toString(), 'ether'));

    console.log('\nTotal WETH balance: \x1b[95m' + totalWETHBalance.toFixed(8) + '\x1b[0m WETH');
  } catch (withdrawError) {
    console.error(`Error withdrawing ETH:`, withdrawError);
  }

  let sendIndexNew = sendIndex + jumpIndex + 1;

  let txCount = parseInt(process.env.WITHDRAW_TX_COUNT);

  if (sendIndexNew >= txCount) {
    finalizeTransaction();
    return;
  }

  const randomTimeOut = getRandomTimeOut();

  setTimeout(() => {
    withdrawETH(sendIndexNew);
  }, randomTimeOut);
}

//===================================//
async function finalizeTransaction() {
  console.log('\n\x1b[94mAll transactions completed.\x1b[0m');

  console.log('Overall ETH withdrawal: \x1b[91m' + totalAmountWithdrew.toFixed(8) + '\x1b[0m ETH');

  console.log('Overall txn fee spent: \x1b[93m' + totalGasSpent.toFixed(10) + '\x1b[0m ETH');

  const wethBalance = await wethContract.methods.balanceOf(account.address).call();

  totalWETHBalance = parseFloat(web3.utils.fromWei((wethBalance).toString(), 'ether'));

  console.log('\nOverall WETH balance: \x1b[95m' + totalWETHBalance.toFixed(8) + '\x1b[0m WETH');

  const queryRemainingBalance = await web3.eth.getBalance(account.address);

  const remainingBalance = parseFloat(web3.utils.fromWei(queryRemainingBalance, 'ether')).toFixed(8);

  console.log('Overall ETH balance: \x1b[92m' + remainingBalance + '\x1b[0m ETH');
}

//===================================//
function getRandomAmount() {
  const min = parseFloat(process.env.WITHDRAW_RANDOM_AMOUNT_MIN);
  const max = parseFloat(process.env.WITHDRAW_RANDOM_AMOUNT_MAX);
  const randomValue = Math.random() * (max - min) + min;
  const roundedValue = Math.floor(randomValue);
  return roundedValue.toString();
}

//===================================//
function getRandomTimeOut() {
  const min = parseInt(process.env.WITHDRAW_RANDOM_TIME_MIN);
  const max = parseInt(process.env.WITHDRAW_RANDOM_TIME_MAX);
  const randomValue = Math.floor(Math.random() * (max - min)) + min;
  return randomValue;
}

//===================================//
function formatDateToTimezone(date, timeZone) {
  const timeOptions = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    timeZone: timeZone
  };
  const timeFormatter = new Intl.DateTimeFormat('en-US', timeOptions);
  const formattedTime = timeFormatter.format(date);

  const dateOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: timeZone
  };
  const dateFormatter = new Intl.DateTimeFormat('en-US', dateOptions);
  const formattedDate = dateFormatter.format(date);

  return `${formattedTime} · ${formattedDate}`;
}

withdrawETH(0);
