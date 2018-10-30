var fs = require('fs');
var parse = require('csv-parse');

var outputDir = 'output';

function parseTime(str) {
  var h_m_s = str.split(':');
  var hours = parseFloat(h_m_s[0]);
  var mins = parseFloat(h_m_s[1]);
  var secs = parseFloat(h_m_s[2]);
  return hours*3600 + mins*60 + secs;
}

function writeJSON(episode) {
  fs.writeFile(outputDir+'/'+episode.episode+'.json', JSON.stringify(episode), (err) => {
    if (err) console.log('Error writing file for episode '+episode.episode);
    else console.log('Episode '+episode.episode+' saved');
  });
}

function findLineType(line) {
  if (line.match(/^\[MUSIC[A-Z\W ]*\]$/)) {
    return 'music';
  } else if (line.match(/^\[/)) {
    return 'effects';
  } else {
    return 'speech';
  }
}

function toTitleCase(str) {
  str = str.toLowerCase().split(' ');
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }
  return str.join(' ');
};

function toSentenceCase(str) {
  str = str.toLowerCase();
  return str.charAt(0).toUpperCase() + str.slice(1);
};

var segments = [];
var transcript = "";
var episode, act, speaker, paragraph, music, effects;
var firstLine = true;

var parser = parse({delimiter: ','}).on('data', function(entry)
{
  if (firstLine) {
    firstLine = false;
    return;
  }

	var time = parseTime(entry[9]);
	var line = entry[10];
	var lineType = findLineType(line);

	//=======================================================
	// ADD

	if (act && parseInt(entry[6]) != act.number) {
		if (time<act.start) act.end=-1;
		else act.end = time;
		segments.push(act);
		act = null;
	}

	if (speaker &&
      (entry[7] != speaker.label || lineType != 'speech' || parseInt(entry[1]) != episode.episode))
  {
		if (time<speaker.start) speaker.end=-1;
		else speaker.end = time;
		segments.push(speaker);
		speaker = null;
	}

	if (music) {
		if (time<music.start) music.end=-1;
		else music.end = time;
		segments.push(music);
		music = null;
	}

	if (effects) {
		if (time<effects.start) effects.end=-1;
		else effects.end = time;
		segments.push(effects);
		effects = null;
	}

	if (paragraph) {
		if (time<paragraph.start) paragraph.end=-1;
		else paragraph.end = time;
		segments.push(paragraph);
		paragraph = null;
	}

	if (episode && parseInt(entry[1]) != episode.episode) {
		episode.transcript = transcript;
		episode.segments = segments;
		writeJSON(episode);
		episode = null;
		transcript = "";
		segments = [];
	}

	//=======================================================
	// PARSE

	if (!episode) {
		episode = {
			series: 'This American Life',
			episode: parseInt(entry[1]),
			date: entry[2],
			title: entry[3],
			url: entry[4]
		};
	}

	if (!act) {
		act = {
			type: 'topic',
			label: entry[5],
			number: parseInt(entry[6]),
			start: time
		};
	}

	if (!speaker && lineType === 'speech') {
		speaker = {
			type: 'speaker',
			label: entry[7],
			start: time
		};
	}

	if (lineType === 'music') {
		music = {
			type: 'music',
			start: time
		}
		if (line != '[MUSIC]' && line != '[MUSIC PLAYING]') {
			line = line.replace(/\[MUSIC[A-Z\W ]*?\"/, '').replace(' BY ','').replace(']','');
			var song_artist = line.split('"').filter((e)=>{return e;});
			if (song_artist.length>0) {
				music.song = toTitleCase(song_artist[0]);
				music.label = '"'+music.song+'"';
			}
			if (song_artist.length>1) {
				music.artist = toTitleCase(song_artist[1]);
				music.label = '"'+music.song+'" by '+music.artist;
			}
		}
	} else if (lineType === 'effects') {
		line = line.replace('[','').replace(']','');
		line = toSentenceCase(line);
		effects = {
			type: 'effects',
			start: time,
			label: line
		}
	} else {
		line = line.replace(/\[[A-Z\W ]*\]/, '');
		paragraph = {
			type: 'paragraph',
			start: time,
			label: line
		};
		transcript += line + ' ';
	}
});

//if (act) {
  //act.end = -1;
  //segments.push(act);
//}
//if (speaker) {
  //speaker.end = -1;
  //segments.push(speaker);
//}
//if (music) {
  //music.end = -1;
  //segments.push(music);
//}
//if (effects) {
  //effects.end = -1;
  //segments.push(effects);
//}
//if (paragraph) {
  //paragraph.end = -1;
  //segments.push(paragraph);
//}

//episode.segments = segments;
//writeJSON(episode);

//});

fs.createReadStream(__dirname+'/output/data.csv').pipe(parser);
