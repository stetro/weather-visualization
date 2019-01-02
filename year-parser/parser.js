var cheerio = require('cheerio');


var http = require('https');

var months = [
    'https://www.nippes-wetter.de/Tabellen/2018/m201801.htm',
    'https://www.nippes-wetter.de/Tabellen/2018/m201802.htm',
    'https://www.nippes-wetter.de/Tabellen/2018/m201803.htm',
    'https://www.nippes-wetter.de/Tabellen/2018/m201804.htm',
    'https://www.nippes-wetter.de/Tabellen/2018/m201805.htm',
    'https://www.nippes-wetter.de/Tabellen/2018/m201806.htm',
    'https://www.nippes-wetter.de/Tabellen/2018/m201807.htm',
    'https://www.nippes-wetter.de/Tabellen/2018/m201808.htm',
    'https://www.nippes-wetter.de/Tabellen/2018/m201809.htm',
    'https://www.nippes-wetter.de/Tabellen/2018/m201810.htm',
    'https://www.nippes-wetter.de/Tabellen/2018/m201811.htm',
    'https://www.nippes-wetter.de/Tabellen/2018/m201812.htm'
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
