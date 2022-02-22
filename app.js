const { spawnSync } = require('child_process');
const socketIO = require('socket.io');
const path = require("path");
const express = require('express');
const app = express();
const http = require('http');
const exec = require('child_process').exec

app.set("view engine","jade");
app.get('/', function (req, res) {
    res.render('index');
});


const server = http.createServer(app)
const io = socketIO(server)

// make a connection with the user from server side
io.on('connection', (socket)=>{
    console.log('New user connected');
    socket.on('getStarted', ()=>{
        console.log('Compiling...');
        exec('npx hardhat compile', (err, stdout, stderr) => {
            console.log('Finshed Compiling...');
            if (err) {
                console.log("Error while compiling the code:", stderr);
                socket.emit('getStartedResponse', { message: '', error: err, body: {}});
            } else {
                console.log(stdout.toString())
                console.log('Deploying...');
    
                exec('npx hardhat deploy', (err, stdout, stderr) => {
                    if (err) {
                        console.log("Error while deploying new contract: ", stderr);
                        socket.emit('getStartedResponse', { message: '', error: err, body: {}});
                    } else {
                        
                        console.log('Finished Deploying...');
                        console.log('Status...', stdout.toString());
    
                        const contractAddressRegex = /(Contract deployed to address: [^]*)/;
                        const contractAddress = stdout.toString().match(contractAddressRegex)[1].split(":")[1].trim();
                        process.env.contactAddress = contractAddress;

                        socket.emit('getStartedResponse', { message: "Successfuly deployed the contract...", error: err, contractAddress: contractAddress });
                    }
                });
            }
        });
    });

    socket.on('preparingMetadata', ()=>{

        console.log('Preparing MetaCar...')
        // const { metaCarAddress } = req.query;
        // if( !metaCarAddress ) {
        //     return res.status(500).send(JSON.parse('{"message":"Error No metaCar address provided"}'));
        // }
        // TODO Comment the following after generating the metacar address dynamically
        const metaCarAddress = 'bafybeif6iuokmmcuwj7jgscybx3gvlcwkb6ybspwcduivl7mbqmgmmxubi'; //TODO make it dynamic
        response = spawnSync(`npx hardhat set-base-token-uri --base-url "https://${metaCarAddress}.ipfs.dweb.link/metadata/"`, [], {shell: true})
        if(response.error) {
            console.log("Error while generating the metadata:", response.error);
            socket.emit('preparingMetadataResponse', { message: 'Error while generating the metadata:', error: response.error, body: {}});
        }

        console.log('Deployed MetaCar...')
        console.log('Status:', response.stdout.toString());

        const metaAddressRegex = /(Transaction Hash: [^]*)/;
        const transactionHash = response.stdout.toString().match(metaAddressRegex)[1].split(":")[1].trim();

        socket.emit('preparingMetadataResponse', { message: "Successfuly deployed the meta...", error: response.error, transactionHash: transactionHash});
    });

    socket.on('disconnect', ()=>{
        console.log('disconnected from user');
    });
});

// app.set("view engine","jade");

//TODO make public urls static for images

// server.get('/minting', function (req, res){
//     console.log('Initiating minting...')
//     const { walletAddress } = req.query;
//     if( !walletAddress ) {
//         return res.status(500).send(JSON.parse('{"message":"Error No wallet address provided"}'));
//     }

//     console.log('NFT minted...')
//     // const userAddress = '0xb9720BE63Ea8896956A06d2dEd491De125fD705E';
//     response = spawnSync(`npx hardhat mint --address ${walletAddress}`, [], {shell: true})
//     if(response.error) {
//         console.log("Error while minting:", response.error);
//         return res.status(500).send(JSON.parse('{"message":"Error while minting the NFT"}'));
//     }
//     res.status(200).send(JSON.parse('{"success":"Hey"}'));
// });


server.listen(process.env.PORT || 5000, function () {
    console.log('Node server is running on port 5000..');
    console.log('http://localhost:5000');
});