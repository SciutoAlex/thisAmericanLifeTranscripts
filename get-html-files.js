var fs     = require('fs');
var request = require('request');
var cheerio = require('cheerio');

//Variables to control the wait period between HTTP requests to TAL
var time_base = 500;
var time_random = 1000;

//Variables to control which shows to request. Check out thisamericalife.org to see latest episode number
var maxEpisode = 460;
var minEpisode = 459;

// create directory
if(!fs.existsSync('./transcripts')) {
  fs.mkdirSync('./transcripts');
}

console.log('beginning download');
next();
function next() {
  if(minEpisode < maxEpisode) {
    minEpisode++;
    if (!fs.existsSync(returnFileName(minEpisode))) {
      setTimeout(function() {
        request(returnURL(minEpisode), readTAL);
      }, time_base);
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
        console.log("Transcript for "+minEpisode+" was saved!");

        if (!fs.existsSync(returnEpisodeFileName(minEpisode))) {
          setTimeout(function() {
            request(getEpisodeLink(body), readEpisode);
          }, time_base);
        } else {
          console.log("skipped number: " + minEpisode);
          next();
        }
      }
    });
  } else {
    console.log(err);
    next();
  }
}

function readEpisode(err, res, body) {
  if (!err && res.statusCode == 200) {
    fs.writeFile(returnEpisodeFileName(minEpisode), body, function(err) {
      if(err) {
        console.log(err);
        next();
      } else {
        console.log("Episode for "+minEpisode+" was saved!");
        next();
      }
    });
  } else {
    console.log(err);
    next();
  }
}

function getEpisodeLink(html) {
  $ = cheerio.load(html);
  return "http://www.thisamericanlife.org" + $('article a').attr('href');
}

function returnURL(number) {
  var baseUrl = "http://www.thisamericanlife.org/"+number+"/transcript";
  return {url: baseUrl};
}

function returnFileName(number) {
  return "./transcripts/transcript-"+number+".html";
}

function returnEpisodeFileName(number) {
  return "./transcripts/episode-"+number+".html";
}
