//Required libraries
let Promise = require('promise');
let request = require('request');
let cheerio = require('cheerio');
let fs = require('fs');




//List of promises to create
let Promises2 = [];
let Indiv2 = [];

let Restaurants = [];
let cpt2 = 1;

//Creating promises
function promises2() {
    for (let i = 1; i <= 37; i++) {
        let url = 'https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin/page-' + i.toString();
        Promises2.push(fillingRestaurants(url));
        console.log("Page n°" + i + " de restaurants etoiles ajoutée");
    }
}

function Individual2() {
    return new Promise(function (resolve) {
        if (cpt2 === 1) {
            for (let i = 0; i < Restaurants.length / 2; i++) {
                let restaurantURL = Restaurants[i].url;
                Indiv2.push(RestaurantInfo(restaurantURL, i));
                console.log("Ajout du " + i + "eme restaurant a la liste");
            }
            resolve();
            cpt2++;
        }
        if (cpt2 === 2) {
            for (let i = Restaurants.length / 2; i < Restaurants.length; i++) {
                let restaurantURL = Restaurants[i].url;
                Indiv2.push(RestaurantInfo(restaurantURL, i));
                console.log("Ajout du " + i + "eme restaurant a la liste");
            }
            resolve();
        }
    })
}

//Fetching list
function fillingRestaurants(url) {
    return new Promise(function (resolve, reject) {
        request(url, function (err, res, html) {
            if (err) {
                console.error(err);
                return reject(err);
            }
            else if (res.statusCode !== 200) {
                err = new Error("Erreur : " + res.statusCode);
                err.res = res;
                console.error(err);
                return reject(err);
            }
            let $ = cheerio.load(html);
            $('.poi-card-link').each(function () {
                let data = $(this);
                let link = data.attr("href");
                let url = "https://restaurant.michelin.fr/" + link;
                Restaurants.push({ "name": "", "postalCode": "", "chef": "", "url": url })
            });
            resolve(Restaurants);
        });
    });
}

//Getting all detailed info for the JSON file
function RestaurantInfo(url, index) {
    return new Promise(function (resolve, reject) {
        request(url, function (err, res, html) {
            if (err) {
                console.error(err);
                return reject(err);
            }
            else if (res.statusCode !== 200) {
                err = new Error("Erreur : " + res.statusCode);
                err.res = res;
                console.error(err);
                return reject(err);
            }

            const $ = cheerio.load(html);
            $('.poi_intro-display-title').first().each(function () {
                let data = $(this);
                let name = data.text();
                name = name.replace(/\n/g, "");
                Restaurants[index].name = name.trim();
            });

            $('.postal-code').first().each(function () {
                let data = $(this);
                let pc = data.text();
                Restaurants[index].postalCode = pc;
            });

            $('#node_poi-menu-wrapper > div.node_poi-chef > div.node_poi_description > div.field.field--name-field-chef.field--type-text.field--label-above > div.field__items > div').first().each(function () {
                let data = $(this);
                let chefname = data.text();
                Restaurants[index].chef = chefname;
            });
            console.log("Ajout du " + i + "eme restaurant a la liste");
            resolve(Restaurants);
        });
    });
}

//Saving the json
function savingJson2() {
    return new Promise(function (resolve) {
        try {
            console.log("Ecriture du Json");
            let jsonRestaurants = JSON.stringify(Restaurants);
            fs.writeFile("Restaurants.json", jsonRestaurants, function doneWriting(err) {
                if (err) { console.error(err); }
            });
        }
        catch (error) {
            console.error(error);
        }
        resolve();
    });
}




promises2();
Promise.all(promises2)
    .then(Individual2)
    .then(() => { return Promise.all(Indiv2); })
    .then(Individual2)
    .then(() => { return Promise.all(Indiv2); })
    .then(savingJson2)
    .then(() => { console.log("Reussi") });

module.exports.getRestaurantsJSON = function () {
    return JSON.parse(fs.readFileSync("Restaurants.json"));
};