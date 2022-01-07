const schedule = require("node-schedule");

const sortTopTrending = require("../app/consoles/sortTopTrending");

function runSortTopTrending(){
    sortTopTrending.sort()   
};
    
console.log("Waiting to run");
var index = 0;

//runSortTopTrending();

//Chay moi 15giay
// schedule.scheduleJob("*/15 * * * * *", function() {
//     index += 1;
//     runSortTopTrending();
//     console.log("Waiting to run " + index);
// });


//Chy luc 2h moi ngay
schedule.scheduleJob({hour: 1, minute: 59}, function() {
    index += 1;
    runSortTopTrending();
    console.log("Waiting to run " + index);
});





