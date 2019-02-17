//Libraries
const scrape = require('./chateaux.js');
const michelinScrape = require('./restaurants.js');
let fs = require('fs');

'use strict';

const relaisJSON = scrape.getHotelsJSON();
const MichelinJSON = michelinScrape.getRestaurantsJSON();

fs.writeFileSync("fichierRelais.json",JSON.stringify(findMutualChefsAndPCs(relaisJSON, MichelinJSON)));

function findMutualChefsAndPCs(relaisList, MichelinList) {
    let Etoiles = [];
    for (let i = 0; i < relaisList.length; i++) {
        for (let j = 0; j < MichelinList.length; j++) {
            if (relaisList[i].chef === MichelinList[j].chef && relaisList[i].postalCode === MichelinList[j].postalCode) {
                Etoiles.push({"hotelName": relaisList[i].name, "restaurantName": MichelinList[j].name, "postalCode": relaisList[i].postalCode, "chef": relaisList[i].chef, "url": relaisList[i].url, "price": relaisList[i].price })
            }
        }
    }
    return Etoiles;
}

console.log("Fichier écrit.");


