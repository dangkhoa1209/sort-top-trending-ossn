const schedule = require("node-schedule");

const sortTopTrending = require("../app/consoles/sortTopTrending");

function runSortTopTrending(){
    sortTopTrending.sort(function (err, result) {
        if (err) {
            console.log(err);
        }

        if(result){
            console.log("Done sort");
        }
        
    });
    return "";
};

//runSortTopTrending();

// schedule.scheduleJob({hour: 2, minute: 00}, function () {
//     console.log("Chờ run");
//     runSortTopTrending();
// });

console.log("Waiting to run");
var index = 0;
schedule.scheduleJob({hour: 2, minute: 00}, function() {
    index += 1;
    runSortTopTrending();
    console.log("Waiting to run " + index);
});

// console.log("Waiting to run");
// var index = 0;
// schedule.scheduleJob("*/30 * * * * *", function() {
//     index += 1;
//     runSortTopTrending();
//     console.log("Waiting to run " + index);
// });
