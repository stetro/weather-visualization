var cheerio = require('cheerio');


var http = require('https');

var months = [
    'https://www.nippes-wetter.de/Tabellen/2019/m201901.htm',
    'https://www.nippes-wetter.de/Tabellen/2019/m201902.htm',
    'https://www.nippes-wetter.de/Tabellen/2019/m201903.htm',
    'https://www.nippes-wetter.de/Tabellen/2019/m201904.htm',
    'https://www.nippes-wetter.de/Tabellen/2019/m201905.htm',
    'https://www.nippes-wetter.de/Tabellen/2019/m201906.htm',
    'https://www.nippes-wetter.de/Tabellen/2019/m201907.htm',
    'https://www.nippes-wetter.de/Tabellen/2019/m201908.htm',
    'https://www.nippes-wetter.de/Tabellen/2019/m201909.htm',
    'https://www.nippes-wetter.de/Tabellen/2019/m201910.htm',
    'https://www.nippes-wetter.de/Tabellen/2019/m201911.htm',
    'https://www.nippes-wetter.de/Tabellen/2019/m201912.htm'
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
