const mongoose = require("mongoose");
const State = require("../modules/state");

const states = [
  { state_id: 1, name: "Andhra Pradesh" },
  { state_id: 2, name: "Arunachal Pradesh" },
  { state_id: 3, name: "Assam" },
  { state_id: 4, name: "Bihar" },
  { state_id: 5, name: "Chhattisgarh" },
  { state_id: 6, name: "Goa" },
  { state_id: 7, name: "Gujarat" },
  { state_id: 8, name: "Haryana" },
  { state_id: 9, name: "Himachal Pradesh" },
  { state_id: 10, name: "Jharkhand" },
  { state_id: 11, name: "Karnataka" },
  { state_id: 12, name: "Kerala" },
  { state_id: 13, name: "Madhya Pradesh" },
  { state_id: 14, name: "Maharashtra" },
  { state_id: 15, name: "Manipur" },
  { state_id: 16, name: "Meghalaya" },
  { state_id: 17, name: "Mizoram" },
  { state_id: 18, name: "Nagaland" },
  { state_id: 19, name: "Odisha" },
  { state_id: 20, name: "Punjab" },
  { state_id: 21, name: "Rajasthan" },
  { state_id: 22, name: "Sikkim" },
  { state_id: 23, name: "Tamil Nadu" },
  { state_id: 24, name: "Telangana" },
  { state_id: 25, name: "Tripura" },
  { state_id: 26, name: "Uttar Pradesh" },
  { state_id: 27, name: "Uttarakhand" },
  { state_id: 28, name: "West Bengal" },
  { state_id: 29, name: "Andaman and Nicobar Islands" },
  { state_id: 30, name: "Chandigarh" },
  { state_id: 31, name: "Dadra and Nagar Haveli and Daman and Diu" },
  { state_id: 32, name: "Delhi" },
  { state_id: 33, name: "Jammu and Kashmir" },
  { state_id: 34, name: "Ladakh" },
  { state_id: 35, name: "Lakshadweep" },
  { state_id: 36, name: "Puducherry" }
];

const dbUrl = 'mongodb://127.0.0.1:27017/wanderlust';

main()
  .then(() => {
    console.log("SUCCESSFULLY CONNECTED WITH SERVER");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}
const init = async () => {
    await State.deleteMany();
    await State.insertMany(states);
    console.log("successfully inserted");
}

init();
