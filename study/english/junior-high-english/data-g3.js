// 中学英語道場: 中3「動詞」「文の形」の6単元の中身(要点・表・例題・問題)。
// 形式の説明と、表示部品の関数(JHE.en、JHE.eibun など)は data.js の先頭を参照。
// 中3「準動詞」「文の形」の残り6単元は data-g3-2.js にある。このファイルも同じ形で書く。
//
// 内容のきまり:
// ・学校文法の説明に合わせる。教科書によって扱いが分かれる点には踏みこまない。
// ・英文はすべて自作。中2までの語彙と文法に、その単元までの中3の内容を足した範囲で書く
//   (受け身の単元では現在完了を使わない。分詞・関係代名詞・仮定法・want 人 to などはこのファイルでは使わない)。
// ・受け身は「be動詞 + 過去分詞」だけを扱い、助動詞のある受け身(can be 〜 など)は出さない。
// ・現在完了は、yesterday、〜 ago、last 〜、When 〜? といっしょに使わない。
//   for と since、現在完了と過去形がどちらも成り立つ空所は作らない。
// ・表は、英語のセルを半角6字までにする(written など長い語は要点の文に書く)。
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
  var Q_JA_BLANK = "日本語の文に合うように、空所に入る語を選びなさい。";
  var Q_REPLY = "Aの質問に対する、Bの答えとして正しいものはどれですか。";
  var Q_REPLY_BLANK = "Bの空所に入る語はどれですか。";
  var Q_WRONG = "誤りのある文はどれですか。";
  var Q_RIGHT = "正しい文はどれですか。";
  var Q_EN_TO_JA = "次の英文の意味として正しいものはどれですか。";
  var Q_NEG = "次の文を否定文に書きかえたものはどれですか。";
  var Q_QUES = "次の文を疑問文に書きかえたものはどれですか。";
  var Q_JOIN = "次の2つの文を、ほぼ同じ意味の1つの文にしたものはどれですか。";
  function qPP(verb) { return en(verb) + " の過去分詞として正しいものはどれですか。"; }
  function qJa(ja) { return "「" + ja + "」を表す文はどれですか。"; }
  function qOrder(ja) { return "「" + ja + "」を、正しい語順で表した文はどれですか。"; }

  // =====================================================================
  // 3-1 受け身
  // =====================================================================
  JHE.register("g3-passive", {
    points: [
      "「〜される」「〜されている」は、" + rule("be動詞 + 過去分詞") + " で表します。これを受け身(受動態)といいます。be動詞は、主語と時(現在・過去)に合わせて " + en("am / are / is / was / were") + " を使い分けます。",
      "規則動詞の過去分詞は、過去形と同じ " + en("ed") + " の形です(" + henka("use", "used") + ")。不規則動詞には、過去形と同じ形のもの(" + henka("make", "made") + ")と、ちがう形のもの(" + henka("write", "written") + "、" + henka("break", "broken") + ")があります。",
      "「だれによって」を言うときは、過去分詞のあとに " + rule("by 〜") + " を置きます。" + en("by") + " のあとの代名詞は " + en("me / him / her / us / them") + " の形にします。だれがするのかを言わなくてよいときは、" + en("by 〜") + " をつけません。",
      "否定文は be動詞のあとに " + en("not") + " を置き、疑問文は be動詞を主語の前に出します。" + en("do / does / did") + " は使いません。" + seigo("Does this room cleaned every day?", key("Is") + " this room cleaned every day?"),
      "「〜が…する」の文を受け身にするときは、" + rule("目的語を主語にし") + "、もとの主語を " + en("by") + " のあとに置きます。" + en("Ken wrote this letter.") + " → " + en("This letter " + key("was written") + " by Ken.")
    ],
    chart: hyo({
      caption: "不規則動詞の過去形と過去分詞",
      head: ["", "原形", "過去形", "過去分詞"],
      rows: [
        ["作る", "make", "made", "made"],
        ["建てる", "build", "built", "built"],
        ["見る", "see", "saw", "seen"],
        ["とる", "take", "took", "taken"],
        ["話す", "speak", "spoke", "spoken"],
        ["知る", "know", "knew", "known"],
        ["歌う", "sing", "sang", "sung"],
        ["食べる", "eat", "ate", "eaten"]
      ],
      compact: true
    }) + gojun([
      { role: "主語", en: "This song", ja: "この歌は" },
      { role: "be動詞", en: "is", key: true },
      { role: "過去分詞", en: "loved", ja: "愛されている", key: true },
      { role: "by 〜", en: "by many people.", ja: "多くの人に" }
    ], "受け身の文"),
    example: {
      title: "次の文を受け身の文に書きかえなさい。" + eibun("Mr. Tanaka took these pictures.", "田中さんがこれらの写真をとりました。"),
      steps: [
        "目的語の " + en("these pictures") + "(これらの写真)を、主語にします。",
        "主語が複数で、過去の文なので、be動詞は " + en(key("were")) + " です。",
        en("took") + " を過去分詞にします。" + henka("take", "taken"),
        "もとの主語 " + en("Mr. Tanaka") + " は、" + en("by") + " のあとに置きます。"
      ],
      result: en("These pictures were taken by Mr. Tanaka.")
    },
    fixed: [
      {
        id: "f1",
        text: Q_BLANK,
        material: eibun("English " + B + " spoken in many countries.", "英語は多くの国で話されています。"),
        choices: ["are", "does", "is", "be"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          "「話されています」なので、受け身(be動詞 + 過去分詞)の文です。主語 " + en("English") + " は1つのものなので、be動詞は " + en(key("is")) + " です。",
          en("are") + " は複数の主語に使います。" + en("be") + " は原形なので、このままでは使えません。",
          "受け身の文には " + en("does") + " を使いません。"
        ]
      },
      {
        id: "f2",
        text: qPP("write"),
        choices: ["wrote", "writed", "written", "writen"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          en("write") + " は不規則動詞で、" + en("write - wrote - " + key("written")) + " と変化します。",
          en("wrote") + " は過去形です。過去分詞とは形がちがいます。",
          en("writed") + " という形はありません。" + en("written") + " は " + en("t") + " を重ねます。"
        ]
      },
      {
        id: "f3",
        text: Q_BLANK,
        material: eibun("This temple was " + B + " about 600 years ago.", "この寺はおよそ600年前に建てられました。"),
        choices: ["built", "build", "builded", "builds"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "「建てられました」なので、" + en("was") + " のあとに過去分詞を置きます。" + en("build") + " の過去分詞は " + en(key("built")) + " です。",
          en("build") + " と " + en("builds") + " は現在形・原形で、be動詞のあとには置けません。",
          en("builded") + " という形はありません。"
        ]
      },
      {
        id: "f4",
        text: Q_BLANK,
        material: eibun("This book was written " + B + " a famous singer.", "この本は有名な歌手によって書かれました。"),
        choices: ["in", "at", "from", "by"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          "受け身の文で「〜によって」と、だれがしたのかを表すときは " + en(key("by")) + " を使います。",
          eibun("This book was written " + fill("by") + " a famous singer."),
          en("in") + "(〜の中に)、" + en("at") + "(〜で)、" + en("from") + "(〜から)では、書いた人を表せません。"
        ]
      },
      {
        id: "f5",
        text: Q_NEG,
        material: eibun("This room is used on Sundays.", "この部屋は日曜日に使われます。"),
        choices: ens(["This room doesn't used on Sundays.", "This room isn't use on Sundays.", "This room doesn't be used on Sundays.", "This room isn't used on Sundays."]),
        answer: 3,
        explain: [
          "受け身の否定文は、" + rule("be動詞のあとに not") + " を置きます。過去分詞はそのままです。",
          en("This room " + key("isn't") + " used on Sundays."),
          "受け身の文に " + en("doesn't") + " は使いません。" + en("isn't") + " のあとを原形の " + en("use") + " にすることもしません。"
        ]
      },
      {
        id: "f6",
        text: Q_QUES,
        material: eibun("These cookies were made by your sister.", "これらのクッキーはあなたのお姉さんによって作られました。"),
        choices: ens(["Did these cookies made by your sister?", "Were these cookies made by your sister?", "Were these cookies make by your sister?", "Was these cookies made by your sister?"]),
        answer: 1,
        explain: [
          "受け身の疑問文は、" + rule("be動詞を主語の前に出します") + "。",
          en(key("Were") + " these cookies made by your sister?"),
          "主語 " + en("these cookies") + " は複数なので、" + en("Was") + " ではなく " + en("Were") + " です。",
          en("Did") + " は使いません。過去分詞 " + en("made") + " を原形の " + en("make") + " にもどすこともしません。"
        ]
      },
      {
        id: "f7",
        text: Q_REPLY,
        material: kaiwa([["A", "Is this computer used by your father?", "このコンピューターはあなたのお父さんに使われていますか。"], ["B", B]]),
        choices: ens(["Yes, it is.", "Yes, he is.", "Yes, it does.", "Yes, he does."]),
        answer: 0,
        explain: [
          "質問の主語は " + en("this computer") + " なので、答えでは " + en("it") + " で受けます。be動詞の疑問文なので、be動詞で答えます。",
          en("Yes, " + key("it is") + "."),
          en("he") + " はお父さんのことで、質問の主語ではありません。",
          "受け身の疑問文には " + en("does") + " で答えません。"
        ]
      },
      {
        id: "f8",
        text: Q_EN_TO_JA,
        material: eibun("The window was broken by Tom."),
        choices: [
          "その窓はトムによってこわされます。",
          "その窓はトムによってこわされました。",
          "その窓はトムによってこわされませんでした。",
          "トムはその窓をこわしていました。"
        ],
        answer: 1,
        explain: [
          en("was broken") + " は「こわされた」、" + en("by Tom") + " は「トムによって」です。",
          en("was") + " があるので過去の文です。「こわされます」は現在のことになります。",
          en("not") + " がないので否定文ではありません。「こわしていました」なら " + en("Tom was breaking the window.") + " です。"
        ]
      },
      {
        id: "f9",
        text: Q_WRONG,
        choices: ens(["Soccer is played all over the world.", "These photos were taken in Kyoto.", "This song is sung by children.", "The letter was wrote by my grandmother."]),
        answer: 3,
        explain: [
          "受け身の be動詞のあとには、過去形ではなく過去分詞を置きます。",
          seigo("The letter was wrote by my grandmother.", "The letter was " + key("written") + " by my grandmother."),
          "ほかの3つは、" + en("played") + "、" + en("taken") + "、" + en("sung") + " と、正しく過去分詞になっています。"
        ]
      },
      {
        id: "f10",
        text: "次の文を受け身の文に書きかえたものはどれですか。",
        material: eibun("Many students visit this museum.", "多くの生徒がこの博物館を訪れます。"),
        choices: ens(["This museum visited by many students.", "Many students are visited by this museum.", "This museum is visited by many students.", "This museum was visited by many students."]),
        answer: 2,
        explain: [
          "目的語の " + en("this museum") + " を主語にし、もとの主語 " + en("many students") + " は " + en("by") + " のあとに置きます。",
          "もとの文は現在の文で、主語 " + en("this museum") + " は1つなので、" + en(key("is visited")) + " です。",
          en("was") + " にすると過去の文になってしまいます。be動詞をぬかすと受け身になりません。",
          en("Many students are visited by this museum.") + " は、主語と " + en("by") + " のあとが入れかわっています。"
        ]
      },
      {
        id: "f11",
        text: qJa("これらの車は日本で作られました。"),
        choices: ens(["These cars made in Japan.", "These cars were made in Japan.", "These cars were make in Japan.", "These cars did made in Japan."]),
        answer: 1,
        explain: [
          "「作られました」は過去の受け身です。主語 " + en("these cars") + " は複数なので、" + en(key("were made")) + " にします。",
          "be動詞がないと、受け身の文になりません。",
          "be動詞のあとは、原形の " + en("make") + " ではなく過去分詞の " + en("made") + " です。受け身に " + en("did") + " は使いません。"
        ]
      },
      {
        id: "f12",
        text: Q_BLANK,
        material: eibun("The picture was painted by " + B + ".", "その絵は彼女によってかかれました。"),
        choices: ["her", "she", "hers", "she's"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("by") + " は前置詞なので、あとの代名詞は「〜を・〜に」の形にします。" + en("she") + " は " + en(key("her")) + " です。",
          en("she") + " は主語の形です。" + en("hers") + " は「彼女のもの」です。",
          en("she's") + " は " + en("she is") + " を短くした形です。"
        ]
      },
      {
        id: "f13",
        text: Q_BLANK,
        material: kaiwa([["A", "When " + B + " this bridge built?", "この橋はいつ建てられましたか。"], ["B", "In 1990.", "1990年です。"]]),
        choices: ["were", "was", "did", "does"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          "「建てられましたか」なので、過去の受け身の疑問文です。疑問詞のあとに be動詞を置きます。",
          "主語 " + en("this bridge") + " は1つなので、be動詞は " + en(key("was")) + " です。" + en("were") + " は複数の主語や " + en("you") + " に使います。",
          "受け身の文には " + en("did") + " や " + en("does") + " を使いません。"
        ]
      },
      {
        id: "f14",
        text: qOrder("その祭りは毎年8月に開かれます。"),
        choices: ens(["The festival holds every August.", "The festival held is every August.", "The festival is hold every August.", "The festival is held every August."]),
        answer: 3,
        explain: [
          "「開かれます」は受け身なので、" + rule("主語 + be動詞 + 過去分詞") + " の順に並べます。" + en("hold") + "(開く)の過去分詞は " + en("held") + " です。",
          en("The festival " + key("is held") + " every August."),
          en("The festival holds") + " では「祭りが開く」になってしまいます。be動詞は過去分詞の前に置きます。",
          "be動詞のあとは、原形の " + en("hold") + " ではなく過去分詞です。"
        ]
      },
      {
        id: "f15",
        text: Q_REPLY_BLANK,
        material: kaiwa([["A", "Was this cake made by your mother?", "このケーキはお母さんが作ったのですか。"], ["B", "No, it " + B + ". My father made it.", "いいえ。父が作りました。"]]),
        choices: ["didn't", "isn't", "doesn't", "wasn't"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          en("Was 〜?") + " でたずねられた受け身の疑問文には、" + en("was") + " を使って答えます。",
          en("No, it " + fill("wasn't") + "."),
          en("didn't") + " と " + en("doesn't") + " は一般動詞の文に使います。" + en("isn't") + " は現在の文なので、" + en("Was") + " の質問と合いません。"
        ]
      }
    ]
  });

  // =====================================================================
  // 3-2 現在完了(継続)
  // =====================================================================
  JHE.register("g3-present-perfect-continuation", {
    points: [
      rule("have / has + 過去分詞") + " の形を現在完了といいます。過去に始まったことが、今とつながっていることを表します。主語が三人称単数のときは " + en("has") + " を使います。be動詞の過去分詞は " + en(key("been")) + " です。",
      "「(ずっと)〜している」(継続)は、現在完了で表します。期間の長さは " + rule("for 〜") + "(〜の間)、始まった時は " + rule("since 〜") + "(〜から、〜以来)で言います。" + en("for three years") + "、" + en("since 2020") + "。",
      "否定文は " + en("have / has") + " のあとに " + en("not") + " を置きます(" + en("haven't / hasn't") + ")。疑問文は " + en("have / has") + " を主語の前に出し、答えるときも " + en("have / has") + " を使います。期間は " + rule("How long 〜?") + " でたずねます。",
      en("study") + "、" + en("play") + "、" + en("wait") + " のような動作が今まで続いているときは、" + rule("have / has been + 動詞の ing 形") + " の形もよく使います。これを現在完了進行形といいます。" + en("know") + "(知っている)のような状態を表す動詞は、ふつう現在完了で表します。",
      "現在完了は、" + en("yesterday") + "、" + en("〜 ago") + "、" + en("last 〜") + " のように、過去の時だけをはっきり表す語といっしょには使いません。" + seigo("I have known him last year.", "I have known him " + key("since") + " last year.")
    ],
    chart: hyo({
      caption: "for と since",
      head: ["", "for", "since"],
      rows: [
        ["意味", { ja: "〜の間" }, { ja: "〜から" }],
        ["続く語", { ja: "期間の長さ" }, { ja: "始まった時" }],
        ["例", "a week", "May"]
      ]
    }) + gojun([
      { role: "主語", en: "I", ja: "わたしは" },
      { role: "have", en: "have", key: true },
      { role: "過去分詞", en: "lived", ja: "住んでいる", key: true },
      { role: "そのほか", en: "in Kobe", ja: "神戸に" },
      { role: "for 〜", en: "for ten years.", ja: "10年間" }
    ], "ふつうの文") + gojun([
      { role: "How long", en: "How long", key: true },
      { role: "have", en: "have" },
      { role: "主語", en: "you" },
      { role: "過去分詞", en: "lived" },
      { role: "そのほか", en: "in Kobe?" }
    ], "期間をたずねる文") + gojun([
      { role: "主語", en: "It" },
      { role: "has been", en: "has been", key: true },
      { role: "ing 形", en: "raining", key: true },
      { role: "since 〜", en: "since this morning." }
    ], "現在完了進行形"),
    example: {
      title: "日本語に合うように、空所に " + en("for") + " か " + en("since") + " を入れなさい。" +
        eibun("I have been a member of this club " + B + " last April.", "わたしは去年の4月から、このクラブの部員です。"),
      steps: [
        en("last April") + "(去年の4月)は、部員になった「始まった時」です。",
        "始まった時を言うときは " + en(key("since")) + " を使います。日本語の「〜から」も手がかりになります。",
        en("for") + " は、" + en("for two years") + " のように期間の長さを言うときに使います。"
      ],
      result: en("since") + "(" + en("I have been a member of this club since last April.") + ")"
    },
    fixed: [
      {
        id: "f1",
        text: Q_BLANK,
        material: eibun("I have lived in this town " + B + " five years.", "わたしはこの町に5年間住んでいます。"),
        choices: ["for", "since", "from", "during"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("five years") + "(5年)は期間の長さなので、" + en(key("for")) + " を使います。",
          en("since") + " は、" + en("since 2020") + " のように始まった時の前に置きます。",
          en("from") + " と " + en("during") + " は、現在完了の継続で期間の長さを言うときには使いません。"
        ]
      },
      {
        id: "f2",
        text: Q_BLANK,
        material: eibun("She has been sick " + B + " last Friday.", "彼女はこの前の金曜日から具合が悪いです。"),
        choices: ["for", "ago", "since", "at"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          en("last Friday") + "(この前の金曜日)は、具合が悪くなった「始まった時」です。始まった時の前には " + en(key("since")) + " を置きます。",
          en("for") + " は期間の長さ(" + en("for three days") + " など)の前に置きます。",
          en("ago") + " は「〜前に」で、現在完了とはいっしょに使いません。" + en("at last Friday") + " という言い方もしません。"
        ]
      },
      {
        id: "f3",
        text: Q_BLANK,
        material: eibun("My brother " + B + " known Ken for ten years.", "兄はケンと知り合って10年になります。"),
        choices: ["has", "have", "is", "was"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "過去分詞 " + en("known") + " と " + en("for ten years") + " があるので、現在完了(継続)の文です。",
          "主語 " + en("My brother") + " は三人称単数なので、" + en(key("has")) + " を使います。" + en("have") + " は合いません。",
          en("is known") + " や " + en("was known") + " は受け身の形で、あとに " + en("Ken") + " を続けられません。"
        ]
      },
      {
        id: "f4",
        text: Q_BLANK,
        material: eibun("We have " + B + " Ms. Brown since 2019.", "わたしたちは2019年からブラウン先生を知っています。"),
        choices: ["know", "knew", "known", "knowing"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          "現在完了は " + rule("have / has + 過去分詞") + " なので、" + en("have") + " のあとは過去分詞にします。",
          en("know") + " は " + en("know - knew - " + key("known")) + " と変化します。",
          en("know") + " は原形、" + en("knew") + " は過去形です。" + en("know") + " は状態を表す動詞なので、" + en("ing") + " 形にもしません。"
        ]
      },
      {
        id: "f5",
        text: Q_REPLY,
        material: kaiwa([["A", "How long have you lived in Japan?", "あなたはどのくらい日本に住んでいますか。"], ["B", B]]),
        choices: ens(["Two years ago.", "In Tokyo.", "For two years.", "Yes, I have."]),
        answer: 2,
        explain: [
          en("How long 〜?") + " は期間の長さをたずねるので、" + en(key("For two years.")) + "(2年間です)と答えます。",
          en("Two years ago.") + "(2年前に)は、過去のある時を答えています。",
          en("In Tokyo.") + " は場所の答えです。疑問詞の疑問文なので、" + en("Yes / No") + " では答えません。"
        ]
      },
      {
        id: "f6",
        text: Q_BLANK_PHRASE,
        material: kaiwa([["A", B + " have you been in Osaka?", "あなたは大阪にどのくらいいるのですか。"], ["B", "Since last week.", "先週からです。"]]),
        choices: ["How many", "How long", "When", "How often"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          "Bは「先週から」と、続いている期間を答えています。現在完了で期間をたずねるのは " + en(key("How long")) + " です。",
          en("When") + " は過去の時をたずねる語なので、現在完了の疑問文には使いません。",
          en("How many") + " は数、" + en("How often") + " は回数(どのくらいよく)をたずねるので、答えと合いません。"
        ]
      },
      {
        id: "f7",
        text: Q_NEG,
        material: eibun("Tom has been busy since Monday.", "トムは月曜日からずっと忙しいです。"),
        choices: ens(["Tom doesn't have been busy since Monday.", "Tom hasn't be busy since Monday.", "Tom wasn't been busy since Monday.", "Tom hasn't been busy since Monday."]),
        answer: 3,
        explain: [
          "現在完了の否定文は、" + rule("have / has のあとに not") + " を置きます。" + en("has not") + " は " + en("hasn't") + " と短くできます。",
          en("Tom " + key("hasn't") + " been busy since Monday."),
          en("doesn't") + " や " + en("wasn't") + " は使いません。" + en("hasn't") + " のあとは過去分詞の " + en("been") + " のままです。"
        ]
      },
      {
        id: "f8",
        text: Q_QUES,
        material: eibun("They have lived here for a long time.", "彼らは長い間ここに住んでいます。"),
        choices: ens(["Do they have lived here for a long time?", "Have they lived here for a long time?", "Have they live here for a long time?", "Are they lived here for a long time?"]),
        answer: 1,
        explain: [
          "現在完了の疑問文は、" + rule("have / has を主語の前") + " に出します。",
          en(key("Have") + " they lived here for a long time?"),
          en("Do") + " や " + en("Are") + " は使いません。" + en("Have") + " を前に出しても、" + en("lived") + " は過去分詞のままです。"
        ]
      },
      {
        id: "f9",
        text: Q_REPLY_BLANK,
        material: kaiwa([["A", "Has your sister been in Canada since last year?", "あなたのお姉さんは去年からカナダにいるのですか。"], ["B", "Yes, she " + B + ".", "はい、そうです。"]]),
        choices: ["has", "is", "does", "was"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("Has 〜?") + " でたずねられた現在完了の疑問文には、" + en("has") + " を使って答えます。",
          en("Yes, she " + fill("has") + "."),
          en("is") + "、" + en("does") + "、" + en("was") + " は、" + en("Has 〜?") + " の質問への答えには使いません。"
        ]
      },
      {
        id: "f10",
        text: Q_WRONG,
        choices: ens(["I have lived in Nagoya since 2015.", "He has been a teacher for twenty years.", "We have been friends for a long time.", "She has lived in London three years ago."]),
        answer: 3,
        explain: [
          en("three years ago") + "(3年前に)は過去の時を表すので、現在完了とはいっしょに使いません。",
          seigo("She has lived in London three years ago.", "She has lived in London " + key("for three years") + "."),
          "ほかの3つは、" + en("since 2015") + "、" + en("for twenty years") + "、" + en("for a long time") + " と、現在完了に合う語が使われています。"
        ]
      },
      {
        id: "f11",
        text: Q_BLANK_PHRASE,
        material: eibun("I have " + B + " for an hour.", "わたしは1時間ずっと待っています。"),
        choices: ens(["waiting", "been waiting", "be waiting", "was waiting"]),
        answer: 1,
        explain: [
          "「ずっと待っている」と動作が続いているので、現在完了進行形 " + rule("have / has been + ing 形") + " にします。",
          en("I have " + fill("been waiting") + " for an hour."),
          en("have") + " のすぐあとに " + en("ing") + " 形や " + en("be") + "、" + en("was") + " を置くことはできません。" + en("have") + " のあとは過去分詞の " + en("been") + " です。"
        ]
      },
      {
        id: "f12",
        text: Q_BLANK,
        material: eibun("It has been " + B + " since this morning.", "今朝からずっと雨が降っています。"),
        choices: ["rain", "rained", "raining", "rains"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          "「ずっと雨が降っている」なので、現在完了進行形です。" + en("has been") + " のあとは " + en("ing") + " 形にします。",
          en("It has been " + fill("raining") + " since this morning."),
          en("rain") + "(雨が降る)は「〜される」の形にならないので、" + en("has been rained") + " とは言いません。" + en("rain") + "、" + en("rains") + " は " + en("been") + " のあとに置けません。"
        ]
      },
      {
        id: "f13",
        text: qJa("ケンは2時間ずっとテレビを見ています。"),
        choices: ens(["Ken has been watching TV for two hours.", "Ken has been watching TV since two hours.", "Ken was been watching TV for two hours.", "Ken has watching TV for two hours."]),
        answer: 0,
        explain: [
          "「2時間ずっと見ている」なので、現在完了進行形 " + en("has been watching") + " に、期間の長さを表す " + en("for two hours") + " を続けます。",
          en("Ken " + key("has been watching") + " TV " + key("for") + " two hours."),
          en("two hours") + " は期間の長さなので、" + en("since") + " ではなく " + en("for") + " です。",
          en("was been") + " という形はありません。" + en("has") + " と " + en("watching") + " のあいだには " + en("been") + " が必要です。"
        ]
      },
      {
        id: "f14",
        text: Q_EN_TO_JA,
        material: eibun("I haven't seen Yuki since last month."),
        choices: [
          "わたしは先月ユキに会いませんでした。",
          "わたしは先月からユキに会っています。",
          "わたしは先月からユキに会っていません。",
          "わたしはユキに一度も会ったことがありません。"
        ],
        answer: 2,
        explain: [
          en("haven't seen") + " は「(ずっと)会っていない」、" + en("since last month") + " は「先月から」です。",
          "「先月会いませんでした」は過去の文 " + en("I didn't see Yuki last month.") + " の意味です。",
          en("haven't") + " があるので「会っています」にはなりません。「一度も会ったことがない」なら " + en("never") + " を使います。"
        ]
      },
      {
        id: "f15",
        text: Q_JOIN,
        material: eibun([["I started to study English three years ago.", "わたしは3年前に英語を勉強し始めました。"], ["I still study it.", "わたしは今も勉強しています。"]]),
        choices: ens(["I have studied English since three years.", "I studied English for three years ago.", "I have studied English for three years.", "I have studied English three years ago."]),
        answer: 2,
        explain: [
          "3年前に始めて今も続いているので、現在完了(継続)で表します。3年は期間の長さなので " + en("for") + " を使います。",
          en("I " + key("have studied") + " English " + key("for three years") + "."),
          en("three years") + " の前に " + en("since") + " は使いません。" + en("ago") + " は現在完了といっしょに使わず、" + en("for") + " ともいっしょに使いません。"
        ]
      }
    ]
  });

  // =====================================================================
  // 3-3 現在完了(経験)
  // =====================================================================
  JHE.register("g3-present-perfect-experience", {
    points: [
      "「(今までに)〜したことがある」(経験)も、" + rule("have / has + 過去分詞") + " で表します。" + en("once") + "(1回)、" + en("twice") + "(2回)、" + en("three times") + "(3回)のような回数や、" + en("before") + "(以前に)は、文の最後に置くことが多いです。",
      "「一度も〜したことがない」は、" + rule("never") + " を " + en("have / has") + " と過去分詞のあいだに置きます。" + en("I have " + key("never") + " seen a panda.") + "(わたしは一度もパンダを見たことがありません。)",
      "「今までに〜したことがありますか」は、" + rule("Have / Has + 主語 + ever + 過去分詞 〜?") + " です。答えは " + en("Yes, I have.") + " か " + en("No, I haven't.") + " です。",
      "回数は " + rule("How many times 〜?") + " でたずねます。「いつしたか」をたずねる " + en("When 〜?") + " や、" + en("〜 ago") + "、" + en("last 〜") + " は過去形の文で使い、現在完了とはいっしょに使いません。",
      "「〜へ行ったことがある」は " + rule("have / has been to 〜") + " で表します。" + en("have / has gone to 〜") + " は「〜へ行ってしまった(今はここにいない)」という意味になるので、経験の文には使いません。"
    ],
    chart:
      gojun([
        { role: "主語", en: "I", ja: "わたしは" },
        { role: "have", en: "have", key: true },
        { role: "過去分詞", en: "visited", ja: "訪れたことがある", key: true },
        { role: "そのほか", en: "Kyoto", ja: "京都を" },
        { role: "回数", en: "twice.", ja: "2回" }
      ], "ふつうの文") +
      gojun([
        { role: "主語", en: "She" },
        { role: "has never", en: "has never", key: true },
        { role: "過去分詞", en: "eaten" },
        { role: "そのほか", en: "sushi." }
      ], "「一度も〜ない」の文") +
      gojun([
        { role: "Have", en: "Have", key: true },
        { role: "主語", en: "you" },
        { role: "ever", en: "ever", key: true },
        { role: "過去分詞", en: "been" },
        { role: "そのほか", en: "to Okinawa?" }
      ], "疑問文"),
    example: {
      title: "日本語に合うように、( )内の語を並べかえなさい。" + eibun("( ever / you / have / seen ) a koala?", "あなたは今までにコアラを見たことがありますか。"),
      steps: [
        "現在完了の疑問文なので、" + en(key("Have")) + " を文の最初に置き、そのあとに主語 " + en("you") + " を続けます。",
        "「今までに」の " + en(key("ever")) + " は、過去分詞の前に置きます。",
        "最後に過去分詞の " + en("seen") + " を置きます。" + henka("see", "seen")
      ],
      result: en("Have you ever seen a koala?")
    },
    fixed: [
      {
        id: "f1",
        text: Q_BLANK,
        material: eibun("I have " + B + " this movie three times.", "わたしはこの映画を3回見たことがあります。"),
        choices: ["seen", "see", "saw", "seeing"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "現在完了は " + rule("have / has + 過去分詞") + " です。" + en("see") + " は " + en("see - saw - " + key("seen")) + " と変化します。",
          en("see") + " は原形、" + en("saw") + " は過去形なので、" + en("have") + " のあとには置けません。",
          en("have") + " のすぐあとに " + en("ing") + " 形は置きません。"
        ]
      },
      {
        id: "f2",
        text: Q_BLANK,
        material: eibun("He has " + B + " been to a foreign country.", "彼は一度も外国へ行ったことがありません。"),
        choices: ["no", "ever", "never", "yet"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          "「一度も〜したことがない」は、" + en("has") + " と過去分詞のあいだに " + en(key("never")) + " を置きます。",
          en("ever") + "(今までに)は、ふつう疑問文で使います。この文には合いません。",
          en("no") + " は名詞の前に置く語で、" + en("has") + " と過去分詞のあいだには置けません。" + en("yet") + " は文の最後に置いて「まだ」の意味で使います。"
        ]
      },
      {
        id: "f3",
        text: Q_BLANK,
        material: eibun("Have you " + B + " played shogi?", "あなたは今までに将棋をしたことがありますか。"),
        choices: ["ago", "ever", "for", "yet"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          "「今までに〜したことがありますか」は、過去分詞の前に " + en(key("ever")) + " を置きます。",
          en("Have you " + fill("ever") + " played shogi?"),
          en("ago") + " は現在完了といっしょに使いません。" + en("for") + " は期間の前に置く語です。",
          en("yet") + " は文の最後に置く語で、過去分詞の前には置きません。"
        ]
      },
      {
        id: "f4",
        text: Q_REPLY,
        material: kaiwa([["A", "Have you ever been to Hokkaido?", "あなたは今までに北海道へ行ったことがありますか。"], ["B", B]]),
        choices: ens(["Yes, I did.", "Yes, I do.", "Yes, I was.", "Yes, I have."]),
        answer: 3,
        explain: [
          en("Have you 〜?") + " でたずねられた現在完了の疑問文には、" + en("have") + " を使って答えます。",
          en("Yes, I " + key("have") + "."),
          en("did") + "、" + en("do") + "、" + en("was") + " は、" + en("Have you 〜?") + " の質問への答えには使いません。"
        ]
      },
      {
        id: "f5",
        text: Q_BLANK_PHRASE,
        material: kaiwa([["A", B + " have you climbed Mt. Fuji?", "あなたは富士山に何回登ったことがありますか。"], ["B", "Twice.", "2回です。"]]),
        choices: ens(["How long", "How many times", "When", "How old"]),
        answer: 1,
        explain: [
          "Bは「2回」と回数を答えています。経験の回数をたずねるのは " + en(key("How many times")) + " です。",
          en("How long") + " は期間の長さ、" + en("How old") + " は年齢をたずねます。",
          en("When") + " は過去の時をたずねる語なので、現在完了の疑問文には使いません。"
        ]
      },
      {
        id: "f6",
        text: Q_JA_BLANK,
        material: eibun("My father has " + B + " to India.", "父はインドへ行ったことがあります。"),
        choices: ["been", "gone", "went", "go"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "「〜へ行ったことがある」(経験)は、" + rule("have / has been to 〜") + " で表します。",
          en("My father has " + fill("been") + " to India."),
          en("has gone to India") + " は「インドへ行ってしまった(今ここにいない)」という意味になり、日本語と合いません。",
          en("went") + " は過去形、" + en("go") + " は原形なので、" + en("has") + " のあとには置けません。"
        ]
      },
      {
        id: "f7",
        text: Q_EN_TO_JA,
        material: eibun("Emi has gone to Tokyo."),
        choices: [
          "エミは東京へ行ったことがあります。",
          "エミは東京へ行ってしまいました(今はここにいません)。",
          "エミは東京へ行くところです。",
          "エミは東京から帰ってきました。"
        ],
        answer: 1,
        explain: [
          en("has gone to 〜") + " は「〜へ行ってしまった(今はここにいない)」という意味です。",
          "「行ったことがある」なら " + en("Emi has been to Tokyo.") + " です。",
          "「行くところです」は " + en("Emi is going to Tokyo.") + "、「帰ってきました」は " + en("come back") + " などで表します。"
        ]
      },
      {
        id: "f8",
        text: Q_WRONG,
        choices: ens(["I have visited Nara twice.", "She has never seen snow.", "Have you ever eaten Indian food?", "I have read this book last year."]),
        answer: 3,
        explain: [
          en("last year") + "(去年)は過去の時を表すので、現在完了とはいっしょに使いません。過去形の文にします。",
          seigo("I have read this book last year.", "I " + key("read") + " this book last year."),
          "ほかの3つは、回数の " + en("twice") + "、" + en("never") + "、" + en("ever") + " を使った、正しい経験の文です。"
        ]
      },
      {
        id: "f9",
        text: "次の文を「一度も〜したことがない」という文に書きかえたものはどれですか。",
        material: eibun("I have met a famous singer.", "わたしは有名な歌手に会ったことがあります。"),
        choices: ens(["I have met never a famous singer.", "I haven't never met a famous singer.", "I have never met a famous singer.", "I have never meet a famous singer."]),
        answer: 2,
        explain: [
          rule("never") + " は、" + en("have") + " と過去分詞のあいだに置きます。",
          en("I have " + key("never") + " met a famous singer."),
          en("never") + " を過去分詞のあとに置くことはしません。" + en("never") + " に「ない」の意味があるので、" + en("haven't") + " といっしょには使いません。",
          en("never") + " のあとも、過去分詞の " + en("met") + " のままです。"
        ]
      },
      {
        id: "f10",
        text: "次の文を「今までに〜したことがありますか」とたずねる文に書きかえたものはどれですか。",
        material: eibun("Ken has used this computer.", "ケンはこのコンピューターを使ったことがあります。"),
        choices: ens(["Has Ken ever used this computer?", "Does Ken ever used this computer?", "Has Ken ever use this computer?", "Has ever Ken used this computer?"]),
        answer: 0,
        explain: [
          en("Has") + " を主語の前に出し、過去分詞の前に " + en("ever") + " を置きます。",
          en(key("Has") + " Ken " + key("ever") + " used this computer?"),
          en("Does") + " は使いません。" + en("Has") + " を前に出しても、" + en("used") + " は過去分詞のままです。",
          en("ever") + " は主語の前ではなく、主語と過去分詞のあいだに置きます。"
        ]
      },
      {
        id: "f11",
        text: qPP("eat"),
        choices: ["ate", "eated", "eating", "eaten"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          en("eat") + " は不規則動詞で、" + en("eat - ate - " + key("eaten")) + " と変化します。",
          en("ate") + " は過去形です。" + en("eated") + " という形はありません。",
          en("eating") + " は " + en("ing") + " 形で、過去分詞ではありません。"
        ]
      },
      {
        id: "f12",
        text: qJa("わたしはその歌を何回も聞いたことがあります。"),
        choices: ens(["I have heard the song many times.", "I have heard the song many time.", "I have hear the song many times.", "I heard have the song many times."]),
        answer: 0,
        explain: [
          "経験なので " + en("have") + " + 過去分詞にします。" + en("hear") + " の過去分詞は " + en("heard") + " です。",
          "「何回も」は " + en(key("many times")) + " です。" + en("many") + " のあとなので、" + en("time") + " は複数形の " + en("times") + " にします。",
          en("have") + " のあとは原形の " + en("hear") + " ではなく過去分詞です。" + en("have") + " は過去分詞の前に置きます。"
        ]
      },
      {
        id: "f13",
        text: Q_REPLY_BLANK,
        material: kaiwa([["A", "Has your brother ever been abroad?", "あなたのお兄さんは今までに外国へ行ったことがありますか。"], ["B", "No, he " + B + ". But he wants to go.", "いいえ。でも行きたがっています。"]]),
        choices: ["hasn't", "doesn't", "didn't", "isn't"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("Has 〜?") + " の質問に「いいえ」と答えるときは、" + en(key("hasn't")) + " を使います。",
          en("No, he " + fill("hasn't") + "."),
          en("doesn't") + "、" + en("didn't") + "、" + en("isn't") + " は、" + en("Has 〜?") + " の質問への答えには使いません。"
        ]
      },
      {
        id: "f14",
        text: Q_REPLY,
        material: kaiwa([["A", "How many times have you been to Kyoto?", "あなたは京都へ何回行ったことがありますか。"], ["B", B]]),
        choices: ens(["For three years.", "Three years ago.", "Three times.", "Yes, three."]),
        answer: 2,
        explain: [
          en("How many times 〜?") + " は回数をたずねるので、" + en(key("Three times.")) + "(3回です)と答えます。",
          en("For three years.") + " は期間の長さ、" + en("Three years ago.") + " は過去のある時の答えです。",
          "疑問詞の疑問文なので、" + en("Yes") + " では答えません。"
        ]
      },
      {
        id: "f15",
        text: Q_EN_TO_JA,
        material: eibun("Have you ever heard this song?"),
        choices: [
          "あなたはもうこの歌を聞きましたか。",
          "あなたはこの歌を聞いていますか。",
          "あなたは一度もこの歌を聞いたことがありません。",
          "あなたは今までにこの歌を聞いたことがありますか。"
        ],
        answer: 3,
        explain: [
          en("Have you ever + 過去分詞 〜?") + " は「今までに〜したことがありますか」という経験の疑問文です。",
          "「もう聞きましたか」は完了の疑問文で、" + en("Have you heard this song yet?") + " と言います。",
          "「聞いていますか」は現在進行形の " + en("Are you listening to 〜?") + " です。疑問文なので「〜ありません」にはなりません。"
        ]
      }
    ]
  });

  // =====================================================================
  // 3-4 現在完了(完了)
  // =====================================================================
  JHE.register("g3-present-perfect-completion", {
    points: [
      "「(ちょうど・もう)〜したところだ」「〜してしまった」(完了)も、" + rule("have / has + 過去分詞") + " で表します。過去にした動作が終わって、今どうなっているかに目を向けた言い方です。",
      rule("just") + "(ちょうど)と " + rule("already") + "(もう、すでに)は、" + en("have / has") + " と過去分詞のあいだに置きます。" + en("I have " + key("just") + " finished my homework.") + "(わたしはちょうど宿題を終えたところです。)",
      "否定文の「まだ〜していない」は " + rule("have / has not 〜 yet") + "、疑問文の「もう〜しましたか」は " + rule("Have / Has + 主語 + 過去分詞 〜 yet?") + " です。" + en("yet") + " は文の最後に置きます。",
      en("Have you 〜 yet?") + " には、" + en("Yes, I have.") + " か " + en("No, I haven't.") + " で答えます。「いいえ、まだです」は " + en("No, not yet.") + " とも言います。",
      en("yesterday") + "、" + en("〜 ago") + "、" + en("When 〜?") + " のように、過去の時をはっきり表す語は過去形の文で使います。" + seigo("I have finished it an hour ago.", "I " + key("finished") + " it an hour ago.")
    ],
    chart:
      gojun([
        { role: "主語", en: "I", ja: "わたしは" },
        { role: "have", en: "have" },
        { role: "already", en: "already", ja: "もう", key: true },
        { role: "過去分詞", en: "cleaned", ja: "そうじした", key: true },
        { role: "そのほか", en: "my room.", ja: "部屋を" }
      ], "ふつうの文") +
      gojun([
        { role: "主語", en: "I" },
        { role: "have not", en: "haven't", key: true },
        { role: "過去分詞", en: "cleaned" },
        { role: "そのほか", en: "my room" },
        { role: "yet", en: "yet.", ja: "まだ", key: true }
      ], "否定文") +
      gojun([
        { role: "Have", en: "Have", key: true },
        { role: "主語", en: "you" },
        { role: "過去分詞", en: "cleaned" },
        { role: "そのほか", en: "your room" },
        { role: "yet", en: "yet?", ja: "もう", key: true }
      ], "疑問文"),
    example: {
      title: "日本語に合うように、空所に入る語を答えなさい。" + eibun("The bus has " + B + " left.", "バスはちょうど出発したところです。"),
      steps: [
        "「ちょうど〜したところです」なので、現在完了(完了)の文です。「ちょうど」は " + en(key("just")) + " です。",
        en("just") + " は、" + en("has") + " と過去分詞のあいだに置きます。",
        en("left") + " は " + en("leave") + "(出発する)の過去分詞です。" + henka("leave", "left")
      ],
      result: en("just") + "(" + en("The bus has just left.") + ")"
    },
    fixed: [
      {
        id: "f1",
        text: Q_BLANK,
        material: eibun("I have " + B + " eaten lunch.", "わたしはもう昼食を食べました。"),
        choices: ["already", "yet", "ever", "since"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "「もう〜した」は、" + en("have") + " と過去分詞のあいだに " + en(key("already")) + " を置きます。",
          en("yet") + " は否定文・疑問文の最後に置く語です。" + en("ever") + " は「今までに」で、ふつう疑問文で使います。",
          en("since") + " は「〜から」で、あとに始まった時を続けます。"
        ]
      },
      {
        id: "f2",
        text: Q_BLANK,
        material: eibun("Have you finished your homework " + B + "?", "あなたはもう宿題を終えましたか。"),
        choices: ["just", "ever", "yet", "never"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          "疑問文の「もう〜しましたか」は、文の最後に " + en(key("yet")) + " を置きます。",
          en("just") + " と " + en("ever") + " は過去分詞の前に置く語で、文の最後には置きません。",
          en("never") + " は「一度も〜ない」で、この疑問文には合いません。"
        ]
      },
      {
        id: "f3",
        text: Q_BLANK,
        material: eibun("The movie has " + B + " started.", "映画はちょうど始まったところです。"),
        choices: ["just", "yet", "ever", "ago"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "「ちょうど〜したところです」は、" + en("has") + " と過去分詞のあいだに " + en(key("just")) + " を置きます。",
          en("yet") + " は否定文・疑問文の最後に置きます。" + en("ever") + " は「今までに」で、ふつう疑問文で使います。",
          en("ago") + " は過去の時を表す語で、現在完了とはいっしょに使いません。"
        ]
      },
      {
        id: "f4",
        text: "次の文を「まだ〜していない」という文に書きかえたものはどれですか。",
        material: eibun("I have read today's newspaper.", "わたしは今日の新聞を読みました。"),
        choices: ens(["I haven't read yet today's newspaper.", "I haven't read today's newspaper yet.", "I don't have read today's newspaper yet.", "I haven't read today's newspaper just."]),
        answer: 1,
        explain: [
          "「まだ〜していない」は、" + en("haven't") + " + 過去分詞 〜 " + en("yet") + " で表します。" + en("yet") + " は" + rule("文の最後") + "に置きます。",
          en("I " + key("haven't") + " read today's newspaper " + key("yet") + "."),
          en("yet") + " を目的語の前に置くことはしません。現在完了の否定文に " + en("don't") + " は使いません。",
          en("just") + " は「ちょうど」で、文の最後には置きません。"
        ]
      },
      {
        id: "f5",
        text: Q_REPLY,
        material: kaiwa([["A", "Have you cleaned your room yet?", "もう部屋をそうじしましたか。"], ["B", B]]),
        choices: ens(["No, I didn't yet.", "No, I'm not yet.", "No, I don't.", "No, not yet."]),
        answer: 3,
        explain: [
          en("Have you 〜 yet?") + " に「いいえ、まだです」と答えるときは、" + en(key("No, not yet.")) + " と言います(" + en("No, I haven't.") + " とも答えます)。",
          en("didn't") + "、" + en("I'm not") + "、" + en("don't") + " は、" + en("Have you 〜?") + " の質問への答えには使いません。"
        ]
      },
      {
        id: "f6",
        text: qPP("do"),
        choices: ["did", "doing", "done", "doed"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          en("do") + " は不規則動詞で、" + en("do - did - " + key("done")) + " と変化します。",
          en("did") + " は過去形、" + en("doing") + " は " + en("ing") + " 形です。",
          en("doed") + " という形はありません。"
        ]
      },
      {
        id: "f7",
        text: Q_WRONG,
        choices: ens(["I have just finished breakfast.", "She has already gone home.", "Have you washed the dishes yet?", "He has arrived at the station an hour ago."]),
        answer: 3,
        explain: [
          en("an hour ago") + "(1時間前に)は過去の時を表すので、現在完了とはいっしょに使いません。過去形の文にします。",
          seigo("He has arrived at the station an hour ago.", "He " + key("arrived") + " at the station an hour ago."),
          "ほかの3つは、" + en("just") + "、" + en("already") + "、" + en("yet") + " を正しい位置に置いた完了の文です。"
        ]
      },
      {
        id: "f8",
        text: qJa("わたしはもうその手紙を書きました。"),
        choices: ens(["I have already written the letter.", "I have already wrote the letter.", "I already have write the letter.", "I have written already the letter."]),
        answer: 0,
        explain: [
          "「もう〜しました」は、" + en("have already") + " + 過去分詞で表します。" + en("write") + " の過去分詞は " + en("written") + " です。",
          en("I have " + key("already written") + " the letter."),
          en("have") + " のあとは、過去形の " + en("wrote") + " や原形の " + en("write") + " ではなく過去分詞です。",
          en("already") + " は、過去分詞と目的語のあいだには置きません。"
        ]
      },
      {
        id: "f9",
        text: Q_EN_TO_JA,
        material: eibun("The train has just arrived."),
        choices: [
          "電車はちょうど着いたところです。",
          "電車はもう着きましたか。",
          "電車はまだ着いていません。",
          "電車はもうすぐ着きます。"
        ],
        answer: 0,
        explain: [
          en("has just arrived") + " は「ちょうど着いたところだ」という完了の意味です。",
          "「もう着きましたか」は " + en("Has the train arrived yet?") + "、「まだ着いていません」は " + en("The train hasn't arrived yet.") + " です。",
          "「もうすぐ着きます」はこれからのことなので、現在完了では表しません。"
        ]
      },
      {
        id: "f10",
        text: "次の文を「もう〜しましたか」とたずねる文に書きかえたものはどれですか。",
        material: eibun("Mike has finished his work.", "マイクは仕事を終えました。"),
        choices: ens(["Did Mike finished his work yet?", "Has Mike finish his work yet?", "Has Mike finished his work yet?", "Has Mike yet finished his work?"]),
        answer: 2,
        explain: [
          en("Has") + " を主語の前に出し、「もう」の " + en("yet") + " は文の最後に置きます。",
          en(key("Has") + " Mike finished his work " + key("yet") + "?"),
          en("Did") + " は使いません。" + en("Has") + " を前に出しても、" + en("finished") + " は過去分詞のままです。",
          en("yet") + " は主語と過去分詞のあいだには置きません。"
        ]
      },
      {
        id: "f11",
        text: Q_REPLY_BLANK,
        material: kaiwa([["A", "Has the concert started yet?", "コンサートはもう始まりましたか。"], ["B", "Yes, it " + B + ". Let's go in.", "はい。中に入りましょう。"]]),
        choices: ["is", "does", "have", "has"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          en("Has 〜?") + " でたずねられたら、" + en("has") + " を使って答えます。",
          en("Yes, it " + fill("has") + "."),
          "主語 " + en("it") + " は三人称単数なので、" + en("have") + " ではなく " + en("has") + " です。" + en("is") + "、" + en("does") + " は " + en("Has 〜?") + " の答えに使いません。"
        ]
      },
      {
        id: "f12",
        text: Q_BLANK_PHRASE,
        material: eibun("I " + B + " my homework an hour ago.", "わたしは1時間前に宿題を終えました。"),
        choices: ens(["have finished", "finished", "has finished", "finishing"]),
        answer: 1,
        explain: [
          en("an hour ago") + "(1時間前に)は過去の時を表すので、過去形の " + en(key("finished")) + " を使います。",
          en("have finished") + " と " + en("has finished") + " は現在完了なので、" + en("ago") + " といっしょには使いません。",
          en("finishing") + " は、これだけでは文の動詞になりません。"
        ]
      },
      {
        id: "f13",
        text: Q_RIGHT,
        choices: ens(["When have you arrived here?", "When did you arrive here?", "When do you arrived here?", "When have you arrive here?"]),
        answer: 1,
        explain: [
          en("When 〜?") + "(いつ)は過去の時をたずねるので、現在完了ではなく過去形の疑問文にします。",
          en("When " + key("did") + " you " + key("arrive") + " here?") + "(あなたはいつここに着きましたか。)",
          en("When") + " と " + en("have") + " はいっしょに使いません。" + en("do") + " のあとは原形にします。"
        ]
      },
      {
        id: "f14",
        text: Q_JOIN,
        material: eibun([["Tom went to Australia.", "トムはオーストラリアへ行きました。"], ["He isn't here now.", "彼は今ここにいません。"]]),
        choices: ens(["Tom has been to Australia.", "Tom has went to Australia.", "Tom have gone to Australia.", "Tom has gone to Australia."]),
        answer: 3,
        explain: [
          "「行ってしまって、今ここにいない」は、" + rule("have / has gone to 〜") + " で表します。",
          en("Tom " + key("has gone") + " to Australia."),
          en("has been to") + " は「行ったことがある」という経験の意味になります。",
          en("went") + " は過去形なので " + en("has") + " のあとには置けません。主語 " + en("Tom") + " には " + en("have") + " ではなく " + en("has") + " を使います。"
        ]
      },
      {
        id: "f15",
        text: Q_BLANK,
        material: eibun("Oh no! I have " + B + " my umbrella.", "あっ、かさをなくしてしまいました。"),
        choices: ["lose", "lost", "losing", "losed"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          "「なくしてしまった」は完了の文です。" + en("have") + " のあとに過去分詞を置きます。",
          en("lose") + " は " + en("lose - lost - " + key("lost")) + " と変化します。過去形と過去分詞が同じ形です。",
          en("lose") + " は原形、" + en("losing") + " は " + en("ing") + " 形です。" + en("losed") + " という形はありません。"
        ]
      }
    ]
  });

  // =====================================================================
  // 3-5 call / make + A + B
  // =====================================================================
  JHE.register("g3-svoc", {
    points: [
      rule("call A B") + " で「AをBと呼ぶ」という意味になります。" + en("We call him Ken.") + "(わたしたちは彼をケンと呼びます。)「〜を何と呼びますか」は " + en("What do you call 〜?") + " とたずねます。",
      rule("name A B") + " は「AをBと名づける」という意味です。" + en("They named the dog Pochi.") + "(彼らはその犬をポチと名づけました。)",
      rule("make A B") + " は「AをB(の状態)にする」という意味です。B には " + en("happy") + "、" + en("sad") + "、" + en("famous") + " のような形容詞が入ります。" + en("The news made me happy.") + "(その知らせはわたしを幸せな気持ちにしました。)",
      "この形では、" + rule("A = B") + " の関係になります(" + en("him = Ken") + "、" + en("me = happy") + ")。" + en("My father made me a cake.") + "(父はわたしにケーキを作ってくれた)のような「人 + 物」の文では、" + en("me") + " と " + en("a cake") + " は同じものではありません。",
      "A に代名詞を入れるときは、" + en("me / him / her / us / them") + " の形にします。B の形容詞を、" + en("happily") + " のような副詞にしないように注意します。" + seigo("The song made me happily.", "The song made me " + key("happy") + ".")
    ],
    chart:
      gojun([
        { role: "主語", en: "We", ja: "わたしたちは" },
        { role: "動詞", en: "call", ja: "呼ぶ", key: true },
        { role: "A", en: "the dog", ja: "その犬を" },
        { role: "B", en: "Shiro.", ja: "シロと", key: true }
      ], "call A B(AをBと呼ぶ)") +
      gojun([
        { role: "主語", en: "The letter", ja: "その手紙は" },
        { role: "動詞", en: "made", ja: "した", key: true },
        { role: "A", en: "her", ja: "彼女を" },
        { role: "B", en: "happy.", ja: "幸せに", key: true }
      ], "make A B(AをBにする)") +
      gojun([
        { role: "主語", en: "He", ja: "彼は" },
        { role: "動詞", en: "made", ja: "作った" },
        { role: "人", en: "me", ja: "わたしに" },
        { role: "物", en: "a cake.", ja: "ケーキを" }
      ], "比べる: make 人 物(人に物を作る)"),
    example: {
      title: "日本語に合うように、( )内の語を並べかえなさい。" + eibun("( call / me / please / Yumi ).", "わたしをユミと呼んでください。"),
      steps: [
        "「〜してください」なので、" + en("Please") + " のあとに動詞の原形を置く命令文にします。",
        "「AをBと呼ぶ」は " + en(key("call A B")) + " の順です。A は「わたしを」の " + en("me") + "、B は「ユミ」の " + en("Yumi") + " です。",
        en("me = Yumi") + " の関係になっていることを確かめます。"
      ],
      result: en("Please call me Yumi.")
    },
    fixed: [
      {
        id: "f1",
        text: Q_BLANK,
        material: eibun("My friends " + B + " me Taku.", "友だちはわたしをタクと呼びます。"),
        choices: ["call", "say", "speak", "talk"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "「AをBと呼ぶ」は " + rule("call A B") + " で表します。",
          en("My friends " + fill("call") + " me Taku."),
          en("say") + "(言う)、" + en("speak") + "(話す)、" + en("talk") + "(話す)は、「AをBと呼ぶ」の形では使いません。"
        ]
      },
      {
        id: "f2",
        text: Q_BLANK,
        material: eibun("The story made " + B + " sad.", "その話は彼女を悲しい気持ちにしました。"),
        choices: ["she", "hers", "her", "his"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          "make A B の A は動詞の目的語なので、代名詞は「〜を」の形にします。「彼女を」は " + en(key("her")) + " です。",
          en("she") + " は主語の形、" + en("hers") + " は「彼女のもの」です。",
          en("his") + " は「彼の」で、あとに名詞が必要です。"
        ]
      },
      {
        id: "f3",
        text: Q_BLANK,
        material: eibun("Your letter made me " + B + ".", "あなたの手紙はわたしを幸せな気持ちにしました。"),
        choices: ["happily", "happiness", "happying", "happy"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          "make A B の B には、A の状態を表す" + rule("形容詞") + "を置きます。「幸せな」は " + en(key("happy")) + " です。",
          en("happily") + " は副詞(幸せそうに)なので、B には置けません。",
          en("happiness") + " は「幸せ」という名詞で、" + en("me = happiness") + " にはなりません。" + en("happying") + " という形はありません。"
        ]
      },
      {
        id: "f4",
        text: Q_EN_TO_JA,
        material: eibun("We named our cat Momo."),
        choices: [
          "わたしたちはモモにネコをあげました。",
          "わたしたちのネコはモモを名づけました。",
          "わたしたちはモモという名前のネコを見ました。",
          "わたしたちはネコをモモと名づけました。"
        ],
        answer: 3,
        explain: [
          en("name A B") + " は「AをBと名づける」です。A は " + en("our cat") + "(わたしたちのネコ)、B は " + en("Momo") + " です。",
          "主語は " + en("We") + " なので、「ネコは〜名づけました」にはなりません。",
          "「あげました」なら " + en("give") + "、「見ました」なら " + en("see") + " を使います。"
        ]
      },
      {
        id: "f5",
        text: qOrder("この果物は英語で何と呼びますか。"),
        choices: ens(["What do you call in English this fruit?", "What do you this fruit call in English?", "What do you call this fruit in English?", "What is this fruit call in English?"]),
        answer: 2,
        explain: [
          "「Aを何と呼びますか」は、B の部分を " + en("What") + " にかえて文の最初に置き、" + rule("What do you call A 〜?") + " とします。",
          en("What do you " + key("call this fruit") + " in English?"),
          en("call") + " のすぐあとに A の " + en("this fruit") + " を置きます。" + en("in English") + " を先に置いたり、" + en("call") + " を A のあとに置いたりしません。",
          en("is") + " と原形の " + en("call") + " を並べることはできません。"
        ]
      },
      {
        id: "f6",
        text: Q_EN_TO_JA,
        material: eibun("My mother made me a new bag."),
        choices: [
          "母はわたしに新しいかばんを作ってくれました。",
          "母はわたしを新しいかばんにしました。",
          "母はわたしのために新しいかばんを買いました。",
          "母は新しいかばんでわたしを喜ばせました。"
        ],
        answer: 0,
        explain: [
          en("me") + " と " + en("a new bag") + " は同じものではない(" + en("me ≠ a new bag") + ")ので、「人に物を作る」の文です。",
          "「わたしを新しいかばんにする」という意味にはなりません。",
          "「買いました」なら " + en("bought") + " です。「喜ばせました」は文の中にありません。"
        ]
      },
      {
        id: "f7",
        text: Q_EN_TO_JA,
        material: eibun("The present made my mother very happy."),
        choices: [
          "母はそのプレゼントをとても喜んで作りました。",
          "そのプレゼントは母をとても喜ばせました。",
          "母はとても幸せなプレゼントを作りました。",
          "母はそのプレゼントでわたしをとても喜ばせました。"
        ],
        answer: 1,
        explain: [
          "主語は " + en("The present") + "(そのプレゼント)、A は " + en("my mother") + "、B は " + en("very happy") + " です。「AをBにした」と読みます。",
          "「プレゼントが母をとても幸せな気持ちにした」、つまり「母をとても喜ばせた」という意味です。",
          "母が作ったのではありません。また、文の中に「わたし」は出てきません。"
        ]
      },
      {
        id: "f8",
        text: Q_WRONG,
        choices: ens(["They call the bird Pippi.", "Please call me Kenta.", "His smile made us happily.", "We named the boat Blue Star."]),
        answer: 2,
        explain: [
          "make A B の B には、形容詞を置きます。副詞の " + en("happily") + " は置けません。",
          seigo("His smile made us happily.", "His smile made us " + key("happy") + "."),
          "ほかの3つは、" + en("the bird = Pippi") + "、" + en("me = Kenta") + "、" + en("the boat = Blue Star") + " の関係になった正しい文です。"
        ]
      },
      {
        id: "f9",
        text: qJa("その知らせはわたしたちを悲しい気持ちにしました。"),
        choices: ens(["The news made sad us.", "The news made our sad.", "The news made us sad.", "The news was made us sad."]),
        answer: 2,
        explain: [
          "「AをBにする」は " + rule("make A B") + " の順です。A は「わたしたちを」の " + en("us") + "、B は「悲しい」の " + en("sad") + " です。",
          en("The news made " + key("us sad") + "."),
          en("sad") + " を A の前に置くことはしません。" + en("our") + " は「わたしたちの」で、A には使えません。",
          en("was made") + " は受け身の形で、この文には合いません。"
        ]
      },
      {
        id: "f10",
        text: Q_BLANK,
        material: eibun("We " + B + " the baby Hana.", "わたしたちは赤ちゃんをハナと名づけました。"),
        choices: ["named", "said", "spoke", "talked"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "「AをBと名づける」は " + rule("name A B") + " です。過去の文なので " + en(key("named")) + " にします。",
          en("We " + fill("named") + " the baby Hana."),
          en("said") + "、" + en("spoke") + "、" + en("talked") + " は、あとに「A + 名前」を続ける形では使いません。"
        ]
      },
      {
        id: "f11",
        text: Q_REPLY,
        material: kaiwa([["A", "What do you call this flower in Japanese?", "この花を日本語で何と呼びますか。"], ["B", B]]),
        choices: ens(["We call sakura it.", "It calls sakura.", "We call it to sakura.", "We call it sakura."]),
        answer: 3,
        explain: [
          "call A B の形で答えます。A は " + en("this flower") + " を受ける " + en("it") + "、B は呼び名の " + en("sakura") + " です。",
          en("We " + key("call it sakura") + ".") + "(サクラと呼びます。)",
          "A と B の順を入れかえることはしません。" + en("It calls sakura.") + " では「それがサクラを呼ぶ」になります。",
          "A と B のあいだに " + en("to") + " は入れません。"
        ]
      },
      {
        id: "f12",
        text: Q_BLANK,
        material: eibun("This song made him " + B + ".", "この歌で彼は有名になりました。"),
        choices: ["famous", "famously", "fame", "famouser"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "「この歌が彼を有名にした」と考えます。make A B の B には形容詞の " + en(key("famous")) + " を置きます。",
          en("famously") + " は副詞なので、B には置けません。",
          en("fame") + " は名詞(名声)で、" + en("him = fame") + " にはなりません。" + en("famouser") + " という形はありません。"
        ]
      },
      {
        id: "f13",
        text: "「AをBにする」という意味の " + en("make") + " を使った文はどれですか。",
        choices: ens(["My father made a box.", "My father made me lunch.", "My father made the room warm.", "My father made dinner for us."]),
        answer: 2,
        explain: [
          en("made the room warm") + " は、" + en("the room = warm") + " の関係なので「部屋を暖かくした」という意味です。",
          en("made a box") + " は「箱を作った」です。",
          en("made me lunch") + " と " + en("made dinner for us") + " は「人に物を作った」で、" + en("me ≠ lunch") + " です。"
        ]
      },
      {
        id: "f14",
        text: Q_RIGHT,
        choices: ens(["We call she Mimi.", "We call her Mimi.", "We are call her Mimi.", "We call her to Mimi."]),
        answer: 1,
        explain: [
          "call A B の A に代名詞を置くときは、「〜を」の形にします。" + en("she") + " は " + en(key("her")) + " にします。",
          en("We call her Mimi.") + "(わたしたちは彼女をミミと呼びます。)",
          "be動詞の " + en("are") + " と一般動詞の " + en("call") + " は並べません。A と B のあいだに " + en("to") + " は入れません。"
        ]
      },
      {
        id: "f15",
        text: Q_BLANK,
        material: eibun("Everyone in my class " + B + " me Hiro.", "クラスのみんなはわたしをヒロと呼びます。"),
        choices: ["call", "calling", "calls", "are call"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          "主語は " + en("Everyone in my class") + " です。" + en("everyone") + "(みんな)は三人称単数としてあつかうので、" + en(key("calls")) + " にします。",
          "「みんな」という意味でも、" + en("everyone") + " は複数としてはあつかいません。" + en("call") + " は合いません。",
          en("calling") + " はこれだけでは文の動詞になりません。be動詞と原形の " + en("call") + " は並べません。"
        ]
      }
    ]
  });

  // =====================================================================
  // 3-6 間接疑問文
  // =====================================================================
  JHE.register("g3-indirect-questions", {
    points: [
      "疑問詞で始まる疑問文を、" + en("I know") + " や " + en("Do you know") + " などの文の中に入れると、" + rule("疑問詞 + 主語 + 動詞") + " の語順になります。これを間接疑問文といいます。" + en("what time") + "、" + en("how many + 名詞") + " などは、ひとまとまりで前に置きます。",
      "一般動詞の疑問文を入れるときは、" + rule("do / does / did を使わず") + "、動詞を主語と時に合わせた形にします。" + en("does") + " があった文は " + en("lives") + " のように " + en("s") + " をつけ、" + en("did") + " があった文は過去形にします。" + seigo("I know where does he live.", "I know where he " + key("lives") + "."),
      "be動詞の疑問文を入れるときは、" + rule("主語のあとに be動詞") + " を置きます。" + en("Who is that girl?") + " → " + en("Do you know who that girl " + key("is") + "?"),
      "疑問詞が主語の文(" + en("Who came here?") + " など)は、文の中に入れても語順は変わりません。" + en("I don't know who came here.") + "(だれがここに来たのか、わたしは知りません。)",
      "文の最後の記号は、文全体で決めます。" + en("I know 〜") + " のようなふつうの文ならピリオド(.)、" + en("Do you know 〜?") + " のような疑問文なら「?」にします。"
    ],
    chart:
      gojun([
        { role: "疑問詞", en: "Where", ja: "どこに", key: true },
        { role: "does", en: "does" },
        { role: "主語", en: "he" },
        { role: "動詞の原形", en: "live?" }
      ], "ふつうの疑問文") +
      gojun([
        { role: "主語 + 動詞", en: "I know", ja: "わたしは知っている" },
        { role: "疑問詞", en: "where", key: true },
        { role: "主語", en: "he", key: true },
        { role: "動詞", en: "lives.", key: true }
      ], "間接疑問文(一般動詞)") +
      gojun([
        { role: "疑問文の始め", en: "Do you know" },
        { role: "疑問詞", en: "who", key: true },
        { role: "主語", en: "that girl", key: true },
        { role: "be動詞", en: "is?", key: true }
      ], "間接疑問文(be動詞)"),
    example: {
      title: "次の2つの文を1つの文にしなさい。" + eibun([["I don't know.", "わたしは知りません。"], ["What does Ken want?", "ケンは何がほしいのですか。"]]),
      steps: [
        "2つめの疑問文を、" + en("I don't know") + " のあとに続けます。語順は " + rule("疑問詞 + 主語 + 動詞") + " です。",
        en("does") + " は使わず、主語 " + en("Ken") + " に合わせて " + en("want") + " に " + en("s") + " をつけます。" + henka("want", "wants"),
        "文全体はふつうの文なので、最後はピリオドにします。"
      ],
      result: en("I don't know what Ken wants.")
    },
    fixed: [
      {
        id: "f1",
        text: qJa("わたしは彼がどこに住んでいるか知っています。"),
        choices: ens(["I know where he lives.", "I know where lives he.", "I know where does he live.", "I know he lives where."]),
        answer: 0,
        explain: [
          en("I know") + " のあとに、" + rule("疑問詞 + 主語 + 動詞") + " の順で続けます。",
          en("I know " + key("where he lives") + "."),
          en("does") + " は使いません。主語 " + en("he") + " に合わせて " + en("lives") + " にします。",
          "疑問詞 " + en("where") + " は、主語の前に置きます。"
        ]
      },
      {
        id: "f2",
        text: Q_BLANK_PHRASE,
        material: eibun("Do you know what time " + B + "?", "今何時か知っていますか。"),
        choices: ["is it", "it does", "it is", "does it"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          en("What time is it?") + " を " + en("Do you know") + " のあとに入れるので、" + en("what time") + " のあとは「主語 + be動詞」の順にします。",
          en("Do you know what time " + fill("it is") + "?"),
          en("is it") + " は疑問文の語順なので、文の中では使いません。もとの文は be動詞の文なので、" + en("does") + " は使いません。"
        ]
      },
      {
        id: "f3",
        text: Q_BLANK_PHRASE,
        material: eibun("I don't know who " + B + ".", "あの男性がだれなのか、わたしは知りません。"),
        choices: ens(["that man is", "is that man", "does that man", "that man does"]),
        answer: 0,
        explain: [
          en("Who is that man?") + " を文の中に入れるので、" + en("who") + " のあとは「主語 + be動詞」の順にします。",
          en("I don't know who " + fill("that man is") + "."),
          en("is that man") + " は疑問文の語順です。be動詞の文なので、" + en("does") + " は使いません。"
        ]
      },
      {
        id: "f4",
        text: Q_BLANK_PHRASE,
        material: eibun("Tell me what you " + B + " for lunch.", "あなたが昼食に何を食べたか教えてください。"),
        choices: ens(["did you eat", "eating", "ate", "eats"]),
        answer: 2,
        explain: [
          en("What did you eat for lunch?") + " を文の中に入れると、" + en("did") + " は使わず、動詞を過去形にします。" + henka("eat", "ate"),
          en("Tell me what you " + fill("ate") + " for lunch."),
          en("did you eat") + " は疑問文の語順です。" + en("eating") + " はこれだけでは動詞になりません。",
          en("eats") + " は主語が三人称単数のときの形で、" + en("you") + " には使いません。"
        ]
      },
      {
        id: "f5",
        text: Q_WRONG,
        choices: ens(["I know what she likes.", "Do you know where the station is?", "I don't know when does the bus come.", "Please tell me how old your brother is."]),
        answer: 2,
        explain: [
          "間接疑問文では " + en("does") + " を使わず、「疑問詞 + 主語 + 動詞」の順にします。",
          seigo("I don't know when does the bus come.", "I don't know when the bus " + key("comes") + "."),
          "ほかの3つは、" + en("what she likes") + "、" + en("where the station is") + "、" + en("how old your brother is") + " と、正しい語順になっています。"
        ]
      },
      {
        id: "f6",
        text: "次の2つの文を1つの文にしたものはどれですか。",
        material: eibun([["Do you know?", "あなたは知っていますか。"], ["Where is Mr. Brown?", "ブラウン先生はどこにいますか。"]]),
        choices: ens(["Do you know where is Mr. Brown?", "Do you know where Mr. Brown does?", "Do you know Mr. Brown where is?", "Do you know where Mr. Brown is?"]),
        answer: 3,
        explain: [
          en("Do you know") + " のあとに、" + en("where") + " + 主語 " + en("Mr. Brown") + " + be動詞 " + en("is") + " の順で続けます。",
          en("Do you know " + key("where Mr. Brown is") + "?"),
          en("where is Mr. Brown") + " は疑問文の語順のままです。be動詞の文なので " + en("does") + " は使いません。",
          "疑問詞 " + en("where") + " は主語の前に置きます。"
        ]
      },
      {
        id: "f7",
        text: Q_EN_TO_JA,
        material: eibun("I don't know why she was late."),
        choices: [
          "彼女はなぜ遅れたのですか。",
          "わたしは、彼女が遅れたことを知りません。",
          "わたしは、彼女がいつ遅れたのか知りません。",
          "わたしは、彼女がなぜ遅れたのか知りません。"
        ],
        answer: 3,
        explain: [
          en("why she was late") + " は「彼女がなぜ遅れたのか」、" + en("I don't know") + " は「わたしは知りません」です。",
          "文全体はふつうの否定文なので、「〜ですか」とたずねる意味にはなりません。",
          en("why") + " は「なぜ」です。「いつ」なら " + en("when") + " です。「遅れたことを」では " + en("why") + " の意味が入りません。"
        ]
      },
      {
        id: "f8",
        text: Q_BLANK_PHRASE,
        material: eibun("Do you know who " + B + " this picture?", "この絵をだれがかいたか知っていますか。"),
        choices: ens(["painted", "painting", "did he paint", "was paint"]),
        answer: 0,
        explain: [
          en("Who painted this picture?") + " は、疑問詞 " + en("who") + " が主語の文です。文の中に入れても語順は変わりません。",
          en("Do you know who " + fill("painted") + " this picture?"),
          en("did he paint") + " は疑問文の語順で、しかも " + en("he") + " が入ると意味が変わります。",
          en("painting") + " はこれだけでは動詞になりません。" + en("was") + " と原形の " + en("paint") + " は並べません。"
        ]
      },
      {
        id: "f9",
        text: Q_REPLY,
        material: kaiwa([["A", "Do you know where Yumi is?", "ユミがどこにいるか知っていますか。"], ["B", B]]),
        choices: ens(["Yes, she is. She's in the library.", "Yes, I am. She's in the library.", "Yes, I do. She's in the library.", "Yes, she does. She's in the library."]),
        answer: 2,
        explain: [
          "質問の文全体は " + en("Do you know 〜?") + "(あなたは知っていますか)なので、" + en("Yes, I do.") + " で答えます。",
          en(key("Yes, I do.") + " She's in the library.") + "(はい。図書館にいます。)",
          en("where Yumi is") + " の " + en("is") + " に合わせて答えるのではありません。主語は " + en("you") + "、動詞は " + en("know") + " です。"
        ]
      },
      {
        id: "f10",
        text: Q_BLANK_PHRASE,
        material: eibun("I want to know how many " + B + ".", "あなたがペンを何本持っているか知りたいです。"),
        choices: ens(["do you have pens", "you have pens", "pens do you have", "pens you have"]),
        answer: 3,
        explain: [
          rule("how many + 名詞") + " はひとまとまりで前に置き、そのあとを「主語 + 動詞」の順にします。",
          en("I want to know how many " + fill("pens you have") + "."),
          en("pens do you have") + " は疑問文の語順です。" + en("pens") + " を " + en("how many") + " から離すことはしません。"
        ]
      },
      {
        id: "f11",
        text: Q_BLANK_PHRASE,
        material: eibun("Can you tell me where " + B + "?", "郵便局がどこにあるか教えてもらえますか。"),
        choices: ens(["is the post office", "the post office is", "does the post office", "the post office does"]),
        answer: 1,
        explain: [
          en("Where is the post office?") + " を文の中に入れるので、" + en("where") + " のあとは「主語 + be動詞」の順にします。",
          en("Can you tell me where " + fill("the post office is") + "?"),
          "文全体が " + en("Can you 〜?") + " の疑問文でも、" + en("where") + " のあとは疑問文の語順にしません。be動詞の文なので " + en("does") + " は使いません。"
        ]
      },
      {
        id: "f12",
        text: Q_EN_TO_JA,
        material: eibun("Do you know what this word means?"),
        choices: [
          "この単語は何を意味しますか。",
          "この単語が何を意味するか知っていますか。",
          "あなたはこの単語の意味を知りません。",
          "この単語をどう読むか知っていますか。"
        ],
        answer: 1,
        explain: [
          en("what this word means") + " は「この単語が何を意味するか」、" + en("Do you know 〜?") + " は「〜を知っていますか」です。",
          "「この単語は何を意味しますか」は " + en("What does this word mean?") + " で、" + en("Do you know") + " の意味が入っていません。",
          "疑問文なので「知りません」にはなりません。「どう読むか」なら " + en("how") + " を使います。"
        ]
      },
      {
        id: "f13",
        text: "次の疑問文を「わたしは知っています」の文の中に入れたものはどれですか。",
        material: eibun("When does the game start?", "試合はいつ始まりますか。"),
        choices: ens(["I know when does the game start.", "I know when starts the game.", "I know when the game starts.", "I know when the game start."]),
        answer: 2,
        explain: [
          en("does") + " を使わず、" + en("when") + " + 主語 " + en("the game") + " + 動詞の順にします。",
          "主語 " + en("the game") + " は三人称単数なので、" + henka("start", "starts") + " とします。",
          en("I know when the game " + key("starts") + "."),
          "動詞を主語の前に置いたり、" + en("s") + " をつけ忘れたりしないように注意します。"
        ]
      },
      {
        id: "f14",
        text: "次の疑問文を「わたしは知りません」の文の中に入れたものはどれですか。",
        material: eibun("What did he buy?", "彼は何を買いましたか。"),
        choices: ens(["I don't know what did he buy.", "I don't know what bought he.", "I don't know what he bought.", "I don't know what he buy."]),
        answer: 2,
        explain: [
          en("did") + " を使わず、動詞を過去形にします。" + henka("buy", "bought"),
          en("I don't know what he " + key("bought") + "."),
          en("what did he buy") + " は疑問文の語順のままです。過去形の " + en("bought") + " を主語の前に置くこともしません。",
          "原形の " + en("buy") + " のままだと、過去のことだと分からず、主語 " + en("he") + " にも合いません。"
        ]
      },
      {
        id: "f15",
        text: Q_BLANK,
        material: eibun("I don't know " + B + " bag is mine.", "どれがわたしのかばんか分かりません。"),
        choices: ["who", "where", "which", "how"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          "「どれが(どの〜が)」と選ぶものをたずねるのは " + en(key("which")) + " です。" + en("which bag") + " がひとまとまりで主語になります。",
          en("I don't know " + fill("which") + " bag is mine."),
          en("who") + "、" + en("where") + "、" + en("how") + " は、すぐあとに名詞の " + en("bag") + " を置いて使えません。"
        ]
      }
    ]
  });
})();
