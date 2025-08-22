import os
from google.cloud import texttospeech

# Set the environment variable to point to your service account key file
# This is required for authentication.
# os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/path/to/your-key.json'

def list_voices_for_language(language_code="ja-JP"):
    """Lists all voices available for a given language code."""
    client = texttospeech.TextToSpeechClient()

    # The languages to list the voices for.
    # This will return all voices if the language code is not specified.
    response = client.list_voices(language_code=language_code)

    print(f"Voices available for '{language_code}':")
    for voice in response.voices:
        print("--------------------")
        print(f"Voice Name: {voice.name}")
        print(f"Supported Languages: {voice.language_codes}")
        print(f"Gender: {texttospeech.SsmlVoiceGender(voice.ssml_gender).name}")
        print(f"Natural Sample Rate (Hz): {voice.natural_sample_rate_hertz}")


def synthesize_text_to_mp3(text, output_filename="data/output.mp3"):
    """
    Synthesizes text into an MP3 file using the Google Cloud Text-to-Speech API.

    Args:
        text (str): The text to be converted to speech.
        output_filename (str): The name of the output audio file.
    """
    client = texttospeech.TextToSpeechClient()

    synthesis_input = texttospeech.SynthesisInput(text=text)

    # Configure the voice parameters
    voice = texttospeech.VoiceSelectionParams(
        language_code="en-US",
        ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL
    )

    # Configure the audio file format
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3
    )

    # Perform the text-to-speech synthesis
    response = client.synthesize_speech(
        input=synthesis_input,
        voice=voice,
        audio_config=audio_config
    )

    # Write the audio content to a file
    with open(output_filename, "wb") as out:
        out.write(response.audio_content)
        print(f'Audio content written to file "{output_filename}"')

if __name__ == "__main__":
    list_voices_for_language("ja-JP")


    text_to_synthesize = "Hello, this is a test of the Google Cloud Text-to-Speech API."
    synthesize_text_to_mp3(text_to_synthesize)
