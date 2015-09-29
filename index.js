/**
 * Created by hastaragil on 9/19/15.
 */

var parse = require('csv-parse');
var Promise = require("bluebird");
var fs = require('fs-extra-promise');
var _ = require('lodash');
var uuid = require('node-uuid');

var output = [];

var config = [];

var language = [];

var surahObject = {};

fs.readFileAsync('parser-config.json')
    .then(function (config) {
        language = _.map(JSON.parse(config.toString()), function (lang) {
            return {
                id: uuid.v4(),
                name: lang.language_name
            }
        });

        fs.writeFile(__dirname + '/result/language.json', JSON.stringify(language));

        return config;
    })
    .then(function (config) {

        return Promise.all(_.map(JSON.parse(config.toString()), function (lang) {
            return fs.ensureDirAsync(__dirname + '/surah/' + lang.language_name)
                .then(function (result) {
                    return fs.readFileAsync(__dirname + '/' + lang.csv_path)
                })
                .then(function (file) {
                    return Promise.resolve(file).then(function (file) {

                        parse(file.toString(), {
                            delimiter: ',',
                            columns: ['database_id', 'surah_number', 'verse_number', 'ayah_text']
                        }, function (err, output) {

                            var surahs = _.groupBy(output, function (n) {
                                return n.surah_number;
                            });

                            return Promise.all(_.map(surahs, function (surah, surahNumber) {
                                surahObject[surahNumber] = surah.length;
                                return fs.writeFileAsync(__dirname + '/surah/' + lang.language_name + '/' + surahNumber + '.json', JSON.stringify(surah));
                            }));
                        });

                    });
                })
                .catch(function (error) {
                    console.error(error);
                });

        }));
    }).then(function (result) {
        fs.readFileAsync(__dirname + '/raw/surah.csv').then(function (file) {

            parse(file.toString(), {
                delimiter: ',',
                columns: ['surah_number', 'name', 'meaning']
            }, function (err, output) {
                var result = _.map(output, function (surah) {
                    console.log(_.extend(surah, {id: uuid.v4(), total_ayah: surahObject[surah.surah_number]}));
                    return _.extend(surah, {id: uuid.v4(), total_ayah: surahObject[surah.surah_number]});
                });

                fs.writeFile(__dirname + '/result/surah.json', JSON.stringify(result));
            });
        });
    });
