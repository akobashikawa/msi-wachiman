var express = require('express');
var request = require('request');
var router = express.Router();
var fs = require('fs');
var jsonfile = __dirname + '/apoyo-opera-a-pnp-pretty.json';

/* GET home page. */
router.get('/', function(req, res, next) {

    res.render('index.html', {
        title: 'Express'
    });

});

router.get('/importitems', function(req, res, next) {

    var urlbase = 'http://api.datosabiertos.msi.gob.pe/datastreams/invoke/';
    var guid = 'CONSO-INTER-SEREN-31211';
    var key = '36bbab417f3b3b13d76b45a8fc30c39e652e2cca';
    var limit = req.query.limit || '10';
    var page = req.query.page || '0';
    var action = req.query.action || 'write';
    console.log(limit, page);
    var url = urlbase + guid + '?auth_key=' + key + '&output=json_array&limit=' + limit + '&page=' + page;

    console.log('url: %s', url);
    request(url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var bodyJson = JSON.parse(body);
            var result = bodyJson.result;
            var prettyJson = [];
            for (var i = 0; i < result.length; i++) {
                if (page == '0' && i == 0) {
                    continue;
                }
                var item = result[i];
                prettyJson.push({
                    "id": item[0],
                    "tipo": item[1],
                    "categoria": item[2],
                    "numero": item[3],
                    "caso": item[4],
                    "dia": item[5],
                    "fecha": item[6],
                    "hora": item[7],
                    "modalidad": item[8],
                    "medio": item[9],
                    "sector": item[10]
                });
            }
            if (action == 'append') {
                var data = fs.readFileSync(jsonfile);
                fs.writeFileSync(jsonfile, JSON.stringify(JSON.parse(data).concat(prettyJson)));
            } else {
                fs.writeFileSync(jsonfile, JSON.stringify(prettyJson));
            }
            return res.json(prettyJson);
        }
    });

});

router.get('/api/items', function(req, res, next) {

    // fs.readFile(jsonfile, function(err, data) {
    //     if (err) throw err;
    //     var items = JSON.parse(data);
    //     return res.json(items);
    // });
    var data = fs.readFileSync(jsonfile);
    var items = JSON.parse(data);
    return res.json(items);

});

router.get('/api/items/:id', function(req, res, next) {

    var id = req.params.id;

    // fs.readFile(jsonfile, function(err, data) {
    //     if (err) throw err;
    //     var prettyJson = JSON.parse(data);
    //     var match = prettyJson.filter(function(el) {
    //         return el.id == id;
    //     });
    //     if (match.length) {
    //         item = match;
    //     } else {
    //         item = [{}];
    //     }
    //     return res.json(item[0]);
    // });

    var data = fs.readFileSync(jsonfile);
    var prettyJson = JSON.parse(data);
    var match = prettyJson.filter(function(el) {
        return el.id == id;
    });
    if (match.length) {
        item = match;
    } else {
        item = [{}];
    }
    return res.json(item[0]);

});

function isEmpty(obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop))
            return false;
    }

    return true;
}

router.post('/api/items', function(req, res, next) {
    var item = req.body;
    if (isEmpty(item)) {
        return res.json({});
    }
    // fs.readFile(jsonfile, function(err, data) {
    //     if (err) throw err;
    //     var items = JSON.parse(data);
    //     var lastItem = items[items.length - 1];
    //     var id = parseInt(lastItem.id) + 1;
    //     item.id = id.toString(10);
    //     console.log(item);
    //     items.push(item);
    //     console.log(items);
    //     fs.writeFile(jsonfile, JSON.stringify(items), function(err, data) {
    //         if (err) throw err;
    //         return res.json(item);
    //     });
    // });
    var data = fs.readFileSync(jsonfile);
    var items = JSON.parse(data);
    var lastItem = items[items.length - 1];
    var id = parseInt(lastItem.id) + 1;
    item.id = id.toString(10);
    items.push(item);
    fs.writeFileSync(jsonfile, JSON.stringify(items));
    return res.json(item);
});

router.delete('/api/items/:id', function(req, res, next) {

    var id = req.params.id;

    // fs.readFile(jsonfile, function(err, data) {
    //     if (err) throw err;
    //     var prettyJson = JSON.parse(data);
    //     var match = prettyJson.filter(function(el) {
    //         return el.id == id;
    //     });
    //     if (match.length) {
    //         var items = prettyJson.filter(function(el) {
    //             return el.id != id;
    //         });
    //         fs.writeFile(jsonfile, JSON.stringify(items), function(err, data) {
    //             if (err) throw err;
    //             return res.json(match[0]);
    //         });
    //     } else {
    //         return res.json({});
    //     }
    // });

    var data = fs.readFileSync(jsonfile);
    var prettyJson = JSON.parse(data);
    var match = prettyJson.filter(function(el) {
        return el.id == id;
    });
    if (match.length) {
        var items = prettyJson.filter(function(el) {
            return el.id != id;
        });
        fs.writeFileSync(jsonfile, JSON.stringify(items));
        return res.json(match[0]);
    } else {
        return res.json({});
    }
});

module.exports = router;