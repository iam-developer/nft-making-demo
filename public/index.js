document.querySelector('.wallet-connect').disabled = false;

function generateNft() {
    //TODO add condition to check balance using npx hardhat check-balance
    const walletAddress = $('#walletAddress').val();
    if(!walletAddress){
        alert("Please enter valid wallet address")
        return
    }

    resetModal(); //reseting the modal for new process
    $('.progress-modal').addClass('active');
    handleProgress(0, 'Getting Started...')
    setCloseModal(true);
    socket.emit('getStarted', { walletAddress: walletAddress })
}

function getStartedResponse(response={}){
    const walletAddress = $('#walletAddress').val();
    const { error } = response;

    if(error) {
        return handleError(0, response)
    }

    handleProgress(1, 'Generating Metas...')
    socket.emit('preparingMetadata', { walletAddress: walletAddress })
}

function preparingMetadataResponse(response={}) {
    const circleContainer = $('.circle-container');
    const { error, transactionHash } = response;

    if(error){
        return handleError(2, response)
    }
    
    handleProgress(2, "Minting NFT's...");
    console.log('Meta deploy transactional hash', transactionHash);

    const nftNumber = parseInt($('#nft_number').val());
    const walletAddress = $('#walletAddress').val();

    for(let i=0; i<nftNumber; i++) {

        const mintingId = `minting-${i}`;
        console.log('Minting: ', mintingId);

        mintIds.push(mintingId);
        socket.emit('minting', {
            walletAddress: walletAddress,
            mintingId: mintingId
        });

        mintIds = [...new Set(mintIds)];
    }
}

function mintingResponse(response={}){
    const { error, mintedId, message } = response;
    const walletAddress = $('#walletAddress').val();

    if(!error) {
        //add code for handling multiple minting nft take a total mint variable
        mintIds = [...mintIds.filter(item => item !== mintedId)]
    }
    else {
        console.log('Something went wrong...Error Occured while minting:', mintedId);
        console.log('MESSAGE: ', message);
    }

    if(!mintIds.length) {
        handleProgress(3, `Successfuly minted NFT` );
        setCloseModal(false);
    }
}