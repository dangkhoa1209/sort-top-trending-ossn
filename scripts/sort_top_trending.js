const schedule = require("node-schedule");

const sortTopTrending = require("../app/consoles/sortTopTrending");

function runSortTopTrending(){
    console.log("Waiting to run");
    //var posts = schedule.scheduleJob("0 */0 * * * * ", function () {
        sortTopTrending.sort(function (err, result) {
            if (err) {
              console.log(err);
            }
            
        });
        console.log("qua day rồi");
        return "";
    //});
};

//runSortTopTrending();

// schedule.scheduleJob({hour: 2, minute: 00}, function () {
//     console.log("Chờ run");
//     runSortTopTrending();
// });

console.log("Chờ run");
var index = 0;
schedule.scheduleJob("*/30 * * * * *", function() {
    index += 1;
    runSortTopTrending();
    console.log("Chờ run " + index);
});
