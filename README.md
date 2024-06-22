# Taiko Trailblazers ETH/WETH Swap Script

## Requirements

- Node.js >= v18.x
- npm >= v9 (usually bundled with Nodejs)
- gitbash
<br/>

## Getting Started

### Clone Repository

```
$ git clone https://github.com/dCodeX21/taiko-trailblazers-weth-swap.git
```

After cloning the repository, install dependencies by running:

```
$ npm install
```

### Config .env

Create new .env file by running:

```
$ cp .env.example .env
```

Then define all the variables needed.
<br/>

## Running the script

Once the installation process has completed, run the following command to start the script:

```
$ node deposit_ETH.js
```

This will execute the deposit script, which swaps the ETH to WETH
<br/>

```
$ node withdraw_ETH.js
```

This will execute the withdrawal script, which swaps the WETH back to ETH
<br/>