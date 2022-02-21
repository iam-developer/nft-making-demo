var express = require('express');
const { spawnSync } = require('child_process');
var app = express();
const path = require("path");
//set view engine
app.set("view engine","jade");

//TODO make public urls static for images

app.get('/minting', function (req, res){
    console.log('Initiating minting...')
    const { walletAddress } = req.query;
    if( !walletAddress ) {
        return res.status(500).send(JSON.parse('{"message":"Error No wallet address provided"}'));
    }

    console.log('NFT minted...')
    // const userAddress = '0xb9720BE63Ea8896956A06d2dEd491De125fD705E';
    response = spawnSync(`npx hardhat mint --address ${walletAddress}`, [], {shell: true})
    if(response.error) {
        console.log("Error while minting:", response.error);
        return res.status(500).send(JSON.parse('{"message":"Error while minting the NFT"}'));
    }
    res.status(200).send(JSON.parse('{"success":"Hey"}'));
});

app.get('/preparing-metadata', function (req, res){
    console.log('Preparing MetaCar...')
    // const { metaCarAddress } = req.query;
    // if( !metaCarAddress ) {
    //     return res.status(500).send(JSON.parse('{"message":"Error No metaCar address provided"}'));
    // }
    // TODO Comment the following after generating the metacar address dynamically
    const metaCarAddress = 'bafybeif6iuokmmcuwj7jgscybx3gvlcwkb6ybspwcduivl7mbqmgmmxubi';
    response = spawnSync(`npx hardhat set-base-token-uri --base-url "https://${metaCarAddress}.ipfs.dweb.link/metadata/"`, [], {shell: true})
    if(response.error) {
        console.log("Error while generating the metadata:", response.error);
        return res.status(500).send(JSON.parse('{"message":"Error while generating the metadata"}'));
    }
    console.log('Deployed MetaCar...')
    console.log('Status:', response.stdout.toString());
    const metaAddressRegex = /(Transaction Hash: [^]*)/;
    const transactionHash = response.stdout.toString().match(metaAddressRegex)[1].split(":")[1].trim();
    const data = { message: "Successfuly deployed the meta...", transactionHash: transactionHash};
    res.status(200).send(JSON.parse(JSON.stringify(data)));
});


app.get('/getting-ready', function (req, res){
    console.log('Compiling...');
    let response = spawnSync('ls', [], {shell: true})
    if(response.error) {
        console.log("Error while compiling the code:", response.error);
        return res.status(500).send(JSON.parse('{"message":"Error Compiling The Code"}'));
    }
    console.log('Finshed Compiling...');
    console.log('Deploying...');

    response = spawnSync('npx hardhat deploy', [], {shell: true})
    if(response.error) {
        console.log("Error while deploying new contract: ", response.error);
        return res.status(500).send(JSON.parse('{"message":"Error Deploying The Contract."}'));
    }

    console.log('Finished Deploying...');
    console.log('Status...', response.stdout.toString());

    const contractAddressRegex = /(Contract deployed to address: [^]*)/;
    const contractAddress = response.stdout.toString().match(contractAddressRegex)[1].split(":")[1].trim();
    const data = { message: "Successfuly deployed the contract...", contractAddress: contractAddress};
    process.env.contactAddress = contractAddress;
    res.status(200).send(JSON.parse(JSON.stringify(data)));
});


app.get('/', function (req, res) {
    res.render('index');
});

var server = app.listen(3000, function () {
    console.log('Node server is running on port 3000..');
    console.log('http://localhost:3000');
});