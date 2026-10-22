// 中学英語道場: 中2「動詞」「文の形」の5単元の中身(要点・表・例題・問題)。
// 形式の説明と、表示部品の関数(JHE.en、JHE.eibun など)は data.js の先頭を参照。
// 中2「準動詞」「文の形(比較)」の5単元は data-g2-2.js にある。このファイルも data-g1.js と同じ形で書く。
//
// 内容のきまり:
// ・学校文法の説明に合わせる。教科書によって扱いが分かれる点には踏みこまない。
// ・英文はすべて自作。中1と、中2のこの単元までの語彙と文法の範囲で、アメリカ英語のつづりで書く
//   (不定詞・動名詞・比較・中3の文法は使わない)。
// ・問いの文(text)は日本語の指示だけにして、英文は material に入れる。
// ・正解が1つに決まるように、まちがいの選択肢は「どの場面でも成り立たない形」にする。
//   英文だけで決まらないとき(接続詞・助動詞の意味など)は、日本語の文をそえて Q_BLANK_JA で問う。
// ・will と be going to は「どちらも未来を表す」とだけ説明し、使い分けを正誤の根拠にしない
//   (両方が入る空所は作らない)。
(function () {
  "use strict";
  if (typeof JHE === "undefined") return;

  // ---------- このファイルの中で使う短い名前 ----------
  var en = JHE.en, eibun = JHE.eibun, kaiwa = JHE.kaiwa, fill = JHE.fill, u = JHE.u, key = JHE.key;
  var seigo = JHE.seigo, hyo = JHE.hyo, gojun = JHE.gojun, rule = JHE.rule;
  var B = JHE.blank();
  // 英文の選択肢(1列で出す)
  function ens(list) { return list.map(function (s) { return en(s); }); }

  var Q_BLANK = "空所に入る語はどれですか。";
  var Q_BLANK_PHRASE = "空所に入る語句はどれですか。";
  var Q_BLANK_JA = "日本語の文に合うように、空所に入る語を選びなさい。";
  var Q_BLANK_PHRASE_JA = "日本語の文に合うように、空所に入る語句を選びなさい。";
  var Q_REPLY = "Aの質問に対する、Bの答えとして正しいものはどれですか。";
  var Q_WRONG = "誤りのある文はどれですか。";
  var Q_EN_TO_JA = "次の英文の意味として正しいものはどれですか。";
  var Q_NEG = "次の文を否定文に書きかえたものはどれですか。";
  var Q_QUES = "次の文を疑問文に書きかえたものはどれですか。";

  // =====================================================================
  // 2-1 未来の文
  // =====================================================================
  JHE.register("g2-future", {
    points: [
      "これからのことは、" + rule(en("will") + " + 動詞の原形") + "で表します。" + en("will") + " は主語が何でも形が変わらず、あとの動詞は必ず原形です。" + en("I will play tennis tomorrow.") + "(わたしは明日テニスをします。)",
      rule(en("be going to") + " + 動詞の原形") + "も、これからのことを表します。" + en("be") + " は主語に合わせて " + en("am / are / is") + " にします。" + en("She is going to visit Kyoto.") + "(彼女は京都を訪れる予定です。)",
      "否定文は、" + en("will") + " のあとに " + en("not") + " を置きます。" + en("will not") + " は " + en("won't") + " と短くできます。" + en("be going to") + " の文は、be動詞のあとに " + en("not") + " を置きます。" + en("I'm not going to 〜.") + "(わたしは〜するつもりはありません。)",
      "疑問文は、" + en("Will") + " を主語の前に出し、" + en("Yes, I will. / No, I won't.") + " のように答えます。" + en("be going to") + " の文は、be動詞を主語の前に出し、be動詞で答えます。",
      "未来の文では、" + en("tomorrow") + "(明日)、" + en("next 〜") + "(次の〜)、" + en("this weekend") + "(この週末)などの語がよくいっしょに使われます。" + en("I will") + " は " + en("I'll") + "、" + en("it will") + " は " + en("it'll") + " のように短くできます。"
    ],
    chart:
      gojun([{ role: "主語", en: "I", ja: "わたしは" }, { role: "will", en: "will", key: true }, { role: "動詞の原形", en: "play", ja: "する" }, { role: "そのほか", en: "tennis tomorrow.", ja: "明日テニスを" }], en("will") + " の文") +
      gojun([{ role: "主語", en: "I" }, { role: "will not", en: "won't", key: true }, { role: "動詞の原形", en: "play" }, { role: "そのほか", en: "tennis tomorrow." }], en("will") + " の否定文") +
      gojun([{ role: "Will", en: "Will", key: true }, { role: "主語", en: "you" }, { role: "動詞の原形", en: "play" }, { role: "そのほか", en: "tennis tomorrow?" }], en("will") + " の疑問文") +
      gojun([{ role: "主語", en: "Ken", ja: "ケンは" }, { role: "be going to", en: "is going to", key: true }, { role: "動詞の原形", en: "visit", ja: "訪れる" }, { role: "そのほか", en: "Nara next week.", ja: "来週奈良を" }], en("be going to") + " の文"),
    example: {
      title: "次の文の最後に " + en("tomorrow") + " をつけて、" + en("will") + " を使った未来の文に書きかえなさい。" + eibun("Emi plays the piano.", "エミはピアノをひきます。"),
      steps: [
        "未来の文では、動詞の前に " + en("will") + " を置きます。",
        en("will") + " のあとの動詞は原形です。主語 " + en("Emi") + " は三人称単数ですが、" + en("plays") + " を原形の " + en(key("play")) + " にもどします。",
        "最後に " + en("tomorrow") + " をつけます。"
      ],
      result: en("Emi will play the piano tomorrow.")
    },
    fixed: [
      {
        id: "f1",
        text: Q_BLANK,
        material: eibun("It " + B + " rain tomorrow.", "明日は雨が降るでしょう。"),
        choices: ["will", "is", "does", "did"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "動詞の原形 " + en("rain") + " の前に置けて、未来を表すのは " + en(key("will")) + " です。",
          en("is") + " のあとに原形の " + en("rain") + " は続きません。" + en("does") + " は現在のことに使うので、" + en("tomorrow") + " と合いません。",
          en("did") + " は過去を表すので、" + en("tomorrow") + " と合いません。"
        ]
      },
      {
        id: "f2",
        text: Q_BLANK,
        material: eibun("Ken will " + B + " his uncle next Sunday.", "ケンは次の日曜日におじさんを訪ねるでしょう。"),
        choices: ["visits", "visit", "visited", "visiting"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          en("will") + " のあとの動詞は、主語が何でも" + rule("原形") + "にします。" + en("Ken will " + fill("visit") + " his uncle next Sunday."),
          "主語 " + en("Ken") + " は三人称単数ですが、" + en("will") + " のあとでは " + en("visits") + " にしません。",
          en("visited") + "(過去形)と " + en("visiting") + "(" + en("ing") + " 形)は、" + en("will") + " のあとに置けません。"
        ]
      },
      {
        id: "f3",
        text: Q_BLANK,
        material: eibun("We " + B + " going to clean the park this weekend.", "わたしたちはこの週末に公園をそうじする予定です。"),
        choices: ["am", "is", "be", "are"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          en("be going to") + " の " + en("be") + " は、主語に合わせます。主語 " + en("We") + " には " + en(key("are")) + " を使います。",
          en("am") + " は " + en("I") + "、" + en("is") + " は " + en("he, she, it") + " などに使います。",
          en("be") + " は原形なので、このままでは使えません。"
        ]
      },
      {
        id: "f4",
        text: Q_BLANK_PHRASE,
        material: eibun("My sister " + B + " watch the movie tonight.", "姉は今夜その映画を見るつもりです。"),
        choices: ens(["is going to", "are going to", "is going", "going to"]),
        answer: 0,
        explain: [
          "「〜するつもりです」は " + en("be going to") + " + 動詞の原形で表せます。主語 " + en("My sister") + " には " + en(key("is going to")) + " を使います。",
          en("are going to") + " は主語 " + en("My sister") + " に合いません。",
          en("is going") + " は " + en("to") + " が足りません。" + en("going to") + " は be動詞が足りません。"
        ]
      },
      {
        id: "f5",
        text: Q_NEG,
        material: eibun("I will go to the library after school.", "わたしは放課後、図書館に行きます。"),
        choices: ens(["I don't will go to the library after school.", "I will go not to the library after school.", "I will not go to the library after school.", "I won't went to the library after school."]),
        answer: 2,
        explain: [
          en("will") + " の文の否定文は、" + rule(en("will") + " のすぐあとに " + en("not")) + " を置き、動詞は原形のままにします。",
          en("I will " + key("not") + " go to the library after school.") + "(" + en("I won't go 〜") + " と短くしてもよい)",
          en("will") + " の文に " + en("don't") + " は使いません。" + en("not") + " は動詞のあとではなく " + en("will") + " のあとに置きます。",
          en("won't") + " のあとの動詞は原形なので、" + en("went") + " は使えません。"
        ]
      },
      {
        id: "f6",
        text: Q_QUES,
        material: eibun("Your brother is going to play baseball tomorrow.", "あなたのお兄さんは明日、野球をする予定です。"),
        choices: ens(["Does your brother going to play baseball tomorrow?", "Is your brother go to play baseball tomorrow?", "Are your brother going to play baseball tomorrow?", "Is your brother going to play baseball tomorrow?"]),
        answer: 3,
        explain: [
          en("be going to") + " の文の疑問文は、" + rule("be動詞を主語の前に出します") + "。",
          en(key("Is") + " your brother going to play baseball tomorrow?"),
          "be動詞の文なので " + en("Does") + " は使いません。" + en("going") + " を " + en("go") + " にすることもできません。",
          "主語 " + en("your brother") + " は1人なので、" + en("Are") + " は合いません。"
        ]
      },
      {
        id: "f7",
        text: Q_REPLY,
        material: kaiwa([["A", "Will you be busy tomorrow?", "あなたは明日、忙しいですか。"], ["B", B]]),
        choices: ens(["Yes, I do.", "Yes, I will.", "Yes, I did.", "Yes, you will."]),
        answer: 1,
        explain: [
          en("Will you 〜?") + " の疑問文には、" + en("will") + " を使って答えます。" + en("Yes, I " + key("will") + "."),
          en("do") + " は一般動詞の現在の疑問文、" + en("did") + " は過去の疑問文の答えに使います。",
          en("Yes, you will.") + " は、たずねた相手のことを答えてしまっています。"
        ]
      },
      {
        id: "f8",
        text: Q_REPLY,
        material: kaiwa([["A", "Are you going to visit Okinawa next month?", "あなたは来月、沖縄を訪れる予定ですか。"], ["B", B]]),
        choices: ens(["No, I don't.", "No, you aren't.", "No, I'm not.", "No, I didn't."]),
        answer: 2,
        explain: [
          en("Are you going to 〜?") + " は be動詞の疑問文なので、be動詞で答えます。" + en("No, " + key("I'm not") + "."),
          en("don't") + " と " + en("didn't") + " は、一般動詞の疑問文への答えに使います。",
          en("No, you aren't.") + " は、たずねた相手のことを答えてしまっています。"
        ]
      },
      {
        id: "f9",
        text: Q_WRONG,
        choices: ens(["They will be here soon.", "I'm going to buy a new bag.", "She will comes to the party.", "Will it be sunny tomorrow?"]),
        answer: 2,
        explain: [
          en("will") + " のあとの動詞は原形です。主語が三人称単数でも " + en("s") + " はつけません。",
          seigo("She will comes to the party.", "She will " + key("come") + " to the party."),
          en("will be") + " は be動詞の原形 " + en("be") + " を使った正しい形です。ほかの2つも正しい文です。"
        ]
      },
      {
        id: "f10",
        text: "「わたしは明日、早く起きるつもりです。」を表す文はどれですか。",
        choices: ens(["I'm going to got up early tomorrow.", "I'm going to get up early tomorrow.", "I going to get up early tomorrow.", "I'm going get up early tomorrow."]),
        answer: 1,
        explain: [
          "「〜するつもりです」は " + rule(en("be going to") + " + 動詞の原形") + "で表せます。",
          en("I'm going to " + key("get") + " up early tomorrow."),
          en("to") + " のあとは原形なので " + en("got") + " は使えません。",
          "be動詞が足りないものと、" + en("to") + " が足りないものは誤りです。"
        ]
      },
      {
        id: "f11",
        text: Q_EN_TO_JA,
        material: eibun("It won't be cold tomorrow."),
        choices: [
          "明日は寒いでしょう。",
          "昨日は寒くありませんでした。",
          "明日は寒くなりますか。",
          "明日は寒くないでしょう。"
        ],
        answer: 3,
        explain: [
          en("won't") + " は " + en("will not") + " を短くした形で、「〜しないでしょう」「〜ではないでしょう」という意味です。",
          en("tomorrow") + " があるので明日のことです。昨日のことではありません。",
          en("won't") + " があるので否定文です。疑問文なら " + en("Will it be 〜?") + " の語順になります。"
        ]
      },
      {
        id: "f12",
        text: "「あなたは今度の土曜日に何をするつもりですか。」を、正しい語順で表した文はどれですか。",
        choices: ens(["What are you going to do next Saturday?", "What you are going to do next Saturday?", "Are you going to do what next Saturday?", "What are you going do to next Saturday?"]),
        answer: 0,
        explain: [
          "疑問詞 " + en("What") + " を文の最初に置き、そのあとを " + en("be going to") + " の疑問文の語順(be動詞 + 主語 + " + en("going to") + " + 動詞の原形)にします。",
          gojun([
            { role: "疑問詞", en: "What", key: true },
            { role: "be動詞", en: "are" },
            { role: "主語", en: "you" },
            { role: "going to", en: "going to" },
            { role: "動詞の原形", en: "do" },
            { role: "そのほか", en: "next Saturday?" }
          ]),
          "主語の前に be動詞を出していないものと、疑問詞が文の途中にあるものは誤りです。" + en("going do to") + " は " + en("to") + " の位置がちがいます。"
        ]
      },
      {
        id: "f13",
        text: "次の問いへの答えとして正しいものはどれですか。",
        material: eibun("What will you do this weekend?", "あなたはこの週末に何をしますか。"),
        choices: ens(["Yes, I will.", "I played soccer last weekend.", "I'll play soccer with my friends.", "No, I won't."]),
        answer: 2,
        explain: [
          "この週末にすることを、未来の文で具体的に答えている " + en("I'll play soccer with my friends.") + "(友だちとサッカーをします)が正解です。",
          "疑問詞のある疑問文には、" + en("Yes / No") + " では答えません。",
          en("I played soccer last weekend.") + " は先週末の過去のことで、たずねられたことに答えていません。"
        ]
      },
      {
        id: "f14",
        text: Q_BLANK_PHRASE,
        material: eibun("I will call you " + B + "."),
        choices: ens(["yesterday", "last week", "tomorrow", "two days ago"]),
        answer: 2,
        explain: [
          en("will") + " は未来を表すので、未来の時を表す " + en(key("tomorrow")) + "(明日)と合います。" + en("I will call you " + fill("tomorrow") + ".") + "(明日あなたに電話します。)",
          en("yesterday") + "(昨日)、" + en("last week") + "(先週)、" + en("two days ago") + "(2日前)は過去の時を表すので、" + en("will") + " の文には使えません。"
        ]
      },
      {
        id: "f15",
        text: "次の文を、" + en("will") + " を使ってほぼ同じ意味に書きかえたものはどれですか。",
        material: eibun("I'm going to visit my aunt next week.", "わたしは来週おばを訪ねるつもりです。"),
        choices: ens(["I will visiting my aunt next week.", "I will am visit my aunt next week.", "I will going to visit my aunt next week.", "I will visit my aunt next week."]),
        answer: 3,
        explain: [
          en("will") + " も " + en("be going to") + " も未来を表します。" + en("will") + " を使うときは、" + en("will") + " + 動詞の原形にします。",
          en("I " + key("will visit") + " my aunt next week."),
          en("will") + " のあとに " + en("ing") + " 形や " + en("am") + "、" + en("going to") + " は続けません。"
        ]
      }
    ]
  });

  // =====================================================================
  // 2-2 助動詞
  // =====================================================================
  JHE.register("g2-modals", {
    points: [
      "助動詞は動詞の前に置いて、意味をそえます。" + rule("助動詞のあとの動詞は原形") + "で、主語が三人称単数でも助動詞に " + en("s") + " はつけません。" + en("must") + "(〜しなければならない)、" + en("should") + "(〜すべきだ、〜したほうがよい)、" + en("may") + "(〜してもよい、〜かもしれない)。",
      rule(en("have to") + " + 動詞の原形") + "も「〜しなければならない」という意味です。主語が三人称単数なら " + en("has to") + "、過去の文なら " + en("had to") + " にします。否定文・疑問文は一般動詞と同じく " + en("do / does / did") + " を使います。" + en("Do you have to 〜?") + " — " + en("Yes, I do.") + "(はい、しなければなりません。)",
      rule(en("must not") + "(" + en("mustn't") + ")は「〜してはいけない」") + "(禁止)、" + rule(en("don't have to") + " は「〜する必要はない」") + "です。どちらも否定ですが、意味が大きくちがいます。",
      en("Will you 〜?") + " は「〜してくれますか」という依頼です。" + en("Sure.") + " や " + en("OK.") + "、" + en("Sorry, I can't.") + " などで答えます。" + en("May I 〜?") + " は「〜してもいいですか」と許可を求める言い方で、" + en("Sure.") + " や " + en("Yes, of course.") + " などで答えます。",
      en("Shall I 〜?") + " は「(わたしが)〜しましょうか」という申し出で、" + en("Yes, please.") + " か " + en("No, thank you.") + " で答えます。" + en("Shall we 〜?") + " は「(いっしょに)〜しましょうか」というさそいで、" + en("Yes, let's.") + " のように答えます。"
    ],
    chart: hyo({
      caption: "助動詞と意味",
      head: ["", "助動詞", "意味"],
      rows: [
        ["義務", "must", { ja: "〜しなければならない" }],
        ["助言", "should", { ja: "〜すべきだ" }],
        ["許可", "may", { ja: "〜してもよい" }],
        ["推量", "may", { ja: "〜かもしれない" }],
        ["可能", "can", { ja: "〜できる" }]
      ]
    }) +
      gojun([{ role: "主語", en: "You" }, { role: "must not", en: "must not", key: true }, { role: "動詞の原形", en: "run" }, { role: "そのほか", en: "here." }], "〜してはいけない(禁止)") +
      gojun([{ role: "主語", en: "You" }, { role: "don't have to", en: "don't have to", key: true }, { role: "動詞の原形", en: "run" }, { role: "そのほか", en: "here." }], "〜する必要はない"),
    example: {
      title: "次の文を、" + en("have to") + " を使ってほぼ同じ意味に書きかえなさい。" + eibun("Ken must clean his room.", "ケンは自分の部屋をそうじしなければなりません。"),
      steps: [
        en("must") + "(〜しなければならない)は、" + en("have to") + " でほぼ同じ意味を表せます。",
        "主語 " + en("Ken") + " は三人称単数なので、" + en("have") + " を " + en(key("has")) + " にします。",
        en("to") + " のあとの動詞は原形の " + en("clean") + " のままです。"
      ],
      result: en("Ken has to clean his room.")
    },
    fixed: [
      {
        id: "f1",
        text: Q_BLANK_JA,
        material: eibun("You " + B + " be quiet in the library.", "図書館では静かにしなければなりません。"),
        choices: ["must", "may", "can", "does"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "「〜しなければなりません」は " + en(key("must")) + " で表します。" + en("You " + fill("must") + " be quiet in the library."),
          en("may") + " は「〜してもよい」「〜かもしれない」、" + en("can") + " は「〜できる」という意味なので、日本語の文に合いません。",
          en("does") + " は、このように動詞の原形の前に置いてふつうの文を作ることはできません。"
        ]
      },
      {
        id: "f2",
        text: Q_BLANK,
        material: eibun("Emi " + B + " to get up early tomorrow.", "エミは明日、早起きしなければなりません。"),
        choices: ["have", "has", "must", "having"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          "空所のあとに " + en("to") + " があるので、" + en("have to") + " の形です。主語 " + en("Emi") + " は三人称単数なので " + en(key("has")) + " にします。",
          en("have") + " は主語 " + en("Emi") + " に合いません。",
          en("must") + " のあとに " + en("to") + " は置けません(" + en("Emi must get up 〜") + " なら正しい)。" + en("having") + " では文になりません。"
        ]
      },
      {
        id: "f3",
        text: Q_BLANK_PHRASE_JA,
        material: eibun("Tomorrow is Sunday. You " + B + " get up early.", "明日は日曜日です。早く起きる必要はありません。"),
        choices: ens(["must not", "doesn't have to", "don't have to", "have not to"]),
        answer: 2,
        explain: [
          "「〜する必要はない」は " + en(key("don't have to")) + " で表します。主語 " + en("You") + " には " + en("don't") + " を使います。",
          en("must not") + " は「〜してはいけない」という禁止なので、日本語の文と意味がちがいます。",
          en("doesn't") + " は主語 " + en("You") + " に合いません。" + en("have to") + " の否定は " + en("do") + " を使うので、" + en("have not to") + " とは言いません。"
        ]
      },
      {
        id: "f4",
        text: Q_BLANK_PHRASE_JA,
        material: eibun("You " + B + " swim in this river. It's dangerous.", "この川で泳いではいけません。危険です。"),
        choices: ens(["don't have to", "must not", "must", "should"]),
        answer: 1,
        explain: [
          "「〜してはいけません」(禁止)は " + en(key("must not")) + " で表します。",
          en("don't have to") + " は「〜する必要はない」という意味で、禁止ではありません。",
          en("must") + "(〜しなければならない)と " + en("should") + "(〜すべきだ)は否定の意味がないので、日本語の文に合いません。"
        ]
      },
      {
        id: "f5",
        text: Q_QUES,
        material: eibun("He has to wash the dishes.", "彼は皿を洗わなければなりません。"),
        choices: ens(["Does he has to wash the dishes?", "Is he have to wash the dishes?", "Do he have to wash the dishes?", "Does he have to wash the dishes?"]),
        answer: 3,
        explain: [
          en("have to") + " の疑問文は、一般動詞と同じく " + rule(en("Do / Does") + " を主語の前に置き、" + en("have") + " は原形") + "にします。",
          en(key("Does") + " he " + key("have") + " to wash the dishes?"),
          en("Does") + " を使ったら " + en("has") + " は " + en("have") + " にもどします。" + en("have to") + " の疑問文に be動詞は使いません。",
          "主語 " + en("he") + " には " + en("Do") + " ではなく " + en("Does") + " を使います。"
        ]
      },
      {
        id: "f6",
        text: Q_REPLY,
        material: kaiwa([["A", "Do I have to finish this today?", "わたしはこれを今日終えなければなりませんか。"], ["B", B, "いいえ、その必要はありません。"]]),
        choices: ens(["No, you don't have to.", "No, you aren't have to.", "No, I don't have to.", "No, you doesn't have to."]),
        answer: 0,
        explain: [
          en("Do I have to 〜?") + " には、" + en("do") + " を使って答えます。「その必要はありません」は " + en("No, you " + key("don't have to") + ".") + " です。",
          en("have to") + " の文に be動詞の " + en("aren't") + " は使いません。" + en("you") + " には " + en("doesn't") + " ではなく " + en("don't") + " を使います。",
          "A は自分(" + en("I") + ")のことをたずねているので、B は " + en("you") + " で答えます。" + en("No, I don't have to.") + " では B 自身のことになります。"
        ]
      },
      {
        id: "f7",
        text: Q_REPLY,
        material: kaiwa([["A", "Shall I open the window?", "窓を開けましょうか。"], ["B", B]]),
        choices: ens(["Yes, let's.", "Yes, I do.", "Yes, please.", "Yes, you are."]),
        answer: 2,
        explain: [
          en("Shall I 〜?") + "(〜しましょうか)は申し出なので、" + en(key("Yes, please.")) + "(はい、お願いします)のように答えます。",
          en("Yes, let's.") + " は、" + en("Shall we 〜?") + " や " + en("Let's 〜.") + " のさそいに答える言い方です。",
          en("Yes, I do.") + " と " + en("Yes, you are.") + " は、" + en("Shall I 〜?") + " への答えになりません。"
        ]
      },
      {
        id: "f8",
        text: "「窓を閉めてくれますか。」と相手にたのむ文はどれですか。",
        choices: ens(["Shall I close the window?", "Will you close the window?", "May I close the window?", "Must I close the window?"]),
        answer: 1,
        explain: [
          "「〜してくれますか」と依頼するときは、" + rule(en("Will you") + " + 動詞の原形") + "を使います。" + en(key("Will you") + " close the window?"),
          en("Shall I 〜?") + " は「(わたしが)〜しましょうか」という申し出です。",
          en("May I 〜?") + " は「〜してもいいですか」、" + en("Must I 〜?") + " は「〜しなければなりませんか」という意味で、どちらも自分のことをたずねる文です。"
        ]
      },
      {
        id: "f9",
        text: Q_REPLY,
        material: kaiwa([["A", "May I use this pen?", "このペンを使ってもいいですか。"], ["B", B]]),
        choices: ens(["Sure. Here you are.", "Yes, please.", "No, thank you.", "Yes, you are."]),
        answer: 0,
        explain: [
          en("May I 〜?") + "(〜してもいいですか)には、" + en(key("Sure.")) + "(いいですよ)などで答えます。" + en("Here you are.") + " は物をわたすときの「はい、どうぞ」です。",
          en("Yes, please.") + " と " + en("No, thank you.") + " は、" + en("Shall I 〜?") + " などの申し出に答える言い方です。",
          en("Yes, you are.") + " は、be動詞の疑問文への答えです。"
        ]
      },
      {
        id: "f10",
        text: Q_WRONG,
        choices: ens(["You should read this book.", "It may rain this afternoon.", "He musts go home now.", "We have to leave at seven."]),
        answer: 2,
        explain: [
          "助動詞は、主語が三人称単数でも形が変わりません。",
          seigo("He musts go home now.", "He " + key("must") + " go home now."),
          "ほかの3つは、" + en("should") + "、" + en("may") + " のあとに原形、" + en("have to") + " のあとに原形が続いていて、正しい文です。"
        ]
      },
      {
        id: "f11",
        text: Q_EN_TO_JA,
        material: eibun("You don't have to bring lunch tomorrow."),
        choices: [
          "明日は昼食を持ってきてはいけません。",
          "明日は昼食を持ってくる必要はありません。",
          "明日は昼食を持ってこなければなりません。",
          "明日は昼食を持ってきたほうがいいです。"
        ],
        answer: 1,
        explain: [
          en("don't have to") + " は「〜する必要はない」という意味です。",
          "「〜してはいけません」は " + en("must not") + " を使って表します。",
          "「〜しなければなりません」は " + en("have to") + " や " + en("must") + "、「〜したほうがいいです」は " + en("should") + " で表します。"
        ]
      },
      {
        id: "f12",
        text: Q_EN_TO_JA,
        material: eibun("Mr. Brown may be in the teachers' room now."),
        choices: [
          "ブラウン先生は今、職員室にいるかもしれません。",
          "ブラウン先生は今、職員室にいるべきです。",
          "ブラウン先生は今、職員室にいなければなりません。",
          "ブラウン先生は今、職員室にいません。"
        ],
        answer: 0,
        explain: [
          en("may") + " には「〜かもしれない」という意味があります。" + en("may be") + " で「〜にいるかもしれない」です。",
          "「〜すべきです」は " + en("should") + "、「〜しなければなりません」は " + en("must") + " や " + en("have to") + " で表します。",
          en("not") + " がないので、否定の意味にはなりません。"
        ]
      },
      {
        id: "f13",
        text: "「わたしたちは毎日、朝食を食べるべきです。」を表す文はどれですか。",
        choices: ens(["We should eats breakfast every day.", "We eat should breakfast every day.", "We should to eat breakfast every day.", "We should eat breakfast every day."]),
        answer: 3,
        explain: [
          "「〜すべきです」は " + rule(en("should") + " + 動詞の原形") + "で表します。助動詞は動詞の前に置きます。",
          en("We " + key("should eat") + " breakfast every day."),
          en("should") + " のあとの動詞は原形なので、" + en("eats") + " や " + en("to eat") + " にはしません。" + en("should") + " を動詞のあとに置くこともできません。"
        ]
      },
      {
        id: "f14",
        text: "次の文を、" + en("must") + " を使ってほぼ同じ意味に書きかえたものはどれですか。",
        material: eibun("Don't run in the hallway.", "ろうかを走ってはいけません。"),
        choices: ens(["You don't have to run in the hallway.", "You must run in the hallway.", "You must not run in the hallway.", "You must not running in the hallway."]),
        answer: 2,
        explain: [
          en("Don't 〜.") + "(〜してはいけません)は、" + en("You must not 〜.") + " でほぼ同じ意味を表せます。",
          en("You " + key("must not") + " run in the hallway."),
          en("don't have to") + " は「〜する必要はない」、" + en("must") + " だけでは「〜しなければならない」になり、意味がちがいます。",
          en("must not") + " のあとの動詞は原形です。" + en("ing") + " 形にはしません。"
        ]
      },
      {
        id: "f15",
        text: Q_BLANK,
        material: eibun("I " + B + " to stay home yesterday.", "わたしは昨日、家にいなければなりませんでした。"),
        choices: ["had", "have", "has", "must"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "「〜しなければならなかった」と過去のことを言うときは、" + en(key("had to")) + " を使います。",
          en("have") + " と " + en("has") + " は現在の形なので、" + en("yesterday") + " と合いません。",
          en("must") + " のあとに " + en("to") + " は置けません。"
        ]
      }
    ]
  });

  // =====================================================================
  // 2-3 There is / are
  // =====================================================================
  JHE.register("g2-there-is", {
    points: [
      "「(場所)に〜があります・います」は、" + rule(en("There is / There are") + " + 名詞 + 場所") + "で表します。場所は " + en("in the box") + "、" + en("on the desk") + " のように、ふつう文の最後に置きます。" + en("There is") + " は " + en("There's") + " と短くできます。",
      "be動詞は、" + rule("あとに続く名詞") + "で決まります。1つ(1人)なら " + en("is") + "、複数なら " + en("are") + " です。" + en("water") + " や " + en("milk") + " のような数えられない名詞には " + en("is") + " を使います。過去の文は " + en("was / were") + " です。",
      "否定文は、be動詞のあとに " + en("not") + " を置きます。" + en("There isn't a 〜.") + "、" + en("There aren't any 〜.") + "(1つも〜ない)のように言います。" + en("There are no 〜.") + " も「〜が1つもない」という意味です。",
      "疑問文は、be動詞を " + en("there") + " の前に出します。" + en("Is there 〜?") + " には " + en("Yes, there is. / No, there isn't.") + " で答えます。数をたずねるときは " + en("How many") + " + 複数形 + " + en("are there 〜?") + " です。",
      en("There is / are") + " は、相手がまだ知らないものが「ある・いる」と伝える文です。" + en("my bag") + " や " + en("the cat") + " のように、相手もわかっているものについては、ふつう " + en("My bag is on the desk.") + " のように言います。"
    ],
    chart: hyo({
      caption: "あとの名詞と be動詞",
      head: ["", "名詞", "現在", "過去"],
      rows: [
        ["1つ", "a cat", "is", "was"],
        ["複数", "cats", "are", "were"],
        ["水など", "water", "is", "was"]
      ],
      compact: true
    }) +
      gojun([{ role: "There", en: "There" }, { role: "be動詞", en: "is", key: true }, { role: "名詞", en: "a cat", ja: "ネコが" }, { role: "場所", en: "under the table.", ja: "テーブルの下に" }], "ふつうの文") +
      gojun([{ role: "be動詞", en: "Is", key: true }, { role: "there", en: "there" }, { role: "名詞", en: "a cat" }, { role: "場所", en: "under the table?" }], "疑問文"),
    example: {
      title: "空所に入る be動詞を答えなさい。" + eibun("There " + B + " two parks near my house.", "わたしの家の近くには公園が2つあります。"),
      steps: [
        en("There is / are") + " の文では、be動詞のあとの名詞を見ます。",
        "あとの名詞は " + en("two parks") + "(2つの公園)で、複数です。",
        "現在の文で、複数の名詞には " + en(key("are")) + " を使います。"
      ],
      result: en("are") + "(" + en("There are two parks near my house.") + ")"
    },
    fixed: [
      {
        id: "f1",
        text: Q_BLANK,
        material: eibun("There " + B + " a big tree in the park.", "公園には大きな木が1本あります。"),
        choices: ["is", "are", "am", "be"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "あとの名詞 " + en("a big tree") + " は1つなので、" + en(key("is")) + " を使います。",
          en("are") + " は、あとの名詞が複数のときに使います。",
          en("am") + " は " + en("I") + " だけに使い、" + en("be") + " は原形なのでこのままでは使えません。"
        ]
      },
      {
        id: "f2",
        text: Q_BLANK,
        material: eibun("There " + B + " three cats in the box.", "箱の中にネコが3びきいます。"),
        choices: ["is", "am", "are", "be"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          "あとの名詞 " + en("three cats") + " は複数なので、" + en(key("are")) + " を使います。",
          en("is") + " は、あとの名詞が1つのときに使います。",
          en("am") + " は " + en("I") + " だけに使い、" + en("be") + " は原形なのでこのままでは使えません。"
        ]
      },
      {
        id: "f3",
        text: Q_BLANK,
        material: eibun("There " + B + " some milk in the glass.", "コップに牛乳が少し入っています。"),
        choices: ["are", "is", "were", "am"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          en("milk") + "(牛乳)は数えられない名詞です。数えられない名詞には、1つのときと同じく " + en(key("is")) + " を使います。",
          en("some") + "(いくらかの)がついていても、" + en("milk") + " は複数にはなりません。" + en("are") + " と " + en("were") + " は使えません。",
          en("am") + " は " + en("I") + " だけに使います。"
        ]
      },
      {
        id: "f4",
        text: Q_BLANK,
        material: eibun("There " + B + " a lot of people at the station yesterday.", "昨日、駅にはたくさんの人がいました。"),
        choices: ["was", "were", "are", "is"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          en("yesterday") + " があるので過去の文です。あとの名詞 " + en("a lot of people") + "(たくさんの人)は複数なので、" + en(key("were")) + " を使います。",
          en("was") + " は、あとの名詞が1つのときの過去の形です。",
          en("are") + " と " + en("is") + " は現在の形なので、" + en("yesterday") + " と合いません。"
        ]
      },
      {
        id: "f5",
        text: Q_NEG,
        material: eibun("There are some books on the desk.", "机の上に本が何冊かあります。"),
        choices: ens(["There not are any books on the desk.", "There don't are any books on the desk.", "There isn't any books on the desk.", "There aren't any books on the desk."]),
        answer: 3,
        explain: [
          en("There are") + " の否定文は、" + en("are") + " のあとに " + en("not") + " を置きます。否定文では、" + en("some") + " はふつう " + en("any") + " にします。",
          en("There " + key("aren't any") + " books on the desk.") + "(机の上に本は1冊もありません。)",
          en("not") + " を be動詞の前に置いたり、" + en("don't") + " を使ったりはしません。",
          en("books") + " は複数なので、" + en("isn't") + " は合いません。"
        ]
      },
      {
        id: "f6",
        text: Q_QUES,
        material: eibun("There is a convenience store near here.", "この近くにコンビニエンスストアがあります。"),
        choices: ens(["Is there a convenience store near here?", "Does there is a convenience store near here?", "Is a convenience store there near here?", "Are there a convenience store near here?"]),
        answer: 0,
        explain: [
          en("There is") + " の疑問文は、" + rule("be動詞を " + en("there") + " の前に出します") + "。",
          en(key("Is there") + " a convenience store near here?"),
          "be動詞の文なので " + en("Does") + " は使いません。" + en("there") + " は be動詞のすぐあとに置きます。",
          "あとの名詞 " + en("a convenience store") + " は1つなので、" + en("Are") + " は合いません。"
        ]
      },
      {
        id: "f7",
        text: Q_REPLY,
        material: kaiwa([["A", "Is there a bookstore near the station?", "駅の近くに書店はありますか。"], ["B", B]]),
        choices: ens(["Yes, it is.", "Yes, there is.", "Yes, there are.", "Yes, I do."]),
        answer: 1,
        explain: [
          en("Is there 〜?") + " には、" + en("there") + " と be動詞を使って " + en(key("Yes, there is.")) + " と答えます。",
          en("Yes, it is.") + " は " + en("Is it 〜?") + " への答えです。",
          "質問は " + en("Is") + " でたずねているので " + en("are") + " は合いません。be動詞の疑問文に " + en("do") + " では答えません。"
        ]
      },
      {
        id: "f8",
        text: Q_REPLY,
        material: kaiwa([["A", "Are there any students in the gym?", "体育館に生徒はいますか。"], ["B", B]]),
        choices: ens(["No, there isn't.", "No, there don't.", "No, I'm not.", "No, there aren't."]),
        answer: 3,
        explain: [
          en("Are there 〜?") + " には、" + en("there") + " と " + en("are") + " を使って答えます。" + en("No, there " + key("aren't") + "."),
          en("isn't") + " は、質問の " + en("Are") + " と合いません。",
          "be動詞の疑問文に " + en("don't") + " は使いません。" + en("No, I'm not.") + " は " + en("Are you 〜?") + " への答えです。"
        ]
      },
      {
        id: "f9",
        text: Q_REPLY,
        material: kaiwa([["A", "How many students are there in your class?", "あなたのクラスには生徒が何人いますか。"], ["B", B]]),
        choices: ens(["Yes, there are.", "There is thirty-five.", "There are thirty-five.", "They are in my class."]),
        answer: 2,
        explain: [
          en("How many 〜 are there?") + " は数をたずねる文なので、" + en(key("There are thirty-five.")) + "(35人います)のように数を答えます。",
          "疑問詞のある疑問文には、" + en("Yes / No") + " では答えません。",
          en("There is thirty-five.") + " は、" + en("thirty-five") + " が複数なので " + en("is") + " ではなく " + en("are") + " です。" + en("They are in my class.") + " は数を答えていません。"
        ]
      },
      {
        id: "f10",
        text: "「あなたの町には図書館がいくつありますか。」を、正しい語順で表した文はどれですか。",
        choices: ens(["How many libraries are there in your town?", "How many libraries there are in your town?", "How many library are there in your town?", "How many libraries is there in your town?"]),
        answer: 0,
        explain: [
          "数をたずねるときは、" + rule(en("How many") + " + 複数形 + " + en("are there") + " 〜?") + "の順にします。",
          gojun([
            { role: "How many + 複数形", en: "How many libraries", key: true },
            { role: "be動詞", en: "are" },
            { role: "there", en: "there" },
            { role: "場所", en: "in your town?" }
          ]),
          "疑問文なので " + en("are") + " を " + en("there") + " の前に出します。" + en("How many") + " のあとは複数形 " + en("libraries") + " で、be動詞は " + en("are") + " です。"
        ]
      },
      {
        id: "f11",
        text: Q_WRONG,
        choices: ens(["There are many stars in the sky.", "There is a cup on the table.", "Is there a park near your school?", "There is two dogs in the yard."]),
        answer: 3,
        explain: [
          "あとの名詞 " + en("two dogs") + " は複数なので、be動詞は " + en("are") + " にします。",
          seigo("There is two dogs in the yard.", "There " + key("are") + " two dogs in the yard."),
          "ほかの3つは、あとの名詞と be動詞が正しく組み合わさっています。"
        ]
      },
      {
        id: "f12",
        text: "「机の下にネコが1ぴきいます。」を表す文はどれですか。",
        choices: ens(["There are a cat under the desk.", "There is a cat on the desk.", "There is a cat under the desk.", "There is cats under the desk."]),
        answer: 2,
        explain: [
          "「〜がいます」は " + en("There is / are") + " で表します。ネコは1ぴきなので " + en("There is a cat") + "、「机の下に」は " + en("under the desk") + " です。",
          en("There " + key("is") + " a cat " + key("under") + " the desk."),
          en("a cat") + " は1ぴきなので、" + en("are") + " や複数形の " + en("cats") + " は使いません。",
          en("on the desk") + " は「机の上に」です。"
        ]
      },
      {
        id: "f13",
        text: Q_EN_TO_JA,
        material: eibun("There were no clouds in the sky this morning."),
        choices: [
          "今朝、空には雲が1つもありませんでした。",
          "今朝、空には雲が少しありました。",
          "今、空には雲が1つもありません。",
          "今朝、空に雲はありましたか。"
        ],
        answer: 0,
        explain: [
          en("There were no 〜") + " は「〜が1つもなかった」という意味です。" + en("no") + " があるので否定の意味になります。",
          en("were") + " は過去の形で、" + en("this morning") + "(今朝)のことです。",
          "疑問文なら " + en("Were there 〜?") + " の語順になります。"
        ]
      },
      {
        id: "f14",
        text: Q_REPLY,
        material: kaiwa([["A", "Were there many people at the concert?", "コンサートにはたくさんの人がいましたか。"], ["B", B]]),
        choices: ens(["Yes, there are.", "Yes, there was.", "Yes, there were.", "Yes, it was."]),
        answer: 2,
        explain: [
          en("Were there 〜?") + " には、" + en("there") + " と " + en("were") + " を使って " + en(key("Yes, there were.")) + " と答えます。",
          en("are") + " は現在の形なので、過去のことをたずねる質問と合いません。",
          en("was") + " は質問の " + en("Were") + " と合いません。" + en("Yes, it was.") + " は " + en("Was it 〜?") + " への答えです。"
        ]
      },
      {
        id: "f15",
        text: Q_BLANK,
        material: eibun("Is there " + B + " water in the bottle?", "びんに水は入っていますか。"),
        choices: ["any", "many", "a", "an"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "疑問文で「いくらかの」と言うときは、ふつう " + en(key("any")) + " を使います。" + en("water") + " のような数えられない名詞にも使えます。",
          en("many") + " は、数えられる名詞の複数形といっしょに使います。",
          en("water") + " は数えられない名詞なので、" + en("a") + " や " + en("an") + " はつけません。"
        ]
      }
    ]
  });

  // =====================================================================
  // 2-4 文型
  // =====================================================================
  JHE.register("g2-sentence-patterns", {
    points: [
      rule(en("look") + " + 形容詞") + "で「〜に見える」という意味です。" + en("You look happy.") + "(あなたはうれしそうに見えます。)" + en("look") + " のあとの語は、主語のようすを表すので、" + en("happily") + " のような形にはしません。",
      "同じ形をとる動詞に、" + en("sound") + "(〜に聞こえる・思える)、" + en("become") + "(〜になる)、" + en("get") + "(〜になる)、" + en("feel") + "(〜と感じる)などがあります。" + en("become") + " は名詞も続けられます。" + en("She became a doctor.") + " 名詞が続いて「〜のように見える」と言うときは " + en("look like") + " + 名詞です。",
      rule(en("give") + " + 人 + 物") + "で「人に物をあたえる」という意味です。" + en("show") + "(見せる)、" + en("tell") + "(伝える)、" + en("teach") + "(教える)、" + en("send") + "(送る)、" + en("buy") + "(買う)なども、「人 + 物」の順に続けられます。",
      "「人 + 物」は、" + rule("「物 + " + en("to / for") + " + 人」") + "に書きかえられます。" + en("give / show / tell / teach / send") + " は " + en("to") + "、" + en("buy / make / cook") + " は " + en("for") + " を使います。" + en("I gave him a book.") + " → " + en("I gave a book to him."),
      "人を代名詞で言うときは、" + en("me / him / her / us / them") + " の形(「〜を・〜に」の形)にします。" + en("Please tell me your name.")
    ],
    chart: gojun([{ role: "主語", en: "She", ja: "彼女は" }, { role: "動詞", en: "looks", ja: "見える" }, { role: "形容詞", en: "happy.", ja: "うれしそうに", key: true }], en("look") + " + 形容詞") +
      gojun([{ role: "主語", en: "My father", ja: "父は" }, { role: "動詞", en: "gave", ja: "くれた" }, { role: "人", en: "me", ja: "わたしに", key: true }, { role: "物", en: "a watch.", ja: "時計を", key: true }], en("give") + " + 人 + 物") +
      gojun([{ role: "主語", en: "My father" }, { role: "動詞", en: "gave" }, { role: "物", en: "a watch", key: true }, { role: "to + 人", en: "to me.", key: true }], en("give") + " + 物 + " + en("to") + " + 人") +
      hyo({
        caption: "書きかえで使う前置詞",
        head: ["", "動詞", "前置詞"],
        rows: [
          ["あげる", "give", "to"],
          ["見せる", "show", "to"],
          ["伝える", "tell", "to"],
          ["教える", "teach", "to"],
          ["送る", "send", "to"],
          ["買う", "buy", "for"],
          ["作る", "make", "for"]
        ]
      }),
    example: {
      title: "次の文を、" + en("for") + " を使ってほぼ同じ意味に書きかえなさい。" + eibun("My uncle bought me a bike.", "おじはわたしに自転車を買ってくれました。"),
      steps: [
        "「人 + 物」の順の文は、「物 + 前置詞 + 人」の順に書きかえられます。",
        "物の " + en("a bike") + " を動詞のすぐあとに置き、人の " + en("me") + " をそのあとに置きます。",
        en("buy") + "(" + en("bought") + ")は " + en(key("for")) + " を使います。"
      ],
      result: en("My uncle bought a bike for me.")
    },
    fixed: [
      {
        id: "f1",
        text: Q_BLANK_PHRASE,
        material: eibun("You look " + B + " today.", "あなたは今日、うれしそうですね。"),
        choices: ["happy", "happily", "be happy", "is happy"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          rule(en("look") + " + 形容詞") + "で「〜に見える」です。形容詞の " + en(key("happy")) + " を使います。",
          en("happily") + "(うれしそうに)は動詞のようすを表す語なので、" + en("look") + " のあとに置いて主語のようすを表すことはできません。",
          en("look") + " のあとに " + en("be") + " や " + en("is") + " は続けません。"
        ]
      },
      {
        id: "f2",
        text: Q_BLANK_PHRASE,
        material: kaiwa([["A", "Let's go to the new museum this weekend.", "この週末、新しい博物館に行こうよ。"], ["B", "That " + B + " great.", "それはいいね。"]]),
        choices: ["sound", "sounds", "is sound", "hears"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          "相手の話を聞いて「それは〜に思える」と言うときは、" + rule(en("sound") + " + 形容詞") + "を使います。主語 " + en("That") + " は三人称単数なので " + en(key("sounds")) + " です。",
          en("sound") + " は主語 " + en("That") + " に合いません。" + en("is sound") + " のように be動詞といっしょには使いません。",
          en("hear") + " は「〜を聞く」という意味で、あとに形容詞を続けて「〜に聞こえる」とは言いません。"
        ]
      },
      {
        id: "f3",
        text: Q_BLANK,
        material: eibun("She " + B + " a doctor last year.", "彼女は昨年、医者になりました。"),
        choices: ["become", "becomes", "became", "becoming"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          en("last year") + "(昨年)があるので、過去の文です。" + en("become") + " の過去形は " + en(key("became")) + " です。",
          en("become") + " と " + en("becomes") + " は現在の形なので、" + en("last year") + " と合いません。",
          en("becoming") + " は " + en("ing") + " 形なので、be動詞がないと文になりません。"
        ]
      },
      {
        id: "f4",
        text: Q_WRONG,
        choices: ens(["She looks tired.", "He looks happily.", "The song sounds nice.", "It got cold at night."]),
        answer: 1,
        explain: [
          en("look") + " のあとには、主語のようすを表す形容詞を置きます。",
          seigo("He looks happily.", "He looks " + key("happy") + "."),
          en("looks tired") + "(疲れているように見える)、" + en("sounds nice") + "(すてきに聞こえる)、" + en("got cold") + "(寒くなった)は、どれも動詞 + 形容詞の正しい形です。"
        ]
      },
      {
        id: "f5",
        text: Q_BLANK,
        material: eibun("That cloud looks " + B + " a fish.", "あの雲は魚のように見えます。"),
        choices: ["to", "for", "as", "like"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          "名詞を続けて「〜のように見える」と言うときは、" + rule(en("look like") + " + 名詞") + "を使います。" + en("That cloud looks " + fill("like") + " a fish."),
          en("look") + " のあとに名詞を続けるとき、" + en("to") + "、" + en("for") + "、" + en("as") + " は使いません。"
        ]
      },
      {
        id: "f6",
        text: "「わたしは彼にわたしの写真を見せました。」を表す文はどれですか。",
        choices: ens(["I showed my pictures him.", "I showed he my pictures.", "I showed him my pictures.", "I showed him to my pictures."]),
        answer: 2,
        explain: [
          "「人に物を見せる」は " + rule(en("show") + " + 人 + 物") + "の順です。",
          en("I showed " + key("him") + " " + key("my pictures") + "."),
          "物を先に置くなら " + en("to") + " が必要です(" + en("I showed my pictures to him.") + ")。",
          "動詞のあとの人は " + en("him") + " の形にします。" + en("him to my pictures") + " では「彼をわたしの写真に」となり、意味が通りません。"
        ]
      },
      {
        id: "f7",
        text: "「田中先生はわたしたちに英語を教えています。」を、正しい語順で表した文はどれですか。",
        choices: ens(["Ms. Tanaka teaches us English.", "Ms. Tanaka teaches English us.", "Ms. Tanaka teaches we English.", "Ms. Tanaka teach us English."]),
        answer: 0,
        explain: [
          "「人に物を教える」は " + rule(en("teach") + " + 人 + 物") + "の順です。",
          gojun([
            { role: "主語", en: "Ms. Tanaka" },
            { role: "動詞", en: "teaches" },
            { role: "人", en: "us", key: true },
            { role: "物", en: "English.", key: true }
          ]),
          "人と物の順を逆にすることはできません。動詞のあとの人は " + en("we") + " ではなく " + en("us") + " です。",
          "主語 " + en("Ms. Tanaka") + " は三人称単数なので、" + en("teach") + " ではなく " + en("teaches") + " です。"
        ]
      },
      {
        id: "f8",
        text: "次の文を、ほぼ同じ意味に書きかえたものはどれですか。",
        material: eibun("My father bought me a new bike.", "父はわたしに新しい自転車を買ってくれました。"),
        choices: ens(["My father bought a new bike to me.", "My father bought a new bike for me.", "My father bought a new bike me.", "My father bought me for a new bike."]),
        answer: 1,
        explain: [
          en("buy") + "(" + en("bought") + ")の文を「物 + 前置詞 + 人」の順にするときは、" + rule(en("for")) + " を使います。",
          en("My father bought a new bike " + key("for") + " me."),
          en("buy") + " には " + en("to") + " は使いません。前置詞がないと、物のあとに人を置けません。",
          en("me for a new bike") + " は、人と物の順がちがいます。"
        ]
      },
      {
        id: "f9",
        text: "次の文を、ほぼ同じ意味に書きかえたものはどれですか。",
        material: eibun("Emi gave her brother a cake.", "エミは弟にケーキをあげました。"),
        choices: ens(["Emi gave a cake her brother.", "Emi gave a cake at her brother.", "Emi gave to a cake her brother.", "Emi gave a cake to her brother."]),
        answer: 3,
        explain: [
          en("give") + "(" + en("gave") + ")の文を「物 + 前置詞 + 人」の順にするときは、" + rule(en("to")) + " を使います。",
          en("Emi gave a cake " + key("to") + " her brother."),
          "前置詞がないと、物のあとに人を置けません。" + en("give") + " には " + en("at") + " は使いません。",
          en("to") + " は人の前に置きます。物の前に置くことはできません。"
        ]
      },
      {
        id: "f10",
        text: Q_BLANK,
        material: eibun("Please tell " + B + " your phone number.", "わたしにあなたの電話番号を教えてください。"),
        choices: ["me", "I", "my", "mine"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          rule(en("tell") + " + 人 + 物") + "の「人」は、「〜に」の形にします。" + en("I") + " の「〜に」の形は " + en(key("me")) + " です。",
          en("I") + " は主語の形、" + en("my") + " は「わたしの」、" + en("mine") + " は「わたしのもの」で、動詞のすぐあとの「人」には使えません。"
        ]
      },
      {
        id: "f11",
        text: Q_EN_TO_JA,
        material: eibun("My grandmother sent me a letter."),
        choices: [
          "わたしは祖母に手紙を送りました。",
          "祖母はわたしの手紙を送りました。",
          "祖母はわたしに手紙を送ってくれました。",
          "祖母はわたしから手紙をもらいました。"
        ],
        answer: 2,
        explain: [
          rule(en("send") + " + 人 + 物") + "は「人に物を送る」です。" + en("sent") + " は " + en("send") + " の過去形です。",
          "主語は " + en("My grandmother") + "(祖母)で、" + en("me") + " は「わたしに」、" + en("a letter") + " は「手紙を」です。",
          "「わたしは」が主語の文や、「わたしの手紙」「わたしから」という意味にはなりません。"
        ]
      },
      {
        id: "f12",
        text: Q_BLANK,
        material: eibun("I'll cook dinner " + B + " my family tonight.", "今夜はわたしが家族に夕食を作ります。"),
        choices: ["to", "for", "of", "on"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          en("cook") + "(料理する)は、「物 + 前置詞 + 人」の順で " + rule(en("for")) + " を使います。" + en("I'll cook dinner " + fill("for") + " my family tonight."),
          en("cook") + " や " + en("make") + "、" + en("buy") + " には " + en("to") + " を使いません。",
          en("of") + " と " + en("on") + " は、この形では使いません。"
        ]
      },
      {
        id: "f13",
        text: Q_BLANK,
        material: eibun("Can you show your notebook " + B + " me?", "あなたのノートをわたしに見せてくれますか。"),
        choices: ["to", "for", "at", "in"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("show") + "(見せる)は、「物 + 前置詞 + 人」の順で " + rule(en("to")) + " を使います。" + en("Can you show your notebook " + fill("to") + " me?"),
          en("for") + " は " + en("buy / make / cook") + " などに使います。",
          en("at") + " と " + en("in") + " は、この形では使いません。"
        ]
      },
      {
        id: "f14",
        text: Q_EN_TO_JA,
        material: eibun("It's getting warm."),
        choices: [
          "暖かいものを手に入れています。",
          "だんだん暖かくなってきています。",
          "暖かそうに見えます。",
          "暖かくなるでしょう。"
        ],
        answer: 1,
        explain: [
          rule(en("get") + " + 形容詞") + "で「〜になる」という意味です。" + en("is getting warm") + " は進行形なので、「暖かくなってきている」となります。",
          en("get") + " のあとに形容詞が続いているので、「手に入れる」という意味ではありません。",
          "「暖かそうに見えます」は " + en("It looks warm.") + "、「暖かくなるでしょう」は " + en("It will get warm.") + " などで表します。"
        ]
      },
      {
        id: "f15",
        text: Q_REPLY,
        material: kaiwa([["A", "What did your uncle give you for your birthday?", "おじさんは誕生日にあなたに何をくれましたか。"], ["B", B]]),
        choices: ens(["He gave a watch me.", "I gave him a watch.", "He gave me to a watch.", "He gave me a watch."]),
        answer: 3,
        explain: [
          "おじさんがくれた物を、" + rule(en("give") + " + 人 + 物") + "の順で答えます。" + en("He gave " + key("me a watch") + ".") + "(時計をくれました。)",
          en("a watch me") + " は、人と物の順がちがいます。",
          en("I gave him a watch.") + " は「わたしが彼に時計をあげた」となり、質問に合いません。" + en("me to a watch") + " は意味が通りません。"
        ]
      }
    ]
  });

  // =====================================================================
  // 2-5 接続詞
  // =====================================================================
  JHE.register("g2-conjunctions", {
    points: [
      en("and") + "(そして、〜と)、" + en("but") + "(しかし)、" + en("or") + "(または)、" + en("so") + "(だから)は、語と語や文と文をつなぎます(" + en("so") + " は文と文だけ)。" + en("so") + " は「理由, " + en("so") + " 結果」の順で使います。" + en("I was tired, so I went to bed early."),
      en("when") + "(〜するとき)、" + en("if") + "(もし〜ならば)、" + en("because") + "(〜なので)は、" + rule("「接続詞 + 主語 + 動詞」のまとまり") + "を作り、ほかの文につなぎます。このまとまりは文の前にも後ろにも置けます。前に置くときは、まとまりの終わりにコンマを打ちます。",
      rule(en("when") + " や " + en("if") + " のまとまりの中は、未来のことでも現在形") + "で表します。" + en("If it " + key("rains") + " tomorrow, I'll stay home.") + "(明日雨が降ったら、家にいます。)" + en("will rain") + " とはしません。",
      en("Why 〜?") + " とたずねられたら、" + en("Because 〜.") + " で理由を答えられます。" + en("because") + " のまとまりは理由、" + en("so") + " のあとは結果を表すので、同じ内容を書きかえるときは、つなぐ順番に注意します。",
      rule(en("think / know / hope") + " + " + en("that") + " + 主語 + 動詞") + "で、「〜だと思う・知っている・望む」という意味です。この " + en("that") + " は省略できます。" + en("I think (that) Ken is right.") + "(ケンは正しいと思います。)"
    ],
    chart: hyo({
      caption: "接続詞と意味",
      head: ["", "接続詞"],
      rows: [
        ["そして", "and"],
        ["しかし", "but"],
        ["または", "or"],
        ["だから", "so"],
        ["〜とき", "when"],
        ["もし", "if"],
        ["〜ので", "because"],
        ["〜こと", "that"]
      ]
    }) +
      gojun([
        { role: "If", en: "If", key: true },
        { role: "主語 + 現在形", en: "it rains", ja: "雨が降ったら", key: true },
        { role: "そのほか", en: "tomorrow,", ja: "明日" },
        { role: "文", en: "I'll stay home.", ja: "家にいます" }
      ], en("when / if") + " の中は現在形"),
    example: {
      title: "空所に入る語を答えなさい。" + eibun("If it " + B + " sunny tomorrow, we will play tennis.", "明日晴れたら、わたしたちはテニスをします。"),
      steps: [
        "空所は " + en("if") + " のまとまり(" + en("If it 〜 tomorrow") + ")の中にあります。",
        en("tomorrow") + " があるので未来のことですが、" + en("if") + " のまとまりの中は現在形で表します。",
        "主語 " + en("it") + " に合う be動詞の現在形は " + en(key("is")) + " です。"
      ],
      result: en("is") + "(" + en("If it is sunny tomorrow, we will play tennis.") + ")"
    },
    fixed: [
      {
        id: "f1",
        text: Q_BLANK_JA,
        material: eibun("I like dogs, " + B + " my sister likes cats.", "わたしは犬が好きですが、姉はネコが好きです。"),
        choices: ["but", "so", "or", "because"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "「〜ですが」と、反対の内容をつなぐのは " + en(key("but")) + "(しかし)です。",
          en("so") + " は「だから」、" + en("because") + " は「〜なので」で、理由と結果をつなぐ語です。",
          en("or") + " は「または」で、日本語の文に合いません。"
        ]
      },
      {
        id: "f2",
        text: Q_BLANK_JA,
        material: eibun("Which do you want, tea " + B + " coffee?", "紅茶とコーヒーのどちらがほしいですか。"),
        choices: ["and", "or", "but", "so"],
        answer: 1,
        explain: [
          en("Which 〜, A or B?") + " で「AとBのどちらが〜か」とたずねます。" + en(key("or")) + "(または)を使います。",
          en("and") + " は「〜と…」と両方を合わせるときに使い、「どちらか」をたずねる形にはなりません。",
          en("but") + " は「しかし」、" + en("so") + " は「だから」で、「どちらか」をたずねる形になりません。"
        ],
        choiceLayout: "grid"
      },
      {
        id: "f3",
        text: Q_BLANK_JA,
        material: eibun("It was raining, " + B + " we stayed home.", "雨が降っていたので、わたしたちは家にいました。"),
        choices: ["but", "or", "so", "if"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          "「雨が降っていた」が理由、「家にいた」が結果です。「理由, " + en("so") + " 結果」の順なので " + en(key("so")) + "(だから)を使います。",
          en("but") + " は「しかし」、" + en("or") + " は「または」で、日本語の文に合いません。",
          en("if") + " は「もし〜ならば」で、すでに起きたことの理由を表しません。"
        ]
      },
      {
        id: "f4",
        text: Q_BLANK_PHRASE,
        material: eibun("If it " + B + " tomorrow, I'll stay home.", "明日雨が降ったら、わたしは家にいます。"),
        choices: ["rains", "will rain", "rained", "raining"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          rule(en("if") + " のまとまりの中は、未来のことでも現在形") + "にします。主語 " + en("it") + " に合わせて " + en(key("rains")) + " です。",
          en("tomorrow") + " があっても、" + en("if") + " の中に " + en("will rain") + " は使いません。",
          en("rained") + " は過去形なので明日のことに合わず、" + en("raining") + " は be動詞がないと使えません。"
        ]
      },
      {
        id: "f5",
        text: Q_BLANK_PHRASE,
        material: eibun("When my father " + B + " home tonight, I'll show him my picture.", "今夜父が帰ってきたら、父にわたしの絵を見せます。"),
        choices: ["will come", "came", "comes", "coming"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          rule(en("when") + " のまとまりの中は、未来のことでも現在形") + "にします。主語 " + en("my father") + " は三人称単数なので " + en(key("comes")) + " です。",
          en("tonight") + " のことでも、" + en("when") + " の中に " + en("will come") + " は使いません。",
          en("came") + " は過去形なので今夜のことに合わず、" + en("coming") + " は be動詞がないと使えません。"
        ]
      },
      {
        id: "f6",
        text: Q_WRONG,
        choices: ens(["If you are free, please help me.", "I'll call you when I will get home.", "I know that he is busy.", "She was sick, so she didn't go to school."]),
        answer: 1,
        explain: [
          en("when") + " のまとまりの中は、未来のことでも現在形で表します。",
          seigo("I'll call you when I will get home.", "I'll call you when I " + key("get") + " home."),
          "ほかの3つは、" + en("if") + " の中が現在形、" + en("know that") + " + 主語 + 動詞、「理由, " + en("so") + " 結果」の形で、正しい文です。"
        ]
      },
      {
        id: "f7",
        text: "「わたしはエミが正しいと思います。」を表す文はどれですか。",
        choices: ens(["I think Emi right.", "I think Emi is right.", "I think that is Emi right.", "I that think Emi is right."]),
        answer: 1,
        explain: [
          "「〜だと思う」は " + rule(en("I think (that)") + " + 主語 + 動詞") + "で表します。ここでは " + en("that") + " が省略されています。",
          en("I think " + key("Emi is right") + ".") + "(" + en("I think that Emi is right.") + " も同じ意味です。)",
          en("think") + " のあとの文にも動詞が必要です。" + en("Emi right") + " には be動詞がありません。",
          en("that") + " は " + en("think") + " のすぐあとに置き、そのあとは「主語 + 動詞」の順にします。"
        ]
      },
      {
        id: "f8",
        text: Q_EN_TO_JA,
        material: eibun("I don't think it will rain today."),
        choices: [
          "今日は雨が降ると思います。",
          "今日は雨が降ったとは思いません。",
          "今日雨が降るかどうかわかりません。",
          "今日は雨が降らないと思います。"
        ],
        answer: 3,
        explain: [
          en("I don't think 〜") + " は「〜ではないと思う」という意味です。" + en("it will rain today") + " は「今日雨が降るだろう」なので、全体で「今日は雨が降らないと思う」となります。",
          en("don't") + " があるので、「降ると思います」にはなりません。",
          en("will rain") + " は未来のことなので「降った」ではありません。「わかりません」は " + en("know") + " を使って表します。"
        ]
      },
      {
        id: "f9",
        text: Q_REPLY,
        material: kaiwa([["A", "Why were you late for school?", "あなたはなぜ学校に遅れたのですか。"], ["B", B, "寝ぼうしたからです。"]]),
        choices: ens(["So I got up late.", "If I got up late.", "Because I got up late.", "When I get up late."]),
        answer: 2,
        explain: [
          en("Why 〜?") + " には " + en(key("Because")) + " + 主語 + 動詞で理由を答えます。",
          en("so") + " は「だから」で、そのあとには結果がきます。理由の答えにはなりません。",
          en("If 〜") + "(もし〜なら)と " + en("When 〜") + "(〜するとき)は、理由を表しません。"
        ]
      },
      {
        id: "f10",
        text: "次の文を、" + en("because") + " を使ってほぼ同じ意味に書きかえたものはどれですか。",
        material: eibun("I was tired, so I went to bed early.", "わたしは疲れていたので、早く寝ました。"),
        choices: ens(["I was tired because I went to bed early.", "I went to bed early because I was tired.", "Because I went to bed early, I was tired.", "I went to bed early because was tired."]),
        answer: 1,
        explain: [
          "もとの文では、「疲れていた」が理由、「早く寝た」が結果です。" + en("because") + " は理由の前に置きます。",
          en("I went to bed early " + key("because I was tired") + "."),
          "残りのうち2つは、" + en("because") + " が「早く寝た」の前にあり、「早く寝たので疲れていた」という意味になってしまいます。",
          en("because") + " のあとにも主語が必要です。" + en("because was tired") + " には主語がありません。"
        ]
      },
      {
        id: "f11",
        text: "「家に着いたら、わたしに電話してください。」を、正しい語順で表した文はどれですか。",
        choices: ens(["Please call me when you get home.", "Please call me when you will get home.", "Please call me you get home when.", "Please when call me you get home."]),
        answer: 0,
        explain: [
          en("when") + " のあとに「主語 + 動詞」を続けて、「〜したら」のまとまりを作ります。中は、これからのことでも現在形です。",
          en("Please call me " + key("when you get home") + "."),
          en("when") + " のまとまりの中に " + en("will") + " は使いません。",
          en("when") + " は、まとまりの最初に置きます。"
        ]
      },
      {
        id: "f12",
        text: Q_EN_TO_JA,
        material: eibun("When I was a child, I lived in Osaka."),
        choices: [
          "もしわたしが子どもなら、大阪に住みます。",
          "子どもが大阪に住んでいたとき、わたしもいました。",
          "わたしは子どものとき、大阪に住んでいました。",
          "わたしはいつ子どもで、大阪に住んでいましたか。"
        ],
        answer: 2,
        explain: [
          en("When I was a child") + " は「わたしが子どもだったとき」、" + en("I lived in Osaka") + " は「大阪に住んでいた」です。",
          en("when") + " は「〜とき」で、「もし〜なら」は " + en("if") + " で表します。",
          "文の最後が " + en("?") + " ではないので、疑問文ではありません。主語は " + en("I") + " で、「子どもが」ではありません。"
        ]
      },
      {
        id: "f13",
        text: Q_BLANK_JA,
        material: eibun("I'll go to the park " + B + " it is sunny tomorrow.", "明日晴れたら、わたしは公園に行きます。"),
        choices: ["because", "if", "but", "so"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          "「(もし)〜したら」は " + en(key("if")) + " で表します。中は未来のことでも現在形なので、" + en("it is sunny") + " になっています。",
          en("because") + " は「〜なので」で、まだ起きていないことを条件にする「〜したら」の意味にはなりません。",
          en("but") + " は「しかし」、" + en("so") + " は「だから」で、日本語の文に合いません。"
        ]
      },
      {
        id: "f14",
        text: Q_BLANK,
        material: eibun("I think " + B + " Ken is a good singer.", "わたしはケンは歌がじょうずだと思います。"),
        choices: ["that", "what", "but", "or"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          rule(en("think that") + " + 主語 + 動詞") + "で「〜だと思う」です。" + en("I think " + fill("that") + " Ken is a good singer."),
          "この " + en("that") + " は省略することもできます。",
          en("what") + "、" + en("but") + "、" + en("or") + " は、" + en("think") + " のすぐあとに置いて「〜だと思う」の意味にはなりません。"
        ]
      },
      {
        id: "f15",
        text: Q_BLANK_JA,
        material: eibun("I went to the shop " + B + " bought some eggs.", "わたしは店に行って、卵を買いました。"),
        choices: ["or", "so", "because", "and"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          "「〜して、…した」と、続けて起きたことをつなぐのは " + en(key("and")) + " です。" + en("went") + " と " + en("bought") + " の2つの動詞を結んでいます。",
          en("so") + " と " + en("because") + " は文と文をつなぐ語なので、主語のない " + en("bought some eggs") + " を続けられません。",
          en("or") + " は「または」で、日本語の文に合いません。"
        ]
      }
    ]
  });
})();
