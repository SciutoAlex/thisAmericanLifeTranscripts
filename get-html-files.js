var fs     = require('fs');
var request = require('request');

//Variables to control the wait period between HTTP requests to TAL
var time_base = 5000;
var time_random = 10000;

//Variables to control which shows to request. Check out thisamericalife.org to see latest episode number
var maxEpisode = 544;
var minEpisode = 0;

//Create a directory for the files
if(!fs.existsSync('./transcripts')) {
  fs.mkdirSync('./transcripts');
}


//Begin the show
console.log('beginning download');
next();
function next() {
  if(minEpisode < maxEpisode) {
    minEpisode++;
    if (!fs.existsSync(returnFileName(minEpisode))) {
      setTimeout(function() {
        request(returnURL(minEpisode), readTAL);
      }, Math.random()*time_random + time_base);
    } else {
      console.log("skipped number: " + minEpisode);
      next();
    }
  }
}

function readTAL(err, res, body) {
  if (!err && res.statusCode == 200) {
    fs.writeFile(returnFileName(minEpisode), body, function(err) {
      if(err) {
        console.log(err);
        next();
      } else {
        console.log("Show "+minEpisode+" was saved!");
        next();
      }
    });
  } else {
    console.log(err);
    next();
  }
}

function returnURL(number) {
  var baseUrl = "http://www.thisamericanlife.org/radio-archives/episode/"+number+"/transcript";
  return {url: baseUrl};
}

function returnFileName(number) {
  return "./transcripts/show-"+number+".html";
}
