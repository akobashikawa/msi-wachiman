var express = require('express');
var request = require('request');
var router = express.Router();
var fs = require('fs');
var jsonfile = __dirname + '/consolidado-pretty-1k.json';

/* GET home page. */
router.get('/', function(req, res, next) {

    res.render('pagina1.html');

});

router.get('/pagina2', function(req, res, next) {

    res.render('pagina2.html');

});

router.get('/general', function(req, res, next) {

    res.render('general.html');

});

router.get('/general-chart', function(req, res, next) {

    var data = fs.readFileSync(jsonfile);
    var items = JSON.parse(data);

    var oCategorias = {};
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var sector = item.sector.substr(0,1);
        console.log(item.categoria, item.sector);
        if (oCategorias[item.categoria] == undefined) {
            oCategorias[item.categoria] = {};
            oCategorias[item.categoria][sector.toString()] = 1;
        } else {
            oCategorias[item.categoria][sector.toString()] += 1;
        }
    }
    console.log(oCategorias);
    var aCategorias = [];
    for (key in oCategorias) {
        aCategorias.push(key);
    }
    console.log(aCategorias);

    res.render('general-chart.html', {
        data: JSON.stringify({
            chart: {
                type: 'bar'
            },
            title: {
                text: 'Incidentes'
            },
            xAxis: {
                categories: aCategorias
            },
            yAxis: {
                title: {
                    text: 'Número de incidentes'
                }
            },
            series: [{
                name: 'Jane',
                data: [1, 0, 4]
            }, {
                name: 'John',
                data: [5, 7, 3]
            }]
        })
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
                    "sector": item[10] || '0-0'
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

router.get('/api/sectores', function(req, res, next) {

    var data = fs.readFileSync(jsonfile);
    var items = JSON.parse(data);

    // agrupar
    var oSubsectores = {};
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var nombre = item.sector;
        if (oSubsectores[nombre] == undefined) {
            oSubsectores[nombre] = 1;
        } else {
            oSubsectores[nombre] += 1;
        }
    }
    // listar
    var aSubsectores = [];
    var maxNumreportesSubsector = 0;
    for (key in oSubsectores) {
        var item = {
            nombre: key,
            numreportes: oSubsectores[key]
        };
        if (maxNumreportesSubsector < item.numreportes) {
            maxNumreportesSubsector = item.numreportes;
        }
        aSubsectores.push(item);
    }
    // ordenar por nombre
    aSubsectores.sort(function(a, b) {
        if (a.nombre < b.nombre) {
            return -1;
        }
        if (a.nombre > b.nombre) {
            return 1;
        }
        return 0;
    });
    console.log('aSubsectores: ', aSubsectores);
    // agrupar por sectores
    var oSectores = {};
    for (var k = 0; k < aSubsectores.length; k++) {
        var item = aSubsectores[k];
        item.color = 'green';
        if (item.numreportes > maxNumreportesSubsector / 3) {
            item.color = 'orange';
        }
        if (item.numreportes > 2 * maxNumreportesSubsector / 3) {
            item.color = 'red';
        }

        var nombreSector = item.nombre.substring(0, 1);
        if (oSectores[nombreSector] == undefined) {
            oSectores[nombreSector] = {
                nombre: nombreSector,
                numreportes: item.numreportes || 0,
                subsectores: []
            };
            oSectores[nombreSector].subsectores.push(item);
        } else {
            oSectores[nombreSector].numreportes += item.numreportes;
            oSectores[nombreSector].subsectores.push(item);
        }
    }
    console.log('maxNumreportesSubsector', maxNumreportesSubsector);
    console.log('oSectores', oSectores);
    // listar
    var aSectores = [];
    for (key in oSectores) {
        var item = oSectores[key];
        item.nombre = key;
        item.numreportesPromedio = item.numreportes / item.subsectores.length;
        item.color = 'green';
        if (item.numreportesPromedio > maxNumreportesSubsector / 3) {
            item.color = 'orange';
        }
        if (item.numreportesPromedio > 2 * maxNumreportesSubsector / 3) {
            item.color = 'red';
        }
        aSectores.push(item);
    }
    console.log(aSectores);
    return res.json(aSectores);

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