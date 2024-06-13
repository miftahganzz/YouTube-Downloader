/*
Created By Miftah 
Free Source Code
https://github.com/miftahganzz/YouTube-Downloader
*/
const express = require('express');
const ytdl = require('@distube/ytdl-core');
const path = require('path');
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index', { videoInfo: null });
});

app.post('/', async (req, res) => {
  const { url } = req.body;
  try {
    const info = await ytdl.getInfo(url);
    const videoDetails = info.videoDetails;
    const formats = ytdl.filterFormats(info.formats, 'audioandvideo');
    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');

    const resolutions = {
      '360p': formats.find(format => format.qualityLabel === '360p'),
      '1080p': formats.find(format => format.qualityLabel === '1080p')
    };

    res.render('index', { videoInfo: { videoDetails, resolutions, audioFormats } });
  } catch (error) {
    console.error(error);
    res.render('index', { videoInfo: null });
  }
});

app.get('/download', async (req, res) => {
  const { url, type } = req.query;
  try {
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title;
    const fileName = `${title}.${type === 'audio' ? 'mp3' : 'mp4'}`;
    const filePath = path.join(__dirname, 'tmp', fileName);

    res.header('Content-Disposition', `attachment; filename="${fileName}"`);

    if (type === 'audio') {
      ytdl(url, { filter: 'audioonly' }, { quality: '247' })
        .pipe(res)
        .on('finish', () => {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(err);
            }
          });
        });
    } else {
      ytdl(url, { filter: 'audioandvideo' }, { quality: '137' })
        .pipe(res)
        .on('finish', () => {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(err);
            }
          });
        });
    }
  } catch (error) {
    console.error(error);
    res.render('index', { result: null });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
