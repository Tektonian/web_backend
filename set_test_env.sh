#!/bin/bash

SEQ=sequelize

function dir {
    echo "[1] make directory"

    mkdir ${SEQ}
    cp package.json ${SEQ}/package.json
    cd ${SEQ}
    npx sequelize-cli init
    sed -i '' '/.*module.*/d' ./package.json
    cd ..

    echo "[2] directory set"
}

function copy {
    echo "[3] copying datas"

    cp seeders/* ${SEQ}/seeders/
    npx sequelize-auto -h "localhost" -d "tektonian" -u "test_user" -e "mysql" -o "${SEQ}/models" -v true -p 3306
    echo "[4] copying done"
}

function set {
    echo "Ready for test setting"
    echo "generating dummy data"

    dir
    copy
}

function clean {
    rm -rf ${SEQ}
}

function gen_data {
    echo "Generating data"
    echo "Check sequelize/config file before you run the script"
    cp seeders/* ${SEQ}/seeders/
    cd ${SEQ}
    npx sequelize-cli db:seed --seed dummy-orgn dummy-user dummy-consumer dummy-school dummy-student dummy-request dummy-search dummy-review dummy-exam
    cd ..
}

function clean_data {
    echo "Cleaning data"
    echo "Check sequelize/config file before you run the script"
    cd ${SEQ}
    npx sequelize-cli db:seed:undo:all
    cd ..
}

function help {
    echo "usage: bash set_test_env [function]"
    echo "function list"
    echo "set: Prepare test setting"
    echo "gen_data: generating dummy data"
    echo "clean_data: cleaning dummy data"
    echo "clean: remove sequelizer folder"
}

if [[ $# -eq 0 ]] ;
then
    help
else
    $1
fi