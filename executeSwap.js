const { exec } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const depScriptHeader = '\n==================================================\nETH Wrapping (Deposit) Transactions Started!';
const withScriptHeader = '\n==================================================\nETH Unwrapping (Withdrawal) Transactions Started!';

function runScript(scriptName, scriptHeader, exitOnComplete, callback) {
  console.log(scriptHeader);

  function execute() {
    const child = exec(`node ${scriptName}`, (error) => {
      if (error) {
        console.error(`Error executing ${scriptName}: ${error}`);
        return;
      }
    });

    child.stdout.on('data', (data) => {
      console.log(data);
    });

    child.stderr.on('data', (data) => {
      console.error(data);
    });

    child.on('close', () => {
      if (exitOnComplete) {
        process.exit(0);
      } else if (callback) {
        callback();
      }
    });
  }

  execute();
}

function runBothScripts(firstScript, firstHeader, secondScript, secondHeader) {
  runScript(firstScript, firstHeader, false, () => {
    runScript(secondScript, secondHeader, true);
  });
}

rl.question('Choose the action you want to perform:\n1. Wrap (Deposit) Ethereum\n2. Unwrap (Withdraw) Ethereum\n3. Do Both\nEnter your choice (1, 2, or 3): ', (choice) => {
  if (choice === '1' || choice === '2' || choice === '3') {
    if (choice === '1') {
      rl.question('\nHow many wrap (deposit) transactions to run? ', (count) => {
        if (!isNaN(count) && count > 0) {
          count = parseInt(count);
          process.env.DEPOSIT_TX_COUNT = count;
          const scriptName = 'deposit_ETH.js';
          const scriptHeader = depScriptHeader;
          runScript(scriptName, scriptHeader, true);
        } else {
          console.log('The number of transactions must be greater than 0.');
          rl.close();
        }
      });
    } else if (choice === '2') {
      rl.question('\nHow many unwrap (withdraw) transactions to run? ', (count) => {
        if (!isNaN(count) && count > 0) {
          count = parseInt(count);
          process.env.WITHDRAW_TX_COUNT = count;
          const scriptName = 'withdraw_ETH.js';
          const scriptHeader = withScriptHeader;
          runScript(scriptName, scriptHeader, true);
        } else {
          console.log('The number of transactions must be greater than 0.');
          rl.close();
        }
      });
    } else if (choice === '3') {
      rl.question('\nOrder of swapping to be executed:\n1. Wrap (Deposit) First\n2. Unwrap (Withdraw) First\nEnter the order number you want to run first: ', (order) => {
        if (order === '1' || order === '2') {
          rl.question('\nHow many transactions for wrap (deposit) to run? ', (depositCount) => {
            if (!isNaN(depositCount) && depositCount > 0) {
              depositCount = parseInt(depositCount);
              process.env.DEPOSIT_TX_COUNT = depositCount;
              const scriptHeaderDep = depScriptHeader;
              rl.question('How many transactions for unwrap (withdraw) to run? ', (withdrawCount) => {
                if (!isNaN(withdrawCount) && withdrawCount > 0) {
                  withdrawCount = parseInt(withdrawCount);
                  process.env.WITHDRAW_TX_COUNT = withdrawCount;
                  const scriptHeaderWith = withScriptHeader;
                  if (order === '1') {
                    runBothScripts('deposit_ETH.js', scriptHeaderDep, 'withdraw_ETH.js', scriptHeaderWith);
                  } else {
                    runBothScripts('withdraw_ETH.js', scriptHeaderWith, 'deposit_ETH.js', scriptHeaderDep);
                  }
                } else {
                  console.log('The number of transactions for unwrapping (withdrawal) must be greater than 0.');
                  rl.close();
                }
              });
            } else {
              console.log('The number of transactions for wrapping (deposit) must be greater than 0.');
              rl.close();
            }
          });
        } else {
          console.log('Invalid choice.');
          rl.close();
        }
      });
    }
  } else {
    console.log('Invalid choice.');
    rl.close();
  }
});
