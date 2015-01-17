This American Life Transcripts
==============================

*This American Life*, America's favorite radio show. It's been on for almost twenty years, and the staff of TAL diligently put up transcripts of each week's show. I think it could be a great data source for people looking for some pop culture data to play with and visualize. The data source includes both structured data (timestamps, speaker names, act names, dates) and unstructured transcripts of spoken words.

Out of respect for This American Life, this repo doesn't include the full datasource (~50mb, 120,000 lines). You've got to download the repo and parse the data yourself. Instructions are included below. The final CSV file breaks down the show by each paragraph of spoken content.

[See a preview of the data.](https://github.com/SciutoAlex/thisAmericanLifeTranscripts/blob/master/example-data.csv)

I'm a huge fan of the show. If anyone at the show has a problem with this little project, contact me, and I'll gladly take it now. Thanks!

Data Included
-------------
* `series_counter` An index of the number of paragraphs spoken for the entire history of the show. Begins at 1.
* `episode_number` The TAL episode number. Begins at 1.
* `episode_date` Date of original airing. Formatted as `01.23.2003`.
* `episode_title` Title of the episode.
* `episode_link` Link to the thisamericanlife.org archive page for the episode
* `act_name` Name of the act. Acts include "Prologue" and "Credits"
* `act_number` Number of the act. Begins at 0 for prologue.
* `speaker_name` Name of the speaker of the paragraph
* `paragraph_number_per_speaker` Index of the paragraph for that speakers particular section
* `time_stamp` A timestamp of the beginning time of the paragraph.
* `content` The paragraphs content.

Installation
------------
You need to have Node and NPM installed. If you don't have that installed yet, find out [here]('http://nodejs.org/download/'). It's really simple.

Download this repository to your computer, navigate to it your Terminal.

    npm install

Next run `node get-html-files.js`. This will take a little while out of respect for not bombarding This American Life's servers. You can go into the `get-html-files.js` and alter the wait time between requests if you'd like.

Next run `node create-tal-csv.js`. This will produce the CSV file in `./output`.

Dislaimer
---------
I'm not connected to This American Life in anyway. All copyright rests with Chicago Public Media & Ira Glass (2003). *This American Life* comments on their archive page:
>Note: This American Life is produced for the ear and designed to be heard, not read. We strongly encourage you to listen to the audio, which includes emotion and emphasis that's not on the page. Transcripts are generated using a combination of speech recognition software and human transcribers, and may contain errors. Please check the corresponding audio before quoting in print.
