from gtts import gTTS
from pydub import AudioSegment
from pydub.playback import play

tts = gTTS("こんにちは、ご主人様", lang="ja")
tts.save("out.mp3")
sound = AudioSegment.from_mp3("out.mp3")
play(sound)
