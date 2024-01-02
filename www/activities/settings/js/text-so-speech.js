/*
  Copyright 2024 David Healey

  This file is part of Waistline.

  Waistline is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  Waistline is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with app.  If not, see <http://www.gnu.org/licenses/>.
*/

app.TTS = {

  populateVoicesSelect: function() {
    const select = document.querySelector("#tts-voice");
    select.innerHTML = "";

    const currentVoice = app.Settings.get("tts", "voice");

    let option = document.createElement("option");
    option.value = "";
    option.innerText = app.strings.settings["text-to-speech"]["default"] || "Default";
    if (!currentVoice) option.setAttribute("selected", "");
    select.append(option);

    TTS.getVoices()
      .then((voices) => voices.sort((v1, v2) => v1.name.localeCompare(v2.name)))
      .then((sortedVoices) => {
        sortedVoices.forEach((voice) => {
          option = document.createElement("option");
          option.value = voice.identifier;
          option.innerText = voice.name;
          if (voice.identifier === currentVoice) option.setAttribute("selected", "");
          select.append(option);
        });
      });
  },

  testSettings() {
    app.TTS.stop();
    const example = [1.23, 45.67, 8.9];
    const text = app.TTS.formatNumbersForTTS(example).join("\n");
    app.TTS.speak(text);
  },

  formatNumbersForTTS(numbers) {
    const locale = app.Settings.get("tts", "locale") || undefined;
    return numbers.map(n => n.toLocaleString(locale));
  },

  speak(text) {
    return TTS.speak({
      text: text,
      identifier: app.Settings.get("tts", "voice") || undefined,
      rate: parseFloat(app.Settings.get("tts", "speed")) || 1,
      pitch: parseFloat(app.Settings.get("tts", "pitch")) || 1
    });
  },

  stop() {
    return TTS.stop();
  }
};