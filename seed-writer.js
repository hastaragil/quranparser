var fs = require('fs-extra-promise');
var _ = require('lodash');
var Promise = require("bluebird");

var config = {};

var lang = [];
//language

fs.readFileAsync('seed-writer-config.json').then(function (result) {
    config = JSON.parse(result.toString());
    return config;
}).then(function (config) {
    return fs.readFileAsync(__dirname + '/' + config.language_file).then(function (language) {
        lang = JSON.parse(language.toString());

        var write = {
            name: 'language',
            data: lang
        };

        fs.writeFile(__dirname + '/database/language.json', JSON.stringify(write));
        return config;
    }).then(function (config) {
        return config;
    })
}).then(function (config) {
    return fs.readFileAsync(__dirname + '/' + config.surah_file).then(function (surah) {
        var surahParsed = JSON.parse(surah.toString());

        var write = {
            name: 'surah',
            data: surahParsed
        };

        fs.writeFile(__dirname + '/database/surah.json', JSON.stringify(write));

        return config;
    }).then(function (config) {
        return config;
    })
}).then(function (config) {

    return Promise.all(_.map(lang, function (language) {
        return fs.readFileAsync(__dirname + '/result/' + language.name + '.json');
    })).then(function (result) {
        var surahCompiled = {
            name: 'ayah',
            data: []
        };

        _.each(result, function (surah) {
            _.each(JSON.parse(surah.toString()), function (ayah) {
                surahCompiled.data.push(ayah);
            })
        });

        return surahCompiled;
    });
}).then(function (ayahCompiled) {
    fs.writeFile(__dirname + '/database/ayah.json', JSON.stringify(ayahCompiled));
});