//************************************************//
// This script takes beer advocates top 250 beers //
// and rates them based on alcohol percentage     //
//                                                //
// By Ron Marks                                   //
//************************************************//

var request = require('request');
var http = require('http');
var fs = require('fs')

var server = http.createServer();

function sortFunction(a, b) {
	return a[0] - b[0];
}

function buildHtml(req) {
	var header = '';
	var body = "<table style='border: 1px solid black; border-collapse: collapse'>";
	for (var i = 0; i<req.length; i++){
		var percent = req[i][0];
		var name = req[i][1];
		body += "<tr><td style='border: 1px solid black'><b>"+ i.toString() +".</b></td><td style='border: 1px solid black'>" + percent.toString() + "%</td><td style='border: 1px solid black'>" + name + "</td></tr>";
	}
	body += "</table>";
	return '<!DOCTYPE html>' + '<html><header>' + header + '</header><body>' + '<h1>Beer Buzz Ranker</h1>' + body + '</body></html>';
};

server.on('request', function(req, res){
	var matches = [];
	var names = [];
	var percents = [];
	var results = [];
	
	request('http://www.beeradvocate.com/lists/top/', function(error, response, body){
		// Handle errors
		if (error || response.statusCode !== 200){
			return res.writeHead(error ? 500 : response.statusCode);
		}
		
		// Accumulate data
		var re = /<span style="color:#666666;">(.+?)ABV<\/span><\/td></g;
		var match;
		while (match = re.exec(body)){
			matches[matches.length] = match[1];
		}
		
		console.log(body);
		
		matches.splice(199,1);
		
		// Accumulate names
		re = /\d\/\\"><b>(.+?)<\/b><\/a>/g;
		matchString = (JSON.stringify(matches));
		while (match = re.exec(matchString)){
			names[names.length] = match[1]
			
		}
		
		names.splice(200, 1);
		
		//Accumulate percents
		re = /<\/a> \/ (.+?)%/g;
		while (match = re.exec(matchString)){
			percents[percents.length] = match[1];
		}
		
		//Convert percents to floats
		var numPercents = percents.map(function(v) {
			return parseFloat(v);
		});
		
		//Combine names and percents array
		for (i=0; i<names.length;i++){
			results[i] = [percents[i], names[i]];
		}
		
		var finalResults = results.sort(sortFunction);
		
		var html = buildHtml(finalResults);

		res.end(html);
	
	});
	
});

server.listen(8080);