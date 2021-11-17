import { Settings } from '@vocab/shared';
import { VOICES } from '../constants';

interface LangProps {
  [key: string]: string;
}

export class SpeechSynthesis {
  speechSynthesis: typeof window.speechSynthesis;
  speaker: SpeechSynthesisUtterance;
  isSpeakerEnd: boolean;
  langProps: LangProps;

  constructor(props: Settings) {
    this.speechSynthesis = window.speechSynthesis;
    this.speaker = new SpeechSynthesisUtterance();
    this.speaker.rate = props.speechRate;
    this.speaker.volume = props.speechVolume;
    this.speaker.pitch = props.speechPitch;
    this.isSpeakerEnd = true;

    this.langProps = {
      [props.helpLanguage]: props.helpLanguageVoice,
      [props.learnLanguage]: props.learnLanguageVoice,
    };
  }

  getVoices = (language: string) => {
    const voices = this.speechSynthesis.getVoices();
    return voices.filter((item) => item.lang.includes(language));
  };

  setVoice = (language: string) => {
    const voices = this.speechSynthesis.getVoices();

    const findVoice = (props: LangProps) => {
      return voices.find(
        (item: SpeechSynthesisVoice) => item.voiceURI === props[language],
      );
    };

    const voice = findVoice(this.langProps) || findVoice(VOICES);

    if (voice) {
      this.speaker.voice = voice as SpeechSynthesisVoice;
    }
  };

  sound = (text: string, language: string) => {
    this.cancel();
    this.setVoice(language);

    if (this.isSpeakerEnd) {
      this.isSpeakerEnd = false;
      this.speaker.lang = language;
      this.speaker.text = text;

      this.speechSynthesis.speak(this.speaker);
      this.speaker.onend = () => {
        this.isSpeakerEnd = true;
      };
    }
  };

  cancel = () => {
    this.speechSynthesis.cancel();
    this.isSpeakerEnd = true;
  };
}
