// 中学英語道場: 中1「動詞」の7単元の中身(要点・表・例題・問題)。
// 形式の説明と、表示部品の関数(JHE.en、JHE.eibun など)は data.js の先頭を参照。
// 「文の形」「語句」の6単元は data-g1-2.js にある。
//
// 内容のきまり:
// ・説明は学校文法に合わせる。教科書によって扱いが分かれる点には踏みこまない。
// ・英文はすべて自作。中1の語彙と文法の範囲で、アメリカ英語のつづりで書く。
// ・問いの文(text)は日本語の指示だけにして、英文は material に入れる。
// ・正解が1つに決まるように、まちがいの選択肢は「どの場面でも成り立たない形」にする。
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
  var Q_REPLY = "Aの質問に対する、Bの答えとして正しいものはどれですか。";
  var Q_REPLY_BLANK = "Bの空所に入る語はどれですか。";
  var Q_WRONG = "誤りのある文はどれですか。";
  var Q_EN_TO_JA = "次の英文の意味として正しいものはどれですか。";
  var Q_NEG = "次の文を否定文に書きかえたものはどれですか。";
  var Q_QUES = "次の文を疑問文に書きかえたものはどれですか。";

  // =====================================================================
  // 1-1 be動詞
  // =====================================================================
  JHE.register("g1-be-verbs", {
    points: [
      "be動詞は " + rule("am / are / is") + " の3つです(現在の文)。「〜です」「〜にいます(あります)」という意味を表します。",
      "どれを使うかは" + rule("主語で決まります") + "。" + en("I") + " なら " + en("am") + "、" + en("you") + " と複数なら " + en("are") + "、それ以外の1人・1つ(" + en("he, she, it, Ken, this") + " など)なら " + en("is") + " です。",
      "否定文は、be動詞のあとに " + en("not") + " を置きます。" + en("is not") + " は " + en("isn't") + "、" + en("are not") + " は " + en("aren't") + " と短くできます。" + en("am not") + " は短くできないので、" + en("I'm not") + " とします。",
      "疑問文は、be動詞を主語の前に出します。答えるときも be動詞を使います。" + en("Are you 〜?") + " には " + en("Yes, I am.") + " か " + en("No, I'm not.") + " で答えます。",
      "主語と be動詞は、" + en("I'm") + "、" + en("you're") + "、" + en("he's") + "、" + en("she's") + "、" + en("it's") + "、" + en("we're") + "、" + en("they're") + " のように短くできます。"
    ],
    chart: hyo({
      caption: "主語と be動詞",
      head: ["", "主語", "be動詞"],
      rows: [
        ["私", "I", "am"],
        ["あなた", "you", "are"],
        ["彼", "he", "is"],
        ["彼女", "she", "is"],
        ["それ", "it", "is"],
        ["私たち", "we", "are"],
        ["彼ら", "they", "are"]
      ]
    }),
    example: {
      title: "空所に入る be動詞を答えなさい。" + eibun("My brother " + B + " a high school student.", "わたしの兄は高校生です。"),
      steps: [
        "主語は " + en("My brother") + "(わたしの兄)です。",
        "「わたし」でも「あなた」でもない1人なので、" + en("he") + " と同じあつかいになります。",
        en("he") + " に合う be動詞は " + en(key("is")) + " です。"
      ],
      result: en("is") + "(" + en("My brother is a high school student.") + ")"
    },
    fixed: [
      {
        id: "f1",
        text: Q_BLANK,
        material: eibun("I " + B + " a junior high school student.", "わたしは中学生です。"),
        choices: ["am", "are", "is", "be"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "主語が " + en("I") + " のとき、be動詞は " + en(key("am")) + " です。",
          en("are") + " は " + en("you") + " や複数の主語、" + en("is") + " は " + en("he, she, it") + " などに使います。",
          en("be") + " はもとの形(原形)で、このままでは「〜です」の文に使えません。"
        ]
      },
      {
        id: "f2",
        text: Q_BLANK,
        material: eibun("You " + B + " a good tennis player.", "あなたはテニスがじょうずです。"),
        choices: ["am", "are", "is", "be"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          "主語が " + en("you") + " のとき、be動詞は " + en(key("are")) + " です。",
          en("am") + " は " + en("I") + " だけに使います。" + en("is") + " は " + en("he, she, it") + " などに使います。",
          en("be") + " は原形なので、このままでは使えません。"
        ]
      },
      {
        id: "f3",
        text: Q_BLANK,
        material: eibun("This " + B + " my new bike.", "これはわたしの新しい自転車です。"),
        choices: ["am", "are", "is", "be"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          en("this") + "(これ)は、1つのものを指す主語です。be動詞は " + en(key("is")) + " を使います。",
          en("am") + " は " + en("I") + "、" + en("are") + " は " + en("you") + " や複数の主語に使います。",
          en("be") + " は原形なので、このままでは使えません。"
        ]
      },
      {
        id: "f4",
        text: Q_BLANK,
        material: eibun("Ken and Yuki " + B + " in the same class.", "ケンとユキは同じクラスです。"),
        choices: ["am", "are", "is", "be"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          "主語は " + en("Ken and Yuki") + " の2人、つまり複数です。複数の主語には " + en(key("are")) + " を使います。",
          "すぐ前の " + en("Yuki") + " だけを見て " + en("is") + " にしないように注意します。",
          en("am") + " は " + en("I") + " だけに使い、" + en("be") + " は原形なのでこのままでは使えません。"
        ]
      },
      {
        id: "f5",
        text: "下線部を短くした形(短縮形)として正しいものはどれですか。",
        material: eibun(u("She is") + " from Canada.", "彼女はカナダ出身です。"),
        choices: ["She's", "Shes", "She'is", "Shes'"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("She is") + " は、" + en("is") + " の " + en("i") + " をはぶいて、そこにアポストロフィ(')を入れ、" + en(key("She's")) + " とします。",
          en("Shes") + " はアポストロフィがなく、" + en("She'is") + " は " + en("i") + " が残っています。",
          en("Shes'") + " はアポストロフィの位置がちがいます。はぶいた文字のところに入れます。"
        ]
      },
      {
        id: "f6",
        text: Q_NEG,
        material: eibun("He is a soccer fan.", "彼はサッカーのファンです。"),
        choices: ens(["He is not a soccer fan.", "He not is a soccer fan.", "He is a not soccer fan.", "Not he is a soccer fan."]),
        answer: 0,
        explain: [
          "be動詞の否定文は、" + rule("be動詞のすぐあとに not") + " を置きます。",
          en("He is " + key("not") + " a soccer fan.") + "(彼はサッカーのファンではありません。)",
          en("not") + " を be動詞の前や、文の最初、" + en("a") + " のあとに置くことはできません。"
        ]
      },
      {
        id: "f7",
        text: Q_QUES,
        material: eibun("That is your bag.", "あれはあなたのかばんです。"),
        choices: ens(["Is that your bag?", "Are that your bag?", "Is that is your bag?", "That your bag is?"]),
        answer: 0,
        explain: [
          "be動詞の疑問文は、" + rule("be動詞を主語の前に出します") + "。",
          en(key("Is") + " that your bag?") + "(あれはあなたのかばんですか。)",
          "主語 " + en("that") + " に合う be動詞は " + en("is") + " なので、" + en("Are") + " は使えません。",
          en("Is") + " を前に出したら、もとの場所の " + en("is") + " は残しません。be動詞を文の最後に置く形もありません。"
        ]
      },
      {
        id: "f8",
        text: Q_REPLY,
        material: kaiwa([["A", "Are you from Osaka?", "あなたは大阪出身ですか。"], ["B", B]]),
        choices: ens(["Yes, I am.", "Yes, you are.", "Yes, I do.", "Yes, it is."]),
        answer: 0,
        explain: [
          en("Are you 〜?") + "(あなたは〜ですか)には、「わたしは」で答えるので、主語は " + en("I") + "、be動詞は " + en("am") + " です。",
          en("Yes, you are.") + " は、たずねた相手のことを答えてしまっています。",
          "be動詞の疑問文には be動詞で答えるので、" + en("do") + " は使いません。",
          en("it") + " は人ではなく、ものを指すので合いません。"
        ]
      },
      {
        id: "f9",
        text: Q_REPLY,
        material: kaiwa([["A", "Is Mr. Sato a math teacher?", "佐藤先生は数学の先生ですか。"], ["B", B]]),
        choices: ens(["No, he isn't.", "No, he aren't.", "No, he doesn't.", "No, it isn't."]),
        answer: 0,
        explain: [
          en("Mr. Sato") + " は男の人なので、答えの文では " + en("he") + " で受けます。" + en("he") + " に合う be動詞は " + en("is") + " です。",
          en("No, he " + key("isn't") + ".") + "(いいえ、ちがいます。)",
          en("aren't") + " は " + en("you") + " や複数の主語に使います。" + en("doesn't") + " は一般動詞の文の答えに使います。",
          en("it") + " は人には使いません。"
        ]
      },
      {
        id: "f10",
        text: Q_WRONG,
        choices: ens(["I am twelve years old.", "We are good friends.", "My parents is very busy.", "That is a new library."]),
        answer: 2,
        explain: [
          en("My parents") + "(わたしの両親)は2人なので、複数の主語です。be動詞は " + en("are") + " にします。",
          seigo("My parents is very busy.", "My parents " + key("are") + " very busy."),
          "ほかの3つは、" + en("I") + " と " + en("am") + "、" + en("We") + " と " + en("are") + "、" + en("That") + " と " + en("is") + " が正しく組み合わさっています。"
        ]
      },
      {
        id: "f11",
        text: "「彼女は今、図書館にいます。」を表す文はどれですか。",
        choices: ens(["She is in the library now.", "She are in the library now.", "She in the library now.", "She is the library now."]),
        answer: 0,
        explain: [
          "be動詞には「〜にいます」という意味もあります。主語 " + en("She") + " には " + en("is") + " を使います。",
          en("She " + key("is") + " in the library now."),
          en("are") + " は " + en("She") + " に合いません。be動詞のない文は、英語では文になりません。",
          en("in") + "(〜の中に)がないと、「彼女は図書館です」という意味になってしまいます。"
        ]
      },
      {
        id: "f12",
        text: Q_EN_TO_JA,
        material: eibun("They are not my classmates."),
        choices: [
          "彼らはわたしのクラスメートではありません。",
          "彼はわたしのクラスメートではありません。",
          "彼らはわたしのクラスメートです。",
          "彼らはわたしのクラスメートですか。"
        ],
        answer: 0,
        explain: [
          en("They") + " は「彼ら(彼女ら)は」、" + en("are not") + " は「〜ではありません」です。",
          "「彼は」は " + en("He") + " です。" + en("They") + " は2人以上を指します。",
          en("not") + " があるので否定文です。疑問文なら " + en("Are they 〜?") + " の語順になります。"
        ]
      },
      {
        id: "f13",
        text: "「あなたのお姉さんは看護師ですか。」を、正しい語順で表した文はどれですか。",
        choices: ens(["Is your sister a nurse?", "Your is sister a nurse?", "Is your a nurse sister?", "A nurse your sister is?"]),
        answer: 0,
        explain: [
          "疑問文なので、be動詞 " + en("Is") + " を文の最初に置きます。",
          "そのあとに、主語 " + en("your sister") + "(あなたのお姉さん)、「看護師」の " + en("a nurse") + " を続けます。",
          en(key("Is") + " your sister a nurse?"),
          en("your sister") + " と " + en("a nurse") + " は、それぞれひとまとまりなので、あいだにほかの語を入れません。"
        ]
      },
      {
        id: "f14",
        text: Q_BLANK,
        material: eibun("These books " + B + " very interesting.", "これらの本はとてもおもしろいです。"),
        choices: ["am", "are", "is", "isn't"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          en("These books") + "(これらの本)は複数の主語です。be動詞は " + en(key("are")) + " を使います。",
          en("is") + " と " + en("isn't") + " は、主語が1つのときに使います。",
          en("am") + " は " + en("I") + " だけに使います。"
        ]
      },
      {
        id: "f15",
        text: Q_REPLY_BLANK,
        material: kaiwa([["A", "Are you and Emi sisters?", "あなたとエミは姉妹ですか。"], ["B", "Yes, " + B + " are."]]),
        choices: ["we", "I", "they", "she"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("you and Emi") + "(あなたとエミ)についてたずねられたら、答える人は「わたしたちは」で答えます。",
          en("Yes, " + fill("we") + " are.") + "(はい、そうです。)",
          en("I") + " のあとは " + en("am") + "、" + en("she") + " のあとは " + en("is") + " になるので、" + en("are") + " と合いません。",
          en("they") + "(彼らは)は、答える人自身を入れずに言うときに使います。"
        ]
      },
      {
        id: "f16",
        text: "「わたしは疲れていません。」を表す文はどれですか。",
        choices: ens(["I'm not tired.", "I amn't tired.", "I not am tired.", "I isn't tired."]),
        answer: 0,
        explain: [
          en("I am not") + " を短くするときは、" + en("I am") + " のほうを短くして " + en(key("I'm not")) + " とします。",
          en("am not") + " を1語に短くした形はありません。",
          en("not") + " は be動詞のあとに置きます。" + en("isn't") + " は " + en("I") + " には使えません。"
        ]
      }
    ]
  });

  // =====================================================================
  // 1-2 一般動詞
  // =====================================================================
  JHE.register("g1-general-verbs", {
    points: [
      "be動詞以外の動詞を" + rule("一般動詞") + "といいます。" + en("play") + "(する)、" + en("like") + "(好きだ)、" + en("have") + "(持っている)、" + en("study") + "(勉強する)など、動作や状態を表します。",
      "英語は " + rule("主語 → 動詞 → そのほか") + " の順に並べます。「わたしは・テニスを・する」ではなく、" + en("I play tennis.") + "(わたしは・する・テニスを)の順です。",
      "否定文は、動詞の前に " + en(key("do not")) + "(短くすると " + en(key("don't")) + ")を置きます。",
      "疑問文は、文の最初に " + en(key("Do")) + " を置きます。" + en("Yes, I do.") + " か " + en("No, I don't.") + " で答えます。",
      "1つの文に、be動詞と一般動詞をそのまま並べて使うことはできません。" + seigo("I am play tennis.", "I play tennis.")
    ],
    chart:
      gojun([{ role: "主語", en: "You", ja: "あなたは" }, { role: "動詞", en: "play", ja: "する", key: true }, { role: "そのほか", en: "tennis.", ja: "テニスを" }], "ふつうの文") +
      gojun([{ role: "主語", en: "You" }, { role: "do not", en: "don't", key: true }, { role: "動詞", en: "play" }, { role: "そのほか", en: "tennis." }], "否定文") +
      gojun([{ role: "Do", en: "Do", key: true }, { role: "主語", en: "you" }, { role: "動詞", en: "play" }, { role: "そのほか", en: "tennis?" }], "疑問文"),
    example: {
      title: "次の日本語に合うように、( )内の語句を並べかえなさい。" +
        eibun("( study / every day / I / English ).", "わたしは毎日英語を勉強します。"),
      steps: [
        "まず、主語「わたしは」の " + en("I") + " を置きます。",
        "主語のすぐあとに、動詞「勉強します」の " + en(key("study")) + " を置きます。",
        "そのあとに「英語を」の " + en("English") + "、最後に「毎日」の " + en("every day") + " を置きます。"
      ],
      result: en("I study English every day.")
    },
    fixed: [
      {
        id: "f1",
        text: Q_BLANK,
        material: eibun("I " + B + " soccer after school.", "わたしは放課後にサッカーをします。"),
        choices: ["play", "am", "is", "are"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "「(スポーツを)する」は、一般動詞の " + en(key("play")) + " で表します。",
          en("am, is, are") + " は be動詞で、「〜です」「〜にいます」という意味です。「サッカーをします」の意味にはなりません。"
        ]
      },
      {
        id: "f2",
        text: Q_BLANK,
        material: eibun("I " + B + " like natto.", "わたしは納豆が好きではありません。"),
        choices: ["don't", "aren't", "isn't", "not"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "一般動詞 " + en("like") + " の否定文は、動詞の前に " + en(key("don't")) + "(" + en("do not") + ")を置きます。",
          en("aren't") + " と " + en("isn't") + " は be動詞の否定で、主語の " + en("I") + " にも合いません。",
          en("not") + " だけを動詞の前に置くこともできません。"
        ]
      },
      {
        id: "f3",
        text: Q_BLANK,
        material: eibun(B + " you have a pet?", "あなたはペットを飼っていますか。"),
        choices: ["Do", "Are", "Is", "Am"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "一般動詞 " + en("have") + " の疑問文は、文の最初に " + en(key("Do")) + " を置きます。",
          en("Are, Is, Am") + " は be動詞です。一般動詞の疑問文を作るのには使いません。"
        ]
      },
      {
        id: "f4",
        text: Q_REPLY,
        material: kaiwa([["A", "Do you play the piano?", "あなたはピアノをひきますか。"], ["B", B]]),
        choices: ens(["Yes, I do.", "Yes, I am.", "Yes, you do.", "Yes, it is."]),
        answer: 0,
        explain: [
          en("Do you 〜?") + " には、" + en("do") + " を使って " + en("Yes, I " + key("do") + ".") + " か " + en("No, I don't.") + " で答えます。",
          en("Yes, I am.") + " と " + en("Yes, it is.") + " は、be動詞の疑問文への答え方です。",
          en("Yes, you do.") + " は、たずねた相手のことを答えてしまっています。"
        ]
      },
      {
        id: "f5",
        text: Q_REPLY,
        material: kaiwa([["A", "Do you and Ken walk to school?", "あなたとケンは歩いて学校へ行きますか。"], ["B", B]]),
        choices: ens(["No, we don't.", "No, we aren't.", "No, you don't.", "No, I'm not."]),
        answer: 0,
        explain: [
          en("you and Ken") + "(あなたとケン)についてたずねられているので、「わたしたちは」の " + en("we") + " で答えます。",
          en("Do 〜?") + " の疑問文なので、" + en("No, we " + key("don't") + ".") + " と " + en("do") + " を使います。",
          en("aren't") + " と " + en("I'm not") + " は、be動詞の疑問文への答え方です。",
          en("No, you don't.") + " は、たずねた相手のことを答えてしまっています。"
        ]
      },
      {
        id: "f6",
        text: Q_WRONG,
        choices: ens(["I have two sisters.", "We study math on Monday.", "I am play the guitar.", "You speak English well."]),
        answer: 2,
        explain: [
          "be動詞 " + en("am") + " と一般動詞 " + en("play") + " を、そのまま並べて使うことはできません。",
          seigo("I am play the guitar.", "I play the guitar."),
          "ほかの3つは、主語のあとに一般動詞が1つだけあり、正しい文です。"
        ]
      },
      {
        id: "f7",
        text: "「わたしたちは土曜日にテニスをします。」を、正しい語順で表した文はどれですか。",
        choices: ens(["We play tennis on Saturday.", "We tennis play on Saturday.", "Play we tennis on Saturday.", "We tennis on Saturday play."]),
        answer: 0,
        explain: [
          "英語は、" + rule("主語 → 動詞 → 「〜を」") + " の順に並べます。",
          en("We") + "(わたしたちは)→ " + en(key("play")) + "(する)→ " + en("tennis") + "(テニスを)→ " + en("on Saturday") + "(土曜日に)",
          "日本語と同じ順に「テニスを・する」と並べたり、動詞を文の最後や最初に置いたりしません。"
        ]
      },
      {
        id: "f8",
        text: "「あなたは犬が好きですか。」を表す文はどれですか。",
        choices: ens(["Do you like dogs?", "Are you like dogs?", "You do like dogs?", "Do like you dogs?"]),
        answer: 0,
        explain: [
          "一般動詞 " + en("like") + " の疑問文は、" + rule("Do + 主語 + 動詞 〜?") + " の順です。",
          en(key("Do") + " you like dogs?"),
          "一般動詞の疑問文に " + en("Are") + " は使いません。",
          en("Do") + " は文の最初に置き、そのすぐあとに主語 " + en("you") + " を続けます。"
        ]
      },
      {
        id: "f9",
        text: Q_EN_TO_JA,
        material: eibun("I don't know that boy."),
        choices: [
          "わたしはあの少年を知りません。",
          "わたしはあの少年を知っています。",
          "あなたはあの少年を知りません。",
          "あの少年はわたしを知りません。"
        ],
        answer: 0,
        explain: [
          en("I") + " は「わたしは」、" + en("don't know") + " は「知りません」、" + en("that boy") + " は「あの少年を」です。",
          en("don't") + " があるので否定文です。",
          "主語は文の最初の " + en("I") + " です。動詞のあとの " + en("that boy") + " は「〜を」にあたります。"
        ]
      },
      {
        id: "f10",
        text: Q_BLANK,
        material: eibun("You " + B + " very kind.", "あなたはとても親切です。"),
        choices: ["are", "do", "like", "have"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "「〜です」は be動詞で表します。主語が " + en("you") + " なので " + en(key("are")) + " です。",
          en("kind") + "(親切な)は、ようすを表す語です。" + en("do, like, have") + " などの一般動詞のあとに、そのまま続けることはできません。"
        ]
      },
      {
        id: "f11",
        text: Q_NEG,
        material: eibun("They speak Japanese.", "彼らは日本語を話します。"),
        choices: ens(["They don't speak Japanese.", "They aren't speak Japanese.", "They speak not Japanese.", "They not speak Japanese."]),
        answer: 0,
        explain: [
          "一般動詞の否定文は、動詞の前に " + en("don't") + " を置きます。",
          en("They " + key("don't") + " speak Japanese.") + "(彼らは日本語を話しません。)",
          en("aren't") + " は be動詞の否定なので、一般動詞 " + en("speak") + " の前には置けません。",
          en("not") + " だけを動詞の前やあとに置くこともできません。"
        ]
      },
      {
        id: "f12",
        text: Q_QUES,
        material: eibun("You know my brother.", "あなたはわたしの兄を知っています。"),
        choices: ens(["Do you know my brother?", "Are you know my brother?", "Know you my brother?", "Do know you my brother?"]),
        answer: 0,
        explain: [
          "一般動詞の疑問文は、文の最初に " + en("Do") + " を置きます。主語と動詞の順は変えません。",
          en(key("Do") + " you know my brother?") + "(あなたはわたしの兄を知っていますか。)",
          en("Are") + " は be動詞なので使いません。一般動詞を主語の前に出す形もありません。"
        ]
      },
      {
        id: "f13",
        text: Q_BLANK,
        material: eibun("I " + B + " a new bike.", "わたしは新しい自転車を持っています。"),
        choices: ["have", "are", "do", "is"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "「〜を持っている」は、一般動詞の " + en(key("have")) + " で表します。",
          en("are") + " と " + en("is") + " は be動詞で、主語の " + en("I") + " に合いません。be動詞には「持っている」の意味もありません。",
          en("do") + " には「持っている」の意味はありません。"
        ]
      },
      {
        id: "f14",
        text: "次のうち、一般動詞を使った文はどれですか。",
        choices: ens(["I want a new bag.", "I am hungry.", "This is my room.", "We are busy today."]),
        answer: 0,
        explain: [
          en("want") + "(ほしい)は一般動詞です。",
          "ほかの3つの動詞は " + en("am, is, are") + " で、どれも be動詞です。",
          "現在の文で使う be動詞は " + en("am, are, is") + " の3つです。" + en("play") + " や " + en("want") + " のような、それ以外の動詞を一般動詞といいます。"
        ]
      },
      {
        id: "f15",
        text: "「〜を知っている」という意味の動詞はどれですか。",
        choices: ["know", "now", "new", "no"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "「知っている」は " + en(key("know")) + " です。最初の " + en("k") + " は発音しません。",
          en("now") + " は「今」、" + en("new") + " は「新しい」、" + en("no") + " は「いいえ」という意味です。"
        ]
      }
    ]
  });

  // =====================================================================
  // 1-3 三人称単数現在
  // =====================================================================
  JHE.register("g1-third-person-singular", {
    points: [
      "「わたし(" + en("I") + ")」「あなた(" + en("you") + ")」以外の、1人の人・1つのものを" + rule("三人称単数") + "といいます。" + en("he, she, it, Ken, my mother, this bag") + " などです。",
      "主語が三人称単数で、現在のことを言うとき、一般動詞に " + en(key("s")) + " をつけます(" + henka("play", "plays") + "、" + henka("like", "likes") + ")。",
      en("s, sh, ch, x, o") + " で終わる動詞には " + en("es") + " をつけます(" + henka("watch", "watches") + ")。「" + en("a, i, u, e, o") + " 以外の文字 + " + en("y") + "」で終わる動詞は、" + en("y") + " を " + en("i") + " にかえて " + en("es") + " をつけます(" + henka("study", "studies") + ")。" + en("have") + " は " + en("has") + " になります。",
      "否定文は " + en(key("does not")) + "(" + en(key("doesn't")) + ")、疑問文は " + en(key("Does")) + " を使います。このとき、" + rule("動詞は s のつかないもとの形(原形)") + " にもどします。" + seigo("He doesn't plays tennis.", "He doesn't play tennis."),
      "主語が複数(" + en("they") + "、" + en("Ken and Yuki") + " など)のときは、" + en("s") + " をつけません。"
    ],
    chart: hyo({
      caption: "s のつけ方",
      head: ["", "原形", "s の形"],
      rows: [
        ["s", "like", "likes"],
        ["es", "go", "goes"],
        ["es", "wash", "washes"],
        ["ies", "try", "tries"],
        ["特別", "have", "has"]
      ]
    }),
    example: {
      title: "( )内の語を、正しい形にかえなさい。" + eibun("My sister (study) English every day.", "わたしの姉は毎日英語を勉強します。"),
      steps: [
        "主語 " + en("My sister") + " は、「わたし」でも「あなた」でもない1人なので、三人称単数です。",
        "現在の文なので、動詞に " + en("s") + " をつけます。",
        en("study") + " は「" + en("a, i, u, e, o") + " 以外の文字(" + en("d") + ")+ " + en("y") + "」で終わるので、" + en("y") + " を " + en("i") + " にかえて " + en("es") + " をつけます。"
      ],
      result: en("studies")
    },
    fixed: [
      {
        id: "f1",
        text: Q_BLANK,
        material: eibun("Ken " + B + " baseball every day.", "ケンは毎日野球をします。"),
        choices: ["plays", "play", "playing", "playes"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "主語 " + en("Ken") + " は三人称単数です。現在の文なので、動詞に " + en("s") + " をつけて " + en(key("plays")) + " とします。",
          en("play") + " のままでは、主語に合いません。" + en("playing") + " は、これだけでは文の動詞になりません。",
          en("play") + " は " + en("y") + " の前が " + en("a") + " なので、そのまま " + en("s") + " をつけます。" + en("playes") + " というつづりはありません。"
        ]
      },
      {
        id: "f2",
        text: "主語が三人称単数で現在の文のとき、" + en("watch") + " はどの形になりますか。",
        choices: ["watches", "watchs", "watchies", "watch's"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("ch") + " で終わる動詞には、" + en("es") + " をつけます。" + henka("watch", "watches"),
          en("s") + " だけをつけた " + en("watchs") + " は誤りです。",
          en("y") + " で終わる語ではないので、" + en("ies") + " にはなりません。アポストロフィもつけません。"
        ]
      },
      {
        id: "f3",
        text: "主語が三人称単数で現在の文のとき、" + en("study") + " はどの形になりますか。",
        choices: ["studies", "studys", "studyes", "studis"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("study") + " は、" + en("y") + " の前が " + en("d") + "(" + en("a, i, u, e, o") + " 以外の文字)です。",
          "このときは、" + en("y") + " を " + en("i") + " にかえて " + en("es") + " をつけます。" + henka("study", "studies"),
          "そのまま " + en("s") + " や " + en("es") + " をつけたり、" + en("y") + " を " + en("i") + " にかえて " + en("s") + " だけをつけたりはしません。"
        ]
      },
      {
        id: "f4",
        text: "主語が三人称単数で現在の文のとき、" + en("have") + " はどの形になりますか。",
        choices: ["has", "haves", "havs", "hases"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("have") + " は特別な形になり、" + en(key("has")) + " を使います。",
          en("s") + " や " + en("es") + " をつけるきまりには当てはまらないので、そのまま覚えます。",
          eibun("My brother has a new bike.", "わたしの兄は新しい自転車を持っています。")
        ]
      },
      {
        id: "f5",
        text: Q_BLANK,
        material: eibun("My father " + B + " drink coffee.", "わたしの父はコーヒーを飲みません。"),
        choices: ["doesn't", "don't", "isn't", "not"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "主語 " + en("My father") + " は三人称単数です。一般動詞の否定文には " + en(key("doesn't")) + " を使います。",
          en("don't") + " は、主語が " + en("I, you") + " や複数のときに使います。",
          en("isn't") + " は be動詞の否定なので、一般動詞 " + en("drink") + " の前には置けません。" + en("not") + " だけを置くこともできません。"
        ]
      },
      {
        id: "f6",
        text: Q_NEG,
        material: eibun("She likes cats.", "彼女はねこが好きです。"),
        choices: ens(["She doesn't like cats.", "She doesn't likes cats.", "She don't like cats.", "She not likes cats."]),
        answer: 0,
        explain: [
          "主語 " + en("She") + " は三人称単数なので、" + en("doesn't") + " を使います。",
          en("doesn't") + " のあとの動詞は、" + en("s") + " のつかない原形にもどします。",
          en("She " + key("doesn't like") + " cats.") + "(彼女はねこが好きではありません。)",
          en("likes") + " のままにしたり、" + en("don't") + " を使ったり、" + en("not") + " だけを置いたりはしません。"
        ]
      },
      {
        id: "f7",
        text: Q_BLANK,
        material: eibun(B + " your brother play the guitar?", "あなたのお兄さんはギターをひきますか。"),
        choices: ["Does", "Do", "Is", "Are"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "主語 " + en("your brother") + " は三人称単数です。一般動詞の疑問文は " + en(key("Does")) + " で始めます。",
          en("Do") + " は、主語が " + en("I, you") + " や複数のときに使います。すぐあとの " + en("your") + " につられないように注意します。",
          en("Is, Are") + " は be動詞なので、一般動詞 " + en("play") + " の疑問文には使いません。"
        ]
      },
      {
        id: "f8",
        text: Q_REPLY,
        material: kaiwa([["A", "Does Ms. Green live in Tokyo?", "グリーン先生は東京に住んでいますか。"], ["B", B]]),
        choices: ens(["Yes, she does.", "Yes, she is.", "Yes, she do.", "Yes, I do."]),
        answer: 0,
        explain: [
          en("Does 〜?") + " の疑問文には、" + en("does") + " を使って答えます。" + en("Ms. Green") + " は女の人なので " + en("she") + " で受けます。",
          en("Yes, she " + key("does") + "."),
          en("is") + " は be動詞の疑問文への答えに使います。" + en("she") + " のあとに " + en("do") + " は使いません。",
          en("Yes, I do.") + " は、自分のことを答えてしまっています。"
        ]
      },
      {
        id: "f9",
        text: Q_QUES,
        material: eibun("He goes to school by bus.", "彼はバスで学校へ行きます。"),
        choices: ens(["Does he go to school by bus?", "Does he goes to school by bus?", "Do he go to school by bus?", "Is he go to school by bus?"]),
        answer: 0,
        explain: [
          "主語 " + en("He") + " は三人称単数なので、" + en("Does") + " で始めます。",
          en("Does") + " を使ったら、動詞は原形にもどします。" + henka("goes", "go"),
          en(key("Does") + " he " + key("go") + " to school by bus?"),
          en("goes") + " のままにしたり、" + en("Do") + " や be動詞の " + en("Is") + " を使ったりはしません。"
        ]
      },
      {
        id: "f10",
        text: Q_BLANK_PHRASE,
        material: eibun(B + " plays tennis on Sunday.", "(　　)は日曜日にテニスをします。"),
        choices: ens(["My sister", "I", "You", "Ken and Mika"]),
        answer: 0,
        explain: [
          "動詞が " + en("plays") + " と " + en("s") + " のついた形なので、主語は三人称単数です。",
          en("My sister") + "(わたしの姉・妹)は、「わたし」でも「あなた」でもない1人なので、三人称単数です。",
          en("I") + " と " + en("You") + " のときは " + en("play") + " です。" + en("Ken and Mika") + " は2人(複数)なので、やはり " + en("play") + " です。"
        ]
      },
      {
        id: "f11",
        text: Q_BLANK,
        material: eibun("Yumi and Ken " + B + " to the library after school.", "ユミとケンは放課後に図書館へ行きます。"),
        choices: ["go", "goes", "going", "gos"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "主語 " + en("Yumi and Ken") + " は2人なので複数です。複数のときは、動詞に " + en("s") + " をつけません。",
          en("goes") + " は、主語が三人称単数のときの形です。すぐ前の " + en("Ken") + " だけを見ないように注意します。",
          en("going") + " は、これだけでは文の動詞になりません。" + en("gos") + " というつづりはありません。"
        ]
      },
      {
        id: "f12",
        text: Q_WRONG,
        choices: ens(["My mother cooks dinner every day.", "Tom doesn't eat fish.", "Does your sister speaks English?", "My dog runs fast."]),
        answer: 2,
        explain: [
          en("Does") + " を使った疑問文では、動詞を原形にします。",
          seigo("Does your sister speaks English?", "Does your sister " + key("speak") + " English?"),
          "ほかの3つは正しい文です。ふつうの文では動詞に " + en("s") + " をつけ、" + en("doesn't") + " のあとは原形にしています。"
        ]
      },
      {
        id: "f13",
        text: "「彼は日曜日に数学を勉強しません。」を表す文はどれですか。",
        choices: ens(["He doesn't study math on Sunday.", "He doesn't studies math on Sunday.", "He don't study math on Sunday.", "He isn't study math on Sunday."]),
        answer: 0,
        explain: [
          "主語 " + en("He") + " は三人称単数です。否定文は " + rule("doesn't + 動詞の原形") + " で作ります。",
          en("He " + key("doesn't study") + " math on Sunday."),
          en("doesn't") + " のあとを " + en("studies") + " にはしません。" + en("don't") + " は " + en("He") + " に合いません。",
          en("isn't") + " は be動詞の否定なので、一般動詞 " + en("study") + " の前には置けません。"
        ]
      },
      {
        id: "f14",
        text: "次のうち、三人称単数の主語はどれですか。",
        choices: ens(["our teacher", "your friends", "you", "we"]),
        answer: 0,
        explain: [
          en("our teacher") + "(わたしたちの先生)は、「わたし」でも「あなた」でもない1人なので、三人称単数です。",
          en("our") + "(わたしたちの)がついていても、主語になっているのは " + en("teacher") + " 1人です。",
          en("your friends") + " は " + en("s") + " がついていて複数、" + en("we") + "(わたしたちは)も複数です。" + en("you") + " は三人称ではありません。"
        ]
      },
      {
        id: "f15",
        text: Q_REPLY_BLANK,
        material: kaiwa([["A", "Does your father like sports?", "あなたのお父さんはスポーツが好きですか。"], ["B", "No, he " + B + ". He likes music.", "いいえ。彼は音楽が好きです。"]]),
        choices: ["doesn't", "don't", "isn't", "does"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("Does 〜?") + " に「いいえ」で答えるときは、" + en("No, he " + fill("doesn't") + ".") + " とします。",
          en("don't") + " は " + en("he") + " に合いません。" + en("isn't") + " は be動詞の疑問文への答えに使います。",
          en("No") + " のあとなので、" + en("does") + " だけでは合いません。"
        ]
      },
      {
        id: "f16",
        text: Q_EN_TO_JA,
        material: eibun("My brother has a new computer."),
        choices: [
          "わたしの兄は新しいコンピューターを持っています。",
          "わたしは新しいコンピューターを持っています。",
          "わたしの兄は新しいコンピューターを持っていません。",
          "わたしの兄は新しいコンピューターを持っていますか。"
        ],
        answer: 0,
        explain: [
          en("has") + " は、" + en("have") + "(持っている)の、主語が三人称単数のときの形です。",
          "主語は " + en("My brother") + "(わたしの兄)です。" + en("My") + " だけを見て「わたしは」としないようにします。",
          "否定文なら " + en("doesn't have") + "、疑問文なら " + en("Does 〜 have …?") + " の形になります。"
        ]
      }
    ]
  });

  // =====================================================================
  // 1-4 助動詞 can
  // =====================================================================
  JHE.register("g1-can", {
    points: [
      en(key("can")) + " は動詞の前に置いて、「〜できる」という意味を加えます。形は " + rule("can + 動詞の原形") + " です。",
      "主語が何であっても " + en("can") + " の形は変わりません。あとの動詞に " + en("s") + " もつけません。" + seigo("She can plays the piano.", "She can play the piano."),
      "否定文は " + en(key("cannot")) + "(短くすると " + en(key("can't")) + ")を使い、「〜できない」という意味になります。",
      "疑問文は " + en("Can") + " を主語の前に出します。" + en("Yes, I can.") + " か " + en("No, I can't.") + " で答えます。",
      en("Can you 〜?") + " は「〜してくれますか」とたのむとき、" + en("Can I 〜?") + " は「〜してもいいですか」と許可を求めるときにも使います。"
    ],
    chart:
      gojun([{ role: "主語", en: "She", ja: "彼女は" }, { role: "can", en: "can", ja: "できる", key: true }, { role: "動詞の原形", en: "swim", ja: "泳ぐ" }, { role: "そのほか", en: "fast.", ja: "速く" }], "ふつうの文") +
      gojun([{ role: "主語", en: "She" }, { role: "cannot", en: "can't", key: true }, { role: "動詞の原形", en: "swim" }, { role: "そのほか", en: "fast." }], "否定文") +
      gojun([{ role: "Can", en: "Can", key: true }, { role: "主語", en: "she" }, { role: "動詞の原形", en: "swim" }, { role: "そのほか", en: "fast?" }], "疑問文"),
    example: {
      title: "次の文を、「〜できます」という意味の文に書きかえなさい。" + eibun("Mika speaks English.", "ミカは英語を話します。"),
      steps: [
        "「〜できます」は、動詞の前に " + en(key("can")) + " を置いて表します。",
        en("can") + " のあとの動詞は原形にします。" + henka("speaks", "speak"),
        "主語が三人称単数でも、" + en("can") + " に " + en("s") + " はつけません。"
      ],
      result: en("Mika can speak English.") + "(ミカは英語を話せます。)"
    },
    fixed: [
      {
        id: "f1",
        text: Q_BLANK,
        material: eibun("I " + B + " swim fast.", "わたしは速く泳げます。"),
        choices: ["can", "am", "is", "are"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "「泳げます(泳ぐことができます)」は、動詞 " + en("swim") + " の前に " + en(key("can")) + " を置いて表します。",
          en("am, is, are") + " は be動詞です。一般動詞 " + en("swim") + " の原形の前に、そのまま置くことはできません。"
        ]
      },
      {
        id: "f2",
        text: Q_BLANK,
        material: eibun("My brother can " + B + " curry.", "わたしの兄はカレーを作れます。"),
        choices: ["cook", "cooks", "cooking", "cooked"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("can") + " のあとの動詞は、いつも原形です。",
          "主語 " + en("My brother") + " は三人称単数ですが、" + en("can") + " のあとでは " + en("cooks") + " にしません。",
          en("cooking") + " や " + en("cooked") + " も、" + en("can") + " のあとには置けません。"
        ]
      },
      {
        id: "f3",
        text: "「わたしはギターをひけません。」を表す文はどれですか。",
        choices: ens(["I can't play the guitar.", "I don't can play the guitar.", "I can play not the guitar.", "I'm not can play the guitar."]),
        answer: 0,
        explain: [
          "「〜できません」は、" + en("can't") + "(" + en("cannot") + ")+ 動詞の原形で表します。",
          en("I " + key("can't") + " play the guitar."),
          en("can") + " の否定に " + en("don't") + " や " + en("I'm not") + " は使いません。",
          en("not") + " は " + en("can") + " のすぐあとにつけます。動詞のあとには置きません。"
        ]
      },
      {
        id: "f4",
        text: Q_QUES,
        material: eibun("Your sister can ride a bike.", "あなたのお姉さんは自転車に乗れます。"),
        choices: ens(["Can your sister ride a bike?", "Does your sister can ride a bike?", "Can your sister rides a bike?", "Is your sister can ride a bike?"]),
        answer: 0,
        explain: [
          en("can") + " の疑問文は、" + en("Can") + " を主語の前に出します。",
          en(key("Can") + " your sister ride a bike?") + "(あなたのお姉さんは自転車に乗れますか。)",
          en("can") + " の疑問文に " + en("Does") + " や " + en("Is") + " は使いません。",
          "疑問文でも、動詞は原形の " + en("ride") + " のままです。"
        ]
      },
      {
        id: "f5",
        text: Q_REPLY,
        material: kaiwa([["A", "Can you read this kanji?", "あなたはこの漢字が読めますか。"], ["B", B]]),
        choices: ens(["Yes, I can.", "Yes, I do.", "Yes, I am.", "Yes, you can."]),
        answer: 0,
        explain: [
          en("Can you 〜?") + " には、" + en("can") + " を使って " + en("Yes, I " + key("can") + ".") + " か " + en("No, I can't.") + " で答えます。",
          en("do") + " は " + en("Do you 〜?") + "、" + en("am") + " は " + en("Are you 〜?") + " への答えに使います。",
          en("Yes, you can.") + " は、たずねた相手のことを答えてしまっています。"
        ]
      },
      {
        id: "f6",
        text: Q_REPLY_BLANK,
        material: kaiwa([["A", "Can Tom speak Japanese?", "トムは日本語を話せますか。"], ["B", "No, he " + B + "."]]),
        choices: ["can't", "doesn't", "isn't", "don't"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("Can 〜?") + " に「いいえ」で答えるときは、" + en("No, he " + fill("can't") + ".") + " とします。",
          en("doesn't") + " は " + en("Does 〜?") + "、" + en("isn't") + " は " + en("Is 〜?") + " への答えに使います。",
          en("don't") + " は " + en("he") + " に合いません。"
        ]
      },
      {
        id: "f7",
        text: Q_WRONG,
        choices: ens(["Ken can run fast.", "She can sings well.", "I can't find my pen.", "Can you help me?"]),
        answer: 1,
        explain: [
          en("can") + " のあとの動詞は原形です。主語が " + en("She") + " でも " + en("s") + " をつけません。",
          seigo("She can sings well.", "She can " + key("sing") + " well."),
          "ほかの3つは、" + en("can") + " や " + en("can't") + " のあとが原形になっていて、正しい文です。"
        ]
      },
      {
        id: "f8",
        text: "友だちに次のように言われました。どういう意味ですか。",
        material: eibun("Can you open the window?"),
        choices: ["窓を開けてくれますか。", "窓を開けてもいいですか。", "窓を開けなさい。", "窓を開けましょう。"],
        answer: 0,
        explain: [
          en("Can you 〜?") + " は、「〜してくれますか」と相手にたのむときに使います。",
          "「〜してもいいですか」は、主語を自分にして " + en("Can I 〜?") + " と言います。",
          "「〜しなさい」は " + en("Open the window.") + "、「〜しましょう」は " + en("Let's open the window.") + " です。"
        ]
      },
      {
        id: "f9",
        text: Q_EN_TO_JA,
        material: eibun("Can I use your pen?"),
        choices: ["あなたのペンを使ってもいいですか。", "わたしのペンを使ってくれますか。", "あなたはペンを使えますか。", "あなたのペンを使いましょう。"],
        answer: 0,
        explain: [
          en("Can I 〜?") + " は、「(わたしが)〜してもいいですか」と許可を求める言い方です。",
          "使うのは「わたし(" + en("I") + ")」、ペンは「あなたの(" + en("your") + ")」ペンです。",
          "「〜してくれますか」「あなたは〜できますか」は " + en("Can you 〜?") + "、「〜しましょう」は " + en("Let's 〜.") + " です。"
        ]
      },
      {
        id: "f10",
        text: "Bの空所に入る文として、正しいものはどれですか。",
        material: kaiwa([["A", "Can you help me with my homework?", "宿題を手伝ってくれますか。"], ["B", B + " I'm busy now.", "今、いそがしいのです。"]]),
        choices: ens(["Sorry, I can't.", "Sure.", "Yes, I can.", "Yes, I do."]),
        answer: 0,
        explain: [
          "Bは、あとに「今、いそがしいのです」と続けています。手伝えないので、ことわる言い方が入ります。",
          en(key("Sorry, I can't.")) + "(ごめんなさい、できません。)",
          en("Sure.") + "(もちろん。)と " + en("Yes, I can.") + " は引き受ける言い方なので、あとの文と合いません。",
          en("Can you 〜?") + " に " + en("do") + " では答えません。"
        ]
      },
      {
        id: "f11",
        text: "「彼女はピアノをじょうずにひけます。」を、正しい語順で表した文はどれですか。",
        choices: ens(["She can play the piano well.", "She play can the piano well.", "She can the piano play well.", "Can she the piano play well."]),
        answer: 0,
        explain: [
          rule("主語 → can → 動詞の原形 → そのほか") + " の順に並べます。",
          en("She") + "(彼女は)→ " + en(key("can play")) + "(ひける)→ " + en("the piano") + "(ピアノを)→ " + en("well") + "(じょうずに)",
          en("can") + " と動詞の原形は、このままの順で続けて置きます。あいだに「〜を」を入れたり、順を逆にしたりしません。"
        ]
      },
      {
        id: "f12",
        text: Q_BLANK_PHRASE,
        material: eibun("My father " + B + " speak Chinese.", "わたしの父は中国語を話せます。"),
        choices: ["can", "cans", "is can", "does can"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "主語が三人称単数でも、" + en("can") + " の形は変わりません。" + en("s") + " をつけた " + en("cans") + " という形はありません。",
          en("can") + " の前に、be動詞や " + en("does") + " を置くこともありません。",
          en("My father " + fill("can") + " speak Chinese.")
        ]
      },
      {
        id: "f13",
        text: Q_EN_TO_JA,
        material: eibun("We can't see the sea from here."),
        choices: [
          "わたしたちはここから海が見えません。",
          "わたしたちはここから海が見えます。",
          "わたしはここから海が見えません。",
          "わたしたちはここから海を見ません。"
        ],
        answer: 0,
        explain: [
          en("can't see") + " は「見ることができない」、つまり「見えません」です。",
          en("We") + " は「わたしたちは」です。「わたしは」なら " + en("I") + " です。",
          "「見ません」は、" + en("can't") + " ではなく " + en("don't see") + " で表します。"
        ]
      },
      {
        id: "f14",
        text: en("cannot") + " を短くした形として、正しいものはどれですか。",
        choices: ["can't", "cann't", "cant'", "ca'nt"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("cannot") + " を短くした形は " + en(key("can't")) + " です。",
          en("n") + " は1つだけにして、" + en("n") + " と " + en("t") + " のあいだにアポストロフィ(')を入れます。",
          en("don't") + " や " + en("isn't") + " と同じ位置です。"
        ]
      },
      {
        id: "f15",
        text: "「ケンはじょうずに料理ができますか。」を表す文はどれですか。",
        choices: ens(["Can Ken cook well?", "Can Ken cooks well?", "Does Ken can cook well?", "Is Ken can cook well?"]),
        answer: 0,
        explain: [
          "「〜できますか」は、" + rule("Can + 主語 + 動詞の原形 〜?") + " で表します。",
          en(key("Can") + " Ken cook well?"),
          "主語が " + en("Ken") + " でも、動詞は原形の " + en("cook") + " です。",
          en("can") + " の疑問文に " + en("Does") + " や " + en("Is") + " は使いません。"
        ]
      }
    ]
  });

  // =====================================================================
  // 1-5 現在進行形
  // =====================================================================
  JHE.register("g1-present-progressive", {
    points: [
      "「(今)〜しているところです」は、" + rule("be動詞 + 動詞の ing 形") + " で表します。これを現在進行形といいます。be動詞は主語に合わせて " + en("am / are / is") + " を使い分けます。",
      en("ing") + " は、ふつうそのままつけます(" + henka("play", "playing") + ")。" + en("e") + " で終わる動詞は " + en("e") + " をとってつけます(" + henka("make", "making") + ")。" + en("run, swim, sit") + " などは、最後の文字を重ねてつけます(" + henka("run", "running") + ")。",
      "否定文は be動詞のあとに " + en("not") + " を置き、疑問文は be動詞を主語の前に出します。答えるときも be動詞を使います。",
      "be動詞を忘れないようにします。" + seigo("He playing soccer now.", "He " + key("is") + " playing soccer now."),
      en("like") + "(好きだ)、" + en("know") + "(知っている)、" + en("want") + "(ほしい)など、状態を表す動詞は、ふつう進行形にしません。"
    ],
    chart: hyo({
      caption: "ing 形の作り方",
      head: ["", "原形", "ing 形"],
      rows: [
        ["ふつう", "eat", "eating"],
        ["eをとる", "make", "making"],
        ["eをとる", "come", "coming"],
        ["重ねる", "run", "running"],
        ["重ねる", "sit", "sitting"]
      ]
    }),
    example: {
      title: "( )内の語を正しい形にかえて、「〜しています」という文にしなさい。" + eibun("The boys (run) in the park now.", "少年たちは今、公園で走っています。"),
      steps: [
        "「〜しています」なので、be動詞 + 動詞の " + en("ing") + " 形にします。",
        "主語 " + en("The boys") + " は複数なので、be動詞は " + en(key("are")) + " です。",
        en("run") + " は、最後の " + en("n") + " を重ねて " + en("ing") + " をつけます。" + henka("run", "running")
      ],
      result: en("are running")
    },
    fixed: [
      {
        id: "f1",
        text: Q_BLANK,
        material: eibun("I " + B + " studying English now.", "わたしは今、英語を勉強しています。"),
        choices: ["am", "is", "are", "do"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "現在進行形は、be動詞 + 動詞の " + en("ing") + " 形です。主語が " + en("I") + " なので、be動詞は " + en(key("am")) + " です。",
          en("is") + " と " + en("are") + " は " + en("I") + " に合いません。",
          en("do") + " のあとに " + en("ing") + " 形を続けて、進行形を作ることはできません。"
        ]
      },
      {
        id: "f2",
        text: Q_BLANK,
        material: eibun("She is " + B + " a letter now.", "彼女は今、手紙を書いています。"),
        choices: ["writing", "write", "writes", "writeing"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "be動詞 " + en("is") + " のあとに、動詞の " + en("ing") + " 形を置いて「〜しています」を表します。",
          en("write") + " は " + en("e") + " で終わるので、" + en("e") + " をとって " + en("ing") + " をつけます。" + henka("write", "writing"),
          en("is") + " のあとに、原形の " + en("write") + " や " + en("writes") + " をそのまま置くことはできません。"
        ]
      },
      {
        id: "f3",
        text: en("run") + " の ing 形として正しいものはどれですか。",
        choices: ["running", "runing", "runnying", "runeing"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("run") + " は、最後の文字 " + en("n") + " を重ねてから " + en("ing") + " をつけます。" + henka("run", "running"),
          en("n") + " を1つのままにした " + en("runing") + " は誤りです。",
          en("y") + " や " + en("e") + " を入れることもありません。"
        ]
      },
      {
        id: "f4",
        text: en("make") + " の ing 形として正しいものはどれですか。",
        choices: ["making", "makeing", "makking", "makes"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("make") + " は " + en("e") + " で終わるので、" + en("e") + " をとって " + en("ing") + " をつけます。" + henka("make", "making"),
          en("e") + " を残した " + en("makeing") + " や、" + en("k") + " を重ねた " + en("makking") + " は誤りです。",
          en("makes") + " は、主語が三人称単数のときの現在形です。"
        ]
      },
      {
        id: "f5",
        text: en("sit") + "(すわる)の ing 形として正しいものはどれですか。",
        choices: ["sitting", "siting", "siteing", "sittying"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("sit") + " は、最後の文字 " + en("t") + " を重ねてから " + en("ing") + " をつけます。" + henka("sit", "sitting"),
          en("run") + "(" + en("running") + ")や " + en("swim") + "(" + en("swimming") + ")と同じなかまです。",
          en("t") + " を1つのままにしたり、" + en("e") + " や " + en("y") + " を入れたりはしません。"
        ]
      },
      {
        id: "f6",
        text: Q_NEG,
        material: eibun("They are playing soccer.", "彼らはサッカーをしています。"),
        choices: ens(["They aren't playing soccer.", "They don't playing soccer.", "They aren't play soccer.", "They not are playing soccer."]),
        answer: 0,
        explain: [
          "進行形の否定文は、be動詞のあとに " + en("not") + " を置きます。" + en("are not") + " は " + en("aren't") + " と短くできます。",
          en("They " + key("aren't") + " playing soccer.") + "(彼らはサッカーをしていません。)",
          "進行形の否定に " + en("don't") + " は使いません。動詞は " + en("ing") + " 形のままにします。",
          en("not") + " を be動詞の前に置くこともできません。"
        ]
      },
      {
        id: "f7",
        text: Q_BLANK,
        material: eibun(B + " your mother cooking dinner now?", "あなたのお母さんは今、夕食を作っていますか。"),
        choices: ["Is", "Does", "Are", "Do"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "進行形の疑問文は、be動詞を主語の前に出します。主語 " + en("your mother") + " は三人称単数なので " + en(key("Is")) + " です。",
          en("Are") + " は " + en("you") + " や複数の主語に使います。すぐあとの " + en("your") + " につられないように注意します。",
          "動詞が " + en("cooking") + "(" + en("ing") + " 形)なので、" + en("Does") + " や " + en("Do") + " は使いません。"
        ]
      },
      {
        id: "f8",
        text: Q_REPLY,
        material: kaiwa([["A", "Are you listening to music?", "あなたは音楽を聞いているのですか。"], ["B", B]]),
        choices: ens(["Yes, I am.", "Yes, I do.", "Yes, I can.", "Yes, you are."]),
        answer: 0,
        explain: [
          "進行形の疑問文は be動詞で始まるので、答えも be動詞を使います。",
          en("Yes, I " + key("am") + "."),
          en("do") + " は " + en("Do you 〜?") + "、" + en("can") + " は " + en("Can you 〜?") + " への答えに使います。",
          en("Yes, you are.") + " は、たずねた相手のことを答えてしまっています。"
        ]
      },
      {
        id: "f9",
        text: Q_WRONG,
        choices: ens(["He is reading a book.", "We are watching TV now.", "My sister playing the piano now.", "I'm not sleeping."]),
        answer: 2,
        explain: [
          "進行形には、be動詞が必要です。" + en("ing") + " 形だけでは文の動詞になりません。",
          seigo("My sister playing the piano now.", "My sister " + key("is") + " playing the piano now."),
          "ほかの3つは、be動詞と " + en("ing") + " 形がそろっていて、正しい文です。"
        ]
      },
      {
        id: "f10",
        text: "「ケンは今、自分の部屋で勉強しています。」を表す文はどれですか。",
        choices: ens(["Ken is studying in his room now.", "Ken studying in his room now.", "Ken is study in his room now.", "Ken does studying in his room now."]),
        answer: 0,
        explain: [
          "「勉強しています」は、be動詞 + " + en("ing") + " 形で表します。主語 " + en("Ken") + " に合う be動詞は " + en("is") + " です。",
          en("Ken " + key("is studying") + " in his room now."),
          "be動詞がない形や、be動詞のあとが原形 " + en("study") + " のままの形は誤りです。",
          en("does") + " のあとに " + en("ing") + " 形を続けることもできません。"
        ]
      },
      {
        id: "f11",
        text: Q_EN_TO_JA,
        material: eibun("My father is washing his car now."),
        choices: [
          "わたしの父は今、車を洗っています。",
          "わたしの父は毎日、車を洗います。",
          "わたしの父は今、車を洗っていません。",
          "わたしの父は車を洗えます。"
        ],
        answer: 0,
        explain: [
          en("is washing") + " は現在進行形で、「(今)洗っています」という意味です。" + en("now") + " は「今」です。",
          "「毎日洗います」は " + en("washes his car every day") + " です。",
          en("not") + " がないので否定文ではありません。「洗えます」は " + en("can wash") + " です。"
        ]
      },
      {
        id: "f12",
        text: Q_BLANK_PHRASE,
        material: eibun("Yuki " + B + " the piano now.", "ユキは今、ピアノをひいています。"),
        choices: ens(["is playing", "are playing", "is play", "playing"]),
        answer: 0,
        explain: [
          "「ひいています」は、be動詞 + " + en("ing") + " 形で表します。主語 " + en("Yuki") + " は三人称単数なので、be動詞は " + en("is") + " です。",
          en("Yuki " + fill("is playing") + " the piano now."),
          en("are") + " は " + en("Yuki") + " に合いません。",
          "be動詞のあとを原形のままにしたり、be動詞をはぶいたりはできません。"
        ]
      },
      {
        id: "f13",
        text: "「わたしは彼の名前を知っています。」を表す文はどれですか。",
        choices: ens(["I know his name.", "I am knowing his name.", "I knowing his name.", "I am know his name."]),
        answer: 0,
        explain: [
          en("know") + "(知っている)は、動作ではなく状態を表す動詞です。ふつう進行形にしません。",
          "日本語が「知って<b>いる</b>」でも、英語では現在形の " + en("I " + key("know") + " his name.") + " で表します。",
          "be動詞のない " + en("I knowing") + " や、be動詞と原形を並べた " + en("I am know") + " は、形として誤りです。"
        ]
      },
      {
        id: "f14",
        text: "「彼らは公園で走っていますか。」を、正しい語順で表した文はどれですか。",
        choices: ens(["Are they running in the park?", "Do they running in the park?", "Are they run in the park?", "Are running they in the park?"]),
        answer: 0,
        explain: [
          "進行形の疑問文は、" + rule("be動詞 + 主語 + 動詞の ing 形 〜?") + " の順です。",
          en(key("Are") + " they " + key("running") + " in the park?"),
          "進行形の疑問文に " + en("Do") + " は使いません。動詞は " + en("ing") + " 形のままにします。",
          "主語 " + en("they") + " は、be動詞のすぐあとに置きます。"
        ]
      },
      {
        id: "f15",
        text: Q_REPLY_BLANK,
        material: kaiwa([["A", "Is Tom sleeping now?", "トムは今、ねむっていますか。"], ["B", "No, he " + B + ". He is doing his homework.", "いいえ。彼は宿題をしています。"]]),
        choices: ["isn't", "doesn't", "aren't", "can't"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("Is 〜?") + " でたずねられているので、be動詞を使って " + en("No, he " + fill("isn't") + ".") + " と答えます。",
          en("aren't") + " は " + en("he") + " に合いません。",
          en("doesn't") + " は " + en("Does 〜?") + "、" + en("can't") + " は " + en("Can 〜?") + " への答えに使います。"
        ]
      },
      {
        id: "f16",
        text: Q_BLANK,
        material: eibun("Ken and I " + B + " eating lunch now.", "ケンとわたしは今、昼食を食べています。"),
        choices: ["are", "am", "is", "do"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "主語は " + en("Ken and I") + " の2人なので複数です。be動詞は " + en(key("are")) + " を使います。",
          "すぐ前の " + en("I") + " だけを見て " + en("am") + " にしないように注意します。",
          en("is") + " は主語が1人のときに使います。" + en("do") + " のあとに " + en("ing") + " 形を続けることはできません。"
        ]
      }
    ]
  });

  // =====================================================================
  // 1-6 一般動詞の過去形
  // =====================================================================
  JHE.register("g1-past-tense", {
    points: [
      "過去のことを言うときは、動詞を" + rule("過去形") + "にします。主語が何であっても、過去形の形は同じです。" + en("yesterday") + "(昨日)、" + en("last week") + "(先週)、" + en("two days ago") + "(2日前)などといっしょによく使います。",
      "多くの動詞は " + en(key("ed")) + " をつけて過去形にします(" + henka("play", "played") + ")。これを規則動詞といいます。" + en("e") + " で終わる語には " + en("d") + " だけをつけます(" + henka("like", "liked") + ")。" + en("study") + " は " + en("y") + " を " + en("i") + " にかえて " + en("ed") + " をつけ(" + henka("study", "studied") + ")、" + en("stop") + " は最後の文字を重ねて " + en("ed") + " をつけます(" + henka("stop", "stopped") + ")。",
      en("ed") + " をつけず、形そのものが変わる動詞もあります(不規則動詞)。" + henka("go", "went") + " などは、1つずつ覚えます。",
      "否定文は " + en(key("did not")) + "(" + en(key("didn't")) + ")、疑問文は " + en(key("Did")) + " を使います。このとき、" + rule("動詞は原形") + " にもどします。" + seigo("I didn't went there.", "I didn't go there."),
      en("Did you 〜?") + " には、" + en("Yes, I did.") + " か " + en("No, I didn't.") + " で答えます。"
    ],
    chart: hyo({
      caption: "不規則動詞の過去形",
      head: ["", "原形", "過去形"],
      rows: [
        ["行く", "go", "went"],
        ["来る", "come", "came"],
        ["見る", "see", "saw"],
        ["持つ", "have", "had"],
        ["食べる", "eat", "ate"],
        ["作る", "make", "made"],
        ["買う", "buy", "bought"],
        ["する", "do", "did"]
      ]
    }),
    example: {
      title: "次の文を否定文に書きかえなさい。" + eibun("She went to the library yesterday.", "彼女は昨日、図書館へ行きました。"),
      steps: [
        "過去の否定文は、動詞の前に " + en(key("didn't")) + " を置きます。",
        en("didn't") + " のあとの動詞は、原形にもどします。" + henka("went", "go"),
        "主語が三人称単数でも、過去の文では " + en("doesn't") + " ではなく " + en("didn't") + " を使います。"
      ],
      result: en("She didn't go to the library yesterday.")
    },
    fixed: [
      {
        id: "f1",
        text: Q_BLANK,
        material: eibun("I " + B + " soccer with my friends yesterday.", "わたしは昨日、友だちとサッカーをしました。"),
        choices: ["played", "play", "plays", "playing"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("yesterday") + "(昨日)があるので、過去の文です。動詞を過去形の " + en(key("played")) + " にします。",
          en("play") + " と " + en("plays") + " は現在形なので、" + en("yesterday") + " と合いません。",
          en("playing") + " は、これだけでは文の動詞になりません。"
        ]
      },
      {
        id: "f2",
        text: en("study") + " の過去形として正しいものはどれですか。",
        choices: ["studied", "studyed", "studed", "studid"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("study") + " は、" + en("y") + " の前が " + en("d") + "(" + en("a, i, u, e, o") + " 以外の文字)です。",
          "このときは、" + en("y") + " を " + en("i") + " にかえて " + en("ed") + " をつけます。" + henka("study", "studied"),
          en("y") + " を残したままや、" + en("y") + " をとっただけの形にはしません。"
        ]
      },
      {
        id: "f3",
        text: en("go") + " の過去形として正しいものはどれですか。",
        choices: ["went", "goed", "gone", "wented"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("go") + " は不規則動詞で、過去形は " + en(key("went")) + " です。" + en("ed") + " はつけません。",
          en("goed") + "、" + en("wented") + " という形はありません。",
          en("gone") + " は過去形ではない、別の形です(あとの学年で習います)。"
        ]
      },
      {
        id: "f4",
        text: en("see") + "(見る)の過去形として正しいものはどれですか。",
        choices: ["saw", "seed", "seen", "sees"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("see") + " は不規則動詞で、過去形は " + en(key("saw")) + " です。",
          en("ed") + " をつけた形にはなりません。" + en("sees") + " は、主語が三人称単数のときの現在形です。",
          en("seen") + " は過去形ではない、別の形です(あとの学年で習います)。"
        ]
      },
      {
        id: "f5",
        text: en("stop") + "(止まる)の過去形として正しいものはどれですか。",
        choices: ["stopped", "stoped", "stopt", "stopied"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("stop") + " は、最後の文字 " + en("p") + " を重ねてから " + en("ed") + " をつけます。" + henka("stop", "stopped"),
          en("p") + " を1つのままにした " + en("stoped") + " は誤りです。",
          en("y") + " で終わる語ではないので、" + en("ied") + " にはなりません。"
        ]
      },
      {
        id: "f6",
        text: en("buy") + "(買う)の過去形として正しいものはどれですか。",
        choices: ["bought", "buyed", "brought", "boughted"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("buy") + " は不規則動詞で、過去形は " + en(key("bought")) + " です。",
          en("brought") + " は、" + en("bring") + "(持ってくる)の過去形です。" + en("r") + " があるかどうかに注意します。",
          en("buyed") + "、" + en("boughted") + " という形はありません。"
        ]
      },
      {
        id: "f7",
        text: Q_BLANK,
        material: eibun("We " + B + " watch TV last night.", "わたしたちは昨夜、テレビを見ませんでした。"),
        choices: ["didn't", "don't", "doesn't", "weren't"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("last night") + "(昨夜)があるので、過去の文です。一般動詞の過去の否定文には " + en(key("didn't")) + " を使います。",
          en("don't") + " と " + en("doesn't") + " は現在の文に使います。",
          en("weren't") + " は be動詞の否定なので、一般動詞 " + en("watch") + " の原形の前には置けません。"
        ]
      },
      {
        id: "f8",
        text: Q_NEG,
        material: eibun("He came to school yesterday.", "彼は昨日、学校に来ました。"),
        choices: ens(["He didn't come to school yesterday.", "He didn't came to school yesterday.", "He doesn't came to school yesterday.", "He wasn't come to school yesterday."]),
        answer: 0,
        explain: [
          "過去の否定文は、" + rule("didn't + 動詞の原形") + " で作ります。",
          en("came") + " を原形にもどします。" + henka("came", "come"),
          en("He " + key("didn't come") + " to school yesterday."),
          en("didn't") + " のあとを過去形のままにはしません。" + en("doesn't") + " は現在の文、" + en("wasn't") + " は be動詞の文に使います。"
        ]
      },
      {
        id: "f9",
        text: Q_BLANK,
        material: eibun(B + " you do your homework last night?", "あなたは昨夜、宿題をしましたか。"),
        choices: ["Did", "Do", "Does", "Were"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("last night") + " があるので、過去の文です。一般動詞の過去の疑問文は " + en(key("Did")) + " で始めます。",
          en("Do") + " と " + en("Does") + " は現在の文に使います。",
          en("Were") + " は be動詞です。一般動詞 " + en("do") + "(する)の疑問文には使いません。"
        ]
      },
      {
        id: "f10",
        text: Q_REPLY,
        material: kaiwa([["A", "Did Emi make this cake?", "エミがこのケーキを作ったのですか。"], ["B", B]]),
        choices: ens(["Yes, she did.", "Yes, she does.", "Yes, she was.", "Yes, I did."]),
        answer: 0,
        explain: [
          en("Did 〜?") + " の疑問文には、" + en("did") + " を使って答えます。" + en("Emi") + " は " + en("she") + " で受けます。",
          en("Yes, she " + key("did") + "."),
          en("does") + " は現在の文、" + en("was") + " は be動詞の文への答えに使います。",
          en("Yes, I did.") + " は、自分のことを答えてしまっています。"
        ]
      },
      {
        id: "f11",
        text: Q_QUES,
        material: eibun("Ken bought a new bag.", "ケンは新しいかばんを買いました。"),
        choices: ens(["Did Ken buy a new bag?", "Did Ken bought a new bag?", "Do Ken bought a new bag?", "Was Ken buy a new bag?"]),
        answer: 0,
        explain: [
          "過去の疑問文は、" + rule("Did + 主語 + 動詞の原形 〜?") + " で作ります。",
          en("bought") + " を原形にもどします。" + henka("bought", "buy"),
          en(key("Did") + " Ken " + key("buy") + " a new bag?"),
          en("Did") + " のあとを過去形のままにはしません。" + en("Do") + " や be動詞の " + en("Was") + " も使いません。"
        ]
      },
      {
        id: "f12",
        text: Q_WRONG,
        choices: ens(["I visited my grandmother last Sunday.", "She ate breakfast at seven.", "They didn't played tennis yesterday.", "Did you see the movie?"]),
        answer: 2,
        explain: [
          en("didn't") + " のあとの動詞は、原形にします。",
          seigo("They didn't played tennis yesterday.", "They didn't " + key("play") + " tennis yesterday."),
          "ほかの3つは正しい文です。" + en("visited") + " と " + en("ate") + " は過去形、" + en("Did") + " のあとの " + en("see") + " は原形になっています。"
        ]
      },
      {
        id: "f13",
        text: "「わたしは3日前に京都へ行きました。」を表す文はどれですか。",
        choices: ens(["I went to Kyoto three days ago.", "I go to Kyoto three days ago.", "I goed to Kyoto three days ago.", "I was go to Kyoto three days ago."]),
        answer: 0,
        explain: [
          en("three days ago") + "(3日前に)があるので、過去の文です。" + en("go") + " の過去形は " + en(key("went")) + " です。",
          "現在形の " + en("go") + " は、" + en("three days ago") + " と合いません。",
          en("goed") + " という形はありません。be動詞 " + en("was") + " と原形 " + en("go") + " を並べることもできません。"
        ]
      },
      {
        id: "f14",
        text: Q_EN_TO_JA,
        material: eibun("My sister didn't eat breakfast this morning."),
        choices: [
          "わたしの姉は今朝、朝食を食べませんでした。",
          "わたしの姉は今朝、朝食を食べました。",
          "わたしの姉は毎朝、朝食を食べません。",
          "わたしの姉は今朝、朝食を作りませんでした。"
        ],
        answer: 0,
        explain: [
          en("didn't eat") + " は「食べませんでした」、" + en("this morning") + " は「今朝」です。",
          en("didn't") + " があるので、過去の否定文です。「食べました」なら " + en("ate") + " です。",
          "「毎朝」は " + en("every morning") + "、「作る」は " + en("make") + " です。"
        ]
      },
      {
        id: "f15",
        text: Q_BLANK_PHRASE,
        material: eibun("I cleaned my room " + B + ".", "わたしは(　　)自分の部屋をそうじしました。"),
        choices: ["yesterday", "tomorrow", "now", "next week"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "動詞が過去形の " + en("cleaned") + " なので、過去を表す " + en(key("yesterday")) + "(昨日)が合います。",
          en("tomorrow") + "(明日)と " + en("next week") + "(来週)は、これからのことを表します。",
          en("now") + "(今)は、現在のことを言うときに使います。"
        ]
      },
      {
        id: "f16",
        text: en("have") + " の過去形として正しいものはどれですか。",
        choices: ["had", "haved", "has", "hads"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("have") + " は不規則動詞で、過去形は " + en(key("had")) + " です。",
          en("has") + " は、主語が三人称単数のときの現在形です。",
          en("haved") + "、" + en("hads") + " という形はありません。過去形は、主語が何であっても " + en("had") + " です。"
        ]
      }
    ]
  });

  // =====================================================================
  // 1-7 be動詞の過去形と過去進行形
  // =====================================================================
  JHE.register("g1-be-past-progressive", {
    points: [
      "be動詞の過去形は " + rule("was / were") + " の2つです。" + en("am") + " と " + en("is") + " は " + en(key("was")) + " に、" + en("are") + " は " + en(key("were")) + " になります。「〜でした」「〜にいました」という意味です。",
      "否定文は " + en("was not") + "(" + en("wasn't") + ")、" + en("were not") + "(" + en("weren't") + ")を使います。疑問文は " + en("was / were") + " を主語の前に出し、答えるときも " + en("was / were") + " を使います。",
      "「(そのとき)〜していました」は、" + rule("was / were + 動詞の ing 形") + " で表します。これを過去進行形といいます。",
      "be動詞の文には " + en("did") + " を使いません。" + seigo("Did you busy yesterday?", key("Were") + " you busy yesterday?"),
      "一般動詞の過去の文は " + en("did") + "、be動詞の過去の文と過去進行形は " + en("was / were") + " で、否定文や疑問文を作ります。"
    ],
    chart: hyo({
      caption: "be動詞の現在形と過去形",
      head: ["", "主語", "現在形", "過去形"],
      rows: [
        ["私", "I", "am", "was"],
        ["あなた", "you", "are", "were"],
        ["彼", "he", "is", "was"],
        ["彼女", "she", "is", "was"],
        ["それ", "it", "is", "was"],
        ["私たち", "we", "are", "were"],
        ["彼ら", "they", "are", "were"]
      ],
      compact: true
    }),
    example: {
      title: "( )内の語を正しい形にかえて、「〜していました」という文にしなさい。" + eibun("We (play) soccer at three yesterday.", "わたしたちは昨日の3時に、サッカーをしていました。"),
      steps: [
        "「〜していました」なので、過去進行形(" + en("was / were") + " + " + en("ing") + " 形)にします。",
        "主語 " + en("We") + " は複数なので、be動詞は " + en(key("were")) + " です。",
        en("play") + " は、そのまま " + en("ing") + " をつけます。" + henka("play", "playing")
      ],
      result: en("were playing")
    },
    fixed: [
      {
        id: "f1",
        text: Q_BLANK,
        material: eibun("I " + B + " tired yesterday.", "わたしは昨日、疲れていました。"),
        choices: ["was", "were", "am", "did"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("yesterday") + " があるので、過去の文です。主語 " + en("I") + " に合う be動詞の過去形は " + en(key("was")) + " です。",
          en("were") + " は " + en("you") + " や複数の主語に使います。" + en("am") + " は現在形なので、" + en("yesterday") + " と合いません。",
          en("tired") + "(疲れている)は、ようすを表す語です。" + en("did") + " のあとには続けられません。"
        ]
      },
      {
        id: "f2",
        text: Q_BLANK,
        material: eibun("My parents " + B + " in Osaka last week.", "わたしの両親は先週、大阪にいました。"),
        choices: ["were", "was", "are", "did"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "主語 " + en("My parents") + "(わたしの両親)は複数です。be動詞の過去形は " + en(key("were")) + " を使います。",
          en("was") + " は主語が1人・1つのときに使います。" + en("are") + " は現在形なので、" + en("last week") + " と合いません。",
          "「〜にいました」は be動詞で表すので、" + en("did") + " は使いません。"
        ]
      },
      {
        id: "f3",
        text: en("is") + " の過去形として正しいものはどれですか。",
        choices: ["was", "were", "did", "been"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("am") + " と " + en("is") + " の過去形は " + en(key("was")) + " です。",
          en("were") + " は " + en("are") + " の過去形、" + en("did") + " は " + en("do") + " の過去形です。",
          en("been") + " は過去形ではない、別の形です(あとの学年で習います)。"
        ]
      },
      {
        id: "f4",
        text: "日本語の文に合うように、空所に入る語を選びなさい。",
        material: eibun("The movie " + B + " interesting.", "その映画はおもしろくありませんでした。"),
        choices: ["wasn't", "weren't", "didn't", "isn't"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "「〜ではありませんでした」は、be動詞の過去の否定です。主語 " + en("The movie") + " は1つなので " + en(key("wasn't")) + " を使います。",
          en("weren't") + " は " + en("you") + " や複数の主語に使います。" + en("isn't") + " は現在の文で、「おもしろくありません」という意味になります。",
          en("interesting") + "(おもしろい)は、ようすを表す語です。" + en("didn't") + " のあとには続けられません。"
        ]
      },
      {
        id: "f5",
        text: Q_BLANK,
        material: eibun(B + " you at home last night?", "あなたは昨夜、家にいましたか。"),
        choices: ["Were", "Was", "Did", "Are"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "「〜にいましたか」は、be動詞の過去の疑問文です。主語 " + en("you") + " には " + en(key("Were")) + " を使います。",
          en("Was") + " は " + en("you") + " に合いません。" + en("Are") + " は現在形なので、" + en("last night") + " と合いません。",
          "この文には一般動詞がないので、" + en("Did") + " は使えません。"
        ]
      },
      {
        id: "f6",
        text: Q_REPLY,
        material: kaiwa([["A", "Was your brother in the gym then?", "あなたのお兄さんはそのとき、体育館にいましたか。"], ["B", B]]),
        choices: ens(["Yes, he was.", "Yes, he did.", "Yes, he is.", "Yes, he were."]),
        answer: 0,
        explain: [
          en("Was 〜?") + " の疑問文には、" + en("was") + " を使って答えます。",
          en("Yes, he " + key("was") + "."),
          en("did") + " は " + en("Did 〜?") + " への答えに使います。" + en("is") + " は現在形なので、過去のことをたずねた質問と合いません。",
          en("he") + " に " + en("were") + " は使いません。"
        ]
      },
      {
        id: "f7",
        text: Q_BLANK,
        material: eibun("I " + B + " watching TV at nine last night.", "わたしは昨夜の9時に、テレビを見ていました。"),
        choices: ["was", "were", "am", "did"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "「見ていました」は過去進行形で、" + en("was / were") + " + " + en("ing") + " 形で表します。主語が " + en("I") + " なので " + en(key("was")) + " です。",
          en("were") + " は " + en("I") + " に合いません。" + en("am") + " は現在形なので、" + en("last night") + " と合いません。",
          en("did") + " のあとに " + en("ing") + " 形を続けることはできません。"
        ]
      },
      {
        id: "f8",
        text: Q_BLANK,
        material: eibun("They were " + B + " in the pool then.", "彼らはそのとき、プールで泳いでいました。"),
        choices: ["swimming", "swim", "swam", "swiming"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("were") + " のあとに動詞の " + en("ing") + " 形を置いて、「〜していました」を表します。",
          en("swim") + " は、最後の文字 " + en("m") + " を重ねて " + en("ing") + " をつけます。" + henka("swim", "swimming"),
          en("were") + " のあとに、原形の " + en("swim") + " や過去形の " + en("swam") + " をそのまま置くことはできません。"
        ]
      },
      {
        id: "f9",
        text: Q_WRONG,
        choices: ens(["She was reading a book then.", "We were very hungry.", "Tom and Ken was playing tennis.", "It was sunny yesterday."]),
        answer: 2,
        explain: [
          "主語 " + en("Tom and Ken") + " は2人なので複数です。be動詞は " + en("were") + " にします。",
          seigo("Tom and Ken was playing tennis.", "Tom and Ken " + key("were") + " playing tennis."),
          "ほかの3つは、" + en("She") + " と " + en("was") + "、" + en("We") + " と " + en("were") + "、" + en("It") + " と " + en("was") + " が正しく組み合わさっています。"
        ]
      },
      {
        id: "f10",
        text: Q_QUES,
        material: eibun("Yuki was sleeping then.", "ユキはそのとき、ねむっていました。"),
        choices: ens(["Was Yuki sleeping then?", "Did Yuki sleeping then?", "Was Yuki sleep then?", "Were Yuki sleeping then?"]),
        answer: 0,
        explain: [
          "過去進行形の疑問文は、" + en("was / were") + " を主語の前に出します。",
          en(key("Was") + " Yuki sleeping then?") + "(ユキはそのとき、ねむっていましたか。)",
          "過去進行形の疑問文に " + en("Did") + " は使いません。動詞は " + en("ing") + " 形のままにします。",
          "主語 " + en("Yuki") + " は1人なので、" + en("Were") + " は合いません。"
        ]
      },
      {
        id: "f11",
        text: "「わたしはそのとき、宿題をしていました。」を表す文はどれですか。",
        choices: ens(["I was doing my homework then.", "I was do my homework then.", "I am doing my homework then.", "I were doing my homework then."]),
        answer: 0,
        explain: [
          "「していました」は過去進行形です。主語 " + en("I") + " には " + en("was") + " を使い、" + en("do") + " を " + en("ing") + " 形にします。",
          en("I " + key("was doing") + " my homework then."),
          en("was") + " のあとを原形のままにはしません。" + en("am doing") + " は現在進行形で、「しています」という意味です。",
          en("I") + " に " + en("were") + " は使いません。"
        ]
      },
      {
        id: "f12",
        text: Q_EN_TO_JA,
        material: eibun("We were not in the classroom."),
        choices: [
          "わたしたちは教室にいませんでした。",
          "わたしたちは教室にいません。",
          "わたしたちは教室にいました。",
          "わたしは教室にいませんでした。"
        ],
        answer: 0,
        explain: [
          en("were not") + " は be動詞の過去の否定で、「〜にいませんでした」という意味です。",
          "「いません」(現在)なら " + en("are not") + " です。" + en("not") + " があるので、「いました」ではありません。",
          en("We") + " は「わたしたちは」です。"
        ]
      },
      {
        id: "f13",
        text: Q_BLANK,
        material: eibun(B + " you play tennis yesterday?", "あなたは昨日、テニスをしましたか。"),
        choices: ["Did", "Were", "Was", "Are"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "動詞は一般動詞の " + en("play") + "(原形)です。一般動詞の過去の疑問文は " + en(key("Did")) + " で始めます。",
          en("Were, Was, Are") + " は be動詞です。あとに原形の " + en("play") + " を続けることはできません。",
          "be動詞を使うなら、" + en("Were you playing 〜?") + "(〜していましたか)のように " + en("ing") + " 形にします。"
        ]
      },
      {
        id: "f14",
        text: Q_REPLY_BLANK,
        material: kaiwa([["A", "Were you and Mika in the library?", "あなたとミカは図書館にいましたか。"], ["B", "No, we " + B + ". We were in the music room.", "いいえ。わたしたちは音楽室にいました。"]]),
        choices: ["weren't", "wasn't", "didn't", "aren't"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("Were 〜?") + " でたずねられているので、" + en("No, we " + fill("weren't") + ".") + " と答えます。",
          en("wasn't") + " は " + en("we") + " に合いません。" + en("didn't") + " は " + en("Did 〜?") + " への答えに使います。",
          en("aren't") + " は現在形なので、過去のことをたずねた質問と合いません。"
        ]
      },
      {
        id: "f15",
        text: "「彼はそのとき、音楽を聞いていませんでした。」を、正しい語順で表した文はどれですか。",
        choices: ens(["He wasn't listening to music then.", "He didn't listening to music then.", "He wasn't listen to music then.", "He listening wasn't to music then."]),
        answer: 0,
        explain: [
          "過去進行形の否定文は、" + rule("主語 + wasn't / weren't + 動詞の ing 形") + " の順です。",
          en("He " + key("wasn't listening") + " to music then."),
          "進行形の否定に " + en("didn't") + " は使いません。" + en("wasn't") + " のあとの動詞は " + en("ing") + " 形にします。",
          en("wasn't") + " は、" + en("ing") + " 形の前に置きます。"
        ]
      }
    ]
  });
})();
