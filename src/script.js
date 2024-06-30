import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const ffmpeg = new FFmpeg();
await ffmpeg.load();
ffmpeg.on('log', ({ type, message }) => {
  console.log('FFmpeg message:', type, message);
});
const message = document.getElementById('message');
ffmpeg.on("progress", ({ progress, time }) => {
  message.innerHTML = `${progress * 100} %, time: ${time / 1000000} s`;
});
console.log('FFmpeg is ready to use:', ffmpeg.loaded);

const convertToGif = async (videoFile) => {
  if (!ffmpeg.loaded) {
    await ffmpeg.load();
  }
  try {
    const fileData = await fetchFile(videoFile);

    await ffmpeg.writeFile('input.mp4', fileData);

    // The command to extract a 2-second GIF starting at 5 seconds
    await ffmpeg.exec(['-i', 'input.mp4', '-t', '2.0', '-f', 'gif', 'output.gif']);

    const data = await ffmpeg.readFile('output.gif');
    const gifBlob = new Blob([data.buffer], { type: 'image/gif' });
    return URL.createObjectURL(gifBlob);
  } catch (error) {
    console.error(error);
  }

};

const loader = document.getElementById('loader');
const convertButton = document.getElementById('convert-button');
convertButton.addEventListener('click', async () => {
  const videoInput = document.getElementById('video-input');
  if (videoInput.files.length === 0) {
    alert('Please select a video file first.');
    return;
  }
  loader.classList.remove('hidden');
  const videoFile = videoInput.files[0];
  const gifUrl = await convertToGif(videoFile);
  document.getElementById('output-gif').src = gifUrl;
  loader.classList.add('hidden');
});

const videoInput = document.getElementById('video-input');
const videoPlayer = document.getElementById('video-player');
const fileNameDisplay = document.getElementById('file-name');
videoInput.addEventListener('change', () => {
  const file = videoInput.files[0];
  if (file) {
    const videoUrl = URL.createObjectURL(file);
    videoPlayer.src = videoUrl;
    videoPlayer.load();

    // Add event listener for loadeddata to ensure video is fully loaded before playing
    videoPlayer.addEventListener('loadeddata', () => {
      videoPlayer.play();
    });
    // Update the file name display
    fileNameDisplay.textContent = file.name;
  } else {
    fileNameDisplay.textContent = 'No file chosen';
  }
});

