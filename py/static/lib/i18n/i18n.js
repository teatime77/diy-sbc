"use strict";
var i18n_ts;
(function (i18n_ts) {
    let urlOrigin;
    let urlParams;
    i18n_ts.isEdge = false;
    let AppMode;
    (function (AppMode) {
        AppMode[AppMode["edit"] = 0] = "edit";
        AppMode[AppMode["play"] = 1] = "play";
        AppMode[AppMode["lessonEdit"] = 2] = "lessonEdit";
        AppMode[AppMode["lessonPlay"] = 3] = "lessonPlay";
    })(AppMode = i18n_ts.AppMode || (i18n_ts.AppMode = {}));
    i18n_ts.textLanguageCode = "eng";
    let TextToId;
    const languages = [
        ["اَلْعَرَبِيَّةُ", "ara", ['"', '"']],
        ["汉语", "chi", ['“', '”']],
        ["English", "eng", ['"', '"']],
        ["français", "fre", ['« ', ' »']],
        ["Deutsch", "ger", ['„', '“']],
        ["हिन्दी", "hin", ['"', '"']],
        ["Indonesia", "ind", ['"', '"']],
        ["日本語", "jpn", ['「', '」']],
        ["한국어", "kor", ['"', '"']],
        ["Русский", "rus", ['«', '»']],
        ["español", "spa", ['"', '"']],
        ["português", "por", ['"', '"']],
    ];
    const engTexts = [];
    /**
    Quotation mark
        https://en.wikipedia.org/wiki/Quotation_mark
     */
    let quotationMarks = new Map([]);
    /*
    List of ISO 639 language codes
        https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes
    
    Arabic	ar	ara	ara
    Bengali	bn	ben	ben
    Burmese	my	mya	bur
    Chinese	zh	zho	chi
    Dutch	nl	nld	dut
    English	en	eng	eng
    French	    fr	fra	fre
    German	    de	deu	ger
    Greek	    el	ell	gre
    Hebrew	    he	heb	heb
    Hindi	hi	hin	hin
    Indonesian	id	ind	ind
    Italian	    it	ita	ita
    Japanese    ja	jpn	jpn
    Javanese	jv	jav	jav
    Khmer	km	khm	khm
    Korean	ko	kor	kor
    Mongolian	mn	mon	mon
    Nepali	ne	nep	nep
    Persian	fa	fas	per
    Polish	pl	pol	pol
    Punjabi	pa	pan	pan
    Portuguese	pt	por	por
    Russian	ru	rus	rus
    Spanish	es	spa	spa
    Tagalog	tl	tgl	tgl
    Tamil	ta	tam	tam
    Thai	th	tha	tha
    Turkish	tr	tur	tur
    Urdu	ur	urd	urd
    Vietnamese	vi	vie	vie
    
    
    Internet users by language
        https://en.wikipedia.org/wiki/Languages_used_on_the_Internet
    
    1	English	1,186,451,052	25.9%
    2	Chinese	888,453,068	19.4%
    3	Spanish	363,684,593	  7.9%
    4	Arabic	237,418,349	  5.2%
    5	Indonesian	198,029,815	  4.3%
    6	Portuguese	171,750,818	  3.7%
    7	French	144,695,288	  3.3 %
    8	Japanese	118,626,672	  2.6%
    9	Russian	116,353,942	  2.5%
    10	German	92,525,427	  2.0%
    1–10	Top 10 languages	3,525,027,347	  76.9%
    
    */
    let translationMap = new Map();
    let maxTranslationId;
    function setTextLanguageCode(code3) {
        const code3s = languages.map(x => x[1]);
        if (code3.includes(code3)) {
            i18n_ts.textLanguageCode = code3;
        }
        else {
            throw new i18n_ts.MyError();
        }
    }
    i18n_ts.setTextLanguageCode = setTextLanguageCode;
    function initLetters() {
        const A = "A".charCodeAt(0);
        const a = "a".charCodeAt(0);
        const Alpha = "Α".charCodeAt(0);
        const alpha = "α".charCodeAt(0);
        i18n_ts.upperLatinLetters = i18n_ts.range(26).map(i => String.fromCharCode(A + i)).join("");
        i18n_ts.lowerLatinLetters = i18n_ts.range(26).map(i => String.fromCharCode(a + i)).join("");
        i18n_ts.latinLetters = i18n_ts.upperLatinLetters + i18n_ts.lowerLatinLetters;
        i18n_ts.upperGreekLetters = i18n_ts.range(24).filter(i => i != 17).map(i => String.fromCharCode(Alpha + i)).join("");
        i18n_ts.lowerGreekLetters = i18n_ts.range(24).filter(i => i != 17).map(i => String.fromCharCode(alpha + i)).join("");
        // msg(upperLatinLetters);
        // msg(lowerLatinLetters);
        // msg(upperGreekLetters);
        // msg(lowerGreekLetters);
    }
    async function getAllTexts() {
        const [origin, ,] = i18n_ts.parseURL();
        const names = [
            "parser",
            "plane",
            "firebase",
            "movie"
        ];
        const texts = [];
        for (const name of names) {
            const url = `${origin}/lib/${name}/${name}.js`;
            i18n_ts.msg(`js url:${url}`);
            const text = await i18n_ts.fetchText(url);
            for (const quote of ["'", '"']) {
                let start = 0;
                const TT_quote = `TT(${quote}`;
                while (true) {
                    const k1 = text.indexOf(TT_quote, start);
                    if (k1 == -1) {
                        break;
                    }
                    if (0 < k1 && i18n_ts.isIdentifierLetter(text.charAt(k1 - 1))) {
                        start = k1 + 3;
                        continue;
                    }
                    const k2 = text.indexOf(quote, k1 + 3);
                    i18n_ts.assert(k2 != -1);
                    const s = text.substring(k1 + 3, k2);
                    texts.push(s);
                    start = k2 + 1;
                }
            }
        }
        return texts;
    }
    i18n_ts.getAllTexts = getAllTexts;
    function TT(text) {
        text = text.trim();
        if (text == "" || i18n_ts.textLanguageCode == "eng") {
            return text;
        }
        const target = translationMap.get(text);
        if (target == undefined) {
            if (!engTexts.includes(text)) {
                i18n_ts.msg(`new text:[${text}]`);
                engTexts.push(text);
            }
        }
        return target != undefined ? target.trim() : text;
    }
    i18n_ts.TT = TT;
    function getEngTexts() {
        return Array.from(engTexts.entries()).map(x => `${maxTranslationId + 1 + x[0]}:${x[1]}`).join("\n\n");
    }
    i18n_ts.getEngTexts = getEngTexts;
    function TTs(text) {
        const lines = text.split("\n").map(x => x.trim()).filter(x => x != "");
        return lines.map(x => TT(x));
    }
    i18n_ts.TTs = TTs;
    function getIdFromText(text) {
        return TextToId.get(text);
    }
    i18n_ts.getIdFromText = getIdFromText;
    function getQuotationMarks() {
        const marks = quotationMarks.get(i18n_ts.textLanguageCode);
        if (marks == undefined) {
            return ['"', '"'];
        }
        else {
            return marks;
        }
    }
    function token(text) {
        if (i18n_ts.textLanguageCode == "ara") {
            switch ("ABCDE".indexOf(text)) {
                case 0: return "أ";
                case 1: return "ب";
                case 2: return "ج";
                case 3: return "د";
                case 4: return "هـ";
            }
            throw new i18n_ts.MyError();
        }
        const [start_mark, end_mark] = getQuotationMarks();
        return start_mark + text + end_mark;
    }
    i18n_ts.token = token;
    class AbstractSpeech {
        static one;
        prevCharIndex = 0;
        speaking = false;
        callback;
    }
    i18n_ts.AbstractSpeech = AbstractSpeech;
    class Reading {
        readable;
        text;
        args;
        children;
        phrases = [];
        start = NaN;
        end = NaN;
        constructor(readable, text, args) {
            this.readable = readable;
            this.text = text;
            this.args = args;
            this.children = args.map(x => x.reading());
        }
        setPhrases() {
            if (this.children.length == 0) {
                this.phrases = [this.text];
            }
            else {
                const quotes = i18n_ts.range(this.children.length).map(i => token(i18n_ts.upperLatinLetters.charAt(i)));
                const positions = quotes.map(x => this.text.indexOf(x));
                i18n_ts.assert(positions.every(i => i != -1));
                const index_positions = Array.from(positions.entries());
                index_positions.sort((a, b) => a[1] - b[1]);
                let pos = 0;
                for (const [index, position] of index_positions) {
                    if (pos < position) {
                        this.phrases.push(this.text.substring(pos, position));
                    }
                    this.phrases.push(this.children[index]);
                    pos = position + quotes[index].length;
                }
                if (pos < this.text.length) {
                    this.phrases.push(this.text.substring(pos));
                }
            }
        }
        setStartEnd(start) {
            if (this.children.length == 0) {
                this.start = start;
                this.end = start + this.text.length;
            }
            else {
                let pos = start;
                for (const phrase of this.phrases) {
                    if (typeof phrase == "string") {
                        pos += phrase.length;
                    }
                    else {
                        phrase.setStartEnd(pos);
                        pos = phrase.end;
                    }
                }
            }
        }
        getAllTexts(texts) {
            if (this.children.length == 0) {
                texts.push(this.text);
            }
            else {
                for (const phrase of this.phrases) {
                    if (typeof phrase == "string") {
                        texts.push(phrase);
                    }
                    else {
                        phrase.getAllTexts(texts);
                    }
                }
            }
        }
        prepareReading() {
            this.setPhrases();
            this.setStartEnd(0);
            const texts = [];
            this.getAllTexts(texts);
            const all_text = texts.join("");
            return all_text;
        }
        getAllReadingsSub(readings) {
            readings.push(this);
            this.children.forEach(x => x.getAllReadingsSub(readings));
        }
        getAllReadings() {
            const readings = [];
            this.getAllReadingsSub(readings);
            return readings;
        }
    }
    i18n_ts.Reading = Reading;
    async function getTranslationMap(lang_code) {
        const url = `${urlOrigin}/lib/i18n/translation/${lang_code}.txt?ver=${Date.now()}`;
        let texts = await i18n_ts.fetchText(url);
        // for chinese text.
        texts = texts.replaceAll("：", ":");
        const id_to_text = new Map();
        const text_to_id = new Map();
        for (let line of texts.split("\n")) {
            line = line.trim();
            if (line == "") {
                continue;
            }
            const k3 = line.indexOf(":");
            i18n_ts.assert(k3 != -1);
            const id = parseInt(line.substring(0, k3));
            const text = line.substring(k3 + 1);
            if (text == "") {
                i18n_ts.msg(`skip:${lang_code} ${id}`);
                continue;
            }
            id_to_text.set(id, text);
            const id2 = text_to_id.get(text);
            if (id2 != undefined) {
                i18n_ts.msg(`dup:${lang_code} ${id2} ${id} ${text}`);
            }
            text_to_id.set(text, id);
        }
        i18n_ts.msg(`get-Translation-Map:${lang_code} ${id_to_text.size} ${text_to_id.size}`);
        return [id_to_text, text_to_id];
    }
    async function loadTranslationMap() {
        const [id_to_text1, text_to_id1] = await getTranslationMap("eng");
        i18n_ts.EngTextToId = text_to_id1;
        if (i18n_ts.textLanguageCode == "eng") {
            TextToId = text_to_id1;
            return;
        }
        const [id_to_text2, text_to_id2] = await getTranslationMap(i18n_ts.textLanguageCode);
        TextToId = text_to_id2;
        for (const [id, text2] of id_to_text2.entries()) {
            const text1 = id_to_text1.get(id);
            if (text1 != undefined) {
                translationMap.set(text1.trim(), text2.trim());
            }
            else {
                i18n_ts.msg(`no translation:${id} ${text2}`);
            }
        }
        maxTranslationId = Math.max(...Array.from(id_to_text1.keys()));
        i18n_ts.msg(`translation-Map size:${translationMap.size} max:${maxTranslationId}`);
    }
    i18n_ts.loadTranslationMap = loadTranslationMap;
    function checkBrowser() {
        if (navigator.userAgentData != undefined) {
            const brands = navigator.userAgentData.brands;
            for (const brand of brands) {
                if (brand.brand.includes("Edge")) {
                    i18n_ts.isEdge = true;
                    i18n_ts.msg("is Edge : true");
                }
                i18n_ts.msg(`userAgentData:[${brand.brand}]`);
            }
        }
        i18n_ts.msg(`userAgent:[${navigator.userAgent}]`);
    }
    async function initI18n() {
        checkBrowser();
        initLetters();
        for (const [name, code, quotes] of languages) {
            quotationMarks.set(code, quotes);
        }
        [urlOrigin, , urlParams] = i18n_ts.parseURL();
        if (urlParams.get("lesson") != undefined) {
            i18n_ts.appMode = AppMode.lessonPlay;
        }
        else {
            switch (urlParams.get("mode")) {
                case "edit":
                    i18n_ts.appMode = AppMode.edit;
                    break;
                case "lesson":
                    i18n_ts.appMode = AppMode.lessonEdit;
                    break;
                default:
                    i18n_ts.appMode = AppMode.play;
                    break;
            }
        }
        if (quotationMarks.has(i18n_ts.textLanguageCode)) {
            i18n_ts.msg(`lang code:${i18n_ts.textLanguageCode}`);
            await loadTranslationMap();
        }
        else {
            i18n_ts.msg(`illegal lang code:${i18n_ts.textLanguageCode}`);
        }
    }
    i18n_ts.initI18n = initI18n;
    async function bodyOnLoad() {
        await initI18n();
        const texts = await getAllTexts();
        const text = Array.from(texts.entries()).map(x => (x[0] + ":" + x[1])).join("\n");
        i18n_ts.msg(`all texts:`);
        i18n_ts.msg(text);
        i18n_ts.$inp("all-texts").value = text;
    }
    i18n_ts.bodyOnLoad = bodyOnLoad;
})(i18n_ts || (i18n_ts = {}));
var i18n_ts;
(function (i18n_ts) {
    i18n_ts.voiceLanguageCode = "eng";
    let cancelSpeechFlag = false;
    const voiceMap = new Map();
    i18n_ts.langCodeList = [
        ["ara", "ar-EG"],
        ["chi", "zh-CN"],
        ["eng", "en-US"],
        ["fre", "fr-FR"],
        ["ger", "de-DE"],
        ["hin", "hi-IN"],
        ["ind", "id-ID"],
        ["jpn", "ja-JP"],
        ["kor", "ko-KR"],
        ["rus", "ru-RU"],
        ["spa", "es-ES"],
        ["por", "pt-PT"],
    ];
    i18n_ts.langCodeMap = new Map(i18n_ts.langCodeList);
    const voiceNamesDic = {
        "ja-JP": [
            "Microsoft Nanami Online (Natural) - Japanese (Japan)",
            "Google 日本語",
            "Microsoft Ayumi - Japanese (Japan)"
        ],
        "en-US": [
            "Microsoft Ava Online (Natural) - English (United States)",
            "Google US English",
            "Microsoft Zira - English (United States)"
        ]
    };
    let languageRegion;
    function setVoiceLanguageCode(code) {
        i18n_ts.voiceLanguageCode = code;
    }
    i18n_ts.setVoiceLanguageCode = setVoiceLanguageCode;
    function getVoiceByLangCode(lang_code) {
        languageRegion = i18n_ts.langCodeMap.get(lang_code);
        if (languageRegion == undefined) {
            throw new i18n_ts.MyError(`unknown lang code:${lang_code}`);
        }
        const voices = voiceMap.get(languageRegion);
        if (voices == undefined) {
            i18n_ts.msg(`no voice for ${languageRegion}`);
            return undefined;
        }
        const default_names = voiceNamesDic[languageRegion];
        if (default_names != undefined) {
            for (const name of default_names) {
                const voice = voices.find(x => x.name == name);
                if (voice != undefined) {
                    return voice;
                }
            }
        }
        const natural_voice = voices.find(x => x.name.indexOf("Online (Natural)") != -1);
        if (natural_voice != undefined) {
            return natural_voice;
        }
        return voices[0];
    }
    class Speech extends i18n_ts.AbstractSpeech {
        static maxId = 0;
        id;
        voice;
        text;
        constructor() {
            super();
            i18n_ts.AbstractSpeech.one = this;
            this.id = Speech.maxId++;
            this.initVoice();
        }
        initVoice() {
            if (voiceMap.size == 0) {
                setVoiceList();
            }
            if (this.voice == undefined) {
                this.voice = getVoiceByLangCode(i18n_ts.voiceLanguageCode);
                if (this.voice != undefined) {
                    // msg(`use voice:${this.voice.name}`);
                }
            }
        }
        emulate(speech_id) {
            let charIndex = 0;
            const id = setInterval(() => {
                if (i18n_ts.voiceLanguageCode == "jpn") {
                    charIndex++;
                }
                else {
                    charIndex = this.text.indexOf(" ", charIndex);
                    if (charIndex == -1) {
                        charIndex = this.text.length;
                    }
                    else {
                        charIndex++;
                    }
                }
                const ev = {
                    charIndex: charIndex,
                };
                this.onBoundary(ev);
                if (this.text.length <= charIndex) {
                    this.onEnd(ev);
                    clearInterval(id);
                }
            }, 1);
        }
        async speak(text) {
            cancelSpeechFlag = false;
            this.text = text.trim();
            if (this.text == "") {
                this.speaking = false;
                return;
            }
            this.speaking = true;
            if (i18n_ts.onSpeak != undefined) {
                i18n_ts.onSpeak(this.text);
            }
            if (i18n_ts.getPlayMode() == i18n_ts.PlayMode.fastForward) {
                const speech_id = i18n_ts.getIdFromText(this.text);
                this.emulate(speech_id);
                return;
            }
            /*
                    if(speech_id != undefined){
                        const ok = await playAudio(this, speech_id);
                        if(ok){
                            return;
                        }
                    }
            */
            this.initVoice();
            i18n_ts.msg(`Speak ${this.id}[${this.text}] ${this.voice != undefined ? this.voice.name : "no voice"}`);
            this.prevCharIndex = 0;
            const uttr = new SpeechSynthesisUtterance(this.text.replaceAll("○", "マル").replaceAll("×", "バツ"));
            uttr.addEventListener("end", this.onEnd.bind(this));
            uttr.addEventListener("boundary", this.onBoundary.bind(this));
            uttr.addEventListener("mark", this.onMark.bind(this));
            //uttr.rate = 5.0;// parseFloat(speechRate.value);
            if (this.voice != undefined) {
                uttr.voice = this.voice;
            }
            speechSynthesis.speak(uttr);
        }
        onBoundary(ev) {
            const text = this.text.substring(this.prevCharIndex, ev.charIndex).trim();
            if (ev.charIndex == 0) {
                i18n_ts.msg(`Speech start text:[${this.text}]`);
            }
            else {
                // msg(`Speech bdr: idx:${ev.charIndex} name:${ev.name} type:${ev.type} text:[${text}]`);
            }
            if (this.callback != undefined) {
                this.callback(ev.charIndex);
            }
            this.prevCharIndex = ev.charIndex;
        }
        onEnd(ev) {
            // msg(`Speech end: id:${this.id} idx:${ev.charIndex} name:${ev.name} type:${ev.type} text:[${this.text.substring(this.prevCharIndex)}]`);
            if (this.callback != undefined) {
                this.callback(this.text.length);
            }
            this.speaking = false;
        }
        onMark(ev) {
        }
        async waitEndNEW() {
            for (const i of i18n_ts.range(100)) {
                if (cancelSpeechFlag || !this.speaking) {
                    break;
                }
                await i18n_ts.sleep(10);
            }
            // msg(`wait end:${this.id}`);
        }
        waitEnd() {
            return new Promise((resolve) => {
                const id = setInterval(() => {
                    if (cancelSpeechFlag || !this.speaking) {
                        clearInterval(id);
                        // msg(`wait end:${this.id}`);
                        resolve();
                    }
                }, 10);
            });
        }
        async speak_waitEnd(text) {
            await this.speak(text);
            await this.waitEnd();
        }
    }
    i18n_ts.Speech = Speech;
    function pronunciation(word) {
        if (word[0] == '\\') {
            const tbl = {
                "dif": ["diff"],
                "Delta": ["delta"],
                "lim": ["limit"],
                "frac": ["fraction"],
                "sqrt": "square root".split(" "),
                "ne": "not equals".split(" "),
                "lt": "is less than".split(" "),
                "gt": "is greater than".split(" "),
                "le": "is less than or equals".split(" "),
                "ge": "is greater than or equals".split(" "),
            };
            const name = word.substring(1);
            if (name in tbl) {
                return tbl[name];
            }
            else {
                return [name];
            }
        }
        return [word];
    }
    i18n_ts.pronunciation = pronunciation;
    function setVoiceList() {
        const voices = Array.from(speechSynthesis.getVoices());
        if (voices.length == 0) {
            i18n_ts.msg("no voice");
            return;
        }
        for (const voice of voices) {
            if (voice.lang == languageRegion) {
                i18n_ts.msg(`voice lang:[${voice.lang}] name:[${voice.name}]`);
            }
            let voice_lang = voice.lang.replaceAll("_", "-");
            const k = voice_lang.indexOf("-#");
            if (k != -1) {
                voice_lang = voice_lang.substring(0, k);
                // msg(`lang:${voice.lang} => ${voice_lang}`);
            }
            if (voiceMap.get(voice_lang) == undefined) {
                voiceMap.set(voice_lang, []);
                if (Array.from(i18n_ts.langCodeMap.values()).includes(voice_lang)) {
                    // msg(`voice lang:${voice_lang}`);
                }
            }
            voiceMap.get(voice_lang).push(voice);
        }
    }
    function initSpeechSub() {
        if ('speechSynthesis' in window) {
            i18n_ts.msg("このブラウザは音声合成に対応しています。🎉");
        }
        else {
            i18n_ts.msg("このブラウザは音声合成に対応していません。😭");
        }
    }
    function initSpeech() {
        initSpeechSub();
        speechSynthesis.onvoiceschanged = function () {
            i18n_ts.msg("voices changed 1");
            setVoiceList();
        };
        speechSynthesis.addEventListener("voiceschanged", (ev) => {
            setVoiceList();
            i18n_ts.msg("voices changed 2");
        });
    }
    i18n_ts.initSpeech = initSpeech;
    async function asyncInitSpeech() {
        initSpeechSub();
        return new Promise((resolve) => {
            speechSynthesis.addEventListener("voiceschanged", (ev) => {
                setVoiceList();
                i18n_ts.msg("speech initialized");
                resolve();
            });
        });
    }
    i18n_ts.asyncInitSpeech = asyncInitSpeech;
    function cancelSpeech() {
        cancelSpeechFlag = true;
        speechSynthesis.cancel();
    }
    i18n_ts.cancelSpeech = cancelSpeech;
})(i18n_ts || (i18n_ts = {}));
var i18n_ts;
(function (i18n_ts) {
    //
    let PlayMode;
    (function (PlayMode) {
        PlayMode[PlayMode["stop"] = 0] = "stop";
        PlayMode[PlayMode["normal"] = 1] = "normal";
        PlayMode[PlayMode["fastForward"] = 2] = "fastForward";
    })(PlayMode = i18n_ts.PlayMode || (i18n_ts.PlayMode = {}));
    let thePlayMode = PlayMode.stop;
    const $dic = new Map();
    function setPlayMode(play_mode) {
        thePlayMode = play_mode;
    }
    i18n_ts.setPlayMode = setPlayMode;
    function getPlayMode() {
        return thePlayMode;
    }
    i18n_ts.getPlayMode = getPlayMode;
    function $(id) {
        let ele = $dic.get(id);
        if (ele == undefined) {
            ele = document.getElementById(id);
            $dic.set(id, ele);
        }
        return ele;
    }
    i18n_ts.$ = $;
    function $div(id) {
        return $(id);
    }
    i18n_ts.$div = $div;
    function $inp(id) {
        return $(id);
    }
    i18n_ts.$inp = $inp;
    function $sel(id) {
        return $(id);
    }
    i18n_ts.$sel = $sel;
    class MyError extends Error {
        constructor(text = "") {
            super(text);
        }
    }
    i18n_ts.MyError = MyError;
    function assert(b, msg = "") {
        if (!b) {
            throw new MyError(msg);
        }
    }
    i18n_ts.assert = assert;
    function check(b, msg = "") {
        if (!b) {
            throw new MyError(msg);
        }
    }
    i18n_ts.check = check;
    function msg(txt) {
        console.log(txt);
    }
    i18n_ts.msg = msg;
    async function sleep(milliseconds, fast_sleep = 1) {
        if (thePlayMode == PlayMode.fastForward) {
            assert(fast_sleep == 1);
            milliseconds = fast_sleep;
        }
        if (1 < milliseconds) {
            // msg(`sleep:[${milliseconds}]`);
        }
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, milliseconds);
        });
    }
    i18n_ts.sleep = sleep;
    function range(n) {
        return [...Array(n).keys()];
    }
    i18n_ts.range = range;
    function range2(start, end) {
        return range(end - start).map(x => start + x);
    }
    i18n_ts.range2 = range2;
    function last(v) {
        return v[v.length - 1];
    }
    i18n_ts.last = last;
    function arrayFill(size, value) {
        return new Array(size).fill(value);
    }
    i18n_ts.arrayFill = arrayFill;
    function unique(v) {
        let set = new Set();
        const ret = [];
        for (const x of v) {
            if (!set.has(x)) {
                set.add(x);
                ret.push(x);
            }
        }
        return ret;
    }
    i18n_ts.unique = unique;
    function remove(v, x, existence_check = true) {
        const idx = v.indexOf(x);
        if (idx == -1) {
            if (existence_check) {
                throw new MyError();
            }
        }
        else {
            v.splice(idx, 1);
        }
    }
    i18n_ts.remove = remove;
    function append(v, x) {
        if (!v.includes(x)) {
            v.push(x);
        }
    }
    i18n_ts.append = append;
    function sum(v) {
        return v.reduce((acc, cur) => acc + cur, 0);
    }
    i18n_ts.sum = sum;
    function list(set) {
        if (set == undefined) {
            return [];
        }
        else {
            return Array.from(set);
        }
    }
    i18n_ts.list = list;
    function intersection(set1, set2) {
        if (set1 == undefined || set2 == undefined) {
            return [];
        }
        return Array.from(set1.values()).filter(x => set2.has(x));
    }
    i18n_ts.intersection = intersection;
    function permutation(v) {
        if (v.length == 2) {
            return [[v[0], v[1]], [v[1], v[0]]];
        }
        const vv = [];
        for (const i of range(v.length)) {
            const v1 = v.slice();
            const c = v1[i];
            v1.splice(i, 1);
            const vv1 = permutation(v1);
            for (const v2 of vv1) {
                v2.unshift(c);
                vv.push(v2);
            }
        }
        return vv;
    }
    i18n_ts.permutation = permutation;
    function circularPermutation(v) {
        const vv = permutation(v.slice(1));
        vv.forEach(x => x.unshift(v[0]));
        return vv;
    }
    i18n_ts.circularPermutation = circularPermutation;
    function areSetsEqual(A, B) {
        const setA = new Set(A);
        const setB = new Set(B);
        // Check if sizes are different
        if (setA.size !== setB.size) {
            return false;
        }
        // Check if all elements of setA are present in setB
        for (const element of setA) {
            if (!setB.has(element)) {
                return false;
            }
        }
        return true;
    }
    i18n_ts.areSetsEqual = areSetsEqual;
    function isSubSet(A, B) {
        const setB = new Set(B);
        return A.every(x => setB.has(x));
    }
    i18n_ts.isSubSet = isSubSet;
    function isIdentifierLetter(c) {
        return i18n_ts.latinLetters.indexOf(c) != -1 || c == "_";
    }
    i18n_ts.isIdentifierLetter = isIdentifierLetter;
    async function fetchText(fileURL) {
        const response = await fetch(fileURL);
        const text = await response.text();
        return text;
    }
    i18n_ts.fetchText = fetchText;
    function parseURL() {
        const url = document.location.href;
        const parser = new URL(url);
        // console.log(`href:${url} origin:${parser.origin} pathname:${parser.pathname} search:${parser.search}`)
        assert(parser.origin + parser.pathname + parser.search == url);
        const queryString = parser.search.substring(1);
        const queries = queryString.split("&");
        const params = new Map();
        queries.forEach(query => {
            const [key, value] = query.split("=");
            params.set(decodeURIComponent(key), decodeURIComponent(value));
        });
        return [parser.origin, parser.pathname, params];
    }
    i18n_ts.parseURL = parseURL;
})(i18n_ts || (i18n_ts = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3RzL3JlYWRpbmcudHMiLCIuLi8uLi8uLi90cy9zcGVlY2gudHMiLCIuLi8uLi8uLi90cy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxJQUFVLE9BQU8sQ0FxZmhCO0FBcmZELFdBQVUsT0FBTztJQUVqQixJQUFJLFNBQWtCLENBQUM7SUFDdkIsSUFBSSxTQUErQixDQUFDO0lBR3pCLGNBQU0sR0FBYSxLQUFLLENBQUM7SUFFcEMsSUFBWSxPQUtYO0lBTEQsV0FBWSxPQUFPO1FBQ2YscUNBQUksQ0FBQTtRQUNKLHFDQUFJLENBQUE7UUFDSixpREFBVSxDQUFBO1FBQ1YsaURBQVUsQ0FBQTtJQUNkLENBQUMsRUFMVyxPQUFPLEdBQVAsZUFBTyxLQUFQLGVBQU8sUUFLbEI7SUFFVSx3QkFBZ0IsR0FBWSxLQUFLLENBQUM7SUFVN0MsSUFBSSxRQUE4QixDQUFDO0lBRW5DLE1BQU0sU0FBUyxHQUEyQztRQUN0RCxDQUFFLGlCQUFpQixFQUFFLEtBQUssRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN2QyxDQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDMUIsQ0FBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQy9CLENBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNsQyxDQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDL0IsQ0FBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzlCLENBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNqQyxDQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDM0IsQ0FBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzNCLENBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMvQixDQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDL0IsQ0FBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0tBQ3BDLENBQUM7SUFFRixNQUFNLFFBQVEsR0FBYyxFQUFFLENBQUM7SUFFL0I7OztPQUdHO0lBQ0gsSUFBSSxjQUFjLEdBQUcsSUFBSSxHQUFHLENBQTJCLEVBQ3RELENBQUMsQ0FBQztJQUVIOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O01Bb0RFO0lBRUYsSUFBSSxjQUFjLEdBQXlCLElBQUksR0FBRyxFQUFrQixDQUFDO0lBQ3JFLElBQUksZ0JBQXlCLENBQUM7SUFFOUIsU0FBZ0IsbUJBQW1CLENBQUMsS0FBYztRQUM5QyxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEMsSUFBRyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFDLENBQUM7WUFDdEIsUUFBQSxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7UUFDN0IsQ0FBQzthQUNHLENBQUM7WUFDRCxNQUFNLElBQUksUUFBQSxPQUFPLEVBQUUsQ0FBQztRQUN4QixDQUFDO0lBQ0wsQ0FBQztJQVJlLDJCQUFtQixzQkFRbEMsQ0FBQTtJQUVELFNBQVMsV0FBVztRQUNoQixNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVCLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFNUIsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoQyxNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBR2hDLFFBQUEsaUJBQWlCLEdBQUcsUUFBQSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDNUUsUUFBQSxpQkFBaUIsR0FBRyxRQUFBLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM1RSxRQUFBLFlBQVksR0FBRyxRQUFBLGlCQUFpQixHQUFHLFFBQUEsaUJBQWlCLENBQUM7UUFFckQsUUFBQSxpQkFBaUIsR0FBRyxRQUFBLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDckcsUUFBQSxpQkFBaUIsR0FBRyxRQUFBLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFF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LEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUV2QyxNQUFNLE1BQU0sR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztRQUN6QyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ3BCLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN0QyxNQUFNLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxFQUFFLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDbkUsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLENBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFoQmUsZ0JBQVEsV0FnQnZCLENBQUE7QUFFRCxDQUFDLEVBek9TLE9BQU8sS0FBUCxPQUFPLFFBeU9oQiIsInNvdXJjZXNDb250ZW50IjpbIm5hbWVzcGFjZSBpMThuX3RzIHtcclxuXHJcbmxldCB1cmxPcmlnaW4gOiBzdHJpbmc7XHJcbmxldCB1cmxQYXJhbXMgOiBNYXA8c3RyaW5nLCBzdHJpbmc+O1xyXG5cclxuZXhwb3J0IGxldCBhcHBNb2RlIDogQXBwTW9kZTtcclxuZXhwb3J0IGxldCBpc0VkZ2UgOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG5leHBvcnQgZW51bSBBcHBNb2RlIHtcclxuICAgIGVkaXQsXHJcbiAgICBwbGF5LFxyXG4gICAgbGVzc29uRWRpdCxcclxuICAgIGxlc3NvblBsYXksXHJcbn1cclxuXHJcbmV4cG9ydCBsZXQgdGV4dExhbmd1YWdlQ29kZSA6IHN0cmluZyA9IFwiZW5nXCI7XHJcblxyXG5leHBvcnQgbGV0ICB1cHBlckxhdGluTGV0dGVycyA6IHN0cmluZztcclxuZXhwb3J0IGxldCAgbG93ZXJMYXRpbkxldHRlcnMgOiBzdHJpbmc7XHJcbmV4cG9ydCBsZXQgIGxhdGluTGV0dGVycyA6IHN0cmluZztcclxuXHJcbmV4cG9ydCBsZXQgIHVwcGVyR3JlZWtMZXR0ZXJzIDogc3RyaW5nO1xyXG5leHBvcnQgbGV0ICBsb3dlckdyZWVrTGV0dGVycyA6IHN0cmluZztcclxuXHJcbmV4cG9ydCBsZXQgRW5nVGV4dFRvSWQgOiBNYXA8c3RyaW5nLCBudW1iZXI+O1xyXG5sZXQgVGV4dFRvSWQgOiBNYXA8c3RyaW5nLCBudW1iZXI+O1xyXG5cclxuY29uc3QgbGFuZ3VhZ2VzIDogKFtzdHJpbmcsIHN0cmluZywgW3N0cmluZyxzdHJpbmddXSlbXSA9IFtcclxuICAgIFsgXCLYp9mO2YTZkti52Y7YsdmO2KjZkNmK2Y7Zkdip2Y9cIiwgXCJhcmFcIiwgWydcIicsICdcIiddXSxcclxuICAgIFsgXCLmsYnor61cIiwgXCJjaGlcIiwgWyfigJwnLCAn4oCdJ11dLFxyXG4gICAgWyBcIkVuZ2xpc2hcIiwgXCJlbmdcIiwgWydcIicsICdcIiddXSxcclxuICAgIFsgXCJmcmFuw6dhaXNcIiwgXCJmcmVcIiwgWyfCq8KgJywgJ8KgwrsnXV0sXHJcbiAgICBbIFwiRGV1dHNjaFwiLCBcImdlclwiLCBbJ+KAnicsICfigJwnXV0sXHJcbiAgICBbIFwi4KS54KS/4KSo4KWN4KSm4KWAXCIsIFwiaGluXCIsIFsnXCInLCAnXCInXV0sXHJcbiAgICBbIFwiSW5kb25lc2lhXCIsIFwiaW5kXCIsIFsnXCInLCAnXCInXV0sXHJcbiAgICBbIFwi5pel5pys6KqeXCIsIFwianBuXCIsIFsn44CMJywgJ+OAjSddXSxcclxuICAgIFsgXCLtlZzqta3slrRcIiwgXCJrb3JcIiwgWydcIicsICdcIiddXSxcclxuICAgIFsgXCLQoNGD0YHRgdC60LjQuVwiLCBcInJ1c1wiLCBbJ8KrJywgJ8K7J11dLFxyXG4gICAgWyBcImVzcGHDsW9sXCIsIFwic3BhXCIsIFsnXCInLCAnXCInXV0sXHJcbiAgICBbIFwicG9ydHVndcOqc1wiLCBcInBvclwiLCBbJ1wiJywgJ1wiJ11dLFxyXG5dO1xyXG5cclxuY29uc3QgZW5nVGV4dHMgOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuLyoqXHJcblF1b3RhdGlvbiBtYXJrXHJcbiAgICBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9RdW90YXRpb25fbWFya1xyXG4gKi9cclxubGV0IHF1b3RhdGlvbk1hcmtzID0gbmV3IE1hcDxzdHJpbmcsIFtzdHJpbmcsIHN0cmluZ10+KFtcclxuXSk7XHJcblxyXG4vKlxyXG5MaXN0IG9mIElTTyA2MzkgbGFuZ3VhZ2UgY29kZXNcclxuICAgIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0xpc3Rfb2ZfSVNPXzYzOV9sYW5ndWFnZV9jb2Rlc1xyXG5cclxuQXJhYmljXHRhclx0YXJhXHRhcmFcclxuQmVuZ2FsaVx0Ym5cdGJlblx0YmVuXHJcbkJ1cm1lc2VcdG15XHRteWFcdGJ1clxyXG5DaGluZXNlXHR6aFx0emhvXHRjaGlcclxuRHV0Y2hcdG5sXHRubGRcdGR1dFxyXG5FbmdsaXNoXHRlblx0ZW5nXHRlbmdcclxuRnJlbmNoXHQgICAgZnJcdGZyYVx0ZnJlXHJcbkdlcm1hblx0ICAgIGRlXHRkZXVcdGdlclxyXG5HcmVla1x0ICAgIGVsXHRlbGxcdGdyZVxyXG5IZWJyZXdcdCAgICBoZVx0aGViXHRoZWJcclxuSGluZGlcdGhpXHRoaW5cdGhpblxyXG5JbmRvbmVzaWFuXHRpZFx0aW5kXHRpbmRcclxuSXRhbGlhblx0ICAgIGl0XHRpdGFcdGl0YVxyXG5KYXBhbmVzZSAgICBqYVx0anBuXHRqcG5cclxuSmF2YW5lc2VcdGp2XHRqYXZcdGphdlxyXG5LaG1lclx0a21cdGtobVx0a2htXHJcbktvcmVhblx0a29cdGtvclx0a29yXHJcbk1vbmdvbGlhblx0bW5cdG1vblx0bW9uXHJcbk5lcGFsaVx0bmVcdG5lcFx0bmVwXHJcblBlcnNpYW5cdGZhXHRmYXNcdHBlclxyXG5Qb2xpc2hcdHBsXHRwb2xcdHBvbFxyXG5QdW5qYWJpXHRwYVx0cGFuXHRwYW5cclxuUG9ydHVndWVzZVx0cHRcdHBvclx0cG9yXHJcblJ1c3NpYW5cdHJ1XHRydXNcdHJ1c1xyXG5TcGFuaXNoXHRlc1x0c3BhXHRzcGFcclxuVGFnYWxvZ1x0dGxcdHRnbFx0dGdsXHJcblRhbWlsXHR0YVx0dGFtXHR0YW1cclxuVGhhaVx0dGhcdHRoYVx0dGhhXHJcblR1cmtpc2hcdHRyXHR0dXJcdHR1clxyXG5VcmR1XHR1clx0dXJkXHR1cmRcclxuVmlldG5hbWVzZVx0dmlcdHZpZVx0dmllXHJcblxyXG5cclxuSW50ZXJuZXQgdXNlcnMgYnkgbGFuZ3VhZ2VcclxuICAgIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0xhbmd1YWdlc191c2VkX29uX3RoZV9JbnRlcm5ldFxyXG5cclxuMVx0RW5nbGlzaFx0MSwxODYsNDUxLDA1Mlx0MjUuOSVcclxuMlx0Q2hpbmVzZVx0ODg4LDQ1MywwNjhcdDE5LjQlXHJcbjNcdFNwYW5pc2hcdDM2Myw2ODQsNTkzXHQgIDcuOSVcclxuNFx0QXJhYmljXHQyMzcsNDE4LDM0OVx0ICA1LjIlXHJcbjVcdEluZG9uZXNpYW5cdDE5OCwwMjksODE1XHQgIDQuMyVcclxuNlx0UG9ydHVndWVzZVx0MTcxLDc1MCw4MThcdCAgMy43JVxyXG43XHRGcmVuY2hcdDE0NCw2OTUsMjg4XHQgIDMuMyAlXHJcbjhcdEphcGFuZXNlXHQxMTgsNjI2LDY3Mlx0ICAyLjYlXHJcbjlcdFJ1c3NpYW5cdDExNiwzNTMsOTQyXHQgIDIuNSVcclxuMTBcdEdlcm1hblx0OTIsNTI1LDQyN1x0ICAyLjAlXHJcbjHigJMxMFx0VG9wIDEwIGxhbmd1YWdlc1x0Myw1MjUsMDI3LDM0N1x0ICA3Ni45JVxyXG5cclxuKi9cclxuXHJcbmxldCB0cmFuc2xhdGlvbk1hcCA6IE1hcDxzdHJpbmcsIHN0cmluZz4gPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xyXG5sZXQgbWF4VHJhbnNsYXRpb25JZCA6IG51bWJlcjtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRUZXh0TGFuZ3VhZ2VDb2RlKGNvZGUzIDogc3RyaW5nKXtcclxuICAgIGNvbnN0IGNvZGUzcyA9IGxhbmd1YWdlcy5tYXAoeCA9PiB4WzFdKTtcclxuICAgIGlmKGNvZGUzLmluY2x1ZGVzKGNvZGUzKSl7XHJcbiAgICAgICAgdGV4dExhbmd1YWdlQ29kZSA9IGNvZGUzO1xyXG4gICAgfVxyXG4gICAgZWxzZXtcclxuICAgICAgICB0aHJvdyBuZXcgTXlFcnJvcigpO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0TGV0dGVycygpe1xyXG4gICAgY29uc3QgQSA9IFwiQVwiLmNoYXJDb2RlQXQoMCk7XHJcbiAgICBjb25zdCBhID0gXCJhXCIuY2hhckNvZGVBdCgwKTtcclxuXHJcbiAgICBjb25zdCBBbHBoYSA9IFwizpFcIi5jaGFyQ29kZUF0KDApO1xyXG4gICAgY29uc3QgYWxwaGEgPSBcIs6xXCIuY2hhckNvZGVBdCgwKTtcclxuXHJcblxyXG4gICAgdXBwZXJMYXRpbkxldHRlcnMgPSByYW5nZSgyNikubWFwKGkgPT4gU3RyaW5nLmZyb21DaGFyQ29kZShBICsgaSkpLmpvaW4oXCJcIik7XHJcbiAgICBsb3dlckxhdGluTGV0dGVycyA9IHJhbmdlKDI2KS5tYXAoaSA9PiBTdHJpbmcuZnJvbUNoYXJDb2RlKGEgKyBpKSkuam9pbihcIlwiKTtcclxuICAgIGxhdGluTGV0dGVycyA9IHVwcGVyTGF0aW5MZXR0ZXJzICsgbG93ZXJMYXRpbkxldHRlcnM7XHJcblxyXG4gICAgdXBwZXJHcmVla0xldHRlcnMgPSByYW5nZSgyNCkuZmlsdGVyKGkgPT4gaSAhPSAxNykubWFwKGkgPT4gU3RyaW5nLmZyb21DaGFyQ29kZShBbHBoYSArIGkpKS5qb2luKFwiXCIpO1xyXG4gICAgbG93ZXJHcmVla0xldHRlcnMgPSByYW5nZSgyNCkuZmlsdGVyKGkgPT4gaSAhPSAxNykubWFwKGkgPT4gU3RyaW5nLmZyb21DaGFyQ29kZShhbHBoYSArIGkpKS5qb2luKFwiXCIpO1xyXG5cclxuICAgIC8vIG1zZyh1cHBlckxhdGluTGV0dGVycyk7XHJcbiAgICAvLyBtc2cobG93ZXJMYXRpbkxldHRlcnMpO1xyXG4gICAgLy8gbXNnKHVwcGVyR3JlZWtMZXR0ZXJzKTtcclxuICAgIC8vIG1zZyhsb3dlckdyZWVrTGV0dGVycyk7XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBbGxUZXh0cygpIHtcclxuICAgIGNvbnN0IFsgb3JpZ2luLCAsIF0gPSBpMThuX3RzLnBhcnNlVVJMKCk7XHJcblxyXG4gICAgY29uc3QgbmFtZXMgPSBbXHJcbiAgICAgICAgXCJwYXJzZXJcIixcclxuICAgICAgICBcInBsYW5lXCIsXHJcbiAgICAgICAgXCJmaXJlYmFzZVwiLFxyXG4gICAgICAgIFwibW92aWVcIlxyXG4gICAgXTtcclxuXHJcbiAgICBjb25zdCB0ZXh0cyA6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgZm9yKGNvbnN0IG5hbWUgb2YgbmFtZXMpe1xyXG4gICAgICAgIGNvbnN0IHVybCA9IGAke29yaWdpbn0vbGliLyR7bmFtZX0vJHtuYW1lfS5qc2A7XHJcbiAgICAgICAgbXNnKGBqcyB1cmw6JHt1cmx9YCk7XHJcbiAgICAgICAgY29uc3QgdGV4dCA9IGF3YWl0IGZldGNoVGV4dCh1cmwpO1xyXG5cclxuICAgICAgICBmb3IoY29uc3QgcXVvdGUgb2YgWyBcIidcIiwgJ1wiJyBdKXtcclxuICAgICAgICAgICAgbGV0IHN0YXJ0ID0gMDtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IFRUX3F1b3RlID0gYFRUKCR7cXVvdGV9YDtcclxuICAgICAgICAgICAgd2hpbGUodHJ1ZSl7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgazEgPSB0ZXh0LmluZGV4T2YoVFRfcXVvdGUsIHN0YXJ0KTtcclxuICAgICAgICAgICAgICAgIGlmKGsxID09IC0xKXtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZigwIDwgazEgJiYgaXNJZGVudGlmaWVyTGV0dGVyKHRleHQuY2hhckF0KGsxIC0gMSkpKXtcclxuICAgICAgICAgICAgICAgICAgICBzdGFydCA9IGsxICsgMztcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBrMiA9IHRleHQuaW5kZXhPZihxdW90ZSwgazEgKyAzKTtcclxuICAgICAgICAgICAgICAgIGFzc2VydChrMiAhPSAtMSk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzID0gdGV4dC5zdWJzdHJpbmcoazEgKyAzLCBrMik7XHJcbiAgICAgICAgICAgICAgICB0ZXh0cy5wdXNoKHMpO1xyXG4gICAgICAgICAgICAgICAgc3RhcnQgPSBrMiArIDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRleHRzO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gVFQodGV4dCA6IHN0cmluZykgOiBzdHJpbmcge1xyXG4gICAgdGV4dCA9IHRleHQudHJpbSgpO1xyXG5cclxuICAgIGlmKHRleHQgPT0gXCJcIiB8fCB0ZXh0TGFuZ3VhZ2VDb2RlID09IFwiZW5nXCIpe1xyXG4gICAgICAgIHJldHVybiB0ZXh0O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHRhcmdldCA9IHRyYW5zbGF0aW9uTWFwLmdldCh0ZXh0KTtcclxuICAgIGlmKHRhcmdldCA9PSB1bmRlZmluZWQpe1xyXG5cclxuICAgICAgICBpZighZW5nVGV4dHMuaW5jbHVkZXModGV4dCkpe1xyXG4gICAgICAgICAgICBtc2coYG5ldyB0ZXh0Olske3RleHR9XWApO1xyXG4gICAgICAgICAgICBlbmdUZXh0cy5wdXNoKHRleHQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0YXJnZXQgIT0gdW5kZWZpbmVkID8gdGFyZ2V0LnRyaW0oKSA6IHRleHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRFbmdUZXh0cygpIDogc3RyaW5nIHtcclxuICAgIHJldHVybiBBcnJheS5mcm9tKGVuZ1RleHRzLmVudHJpZXMoKSkubWFwKHggPT4gYCR7bWF4VHJhbnNsYXRpb25JZCArIDEgKyB4WzBdfToke3hbMV19YCkuam9pbihcIlxcblxcblwiKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIFRUcyh0ZXh0IDogc3RyaW5nKSA6IHN0cmluZ1tdIHtcclxuICAgIGNvbnN0IGxpbmVzID0gdGV4dC5zcGxpdChcIlxcblwiKS5tYXAoeCA9PiB4LnRyaW0oKSkuZmlsdGVyKHggPT4geCAhPSBcIlwiKTtcclxuICAgIHJldHVybiBsaW5lcy5tYXAoeCA9PiBUVCh4KSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRJZEZyb21UZXh0KHRleHQgOiBzdHJpbmcpIDogbnVtYmVyIHwgdW5kZWZpbmVkIHtcclxuICAgIHJldHVybiBUZXh0VG9JZC5nZXQodGV4dCk7XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBnZXRRdW90YXRpb25NYXJrcygpIDogW3N0cmluZywgc3RyaW5nXXtcclxuICAgIGNvbnN0IG1hcmtzID0gcXVvdGF0aW9uTWFya3MuZ2V0KHRleHRMYW5ndWFnZUNvZGUpO1xyXG4gICAgaWYobWFya3MgPT0gdW5kZWZpbmVkKXtcclxuICAgICAgICByZXR1cm4gWydcIicsICdcIiddO1xyXG4gICAgfVxyXG4gICAgZWxzZXtcclxuICAgICAgICByZXR1cm4gbWFya3M7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB0b2tlbih0ZXh0IDogc3RyaW5nKSA6IHN0cmluZyB7XHJcbiAgICBpZih0ZXh0TGFuZ3VhZ2VDb2RlID09IFwiYXJhXCIpe1xyXG4gICAgICAgIHN3aXRjaChcIkFCQ0RFXCIuaW5kZXhPZih0ZXh0KSl7XHJcbiAgICAgICAgY2FzZSAwOiByZXR1cm4gXCLYo1wiO1xyXG4gICAgICAgIGNhc2UgMTogcmV0dXJuIFwi2KhcIjtcclxuICAgICAgICBjYXNlIDI6IHJldHVybiBcItisXCI7XHJcbiAgICAgICAgY2FzZSAzOiByZXR1cm4gXCLYr1wiO1xyXG4gICAgICAgIGNhc2UgNDogcmV0dXJuIFwi2YfZgFwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IoKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBbc3RhcnRfbWFyaywgZW5kX21hcmtdID0gZ2V0UXVvdGF0aW9uTWFya3MoKTtcclxuICAgIHJldHVybiBzdGFydF9tYXJrICsgdGV4dCArIGVuZF9tYXJrO1xyXG59XHJcblxyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgIEFic3RyYWN0U3BlZWNoIHsgICAgXHJcbiAgICBzdGF0aWMgb25lIDogQWJzdHJhY3RTcGVlY2g7XHJcblxyXG4gICAgcHJldkNoYXJJbmRleCA9IDA7XHJcbiAgICBzcGVha2luZyA6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICBjYWxsYmFjayA6ICgoaWR4Om51bWJlcik9PnZvaWQpIHwgdW5kZWZpbmVkO1xyXG4gICAgYWJzdHJhY3Qgc3BlYWsodGV4dCA6IHN0cmluZykgOiBQcm9taXNlPHZvaWQ+O1xyXG4gICAgYWJzdHJhY3Qgd2FpdEVuZCgpIDogUHJvbWlzZTx2b2lkPjtcclxuICAgIGFic3RyYWN0IHNwZWFrX3dhaXRFbmQodGV4dCA6IHN0cmluZykgOiBQcm9taXNlPHZvaWQ+O1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFJlYWRhYmxlIHtcclxuICAgIHJlYWRpbmcoKSA6IFJlYWRpbmc7XHJcbiAgICBoaWdobGlnaHQob24gOiBib29sZWFuKSA6IHZvaWQ7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBSZWFkaW5nIHtcclxuICAgIHJlYWRhYmxlIDogUmVhZGFibGU7XHJcbiAgICB0ZXh0IDogc3RyaW5nO1xyXG4gICAgYXJncyA6IFJlYWRhYmxlW107XHJcbiAgICBjaGlsZHJlbiA6IFJlYWRpbmdbXTtcclxuICAgIHBocmFzZXMgOiAoc3RyaW5nIHwgUmVhZGluZylbXSA9IFtdO1xyXG4gICAgc3RhcnQgOiBudW1iZXIgPSBOYU47XHJcbiAgICBlbmQgICA6IG51bWJlciA9IE5hTjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihyZWFkYWJsZSA6IFJlYWRhYmxlLCB0ZXh0IDogc3RyaW5nLCBhcmdzIDogUmVhZGFibGVbXSl7XHJcbiAgICAgICAgdGhpcy5yZWFkYWJsZSA9IHJlYWRhYmxlO1xyXG5cclxuICAgICAgICB0aGlzLnRleHQgPSB0ZXh0O1xyXG5cclxuICAgICAgICB0aGlzLmFyZ3MgPSBhcmdzO1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4gPSBhcmdzLm1hcCh4ID0+IHgucmVhZGluZygpKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRQaHJhc2VzKCl7XHJcbiAgICAgICAgaWYodGhpcy5jaGlsZHJlbi5sZW5ndGggPT0gMCl7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnBocmFzZXMgPSBbIHRoaXMudGV4dCBdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICBjb25zdCBxdW90ZXMgPSByYW5nZSh0aGlzLmNoaWxkcmVuLmxlbmd0aCkubWFwKGkgPT4gdG9rZW4oIHVwcGVyTGF0aW5MZXR0ZXJzLmNoYXJBdChpKSApKTtcclxuICAgICAgICAgICAgY29uc3QgcG9zaXRpb25zID0gcXVvdGVzLm1hcCh4ID0+IHRoaXMudGV4dC5pbmRleE9mKHgpKTtcclxuICAgICAgICAgICAgYXNzZXJ0KHBvc2l0aW9ucy5ldmVyeShpID0+IGkgIT0gLTEpKTtcclxuICAgIFxyXG4gICAgICAgICAgICBjb25zdCBpbmRleF9wb3NpdGlvbnMgPSBBcnJheS5mcm9tKHBvc2l0aW9ucy5lbnRyaWVzKCkpO1xyXG4gICAgICAgICAgICBpbmRleF9wb3NpdGlvbnMuc29ydCgoYSwgYik9PiBhWzFdIC0gYlsxXSk7XHJcblxyXG4gICAgICAgICAgICBsZXQgcG9zID0gMDtcclxuICAgICAgICAgICAgZm9yKGNvbnN0IFtpbmRleCwgcG9zaXRpb25dIG9mIGluZGV4X3Bvc2l0aW9ucyl7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYocG9zIDwgcG9zaXRpb24pe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGhyYXNlcy5wdXNoKHRoaXMudGV4dC5zdWJzdHJpbmcocG9zLCBwb3NpdGlvbikpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMucGhyYXNlcy5wdXNoKHRoaXMuY2hpbGRyZW5baW5kZXhdKTtcclxuICAgIFxyXG4gICAgICAgICAgICAgICAgcG9zID0gcG9zaXRpb24gKyBxdW90ZXNbaW5kZXhdLmxlbmd0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgXHJcbiAgICAgICAgICAgIGlmKHBvcyA8IHRoaXMudGV4dC5sZW5ndGgpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5waHJhc2VzLnB1c2godGhpcy50ZXh0LnN1YnN0cmluZyhwb3MpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXRTdGFydEVuZChzdGFydCA6IG51bWJlcikge1xyXG4gICAgICAgIGlmKHRoaXMuY2hpbGRyZW4ubGVuZ3RoID09IDApe1xyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0ID0gc3RhcnQ7XHJcbiAgICAgICAgICAgIHRoaXMuZW5kICAgPSBzdGFydCArIHRoaXMudGV4dC5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIGxldCBwb3MgPSBzdGFydDtcclxuICAgICAgICAgICAgZm9yKGNvbnN0IHBocmFzZSBvZiB0aGlzLnBocmFzZXMpe1xyXG4gICAgICAgICAgICAgICAgaWYodHlwZW9mIHBocmFzZSA9PSBcInN0cmluZ1wiKXtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcG9zICs9IHBocmFzZS5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNle1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBwaHJhc2Uuc2V0U3RhcnRFbmQocG9zKTtcclxuICAgICAgICAgICAgICAgICAgICBwb3MgPSBwaHJhc2UuZW5kO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldEFsbFRleHRzKHRleHRzOiBzdHJpbmdbXSl7XHJcbiAgICAgICAgaWYodGhpcy5jaGlsZHJlbi5sZW5ndGggPT0gMCl7XHJcbiAgICAgICAgICAgIHRleHRzLnB1c2godGhpcy50ZXh0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgZm9yKGNvbnN0IHBocmFzZSBvZiB0aGlzLnBocmFzZXMpe1xyXG4gICAgICAgICAgICAgICAgaWYodHlwZW9mIHBocmFzZSA9PSBcInN0cmluZ1wiKXtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dHMucHVzaChwaHJhc2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZXtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcGhyYXNlLmdldEFsbFRleHRzKHRleHRzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcmVwYXJlUmVhZGluZygpIDogc3RyaW5nIHtcclxuICAgICAgICB0aGlzLnNldFBocmFzZXMoKTtcclxuICAgICAgICB0aGlzLnNldFN0YXJ0RW5kKDApO1xyXG5cclxuICAgICAgICBjb25zdCB0ZXh0cyA6IHN0cmluZ1tdID0gW107XHJcbiAgICAgICAgdGhpcy5nZXRBbGxUZXh0cyh0ZXh0cyk7XHJcblxyXG4gICAgICAgIGNvbnN0IGFsbF90ZXh0ID0gdGV4dHMuam9pbihcIlwiKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGFsbF90ZXh0O1xyXG4gICAgfVxyXG5cclxuICAgIGdldEFsbFJlYWRpbmdzU3ViKHJlYWRpbmdzOiBSZWFkaW5nW10pe1xyXG4gICAgICAgIHJlYWRpbmdzLnB1c2godGhpcyk7XHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKHggPT4geC5nZXRBbGxSZWFkaW5nc1N1YihyZWFkaW5ncykpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEFsbFJlYWRpbmdzKCkgOiBSZWFkaW5nW10ge1xyXG4gICAgICAgIGNvbnN0IHJlYWRpbmdzOiBSZWFkaW5nW10gPSBbXTtcclxuICAgICAgICB0aGlzLmdldEFsbFJlYWRpbmdzU3ViKHJlYWRpbmdzKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJlYWRpbmdzO1xyXG4gICAgfVxyXG5cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gZ2V0VHJhbnNsYXRpb25NYXAobGFuZ19jb2RlIDogc3RyaW5nKSA6IFByb21pc2U8W01hcDxudW1iZXIsIHN0cmluZz4sIE1hcDxzdHJpbmcsIG51bWJlcj5dPiB7XHJcbiAgICBjb25zdCB1cmwgPSBgJHt1cmxPcmlnaW59L2xpYi9pMThuL3RyYW5zbGF0aW9uLyR7bGFuZ19jb2RlfS50eHQ/dmVyPSR7RGF0ZS5ub3coKX1gO1xyXG4gICAgbGV0IHRleHRzID0gYXdhaXQgZmV0Y2hUZXh0KHVybCk7XHJcblxyXG4gICAgLy8gZm9yIGNoaW5lc2UgdGV4dC5cclxuICAgIHRleHRzID0gdGV4dHMucmVwbGFjZUFsbChcIu+8mlwiLCBcIjpcIik7XHJcblxyXG4gICAgY29uc3QgaWRfdG9fdGV4dCA9IG5ldyBNYXA8bnVtYmVyLCBzdHJpbmc+KCk7XHJcbiAgICBjb25zdCB0ZXh0X3RvX2lkID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcj4oKTtcclxuXHJcbiAgICBmb3IobGV0IGxpbmUgb2YgdGV4dHMuc3BsaXQoXCJcXG5cIikpe1xyXG4gICAgICAgIGxpbmUgPSBsaW5lLnRyaW0oKTtcclxuICAgICAgICBpZihsaW5lID09IFwiXCIpe1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgazMgPSBsaW5lLmluZGV4T2YoXCI6XCIpO1xyXG4gICAgICAgIGFzc2VydChrMyAhPSAtMSk7XHJcbiAgICAgICAgY29uc3QgaWQgPSBwYXJzZUludCggbGluZS5zdWJzdHJpbmcoMCwgazMpICk7XHJcbiAgICAgICAgY29uc3QgdGV4dCA9IGxpbmUuc3Vic3RyaW5nKGszICsgMSk7XHJcbiAgICAgICAgaWYodGV4dCA9PSBcIlwiKXtcclxuICAgICAgICAgICAgbXNnKGBza2lwOiR7bGFuZ19jb2RlfSAke2lkfWApO1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWRfdG9fdGV4dC5zZXQoaWQsIHRleHQpO1xyXG5cclxuICAgICAgICBjb25zdCBpZDIgPSB0ZXh0X3RvX2lkLmdldCh0ZXh0KTtcclxuICAgICAgICBpZihpZDIgIT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgbXNnKGBkdXA6JHtsYW5nX2NvZGV9ICR7aWQyfSAke2lkfSAke3RleHR9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRleHRfdG9faWQuc2V0KHRleHQsIGlkKTtcclxuICAgIH1cclxuICAgIG1zZyhgZ2V0LVRyYW5zbGF0aW9uLU1hcDoke2xhbmdfY29kZX0gJHtpZF90b190ZXh0LnNpemV9ICR7dGV4dF90b19pZC5zaXplfWApO1xyXG5cclxuICAgIHJldHVybiBbaWRfdG9fdGV4dCwgdGV4dF90b19pZF07XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkVHJhbnNsYXRpb25NYXAoKSB7XHJcbiAgICBjb25zdCBbaWRfdG9fdGV4dDEsIHRleHRfdG9faWQxXSA9IGF3YWl0IGdldFRyYW5zbGF0aW9uTWFwKFwiZW5nXCIpO1xyXG4gICAgRW5nVGV4dFRvSWQgPSB0ZXh0X3RvX2lkMTtcclxuXHJcbiAgICBpZih0ZXh0TGFuZ3VhZ2VDb2RlID09IFwiZW5nXCIpe1xyXG4gICAgICAgIFRleHRUb0lkID0gdGV4dF90b19pZDE7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IFtpZF90b190ZXh0MiwgdGV4dF90b19pZDJdID0gYXdhaXQgZ2V0VHJhbnNsYXRpb25NYXAodGV4dExhbmd1YWdlQ29kZSk7XHJcbiAgICBUZXh0VG9JZCA9IHRleHRfdG9faWQyO1xyXG5cclxuICAgIGZvcihjb25zdCBbaWQsIHRleHQyXSBvZiBpZF90b190ZXh0Mi5lbnRyaWVzKCkpe1xyXG4gICAgICAgIGNvbnN0IHRleHQxID0gaWRfdG9fdGV4dDEuZ2V0KGlkKTtcclxuICAgICAgICBpZih0ZXh0MSAhPSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICB0cmFuc2xhdGlvbk1hcC5zZXQodGV4dDEudHJpbSgpLCB0ZXh0Mi50cmltKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICBtc2coYG5vIHRyYW5zbGF0aW9uOiR7aWR9ICR7dGV4dDJ9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSAgICBcclxuXHJcbiAgICBtYXhUcmFuc2xhdGlvbklkID0gTWF0aC5tYXgoLi4uIEFycmF5LmZyb20oaWRfdG9fdGV4dDEua2V5cygpKSk7XHJcbiAgICBtc2coYHRyYW5zbGF0aW9uLU1hcCBzaXplOiR7dHJhbnNsYXRpb25NYXAuc2l6ZX0gbWF4OiR7bWF4VHJhbnNsYXRpb25JZH1gKTtcclxufVxyXG5cclxuZnVuY3Rpb24gY2hlY2tCcm93c2VyKCl7XHJcbiAgICBpZigobmF2aWdhdG9yIGFzIGFueSkudXNlckFnZW50RGF0YSAhPSB1bmRlZmluZWQpe1xyXG4gICAgICAgIGNvbnN0IGJyYW5kcyA9IChuYXZpZ2F0b3IgYXMgYW55KS51c2VyQWdlbnREYXRhLmJyYW5kcztcclxuICAgICAgICBmb3IoY29uc3QgYnJhbmQgb2YgYnJhbmRzKXtcclxuICAgICAgICAgICAgaWYoKGJyYW5kLmJyYW5kIGFzIHN0cmluZykuaW5jbHVkZXMoXCJFZGdlXCIpKXtcclxuICAgICAgICAgICAgICAgIGlzRWRnZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBtc2coXCJpcyBFZGdlIDogdHJ1ZVwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBtc2coYHVzZXJBZ2VudERhdGE6WyR7YnJhbmQuYnJhbmR9XWApXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgbXNnKGB1c2VyQWdlbnQ6WyR7bmF2aWdhdG9yLnVzZXJBZ2VudH1dYCk7XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbml0STE4bigpe1xyXG4gICAgY2hlY2tCcm93c2VyKCk7XHJcblxyXG4gICAgaW5pdExldHRlcnMoKTtcclxuXHJcbiAgICBmb3IoY29uc3QgW25hbWUsIGNvZGUsIHF1b3Rlc10gb2YgbGFuZ3VhZ2VzKXtcclxuICAgICAgICBxdW90YXRpb25NYXJrcy5zZXQoY29kZSwgcXVvdGVzKTtcclxuICAgIH1cclxuXHJcbiAgICBbIHVybE9yaWdpbiwgLCB1cmxQYXJhbXNdID0gaTE4bl90cy5wYXJzZVVSTCgpO1xyXG5cclxuICAgIGlmKHVybFBhcmFtcy5nZXQoXCJsZXNzb25cIikgIT0gdW5kZWZpbmVkKXtcclxuXHJcbiAgICAgICAgYXBwTW9kZSA9IEFwcE1vZGUubGVzc29uUGxheTtcclxuICAgIH1cclxuICAgIGVsc2V7XHJcblxyXG4gICAgICAgIHN3aXRjaCh1cmxQYXJhbXMuZ2V0KFwibW9kZVwiKSl7XHJcbiAgICAgICAgY2FzZSBcImVkaXRcIjpcclxuICAgICAgICAgICAgYXBwTW9kZSA9IEFwcE1vZGUuZWRpdDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBcImxlc3NvblwiOlxyXG4gICAgICAgICAgICBhcHBNb2RlID0gQXBwTW9kZS5sZXNzb25FZGl0O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICBhcHBNb2RlID0gQXBwTW9kZS5wbGF5O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGlmKHF1b3RhdGlvbk1hcmtzLmhhcyh0ZXh0TGFuZ3VhZ2VDb2RlKSl7XHJcbiAgICAgICAgbXNnKGBsYW5nIGNvZGU6JHt0ZXh0TGFuZ3VhZ2VDb2RlfWApO1xyXG4gICAgICAgIGF3YWl0IGxvYWRUcmFuc2xhdGlvbk1hcCgpO1xyXG4gICAgfVxyXG4gICAgZWxzZXtcclxuICAgICAgICBtc2coYGlsbGVnYWwgbGFuZyBjb2RlOiR7dGV4dExhbmd1YWdlQ29kZX1gKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJvZHlPbkxvYWQoKXtcclxuICAgIGF3YWl0IGluaXRJMThuKCk7XHJcblxyXG4gICAgY29uc3QgdGV4dHMgPSBhd2FpdCBnZXRBbGxUZXh0cygpO1xyXG4gICAgY29uc3QgdGV4dCA9IEFycmF5LmZyb20odGV4dHMuZW50cmllcygpKS5tYXAoeD0+KHhbMF0gKyBcIjpcIiArIHhbMV0pKS5qb2luKFwiXFxuXCIpO1xyXG4gICAgbXNnKGBhbGwgdGV4dHM6YCk7XHJcbiAgICBtc2codGV4dCk7XHJcblxyXG4gICAgJGlucChcImFsbC10ZXh0c1wiKS52YWx1ZSA9IHRleHQ7XHJcblxyXG59XHJcblxyXG59IiwibmFtZXNwYWNlIGkxOG5fdHN7XG5cbmV4cG9ydCBsZXQgdm9pY2VMYW5ndWFnZUNvZGUgOiBzdHJpbmcgPSBcImVuZ1wiO1xuZXhwb3J0IGxldCBvblNwZWFrIDogKHRleHQgOiBzdHJpbmcpID0+IHZvaWQ7XG5cbmxldCBjYW5jZWxTcGVlY2hGbGFnIDogYm9vbGVhbiA9IGZhbHNlO1xuXG5jb25zdCB2b2ljZU1hcCA9IG5ldyBNYXA8c3RyaW5nLCBTcGVlY2hTeW50aGVzaXNWb2ljZVtdPigpO1xuXG5leHBvcnQgY29uc3QgbGFuZ0NvZGVMaXN0IDogW3N0cmluZywgc3RyaW5nXVtdID0gW1xuICAgIFtcImFyYVwiLCBcImFyLUVHXCJdLFxuICAgIFtcImNoaVwiLCBcInpoLUNOXCJdLFxuICAgIFtcImVuZ1wiLCBcImVuLVVTXCJdLFxuICAgIFtcImZyZVwiLCBcImZyLUZSXCJdLFxuICAgIFtcImdlclwiLCBcImRlLURFXCJdLFxuICAgIFtcImhpblwiLCBcImhpLUlOXCJdLFxuICAgIFtcImluZFwiLCBcImlkLUlEXCJdLFxuICAgIFtcImpwblwiLCBcImphLUpQXCJdLFxuICAgIFtcImtvclwiLCBcImtvLUtSXCJdLFxuICAgIFtcInJ1c1wiLCBcInJ1LVJVXCJdLFxuICAgIFtcInNwYVwiLCBcImVzLUVTXCJdLFxuICAgIFtcInBvclwiLCBcInB0LVBUXCJdLFxuXTtcblxuZXhwb3J0IGNvbnN0IGxhbmdDb2RlTWFwID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4obGFuZ0NvZGVMaXN0KTtcblxuY29uc3Qgdm9pY2VOYW1lc0RpYyA6IHsgW2xhbmc6IHN0cmluZ106IHN0cmluZ1tdIH0gPSB7XG4gICAgXCJqYS1KUFwiIDogW1xuICAgICAgICBcIk1pY3Jvc29mdCBOYW5hbWkgT25saW5lIChOYXR1cmFsKSAtIEphcGFuZXNlIChKYXBhbilcIixcbiAgICAgICAgXCJHb29nbGUg5pel5pys6KqeXCIsXG4gICAgICAgIFwiTWljcm9zb2Z0IEF5dW1pIC0gSmFwYW5lc2UgKEphcGFuKVwiXG4gICAgXVxuICAgICxcbiAgICBcImVuLVVTXCIgOiBbXG4gICAgICAgIFwiTWljcm9zb2Z0IEF2YSBPbmxpbmUgKE5hdHVyYWwpIC0gRW5nbGlzaCAoVW5pdGVkIFN0YXRlcylcIixcbiAgICAgICAgXCJHb29nbGUgVVMgRW5nbGlzaFwiLFxuICAgICAgICBcIk1pY3Jvc29mdCBaaXJhIC0gRW5nbGlzaCAoVW5pdGVkIFN0YXRlcylcIlxuICAgIF1cbn07XG5cbmxldCBsYW5ndWFnZVJlZ2lvbiA6IHN0cmluZztcblxuZXhwb3J0IGZ1bmN0aW9uIHNldFZvaWNlTGFuZ3VhZ2VDb2RlKGNvZGUgOiBzdHJpbmcpe1xuICAgIHZvaWNlTGFuZ3VhZ2VDb2RlID0gY29kZTtcbn1cblxuZnVuY3Rpb24gZ2V0Vm9pY2VCeUxhbmdDb2RlKGxhbmdfY29kZSA6IHN0cmluZykgOiBTcGVlY2hTeW50aGVzaXNWb2ljZSB8IHVuZGVmaW5lZCB7XG4gICAgbGFuZ3VhZ2VSZWdpb24gPSBsYW5nQ29kZU1hcC5nZXQobGFuZ19jb2RlKSE7XG4gICAgaWYobGFuZ3VhZ2VSZWdpb24gPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IoYHVua25vd24gbGFuZyBjb2RlOiR7bGFuZ19jb2RlfWApO1xuICAgIH1cblxuICAgIGNvbnN0IHZvaWNlcyA9IHZvaWNlTWFwLmdldChsYW5ndWFnZVJlZ2lvbik7XG4gICAgaWYodm9pY2VzID09IHVuZGVmaW5lZCl7XG4gICAgICAgIG1zZyhgbm8gdm9pY2UgZm9yICR7bGFuZ3VhZ2VSZWdpb259YCk7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY29uc3QgZGVmYXVsdF9uYW1lcyA9IHZvaWNlTmFtZXNEaWNbbGFuZ3VhZ2VSZWdpb25dO1xuICAgIGlmKGRlZmF1bHRfbmFtZXMgIT0gdW5kZWZpbmVkKXtcbiAgICAgICAgZm9yKGNvbnN0IG5hbWUgb2YgZGVmYXVsdF9uYW1lcyl7XG4gICAgICAgICAgICBjb25zdCB2b2ljZSA9IHZvaWNlcy5maW5kKHggPT4geC5uYW1lID09IG5hbWUpO1xuICAgICAgICAgICAgaWYodm9pY2UgIT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gdm9pY2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBuYXR1cmFsX3ZvaWNlID0gdm9pY2VzLmZpbmQoeCA9PiB4Lm5hbWUuaW5kZXhPZihcIk9ubGluZSAoTmF0dXJhbClcIikgIT0gLTEpO1xuICAgIGlmKG5hdHVyYWxfdm9pY2UgIT0gdW5kZWZpbmVkKXtcbiAgICAgICAgcmV0dXJuIG5hdHVyYWxfdm9pY2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZvaWNlc1swXTtcbn1cblxuZXhwb3J0IGNsYXNzIFNwZWVjaCBleHRlbmRzIGkxOG5fdHMuQWJzdHJhY3RTcGVlY2gge1xuICAgIHN0YXRpYyBtYXhJZCA9IDA7XG5cbiAgICBpZCAgICAgOiBudW1iZXI7XG4gICAgdm9pY2U/IDogU3BlZWNoU3ludGhlc2lzVm9pY2U7XG4gICAgdGV4dCEgICA6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKCl7IFxuICAgICAgICBzdXBlcigpO1xuICAgICAgICBcbiAgICAgICAgaTE4bl90cy5BYnN0cmFjdFNwZWVjaC5vbmUgPSB0aGlzO1xuICAgICAgICB0aGlzLmlkID0gU3BlZWNoLm1heElkKys7XG5cbiAgICAgICAgdGhpcy5pbml0Vm9pY2UoKTtcbiAgICB9XG5cbiAgICBpbml0Vm9pY2UoKXtcbiAgICAgICAgaWYodm9pY2VNYXAuc2l6ZSA9PSAwKXtcbiAgICAgICAgICAgIHNldFZvaWNlTGlzdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYodGhpcy52b2ljZSA9PSB1bmRlZmluZWQpe1xuXG4gICAgICAgICAgICB0aGlzLnZvaWNlID0gZ2V0Vm9pY2VCeUxhbmdDb2RlKHZvaWNlTGFuZ3VhZ2VDb2RlKTtcbiAgICAgICAgICAgIGlmKHRoaXMudm9pY2UgIT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgICAgICAvLyBtc2coYHVzZSB2b2ljZToke3RoaXMudm9pY2UubmFtZX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGVtdWxhdGUoc3BlZWNoX2lkIDogbnVtYmVyIHwgdW5kZWZpbmVkKXtcbiAgICAgICAgbGV0IGNoYXJJbmRleCA9IDA7XG5cbiAgICAgICAgY29uc3QgaWQgPSBzZXRJbnRlcnZhbCgoKT0+e1xuICAgICAgICAgICAgaWYodm9pY2VMYW5ndWFnZUNvZGUgPT0gXCJqcG5cIil7XG4gICAgICAgICAgICAgICAgY2hhckluZGV4Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuXG4gICAgICAgICAgICAgICAgY2hhckluZGV4ID0gdGhpcy50ZXh0LmluZGV4T2YoXCIgXCIsIGNoYXJJbmRleCk7XG4gICAgICAgICAgICAgICAgaWYoY2hhckluZGV4ID09IC0xKXtcbiAgICAgICAgICAgICAgICAgICAgY2hhckluZGV4ID0gdGhpcy50ZXh0Lmxlbmd0aDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgY2hhckluZGV4Kys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBldiA6IGFueSA9IHtcbiAgICAgICAgICAgICAgICBjaGFySW5kZXggOiBjaGFySW5kZXgsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLm9uQm91bmRhcnkoZXYgYXMgU3BlZWNoU3ludGhlc2lzRXZlbnQpO1xuXG4gICAgICAgICAgICBpZih0aGlzLnRleHQubGVuZ3RoIDw9IGNoYXJJbmRleCl7XG4gICAgICAgICAgICAgICAgdGhpcy5vbkVuZChldiBhcyBTcGVlY2hTeW50aGVzaXNFdmVudCk7XG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIDEpO1xuICAgIH1cblxuICAgIGFzeW5jIHNwZWFrKHRleHQgOiBzdHJpbmcpIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGNhbmNlbFNwZWVjaEZsYWcgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLnRleHQgPSB0ZXh0LnRyaW0oKTtcbiAgICAgICAgaWYodGhpcy50ZXh0ID09IFwiXCIpe1xuXG4gICAgICAgICAgICB0aGlzLnNwZWFraW5nID0gZmFsc2U7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNwZWFraW5nID0gdHJ1ZTtcblxuICAgICAgICBpZihvblNwZWFrICE9IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICBvblNwZWFrKHRoaXMudGV4dCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZihnZXRQbGF5TW9kZSgpID09IFBsYXlNb2RlLmZhc3RGb3J3YXJkKXtcblxuICAgICAgICAgICAgY29uc3Qgc3BlZWNoX2lkID0gaTE4bl90cy5nZXRJZEZyb21UZXh0KHRoaXMudGV4dCk7XG5cbiAgICAgICAgICAgIHRoaXMuZW11bGF0ZShzcGVlY2hfaWQpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbi8qICAgICAgICBcbiAgICAgICAgaWYoc3BlZWNoX2lkICE9IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICBjb25zdCBvayA9IGF3YWl0IHBsYXlBdWRpbyh0aGlzLCBzcGVlY2hfaWQpO1xuICAgICAgICAgICAgaWYob2spe1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuKi9cblxuICAgICAgICB0aGlzLmluaXRWb2ljZSgpO1xuICAgICAgICBtc2coYFNwZWFrICR7dGhpcy5pZH1bJHt0aGlzLnRleHR9XSAke3RoaXMudm9pY2UgIT0gdW5kZWZpbmVkID8gdGhpcy52b2ljZS5uYW1lIDogXCJubyB2b2ljZVwifWApO1xuXG4gICAgICAgIHRoaXMucHJldkNoYXJJbmRleCA9IDA7XG4gICAgXG4gICAgICAgIGNvbnN0IHV0dHIgPSBuZXcgU3BlZWNoU3ludGhlc2lzVXR0ZXJhbmNlKHRoaXMudGV4dC5yZXBsYWNlQWxsKFwi4peLXCIsIFwi44Oe44OrXCIpLnJlcGxhY2VBbGwoXCLDl1wiLCBcIuODkOODhFwiKSk7XG5cbiAgICAgICAgdXR0ci5hZGRFdmVudExpc3RlbmVyKFwiZW5kXCIsIHRoaXMub25FbmQuYmluZCh0aGlzKSk7XG4gICAgICAgIHV0dHIuYWRkRXZlbnRMaXN0ZW5lcihcImJvdW5kYXJ5XCIsIHRoaXMub25Cb3VuZGFyeS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdXR0ci5hZGRFdmVudExpc3RlbmVyKFwibWFya1wiLCB0aGlzLm9uTWFyay5iaW5kKHRoaXMpKTtcbiAgICBcbiAgICAgICAgLy91dHRyLnJhdGUgPSA1LjA7Ly8gcGFyc2VGbG9hdChzcGVlY2hSYXRlLnZhbHVlKTtcblxuICAgICAgICBpZih0aGlzLnZvaWNlICE9IHVuZGVmaW5lZCl7XG5cbiAgICAgICAgICAgIHV0dHIudm9pY2UgPSB0aGlzLnZvaWNlO1xuICAgICAgICB9XG5cbiAgICAgICAgc3BlZWNoU3ludGhlc2lzLnNwZWFrKHV0dHIpO1xuICAgIH1cblxuICAgIG9uQm91bmRhcnkoZXY6IFNwZWVjaFN5bnRoZXNpc0V2ZW50KSA6IHZvaWQge1xuICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy50ZXh0LnN1YnN0cmluZyh0aGlzLnByZXZDaGFySW5kZXgsIGV2LmNoYXJJbmRleCkudHJpbSgpO1xuICAgICAgICBpZihldi5jaGFySW5kZXggPT0gMCl7XG5cbiAgICAgICAgICAgIG1zZyhgU3BlZWNoIHN0YXJ0IHRleHQ6WyR7dGhpcy50ZXh0fV1gKVxuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG4gICAgXG4gICAgICAgICAgICAvLyBtc2coYFNwZWVjaCBiZHI6IGlkeDoke2V2LmNoYXJJbmRleH0gbmFtZToke2V2Lm5hbWV9IHR5cGU6JHtldi50eXBlfSB0ZXh0Olske3RleHR9XWApO1xuICAgICAgICB9XG4gICAgICAgIGlmKHRoaXMuY2FsbGJhY2sgIT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2soZXYuY2hhckluZGV4KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucHJldkNoYXJJbmRleCA9IGV2LmNoYXJJbmRleDtcbiAgICB9XG5cbiAgICBvbkVuZChldjogU3BlZWNoU3ludGhlc2lzRXZlbnQpIDogdm9pZCB7XG4gICAgICAgIC8vIG1zZyhgU3BlZWNoIGVuZDogaWQ6JHt0aGlzLmlkfSBpZHg6JHtldi5jaGFySW5kZXh9IG5hbWU6JHtldi5uYW1lfSB0eXBlOiR7ZXYudHlwZX0gdGV4dDpbJHt0aGlzLnRleHQuc3Vic3RyaW5nKHRoaXMucHJldkNoYXJJbmRleCl9XWApO1xuICAgICAgICBpZih0aGlzLmNhbGxiYWNrICE9IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrKHRoaXMudGV4dC5sZW5ndGgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc3BlYWtpbmcgPSBmYWxzZTtcbiAgICB9XG4gICAgXG4gICAgb25NYXJrKGV2OiBTcGVlY2hTeW50aGVzaXNFdmVudCkgOiB2b2lkIHtcbiAgICB9XG5cbiAgICBhc3luYyB3YWl0RW5kTkVXKCl7XG4gICAgICAgIGZvcihjb25zdCBpIG9mIHJhbmdlKDEwMCkpe1xuICAgICAgICAgICAgaWYoY2FuY2VsU3BlZWNoRmxhZyB8fCAhIHRoaXMuc3BlYWtpbmcpe1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXdhaXQgc2xlZXAoMTApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbXNnKGB3YWl0IGVuZDoke3RoaXMuaWR9YCk7XG4gICAgfVxuXG4gICAgd2FpdEVuZCgpIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgaWQgPSBzZXRJbnRlcnZhbCgoKT0+e1xuICAgICAgICAgICAgICAgIGlmKGNhbmNlbFNwZWVjaEZsYWcgfHwgISB0aGlzLnNwZWFraW5nKXtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpZCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIG1zZyhgd2FpdCBlbmQ6JHt0aGlzLmlkfWApO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgMTApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYyBzcGVha193YWl0RW5kKHRleHQgOiBzdHJpbmcpe1xuICAgICAgICBhd2FpdCB0aGlzLnNwZWFrKHRleHQpO1xuICAgICAgICBhd2FpdCB0aGlzLndhaXRFbmQoKTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm9udW5jaWF0aW9uKHdvcmQ6IHN0cmluZykgOiBzdHJpbmdbXXtcbiAgICBpZih3b3JkWzBdID09ICdcXFxcJyl7XG4gICAgICAgIGNvbnN0IHRibCA6IHtba2V5OnN0cmluZ106c3RyaW5nW119ID0ge1xuICAgICAgICAgICAgXCJkaWZcIiA6IFtcImRpZmZcIl0sXG4gICAgICAgICAgICBcIkRlbHRhXCIgOiBbXCJkZWx0YVwiXSxcbiAgICAgICAgICAgIFwibGltXCIgOiBbXCJsaW1pdFwiXSxcbiAgICAgICAgICAgIFwiZnJhY1wiIDogW1wiZnJhY3Rpb25cIl0sXG4gICAgICAgICAgICBcInNxcnRcIiA6IFwic3F1YXJlIHJvb3RcIi5zcGxpdChcIiBcIiksXG4gICAgICAgICAgICBcIm5lXCIgOiBcIm5vdCBlcXVhbHNcIi5zcGxpdChcIiBcIiksXG4gICAgICAgICAgICBcImx0XCIgOiBcImlzIGxlc3MgdGhhblwiLnNwbGl0KFwiIFwiKSxcbiAgICAgICAgICAgIFwiZ3RcIiA6IFwiaXMgZ3JlYXRlciB0aGFuXCIuc3BsaXQoXCIgXCIpLFxuICAgICAgICAgICAgXCJsZVwiIDogXCJpcyBsZXNzIHRoYW4gb3IgZXF1YWxzXCIuc3BsaXQoXCIgXCIpLFxuICAgICAgICAgICAgXCJnZVwiIDogXCJpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWxzXCIuc3BsaXQoXCIgXCIpLFxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IG5hbWUgPSB3b3JkLnN1YnN0cmluZygxKTtcbiAgICAgICAgaWYobmFtZSBpbiB0Ymwpe1xuICAgICAgICAgICAgcmV0dXJuIHRibFtuYW1lXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuICAgICAgICAgICAgcmV0dXJuIFtuYW1lXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gW3dvcmRdO1xufVxuXG5cbmZ1bmN0aW9uIHNldFZvaWNlTGlzdCgpe1xuICAgIGNvbnN0IHZvaWNlcyA9IEFycmF5LmZyb20oc3BlZWNoU3ludGhlc2lzLmdldFZvaWNlcygpKTtcbiAgICBpZih2b2ljZXMubGVuZ3RoID09IDApe1xuICAgICAgICBtc2coXCJubyB2b2ljZVwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZvcihjb25zdCB2b2ljZSBvZiB2b2ljZXMpe1xuICAgICAgICBpZih2b2ljZS5sYW5nID09IGxhbmd1YWdlUmVnaW9uKXtcblxuICAgICAgICAgICAgbXNnKGB2b2ljZSBsYW5nOlske3ZvaWNlLmxhbmd9XSBuYW1lOlske3ZvaWNlLm5hbWV9XWApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHZvaWNlX2xhbmcgPSB2b2ljZS5sYW5nLnJlcGxhY2VBbGwoXCJfXCIsIFwiLVwiKTtcbiAgICAgICAgY29uc3QgayA9IHZvaWNlX2xhbmcuaW5kZXhPZihcIi0jXCIpO1xuICAgICAgICBpZihrICE9IC0xKXtcbiAgICAgICAgICAgIHZvaWNlX2xhbmcgPSB2b2ljZV9sYW5nLnN1YnN0cmluZygwLCBrKTtcbiAgICAgICAgICAgIC8vIG1zZyhgbGFuZzoke3ZvaWNlLmxhbmd9ID0+ICR7dm9pY2VfbGFuZ31gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHZvaWNlTWFwLmdldCh2b2ljZV9sYW5nKSA9PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgdm9pY2VNYXAuc2V0KHZvaWNlX2xhbmcsIFtdKTtcblxuICAgICAgICAgICAgaWYoQXJyYXkuZnJvbSggbGFuZ0NvZGVNYXAudmFsdWVzKCkgKS5pbmNsdWRlcyh2b2ljZV9sYW5nKSl7XG5cbiAgICAgICAgICAgICAgICAvLyBtc2coYHZvaWNlIGxhbmc6JHt2b2ljZV9sYW5nfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdm9pY2VNYXAuZ2V0KHZvaWNlX2xhbmcpIS5wdXNoKHZvaWNlKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGluaXRTcGVlY2hTdWIoKXtcblxuICAgIGlmICgnc3BlZWNoU3ludGhlc2lzJyBpbiB3aW5kb3cpIHtcbiAgICAgICAgbXNnKFwi44GT44Gu44OW44Op44Km44K244Gv6Z+z5aOw5ZCI5oiQ44Gr5a++5b+c44GX44Gm44GE44G+44GZ44CC8J+OiVwiKTtcblxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgbXNnKFwi44GT44Gu44OW44Op44Km44K244Gv6Z+z5aOw5ZCI5oiQ44Gr5a++5b+c44GX44Gm44GE44G+44Gb44KT44CC8J+YrVwiKTtcbiAgICB9ICAgIFxufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5pdFNwZWVjaCgpe1xuICAgIGluaXRTcGVlY2hTdWIoKTtcblxuICAgIHNwZWVjaFN5bnRoZXNpcy5vbnZvaWNlc2NoYW5nZWQgPSBmdW5jdGlvbigpe1xuICAgICAgICBtc2coXCJ2b2ljZXMgY2hhbmdlZCAxXCIpO1xuICAgICAgICBzZXRWb2ljZUxpc3QoKTtcbiAgICB9O1xuXG4gICAgc3BlZWNoU3ludGhlc2lzLmFkZEV2ZW50TGlzdGVuZXIoXCJ2b2ljZXNjaGFuZ2VkXCIsIChldjpFdmVudCk9PntcbiAgICAgICAgc2V0Vm9pY2VMaXN0KCk7XG4gICAgICAgIG1zZyhcInZvaWNlcyBjaGFuZ2VkIDJcIik7XG4gICAgfSlcblxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYXN5bmNJbml0U3BlZWNoKCkgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpbml0U3BlZWNoU3ViKCk7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgc3BlZWNoU3ludGhlc2lzLmFkZEV2ZW50TGlzdGVuZXIoXCJ2b2ljZXNjaGFuZ2VkXCIsIChldjpFdmVudCk9PntcbiAgICAgICAgICAgIHNldFZvaWNlTGlzdCgpO1xuICAgICAgICAgICAgbXNnKFwic3BlZWNoIGluaXRpYWxpemVkXCIpO1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KVxuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsU3BlZWNoKCl7XG4gICAgY2FuY2VsU3BlZWNoRmxhZyA9IHRydWU7XG4gICAgc3BlZWNoU3ludGhlc2lzLmNhbmNlbCgpO1xufVxuXG4gICAgXG59IiwiXHJcbm5hbWVzcGFjZSBpMThuX3RzIHtcclxuLy9cclxuXHJcbmV4cG9ydCBlbnVtIFBsYXlNb2RlIHtcclxuICAgIHN0b3AsXHJcbiAgICBub3JtYWwsXHJcbiAgICBmYXN0Rm9yd2FyZCxcclxufVxyXG5cclxubGV0IHRoZVBsYXlNb2RlIDogUGxheU1vZGUgID0gUGxheU1vZGUuc3RvcDtcclxuXHJcbmNvbnN0ICRkaWMgPSBuZXcgTWFwPHN0cmluZywgSFRNTEVsZW1lbnQ+KCk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0UGxheU1vZGUocGxheV9tb2RlIDogUGxheU1vZGUpe1xyXG4gICAgdGhlUGxheU1vZGUgPSBwbGF5X21vZGU7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRQbGF5TW9kZSgpe1xyXG4gICAgcmV0dXJuIHRoZVBsYXlNb2RlO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gJChpZCA6IHN0cmluZykgOiBIVE1MRWxlbWVudCB7XHJcbiAgICBsZXQgZWxlID0gJGRpYy5nZXQoaWQpO1xyXG4gICAgaWYoZWxlID09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgZWxlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpITtcclxuICAgICAgICAkZGljLnNldChpZCwgZWxlKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZWxlO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gJGRpdihpZCA6IHN0cmluZykgOiBIVE1MRGl2RWxlbWVudCB7XHJcbiAgICByZXR1cm4gJChpZCkgYXMgSFRNTERpdkVsZW1lbnQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiAkaW5wKGlkIDogc3RyaW5nKSA6IEhUTUxJbnB1dEVsZW1lbnQge1xyXG4gICAgcmV0dXJuICQoaWQpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiAkc2VsKGlkIDogc3RyaW5nKSA6IEhUTUxTZWxlY3RFbGVtZW50IHtcclxuICAgIHJldHVybiAkKGlkKSBhcyBIVE1MU2VsZWN0RWxlbWVudDtcclxufVxyXG4gICAgICAgIFxyXG5leHBvcnQgY2xhc3MgTXlFcnJvciBleHRlbmRzIEVycm9yIHtcclxuICAgIGNvbnN0cnVjdG9yKHRleHQgOiBzdHJpbmcgPSBcIlwiKXtcclxuICAgICAgICBzdXBlcih0ZXh0KTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydChiIDogYm9vbGVhbiwgbXNnIDogc3RyaW5nID0gXCJcIil7XHJcbiAgICBpZighYil7XHJcbiAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IobXNnKTtcclxuICAgIH1cclxufSAgICBcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjaGVjayhiIDogYm9vbGVhbiwgbXNnIDogc3RyaW5nID0gXCJcIil7XHJcbiAgICBpZighYil7XHJcbiAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IobXNnKTtcclxuICAgIH1cclxufSAgICBcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBtc2codHh0IDogc3RyaW5nKXtcclxuICAgIGNvbnNvbGUubG9nKHR4dCk7XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzbGVlcChtaWxsaXNlY29uZHMgOiBudW1iZXIsIGZhc3Rfc2xlZXAgOiBudW1iZXIgPSAxKSA6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgaWYodGhlUGxheU1vZGUgPT0gUGxheU1vZGUuZmFzdEZvcndhcmQpe1xyXG4gICAgICAgIGFzc2VydChmYXN0X3NsZWVwID09IDEpO1xyXG4gICAgICAgIG1pbGxpc2Vjb25kcyA9IGZhc3Rfc2xlZXA7XHJcbiAgICB9XHJcbiAgICBpZigxIDwgbWlsbGlzZWNvbmRzKXtcclxuICAgICAgICAvLyBtc2coYHNsZWVwOlske21pbGxpc2Vjb25kc31dYCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKT0+e1xyXG4gICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgfSwgbWlsbGlzZWNvbmRzKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcmFuZ2UobjogbnVtYmVyKSA6IG51bWJlcltde1xyXG4gICAgcmV0dXJuIFsuLi5BcnJheShuKS5rZXlzKCldO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcmFuZ2UyKHN0YXJ0OiBudW1iZXIsIGVuZCA6IG51bWJlcikgOiBudW1iZXJbXXtcclxuICAgIHJldHVybiByYW5nZShlbmQgLSBzdGFydCkubWFwKHggPT4gc3RhcnQgKyB4KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGxhc3Q8VD4odiA6IEFycmF5PFQ+KSA6IFQge1xyXG4gICAgcmV0dXJuIHZbdi5sZW5ndGggLSAxXTtcclxufVxyXG5cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBhcnJheUZpbGw8VD4oc2l6ZSA6IG51bWJlciwgdmFsdWUgOiBUKSA6IFRbXSB7XHJcbiAgICByZXR1cm4gbmV3IEFycmF5PFQ+KHNpemUpLmZpbGwodmFsdWUpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdW5pcXVlPFQ+KHYgOiBBcnJheTxUPikgOiBUW10ge1xyXG4gICAgbGV0IHNldCA9IG5ldyBTZXQ8VD4oKTtcclxuICAgIGNvbnN0IHJldCA6IFRbXSA9IFtdO1xyXG4gICAgZm9yKGNvbnN0IHggb2Ygdil7XHJcbiAgICAgICAgaWYoIXNldC5oYXMoeCkpe1xyXG4gICAgICAgICAgICBzZXQuYWRkKHgpO1xyXG4gICAgICAgICAgICByZXQucHVzaCh4KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmV0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlPFQ+KHYgOiBBcnJheTxUPiwgeCA6IFQsIGV4aXN0ZW5jZV9jaGVjayA6IGJvb2xlYW4gPSB0cnVlKXtcclxuICAgIGNvbnN0IGlkeCA9IHYuaW5kZXhPZih4KTtcclxuICAgIGlmKGlkeCA9PSAtMSl7XHJcbiAgICAgICAgaWYoZXhpc3RlbmNlX2NoZWNrKXtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IE15RXJyb3IoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNle1xyXG4gICAgICAgIHYuc3BsaWNlKGlkeCwgMSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBhcHBlbmQ8VD4odiA6IEFycmF5PFQ+LCB4IDogVCl7XHJcbiAgICBpZighIHYuaW5jbHVkZXMoeCkpe1xyXG4gICAgICAgIHYucHVzaCh4KTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHN1bSh2IDogbnVtYmVyW10pIDogbnVtYmVyIHtcclxuICAgIHJldHVybiB2LnJlZHVjZSgoYWNjLCBjdXIpID0+IGFjYyArIGN1ciwgMCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBsaXN0PFQ+KHNldCA6IFNldDxUPiB8IHVuZGVmaW5lZCkgOiBUW10ge1xyXG4gICAgaWYoc2V0ID09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfVxyXG4gICAgZWxzZXtcclxuXHJcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20oc2V0KTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGludGVyc2VjdGlvbjxUPihzZXQxIDogU2V0PFQ+IHwgdW5kZWZpbmVkLCBzZXQyIDogU2V0PFQ+IHwgdW5kZWZpbmVkKSA6IFRbXSB7XHJcbiAgICBpZihzZXQxID09IHVuZGVmaW5lZCB8fCBzZXQyID09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBBcnJheS5mcm9tKHNldDEudmFsdWVzKCkpLmZpbHRlcih4ID0+IHNldDIuaGFzKHgpKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHBlcm11dGF0aW9uPFQ+KHYgOiBUW10pIDogVFtdW10ge1xyXG4gICAgaWYodi5sZW5ndGggPT0gMil7XHJcbiAgICAgICAgcmV0dXJuIFsgW3ZbMF0sIHZbMV1dLCBbdlsxXSwgdlswXV0gXTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2diA6IFRbXVtdID0gW107XHJcbiAgICBmb3IoY29uc3QgaSBvZiByYW5nZSh2Lmxlbmd0aCkpe1xyXG4gICAgICAgIGNvbnN0IHYxID0gdi5zbGljZSgpO1xyXG4gICAgICAgIGNvbnN0IGMgPSB2MVtpXTtcclxuICAgICAgICB2MS5zcGxpY2UoaSwgIDEpO1xyXG5cclxuICAgICAgICBjb25zdCB2djEgPSBwZXJtdXRhdGlvbih2MSk7XHJcbiAgICAgICAgZm9yKGNvbnN0IHYyIG9mIHZ2MSl7XHJcblxyXG4gICAgICAgICAgICB2Mi51bnNoaWZ0KGMpO1xyXG4gICAgICAgICAgICB2di5wdXNoKHYyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHZ2O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2lyY3VsYXJQZXJtdXRhdGlvbjxUPih2IDogVFtdKSA6IFRbXVtdIHtcclxuICAgIGNvbnN0IHZ2ID0gcGVybXV0YXRpb24odi5zbGljZSgxKSk7XHJcbiAgICB2di5mb3JFYWNoKHggPT4geC51bnNoaWZ0KHZbMF0pKTtcclxuXHJcbiAgICByZXR1cm4gdnY7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBhcmVTZXRzRXF1YWw8VD4oQTogVFtdLCBCOiBUW10pOiBib29sZWFuIHtcclxuICAgIGNvbnN0IHNldEEgPSBuZXcgU2V0PFQ+KEEpO1xyXG4gICAgY29uc3Qgc2V0QiA9IG5ldyBTZXQ8VD4oQik7XHJcblxyXG4gICAgLy8gQ2hlY2sgaWYgc2l6ZXMgYXJlIGRpZmZlcmVudFxyXG4gICAgaWYgKHNldEEuc2l6ZSAhPT0gc2V0Qi5zaXplKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENoZWNrIGlmIGFsbCBlbGVtZW50cyBvZiBzZXRBIGFyZSBwcmVzZW50IGluIHNldEJcclxuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBzZXRBKSB7XHJcbiAgICAgICAgaWYgKCFzZXRCLmhhcyhlbGVtZW50KSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNTdWJTZXQ8VD4oQTogVFtdLCBCOiBUW10pOiBib29sZWFuIHtcclxuICAgIGNvbnN0IHNldEIgPSBuZXcgU2V0PFQ+KEIpO1xyXG5cclxuICAgIHJldHVybiBBLmV2ZXJ5KHggPT4gc2V0Qi5oYXMoeCkpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNJZGVudGlmaWVyTGV0dGVyKGMgOiBzdHJpbmcpIDogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gbGF0aW5MZXR0ZXJzLmluZGV4T2YoYykgIT0gLTEgfHwgYyA9PSBcIl9cIjtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoVGV4dChmaWxlVVJMOiBzdHJpbmcpIHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goZmlsZVVSTCk7XHJcbiAgICBjb25zdCB0ZXh0ID0gYXdhaXQgcmVzcG9uc2UhLnRleHQoKTtcclxuXHJcbiAgICByZXR1cm4gdGV4dDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlVVJMKCk6IFtzdHJpbmcsIHN0cmluZywgTWFwPHN0cmluZywgc3RyaW5nPl0ge1xyXG4gICAgY29uc3QgdXJsID0gZG9jdW1lbnQubG9jYXRpb24uaHJlZjtcclxuICAgIGNvbnN0IHBhcnNlciA9IG5ldyBVUkwodXJsKTtcclxuICAgIC8vIGNvbnNvbGUubG9nKGBocmVmOiR7dXJsfSBvcmlnaW46JHtwYXJzZXIub3JpZ2lufSBwYXRobmFtZToke3BhcnNlci5wYXRobmFtZX0gc2VhcmNoOiR7cGFyc2VyLnNlYXJjaH1gKVxyXG4gICAgYXNzZXJ0KHBhcnNlci5vcmlnaW4gKyBwYXJzZXIucGF0aG5hbWUgKyBwYXJzZXIuc2VhcmNoID09IHVybCk7XHJcblxyXG4gICAgY29uc3QgcXVlcnlTdHJpbmcgPSBwYXJzZXIuc2VhcmNoLnN1YnN0cmluZygxKTtcclxuICAgIGNvbnN0IHF1ZXJpZXMgPSBxdWVyeVN0cmluZy5zcGxpdChcIiZcIik7XHJcblxyXG4gICAgY29uc3QgcGFyYW1zID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcclxuICAgIHF1ZXJpZXMuZm9yRWFjaChxdWVyeSA9PiB7XHJcbiAgICAgICAgY29uc3QgW2tleSwgdmFsdWVdID0gcXVlcnkuc3BsaXQoXCI9XCIpO1xyXG4gICAgICAgIHBhcmFtcy5zZXQoZGVjb2RlVVJJQ29tcG9uZW50KGtleSksIGRlY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIHJldHVybiBbIHBhcnNlci5vcmlnaW4sIHBhcnNlci5wYXRobmFtZSwgcGFyYW1zXTtcclxufVxyXG5cclxufVxyXG4iXX0=