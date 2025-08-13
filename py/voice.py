import os
from google.cloud import texttospeech

def create_female_japanese_voice_samples(sample_text, output_dir="japanese_voice_samples"):
    """
    Lists all Japanese female voices and creates a sample audio file for each.
    
    Args:
        sample_text (str): The text to be converted to speech for the samples.
        output_dir (str): The directory to save the audio files.
    """
    client = texttospeech.TextToSpeechClient()

    # List all voices and filter for Japanese female voices
    response = client.list_voices(language_code="ja-JP")
    female_voices = [
        voice for voice in response.voices 
        if voice.ssml_gender == texttospeech.SsmlVoiceGender.FEMALE
    ]

    if not female_voices:
        print("No Japanese female voices found.")
        return

    # Create the output directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"Created output directory: {output_dir}")

    # Synthesize audio for each female voice
    for voice in female_voices:
        voice_name = voice.name
        print(f"Synthesizing audio for voice: {voice_name}")

        synthesis_input = texttospeech.SynthesisInput(text=sample_text)

        voice_params = texttospeech.VoiceSelectionParams(
            language_code="ja-JP",
            name=voice_name
        )

        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3
        )

        response = client.synthesize_speech(
            input=synthesis_input,
            voice=voice_params,
            audio_config=audio_config
        )

        # Create a unique filename for each voice
        output_filename = os.path.join(output_dir, f"{voice_name}.mp3")

        # Write the audio content to the file
        with open(output_filename, "wb") as out:
            out.write(response.audio_content)
            print(f'Audio content saved to "{output_filename}"')

if __name__ == "__main__":
    # A sample Japanese phrase with a mix of hiragana, katakana, and kanji
    japanese_sample_text = "こんにちは。これはGoogle Cloudテキスト読み上げAPIの日本語の音声サンプルです。"
    
    create_female_japanese_voice_samples(japanese_sample_text)