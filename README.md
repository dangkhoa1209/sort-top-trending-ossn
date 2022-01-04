

## install and run app ##

1. Clone project

2. Install package
    npm install *

3. Create .env file
    HOST        = 
    USERNAME_DB = 
    PASSWORD    = 
    DATABASE    = 

4. create table in ossn

    CREATE TABLE `ossn`.`ossn_object_top` ( `guid` SMALLINT NOT NULL AUTO_INCREMENT , `id_object_facebook` INT NULL DEFAULT NULL , `id_object_tiktok` INT NULL , `id_object_youtube` INT NULL , `id_object_twitter` INT NULL , PRIMARY KEY (`guid`)) ENGINE = InnoDB;

5. Run app
    ## run sort top trending ossn ##
    npm run sort_top_trending
        or
    node scripts/sort_top_trending.js