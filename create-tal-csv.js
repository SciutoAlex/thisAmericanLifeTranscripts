var jsdom  = require('jsdom');
var fs     = require('fs');
var jquery = require('jquery');
var cheerio = require('cheerio');
var request = require('request');
var csv = require('csv')

//local variables
var records = [['series_counter', 'episode_number', 'episode_date', 'episode_title', 'episode_link', 'act_name', 'act_number', 'speaker_name', 'paragraph_number_per_speaker', 'time_stamp', 'content']];


//Variables to control which shows to request. Check out thisamericalife.org to see latest episode number
var maxEpisode = 659;
var minEpisode = 0;
var counter = minEpisode;


//Check to see if there are html files to combine
if(!fs.existsSync('./transcripts')) {
    console.log('You need to first download some TAL transcripts. type "node get-html-files.js" to download them. Then run this script after.');
    process.exit(code=1);
}

//Begin the show
console.log('Beginning Parse');
next();
function next() {
  if(counter < maxEpisode) {
    counter++;
    fs.readFile(returnFileName(counter), 'utf8', function(err, body) {
      if(!err) {
        fs.readFile(returnEpisodeFileName(counter), 'utf8', function(err, episodeBody) {
          if (!err) {
            addHtmlToCsv(records, body, episodeBody, next);
            console.log('Show No.'+ counter +' parsed');
          } else {
            console.log(err);
            next();
          }
        });
      } else {
        console.log(err)
        next();
      }
    });
  } else {
    csv.stringify(records, function(err, data) {
      if(!err) {
        if(!fs.existsSync('./output')) {
          fs.mkdirSync('./output');
        }
        fs.writeFile('./output/data.csv', data);
      } else {
        console.log('something went wrong with the csv stringify');
      }
    })
  }
}


function addHtmlToCsv(obj, html, episodeHtml, cb) {
  $ = cheerio.load(html);
  ep$ = cheerio.load(episodeHtml);
  var showCounter = 0;
  var seriesCounter = obj.length;

  var epNumb = parseInt(ep$(".episode-header .field-name-field-episode-number").text());
  var dateString = getDateString(ep$(".episode-header .field-name-field-radio-air-date").text());
  var episodeName = ep$(".episode-header .episode-title").text().replace(/^\s+|\s+$/g, '');
  var episodeLink = ep$("meta[property='og:url']").attr('content');

  var acts = $('.act');
  var actCounter = 0;
  acts.each(function() {
    var act = $(this);
    var actName = act.find('h3').text().trim();
    var speakingParts = act.find('.subject, .interviewer, .host');
    var lastSpeaker;
    var speakingCounter = 0;
    speakingParts.each(function() {
      var speakingPart = $(this).attr('class');
      var speaker = $(this).find('h4').text().trim();
      if(!speaker && speakingPart == "host") { speaker = "Ira Glass"; }
      if (lastSpeaker != speaker) speakingCounter = 0;
      lastSpeaker = speaker;
      var paragraphs = $(this).find('p');
      paragraphs.each(function() {
        var time = $(this).attr('begin');
        var content = $(this).text().trim();
        obj.push([
            seriesCounter,
            epNumb,
            dateString,
            episodeName,
            episodeLink,
            actName,
            actCounter,
            speaker,
            speakingCounter,
            time,
            content
        ]);
        seriesCounter++;
        speakingCounter++;
      });

    });
    actCounter++;
  });

  cb();

}
function returnURL(number) {
  var baseUrl = "http://www.thisamericanlife.org/radio-archives/episode/"+number+"/transcript";
  return {url: baseUrl};
}

function returnFileName(number) {
  return "./transcripts/transcript-"+number+".html";
}

function returnEpisodeFileName(number) {
  return "./transcripts/episode-"+number+".html";
}

function getEpisodeNumber(str) {
  return str.split(':')[0];
}

function getDateString(str) {
  var date = new Date(Date.parse(str));
  return date.toJSON();
}

function getTitle(str) {
  return str.split(':')[1];
}
