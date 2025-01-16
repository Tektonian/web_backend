#!/bin/bash

SEQ=sequelize
DB_NAME=tektonian
DB_URL=mysql://$2:$3@localhost/${DB_NAME}

DB_USER=$2
DB_PASSWORD=$3

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

    cp seeders/* ${SEQ}/seeders
    npx sequelize-auto -h "localhost" -d ${DB_NAME} -u ${DB_USER} -x ${DB_PASSWORD} -e mysql -o "${SEQ}/models" -v true -p 3306
    echo "[4] copying done"
}

function set {
    echo "Ready for test setting"
    echo "generating dummy data"

    dir
    copy

    echo "Replace strings, timestamps: true -> timestamps: false"
    sed -i "" -e "s/timestamps: true/timestamps: false/g" ${SEQ}/models/*

    echo "Replace of strings, type: "POINT" -> type: DataTypes.GEOMETRY"
    sed -i "" -e 's/type: "POINT"/type: DataTypes.GEOMETRY/g' ${SEQ}/models/*
}

function clean {
    rm -rf ${SEQ}
}

function gen_data {
    echo "Generating data"
    echo "Check sequelize/config file before you run the script"
    cp seeders/* ${SEQ}/seeders/
    cd ${SEQ}
    npx sequelize-cli db:seed --url ${DB_URL} --seed dummy-orgn dummy-user dummy-consumer dummy-school dummy-student dummy-request dummy-search dummy-review dummy-exam
    cd ..
}

function clean_data {
    echo "Cleaning data"
    echo "Check sequelize/config file before you run the script"
    cd ${SEQ}
    npx sequelize-cli --url ${DB_URL} db:seed:undo:all
    cd ..
}

function help {
    echo "usage: bash set_test_env [function] [DB user name] [DB user password]"
    echo "function list"
    echo "set: Prepare test setting"
    echo "gen_data: generating dummy data"
    echo "clean_data: cleaning dummy data"
    echo "clean: remove sequelizer folder"
}

if [[ $# -ne 3 ]] ;
then
    help
else
    $1
fi