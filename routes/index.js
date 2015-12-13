var express = require('express');
var request = require('request');
var router = express.Router();
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {

    res.render('index.html', {
        title: 'Express'
    });

});

router.get('/api/items', function(req, res, next) {

    fs.readFile(__dirname + '/apoyo-opera-a-pnp-pretty.json', function(err, data) {
        if (err) throw err;
        var items = JSON.parse(data);
        return res.json(items);
    });

});

router.get('/api/items/:id', function(req, res, next) {

    var id = req.params.id;

    fs.readFile(__dirname + '/apoyo-opera-a-pnp-pretty.json', function(err, data) {
        if (err) throw err;
        var prettyJson = JSON.parse(data);
        var match = prettyJson.filter(function(el) {
            return el.id == id;
        });console.log('match', match);
        if (match.length) {
            item = match;
        } else {
            item = [{}];
        }
        return res.json(item[0]);
    });

});

router.post('/api/items', function(req, res, next) {
    console.log(req);

    return res.json({});
});

router.get('/data', function(req, res, next) {

    var mockup = !req.query.mockup || (req.query.mockup && req.query.mockup == 'yes');

    if (!mockup) {

        var urlbase = req.query.urlbase;
        var guid = req.query.guid;
        var key = req.query.key;

        if (!urlbase || !guid || !key) {
            res.status(400).json({
                'error': 'Por favor enviar guid y key'
            });
            return;
        }

        var limit = req.query.limit ? req.query.limit : '10';
        var url = urlbase + guid + '?auth_key=' + key + '&limit=' + limit;

        request(url, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                res.json(body);
                return;
            }
            console.log(error, response, body);
            res.json({
                'error': 'No se pudo realizar la consulta'
            });
            return;
        });

    }

    if (mockup) {
        fs.readFile(__dirname + '/apoyo-opera-a-pnp-pretty.json', function(err, data) {
            if (err) throw err;
            /*
            var dataJson = JSON.parse(data);
            var result = dataJson.result;
            var prettyJson = [];
            for (var i = 1; i < result.length; i++) {
                var item = result[i];console.log(i, item);
                prettyJson[i-1] = {
                    id: item[0],
                    tipo: item[1],
                    categoria: item[2],
                    numero: item[3],
                    caso: item[4],
                    dia: item[5],
                    fecha: item[6],
                    hora: item[7],
                    modalidad: item[8],
                    medio: item[9],
                    sector: item[10]
                };
            }
            */
            var prettyJson = JSON.parse(data);
            console.log(prettyJson);
            return res.json(prettyJson);
        });
    }

});

module.exports = router;