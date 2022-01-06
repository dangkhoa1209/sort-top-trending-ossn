
module.exports.sort = async function(){
    var mysql = require('mysql');
    require('dotenv').config();
    const config = require('../../config.json');

    const timenow = Math.ceil( (new Date().getTime()) / 1000 ) - 24*60*60;

    const tables = {
        ossn_object            : "ossn_object",
        ossn_likes             : "ossn_likes",
        ossn_annotations       : "ossn_annotations",
        ossn_votes             : "ossn_votes",
        ossn_entities_metadata : "ossn_entities_metadata",
        ossn_entities          : "ossn_entities"
    }

    const type_social = {
        facebook : 1,
        tiktok   : 2,
        youtube  : 3,
        twitter  : 4
    }

    var data_ossn_object            = [];
    var data_ossn_likes             = [];
    var data_ossn_annotations       = [];
    var data_ossn_votes             = [];
    var data_ossn_entities          = [];
    var data_ossn_share             = [];
    var data_ossn_sum_point         = [];


    var con = mysql.createConnection({
        host      : config.HOST,
        user      : config.USERNAME,
        password  : config.PASSWORD,
        database  : config.DATABASE
    });

    con.connect(function(err) {
        if(err){
            console.log(err);
        }
    });




    return new Promise(async function(resolve){
        if(con.state != 'authenticated'){
            if(! await checkBD()){
                createData();
            }
            await sortSocial('facebook');
            await sortSocial('tiktok');
            await sortSocial('youtube');
            await sortSocial('twitter');
            con.end();
            resolve(true);
        }else{
            con.connect(function(err) {
                console.log(err);
            });
            con.end();
            resolve(false);
        }
    });
        

    //ALTER TABLE ossn_object_top AUTO_INCREMENT = 1;
    function checkBD(){
        return new Promise((resolve) => {
            con.query(`SELECT * FROM ossn_object_top`, function (err, result) {
                if(err){
                    console.log("Error connect DB");
                    resolve(false);
                }

                if(result.length == 0){
                    resolve(false);
                }else{
                    resolve(true);
                }
            });
        });
        
    }

    function createData(){
        for(let i = 1; i <= 100; i++){
            con.query("INSERT INTO `ossn_object_top`(`id_object_facebook`, `id_object_tiktok`, `id_object_youtube`, `id_object_twitter`) VALUES (null, null, null, null);", function (err, result) {
                if(err){
                    console.log(err);   
                }
            });
        }
    }

    //Sort theo từng mạng xã hội
    async function sortSocial(type_social_tmp){

        await resetData();
        data_ossn_object = await getValueObject(type_social_tmp);
        if(data_ossn_object.length != 0){
            await setCountLike();
            await setCountComment();
            await setCountVote();
            await setCountEntities();
            await sleep(500);
            await setCountShare();
            await setPoint();
            await sortTop();
            await addDataToDatabase(type_social_tmp);
        }else{
            await addDataToDatabase(type_social_tmp);
        }
        return;
    }


    ///Sleep
    function sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    //Xoa du lieu
    function resetData(){
        data_ossn_object            = [];
        data_ossn_likes             = [];
        data_ossn_annotations       = [];
        data_ossn_votes             = [];
        data_ossn_entities          = [];
        ossn_entities_metadata      = [];
        data_ossn_share             = [];
        data_ossn_sum_point         = [];
    }


    //Lưu dữ liệu vào biến
    const setOutput = (valuename, value) => {
        if(valuename == 'object'){
                data_ossn_object = value;
        }
    return;
    }


    function sortTop(){
        data_ossn_sum_point = data_ossn_sum_point.sort(function(objectA, objectB){
            return objectB.count - objectA.count;
        });
    }

    function addDataToDatabase(type){

        let type_social_tmp = "";

        if(type == "facebook"){
            type_social_tmp = "id_object_facebook";
        }

        if(type == "tiktok"){
            type_social_tmp = "id_object_tiktok";
        }

        if(type == "youtube"){
            type_social_tmp = "id_object_youtube";
        }

        if(type == "twitter"){
            type_social_tmp = "id_object_twitter";
        }


        if(data_ossn_sum_point.length >= 100){
            data_ossn_sum_point.forEach(async (element, index) => {
                if(index < 100){
                    con.query(`UPDATE ossn_object_top SET ${type_social_tmp} = ${element.guid} WHERE guid = ${index+1}`, function (err, result) {
                        if(err){
                            console.log(err);   
                        }
                    });
                }
            });
        }else{
            for(let index = 0; index <= 99; index++){
                if(index + 1 <= data_ossn_sum_point.length){
                    con.query(`UPDATE ossn_object_top SET ${type_social_tmp} = ${data_ossn_sum_point[index].guid} WHERE guid = ${index+1}`, function (err, result) {
                        if(err){
                            console.log(err);   
                        }
                    });
                }else{
                    con.query(`UPDATE ossn_object_top SET ${type_social_tmp} = ${null} WHERE guid = ${index+1}`, function (err, result) {
                        if(err){
                            console.log(err);   
                        }
                    });
                }
            }
        }


    }

    function setCountLike(){
    
        return new Promise(resolve => {
            data_ossn_object.forEach(async (element, index) => {
                data_ossn_likes.push({
                    "guid"  : element.guid,
                    "count" : await countLikeByIdObject(element.guid),
                });
                if(index == data_ossn_object.length - 1){
                    resolve(true);
                }
            });
        })
    }


    function setCountComment(){
        return new Promise(resolve => {
            data_ossn_object.forEach(async (element, index) => {
                data_ossn_annotations.push({
                    "guid"  : element.guid,
                    "count" : await countCommentByIdObject(element.guid),
                });
                if(index == data_ossn_object.length - 1){
                    resolve(true);
                }
            });
        })
    }


    function setCountVote(){
        return new Promise(resolve => {
            data_ossn_object.forEach(async (element, index) => {
                data_ossn_votes.push({
                    "guid"  : element.guid,
                    "count" : await countVoteByIdObject(element.guid),
                });
                if(index == data_ossn_object.length - 1){
                    resolve(true);
                }
            });
        })
    }

    function setCountEntities(){
        return new Promise(resolve => {
            data_ossn_object.forEach(async (element, index) => {
                await countEntitiesByIdObject(element.guid);
                if(index == data_ossn_object.length - 1){
                    resolve(data_ossn_entities);
                }
            });
        })
    }

    function setCountShare(){
        return new Promise(resolve => {
            data_ossn_object.forEach(async (element, index) => {
                data_ossn_share.push({
                    "guid"  : element.guid,
                    "count" : await countShareByIdObject(element.guid),
                });
                if(index == data_ossn_object.length - 1){
                    resolve(true);
                }
            });
        })
    }

    function setPoint(){
        return new Promise(resolve => {
            data_ossn_object.forEach(async (element, index) => {
                data_ossn_sum_point.push({
                    "guid"  : element.guid,
                    "count" : await sumPoint(element.guid),
                });
                if(index == data_ossn_object.length - 1){
                    resolve(true);
                }
            });
        })
    }


    //Lay so like da duoc luu vao bien truoc do tu id
    function getLikeCount(id){
        return new Promise(resolve => {
            data_ossn_likes.forEach(async function(element){
                if(element.guid == id){
                    resolve(element.count);
                }
            });  
        })
    }

    function getCommentCount(id){
        return new Promise(resolve => {
            data_ossn_annotations.forEach(async function(element){
                if(element.guid == id){
                    resolve(element.count);
                }
            });  
        })
    }

    function getVoteCount(id){
        return new Promise(resolve => {
            data_ossn_votes.forEach(async function(element){
                if(element.guid == id){
                    resolve(element.count);
                }
            });  
        })
    }

    function getShareCount(id){
        return new Promise(resolve => {
            data_ossn_share.forEach(async function(element){
                if(element.guid == id){
                    resolve(element.count);
                }
            });  
        })
    }


    function sumPoint(id){
        return new Promise(async resolve => {
            let countLike    = await getLikeCount(id);
            let countComment = await getCommentCount(id);
            let countVote    = await getVoteCount(id);
            let countShare   = await getShareCount(id);
            let point = countLike * 0.5 + countComment + countShare * 2 + countVote * 4;
            resolve(point);
        })
    }


    //Lấy dữ liệu từ database
    function getValueObject(type){
        
        let type_social_tmp = "";

        if(type == "facebook"){
            type_social_tmp = type_social.facebook;
        }

        if(type == "tiktok"){
            type_social_tmp = type_social.tiktok;
        }

        if(type == "youtube"){
            type_social_tmp = type_social.youtube;
        }

        if(type == "twitter"){
            type_social_tmp = type_social.twitter;
        }


        return new Promise(resolve => {
            con.query(`SELECT guid FROM ${tables.ossn_object} WHERE (social_type = ${type_social_tmp} AND time_created >= '${timenow}' AND post_type = 1)`, function (err, result, fields) {
                if(err){
                    resolve(false);
                }else{
                    resolve(result);
                }
            }); 
        })
    
    }

    function countLikeByIdObject(id){
        return new Promise(resolve => {
            con.query(`SELECT id FROM ${tables.ossn_likes} WHERE (subject_id = '${id}')`, function (err, result, fields) {
                if(err){
                    resolve(0);
                }else{
                    resolve(result.length);
                }
            });
        })
    }


    function countCommentByIdObject(id){
        return new Promise(resolve => {
            con.query(`SELECT id FROM ${tables.ossn_annotations} WHERE (subject_guid = '${id}')`, function (err, result, fields) {
                if(err){
                    resolve(0);
                }else{
                    resolve(result.length);
                }
            });
        })
    }

    function countVoteByIdObject(id){
        return new Promise(resolve => {
            con.query(`SELECT id FROM ${tables.ossn_votes} WHERE (subject_id = '${id}')`, function (err, result, fields) {
                if(err){
                    resolve(0);
                }else{
                    resolve(result.length);
                }
            });
        })
    }


    function countEntitiesByIdObject(id){
        return new Promise(resolve => {
            con.query(`SELECT guid FROM ${tables.ossn_entities_metadata} WHERE (value = '${id}')`, function (err, result, fields) {
                if(err){
                    console.log(err);
                }else{
                    if(result.length > 0 ){
                        result.forEach((item, index) => {
                            guid = item.guid;
                            con.query(`SELECT * FROM ${tables.ossn_entities} WHERE (guid='${guid}' AND subtype != 'comments:post');`, function (err, result, fields) {
                                if(err){
                                    console.log(err);
                                }else{
                                    if(result.length >= 1){
                                        data_ossn_entities.push({
                                            "guid" : id, 
                                            "count": result.length
                                        })
                                    }
                                }
                            });
        
                            if(index >= result.length - 1){
                                resolve(true);
                            }
                        });
                    }else{
                        resolve(true);
                    }
                }
            });
        })
    }


    function countShareByIdObject(id){
        return new Promise(resolve => {
            if(data_ossn_entities.length == 0){
                resolve(0);
            }

            var count = 0;
            data_ossn_entities.forEach((entity, index) => {
                if(id == entity.guid){
                    count += 1;
                }
                if(index >= data_ossn_entities.length - 1){
                    resolve(count);
                }
            });  
        })
    }


};