var cheerio = require('cheerio');


var http = require('http');

var months = [
    'http://www.nippes-wetter.de/Tabellen/2015/m201501.htm',
    'http://www.nippes-wetter.de/Tabellen/2015/m201502.htm',
    'http://www.nippes-wetter.de/Tabellen/2015/m201503.htm',
    'http://www.nippes-wetter.de/Tabellen/2015/m201504.htm',
    'http://www.nippes-wetter.de/Tabellen/2015/m201505.htm',
    'http://www.nippes-wetter.de/Tabellen/2015/m201506.htm',
    'http://www.nippes-wetter.de/Tabellen/2015/m201507.htm',
    'http://www.nippes-wetter.de/Tabellen/2015/m201508.htm',
    'http://www.nippes-wetter.de/Tabellen/2015/m201509.htm',
    'http://www.nippes-wetter.de/Tabellen/2015/m201510.htm',
    'http://www.nippes-wetter.de/Tabellen/2015/m201511.htm',
    'http://www.nippes-wetter.de/Tabellen/2015/m201512.htm'
];

var allMonths = {};
console.log('{');
for (var i = months.length - 1; i >= 0; i--) {
    var request = http.request(months[i], function(res) {
        var data = '';
        res.on('data', function(chunk) {
            data += chunk;
        });
        res.on('end', function() {
            $ = cheerio.load(data);
            var result = {};
            $('table tr').each(function(index, element) {
                if ($(this).find('td:nth-child(1) nobr').text().trim().length == 10) {
                    result[$(this).find('td:nth-child(1) nobr').text().trim()] = {};
                    item = result[$(this).find('td:nth-child(1) nobr').text().trim()];
                    item['from'] = $(this).find('td:nth-child(3) nobr font').text().trim().substr(10).replace(' �C', '').replace(',', '.');
                    item['to'] = $(this).find('td:nth-child(4) nobr font').text().trim().substr(10).replace(' �C', '').replace(',', '.');
                    item['rainfall'] = $(this).find('td:nth-child(11) nobr').text().trim().replace(' l/m�', '').replace(',', '.');
                }
            });
            index = i+1+"";
            console.log(JSON.stringify({index:result})+', ');
        });
    });
    request.end();
};
console.log('}');

