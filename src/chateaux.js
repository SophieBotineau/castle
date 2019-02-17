//Required libraries
let Promise = require('promise');
let request = require('request');
let cheerio = require('cheerio');
let fs = require('fs');

//Promises to create
let Indiv = [];
let Promises = [];

let Hotels = [];
let cpt = 1;

//Creating promises
function promise() {
    let url = 'https://www.relaischateaux.com/fr/site-map/etablissements';
    Promises.push(fillingHotels(url));
    console.log("Hotels ajoutes");
}

function Individual() {
    return new Promise(function (resolve) {
        if (cpt === 1) {
            for (let i = 0; i < Math.trunc(Hotels.length / 2); i++) {
                let hotelURL = Hotels[i].url;
                Indiv.push(fillingInfo(hotelURL, i));
                console.log("Ajout du " + i + "eme hotel a la liste");
            }
            resolve();
            cpt++;
        }
        else if (cpt === 2) {
            for (let i = Hotels.length / 2; i < Math.trunc(Hotels.length); i++) {
                let hotelURL = Hotels[i].url;
                Indiv.push(fillingInfo(hotelURL, i));
                console.log("Ajout du " + i + "eme hotel a la liste");
            }
            resolve();
        }
    })
}

//Fetching list
function fillingHotels(url) {
    return new Promise(function (resolve, reject) {
        request(url, function (err, res, html) {
            if (err) {
                console.log(err);
                return reject(err);
            }
            else if (res.statusCode !== 200) {
                err = new Error("Erreur inattendue : " + res.statusCode);
                err.res = res;
                return reject(err);
            }
            let $ = cheerio.load(html);

            let France = $('h3:contains("France")').next();
            France.find('li').length;
            France.find('li').each(function () {
                let data = $(this);
                let url = String(data.find('a').attr("href"));
                let name = data.find('a').first().text();
                name = name.replace(/\n/g, "");
                let chefName = String(data.find('a:contains("Chef")').text().split(' - ')[1]);
                chefName = chefName.replace(/\n/g, "");
                Hotels.push({ "name": name.trim(), "postalCode": "", "chef": chefName.trim(), "url": url, "price": "" })
            });
            resolve(Hotels);
        });
    });
}

//Getting all info
function fillingInfo(url, index) {
    return new Promise(function (resolve, reject) {
        request(url, function (err, res, html) {
            if (err) {
                console.error(err);
                return reject(err);
            }
            else if (res.statusCode !== 200) {
                err = new Error("Erreur: " + res.statusCode);
                err.res = res;
                return reject(err);
            }

            const $ = cheerio.load(html);

            $('span[itemprop="postalCode"]').first().each(function () {
                let data = $(this);
                let pc = data.text();
                Hotels[index].postalCode = String(pc.split(',')[0]).trim();
            });

            $('.price').first().each(function () {
                let data = $(this);
                let price = data.text();
                Hotels[index].price = String(price);
            });
            console.log("Info du " + index + "eme hotel ajoutees");
            resolve(Hotels);
        });
    });
}

//Saving Relais.json
function savingJson() {
    return new Promise(function (resolve) {
        try {
            console.log("JSON edite");
            let jsonHotels = JSON.stringify(Hotels);
            fs.writeFile("Relais.json", jsonHotels, function doneWriting(err) {
                if (err) { console.log(err); }
            });
        }
        catch (error) {
            console.error(error);
        }
        resolve();
    });
}


//Main()
promise();
let prom = Promises[0];
prom
    .then(Individual)
    .then(() => { return Promise.all(Indiv); })
    .then(Individual)
    .then(() => { return Promise.all(Indiv); })
    .then(savingJson)
    .then(() => { console.log("JSON OK") });

module.exports.getHotelsJSON = function () {
    return JSON.parse(fs.readFileSync("Relais.json"));
};