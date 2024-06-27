# Taiko Trailblazers ETH/WETH Swap Script

## Requirements

- Node.js >= v18.x
- npm >= v9 (usually bundled with Nodejs)
- git bash (for command terminal)
<br/>

## Getting Started

### Clone Repository

```
git clone https://github.com/dCodeX21/taiko-trailblazers-weth-swap.git
```

Go to the downloaded repository
```
cd taiko-trailblazers-weth-swap
```

Install dependencies by running:

```
npm install
```

### Config .env

Create new .env file by running:

```
cp .env.example .env
```

Then define all the variables needed.
<br/>
<br/>

## Updating the script

On the repo directory, update the files by running:

```
git fetch --all --tags
```

This will update your local repo by fetching the latest files on the github repository.
<br/>
<br/>

## Running the script

Run the following command to start the script:

```
$ node executeSwap.js
```

This will execute the new script which will give you an option which transaction will run first.
