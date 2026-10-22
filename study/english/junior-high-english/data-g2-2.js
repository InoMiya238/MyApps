// 中学英語道場: 中2「準動詞」「文の形(比較)」の5単元の中身(要点・表・例題・問題)。
// 形式の説明と、表示部品の関数(JHE.en、JHE.eibun など)は data.js の先頭を参照。
// 中2「動詞」「文の形」の5単元は data-g2.js にある。このファイルも同じ形で書く。
//
// 内容のきまり:
// ・学校文法の説明に合わせる。教科書によって扱いが分かれる点には踏みこまない。
// ・英文はすべて自作。中2までの語彙と文法の範囲で書く(受け身、現在完了、関係代名詞、
//   名詞を修飾する分詞、It is 〜 to、疑問詞 + to、want 人 to は使わない)。
// ・like / start / begin は不定詞と動名詞のどちらも使えるので、この3語の空所に
//   to 〜 と 〜ing を両方とも選択肢に入れない。stop to 〜 も選択肢にしない。
// ・比較の空所で答えが1つに決まらないもの(like 〜 more / better、not so 〜 as など)は、選択肢に入れない。
// ・表は、英語のセルを半角6字までにする。比較の表の biggest、busiest だけは7字。
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
  var Q_JA_BLANK_PHRASE = "日本語の文に合うように、空所に入る語句を選びなさい。";
  var Q_REPLY = "Aの質問に対する、Bの答えとして正しいものはどれですか。";
  var Q_REPLY_BLANK = "Bの空所に入る語はどれですか。";
  var Q_WRONG = "誤りのある文はどれですか。";
  var Q_RIGHT = "正しい文はどれですか。";
  var Q_EN_TO_JA = "次の英文の意味として正しいものはどれですか。";
  var Q_NEG = "次の文を否定文に書きかえたものはどれですか。";
  var Q_QUES = "次の文を疑問文に書きかえたものはどれですか。";
  var Q_SAME = "2つの文がほぼ同じ意味になるように、空所に入る語を選びなさい。";
  var Q_USAGE = "下線部の不定詞と同じ使い方をしているものはどれですか。";

  // =====================================================================
  // 2-6 不定詞(名詞的用法)
  // =====================================================================
  JHE.register("g2-infinitive-noun", {
    points: [
      rule("to + 動詞の原形") + " の形を不定詞といいます。主語が三人称単数でも、過去の文でも、" + rule("to のあとはいつも動詞の原形") + "です。" + seigo("He wants to plays tennis.", "He wants to " + key("play") + " tennis."),
      "不定詞の名詞的用法は「" + rule("〜すること") + "」という意味で、名詞と同じように動詞のあとに置きます。" + en("want to 〜") + "(〜したい)、" + en("like to 〜") + "(〜することが好きだ)、" + en("try to 〜") + "(〜しようとする)、" + en("need to 〜") + "(〜する必要がある)、" + en("hope to 〜") + "(〜することを望む)、" + en("decide to 〜") + "(〜することに決める)、" + en("start / begin to 〜") + "(〜し始める)。",
      "「〜になりたい」は " + en("want to " + key("be") + " 〜") + " で表します。" + en("be") + " は be動詞の原形です。" + en("I want to be a teacher.") + "(わたしは先生になりたいです。)",
      "be動詞のあとに置いて「〜することです」と言ったり、文の主語にしたりすることもできます。" + en("My dream is to travel around the world.") + "(わたしの夢は世界中を旅することです。)",
      "否定文・疑問文は、前の動詞(" + en("want") + " など)の文として作ります。" + en("to") + " のあとは変えません。" + en("I don't want to go.") + "、" + en("Does he want to go?") + " — " + en("Yes, he does.")
    ],
    chart: gojun([
      { role: "主語", en: "I" },
      { role: "動詞", en: "want" },
      { role: "to + 動詞の原形", en: "to play tennis", ja: "テニスをすること", key: true }
    ], "動詞のあとに置く") + gojun([
      { role: "主語", en: "My dream" },
      { role: "be動詞", en: "is" },
      { role: "to + 動詞の原形", en: "to be a doctor", ja: "医者になること", key: true }
    ], "be動詞のあとに置く"),
    example: {
      title: "「エミは将来、看護師になりたいと思っています。」を英語にしなさい。",
      steps: [
        "「〜になりたい」は " + en("want to be 〜") + " で表します。",
        "主語 " + en("Emi") + " は三人称単数で現在の文なので、" + henka("want", "wants") + " とします。",
        en("to") + " のあとは原形なので、" + en("be") + " のまま変えません。",
        "「将来」は " + en("in the future") + " で、文の最後に置きます。"
      ],
      result: en("Emi wants to be a nurse in the future.")
    },
    fixed: [
      {
        id: "f1",
        text: Q_BLANK_PHRASE,
        material: eibun("I want " + B + " a new computer.", "わたしは新しいコンピューターを買いたいです。"),
        choices: ["to buy", "buy", "buying", "bought"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "「〜したい」は " + en("want to") + " + 動詞の原形で表します。",
          eibun("I want " + fill("to buy") + " a new computer."),
          en("want") + " のすぐあとに、" + en("buy") + "(原形)、" + en("buying") + "(ing 形)、" + en("bought") + "(過去形)を置くことはできません。"
        ]
      },
      {
        id: "f2",
        text: Q_BLANK,
        material: eibun("My sister likes to " + B + " pictures.", "わたしの姉は絵をかくことが好きです。"),
        choices: ["draws", "draw", "drawing", "drew"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          en("to") + " のあとは、主語や時に関係なく" + rule("動詞の原形") + "です。",
          eibun("My sister likes to " + fill("draw") + " pictures."),
          "三人称単数の " + en("s") + " は、前の " + en("likes") + " にすでについています。" + en("draws") + "、" + en("drawing") + "、" + en("drew") + " は原形ではありません。"
        ]
      },
      {
        id: "f3",
        text: Q_JA_BLANK,
        material: eibun("Ken " + B + " to run every morning.", "ケンは毎朝走ることに決めました。"),
        choices: ["wanted", "liked", "decided", "tried"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          "「〜することに決める」は " + en("decide to 〜") + " です。過去の文なので " + en(key("decided")) + " にします。",
          en("wanted to 〜") + " は「〜したかった」、" + en("liked to 〜") + " は「〜することが好きだった」、" + en("tried to 〜") + " は「〜しようとした」という意味になります。"
        ]
      },
      {
        id: "f4",
        text: Q_EN_TO_JA,
        material: eibun("I want to be a soccer player."),
        choices: [
          "わたしはサッカー選手です。",
          "わたしはサッカー選手になりました。",
          "わたしはサッカーをしたいです。",
          "わたしはサッカー選手になりたいです。"
        ],
        answer: 3,
        explain: [
          en("want to be 〜") + " は「〜になりたい」という意味です。",
          "「サッカー選手です」は " + en("I am a soccer player.") + "、「サッカーをしたいです」は " + en("I want to play soccer.") + " です。",
          "「なりました」と過去のことを言う文ではありません。"
        ]
      },
      {
        id: "f5",
        text: Q_WRONG,
        choices: ens([
          "We like to sing songs.",
          "She wants to plays the piano.",
          "He started to study English.",
          "They hope to see you again."
        ]),
        answer: 1,
        explain: [
          en("to") + " のあとは動詞の原形にします。三人称単数の " + en("s") + " はつけません。",
          seigo("She wants to plays the piano.", "She wants to " + key("play") + " the piano."),
          "ほかの3つは、" + en("to") + " のあとが原形の " + en("sing / study / see") + " で、正しい文です。"
        ]
      },
      {
        id: "f6",
        text: "「あなたは何を食べたいですか。」を、正しい語順で表した文はどれですか。",
        choices: ens([
          "What do you want to eat?",
          "What do you want eat to?",
          "What you want to eat?",
          "Do you want what to eat?"
        ]),
        answer: 0,
        explain: [
          "疑問詞 " + en("What") + " を文の最初に置き、そのあとを " + en("do you want to eat") + " の疑問文の語順にします。",
          gojun([
            { role: "疑問詞", en: "What", key: true },
            { role: "do", en: "do" },
            { role: "主語", en: "you" },
            { role: "動詞", en: "want" },
            { role: "to + 原形", en: "to eat?" }
          ]),
          en("eat to") + " は順番が逆です。" + en("do") + " がない文や、" + en("what") + " が文の途中にある文は誤りです。"
        ]
      },
      {
        id: "f7",
        text: Q_NEG,
        material: eibun("I want to go shopping today.", "わたしは今日、買い物に行きたいです。"),
        choices: ens([
          "I want to don't go shopping today.",
          "I not want to go shopping today.",
          "I don't want to go shopping today.",
          "I don't want to went shopping today."
        ]),
        answer: 2,
        explain: [
          "否定文は、前の動詞 " + en("want") + " の文として作ります。" + en("want") + " の前に " + en("don't") + " を置きます。",
          en("I " + key("don't") + " want to go shopping today.") + "(わたしは今日、買い物に行きたくありません。)",
          en("to") + " のあとに " + en("don't") + " は置けません。" + en("not") + " だけを動詞の前に置くこともできません。" + en("to") + " のあとは原形なので " + en("went") + " は誤りです。"
        ]
      },
      {
        id: "f8",
        text: Q_REPLY,
        material: kaiwa([["A", "Does your brother like to cook?", "あなたのお兄さんは料理をすることが好きですか。"], ["B", B]]),
        choices: ens(["Yes, he likes.", "Yes, he is.", "Yes, he do.", "Yes, he does."]),
        answer: 3,
        explain: [
          en("Does 〜?") + " でたずねられたら、" + en("does") + " を使って答えます。",
          en("Yes, he " + key("does") + ".") + "(はい、好きです。)",
          en("likes") + " や be動詞の " + en("is") + " では答えません。主語が " + en("he") + " なので " + en("do") + " ではなく " + en("does") + " です。"
        ]
      },
      {
        id: "f9",
        text: Q_BLANK_PHRASE,
        material: eibun("My dream is " + B + " a teacher.", "わたしの夢は先生になることです。"),
        choices: ["be", "is", "to be", "am"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          "「〜になること」は " + en("to be 〜") + " で表し、be動詞 " + en("is") + " のあとに置きます。",
          eibun("My dream is " + fill("to be") + " a teacher."),
          en("is") + " のあとに、" + en("be / is / am") + " をそのまま続けることはできません。"
        ]
      },
      {
        id: "f10",
        text: Q_BLANK,
        material: eibun("It began to " + B + " in the afternoon.", "午後に雨が降り始めました。"),
        choices: ["rain", "rains", "rained", "raining"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("begin to 〜") + " は「〜し始める」です。" + en("to") + " のあとは動詞の原形にします。",
          eibun("It began to " + fill("rain") + " in the afternoon."),
          "過去の文でも、過去の形にするのは前の " + en("began") + " だけです。" + en("rains") + "、" + en("rained") + "、" + en("raining") + " は原形ではありません。"
        ]
      },
      {
        id: "f11",
        text: Q_EN_TO_JA,
        material: eibun("To read books is fun for me."),
        choices: [
          "本を読むために、わたしは楽しいです。",
          "本を読むことは、わたしにとって楽しいです。",
          "わたしは楽しい本を読みたいです。",
          "わたしは本を読んで楽しかったです。"
        ],
        answer: 1,
        explain: [
          "文の最初の " + en("To read books") + " が主語で、「本を読むこと」という意味です。",
          en("is fun for me") + " は「わたしにとって楽しい」です。",
          "「〜したい」「〜して楽しかった」という意味の語はなく、" + en("is") + " なので過去の文でもありません。"
        ]
      },
      {
        id: "f12",
        text: Q_JA_BLANK,
        material: eibun("We " + B + " to answer the question.", "わたしたちはその質問に答えようとしました。"),
        choices: ["wanted", "hoped", "needed", "tried"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          "「〜しようとする」は " + en("try to 〜") + " です。過去の文なので " + en(key("tried")) + " にします(" + henka("try", "tried") + ")。",
          en("wanted to 〜") + " は「〜したかった」、" + en("hoped to 〜") + " は「〜することを望んだ」、" + en("needed to 〜") + " は「〜する必要があった」という意味になります。"
        ]
      },
      {
        id: "f13",
        text: Q_QUES,
        material: eibun("Yumi wants to visit Kyoto.", "ユミは京都を訪れたいと思っています。"),
        choices: ens([
          "Does Yumi want to visit Kyoto?",
          "Does Yumi wants to visit Kyoto?",
          "Is Yumi want to visit Kyoto?",
          "Does Yumi want to visits Kyoto?"
        ]),
        answer: 0,
        explain: [
          "前の動詞 " + en("wants") + " の文として疑問文を作ります。主語が三人称単数なので " + en("Does") + " を文の最初に置き、" + henka("wants", "want") + " と原形にもどします。",
          en("Does 〜 wants") + " は原形になっていません。一般動詞の文なので " + en("Is") + " は使いません。" + en("to") + " のあとは原形なので " + en("visits") + " は誤りです。"
        ]
      },
      {
        id: "f14",
        text: "下線部の意味として正しいものはどれですか。",
        material: eibun("You " + u("need to") + " get up early tomorrow."),
        choices: ["〜するのが好きだ", "〜する必要がある", "〜することができる", "〜しようとした"],
        answer: 1,
        explain: [
          en("need to 〜") + " は「〜する必要がある」という意味です。",
          "文全体は「あなたは明日、早く起きる必要があります。」です。",
          "「〜するのが好きだ」は " + en("like to 〜") + "、「〜することができる」は " + en("can 〜") + "、「〜しようとした」は " + en("tried to 〜") + " です。"
        ]
      },
      {
        id: "f15",
        text: Q_REPLY,
        material: kaiwa([["A", "What do you want to be in the future?", "あなたは将来、何になりたいですか。"], ["B", B]]),
        choices: ens([
          "Yes, I do.",
          "I want be a pilot.",
          "I want to be a pilot.",
          "I want to a pilot."
        ]),
        answer: 2,
        explain: [
          "「何になりたいか」とたずねているので、" + en("I want to be 〜.") + " で答えます。",
          en("I want " + key("to be") + " a pilot.") + "(パイロットになりたいです。)",
          "疑問詞の疑問文に " + en("Yes / No") + " では答えません。" + en("to") + " がないもの、" + en("be") + " がないものは誤りです。"
        ]
      }
    ]
  });

  // =====================================================================
  // 2-7 不定詞(副詞的・形容詞的用法)
  // =====================================================================
  JHE.register("g2-infinitive-adverb-adjective", {
    points: [
      "不定詞の副詞的用法の1つめは「" + rule("〜するために") + "」(目的)です。動作のあとに置いて、何のためにするのかを表します。" + en("I went to the park to play tennis.") + "(わたしはテニスをするために公園へ行きました。)",
      en("Why 〜?") + "(なぜ)とたずねられたとき、" + en("To 〜.") + "(〜するためです)と目的を答えることもできます。" + en("Why did you go to the library?") + " — " + en("To study.") + "",
      "副詞的用法の2つめは「" + rule("〜して") + "」(感情の原因)です。" + en("happy / glad / sad / surprised") + " など、気持ちを表す語のあとに置きます。" + en("I'm glad to see you.") + "(あなたに会えてうれしいです。)",
      "形容詞的用法は「" + rule("〜するための") + "」「〜するべき」という意味で、" + rule("名詞のすぐあと") + "に置いてその名詞を説明します。" + en("a lot of homework to do") + "(するべきたくさんの宿題)、" + en("something to drink") + "(何か飲むもの)。",
      "どの用法かは、" + en("to 〜") + " の前の語と意味で見分けます。動詞のあとで「〜すること」なら名詞的用法、名詞のあとで「〜するための」なら形容詞的用法、「〜するために」「〜して」なら副詞的用法です。"
    ],
    chart: gojun([
      { role: "文", en: "I went to the library" },
      { role: "to + 動詞の原形", en: "to study", ja: "勉強するために", key: true }
    ], "副詞的用法(目的)") + gojun([
      { role: "気持ち", en: "I was happy" },
      { role: "to + 動詞の原形", en: "to see her", ja: "彼女に会えて", key: true }
    ], "副詞的用法(感情の原因)") + gojun([
      { role: "名詞", en: "something" },
      { role: "to + 動詞の原形", en: "to drink", ja: "飲むための", key: true }
    ], "形容詞的用法"),
    example: {
      title: "下線部の意味を考えて、文全体を日本語にしなさい。" + eibun("I don't have time " + u("to watch TV") + " today."),
      steps: [
        en("to watch TV") + " のすぐ前は、名詞の " + en("time") + "(時間)です。",
        "名詞のあとの " + en("to 〜") + " は、その名詞を説明する形容詞的用法で、「テレビを見るための時間」となります。",
        en("I don't have 〜") + " は「〜がありません」です。"
      ],
      result: "わたしは今日、テレビを見る時間がありません。"
    },
    fixed: [
      {
        id: "f1",
        text: Q_JA_BLANK_PHRASE,
        material: eibun("I went to the library " + B + " books.", "わたしは本を借りるために図書館へ行きました。"),
        choices: ["borrow", "to borrow", "borrowed", "borrowing"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          "「〜するために」は不定詞(" + en("to") + " + 動詞の原形)で表し、文のあとに置きます。",
          eibun("I went to the library " + fill("to borrow") + " books."),
          "動詞 " + en("went") + " のある文に、" + en("borrow") + "、" + en("borrowed") + "、" + en("borrowing") + " をそのまま続けることはできません。"
        ]
      },
      {
        id: "f2",
        text: Q_EN_TO_JA,
        material: eibun("She was happy to hear the news."),
        choices: [
          "彼女はその知らせを聞くために、うれしかったです。",
          "彼女はうれしい知らせを聞きたかったです。",
          "彼女はその知らせを聞いて、うれしかったです。",
          "彼女はその知らせを聞くことが好きでした。"
        ],
        answer: 2,
        explain: [
          en("happy") + "(うれしい)のあとの " + en("to hear") + " は、うれしい理由を表して「聞いて」という意味です(感情の原因)。",
          "「〜するために」と目的にすると、意味が通りません。",
          "「聞きたかった」は " + en("wanted to hear") + "、「聞くことが好きだった」は " + en("liked to hear") + " です。"
        ]
      },
      {
        id: "f3",
        text: Q_JA_BLANK_PHRASE,
        material: eibun("I want " + B + ".", "わたしは何か飲むものがほしいです。"),
        choices: ens([
          "something drink",
          "to something drink",
          "drink to something",
          "something to drink"
        ]),
        answer: 3,
        explain: [
          "「何か飲むもの」は、" + en("something") + " のすぐあとに " + en("to drink") + " を置きます(形容詞的用法)。",
          eibun("I want " + fill("something to drink") + "."),
          en("to") + " のない形や、" + en("to") + " と動詞を離した形は誤りです。"
        ]
      },
      {
        id: "f4",
        text: Q_REPLY,
        material: kaiwa([["A", "Why did you get up early this morning?", "なぜ今朝は早く起きたのですか。"], ["B", B]]),
        choices: ens(["Yes, I did.", "At six.", "To walk my dog.", "Because walk my dog."]),
        answer: 2,
        explain: [
          en("Why 〜?") + " には、" + en("To 〜.") + "(〜するためです)で目的を答えることができます。",
          en(key("To walk") + " my dog.") + "(犬を散歩させるためです。)",
          en("Why") + " の疑問文に " + en("Yes / No") + " では答えません。" + en("At six.") + " は時刻の答えです。" + en("Because") + " のあとには主語と動詞が必要です。"
        ]
      },
      {
        id: "f5",
        text: Q_BLANK_PHRASE,
        material: eibun("Kyoto has many places " + B + ".", "京都には訪れるべき場所がたくさんあります。"),
        choices: ["to visit", "visit", "visits", "visiting"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "名詞 " + en("places") + " のあとに " + en("to visit") + " を置いて、「訪れるべき場所」と説明します(形容詞的用法)。",
          eibun("Kyoto has many places " + fill("to visit") + "."),
          "名詞のあとに、" + en("visit") + "、" + en("visits") + "、" + en("visiting") + " をそのまま置いても、この意味にはなりません。"
        ]
      },
      {
        id: "f6",
        text: Q_USAGE,
        material: eibun("Tom came to Japan " + u("to study") + " Japanese."),
        choices: ens([
          "I want to study math.",
          "I have a lot of work to do.",
          "My dream is to be a singer.",
          "She got up early to make breakfast."
        ]),
        answer: 3,
        explain: [
          "下線部は「勉強するために」で、目的を表す副詞的用法です。",
          en("to make breakfast") + " も「朝食を作るために」と目的を表しています。",
          en("want to study") + " と " + en("is to be") + " は「〜すること」(名詞的用法)、" + en("work to do") + " は「するべき仕事」(形容詞的用法)です。"
        ]
      },
      {
        id: "f7",
        text: Q_USAGE,
        material: eibun("I have many books " + u("to read") + "."),
        choices: ens([
          "He studied hard to pass the test.",
          "He has something to tell you.",
          "He was sad to lose the game.",
          "He likes to read books."
        ]),
        answer: 1,
        explain: [
          "下線部は、名詞 " + en("books") + " のあとで「読むべき本」と説明する形容詞的用法です。",
          en("something to tell you") + " も、" + en("something") + " を説明して「あなたに話すこと」という意味です。",
          en("to pass") + " は「合格するために」、" + en("to lose") + " は「負けて」(副詞的用法)、" + en("likes to read") + " は「読むこと」(名詞的用法)です。"
        ]
      },
      {
        id: "f8",
        text: Q_WRONG,
        choices: ens([
          "I'm glad to meet you.",
          "He went to the store to buys milk.",
          "We went to the sea to swim.",
          "Do you have anything to eat?"
        ]),
        answer: 1,
        explain: [
          "不定詞は、主語が三人称単数でも過去の文でも、" + en("to") + " のあとを原形にします。",
          seigo("He went to the store to buys milk.", "He went to the store to " + key("buy") + " milk."),
          "ほかの3つは、" + en("to meet / to swim / to eat") + " と原形になっていて正しい文です。"
        ]
      },
      {
        id: "f9",
        text: "「わたしはあなたに会えてとてもうれしいです。」を、正しい語順で表した文はどれですか。",
        choices: ens([
          "I'm very happy see to you.",
          "I'm to see very happy you.",
          "I'm very happy to see you.",
          "I'm very to happy see you."
        ]),
        answer: 2,
        explain: [
          "気持ちを表す " + en("very happy") + " のあとに、理由の " + en("to see you") + "(あなたに会えて)を置きます。",
          gojun([
            { role: "主語 + be動詞", en: "I'm" },
            { role: "気持ち", en: "very happy" },
            { role: "to + 原形", en: "to see you.", key: true }
          ]),
          en("to") + " と動詞の順が逆のもの、" + en("to") + " の位置がちがうものは誤りです。"
        ]
      },
      {
        id: "f10",
        text: Q_JA_BLANK,
        material: eibun("We were " + B + " to hear the news.", "その知らせを聞いて、わたしたちは驚きました。"),
        choices: ["happy", "surprised", "sad", "glad"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          "「驚いた」は " + en(key("surprised")) + " です。そのあとの " + en("to hear") + " が「聞いて」と驚いた理由を表します。",
          en("happy") + " と " + en("glad") + " は「うれしい」、" + en("sad") + " は「悲しい」という意味です。"
        ]
      },
      {
        id: "f11",
        text: Q_EN_TO_JA,
        material: eibun("I have a lot of homework to do today."),
        choices: [
          "わたしは今日、するべき宿題がたくさんあります。",
          "わたしは今日、宿題をたくさんしたいです。",
          "わたしは今日、たくさんの宿題をしました。",
          "わたしは今日、宿題をするために忙しいです。"
        ],
        answer: 0,
        explain: [
          en("to do") + " は、すぐ前の名詞 " + en("homework") + " を説明して「するべき宿題」となります(形容詞的用法)。",
          "「したいです」は " + en("want to do") + "、「しました」は " + en("did") + " を使った文です。",
          "「忙しい」という意味の語(" + en("busy") + ")は文にありません。"
        ]
      },
      {
        id: "f12",
        text: Q_BLANK_PHRASE,
        material: eibun("It's time " + B + " to bed.", "寝る時間です。"),
        choices: ["go", "going", "went", "to go"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          "名詞 " + en("time") + " のあとに " + en("to go") + " を置いて、「寝るための時間」と説明します(形容詞的用法)。",
          eibun("It's time " + fill("to go") + " to bed."),
          en("time") + " のあとに、" + en("go") + "、" + en("going") + "、" + en("went") + " をそのまま置くことはできません。"
        ]
      },
      {
        id: "f13",
        text: Q_RIGHT,
        choices: ens([
          "There are many things see to in Nara.",
          "There are many to see things in Nara.",
          "There are many things to seeing in Nara.",
          "There are many things to see in Nara."
        ]),
        answer: 3,
        explain: [
          "「見るべきもの」は、名詞 " + en("things") + " のすぐあとに " + en("to see") + " を置きます。",
          eibun("There are many things " + key("to see") + " in Nara.", "奈良には見るべきものがたくさんあります。"),
          en("to") + " と動詞の順が逆のもの、名詞の前に置いたもの、" + en("to") + " のあとが " + en("ing") + " 形のものは誤りです。"
        ]
      },
      {
        id: "f14",
        text: Q_REPLY_BLANK,
        material: kaiwa([
          ["A", "Why did you go to the park?", "あなたはなぜ公園へ行ったのですか。"],
          ["B", B + " play baseball with my friends.", "友だちと野球をするためです。"]
        ]),
        choices: ["Because", "For", "To", "And"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          "目的を答えるときは、" + en("To") + " + 動詞の原形で答えることができます。",
          eibun(fill("To") + " play baseball with my friends."),
          en("Because") + " のあとには主語と動詞が必要です。" + en("For") + " のあとに動詞の原形は置けません。" + en("And") + " では答えになりません。"
        ]
      },
      {
        id: "f15",
        text: Q_JA_BLANK_PHRASE,
        material: eibun("I listen to the radio every day " + B + ".", "わたしは英語を勉強するために、毎日ラジオを聞きます。"),
        choices: ens([
          "for study English",
          "to study English",
          "to English study",
          "study to English"
        ]),
        answer: 1,
        explain: [
          "「〜するために」は " + en("to") + " + 動詞の原形で、文のあとに置きます。",
          eibun("I listen to the radio every day " + fill("to study English") + "."),
          en("for") + " のあとに動詞の原形は置けません。" + en("to") + " と動詞を離したもの、順番が逆のものは誤りです。"
        ]
      }
    ]
  });

  // =====================================================================
  // 2-8 動名詞
  // =====================================================================
  JHE.register("g2-gerunds", {
    points: [
      "動詞の " + en("ing") + " 形は、「" + rule("〜すること") + "」という意味で名詞のように使えます。これを動名詞といいます。" + en("I like playing soccer.") + "(わたしはサッカーをすることが好きです。)主語にもなり、" + en("Playing soccer is fun.") + " のように三人称単数としてあつかいます。",
      rule(en("enjoy / finish / stop") + " のあとは動名詞") + "です。不定詞は使いません。" + seigo("I enjoyed to sing.", "I enjoyed " + key("singing") + ".") + en("stop 〜ing") + " は「〜するのをやめる」という意味です。",
      rule(en("want / hope / decide") + " のあとは不定詞") + "です。動名詞は使いません。" + seigo("I want playing tennis.", "I want " + key("to play") + " tennis."),
      en("like / love / start / begin") + " のあとは、" + rule("動名詞と不定詞のどちらも") + "使えます。意味もほぼ同じです。" + en("I like swimming.") + " = " + en("I like to swim.") + "",
      rule("前置詞のあとに動詞を置くときは動名詞") + "にします。" + en("I'm good at swimming.") + "(わたしは泳ぐのが得意です。)、" + en("Thank you for helping me.") + "、" + en("How about going to the zoo?") + "(動物園に行くのはどうですか。)"
    ],
    chart: hyo({
      caption: "あとに置く形(○は使える、×は使えない)",
      head: ["", "動詞", "〜ing", "to 〜"],
      rows: [
        ["楽しむ", "enjoy", { ja: "○" }, { ja: "×" }],
        ["終える", "finish", { ja: "○" }, { ja: "×" }],
        ["したい", "want", { ja: "×" }, { ja: "○" }],
        ["望む", "hope", { ja: "×" }, { ja: "○" }],
        ["決める", "decide", { ja: "×" }, { ja: "○" }],
        ["好き", "like", { ja: "○" }, { ja: "○" }],
        ["始める", "start", { ja: "○" }, { ja: "○" }],
        ["始める", "begin", { ja: "○" }, { ja: "○" }]
      ],
      compact: true
    }),
    example: {
      title: "( )内の語を正しい形にかえなさい。" + eibun("We finished (clean) the classroom.", "わたしたちは教室のそうじを終えました。"),
      steps: [
        en("finish") + "(終える)のあとに動詞を置くときは、動名詞にします。不定詞は使いません。",
        en("clean") + " は、そのまま " + en("ing") + " をつけます。" + henka("clean", "cleaning"),
        "過去の文でも、過去の形にするのは " + en("finished") + " だけです。"
      ],
      result: en("cleaning") + "(" + en("We finished cleaning the classroom.") + ")"
    },
    fixed: [
      {
        id: "f1",
        text: Q_BLANK_PHRASE,
        material: eibun("I enjoyed " + B + " with my friends yesterday.", "わたしは昨日、友だちとおしゃべりを楽しみました。"),
        choices: ["to talk", "talking", "talk", "talked"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          en("enjoy") + " のあとは動名詞(" + en("ing") + " 形)にします。",
          eibun("I enjoyed " + fill("talking") + " with my friends yesterday."),
          en("enjoy") + " のあとに不定詞の " + en("to talk") + " は使えません。" + en("talk") + "、" + en("talked") + " もそのままでは続けられません。"
        ]
      },
      {
        id: "f2",
        text: Q_BLANK_PHRASE,
        material: eibun("I hope " + B + " you again.", "またあなたに会えることを望んでいます。"),
        choices: ["seeing", "see", "saw", "to see"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          en("hope") + " のあとは不定詞(" + en("to") + " + 動詞の原形)にします。",
          eibun("I hope " + fill("to see") + " you again."),
          en("hope") + " のあとに動名詞の " + en("seeing") + " は使えません。" + en("see") + "、" + en("saw") + " もそのままでは続けられません。"
        ]
      },
      {
        id: "f3",
        text: Q_BLANK_PHRASE,
        material: eibun("Did you finish " + B + " the letter?", "あなたは手紙を書き終えましたか。"),
        choices: ["writing", "write", "to write", "wrote"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("finish") + " のあとは動名詞にします。「〜し終える」は " + en("finish 〜ing") + " です。",
          eibun("Did you finish " + fill("writing") + " the letter?"),
          en("finish") + " のあとに不定詞の " + en("to write") + " は使えません。" + en("write") + "、" + en("wrote") + " もそのままでは続けられません。"
        ]
      },
      {
        id: "f4",
        text: Q_BLANK_PHRASE,
        material: eibun("She decided " + B + " in Canada.", "彼女はカナダで勉強することに決めました。"),
        choices: ["studying", "study", "to study", "studies"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          en("decide") + " のあとは不定詞にします。「〜することに決める」は " + en("decide to 〜") + " です。",
          eibun("She decided " + fill("to study") + " in Canada."),
          en("decide") + " のあとに動名詞の " + en("studying") + " は使えません。" + en("study") + "、" + en("studies") + " もそのままでは続けられません。"
        ]
      },
      {
        id: "f5",
        text: Q_BLANK_PHRASE,
        material: eibun("Thank you for " + B + " me.", "手伝ってくれてありがとう。"),
        choices: ["help", "to help", "helping", "helped"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          en("for") + " は前置詞です。" + rule("前置詞のあとに動詞を置くときは動名詞") + "にします。",
          eibun("Thank you for " + fill("helping") + " me."),
          "前置詞のあとに、不定詞の " + en("to help") + " や、" + en("help") + "、" + en("helped") + " は置けません。"
        ]
      },
      {
        id: "f6",
        text: Q_BLANK,
        material: eibun("Ken is good at " + B + ".", "ケンは泳ぐのが得意です。"),
        choices: ["swim", "swims", "swam", "swimming"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          en("be good at 〜") + " は「〜が得意だ」です。前置詞 " + en("at") + " のあとなので動名詞にします。",
          en("swim") + " は " + en("m") + " を重ねて " + en("ing") + " をつけます。" + henka("swim", "swimming"),
          "前置詞のあとに、" + en("swim") + "、" + en("swims") + "、" + en("swam") + " は置けません。"
        ]
      },
      {
        id: "f7",
        text: "次の文を、動名詞を使ってほぼ同じ意味に書きかえたものはどれですか。",
        material: eibun("My brother started to learn judo last year.", "兄は去年、柔道を習い始めました。"),
        choices: ens([
          "My brother started learning judo last year.",
          "My brother started learn judo last year.",
          "My brother started to learning judo last year.",
          "My brother learning started judo last year."
        ]),
        answer: 0,
        explain: [
          en("start") + " のあとは、不定詞と動名詞のどちらも使えます。意味もほぼ同じです。",
          henka("started to learn", "started learning"),
          en("started learn") + " は形が誤りです。" + en("to") + " のあとに " + en("ing") + " 形は置けません。動名詞の位置がちがうものも誤りです。"
        ]
      },
      {
        id: "f8",
        text: Q_WRONG,
        choices: ens([
          "We enjoyed watching the game.",
          "He started running.",
          "I want playing the guitar.",
          "She likes to cook."
        ]),
        answer: 2,
        explain: [
          en("want") + " のあとは不定詞にします。動名詞は使いません。",
          seigo("I want playing the guitar.", "I want " + key("to play") + " the guitar."),
          en("enjoy") + " のあとは動名詞、" + en("start / like") + " のあとはどちらも使えるので、ほかの3つは正しい文です。"
        ]
      },
      {
        id: "f9",
        text: Q_EN_TO_JA,
        material: eibun("My hobby is taking pictures."),
        choices: [
          "わたしの趣味は写真をとっていることです。",
          "わたしの趣味のために写真をとります。",
          "わたしは趣味で写真をとりました。",
          "わたしの趣味は写真をとることです。"
        ],
        answer: 3,
        explain: [
          en("taking pictures") + " は動名詞で、「写真をとること」という意味です。",
          "be動詞 " + en("is") + " のあとに置いて、趣味が何かを表しています。",
          "「〜ために」「〜しました」という意味の語はなく、" + en("is") + " なので過去の文でもありません。"
        ]
      },
      {
        id: "f10",
        text: Q_BLANK,
        material: eibun("How about " + B + " tennis after school?", "放課後、テニスをするのはどうですか。"),
        choices: ["play", "playing", "played", "plays"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          en("How about 〜ing?") + " は「〜するのはどうですか」と、さそったり提案したりする言い方です。",
          en("about") + " は前置詞なので、あとの動詞は動名詞にします。",
          eibun("How about " + fill("playing") + " tennis after school?")
        ]
      },
      {
        id: "f11",
        text: "「歌を歌うことはとても楽しいです。」を表す文はどれですか。",
        choices: ens([
          "Sing songs is a lot of fun.",
          "Singing songs are a lot of fun.",
          "Singing songs is a lot of fun.",
          "Sang songs is a lot of fun."
        ]),
        answer: 2,
        explain: [
          "「歌を歌うこと」は動名詞の " + en("Singing songs") + " で表し、文の主語にします。",
          "動名詞の主語は、" + en("songs") + " が複数でも" + rule("三人称単数") + "としてあつかうので、be動詞は " + en("is") + " です。",
          en("Sing") + "(原形)や " + en("Sang") + "(過去形)は、そのままでは主語になりません。"
        ]
      },
      {
        id: "f12",
        text: Q_JA_BLANK,
        material: eibun("It stopped " + B + ".", "雨がやみました。"),
        choices: ["rain", "rains", "raining", "rained"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          "「〜するのをやめる」は " + en("stop 〜ing") + " です。" + en("stop") + " のあとに動名詞を置きます。",
          eibun("It stopped " + fill("raining") + "."),
          en("stopped") + " のあとに、" + en("rain") + "、" + en("rains") + "、" + en("rained") + " をそのまま続けることはできません。"
        ]
      },
      {
        id: "f13",
        text: Q_REPLY,
        material: kaiwa([["A", "What do you enjoy doing on weekends?", "あなたは週末に何をして楽しみますか。"], ["B", B]]),
        choices: ens([
          "Yes, I enjoy.",
          "I enjoy cooking with my mother.",
          "I enjoy to cook with my mother.",
          "I enjoy cook with my mother."
        ]),
        answer: 1,
        explain: [
          en("enjoy") + " のあとは動名詞なので、" + en("I enjoy 〜ing.") + " で答えます。",
          en("I enjoy " + key("cooking") + " with my mother.") + "(母と料理をするのを楽しみます。)",
          "疑問詞の疑問文に " + en("Yes") + " では答えません。" + en("enjoy") + " のあとに不定詞や動詞の原形は置けません。"
        ]
      },
      {
        id: "f14",
        text: Q_WRONG,
        choices: ens([
          "I'm interested in learning Chinese.",
          "She went home after finishing her homework.",
          "How about going to the zoo?",
          "He is good at play the piano."
        ]),
        answer: 3,
        explain: [
          "前置詞 " + en("at") + " のあとに動詞を置くときは、動名詞にします。",
          seigo("He is good at play the piano.", "He is good at " + key("playing") + " the piano."),
          "ほかの3つは、前置詞 " + en("in / after / about") + " のあとが動名詞になっていて、正しい文です。"
        ]
      },
      {
        id: "f15",
        text: Q_SAME,
        material: eibun(["It began to snow.", "It began " + B + "."]),
        choices: ["snow", "snows", "snowed", "snowing"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          en("begin") + " のあとは、不定詞と動名詞のどちらも使えます。意味もほぼ同じです(雪が降り始めました)。",
          eibun("It began " + fill("snowing") + "."),
          en("began") + " のあとに、" + en("snow") + "、" + en("snows") + "、" + en("snowed") + " をそのまま続けることはできません。"
        ]
      }
    ]
  });

  // =====================================================================
  // 2-9 比較級と最上級
  // =====================================================================
  JHE.register("g2-comparative-superlative", {
    points: [
      "2つを比べて「…より〜」と言うときは、" + rule("比較級 + than …") + " を使います。比較級は、形容詞や副詞の終わりに " + en("er") + " をつけた形です。" + en("Ken is taller than Tom.") + "(ケンはトムより背が高いです。)",
      "3つ以上の中で「いちばん〜」と言うときは、" + rule("the + 最上級") + " を使います。最上級は、終わりに " + en("est") + " をつけた形です。" + en("Ken is the tallest in his class.") + "(ケンはクラスでいちばん背が高いです。)",
      en("er / est") + " のつけ方: " + en("e") + " で終わる語は " + en("r / st") + " だけ(" + henka("nice", "nicer") + ")、「子音字 + " + en("y") + "」で終わる語は " + en("y") + " を " + en("i") + " にかえる(" + henka("easy", "easier") + ")、" + en("big / hot") + " などは最後の文字を重ねる(" + henka("big", "bigger") + ")。",
      "「〜の中で」は、" + rule("in + 場所・集団") + "(" + en("in my class") + "、" + en("in Japan") + ")、" + rule("of + 複数のもの・数") + "(" + en("of the three") + "、" + en("of all") + ")で表します。",
      en("Which is 〜er, A or B?") + "(AとBでは、どちらがより〜ですか)には " + en("A is.") + " のように答えます。" + en("Who is the 〜est in 〜?") + " には " + en("Ken is.") + " のように答えます。"
    ],
    chart: hyo({
      caption: "比較級・最上級の作り方",
      head: ["", "原級", "比較級", "最上級"],
      rows: [
        ["ふつう", "old", "older", "oldest"],
        ["語尾e", "nice", "nicer", "nicest"],
        ["語尾y", "busy", "busier", "busiest"],
        ["重ねる", "big", "bigger", "biggest"]
      ],
      compact: true
    }) + gojun([
      { role: "主語", en: "Ken" },
      { role: "be動詞", en: "is" },
      { role: "比較級", en: "taller", key: true },
      { role: "than", en: "than Tom." }
    ], "…より〜") + gojun([
      { role: "主語", en: "Ken" },
      { role: "be動詞", en: "is" },
      { role: "the + 最上級", en: "the tallest", key: true },
      { role: "in / of", en: "in his class." }
    ], "いちばん〜"),
    example: {
      title: "( )内の語を正しい形にかえなさい。" + eibun("This box is (big) than that box.", "この箱はあの箱より大きいです。"),
      steps: [
        en("than") + "(…より)があるので、2つを比べる比較級にします。",
        en("big") + " は最後の " + en("g") + " を重ねて " + en("er") + " をつけます。" + henka("big", "bigger"),
        en("biger") + " としないように注意します。"
      ],
      result: en("bigger") + "(" + en("This box is bigger than that box.") + ")"
    },
    fixed: [
      {
        id: "f1",
        text: Q_BLANK,
        material: eibun("My father is " + B + " than my mother.", "父は母より年上です。"),
        choices: ["old", "older", "oldest", "more old"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          en("than") + "(…より)があるので、比較級にします。" + henka("old", "older"),
          eibun("My father is " + fill("older") + " than my mother."),
          en("old") + " は原級、" + en("oldest") + " は最上級です。" + en("old") + " は " + en("er") + " をつける語なので、" + en("more old") + " とはしません。"
        ]
      },
      {
        id: "f2",
        text: en("easy") + " の比較級として正しいものはどれですか。",
        choices: ["easyer", "easiest", "easier", "easyier"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          en("easy") + " は「子音字 + " + en("y") + "」で終わる語なので、" + en("y") + " を " + en("i") + " にかえて " + en("er") + " をつけます。",
          henka("easy", "easier"),
          en("easyer") + " と " + en("easyier") + " は、" + en("y") + " の変え方が誤りです。" + en("easiest") + " は最上級です。"
        ]
      },
      {
        id: "f3",
        text: en("hot") + " の最上級として正しいものはどれですか。",
        choices: ["hotest", "hotter", "hoter", "hottest"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          en("hot") + " は最後の " + en("t") + " を重ねて " + en("est") + " をつけます。",
          henka("hot", "hottest"),
          en("hotest") + " は " + en("t") + " を重ねていません。" + en("hotter") + " は比較級で、" + en("hoter") + " は形が誤りです。"
        ]
      },
      {
        id: "f4",
        text: Q_BLANK,
        material: eibun("This is the " + B + " river in Japan.", "これは日本でいちばん長い川です。"),
        choices: ["longest", "long", "longer", "more long"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "「いちばん〜」なので、" + en("the") + " + 最上級にします。" + henka("long", "longest"),
          eibun("This is the " + fill("longest") + " river in Japan."),
          en("long") + " は原級、" + en("longer") + " は比較級です。" + en("long") + " は " + en("est") + " をつける語なので、" + en("more") + " は使いません。"
        ]
      },
      {
        id: "f5",
        text: Q_BLANK,
        material: eibun("Emi is the youngest " + B + " the four.", "エミは4人の中でいちばん年下です。"),
        choices: ["in", "of", "than", "at"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          en("the four") + "(4人)のように、" + rule("複数の人やもの・数") + "が続くときは " + en("of") + " を使います。",
          eibun("Emi is the youngest " + fill("of") + " the four."),
          en("in") + " は場所や集団(" + en("in my class") + " など)に使います。" + en("than") + " は比較級のあとに使う語です。"
        ]
      },
      {
        id: "f6",
        text: Q_BLANK,
        material: eibun("Mt. Fuji is the highest mountain " + B + " Japan.", "富士山は日本でいちばん高い山です。"),
        choices: ["of", "than", "in", "on"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          en("Japan") + " のような" + rule("場所や集団") + "が続くときは " + en("in") + " を使います。",
          eibun("Mt. Fuji is the highest mountain " + fill("in") + " Japan."),
          en("of") + " は複数のもの・数(" + en("of the three") + " など)に使います。" + en("than") + " は比較級のあと、" + en("on") + " は「〜の上に」です。"
        ]
      },
      {
        id: "f7",
        text: Q_REPLY,
        material: kaiwa([["A", "Which is bigger, your dog or Ken's dog?", "あなたの犬とケンの犬では、どちらが大きいですか。"], ["B", B]]),
        choices: ens(["Yes, it is.", "Mine does.", "Mine is.", "Ken's dog does."]),
        answer: 2,
        explain: [
          en("Which is 〜er, A or B?") + " には、どちらかを選んで「〜 " + en("is") + ".」と答えます。",
          en("Mine " + key("is") + ".") + "(わたしの犬です。)" + en("Mine") + " は「わたしのもの」です。",
          en("Which") + " の疑問文に " + en("Yes") + " では答えません。be動詞の疑問文なので、" + en("does") + " では答えません。"
        ]
      },
      {
        id: "f8",
        text: Q_WRONG,
        choices: ens([
          "Tom is taller than Ken.",
          "This is the newest car of the three.",
          "Today is hotter than yesterday.",
          "My room is biger than yours."
        ]),
        answer: 3,
        explain: [
          en("big") + " は最後の " + en("g") + " を重ねて比較級にします。",
          seigo("My room is biger than yours.", "My room is " + key("bigger") + " than yours."),
          en("taller / newest / hotter") + " は正しい形で、ほかの3つは正しい文です。"
        ]
      },
      {
        id: "f9",
        text: "「このかばんはあのかばんより小さいです。」を、正しい語順で表した文はどれですか。",
        choices: ens([
          "This bag is smaller than that one.",
          "This bag is than smaller that one.",
          "This bag smaller is than that one.",
          "This bag is smaller that than one."
        ]),
        answer: 0,
        explain: [
          "「主語 + be動詞 + 比較級 + " + en("than") + " …」の順にします。" + en("that one") + " は「あのかばん」です。",
          gojun([
            { role: "主語", en: "This bag" },
            { role: "be動詞", en: "is" },
            { role: "比較級", en: "smaller", key: true },
            { role: "than", en: "than that one." }
          ]),
          en("than") + " は比較級のすぐあとに置きます。be動詞の位置がちがうものも誤りです。"
        ]
      },
      {
        id: "f10",
        text: Q_EN_TO_JA,
        material: eibun("Yuki gets up the earliest in her family."),
        choices: [
          "ユキは家族の中でいちばん遅く起きます。",
          "ユキは家族の中でいちばん早く起きます。",
          "ユキは家族より早く起きます。",
          "ユキは家族といっしょに早く起きます。"
        ],
        answer: 1,
        explain: [
          en("earliest") + " は " + en("early") + "(早く)の最上級です。" + henka("early", "earliest"),
          en("the earliest in her family") + " で「家族の中でいちばん早く」となります。",
          "「遅く」は " + en("late") + "、「…より」なら比較級と " + en("than") + "、「いっしょに」なら " + en("with") + " を使います。"
        ]
      },
      {
        id: "f11",
        text: Q_REPLY,
        material: kaiwa([["A", "Who is the tallest in your class?", "あなたのクラスでいちばん背が高いのはだれですか。"], ["B", B]]),
        choices: ens(["Yes, he is.", "Taro does.", "Taro is taller.", "Taro is."]),
        answer: 3,
        explain: [
          en("Who is the 〜est?") + " には、人を答えて「〜 " + en("is") + ".」と答えます。",
          en("Taro " + key("is") + ".") + "(タロウです。)",
          en("Who") + " の疑問文に " + en("Yes") + " では答えません。be動詞の疑問文なので " + en("does") + " は使いません。" + en("taller") + " は比較級で、「いちばん」の答えになりません。"
        ]
      },
      {
        id: "f12",
        text: Q_JA_BLANK,
        material: eibun("Which is the " + B + " of the three?", "この3つの中で、どれがいちばん新しいですか。"),
        choices: ["new", "newer", "newest", "most new"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          "「3つの中でいちばん〜」なので、" + en("the") + " + 最上級にします。" + henka("new", "newest"),
          eibun("Which is the " + fill("newest") + " of the three?"),
          en("new") + " は原級、" + en("newer") + " は比較級です。" + en("new") + " は " + en("est") + " をつける語なので、" + en("most new") + " とはしません。"
        ]
      },
      {
        id: "f13",
        text: Q_SAME,
        material: eibun(["Tom is older than Ken.", "Ken is " + B + " than Tom."]),
        choices: ["younger", "older", "young", "youngest"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "「トムはケンより年上」は、ケンから見ると「ケンはトムより年下」です。",
          eibun("Ken is " + fill("younger") + " than Tom."),
          en("older") + " では意味が逆になります。" + en("than") + " の前なので、原級の " + en("young") + " や最上級の " + en("youngest") + " は使えません。"
        ]
      },
      {
        id: "f14",
        text: Q_JA_BLANK,
        material: eibun("Ken runs the " + B + " in his class.", "ケンはクラスでいちばん速く走ります。"),
        choices: ["fast", "faster", "more fast", "fastest"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          en("fast") + "(速く)のような副詞も、最上級にして「いちばん〜」と言えます。" + henka("fast", "fastest"),
          eibun("Ken runs the " + fill("fastest") + " in his class."),
          en("fast") + " は原級、" + en("faster") + " は比較級です。" + en("fast") + " は " + en("est") + " をつける語なので、" + en("more fast") + " とはしません。"
        ]
      },
      {
        id: "f15",
        text: Q_RIGHT,
        choices: ens([
          "Lake Biwa is the larger lake in Japan.",
          "Lake Biwa is the largest lake in Japan.",
          "Lake Biwa is largest lake in Japan.",
          "Lake Biwa is the most large lake in Japan."
        ]),
        answer: 1,
        explain: [
          "「いちばん〜」は " + en("the") + " + 最上級で、" + en("large") + " は " + en("e") + " で終わるので " + en("st") + " だけをつけます。",
          eibun("Lake Biwa is " + key("the largest") + " lake in Japan.", "琵琶湖は日本でいちばん大きい湖です。"),
          en("larger") + " は比較級です。最上級の前の " + en("the") + " がないものは誤りです。" + en("large") + " は " + en("most") + " を使う語ではありません。"
        ]
      }
    ]
  });

  // =====================================================================
  // 2-10 more / most と as 〜 as
  // =====================================================================
  JHE.register("g2-comparison-more-as", {
    points: [
      en("beautiful / interesting / famous / popular / difficult / important / useful") + " など、つづりの長い語は、" + en("er / est") + " をつけずに、" + rule("前に more / most を置きます") + "。" + en("more interesting than 〜") + "、" + en("the most popular") + "。",
      rule(en("good / well") + " → " + en("better") + " → " + en("best")) + "、" + rule(en("many / much") + " → " + en("more") + " → " + en("most")) + " のように、形がすっかり変わる語もあります。",
      "好みを比べるときは、" + rule(en("like A better than B")) + "(BよりAが好き)、" + rule(en("like 〜 the best")) + "(〜がいちばん好き)と言います。" + en("Which do you like better, A or B?") + " には " + en("I like A better.") + " と答えます。",
      rule(en("as") + " + 原級 + " + en("as …")) + " は「…と同じくらい〜」です。" + en("as") + " と " + en("as") + " のあいだは、" + en("er") + " をつけないもとの形(原級)にします。" + en("Ken is as tall as Tom.") + "(ケンはトムと同じくらいの背の高さです。)",
      rule(en("not as 〜 as …")) + " は「…ほど〜ない」です。" + en("This bag is not as big as that one.") + "(このかばんはあのかばんほど大きくありません。)は、" + en("That bag is bigger than this one.") + " とほぼ同じ意味です。"
    ],
    chart: hyo({
      caption: "形が変わる語",
      head: ["", "原級", "比較級", "最上級"],
      rows: [
        ["よい", "good", "better", "best"],
        ["上手に", "well", "better", "best"],
        ["多数の", "many", "more", "most"],
        ["多量の", "much", "more", "most"]
      ],
      compact: true
    }) + gojun([
      { role: "主語", en: "This book" },
      { role: "be動詞", en: "is" },
      { role: "more + 原級", en: "more interesting", key: true },
      { role: "than", en: "than that one." }
    ], "つづりの長い語の比較級") + gojun([
      { role: "主語", en: "Ken" },
      { role: "be動詞", en: "is" },
      { role: "as + 原級 + as", en: "as tall as", key: true },
      { role: "比べる相手", en: "Tom." }
    ], "…と同じくらい〜"),
    example: {
      title: "「この本はあの本よりおもしろいです。」を英語にしなさい。",
      steps: [
        "「おもしろい」は " + en("interesting") + " です。つづりの長い語なので、" + en("er") + " ではなく前に " + en("more") + " を置きます。",
        henka("interesting", "more interesting"),
        "「あの本より」は " + en("than that one") + " で、比較級のあとに置きます。" + en("one") + " は " + en("book") + " のくり返しをさけた語です。"
      ],
      result: en("This book is more interesting than that one.")
    },
    fixed: [
      {
        id: "f1",
        text: Q_BLANK_PHRASE,
        material: eibun("This movie is " + B + " than that one.", "この映画はあの映画よりおもしろいです。"),
        choices: ens(["interesting", "most interesting", "as interesting", "more interesting"]),
        answer: 3,
        explain: [
          en("than") + " があるので比較級にします。" + en("interesting") + " はつづりの長い語なので、前に " + en("more") + " を置きます。",
          eibun("This movie is " + fill("more interesting") + " than that one."),
          en("interesting") + " は原級、" + en("most interesting") + " は最上級です。" + en("as interesting") + " のあとは " + en("as") + " で、" + en("than") + " は続きません。"
        ]
      },
      {
        id: "f2",
        text: Q_BLANK,
        material: eibun("Soccer is the " + B + " popular sport in my class.", "サッカーはわたしのクラスでいちばん人気のあるスポーツです。"),
        choices: ["more", "most", "much", "very"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          "「いちばん〜」なので最上級にします。" + en("popular") + " はつづりの長い語なので、" + en("the most popular") + " です。",
          eibun("Soccer is the " + fill("most") + " popular sport in my class."),
          en("more") + " は比較級を作る語で、" + en("the") + " と " + en("in my class") + " に合いません。" + en("much") + " や " + en("very") + " では「いちばん」になりません。"
        ]
      },
      {
        id: "f3",
        text: en("good") + " の比較級として正しいものはどれですか。",
        choices: ["gooder", "more good", "better", "best"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          en("good") + " は形がすっかり変わる語です。" + henka("good", "better") + "、最上級は " + en("best") + " です。",
          en("gooder") + " や " + en("more good") + " という形はありません。" + en("best") + " は最上級です。"
        ]
      },
      {
        id: "f4",
        text: Q_BLANK,
        material: eibun("Emi sings " + B + " than her sister.", "エミはお姉さんより上手に歌います。"),
        choices: ["better", "well", "good", "best"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "「上手に」は " + en("well") + " で、" + en("than") + " があるので比較級にします。" + henka("well", "better"),
          eibun("Emi sings " + fill("better") + " than her sister."),
          en("well") + " と " + en("good") + " は原級なので、" + en("than") + " の前には置けません。" + en("best") + " は最上級です。"
        ]
      },
      {
        id: "f5",
        text: Q_JA_BLANK,
        material: eibun("I like winter " + B + " than summer.", "わたしは夏より冬のほうが好きです。"),
        choices: ["best", "well", "better", "good"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          "「BよりAが好き」は " + en("like A better than B") + " です。",
          eibun("I like winter " + fill("better") + " than summer."),
          en("best") + " は「いちばん」で、" + en("than") + " とは使いません。" + en("well") + " と " + en("good") + " は原級なので、" + en("than") + " の前には置けません。"
        ]
      },
      {
        id: "f6",
        text: Q_REPLY,
        material: kaiwa([["A", "Which do you like better, cats or dogs?", "ネコと犬では、どちらのほうが好きですか。"], ["B", B]]),
        choices: ens(["Yes, I do.", "I like cats better.", "I like cats the best.", "I like better cats."]),
        answer: 1,
        explain: [
          en("Which do you like better, A or B?") + " には、" + en("I like A better.") + " と答えます。",
          en("I like cats " + key("better") + ".") + "(ネコのほうが好きです。)",
          en("Which") + " の疑問文に " + en("Yes") + " では答えません。2つを比べているので " + en("the best") + " は合いません。" + en("better") + " は好きなもののあとに置きます。"
        ]
      },
      {
        id: "f7",
        text: Q_JA_BLANK,
        material: eibun("I like music the " + B + " of all the subjects.", "わたしはすべての教科の中で、音楽がいちばん好きです。"),
        choices: ["better", "well", "most good", "best"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          "「〜がいちばん好き」は " + en("like 〜 the best") + " です。",
          eibun("I like music the " + fill("best") + " of all the subjects."),
          en("better") + " は2つを比べるときの形です。" + en("well") + " は原級で、" + en("most good") + " という形はありません。"
        ]
      },
      {
        id: "f8",
        text: Q_BLANK,
        material: eibun("Ken is as " + B + " as his father.", "ケンはお父さんと同じくらいの背の高さです。"),
        choices: ["taller", "tall", "tallest", "more tall"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          "「…と同じくらい〜」は " + en("as") + " + 原級 + " + en("as") + " です。",
          eibun("Ken is as " + fill("tall") + " as his father."),
          en("as") + " と " + en("as") + " のあいだには、比較級の " + en("taller") + "、最上級の " + en("tallest") + "、" + en("more tall") + " は入りません。"
        ]
      },
      {
        id: "f9",
        text: Q_EN_TO_JA,
        material: eibun("My bag is not as big as yours."),
        choices: [
          "わたしのかばんは、あなたのかばんほど大きくありません。",
          "わたしのかばんは、あなたのかばんと同じくらい大きいです。",
          "わたしのかばんは、あなたのかばんより大きいです。",
          "わたしのかばんは、いちばん大きいわけではありません。"
        ],
        answer: 0,
        explain: [
          en("not as 〜 as …") + " は「…ほど〜ない」という意味です。" + en("yours") + " は「あなたのもの」(あなたのかばん)です。",
          "「同じくらい大きい」は " + en("not") + " のない " + en("as big as") + "、「より大きい」は " + en("bigger than") + " です。",
          "最上級(" + en("biggest") + ")を使った文ではありません。"
        ]
      },
      {
        id: "f10",
        text: Q_SAME,
        material: eibun(["This bike is not as new as that one.", "That bike is " + B + " than this one."]),
        choices: ["new", "older", "newest", "newer"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          "「この自転車はあの自転車ほど新しくない」は、「あの自転車はこの自転車より新しい」と同じ意味です。",
          eibun("That bike is " + fill("newer") + " than this one."),
          en("older") + " では意味が逆になります。" + en("than") + " の前なので、原級の " + en("new") + " や最上級の " + en("newest") + " は使えません。"
        ]
      },
      {
        id: "f11",
        text: Q_WRONG,
        choices: ens([
          "This question is more difficult than that one.",
          "Tom is more tall than Ken.",
          "She is the most famous singer in Japan.",
          "He can swim as fast as Tom."
        ]),
        answer: 1,
        explain: [
          en("tall") + " は " + en("er") + " をつけて比較級にする語です。" + en("more") + " は使いません。",
          seigo("Tom is more tall than Ken.", "Tom is " + key("taller") + " than Ken."),
          en("difficult") + " と " + en("famous") + " はつづりの長い語なので、" + en("more / most") + " を使います。" + en("as fast as") + " も正しい形です。"
        ]
      },
      {
        id: "f12",
        text: "「この3冊の中で、どの本がいちばんおもしろいですか。」を、正しい語順で表した文はどれですか。",
        choices: ens([
          "Which book is most the interesting of the three?",
          "Which book is the most interesting of the three?",
          "Which is book the most interesting of the three?",
          "Which book the most interesting is of the three?"
        ]),
        answer: 1,
        explain: [
          "「どの本」は " + en("Which book") + " で、文の最初に置きます。そのあとに " + en("is") + "、" + en("the most interesting") + "、" + en("of the three") + " と続けます。",
          gojun([
            { role: "疑問詞 + 名詞", en: "Which book" },
            { role: "be動詞", en: "is" },
            { role: "the + 最上級", en: "the most interesting", key: true },
            { role: "of", en: "of the three?" }
          ]),
          en("the") + " は " + en("most") + " の前に置きます。" + en("Which") + " と " + en("book") + " は離しません。"
        ]
      },
      {
        id: "f13",
        text: Q_REPLY,
        material: kaiwa([["A", "Which is more useful, this dictionary or that one?", "この辞書とあの辞書では、どちらのほうが役に立ちますか。"], ["B", B]]),
        choices: ens(["This one is.", "Yes, it is.", "This one does.", "This one is more."]),
        answer: 0,
        explain: [
          en("Which is more 〜, A or B?") + " には、どちらかを選んで「〜 " + en("is") + ".」と答えます。",
          en("This one " + key("is") + ".") + "(こちらの辞書です。)",
          en("Which") + " の疑問文に " + en("Yes") + " では答えません。be動詞の疑問文なので " + en("does") + " は使いません。" + en("is more") + " で文を終えることはできません。"
        ]
      },
      {
        id: "f14",
        text: Q_BLANK,
        material: eibun("I have " + B + " books than my brother.", "わたしは兄より多くの本を持っています。"),
        choices: ["many", "much", "most", "more"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          en("than") + " があるので比較級にします。" + en("many") + "(多くの)の比較級は " + en("more") + " です。" + henka("many", "more"),
          eibun("I have " + fill("more") + " books than my brother."),
          en("many") + " と " + en("much") + " は原級、" + en("most") + " は最上級です。"
        ]
      },
      {
        id: "f15",
        text: Q_JA_BLANK,
        material: eibun("This question is not " + B + " difficult as that one.", "この問題はあの問題ほど難しくありません。"),
        choices: ["more", "as", "than", "very"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          "「…ほど〜ない」は " + en("not as 〜 as …") + " です。うしろに " + en("as that one") + " があるので、前にも " + en("as") + " を置きます。",
          eibun("This question is not " + fill("as") + " difficult as that one."),
          en("more") + " を使うなら、うしろは " + en("as") + " ではなく " + en("than") + " になります。" + en("than") + " や " + en("very") + " では " + en("as") + " と組みになりません。"
        ]
      }
    ]
  });
})();
