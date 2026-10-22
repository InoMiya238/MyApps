// 中学英語道場: 中3「準動詞」「文の形」の6単元の中身(要点・表・例題・問題)。
// 形式の説明と、表示部品の関数(JHE.en、JHE.eibun など)は data.js の先頭を参照。
// 中3「動詞」「文の形」の6単元は data-g3.js にある。このファイルも data-g1.js と同じ形で書く。
//
// 内容のきまり:
// ・学校文法の説明に合わせる。教科書によって扱いが分かれる点には踏みこまない。
// ・英文はすべて自作。中学の語彙と文法の範囲で、アメリカ英語のつづりで書く。
// ・問いの文(text)は日本語の指示だけにして、英文は material に入れる。
// ・正解が1つに決まるように、まちがいの選択肢は「どの場面でも成り立たない形」にする。
//   疑問詞 + to や、who / that のどちらも入る空所は、日本語の文か選択肢の組み方で1つに決める。
// ・help + 人 + to 〜 も正しい英語なので、help の問題では to のついた形を選択肢に入れない。
// ・目的格の関係代名詞は which / that を使う。人が先行詞の目的格の空所に who を選択肢として入れない。
// ・仮定法の be動詞は、主語にかかわらず were にする(学校文法の扱い)。was を選択肢に入れない。
(function () {
  "use strict";
  if (typeof JHE === "undefined") return;

  // ---------- このファイルの中で使う短い名前 ----------
  var en = JHE.en, eibun = JHE.eibun, kaiwa = JHE.kaiwa, fill = JHE.fill, u = JHE.u, key = JHE.key;
  var henka = JHE.henka, seigo = JHE.seigo, hyo = JHE.hyo, gojun = JHE.gojun, rule = JHE.rule;
  var B = JHE.blank();
  // 英文の選択肢(1列で出す)
  function ens(list) { return list.map(function (s) { return en(s); }); }

  var Q_BLANK = "空所に入る語はどれですか。";
  var Q_BLANK_PHRASE = "空所に入る語句はどれですか。";
  var Q_BLANK_JA = "日本語の文に合うように、空所に入る語を選びなさい。";
  var Q_BLANK_JA_PHRASE = "日本語の文に合うように、空所に入る語句を選びなさい。";
  var Q_REPLY = "Aの質問に対する、Bの答えとして正しいものはどれですか。";
  var Q_WRONG = "誤りのある文はどれですか。";
  var Q_RIGHT = "正しい文はどれですか。";
  var Q_EN_TO_JA = "次の英文の意味として正しいものはどれですか。";
  var Q_COMBINE = "次の2つの文を、関係代名詞を使って1つの文にしたものはどれですか。";

  // =====================================================================
  // 3-7 It is 〜 to と疑問詞 + to
  // =====================================================================
  JHE.register("g3-infinitive-it-wh", {
    points: [
      "「…することは〜です」は、" + rule("It is 〜 to + 動詞の原形 ….") + " で表せます。" + en("It") + " は " + en("to") + " 以下を指していて、「それは」とは訳しません。" + en("It is fun to play tennis.") + "(テニスをすることは楽しいです。)",
      "「(人)にとって」を加えるときは、" + rule("for + 人") + " を " + en("to") + " の前に置きます。人が代名詞なら、" + en("for me") + "、" + en("for him") + " のように「〜を・〜に」の形にします。" + en("It is easy for me to swim.") + "(わたしにとって、泳ぐことは簡単です。)",
      "否定文・疑問文は、be動詞の文と同じように作ります。" + en("It isn't easy to 〜.") + "、" + en("Is it difficult for you to 〜?") + " には " + en("Yes, it is.") + " か " + en("No, it isn't.") + " で答えます。",
      rule("疑問詞 + to + 動詞の原形") + " は、ひとまとまりで名詞のはたらきをします。" + en("how to 〜") + "(〜のしかた)、" + en("what to 〜") + "(何を〜すればよいか)、" + en("where to 〜") + "(どこで・どこへ〜すればよいか)、" + en("when to 〜") + "(いつ〜すればよいか)、" + en("which + 名詞 + to 〜") + "(どの…を〜すればよいか)。",
      "疑問詞 + to は、" + en("know") + "、" + en("learn") + "、" + en("ask") + " などの目的語になります。" + en("tell / show / teach + 人 + how to 〜") + " の形もよく使います。" + en("Please tell me how to get to the station.") + "(駅への行き方を教えてください。)"
    ],
    chart: gojun([
      { role: "It", en: "It" },
      { role: "be動詞", en: "is" },
      { role: "形容詞", en: "easy", ja: "簡単だ" },
      { role: "for + 人", en: "for me", ja: "わたしにとって", key: true },
      { role: "to + 原形", en: "to swim.", ja: "泳ぐことは", key: true }
    ], "It is 〜 (for 人) to …") +
    hyo({
      caption: "疑問詞 + to 〜 の意味",
      head: ["", "疑問詞"],
      rows: [
        ["しかた", "how"],
        ["何を", "what"],
        ["どこへ", "where"],
        ["いつ", "when"],
        ["どれを", "which"]
      ]
    }),
    example: {
      title: "「わたしにとって、英語を話すことは難しいです。」を英語で表しなさい。",
      steps: [
        "「…することは〜です」なので、" + en("It is 〜 to ….") + " の形を使います。",
        "「難しい」は " + en("difficult") + "、「英語を話すこと」は " + en("to speak English") + " です。",
        "「わたしにとって」は " + en(key("for me")) + " で、" + en("to") + " の前に置きます。"
      ],
      result: en("It is difficult for me to speak English.")
    },
    fixed: [
      {
        id: "f1",
        text: Q_BLANK,
        material: eibun("It is important " + B + " study every day.", "毎日勉強することは大切です。"),
        choices: ["for", "to", "by", "at"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          "「…することは〜です」は " + en("It is 〜 " + key("to") + " + 動詞の原形.") + " で表します。",
          eibun("It is important " + fill("to") + " study every day."),
          en("for") + " は「(人)にとって」を表すときに人の前に置く語で、動詞の前には置けません。" + en("by") + " と " + en("at") + " も動詞の原形の前には置けません。"
        ]
      },
      {
        id: "f2",
        text: Q_BLANK,
        material: eibun("It is hard " + B + " me to get up early.", "わたしにとって、早く起きることはたいへんです。"),
        choices: ["for", "to", "in", "at"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "「(人)にとって」は、" + en(key("for") + " + 人") + " を " + en("to") + " の前に置いて表します。",
          eibun("It is hard " + fill("for") + " me to get up early."),
          en("to me") + "、" + en("in me") + "、" + en("at me") + " は、この形では使いません。"
        ]
      },
      {
        id: "f3",
        text: Q_BLANK,
        material: eibun(B + " is easy to make this cake.", "このケーキを作るのは簡単です。"),
        choices: ["There", "Its", "It", "They"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          en("to make this cake") + "(このケーキを作ること)を指して、文の最初に " + en(key("It")) + " を置きます。",
          en("There is") + " は「〜がある」という文で、このあとに形容詞と " + en("to") + " は続きません。",
          en("Its") + " は「それの」という意味で、主語にはなりません。" + en("They") + " は複数を指すので、" + en("is") + " とも合いません。"
        ]
      },
      {
        id: "f4",
        text: "( )内の語を正しい形にしたものはどれですか。",
        material: eibun("It is fun (play) the guitar with my friends.", "友だちとギターをひくことは楽しいです。"),
        choices: ["play", "played", "to play", "plays"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          en("It is fun") + " のあとに「…すること」を続けるので、" + en(key("to") + " + 動詞の原形") + " にします。",
          eibun("It is fun " + fill("to play") + " the guitar with my friends."),
          "原形・過去形・" + en("s") + " のついた形は、" + en("is") + " のあとにそのまま続けられません。"
        ]
      },
      {
        id: "f5",
        text: "「わたしにとって、この本を読むことは難しいです。」を、正しい語順で表した文はどれですか。",
        choices: ens([
          "It is difficult to me for read this book.",
          "It is for me difficult to read this book.",
          "It is difficult to read for me this book.",
          "It is difficult for me to read this book."
        ]),
        answer: 3,
        explain: [
          "「" + en("It is") + " + 形容詞 + " + en("for") + " + 人 + " + en("to") + " + 動詞の原形」の順に並べます。",
          gojun([
            { role: "It is", en: "It is" },
            { role: "形容詞", en: "difficult" },
            { role: "for + 人", en: "for me", key: true },
            { role: "to + 原形", en: "to read", key: true },
            { role: "そのほか", en: "this book." }
          ]),
          en("for me") + " を形容詞の前に置いたり、" + en("to read") + " と " + en("this book") + " のあいだに入れたりするのは誤りです。"
        ]
      },
      {
        id: "f6",
        text: Q_EN_TO_JA,
        material: eibun("It is interesting for us to learn about other countries."),
        choices: [
          "ほかの国は、わたしたちにとっておもしろい国です。",
          "わたしたちにとって、ほかの国について学ぶことはおもしろいです。",
          "わたしたちは、ほかの国について学ぶことがおもしろくありません。",
          "ほかの国の人たちは、わたしたちについて学びたがっています。"
        ],
        answer: 1,
        explain: [
          en("It") + " は " + en("to learn about other countries") + "(ほかの国について学ぶこと)を指しています。",
          en("for us") + " は「わたしたちにとって」という意味です。",
          "否定の語(" + en("not") + ")はないので、「おもしろくありません」は誤りです。主語は「ほかの国」ではなく「学ぶこと」です。"
        ]
      },
      {
        id: "f7",
        text: Q_REPLY,
        material: kaiwa([
          ["A", "Is it difficult for you to cook?", "あなたにとって、料理をすることは難しいですか。"],
          ["B", B]
        ]),
        choices: ens([
          "Yes, it is.",
          "Yes, I do.",
          "No, I can't.",
          "Yes, it does."
        ]),
        answer: 0,
        explain: [
          en("Is it 〜?") + " とたずねているので、" + en("it") + " と be動詞を使って " + en(key("Yes, it is.")) + " と答えます。",
          en("Yes, I do.") + " は " + en("Do you 〜?") + "、" + en("No, I can't.") + " は " + en("Can you 〜?") + " への答え方です。",
          en("does") + " は一般動詞の疑問文で使う語なので、be動詞の質問の答えには使いません。"
        ]
      },
      {
        id: "f8",
        text: Q_WRONG,
        choices: ens([
          "It is easy for him to swim.",
          "It was exciting to watch the game.",
          "It is fun for me play tennis.",
          "Is it difficult to write kanji?"
        ]),
        answer: 2,
        explain: [
          en("It is 〜") + " のあとの「…すること」は、" + en("to") + " + 動詞の原形で表します。",
          seigo("It is fun for me play tennis.", "It is fun for me " + key("to play") + " tennis."),
          "ほかの3つは、" + en("It is (was) 〜 (for 人) to …") + " の形や、その疑問文になっていて正しい文です。"
        ]
      },
      {
        id: "f9",
        text: Q_BLANK_JA,
        material: eibun("I don't know " + B + " to use this computer.", "わたしはこのコンピューターの使い方がわかりません。"),
        choices: ["what", "where", "when", "how"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          "「〜のしかた」は " + en(key("how") + " to 〜") + " で表します。",
          eibun("I don't know " + fill("how") + " to use this computer."),
          en("where to use") + " は「どこで使えばよいか」、" + en("when to use") + " は「いつ使えばよいか」で、日本語の文と合いません。" + en("what to use") + " は「何を使えばよいか」で、" + en("this computer") + " と続けられません。"
        ]
      },
      {
        id: "f10",
        text: Q_BLANK_JA,
        material: eibun("Please tell me " + B + " to go.", "どこへ行けばよいか教えてください。"),
        choices: ["what", "where", "which", "who"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          "「どこへ〜すればよいか」は " + en(key("where") + " to 〜") + " で表します。",
          eibun("Please tell me " + fill("where") + " to go."),
          en("what to go") + "、" + en("which to go") + "、" + en("who to go") + " という言い方はしません。"
        ]
      },
      {
        id: "f11",
        text: Q_BLANK_JA,
        material: eibun("I didn't know " + B + " to say.", "わたしは何と言えばよいかわかりませんでした。"),
        choices: ["what", "who", "when", "where"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "「何を〜すればよいか」は " + en(key("what") + " to 〜") + " で表します。「何と言えばよいか」は " + en("what to say") + " です。",
          eibun("I didn't know " + fill("what") + " to say."),
          en("when to say") + " は「いつ言えばよいか」、" + en("where to say") + " は「どこで言えばよいか」で、日本語の文と合いません。" + en("who to say") + " という言い方はしません。"
        ]
      },
      {
        id: "f12",
        text: "「いつ出発すればよいか、彼にたずねましょう。」を表す文はどれですか。",
        choices: ens([
          "Let's ask him when start.",
          "Let's ask when him to start.",
          "Let's ask him when to start.",
          "Let's ask him to when start."
        ]),
        answer: 2,
        explain: [
          "「いつ〜すればよいか」は " + en("when to + 動詞の原形") + " です。" + en("ask + 人 + when to 〜") + " の順に並べます。",
          gojun([
            { role: "Let's ask", en: "Let's ask" },
            { role: "人", en: "him" },
            { role: "疑問詞 + to", en: "when to", key: true },
            { role: "原形", en: "start." }
          ]),
          en("to") + " がないもの、" + en("when") + " と " + en("to") + " が離れているもの、順番が逆のものは誤りです。"
        ]
      },
      {
        id: "f13",
        text: "次の文を、" + en("It") + " で始まる文に書きかえたものはどれですか。",
        material: eibun("To swim in this river is dangerous.", "この川で泳ぐことは危険です。"),
        choices: ens([
          "It is dangerous swim in this river.",
          "It is dangerous to swim in this river.",
          "It is to swim in this river dangerous.",
          "That is dangerous to swim in this river."
        ]),
        answer: 1,
        explain: [
          "主語の " + en("To swim in this river") + " を文の後ろに回し、文の最初に " + en(key("It")) + " を置きます。",
          eibun(key("It") + " is dangerous " + key("to swim") + " in this river."),
          en("to") + " を落としたもの、形容詞の位置がちがうもの、" + en("It") + " の代わりに " + en("That") + " を使ったものは誤りです。"
        ]
      },
      {
        id: "f14",
        text: Q_EN_TO_JA,
        material: eibun("I can't decide which bag to buy."),
        choices: [
          "どちらのかばんを買ったか、思い出せません。",
          "かばんを買うことに決めました。",
          "どちらのかばんも買うことができません。",
          "どちらのかばんを買えばよいか、決められません。"
        ],
        answer: 3,
        explain: [
          en("which + 名詞 + to 〜") + " は「どの(どちらの)…を〜すればよいか」という意味です。" + en("which bag to buy") + " は「どちらのかばんを買えばよいか」です。",
          en("decide") + " は「決める」、" + en("can't decide") + " は「決められない」です。",
          "「買った」(過去のこと)や「買うことに決めました」は、もとの英文にない意味です。"
        ]
      },
      {
        id: "f15",
        text: Q_REPLY,
        material: kaiwa([
          ["A", "Do you know how to make curry?", "カレーの作り方を知っていますか。"],
          ["B", B]
        ]),
        choices: ens([
          "Yes, it is. It's easy.",
          "No, I'm not.",
          "Yes, I do. My mother taught me.",
          "Yes, I can't."
        ]),
        answer: 2,
        explain: [
          en("Do you know 〜?") + " とたずねているので、" + en(key("Yes, I do.")) + " で答えます。続けて「母が教えてくれました」と説明しています。",
          en("Yes, it is.") + " は " + en("Is it 〜?") + "、" + en("No, I'm not.") + " は " + en("Are you 〜?") + " への答え方です。",
          en("Yes") + " と " + en("can't") + " を組み合わせた答え方はしません。"
        ]
      }
    ]
  });

  // =====================================================================
  // 3-8 want 人 to と原形不定詞
  // =====================================================================
  JHE.register("g3-infinitive-object", {
    points: [
      "「(人)に〜してほしい」は、" + rule("want + 人 + to + 動詞の原形") + " で表します。人が代名詞なら、" + en("me") + "、" + en("him") + "、" + en("her") + " のように「〜を・〜に」の形にします。" + en("I want you to come to my party.") + "(あなたにパーティーに来てほしいです。)",
      "同じ形で、" + rule("tell + 人 + to 〜") + "(〜するように言う)、" + rule("ask + 人 + to 〜") + "(〜するように頼む)も表せます。" + en("want") + " のていねいな言い方は " + en("would like + 人 + to 〜") + " です。",
      en("to") + " の前の「人」が、" + en("to") + " のあとの動作をする人です。" + en("I want to sing.") + " は自分が歌い、" + en("I want her to sing.") + " は彼女が歌います。",
      rule("let / help / make + 人 + 動詞の原形") + " は、" + en("to") + " をつけずに動詞の原形を続けます。" + en("let") + " は「(人)に〜させてやる」、" + en("help") + " は「(人)が〜するのを手伝う」、" + en("make") + " は「(人)に〜させる」という意味です。" + en("help") + " は " + en("help + 人 + to 〜") + " の形も使いますが、ここでは原形を続ける形で覚えます。",
      en("Let me 〜.") + " は「わたしに〜させてください」という意味で、自分がしたいことを申し出るときに使います。" + seigo("Let me to see your pictures.", "Let me " + key("see") + " your pictures.")
    ],
    chart: gojun([
      { role: "主語", en: "I" },
      { role: "動詞", en: "want", ja: "ほしい", key: true },
      { role: "人", en: "you", ja: "あなたに" },
      { role: "to + 原形", en: "to help", ja: "手伝って", key: true },
      { role: "そのほか", en: "me.", ja: "わたしを" }
    ], "want / tell / ask + 人 + to 〜") +
    hyo({
      caption: "動詞 + 人 + 〜 の形",
      head: ["", "動詞", "人", "続く形"],
      rows: [
        ["ほしい", "want", "you", "to 〜"],
        ["言う", "tell", "him", "to 〜"],
        ["頼む", "ask", "her", "to 〜"],
        ["許す", "let", "me", { ja: "原形" }],
        ["手伝う", "help", "us", { ja: "原形" }],
        ["させる", "make", "them", { ja: "原形" }]
      ],
      compact: true
    }),
    example: {
      title: "「母はわたしに、部屋をそうじするように言いました。」を英語で表しなさい。",
      steps: [
        "「(人)に〜するように言う」は、" + en("tell + 人 + to + 動詞の原形") + " です。過去の文なので " + en("told") + " にします。",
        "「わたしに」は、動詞のあとなので " + en(key("me")) + " にします。",
        "「部屋をそうじする」は " + en("to clean my room") + " です。"
      ],
      result: en("My mother told me to clean my room.")
    },
    fixed: [
      {
        id: "f1",
        text: Q_BLANK,
        material: eibun("I want " + B + " to come to my party.", "わたしはあなたに、パーティーに来てほしいです。"),
        choices: ["you", "your", "yours", "you're"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "「(人)に〜してほしい」は " + en("want + 人 + to 〜") + " です。「人」の場所には、「〜を・〜に」の形の " + en(key("you")) + " を置きます。",
          en("your") + " は「あなたの」、" + en("yours") + " は「あなたのもの」、" + en("you're") + " は " + en("you are") + " を短くした形で、ここには入りません。"
        ]
      },
      {
        id: "f2",
        text: Q_BLANK,
        material: eibun("My father told " + B + " to study hard.", "父はわたしに、一生けんめい勉強するように言いました。"),
        choices: ["I", "my", "me", "mine"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          en("tell + 人 + to 〜") + " の「人」には、「〜を・〜に」の形を使います。" + en("I") + " なら " + en(key("me")) + " です。",
          eibun("My father told " + fill("me") + " to study hard."),
          en("I") + " は主語の形、" + en("my") + " は「わたしの」、" + en("mine") + " は「わたしのもの」です。"
        ]
      },
      {
        id: "f3",
        text: Q_BLANK_PHRASE,
        material: eibun("Ken asked me " + B + " him with his homework.", "ケンはわたしに、宿題を手伝ってくれるように頼みました。"),
        choices: ["help", "helped", "helping", "to help"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          "「(人)に〜するように頼む」は、" + en("ask + 人 + " + key("to") + " + 動詞の原形") + " です。",
          eibun("Ken asked me " + fill("to help") + " him with his homework."),
          en("ask") + " は " + en("let") + " や " + en("make") + " とちがい、" + en("to") + " のない原形を続けられません。過去形や " + en("ing") + " 形も入りません。"
        ]
      },
      {
        id: "f4",
        text: Q_BLANK_PHRASE,
        material: eibun("Please let me " + B + " your pictures.", "あなたの写真をわたしに見せてください。"),
        choices: ["to see", "see", "seeing", "saw"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          en("let + 人 + 動詞の原形") + " で「(人)に〜させてやる」という意味です。" + en("to") + " はつけません。",
          eibun("Please let me " + fill("see") + " your pictures.", "どうか、わたしにあなたの写真を見させてください。"),
          en("to see") + " は " + en("let") + " のあとでは使いません。" + en("seeing") + " と過去形の " + en("saw") + " も入りません。"
        ]
      },
      {
        id: "f5",
        text: Q_BLANK,
        material: eibun("I helped my mother " + B + " dinner.", "わたしは母が夕食を作るのを手伝いました。"),
        choices: ["cooked", "cooks", "cook", "cooking"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          en("help + 人 + 動詞の原形") + " で「(人)が〜するのを手伝う」という意味です。",
          eibun("I helped my mother " + fill("cook") + " dinner."),
          en("helped") + " が過去形でも、あとの動詞は原形のままです。" + en("cooked") + "、" + en("cooks") + "、" + en("cooking") + " は入りません。"
        ]
      },
      {
        id: "f6",
        text: Q_BLANK_PHRASE,
        material: eibun("The movie made me " + B + ".", "その映画はわたしを泣かせました。"),
        choices: ["cry", "to cry", "cried", "crying"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("make + 人 + 動詞の原形") + " で「(人)に〜させる」という意味です。",
          eibun("The movie made me " + fill("cry") + "."),
          en("make") + " のこの形では " + en("to") + " をつけません。過去形や " + en("ing") + " 形も入りません。"
        ]
      },
      {
        id: "f7",
        text: Q_BLANK,
        material: eibun("Our teacher " + B + " us to read many books.", "先生はわたしたちに、たくさんの本を読むように言いました。"),
        choices: ["said", "told", "let", "made"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          "「(人)に〜するように言う」は " + en(key("tell") + " + 人 + to 〜") + " です。過去形は " + en("told") + " です。",
          en("say") + "(" + en("said") + ")は、すぐあとに「人 + " + en("to") + " 〜」を続けられません。",
          en("let") + " と " + en("made") + " のあとは、" + en("to") + " のない動詞の原形になるので、" + en("to read") + " とは合いません。"
        ]
      },
      {
        id: "f8",
        text: "「わたしは彼女に、その歌を歌ってほしいです。」を表す文はどれですか。",
        choices: ens([
          "I want to sing her the song.",
          "I want she to sing the song.",
          "I want her sing the song.",
          "I want her to sing the song."
        ]),
        answer: 3,
        explain: [
          "「(人)に〜してほしい」は " + en("want + 人 + to 〜") + " です。歌うのは彼女なので、" + en("want") + " のすぐあとに " + en(key("her")) + " を置きます。",
          gojun([
            { role: "主語", en: "I" },
            { role: "want", en: "want" },
            { role: "人", en: "her", key: true },
            { role: "to + 原形", en: "to sing", key: true },
            { role: "そのほか", en: "the song." }
          ]),
          en("I want to sing 〜") + " は、自分が歌いたいという意味になります。" + en("she") + " は主語の形なので使えません。" + en("want") + " のときは " + en("to") + " を落とせません。"
        ]
      },
      {
        id: "f9",
        text: Q_EN_TO_JA,
        material: eibun("My mother didn't let me watch TV last night."),
        choices: [
          "母は昨夜、テレビを見ませんでした。",
          "母は昨夜、わたしにテレビを見させてくれませんでした。",
          "母は昨夜、わたしにテレビを見るように言いませんでした。",
          "わたしは昨夜、母にテレビを見せませんでした。"
        ],
        answer: 1,
        explain: [
          en("let + 人 + 動詞の原形") + " は「(人)に〜させてやる」という意味です。" + en("didn't let me watch TV") + " で「わたしにテレビを見させてくれなかった」です。",
          "テレビを見る(見ない)のは、母ではなく " + en("me") + "(わたし)です。",
          "「〜するように言う」は " + en("tell + 人 + to 〜") + " で表すので、" + en("let") + " の意味とはちがいます。"
        ]
      },
      {
        id: "f10",
        text: Q_WRONG,
        choices: ens([
          "I want you to listen to me.",
          "She asked me to open the door.",
          "He made me wait for an hour.",
          "Let me to introduce my friend."
        ]),
        answer: 3,
        explain: [
          en("let + 人") + " のあとは、" + en("to") + " のない動詞の原形にします。",
          seigo("Let me to introduce my friend.", "Let me " + key("introduce") + " my friend."),
          "ほかの3つは、" + en("want / ask + 人 + to 〜") + "、" + en("make + 人 + 動詞の原形") + " の形になっていて正しい文です。"
        ]
      },
      {
        id: "f11",
        text: "次の文とほぼ同じ意味を表す文はどれですか。",
        material: eibun("I said to Ken, \"Please help me.\"", "わたしはケンに「わたしを手伝ってください」と言いました。"),
        choices: ens([
          "I asked Ken to help me.",
          "I asked Ken help me.",
          "Ken asked me to help him.",
          "I asked to Ken help me."
        ]),
        answer: 0,
        explain: [
          "「〜してください」と頼んでいるので、" + en("ask + 人 + to 〜") + "(〜するように頼む)で書きかえます。",
          eibun("I " + key("asked") + " Ken " + key("to help") + " me."),
          en("Ken asked me 〜") + " は、頼んだ人と頼まれた人が逆になります。" + en("to") + " がないもの、" + en("to") + " の位置がちがうものは誤りです。"
        ]
      },
      {
        id: "f12",
        text: "「この箱を運ぶのを手伝ってくれませんか。」を、正しい語順で表した文はどれですか。",
        choices: ens([
          "Will you help carry me this box?",
          "Will you help me carry this box?",
          "Will you me help carry this box?",
          "Will you help me this box carry?"
        ]),
        answer: 1,
        explain: [
          "「(人)が〜するのを手伝う」は " + en("help + 人 + 動詞の原形") + " です。「〜してくれませんか」は " + en("Will you 〜?") + " で表します。",
          gojun([
            { role: "Will you", en: "Will you" },
            { role: "help", en: "help" },
            { role: "人", en: "me", key: true },
            { role: "原形", en: "carry", key: true },
            { role: "そのほか", en: "this box?" }
          ]),
          "「人」は " + en("help") + " のすぐあと、動詞の原形はそのあとに置きます。"
        ]
      },
      {
        id: "f13",
        text: Q_REPLY,
        material: kaiwa([
          ["A", "What do you want me to do?", "わたしに何をしてほしいですか。"],
          ["B", B]
        ]),
        choices: ens([
          "Yes, I do.",
          "I want to you wash the dishes.",
          "I want you to wash the dishes.",
          "You want me wash the dishes."
        ]),
        answer: 2,
        explain: [
          "Aは「わたしに何をしてほしいか」をたずねています。" + en("want + 人 + to 〜") + " で、してほしいことを答えます。",
          eibun("I want " + key("you") + " " + key("to wash") + " the dishes.", "あなたに皿を洗ってほしいです。"),
          "疑問詞の疑問文には " + en("Yes / No") + " で答えません。" + en("to you") + " の順はまちがいで、" + en("want") + " のときは " + en("to") + " を落とせません。"
        ]
      },
      {
        id: "f14",
        text: Q_EN_TO_JA,
        material: eibun("Yuki asked her brother to close the window."),
        choices: [
          "ユキはお兄さんに、窓を閉めてくれるように頼みました。",
          "ユキはお兄さんに、窓を閉めるように頼まれました。",
          "ユキはお兄さんに、窓を閉めたかどうかたずねました。",
          "ユキのお兄さんは、窓を閉めたいと思いました。"
        ],
        answer: 0,
        explain: [
          en("ask + 人 + to 〜") + " は「(人)に〜するように頼む」という意味です。",
          "頼んだのは主語の " + en("Yuki") + "、窓を閉めるのは " + en("her brother") + "(お兄さん)です。",
          "「頼まれました」は、頼む人と頼まれる人が逆です。「たずねました」「閉めたいと思いました」は、もとの英文にない意味です。"
        ]
      },
      {
        id: "f15",
        text: Q_BLANK,
        material: eibun("Please " + B + " me know your phone number.", "あなたの電話番号をわたしに知らせてください。"),
        choices: ["tell", "want", "let", "ask"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          en("let + 人 + 動詞の原形") + " で「(人)に〜させてやる」です。" + en(key("let") + " me know") + " で「わたしに知らせる(わたしが知るようにする)」という意味になります。",
          eibun("Please " + fill("let") + " me know your phone number."),
          en("tell") + "、" + en("want") + "、" + en("ask") + " のあとに「人」を置くときは、" + en("to") + " のない原形の " + en("know") + " を続けられません。"
        ]
      }
    ]
  });

  // =====================================================================
  // 3-9 名詞を修飾する分詞
  // =====================================================================
  JHE.register("g3-participles", {
    points: [
      "動詞の " + en("ing") + " 形(現在分詞)と過去分詞は、名詞を説明するはたらきをします。" + rule("現在分詞は「〜している」") + "、" + rule("過去分詞は「〜された・〜される」") + " という意味です。",
      "分詞が" + rule("1語だけなら、名詞の前") + " に置きます。" + en("a sleeping cat") + "(眠っているねこ)、" + en("a broken window") + "(割れた窓)。",
      "分詞にほかの語句がついて" + rule("2語以上になるときは、名詞のあと") + " に置きます。" + en("the boy playing tennis") + "(テニスをしている男の子)、" + en("a car made in Japan") + "(日本で作られた車)。",
      "名詞が「する」側なら現在分詞、「される」側なら過去分詞を使います。" + en("a girl " + key("reading") + " a book") + "(女の子が本を読んでいる)、" + en("a book " + key("written") + " in English") + "(本が英語で書かれている)。",
      "分詞のついた名詞は、ひとまとまりで主語にも目的語にもなります。主語のときは、文の動詞がまとまりの後ろにくるので注意します。" + en("The girl singing on the stage " + key("is") + " my sister.") + "(ステージで歌っている女の子は、わたしの姉です。)"
    ],
    chart: gojun([
      { role: "冠詞", en: "a" },
      { role: "分詞(1語)", en: "crying", ja: "泣いている", key: true },
      { role: "名詞", en: "baby", ja: "赤ちゃん" }
    ], "1語のとき: 名詞の前") +
    gojun([
      { role: "名詞", en: "the boy", ja: "男の子" },
      { role: "現在分詞 + 語句", en: "playing tennis", ja: "テニスをしている", key: true }
    ], "2語以上のとき: 名詞のあと(〜している)") +
    gojun([
      { role: "名詞", en: "a car", ja: "車" },
      { role: "過去分詞 + 語句", en: "made in Japan", ja: "日本で作られた", key: true }
    ], "2語以上のとき: 名詞のあと(〜された)"),
    example: {
      title: "「あそこで本を読んでいる女の子はユキです。」を英語で表しなさい。",
      steps: [
        "女の子は本を「読んでいる」側なので、現在分詞 " + en("reading") + " を使います。",
        en("reading a book over there") + " は2語以上なので、名詞 " + en("the girl") + " のあとに置きます。",
        en(key("The girl reading a book over there")) + " までが主語です。そのあとに " + en("is Yuki") + " を続けます。"
      ],
      result: en("The girl reading a book over there is Yuki.")
    },
    fixed: [
      {
        id: "f1",
        text: "( )内の語を正しい形にしたものはどれですか。",
        material: eibun("Look at that (cry) baby.", "あの泣いている赤ちゃんを見て。"),
        choices: ["cry", "cried", "crying", "cries"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          "赤ちゃんは「泣いている」側なので、現在分詞にします。" + henka("cry", "crying"),
          "1語だけなので、名詞 " + en("baby") + " の前に置きます。",
          eibun("Look at that " + fill("crying") + " baby.")
        ]
      },
      {
        id: "f2",
        text: "( )内の語を正しい形にしたものはどれですか。",
        material: eibun("This is a picture (draw) by my sister.", "これは姉がかいた絵です。"),
        choices: ["draw", "drew", "drawing", "drawn"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          "絵は「かかれた」側なので、過去分詞にします。" + henka("draw", "drawn"),
          eibun("This is a picture " + fill("drawn") + " by my sister.", "これは姉によってかかれた絵です。"),
          en("drew") + " は過去形で、名詞を説明する形には使いません。" + en("drawing") + " は「(絵が)かいている」ことになり、意味が合いません。"
        ]
      },
      {
        id: "f3",
        text: Q_BLANK,
        material: eibun("The boy " + B + " soccer over there is my brother.", "あそこでサッカーをしている男の子は、わたしの弟です。"),
        choices: ["playing", "plays", "played", "play"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "男の子は「サッカーをしている」側なので、現在分詞 " + en(key("playing")) + " を使います。",
          en("playing soccer over there") + " が " + en("The boy") + " を後ろから説明し、文の動詞は " + en("is") + " です。",
          en("plays") + "、" + en("played") + "、" + en("play") + " を入れると、文の中に動詞が2つになってしまいます。"
        ]
      },
      {
        id: "f4",
        text: Q_BLANK,
        material: eibun("English is a language " + B + " in many countries.", "英語は多くの国で話されている言語です。"),
        choices: ["speak", "spoken", "spoke", "speaking"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          "言語は「話される」側なので、過去分詞 " + en(key("spoken")) + " を使います。" + henka("speak", "spoken"),
          eibun("English is a language " + fill("spoken") + " in many countries."),
          en("speaking") + " では言語が「話している」ことになります。" + en("spoke") + " は過去形、" + en("speak") + " は原形で、名詞を説明できません。"
        ]
      },
      {
        id: "f5",
        text: "「わたしはオーストラリアで撮った写真を何枚か持っています。」を、正しい語順で表した文はどれですか。",
        choices: ens([
          "I have some taken pictures in Australia.",
          "I have some pictures taking in Australia.",
          "I have some pictures taken in Australia.",
          "I have some taken in Australia pictures."
        ]),
        answer: 2,
        explain: [
          "写真は「撮られた」側なので過去分詞 " + en("taken") + " を使います。",
          en("taken in Australia") + " は2語以上なので、名詞 " + en("pictures") + " のあとに置きます。",
          gojun([
            { role: "名詞", en: "some pictures" },
            { role: "過去分詞 + 語句", en: "taken in Australia", ja: "オーストラリアで撮られた", key: true }
          ])
        ]
      },
      {
        id: "f6",
        text: "「その割れた窓を見なさい。」を表す文はどれですか。",
        choices: ens([
          "Look at the broken window.",
          "Look at broken the window.",
          "Look at the window broke.",
          "Look at the broke window."
        ]),
        answer: 0,
        explain: [
          "窓は「割られた」側なので、" + en("break") + " の過去分詞 " + en("broken") + " を使います。" + henka("break", "broken"),
          "1語だけなので、名詞の前に置きます。" + en("the") + " のあと、名詞 " + en("window") + " のすぐ前です。",
          en("broke") + " は過去形で、名詞を説明する形には使いません。"
        ]
      },
      {
        id: "f7",
        text: Q_WRONG,
        choices: ens([
          "The girl singing on the stage is Emi.",
          "The dog run in the park is mine.",
          "I have a friend living in Kyoto.",
          "Do you know the man standing by the door?"
        ]),
        answer: 1,
        explain: [
          "犬は「走っている」側なので、名詞のあとには現在分詞を置きます。",
          seigo("The dog run in the park is mine.", "The dog " + key("running") + " in the park is mine."),
          "ほかの3つは、「名詞 + 現在分詞 + 語句」の形になっていて正しい文です。"
        ]
      },
      {
        id: "f8",
        text: Q_EN_TO_JA,
        material: eibun("The man talking with Ms. Brown is our new teacher."),
        choices: [
          "その男性は、わたしたちの新しい先生についてブラウン先生と話しています。",
          "ブラウン先生は、わたしたちの新しい先生と話している女性です。",
          "わたしたちの新しい先生は、ブラウン先生と話していました。",
          "ブラウン先生と話している男性は、わたしたちの新しい先生です。"
        ],
        answer: 3,
        explain: [
          en("talking with Ms. Brown") + "(ブラウン先生と話している)が、後ろから " + en("The man") + " を説明しています。",
          en("The man talking with Ms. Brown") + " までが主語で、文の動詞は " + en("is") + " です。",
          "「〜について話しています」「話していました」のように、" + en("talking") + " を文の動詞として訳すのは誤りです。"
        ]
      },
      {
        id: "f9",
        text: "次の2つの文を、分詞を使って1つの文にしたものはどれですか。",
        material: eibun([
          ["Look at the boy.", "その男の子を見て。"],
          ["He is swimming in the river.", "彼は川で泳いでいます。"]
        ]),
        choices: ens([
          "Look at the boy swam in the river.",
          "Look at the boy is swimming in the river.",
          "Look at the boy swimming in the river.",
          "Look at the boy swimming the river in."
        ]),
        answer: 2,
        explain: [
          en("He is swimming in the river") + " から " + en("He is") + " をとり、" + en("swimming in the river") + " を " + en("the boy") + " のあとに置きます。",
          eibun("Look at the boy " + key("swimming in the river") + ".", "川で泳いでいる男の子を見て。"),
          "過去形 " + en("swam") + " や " + en("is swimming") + " を残すと、文の中に動詞が2つになります。" + en("in") + " の位置もくずせません。"
        ]
      },
      {
        id: "f10",
        text: Q_BLANK,
        material: kaiwa([
          ["A", "Which boy is Ken?", "どの男の子がケンですか。"],
          ["B", "He's the boy " + B + " a red cap.", "赤い帽子をかぶっている男の子です。"]
        ]),
        choices: ["wore", "worn", "wears", "wearing"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          "男の子は帽子を「かぶっている」側なので、現在分詞 " + en(key("wearing")) + " を使います。",
          eibun("He's the boy " + fill("wearing") + " a red cap."),
          en("worn") + " は過去分詞で「身につけられた」という意味になり、男の子には合いません。" + en("wore") + " と " + en("wears") + " は、名詞を説明する形ではありません。"
        ]
      },
      {
        id: "f11",
        text: Q_BLANK,
        material: eibun("These are cookies " + B + " by my grandmother.", "これは祖母が焼いたクッキーです。"),
        choices: ["baking", "baked", "bake", "bakes"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          "クッキーは「焼かれた」側なので、過去分詞 " + en(key("baked")) + " を使います。" + en("by my grandmother") + " で、だれが焼いたかを表します。",
          eibun("These are cookies " + fill("baked") + " by my grandmother.", "これらは祖母によって焼かれたクッキーです。"),
          en("baking") + " ではクッキーが「焼いている」ことになります。" + en("bake") + " と " + en("bakes") + " は名詞を説明できません。"
        ]
      },
      {
        id: "f12",
        text: Q_BLANK,
        material: eibun("I know a girl " + B + " Emi.", "わたしはエミと呼ばれている女の子を知っています。"),
        choices: ["called", "calling", "calls", "call"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "女の子は「エミと呼ばれている」側なので、過去分詞 " + en(key("called")) + " を使います。",
          eibun("I know a girl " + fill("called") + " Emi."),
          en("calling Emi") + " は「エミを呼んでいる」という意味になり、日本語の文と合いません。" + en("calls") + " と " + en("call") + " は名詞を説明できません。"
        ]
      },
      {
        id: "f13",
        text: Q_BLANK,
        material: eibun("The children playing in the park " + B + " happy.", "公園で遊んでいる子どもたちは楽しそうです。"),
        choices: ["looks", "looking", "look", "to look"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          "主語は " + en("The children playing in the park") + " までのまとまりで、中心の語は " + en("children") + "(複数)です。",
          "文の動詞が入るところで、主語が複数の現在の文なので " + en(key("look")) + " を使います。",
          "すぐ前の " + en("park") + " を見て " + en("looks") + " にしないように注意します。" + en("looking") + " と " + en("to look") + " では、文の動詞がなくなります。"
        ]
      },
      {
        id: "f14",
        text: Q_RIGHT,
        choices: ens([
          "I bought a made in Italy bag.",
          "I bought a bag making in Italy.",
          "I bought a bag made Italy in.",
          "I bought a bag made in Italy."
        ]),
        answer: 3,
        explain: [
          "かばんは「作られた」側なので、過去分詞 " + en("made") + " を使います。",
          en("made in Italy") + "(イタリアで作られた)は2語以上なので、名詞 " + en("bag") + " のあとに置きます。",
          eibun("I bought a bag " + key("made in Italy") + ".", "わたしはイタリア製のかばんを買いました。")
        ]
      },
      {
        id: "f15",
        text: Q_REPLY,
        material: kaiwa([
          ["A", "Which girl is your sister?", "どの女の子があなたのお姉さんですか。"],
          ["B", B]
        ]),
        choices: ens([
          "Yes, she is.",
          "She's the girl talking with Mr. Smith.",
          "She's the girl talked with Mr. Smith.",
          "She's talking girl with Mr. Smith."
        ]),
        answer: 1,
        explain: [
          "どの女の子かをたずねているので、「〜している女の子です」と具体的に答えます。",
          eibun("She's the girl " + key("talking with Mr. Smith") + ".", "スミス先生と話している女の子です。"),
          "疑問詞の疑問文には " + en("Yes / No") + " で答えません。" + en("talked") + " は過去形なので使えず、2語以上のまとまりは名詞の前に置けません。"
        ]
      }
    ]
  });

  // =====================================================================
  // 3-10 関係代名詞(主格)
  // =====================================================================
  JHE.register("g3-relative-subject", {
    points: [
      "関係代名詞は、名詞のあとに置いて、その名詞を後ろから説明する文をつなぎます。説明される名詞を" + rule("先行詞") + "といいます。",
      "先行詞が" + rule("人なら who") + "、" + rule("もの・動物なら which") + " を使います。" + rule("that") + " は、人にも、もの・動物にも使えます。",
      "主格の関係代名詞は、説明の文の主語のはたらきをします。「先行詞 + 関係代名詞 + 動詞 〜」の順になり、" + rule("主格の関係代名詞は省略できません") + "。",
      "関係代名詞のあとの動詞は、" + rule("先行詞に合わせます") + "。" + en("a boy who " + key("plays") + " tennis") + "(1人)、" + en("students who " + key("play") + " tennis") + "(複数)。",
      "先行詞と説明がひとまとまりで主語になるとき、文の動詞はまとまりの後ろにきます。" + en("The girl who lives next door " + key("is") + " my friend.") + "(となりに住んでいる女の子は、わたしの友だちです。)"
    ],
    chart: gojun([
      { role: "先行詞", en: "a boy", ja: "男の子" },
      { role: "関係代名詞", en: "who", key: true },
      { role: "動詞", en: "plays", ja: "する" },
      { role: "そのほか", en: "tennis well", ja: "テニスをじょうずに" }
    ], "名詞を後ろから説明する(主格)") +
    hyo({
      caption: "先行詞と関係代名詞(○ 使える)",
      head: ["", "who", "which", "that"],
      rows: [
        ["人", { ja: "○" }, { ja: "×" }, { ja: "○" }],
        ["もの", { ja: "×" }, { ja: "○" }, { ja: "○" }],
        ["動物", { ja: "×" }, { ja: "○" }, { ja: "○" }]
      ],
      compact: true
    }),
    example: {
      title: "次の2つの文を、関係代名詞を使って1つの文にしなさい。" + eibun([
        ["I have a friend.", "わたしには友だちがいます。"],
        ["She lives in Canada.", "彼女はカナダに住んでいます。"]
      ]),
      steps: [
        "2つめの文の " + en("She") + " は、1つめの文の " + en("a friend") + " を指しています。これが先行詞です。",
        "先行詞は人で、" + en("She") + " は主語なので、主格の " + en(key("who")) + "(または " + en("that") + ")に置きかえます。",
        en("who lives in Canada") + " を、先行詞 " + en("a friend") + " のすぐあとに置きます。"
      ],
      result: en("I have a friend who lives in Canada.")
    },
    fixed: [
      {
        id: "f1",
        text: Q_BLANK,
        material: eibun("I have a friend " + B + " can speak French.", "わたしにはフランス語を話せる友だちがいます。"),
        choices: ["which", "what", "who", "when"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          "先行詞 " + en("a friend") + " は人なので、関係代名詞は " + en(key("who")) + " を使います。",
          eibun("I have a friend " + fill("who") + " can speak French."),
          en("which") + " は先行詞がもの・動物のときに使います。" + en("what") + " と " + en("when") + " は、ここでは名詞を説明する文をつなげません。"
        ]
      },
      {
        id: "f2",
        text: Q_BLANK,
        material: eibun("This is a bus " + B + " goes to the station.", "これは駅へ行くバスです。"),
        choices: ["which", "who", "what", "where"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "先行詞 " + en("a bus") + " はものなので、関係代名詞は " + en(key("which")) + " を使います。",
          eibun("This is a bus " + fill("which") + " goes to the station."),
          en("who") + " は先行詞が人のときに使います。" + en("what") + " と " + en("where") + " は、ここでは使えません。"
        ]
      },
      {
        id: "f3",
        text: Q_BLANK,
        material: eibun("Do you know the girl " + B + " is singing over there?", "あそこで歌っている女の子を知っていますか。"),
        choices: ["what", "where", "which", "that"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          "先行詞 " + en("the girl") + " は人です。" + en(key("that")) + " は、人にも、ものにも使えます。",
          eibun("Do you know the girl " + fill("that") + " is singing over there?"),
          en("which") + " は先行詞がもの・動物のときに使うので、人には使いません。" + en("what") + " と " + en("where") + " も入りません。"
        ]
      },
      {
        id: "f4",
        text: Q_BLANK,
        material: eibun("I know some students who " + B + " in this town.", "わたしはこの町に住んでいる生徒を何人か知っています。"),
        choices: ["lives", "live", "living", "to live"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          "関係代名詞のあとの動詞は、先行詞に合わせます。先行詞 " + en("some students") + " は複数なので " + en(key("live")) + " です。",
          eibun("I know some students who " + fill("live") + " in this town."),
          "すぐ前の " + en("who") + " だけを見て " + en("lives") + " にしないように注意します。" + en("living") + " と " + en("to live") + " は、" + en("who") + " のあとの動詞になりません。"
        ]
      },
      {
        id: "f5",
        text: Q_BLANK,
        material: eibun("The man who " + B + " to me yesterday was Ms. Ito's father.", "昨日わたしに話しかけてきた男性は、伊藤先生のお父さんでした。"),
        choices: ["speak", "speaking", "spoke", "spoken"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          en("yesterday") + " があるので、" + en("who") + " のあとの動詞は過去形 " + en(key("spoke")) + " にします。",
          eibun("The man who " + fill("spoke") + " to me yesterday was Ms. Ito's father."),
          en("speak") + " は現在の形で、" + en("yesterday") + " と合いません。" + en("speaking") + " と " + en("spoken") + " は、" + en("who") + " のあとの動詞として1語では使えません。"
        ]
      },
      {
        id: "f6",
        text: Q_COMBINE,
        material: eibun([
          ["Look at the dog.", "その犬を見て。"],
          ["It is running in the park.", "それは公園で走っています。"]
        ]),
        choices: ens([
          "Look at the dog it is running in the park.",
          "Look at the dog which running in the park.",
          "Look at the dog which is running in the park.",
          "Look at the dog is running which in the park."
        ]),
        answer: 2,
        explain: [
          "2つめの文の " + en("It") + " は " + en("the dog") + " を指しています。先行詞は動物なので、" + en(key("which")) + " に置きかえます。",
          eibun("Look at the dog " + key("which") + " is running in the park.", "公園で走っている犬を見て。"),
          en("it") + " を残したもの、" + en("is") + " を落としたもの、" + en("which") + " の位置がちがうものは誤りです。"
        ]
      },
      {
        id: "f7",
        text: Q_WRONG,
        choices: ens([
          "I have an uncle who lives in Osaka.",
          "This is the train which goes to Kyoto.",
          "She is a singer that is popular in Japan.",
          "He has a cat which have blue eyes."
        ]),
        answer: 3,
        explain: [
          "先行詞 " + en("a cat") + " は1ぴきなので、" + en("which") + " のあとの動詞は " + en("has") + " にします。",
          seigo("He has a cat which have blue eyes.", "He has a cat which " + key("has") + " blue eyes."),
          "ほかの3つは、先行詞に合った関係代名詞と動詞の形になっていて正しい文です。"
        ]
      },
      {
        id: "f8",
        text: Q_EN_TO_JA,
        material: eibun("The boy who is talking with Emi is Ken."),
        choices: [
          "エミと話している男の子はケンです。",
          "その男の子は、エミとケンについて話しています。",
          "ケンは、エミと話している男の子を知っています。",
          "エミは、ケンと話している女の子です。"
        ],
        answer: 0,
        explain: [
          en("who is talking with Emi") + "(エミと話している)が、後ろから " + en("The boy") + " を説明しています。",
          en("The boy who is talking with Emi") + " までが主語で、文の動詞は2つめの " + en("is") + " です。",
          "話しているのは男の子とエミで、その男の子がケンです。ほかの3つは、だれが何をしているかがちがいます。"
        ]
      },
      {
        id: "f9",
        text: "「これは100年前に建てられた家です。」を表す文はどれですか。",
        choices: ens([
          "This is a house who was built 100 years ago.",
          "This is a house which was built 100 years ago.",
          "This is a house which built 100 years ago.",
          "This is a house was built which 100 years ago."
        ]),
        answer: 1,
        explain: [
          "先行詞 " + en("a house") + " はものなので " + en("which") + " を使います。家は「建てられた」ので、受け身の " + en("was built") + " を続けます。",
          eibun("This is a house " + key("which was built") + " 100 years ago."),
          en("who") + " は人に使う語です。" + en("which built") + " では家が「建てた」ことになり、" + en("which") + " の位置がちがうものも誤りです。"
        ]
      },
      {
        id: "f10",
        text: Q_RIGHT,
        choices: ens([
          "I know a girl plays the piano well.",
          "I know a girl who play the piano well.",
          "I know a girl which plays the piano well.",
          "I know a girl who plays the piano well."
        ]),
        answer: 3,
        explain: [
          "先行詞 " + en("a girl") + " は人なので " + en("who") + " を使い、動詞は1人に合わせて " + en("plays") + " にします。",
          "主格の関係代名詞は省略できません。" + seigo("I know a girl plays the piano well.", "I know a girl " + key("who") + " plays the piano well."),
          en("who play") + " は動詞の形が先行詞に合っていません。" + en("which") + " は人には使いません。"
        ]
      },
      {
        id: "f11",
        text: Q_BLANK,
        material: eibun("The girl who lives next to my house " + B + " a good singer.", "わたしの家のとなりに住んでいる女の子は、歌がじょうずです。"),
        choices: ["are", "be", "is", "being"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          "主語は " + en("The girl who lives next to my house") + " までのまとまりで、中心の語は " + en("The girl") + "(1人)です。",
          "ここは文の動詞が入るところです。主語が1人で現在の文なので " + en(key("is")) + " を使います。",
          en("are") + " は複数の主語に使います。" + en("be") + " と " + en("being") + " では、文の動詞になりません。"
        ]
      },
      {
        id: "f12",
        text: "「彼は多くの人に愛されている歌手です。」を、正しい語順で表した文はどれですか。",
        choices: ens([
          "He is a singer who is loved by many people.",
          "He is a singer who loves many people.",
          "He is a singer is loved who by many people.",
          "He is who a singer is loved by many people."
        ]),
        answer: 0,
        explain: [
          "先行詞 " + en("a singer") + " のすぐあとに " + en("who") + " を置き、「愛されている」は受け身の " + en("is loved") + " で表します。",
          gojun([
            { role: "先行詞", en: "a singer" },
            { role: "関係代名詞", en: "who", key: true },
            { role: "動詞", en: "is loved" },
            { role: "そのほか", en: "by many people." }
          ]),
          en("who loves many people") + " は「多くの人を愛している」という意味で、日本語の文と合いません。"
        ]
      },
      {
        id: "f13",
        text: Q_BLANK,
        material: kaiwa([
          ["A", "What kind of books do you like?", "どんな本が好きですか。"],
          ["B", "I like books " + B + " make me happy.", "わたしを幸せな気持ちにしてくれる本が好きです。"]
        ]),
        choices: ["who", "that", "what", "where"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          "先行詞 " + en("books") + " はものです。" + en(key("that")) + " は、ものにも使えます。",
          eibun("I like books " + fill("that") + " make me happy."),
          en("who") + " は先行詞が人のときに使います。" + en("what") + " と " + en("where") + " は、ここでは使えません。"
        ]
      },
      {
        id: "f14",
        text: "「あなたには、テニスがじょうずなお兄さんがいますか。」を表す文はどれですか。",
        choices: ens([
          "Do you have a brother which plays tennis well?",
          "Do you have a brother who play tennis well?",
          "Do you have a brother who plays tennis well?",
          "Do you have a brother plays tennis well?"
        ]),
        answer: 2,
        explain: [
          "先行詞 " + en("a brother") + " は人なので " + en("who") + " を使い、動詞は1人に合わせて " + en(key("plays")) + " にします。",
          "文全体は " + en("Do you 〜?") + " の疑問文でも、" + en("who") + " のあとの動詞は先行詞に合わせます。",
          en("which") + " は人に使わず、主格の関係代名詞は省略できません。"
        ]
      },
      {
        id: "f15",
        text: "次の文で、関係代名詞 " + en("who") + " の先行詞はどれですか。",
        material: eibun("The woman who came to our school yesterday is a famous writer.", "昨日わたしたちの学校に来た女性は、有名な作家です。"),
        choices: ens(["our school", "The woman", "yesterday", "a famous writer"]),
        answer: 1,
        explain: [
          "先行詞は、関係代名詞のすぐ前にあって、後ろから説明される名詞です。",
          en("who came to our school yesterday") + " が説明しているのは " + en(key("The woman")) + " です。" + en("who") + " は人に使うので、先行詞も人です。",
          en("our school") + " はものです。" + en("a famous writer") + " は文の動詞 " + en("is") + " のあとの語で、説明される名詞ではありません。"
        ]
      }
    ]
  });

  // =====================================================================
  // 3-11 関係代名詞(目的格)
  // =====================================================================
  JHE.register("g3-relative-object", {
    points: [
      "目的格の関係代名詞は、説明の文の目的語(〜を)のはたらきをします。「" + rule("先行詞 + 関係代名詞 + 主語 + 動詞") + "」の順になります。" + en("the book which I read yesterday") + "(わたしが昨日読んだ本)",
      "先行詞が" + rule("もの・動物なら which") + "、" + rule("人なら that") + " を使います(人には " + en("who") + " を使うこともありますが、中学では " + en("that") + " の形で学びます)。" + en("that") + " は、もの・動物にも使えます。",
      rule("目的格の関係代名詞は省略できます") + "。" + en("the book I read yesterday") + " のように、名詞のすぐあとに「主語 + 動詞」を続けても、同じ意味になります。",
      "関係代名詞が目的語のはたらきをしているので、動詞のあとに目的語(" + en("it") + "、" + en("him") + " など)を重ねません。" + seigo("the book which I read it", "the book which I read"),
      "見分け方: 関係代名詞のすぐあとが「主語 + 動詞」なら目的格で、省略できます。すぐあとが動詞なら主格で、省略できません。"
    ],
    chart: gojun([
      { role: "先行詞", en: "the book", ja: "本" },
      { role: "関係代名詞", en: "which", key: true },
      { role: "主語", en: "I", ja: "わたしが" },
      { role: "動詞", en: "read", ja: "読んだ" },
      { role: "そのほか", en: "yesterday", ja: "昨日" }
    ], "目的格: 先行詞 + 関係代名詞 + 主語 + 動詞") +
    gojun([
      { role: "先行詞", en: "the book" },
      { role: "主語", en: "I", key: true },
      { role: "動詞", en: "read", key: true },
      { role: "そのほか", en: "yesterday" }
    ], "関係代名詞を省略した形") +
    hyo({
      caption: "目的格の関係代名詞(○ 使える)",
      head: ["", "which", "that", "省略"],
      rows: [
        ["人", { ja: "×" }, { ja: "○" }, { ja: "○" }],
        ["もの", { ja: "○" }, { ja: "○" }, { ja: "○" }],
        ["動物", { ja: "○" }, { ja: "○" }, { ja: "○" }]
      ],
      compact: true
    }),
    example: {
      title: "次の2つの文を、関係代名詞を使って1つの文にしなさい。" + eibun([
        ["This is the bag.", "これはそのかばんです。"],
        ["I bought it yesterday.", "わたしは昨日それを買いました。"]
      ]),
      steps: [
        "2つめの文の " + en("it") + " は " + en("the bag") + " を指しています。" + en("it") + " は " + en("bought") + " の目的語です。",
        "先行詞はものなので、" + en("it") + " を目的格の " + en(key("which")) + "(または " + en("that") + ")にかえ、先行詞のすぐあとに置きます。",
        "もとの " + en("it") + " は残しません。目的格なので、" + en("which") + " を省略した " + en("This is the bag I bought yesterday.") + " でも同じ意味です。"
      ],
      result: en("This is the bag which I bought yesterday.")
    },
    fixed: [
      {
        id: "f1",
        text: Q_BLANK,
        material: eibun("This is the cake " + B + " my mother made.", "これは母が作ったケーキです。"),
        choices: ["who", "what", "where", "which"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          "先行詞 " + en("the cake") + " はものなので、関係代名詞は " + en(key("which")) + " を使います。" + en("which") + " は " + en("made") + " の目的語のはたらきをしています。",
          eibun("This is the cake " + fill("which") + " my mother made."),
          en("who") + " は人に使う語です。" + en("what") + " と " + en("where") + " は、ここでは名詞を説明する文をつなげません。"
        ]
      },
      {
        id: "f2",
        text: Q_BLANK,
        material: eibun("She is the singer " + B + " I like the best.", "彼女は、わたしがいちばん好きな歌手です。"),
        choices: ["which", "that", "what", "whose"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          "先行詞 " + en("the singer") + " は人です。目的格で人に使えるのは " + en(key("that")) + " です。",
          eibun("She is the singer " + fill("that") + " I like the best."),
          en("which") + " は人には使いません。" + en("what") + " と " + en("whose") + " は、ここでは使えません。"
        ]
      },
      {
        id: "f3",
        text: Q_RIGHT,
        choices: ens([
          "The book which I read it was interesting.",
          "The book which I read was interesting.",
          "The book which I read were interesting.",
          "The book I read it was interesting."
        ]),
        answer: 1,
        explain: [
          en("which") + " が " + en("read") + " の目的語のはたらきをしているので、" + en("it") + " を重ねません。",
          seigo("The book which I read it was interesting.", "The book which I read was interesting."),
          "主語の中心は " + en("The book") + "(1冊)なので、文の動詞は " + en("were") + " ではなく " + en("was") + " です。"
        ]
      },
      {
        id: "f4",
        text: "次のうち、関係代名詞を省略できる文はどれですか。",
        choices: ens([
          "I have a friend who lives in Kobe.",
          "This is a song that makes me happy.",
          "The watch which I lost was new.",
          "Look at the cat which is sleeping on the sofa."
        ]),
        answer: 2,
        explain: [
          "省略できるのは目的格です。すぐあとが「主語 + 動詞」になっているものをさがします。",
          en("which I lost") + " は、" + en("which") + " のあとが " + en("I lost") + "(主語 + 動詞)なので目的格です。" + en("The watch I lost was new.") + " とできます。",
          "ほかの3つは、関係代名詞のすぐあとが動詞(" + en("lives") + "、" + en("makes") + "、" + en("is") + ")で、主格なので省略できません。"
        ]
      },
      {
        id: "f5",
        text: Q_EN_TO_JA,
        material: eibun("The pictures you took in Hokkaido are beautiful."),
        choices: [
          "あなたが北海道で撮った写真は、美しいです。",
          "北海道であなたを撮った写真は、美しいです。",
          "あなたは北海道の美しい写真を持っています。",
          "北海道で撮られた写真の中で、あなたのものがいちばん美しいです。"
        ],
        answer: 0,
        explain: [
          en("pictures") + " のあとに関係代名詞が省略されていて、" + en("you took in Hokkaido") + "(あなたが北海道で撮った)が " + en("The pictures") + " を説明しています。",
          en("The pictures you took in Hokkaido") + " までが主語で、文の動詞は " + en("are") + " です。",
          "写真を撮ったのは " + en("you") + "(あなた)です。「あなたを撮った」「いちばん美しい」は、もとの英文にない意味です。"
        ]
      },
      {
        id: "f6",
        text: Q_COMBINE,
        material: eibun([
          ["The boy is Ken.", "その男の子はケンです。"],
          ["I met him at the station.", "わたしは駅で彼に会いました。"]
        ]),
        choices: ens([
          "The boy that I met him at the station is Ken.",
          "The boy that met I at the station is Ken.",
          "The boy I met at the station him is Ken.",
          "The boy that I met at the station is Ken."
        ]),
        answer: 3,
        explain: [
          en("him") + " は " + en("The boy") + " を指す、" + en("met") + " の目的語です。先行詞は人なので、目的格の " + en(key("that")) + " にかえます。",
          eibun("The boy " + key("that I met at the station") + " is Ken.", "わたしが駅で会った男の子は、ケンです。"),
          en("him") + " を残したものと、「主語 + 動詞」の順がくずれたものは誤りです。"
        ]
      },
      {
        id: "f7",
        text: Q_WRONG,
        choices: ens([
          "This is the dog that I found in the park.",
          "The movie we saw yesterday was exciting.",
          "The man which I saw at the library was tall.",
          "Is this the pen which you are looking for?"
        ]),
        answer: 2,
        explain: [
          "先行詞 " + en("The man") + " は人なので、" + en("which") + " は使えません。目的格では " + en("that") + " を使います。",
          seigo("The man which I saw at the library was tall.", "The man " + key("that") + " I saw at the library was tall."),
          "ほかの3つは、先行詞に合った関係代名詞を使ったり、関係代名詞を省略したりした正しい文です。"
        ]
      },
      {
        id: "f8",
        text: "「これは、わたしが毎日使っている自転車です。」を、正しい語順で表した文はどれですか。",
        choices: ens([
          "This is the bike use I every day.",
          "This is the bike I use every day.",
          "This is I use the bike every day.",
          "This is the bike every day I use."
        ]),
        answer: 1,
        explain: [
          "関係代名詞を省略して、先行詞 " + en("the bike") + " のすぐあとに「主語 + 動詞」の " + en("I use") + " を続けます。",
          gojun([
            { role: "先行詞", en: "the bike" },
            { role: "主語", en: "I", key: true },
            { role: "動詞", en: "use", key: true },
            { role: "そのほか", en: "every day." }
          ]),
          "「主語 + 動詞」の順が逆のものや、" + en("every day") + " が間に入ったものは誤りです。"
        ]
      },
      {
        id: "f9",
        text: Q_BLANK,
        material: eibun("The letter " + B + " Emi wrote to me made me happy.", "エミがわたしに書いてくれた手紙は、わたしを幸せな気持ちにしました。"),
        choices: ["which", "who", "what", "when"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "先行詞 " + en("The letter") + " はものなので、" + en(key("which")) + " を使います。あとが " + en("Emi wrote") + "(主語 + 動詞)なので目的格です。",
          eibun("The letter " + fill("which") + " Emi wrote to me made me happy."),
          en("who") + " は人に使う語です。" + en("what") + " と " + en("when") + " は、ここでは使えません。"
        ]
      },
      {
        id: "f10",
        text: Q_BLANK,
        material: eibun("The bag that she " + B + " last week is red.", "彼女が先週買ったかばんは赤いです。"),
        choices: ["buy", "buys", "bought", "buying"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          en("that she 〜 last week") + " は、かばんを説明する部分です。" + en("last week") + " があるので、過去形 " + en(key("bought")) + " にします。",
          eibun("The bag that she " + fill("bought") + " last week is red."),
          en("buy") + " と " + en("buys") + " は現在の形で " + en("last week") + " と合わず、" + en("buying") + " は1語では動詞になりません。"
        ]
      },
      {
        id: "f11",
        text: "「あなたがいちばん好きなスポーツは何ですか。」を表す文はどれですか。",
        choices: ens([
          "What is the sport likes you the best?",
          "What is the sport you like it the best?",
          "What is the sport you like the best?",
          "What you like is the sport the best?"
        ]),
        answer: 2,
        explain: [
          "「あなたがいちばん好きなスポーツ」は、関係代名詞を省略して " + en("the sport you like the best") + " と表せます。",
          eibun("What is " + key("the sport you like the best") + "?"),
          "「主語 + 動詞」の順が逆のもの、" + en("it") + " を重ねたもの、語順がくずれたものは誤りです。"
        ]
      },
      {
        id: "f12",
        text: Q_REPLY,
        material: kaiwa([
          ["A", "Who is the girl you were talking with?", "あなたが話していた女の子はだれですか。"],
          ["B", B]
        ]),
        choices: ens([
          "She's my cousin.",
          "Yes, I was.",
          "I was talking with.",
          "It's my bag."
        ]),
        answer: 0,
        explain: [
          en("the girl you were talking with") + " は「あなたが(いっしょに)話していた女の子」です。その女の子がだれかをたずねています。",
          "「わたしのいとこです」と、人を答えている " + en(key("She's my cousin.")) + " が正解です。",
          "疑問詞の疑問文には " + en("Yes / No") + " で答えません。" + en("I was talking with.") + " はだれかを答えておらず、" + en("It's my bag.") + " はものを答えています。"
        ]
      },
      {
        id: "f13",
        text: Q_EN_TO_JA,
        material: eibun("Please tell me about the country you visited last year."),
        choices: [
          "あなたは去年、その国を訪れましたか。",
          "去年あなたを訪ねてきた人の国について、教えてください。",
          "あなたが去年訪れた国について、わたしに教えてください。",
          "あなたが来年訪れたい国について、わたしに教えてください。"
        ],
        answer: 2,
        explain: [
          en("country") + " のあとに関係代名詞が省略されていて、" + en("you visited last year") + "(あなたが去年訪れた)が " + en("the country") + " を説明しています。",
          en("Please tell me about 〜.") + " は「〜について教えてください」です。",
          "疑問文ではなく、訪れたのは「あなた」で、時は「去年」です。ほかの3つは、この点がちがいます。"
        ]
      },
      {
        id: "f14",
        text: Q_COMBINE,
        material: eibun([
          ["Kyoto is a city.", "京都は都市です。"],
          ["Many people visit it every year.", "毎年多くの人がそこを訪れます。"]
        ]),
        choices: ens([
          "Kyoto is a city which visits many people every year.",
          "Kyoto is a city which many people visit it every year.",
          "Kyoto is a city many people visits every year.",
          "Kyoto is a city which many people visit every year."
        ]),
        answer: 3,
        explain: [
          en("it") + " は " + en("a city") + " を指す、" + en("visit") + " の目的語です。先行詞はものなので、目的格の " + en(key("which")) + " にかえます。",
          eibun("Kyoto is a city " + key("which many people visit") + " every year.", "京都は、毎年多くの人が訪れる都市です。"),
          en("which visits many people") + " は「都市が人を訪れる」ことになります。" + en("it") + " を残したものと、" + en("many people") + " に合わない " + en("visits") + " も誤りです。"
        ]
      },
      {
        id: "f15",
        text: "次の文に " + en("that") + " を入れた文として、正しいものはどれですか。",
        material: eibun("The cake my sister made yesterday was good.", "姉が昨日作ったケーキは、おいしかったです。"),
        choices: ens([
          "The cake that my sister made yesterday was good.",
          "The cake my sister that made yesterday was good.",
          "The cake my sister made that yesterday was good.",
          "The cake my sister made yesterday that was good."
        ]),
        answer: 0,
        explain: [
          en("my sister made yesterday") + " が " + en("The cake") + " を説明していて、関係代名詞が省略されています。",
          "目的格の関係代名詞は先行詞のすぐあとに置くので、" + en("The cake") + " と " + en("my sister") + " のあいだに入れます。",
          eibun("The cake " + key("that") + " my sister made yesterday was good.")
        ]
      }
    ]
  });

  // =====================================================================
  // 3-12 仮定法
  // =====================================================================
  JHE.register("g3-subjunctive", {
    points: [
      "仮定法は、" + rule("現実とはちがうこと") + " や、実際には起こりそうにないことを表す言い方です。今のことを言っていても、" + rule("動詞や助動詞を過去形にします") + "。",
      "「〜ならいいのに」は、" + rule("I wish + 主語 + 過去形 〜.") + " で表します。" + en("I wish I " + key("had") + " a dog.") + "(犬を飼っていればいいのに。)「〜できればいいのに」は " + en("could") + " を使います。" + en("I wish I " + key("could") + " swim.") + "(泳げればいいのに。)",
      "「もし〜なら、…するのに」は、" + rule("If + 主語 + 過去形 〜, 主語 + would / could + 動詞の原形 ….") + " で表します。" + en("If I had time, I " + key("would") + " go with you.") + "(もし時間があれば、いっしょに行くのに。)",
      "仮定法の be動詞は、" + rule("主語にかかわらず were") + " を使います。" + en("I wish I " + key("were") + " a bird.") + "、" + en("If he " + key("were") + " here, 〜") + " のようにします。",
      "実際に起こりうることを言うふつうの " + en("if") + " の文は、現在形で表します。" + en("If it is sunny tomorrow, we will go to the sea.") + "(明日晴れたら、海へ行きます。)仮定法とは区別します。"
    ],
    chart: gojun([
      { role: "If", en: "If" },
      { role: "主語", en: "I" },
      { role: "過去形", en: "were", key: true },
      { role: "そのほか", en: "a bird,", ja: "もし鳥なら" },
      { role: "主語", en: "I" },
      { role: "would / could", en: "could", key: true },
      { role: "原形", en: "fly.", ja: "飛べるのに" }
    ], "If + 主語 + 過去形 〜, 主語 + would / could + 原形") +
    gojun([
      { role: "I wish", en: "I wish" },
      { role: "主語", en: "I" },
      { role: "過去形", en: "could", key: true },
      { role: "原形", en: "swim.", ja: "泳げればいいのに" }
    ], "I wish + 主語 + 過去形") +
    hyo({
      caption: "仮定法で使う形",
      head: ["", "現在形", "仮定法"],
      rows: [
        ["〜だ", "is", "were"],
        ["持つ", "have", "had"],
        ["できる", "can", "could"],
        ["だろう", "will", "would"]
      ]
    }),
    example: {
      title: "「もしわたしがあなたなら、その本を読むのに。」を英語で表しなさい。",
      steps: [
        "わたしはあなたではないので、現実とちがうことを言う仮定法を使います。",
        "「もしわたしがあなたなら」は、主語が " + en("I") + " でも be動詞を " + en(key("were")) + " にして、" + en("If I were you") + " とします。",
        "「〜するのに」は " + en(key("would")) + " + 動詞の原形で、" + en("I would read the book") + " です。"
      ],
      result: en("If I were you, I would read the book.")
    },
    fixed: [
      {
        id: "f1",
        text: Q_BLANK,
        material: eibun("I wish I " + B + " a bird.", "わたしが鳥ならいいのに。"),
        choices: ["am", "were", "be", "is"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          "「〜ならいいのに」は " + en("I wish + 主語 + 過去形") + " です。仮定法の be動詞は、主語にかかわらず " + en(key("were")) + " を使います。",
          eibun("I wish I " + fill("were") + " a bird."),
          en("am") + " と " + en("is") + " は現在形で、現実とちがうことを表せません。" + en("be") + " は原形です。"
        ]
      },
      {
        id: "f2",
        text: Q_BLANK_PHRASE,
        material: eibun("If I " + B + " rich, I would buy a big house.", "もしわたしがお金持ちなら、大きな家を買うのに。"),
        choices: ["am", "be", "will be", "were"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          "後半に " + en("would") + " があり、現実とちがうことを言っている仮定法の文です。" + en("If") + " のあとの be動詞は " + en(key("were")) + " にします。",
          eibun("If I " + fill("were") + " rich, I would buy a big house."),
          en("am") + " は現在形、" + en("be") + " は原形、" + en("will be") + " は未来の形で、仮定法には使いません。"
        ]
      },
      {
        id: "f3",
        text: Q_BLANK_JA,
        material: eibun("If I had time, I " + B + " go with you.", "もし時間があれば、あなたといっしょに行くのに。"),
        choices: ["will", "am", "would", "do"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          en("If I had time") + " は過去形を使った仮定法です。「…するのに」は " + en(key("would")) + " + 動詞の原形で表します。",
          eibun("If I had time, I " + fill("would") + " go with you."),
          en("will") + " は現在形の助動詞で、仮定法の文には合いません。" + en("am") + " と " + en("do") + " は、" + en("go") + " の前に置けません。"
        ]
      },
      {
        id: "f4",
        text: Q_BLANK,
        material: eibun("I wish I " + B + " speak Chinese.", "中国語が話せたらいいのに。"),
        choices: ["could", "can", "will", "am"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "「〜できればいいのに」は、" + en("can") + " の過去形 " + en(key("could")) + " を使って " + en("I wish I could 〜.") + " で表します。",
          eibun("I wish I " + fill("could") + " speak Chinese."),
          en("I wish") + " のあとで " + en("can") + " や " + en("will") + " は使いません。" + en("am") + " は動詞の原形の前に置けません。"
        ]
      },
      {
        id: "f5",
        text: Q_EN_TO_JA,
        material: eibun("If I were you, I wouldn't say that."),
        choices: [
          "わたしはあなたなので、そんなことは言いません。",
          "もしあなたがわたしなら、そんなことは言わないでしょう。",
          "わたしがあなただったとき、そんなことは言いませんでした。",
          "もしわたしがあなたなら、そんなことは言わないでしょう。"
        ],
        answer: 3,
        explain: [
          en("If I were you") + " は「もしわたしがあなたなら」という仮定法です。過去形でも、今のことを言っています。",
          en("wouldn't") + " は " + en("would not") + " の短縮形で、「〜しないでしょう」です。",
          "「〜だったとき」「〜なので」は、仮定法の意味とちがいます。「あなたがわたしなら」は、" + en("I") + " と " + en("you") + " が逆です。"
        ]
      },
      {
        id: "f6",
        text: "次の文からわかる、現実のことはどれですか。",
        material: eibun("I wish I had a brother.", "兄弟がいればいいのに。"),
        choices: [
          "わたしには兄弟がいる。",
          "わたしには兄弟がいない。",
          "わたしは兄弟がほしくない。",
          "わたしには以前、兄弟がいた。"
        ],
        answer: 1,
        explain: [
          en("I wish + 過去形") + " は、現実とはちがうことを願う言い方です。",
          "「兄弟がいればいいのに」と言っているので、現実は「兄弟がいない」です。",
          en("had") + " は過去形ですが、過去のことではなく、今のことを言っています。"
        ]
      },
      {
        id: "f7",
        text: "次の文とほぼ同じ意味を表す文はどれですか。",
        material: eibun("I'm sorry I can't swim.", "わたしは泳げなくて残念です。"),
        choices: ens([
          "I wish I can swim.",
          "I wish I couldn't swim.",
          "I wish I could swim.",
          "I wish I swim."
        ]),
        answer: 2,
        explain: [
          "「泳げなくて残念だ」は、「泳げればいいのに」と言いかえられます。",
          "「〜できればいいのに」は " + en("I wish I " + key("could") + " 〜.") + " です。",
          en("can") + " と " + en("swim") + " は現在形なので使えません。" + en("couldn't") + " では「泳げなければいいのに」となり、意味が逆です。"
        ]
      },
      {
        id: "f8",
        text: "次の文とほぼ同じ意味を表す文はどれですか。",
        material: eibun("I don't have a car, so I can't go there.", "わたしは車を持っていないので、そこへ行けません。"),
        choices: ens([
          "If I had a car, I could go there.",
          "If I have a car, I could go there.",
          "If I had a car, I can go there.",
          "If I didn't have a car, I could go there."
        ]),
        answer: 0,
        explain: [
          "現実とちがうことを「もし〜なら、…できるのに」と言うので、仮定法を使います。",
          en("If") + " のあとは過去形の " + en(key("had")) + "、後半は " + en(key("could")) + " + 動詞の原形です。",
          en("have") + " や " + en("can") + " のように現在形がまざったものは誤りです。" + en("didn't have") + " では「車がなければ」となり、意味が逆です。"
        ]
      },
      {
        id: "f9",
        text: Q_WRONG,
        choices: ens([
          "I wish I were taller.",
          "If I knew her phone number, I would call her.",
          "I wish I can play the piano.",
          "If she were here, she would help us."
        ]),
        answer: 2,
        explain: [
          en("I wish") + " のあとは過去形にします。「〜できればいいのに」は " + en("could") + " を使います。",
          seigo("I wish I can play the piano.", "I wish I " + key("could") + " play the piano."),
          "ほかの3つは、" + en("I wish + 過去形") + " や " + en("If + 過去形 〜, would 〜") + " の形になっていて正しい文です。"
        ]
      },
      {
        id: "f10",
        text: Q_BLANK,
        material: eibun("If my sister " + B + " here, she would be happy.", "もし姉がここにいれば、喜ぶでしょう。"),
        choices: ["is", "are", "were", "be"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          "後半に " + en("would") + " があるので仮定法です。主語 " + en("my sister") + " は1人ですが、仮定法の be動詞は " + en(key("were")) + " を使います。",
          eibun("If my sister " + fill("were") + " here, she would be happy."),
          en("is") + " と " + en("are") + " は現在形で、" + en("would") + " と合いません。" + en("be") + " は原形です。"
        ]
      },
      {
        id: "f11",
        text: "「もしわたしが鳥なら、あなたのところへ飛んで行けるのに。」を表す文はどれですか。",
        choices: ens([
          "If I am a bird, I could fly to you.",
          "If I were a bird, I could fly to you.",
          "If I were a bird, I can fly to you.",
          "If I were a bird, I could flew to you."
        ]),
        answer: 1,
        explain: [
          "わたしは鳥ではないので、仮定法を使います。" + en("If") + " のあとは " + en(key("were")) + "、後半は " + en(key("could")) + " + 動詞の原形です。",
          gojun([
            { role: "If", en: "If" },
            { role: "主語", en: "I" },
            { role: "過去形", en: "were", key: true },
            { role: "そのほか", en: "a bird," },
            { role: "主語", en: "I" },
            { role: "could", en: "could", key: true },
            { role: "原形", en: "fly to you." }
          ]),
          en("am") + " や " + en("can") + " のように現在形がまざったものは誤りです。" + en("could") + " のあとは原形なので、" + en("flew") + " は使いません。"
        ]
      },
      {
        id: "f12",
        text: "次のうち、実際に起こりうることを表している文はどれですか。",
        choices: ens([
          "If I were a cat, I would sleep all day.",
          "I wish I lived near the sea.",
          "If I had wings, I could fly.",
          "If it is sunny tomorrow, we will go to the sea."
        ]),
        answer: 3,
        explain: [
          en("If it is sunny tomorrow, 〜") + " は、明日晴れることが実際にありうるので、現在形の " + en("is") + " と " + en("will") + " を使ったふつうの文です。",
          "ほかの3つは、" + en("were") + "、" + en("lived") + "、" + en("had") + " と過去形を使った仮定法で、現実とちがうことを表しています。"
        ]
      },
      {
        id: "f13",
        text: Q_REPLY,
        material: kaiwa([
          ["A", "What would you do if you had a lot of money?", "もしお金がたくさんあったら、何をしますか。"],
          ["B", B]
        ]),
        choices: ens([
          "Yes, I would.",
          "I would buy a new house.",
          "I bought a new house.",
          "I would bought a new house."
        ]),
        answer: 1,
        explain: [
          "Aは仮定法で、「もし〜なら何をするか」をたずねています。答えも " + en(key("would")) + " + 動詞の原形で答えます。",
          eibun("I " + key("would buy") + " a new house.", "新しい家を買うでしょう。"),
          "疑問詞の疑問文には " + en("Yes / No") + " で答えません。" + en("I bought") + " は実際に買ったことになり、" + en("would") + " のあとに過去形は置けません。"
        ]
      },
      {
        id: "f14",
        text: Q_EN_TO_JA,
        material: eibun("I wish it were Sunday today."),
        choices: [
          "今日が日曜日でよかったです。",
          "今日は日曜日だったと思います。",
          "今日が日曜日ならいいのに。",
          "日曜日は今日だけならいいのに。"
        ],
        answer: 2,
        explain: [
          en("I wish + 過去形") + " で「〜ならいいのに」という意味です。現実は、今日は日曜日ではありません。",
          en("were") + " は過去形ですが、今日のことを言っています。「だったと思います」のように過去のこととして訳すのは誤りです。",
          "「よかった」は、今日が日曜日である(現実)ことになるので、意味がちがいます。"
        ]
      },
      {
        id: "f15",
        text: "( )内の語を正しい形にしたものはどれですか。",
        material: eibun("If I (know) his address, I would write to him.", "もし彼の住所を知っていれば、手紙を書くのに。"),
        choices: ["know", "known", "knows", "knew"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          "後半に " + en("would") + " があり、実際には住所を知らないので仮定法です。" + en("If") + " のあとは過去形にします。" + henka("know", "knew"),
          eibun("If I " + fill("knew") + " his address, I would write to him."),
          en("know") + " と " + en("knows") + " は現在形、" + en("known") + " は過去分詞です。"
        ]
      }
    ]
  });
})();
