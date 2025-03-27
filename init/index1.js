const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../modules/listing.js");


main().then ( (res) => {
    console.log( "SUCCESSFULLY CONNECTED WITH SERVER" )
}).catch ( (err) => {
    console.log( err )
})

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust')
}

const init = async () => {
    await Listing.deleteMany();
    initData.data = initData.data.map((obj)=> ({...obj, owner: '67da489d04b323b4b40dad97'}))
    await Listing.insertMany(initData.data);
    console.log("successfully inserted");
}

init();

