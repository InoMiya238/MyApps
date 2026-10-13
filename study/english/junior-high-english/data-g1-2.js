// 中学英語道場: 中1「文の形」「語句」の6単元の中身(要点・表・例題・問題)。
// 形式の説明と、表示部品の関数(JHE.en、JHE.eibun など)は data.js の先頭を参照。
// 中1「動詞」の7単元は data-g1.js にある。このファイルも同じ形で書く。
//
// 内容のきまり:
// ・学校文法の説明に合わせる。教科書によって扱いが分かれる点には踏みこまない。
// ・英文はすべて自作。中1の語彙と文法の範囲で書く(There is / are、未来の文は使わない)。
// ・冠詞と前置詞の空所は、ほかの選択肢が文脈しだいで正しくならないものだけを出す。
//   場所の前置詞は、日本語の文をそえて答えを1つに決める。
// ・表は、英語のセルを半角6字までにする(children など長い語は要点の文に書く)。
(function () {
  "use strict";
  if (typeof JHE === "undefined") return;

  // ---------- このファイルの中で使う短い名前 ----------
  var en = JHE.en, eibun = JHE.eibun, kaiwa = JHE.kaiwa, blank = JHE.blank, fill = JHE.fill;
  var u = JHE.u, key = JHE.key, henka = JHE.henka, seigo = JHE.seigo, hyo = JHE.hyo, gojun = JHE.gojun;
  var rule = JHE.rule;

  // =====================================================================
  // 1-8 疑問詞
  // =====================================================================
  JHE.register("g1-wh-questions", {
    points: [
      rule("疑問詞は文の最初") + "に置き、そのあとは疑問文の語順にします。be動詞の文は「疑問詞 + be動詞 + 主語」、一般動詞の文は「疑問詞 + " + en("do / does") + " + 主語 + 動詞の原形」です。",
      "疑問詞でたずねられたら、" + en("Yes / No") + " ではなく、" + rule("たずねられた内容を具体的に答えます") + "。" + en("Why 〜?") + "(なぜ)には、" + en("Because 〜.") + "(なぜなら)で理由を答えます。",
      en("what") + "、" + en("which") + "、" + en("whose") + " は、すぐあとに名詞を置いて使えます。" + en("What time 〜?") + "(何時)、" + en("Which bus 〜?") + "(どのバス)、" + en("Whose bag 〜?") + "(だれのかばん)。",
      en("how") + " は、ほかの語と組んで数や程度をたずねます。" + en("How many") + " + 複数形(いくつ)、" + en("How much") + "(いくら)、" + en("How old") + "(何歳)、" + en("How long") + "(どのくらいの長さ)。"
    ],
    chart: hyo({
      caption: "疑問詞と意味",
      head: ["", "疑問詞"],
      rows: [
        ["何", "what"],
        ["だれ", "who"],
        ["どこ", "where"],
        ["いつ", "when"],
        ["どれ", "which"],
        ["だれの", "whose"],
        ["なぜ", "why"],
        ["どう", "how"]
      ]
    }) + gojun([
      { role: "疑問詞", en: "Where", ja: "どこで", key: true },
      { role: "do / does", en: "does" },
      { role: "主語", en: "Ken" },
      { role: "動詞の原形", en: "play" },
      { role: "そのほか", en: "soccer?" }
    ], "疑問詞のある疑問文(一般動詞)"),
    example: {
      title: "下線の部分をたずねる疑問文を作りなさい。" + eibun("Ken plays soccer " + u("in the park") + ".", "ケンは公園でサッカーをします。"),
      steps: [
        "下線は「公園で」という場所です。場所をたずねる疑問詞は " + en("where") + " です。",
        "疑問詞は文の最初に置きます。",
        "主語 " + en("Ken") + " は三人称単数なので " + en("does") + " を使い、動詞は原形の " + en("play") + " にもどします。",
        en("in the park") + " は " + en("where") + " に置きかわったので、残しません。"
      ],
      result: en("Where does Ken play soccer?")
    },
    fixed: [
      {
        id: "f1",
        text: "空所に入る語はどれですか。",
        material: kaiwa([
          ["A", blank() + " is that boy?", "あの男の子は(　　)ですか。"],
          ["B", "He is my brother, Ken.", "わたしの兄のケンです。"]
        ]),
        choices: ["Who", "Where", "When", "Whose"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "Bは「わたしの兄のケンです」と、人がだれなのかを答えています。",
          "「だれ」をたずねる疑問詞は " + en("who") + " です。",
          en("where") + " は場所、" + en("when") + " は時、" + en("whose") + " は持ち主(だれの)をたずねます。"
        ]
      },
      {
        id: "f2",
        text: "空所に入る語はどれですか。",
        material: kaiwa([
          ["A", blank() + " do you live?"],
          ["B", "I live in Osaka.", "大阪に住んでいます。"]
        ]),
        choices: ["What", "Where", "Who", "Which"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          "Bは「大阪に」と場所を答えています。場所をたずねる疑問詞は " + en("where") + " です。",
          eibun(fill("Where") + " do you live?", "あなたはどこに住んでいますか。"),
          en("what") + "(何)、" + en("who") + "(だれ)、" + en("which") + "(どれ)では、住んでいる場所をたずねられません。"
        ]
      },
      {
        id: "f3",
        text: "空所に入る語はどれですか。",
        material: kaiwa([
          ["A", blank() + " is your birthday?"],
          ["B", "It's May 5.", "5月5日です。"]
        ]),
        choices: ["Where", "Who", "When", "Whose"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          "Bは「5月5日です」と日付を答えています。時をたずねる疑問詞は " + en("when") + " です。",
          eibun(fill("When") + " is your birthday?", "あなたの誕生日はいつですか。"),
          en("where") + " は場所、" + en("who") + " は人、" + en("whose") + " は持ち主をたずねる語です。"
        ]
      },
      {
        id: "f4",
        text: "空所に入る語はどれですか。",
        material: kaiwa([
          ["A", blank() + " bag is this?"],
          ["B", "It's mine.", "わたしのものです。"]
        ]),
        choices: ["Who", "What", "Which", "Whose"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          "Bは「わたしのものです」と持ち主を答えています。持ち主をたずねるのは " + en("whose") + "(だれの)です。",
          eibun(fill("Whose") + " bag is this?", "これはだれのかばんですか。"),
          en("who") + " は「だれ」という意味で、すぐあとに名詞を置いて「だれの〜」とは言えません。"
        ]
      },
      {
        id: "f5",
        text: "空所に入る語はどれですか。",
        material: kaiwa([
          ["A", blank() + " do you want, tea or coffee?"],
          ["B", "I want tea.", "紅茶がほしいです。"]
        ]),
        choices: ["Which", "Who", "Where", "When"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("tea or coffee") + "(紅茶かコーヒーか)と、限られたものの中から選ばせています。",
          "「どちら・どれ」をたずねる疑問詞は " + en("which") + " です。",
          eibun(fill("Which") + " do you want, tea or coffee?", "紅茶とコーヒーの、どちらがほしいですか。")
        ]
      },
      {
        id: "f6",
        text: "空所に入る語はどれですか。",
        material: kaiwa([
          ["A", blank() + " do you go to school?"],
          ["B", "I go by bike.", "自転車で行きます。"]
        ]),
        choices: ["What", "How", "Who", "Whose"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          "Bは「自転車で」と、行く方法を答えています。",
          "方法(どのように)をたずねる疑問詞は " + en("how") + " です。",
          eibun(fill("How") + " do you go to school?", "あなたはどうやって学校へ行きますか。")
        ]
      },
      {
        id: "f7",
        text: "空所に入る語句はどれですか。",
        material: kaiwa([
          ["A", "How many " + blank() + " do you have?"],
          ["B", "I have two.", "2ひき飼っています。"]
        ]),
        choices: ["dog", "a dog", "dogs", "the dog"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          en("How many") + " は数をたずねる言い方で、すぐあとに" + rule("名詞の複数形") + "を置きます。",
          eibun("How many " + fill("dogs") + " do you have?", "あなたは犬を何びき飼っていますか。"),
          "答えが1つになりそうなときでも、" + en("How many") + " のあとは複数形にします。" + en("a") + " や " + en("the") + " はつけません。"
        ]
      },
      {
        id: "f8",
        text: "空所に入る語句はどれですか。",
        material: kaiwa([
          ["A", blank() + " is this T-shirt?"],
          ["B", "It's 1,500 yen.", "1,500円です。"]
        ]),
        choices: ["How many", "How old", "How long", "How much"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          "Bは「1,500円です」と値段を答えています。値段をたずねるのは " + en("How much") + "(いくら)です。",
          en("How many") + " は数、" + en("How old") + " は年齢や古さ、" + en("How long") + " は長さをたずねます。"
        ]
      },
      {
        id: "f9",
        text: "「あなたは朝食に何を食べますか。」を、正しい語順で表した文はどれですか。",
        choices: [
          en("What do you eat for breakfast?"),
          en("What you do eat for breakfast?"),
          en("Do you eat what for breakfast?"),
          en("What do eat you for breakfast?")
        ],
        answer: 0,
        explain: [
          "疑問詞を文の最初に置き、そのあとを疑問文の語順にします。",
          gojun([
            { role: "疑問詞", en: "What", key: true },
            { role: "do", en: "do" },
            { role: "主語", en: "you" },
            { role: "動詞の原形", en: "eat" },
            { role: "そのほか", en: "for breakfast?" }
          ]),
          "「" + en("do") + " + 主語 + 動詞」の順をくずしたものと、疑問詞が文の途中にあるものは誤りです。"
        ]
      },
      {
        id: "f10",
        text: "次の問いへの答えとして正しいものはどれですか。",
        material: eibun("What time do you get up?"),
        choices: [
          en("Yes, I do."),
          en("I get up at six."),
          en("It's Sunday."),
          en("In my room.")
        ],
        answer: 1,
        explain: [
          en("What time 〜?") + " は「何時に〜しますか」と、時刻をたずねる文です。",
          "時刻を具体的に答えている " + en("I get up at six.") + "(6時に起きます)が正解です。",
          "疑問詞のある疑問文には、" + en("Yes / No") + " では答えません。" + en("It's Sunday.") + " は曜日、" + en("In my room.") + " は場所の答えです。"
        ]
      },
      {
        id: "f11",
        text: "誤りのある文はどれですか。",
        choices: [
          en("Where does your father work?"),
          en("When do you study English?"),
          en("What does she likes?"),
          en("Who is your teacher?")
        ],
        answer: 2,
        explain: [
          en("does") + " を使った疑問文では、動詞を原形にします。",
          seigo("What does she likes?", "What does she " + key("like") + "?"),
          "ほかの3つは、「疑問詞 + " + en("do / does") + " + 主語 + 動詞の原形」「疑問詞 + be動詞 + 主語」の形になっていて正しい文です。"
        ]
      },
      {
        id: "f12",
        text: "「これはだれのノートですか。」を表す文はどれですか。",
        choices: [
          en("Who notebook is this?"),
          en("Who is this notebook?"),
          en("Whose is notebook this?"),
          en("Whose notebook is this?")
        ],
        answer: 3,
        explain: [
          "「だれの〜」は「" + en("whose") + " + 名詞」で表し、このまとまりを文の最初に置きます。",
          gojun([
            { role: "疑問詞 + 名詞", en: "Whose notebook", ja: "だれのノート", key: true },
            { role: "be動詞", en: "is" },
            { role: "主語", en: "this?" }
          ]),
          en("who") + " は「だれ」という意味なので、「だれの」には使えません。" + en("whose") + " と名詞は離しません。"
        ]
      },
      {
        id: "f13",
        text: "空所に入る文として正しいものはどれですか。",
        material: kaiwa([
          ["A", "Why do you like summer?", "あなたはなぜ夏が好きなのですか。"],
          ["B", blank()]
        ]),
        choices: [
          en("Because I can swim in the sea."),
          en("Yes, I do."),
          en("I like it very much."),
          en("In August.")
        ],
        answer: 0,
        explain: [
          en("Why 〜?") + " は理由をたずねる文です。" + en("Because 〜.") + "(なぜなら〜だからです)で理由を答えます。",
          eibun("Because I can swim in the sea.", "海で泳げるからです。"),
          en("Yes, I do.") + " は疑問詞のない疑問文への答えです。「とても好きです」「8月に」は、理由を答えていません。"
        ]
      },
      {
        id: "f14",
        text: "下線の部分をたずねる疑問文として正しいものはどれですか。",
        material: eibun("Emi has " + u("three") + " cats.", "エミはネコを3びき飼っています。"),
        choices: [
          en("How many cats does Emi has?"),
          en("How many cats does Emi have?"),
          en("How many cat does Emi have?"),
          en("How much cats does Emi have?")
        ],
        answer: 1,
        explain: [
          "数をたずねるので「" + en("How many") + " + 複数形」を文の最初に置きます。",
          "主語 " + en("Emi") + " は三人称単数なので " + en("does") + " を使い、動詞は原形の " + en("have") + " にします。",
          en("does 〜 has") + " は原形になっていません。" + en("How many cat") + " は複数形になっていません。" + en("How much") + " は値段や量をたずねる言い方です。"
        ]
      },
      {
        id: "f15",
        text: "次の英文の意味として正しいものはどれですか。",
        material: eibun("How old is your sister?"),
        choices: [
          "あなたのお姉さんは元気ですか。",
          "あなたのお姉さんはどこにいますか。",
          "あなたのお姉さんは何歳ですか。",
          "あなたのお姉さんはだれですか。"
        ],
        answer: 2,
        explain: [
          en("How old 〜?") + " は年齢をたずねる言い方です。",
          "「元気ですか」は " + en("How is 〜?") + "、「どこにいますか」は " + en("Where is 〜?") + "、「だれですか」は " + en("Who is 〜?") + " で表します。"
        ]
      }
    ]
  });

  // =====================================================================
  // 1-9 命令文
  // =====================================================================
  JHE.register("g1-imperatives", {
    points: [
      "「〜しなさい」と相手に指示する文を命令文といいます。" + rule("主語を言わず、動詞の原形で文を始めます") + "。" + en("Open the window.") + "(窓を開けなさい。)",
      "be動詞の文を命令文にするときは、" + en("am / are / is") + " の原形 " + rule(en("Be")) + " で始めます。" + en("Be quiet.") + "(静かにしなさい。)",
      "「〜してはいけません」は、" + rule(en("Don't") + " + 動詞の原形") + "です。" + en("Don't run here.") + "(ここで走ってはいけません。)be動詞なら " + en("Don't be late.") + "(遅れてはいけません。)",
      en("please") + " を文の最初か最後につけると、「〜してください」とていねいになります。最後につけるときは、前にコンマを打ちます。" + en("Sit down, please."),
      "「〜しましょう」とさそうときは、" + rule(en("Let's") + " + 動詞の原形") + "です。答えるときは " + en("Yes, let's.") + "(そうしましょう)、" + en("No, let's not.") + "(やめておきましょう)のように答えます。"
    ],
    chart: gojun([
      { role: "動詞の原形", en: "Open", key: true },
      { role: "そのほか", en: "the door." }
    ], "〜しなさい") + gojun([
      { role: "Don't", en: "Don't", key: true },
      { role: "動詞の原形", en: "open" },
      { role: "そのほか", en: "the door." }
    ], "〜してはいけません") + gojun([
      { role: "Let's", en: "Let's", key: true },
      { role: "動詞の原形", en: "open" },
      { role: "そのほか", en: "the door." }
    ], "〜しましょう"),
    example: {
      title: "次の文を「〜しなさい」という命令文に書きかえなさい。" + eibun("You are quiet in this room.", "あなたはこの部屋では静かです。"),
      steps: [
        "命令文では主語を言わないので、" + en("You") + " を取ります。",
        "命令文は動詞の原形で始めます。" + en("are") + " の原形は " + en("be") + " です。",
        henka("You are quiet", "Be quiet"),
        "文の最初なので、" + en("Be") + " と大文字で書きます。"
      ],
      result: en("Be quiet in this room.")
    },
    fixed: [
      {
        id: "f1",
        text: "「昼食の前に手を洗いなさい。」という文になるように、空所に入る語を選びなさい。",
        material: eibun(blank() + " your hands before lunch."),
        choices: ["Wash", "Washes", "Washing", "Washed"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "命令文は、主語を言わずに動詞の原形で始めます。",
          eibun(fill("Wash") + " your hands before lunch."),
          en("Washes") + " は三人称単数現在の形、" + en("Washing") + " は ing 形、" + en("Washed") + " は過去形で、どれも原形ではありません。"
        ]
      },
      {
        id: "f2",
        text: "「図書館では静かにしなさい。」という文になるように、空所に入る語を選びなさい。",
        material: eibun(blank() + " quiet in the library."),
        choices: ["Is", "Be", "Are", "Do"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          en("quiet") + "(静かな)は形容詞なので、be動詞が必要です。",
          "命令文は原形で始めるので、be動詞の原形 " + en("Be") + " を使います。",
          en("Is") + " や " + en("Are") + " は原形ではありません。" + en("Do") + " のあとに形容詞は置けません。"
        ]
      },
      {
        id: "f3",
        text: "「ここでサッカーをしてはいけません。」という文になるように、空所に入る語を選びなさい。",
        material: eibun(blank() + " play soccer here."),
        choices: ["Not", "Doesn't", "Don't", "Isn't"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          "「〜してはいけません」は、" + en("Don't") + " + 動詞の原形で表します。",
          eibun(fill("Don't") + " play soccer here."),
          "命令文は相手(" + en("you") + ")に言う文なので、" + en("Doesn't") + " は使いません。" + en("Not") + " だけでは禁止の文になりません。"
        ]
      },
      {
        id: "f4",
        text: "「学校に遅れてはいけません。」という文になるように、空所に入る語を選びなさい。",
        material: eibun("Don't " + blank() + " late for school."),
        choices: ["is", "are", "do", "be"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          en("late") + "(遅れた)は形容詞なので、be動詞が必要です。",
          en("Don't") + " のあとは動詞の原形なので、be動詞の原形 " + en("be") + " を置きます。",
          eibun("Don't " + fill("be") + " late for school.")
        ]
      },
      {
        id: "f5",
        text: "「放課後、公園へ行きましょう。」という文になるように、空所に入る語を選びなさい。",
        material: eibun(blank() + " go to the park after school."),
        choices: ["Let's", "Don't", "Please", "Be"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "「〜しましょう」と相手をさそうときは、" + en("Let's") + " + 動詞の原形で表します。",
          en("Don't go 〜.") + " は「行ってはいけません」、" + en("Please go 〜.") + " は「行ってください」という意味になります。",
          en("Be") + " のあとに動詞の原形 " + en("go") + " は置けません。"
        ]
      },
      {
        id: "f6",
        text: "「この本を読みなさい。」を表す文はどれですか。",
        choices: [
          en("You reads this book."),
          en("Read this book."),
          en("Reads this book."),
          en("Reading this book.")
        ],
        answer: 1,
        explain: [
          "命令文は、主語を言わずに動詞の原形 " + en("Read") + " で始めます。",
          en("Reads") + " は三人称単数現在の形、" + en("Reading") + " は ing 形なので、命令文には使えません。",
          en("You reads 〜.") + " は主語があり、動詞の形も誤りです。"
        ]
      },
      {
        id: "f7",
        text: "次の英文の意味として正しいものはどれですか。",
        material: eibun("Don't open the window."),
        choices: [
          "窓を開けなさい。",
          "窓を開けましょう。",
          "窓を開けてはいけません。",
          "窓は開いていません。"
        ],
        answer: 2,
        explain: [
          en("Don't") + " + 動詞の原形は、「〜してはいけません」という禁止の意味です。",
          "「窓を開けなさい」は " + en("Open the window.") + "、「窓を開けましょう」は " + en("Let's open the window.") + " です。",
          "主語がないので、「窓は開いていません」というふつうの否定文ではありません。"
        ]
      },
      {
        id: "f8",
        text: "空所に入る答えとして正しいものはどれですか。",
        material: kaiwa([
          ["A", "Let's play tennis after school.", "放課後、テニスをしましょう。"],
          ["B", blank()]
        ]),
        choices: [
          en("Yes, I am."),
          en("No, it isn't."),
          en("Yes, you do."),
          en("Yes, let's.")
        ],
        answer: 3,
        explain: [
          en("Let's 〜.") + " でさそわれたら、" + en("Yes, let's.") + "(そうしましょう)のように答えます。断るときは " + en("No, let's not.") + " などと言います。",
          en("Yes, I am.") + " や " + en("No, it isn't.") + " はbe動詞の疑問文への答え、" + en("Yes, you do.") + " は " + en("Do I 〜?") + " への答えです。"
        ]
      },
      {
        id: "f9",
        text: "「どうぞ、ここにすわってください。」を、正しい語順で表した文はどれですか。",
        choices: [
          en("Please sit down here."),
          en("Sit please down here."),
          en("Please down sit here."),
          en("Sit down here please you.")
        ],
        answer: 0,
        explain: [
          en("please") + " は命令文の最初か最後につけます。",
          en("sit down") + "(すわる)はひとまとまりなので、あいだに " + en("please") + " を入れたり、順番を逆にしたりしません。",
          "命令文では主語の " + en("you") + " を言いません。最後につけるなら " + en("Sit down here, please.") + " です。"
        ]
      },
      {
        id: "f10",
        text: "誤りのある文はどれですか。",
        choices: [
          en("Be careful."),
          en("Let's sings a song."),
          en("Don't touch this box."),
          en("Please help me.")
        ],
        answer: 1,
        explain: [
          en("Let's") + " のあとは、いつも動詞の原形です。",
          seigo("Let's sings a song.", "Let's " + key("sing") + " a song."),
          "ほかの3つは、動詞の原形(" + en("Be") + "、" + en("touch") + "、" + en("help") + ")を使っていて正しい文です。"
        ]
      },
      {
        id: "f11",
        text: "次の文を「〜しなさい」という命令文に書きかえたものはどれですか。",
        material: eibun("You are kind to old people.", "あなたはお年寄りに親切です。"),
        choices: [
          en("Are kind to old people."),
          en("Do kind to old people."),
          en("Be kind to old people."),
          en("Kind to old people.")
        ],
        answer: 2,
        explain: [
          "主語 " + en("You") + " を取り、動詞を原形にします。" + en("are") + " の原形は " + en("be") + " です。",
          eibun("Be kind to old people.", "お年寄りに親切にしなさい。"),
          en("Are") + " は原形ではありません。" + en("kind") + " は形容詞なので、" + en("Do") + " をつけたり、動詞なしで文を始めたりはできません。"
        ]
      },
      {
        id: "f12",
        text: "次の文を「〜してはいけません」という文に書きかえたものはどれですか。",
        material: eibun("You run in the classroom.", "あなたは教室で走ります。"),
        choices: [
          en("Not run in the classroom."),
          en("You don't run in the classroom."),
          en("Doesn't run in the classroom."),
          en("Don't run in the classroom.")
        ],
        answer: 3,
        explain: [
          "禁止の命令文は、主語を言わずに " + en("Don't") + " + 動詞の原形で始めます。",
          eibun("Don't run in the classroom.", "教室で走ってはいけません。"),
          en("You don't run 〜.") + " は「あなたは走りません」というふつうの否定文です。" + en("Not") + " や " + en("Doesn't") + " では禁止の文になりません。"
        ]
      },
      {
        id: "f13",
        text: "次の英文の意味として正しいものはどれですか。",
        material: eibun("Let's eat lunch together."),
        choices: [
          "いっしょに昼食を食べましょう。",
          "いっしょに昼食を食べなさい。",
          "いっしょに昼食を食べてはいけません。",
          "いっしょに昼食を食べています。"
        ],
        answer: 0,
        explain: [
          en("Let's") + " + 動詞の原形は、「〜しましょう」と相手をさそう言い方です。",
          "「食べなさい」は " + en("Eat lunch together.") + "、「食べてはいけません」は " + en("Don't eat lunch together.") + " です。",
          "「食べています」は現在進行形で、" + en("We are eating lunch together.") + " のように表します。"
        ]
      },
      {
        id: "f14",
        text: "「ドアを閉めてください。」を正しく表した文はどれですか。",
        choices: [
          en("Close, please the door."),
          en("Close the door, please."),
          en("Please closes the door."),
          en("Close please the door.")
        ],
        answer: 1,
        explain: [
          en("please") + " を命令文の最後につけるときは、前にコンマを打ちます。",
          en("close the door") + " のあいだに " + en("please") + " を入れることはできません。",
          en("Please") + " をつけても命令文なので、動詞は原形です。" + en("closes") + " は使いません。"
        ]
      },
      {
        id: "f15",
        text: "「ケン、立ちなさい。」を表す文はどれですか。",
        choices: [
          en("Ken stands up."),
          en("Ken, stands up."),
          en("Ken, stand up."),
          en("Ken is stand up.")
        ],
        answer: 2,
        explain: [
          "命令文で相手の名前を呼ぶときは、名前のあとにコンマを打ち、動詞の原形を続けます。",
          eibun([
            ["Ken, stand up.", "ケン、立ちなさい。(ケンに呼びかける命令文)"],
            ["Ken stands up.", "ケンは立ちます。(ケンが主語のふつうの文)"]
          ]),
          "呼びかけの " + en("Ken") + " は主語ではないので、動詞に " + en("s") + " はつけません。"
        ]
      }
    ]
  });

  // =====================================================================
  // 1-10 名詞の複数形と冠詞
  // =====================================================================
  JHE.register("g1-nouns-articles", {
    points: [
      "数えられる名詞が2つ以上あるときは、" + rule("複数形") + "にします。ふつうは語の終わりに " + en("s") + " をつけます。" + henka("book", "books"),
      en("s / x / ch / sh") + " で終わる語には " + en("es") + " をつけます(" + henka("box", "boxes") + ")。「子音字 + " + en("y") + "」で終わる語は、" + en("y") + " を " + en("i") + " に変えて " + en("es") + " をつけます(" + henka("city", "cities") + ")。" + en("boy") + " のように「母音字 + " + en("y") + "」なら、そのまま " + en("s") + " です。",
      "形が大きく変わる語や、単数と複数が同じ形の語もあります(下の表)。" + henka("child", "children") + "(子ども)も覚えます。",
      "数えられる名詞が1つのときは、前に " + en("a") + " をつけます。" + rule("母音(アイウエオに近い音)で始まる語の前では " + en("an")) + " です(" + en("an apple") + "、" + en("an old book") + ")。" + en("the") + " は「その」という意味で、前に話に出たものや、1つしかないもの(" + en("the sun") + ")につけます。",
      en("water") + "、" + en("milk") + "、" + en("music") + "、" + en("homework") + " などは" + rule("数えられない名詞") + "です。" + en("a / an") + " をつけず、複数形にもしません。量は " + en("a glass of water") + "(コップ1ぱいの水)のように表します。"
    ],
    chart: hyo({
      caption: "不規則な複数形",
      head: ["", "単数", "複数"],
      rows: [
        ["男の人", "man", "men"],
        ["女の人", "woman", "women"],
        ["足", "foot", "feet"],
        ["歯", "tooth", "teeth"],
        ["魚", "fish", "fish"],
        ["羊", "sheep", "sheep"]
      ]
    }),
    example: {
      title: "(　)の語を正しい形に変えなさい。" + eibun("I have three (box).", "わたしは箱を3つ持っています。"),
      steps: [
        en("three") + "(3つ)とあるので、" + en("box") + " を複数形にします。",
        en("box") + " は " + en("x") + " で終わる語なので、" + en("s") + " ではなく " + en("es") + " をつけます。",
        henka("box", "boxes")
      ],
      result: en("I have three boxes.")
    },
    fixed: [
      {
        id: "f1",
        text: en("box") + "(箱)の複数形はどれですか。",
        choices: ["boxes", "boxs", "boxies", "box"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("s / x / ch / sh") + " で終わる語には、" + en("es") + " をつけます。",
          henka("box", "boxes"),
          "同じなかまに、" + en("buses") + "(バス)、" + en("watches") + "(うで時計)、" + en("dishes") + "(皿)があります。"
        ]
      },
      {
        id: "f2",
        text: en("city") + "(都市)の複数形はどれですか。",
        choices: ["citys", "cities", "cityes", "citis"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          en("city") + " は「子音字(" + en("t") + ") + " + en("y") + "」で終わる語です。",
          en("y") + " を " + en("i") + " に変えて、" + en("es") + " をつけます。",
          henka("city", "cities")
        ]
      },
      {
        id: "f3",
        text: en("child") + "(子ども)の複数形はどれですか。",
        choices: ["childs", "childes", "children", "childrens"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          en("child") + " は、" + en("s") + " をつけずに形が変わる語です。",
          henka("child", "children"),
          en("children") + " がすでに複数形なので、さらに " + en("s") + " をつけることはありません。"
        ]
      },
      {
        id: "f4",
        text: en("boy") + "(男の子)の複数形はどれですか。",
        choices: ["boies", "boyes", "bois", "boys"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          en("boy") + " は「母音字(" + en("o") + ") + " + en("y") + "」で終わる語です。",
          "この形のときは、" + en("y") + " を変えずにそのまま " + en("s") + " をつけます。",
          en("y") + " を " + en("i") + " に変えるのは、" + en("city") + " のように「子音字 + " + en("y") + "」のときだけです。"
        ]
      },
      {
        id: "f5",
        text: "空所に入る語句はどれですか。",
        material: eibun("I have three " + blank() + " in my bag.", "わたしはかばんに本を3冊入れています。"),
        choices: ["books", "book", "a book", "the book"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("three") + "(3)のあとなので、名詞は複数形にします。",
          eibun("I have three " + fill("books") + " in my bag."),
          en("three") + " のような数を表す語のあとに、" + en("a") + " や " + en("the") + " を置くことはできません。"
        ]
      },
      {
        id: "f6",
        text: "空所に入る語はどれですか。",
        material: eibun("This is " + blank() + " apple.", "これはりんごです。"),
        choices: ["a", "an", "two", "many"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          en("apple") + " は母音(ア)で始まる語なので、" + en("a") + " ではなく " + en("an") + " をつけます。",
          eibun("This is " + fill("an") + " apple."),
          en("apple") + " は単数形なので、" + en("two") + " や " + en("many") + " は合いません。"
        ]
      },
      {
        id: "f7",
        text: en("a") + " と " + en("an") + " の使い方が正しいものはどれですか。",
        choices: ["an book", "a apple", "an egg", "a orange"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          "母音(アイウエオに近い音)で始まる語の前では " + en("an") + "、それ以外では " + en("a") + " を使います。",
          en("egg") + " は母音(エ)で始まるので、" + en("an egg") + " が正しい形です。",
          "ほかは、" + en("a book") + "、" + en("an apple") + "、" + en("an orange") + " が正しい形です。"
        ]
      },
      {
        id: "f8",
        text: "空所に入る語はどれですか。",
        material: eibun([
          ["I have a dog.", "わたしは犬を飼っています。"],
          [blank() + " dog is very big.", "その犬はとても大きいです。"]
        ]),
        choices: ["An", "Two", "Many", "The"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          "1文めで話に出た犬のことを、2文めで「その犬」と言っています。",
          "前に話に出たものには " + en("the") + " をつけます。はじめて話に出すときは " + en("a dog") + " です。",
          en("dog") + " は母音で始まらないので " + en("An") + " は使えません。単数形なので " + en("Two") + " や " + en("Many") + " も合いません。"
        ]
      },
      {
        id: "f9",
        text: "空所に入る語はどれですか。",
        material: eibun("My sister plays " + blank() + " piano every day.", "姉は毎日ピアノをひきます。"),
        choices: ["the", "an", "two", "many"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "「楽器を演奏する」と言うときは、楽器の名前の前に " + en("the") + " をつけます。",
          eibun("My sister plays " + fill("the") + " piano every day."),
          en("play the guitar") + "(ギターをひく)も同じ形です。" + en("piano") + " は母音で始まらず、単数形なので、ほかの3つは合いません。"
        ]
      },
      {
        id: "f10",
        text: "正しい文はどれですか。",
        choices: [
          en("I play a tennis after school."),
          en("I play tennis after school."),
          en("I play an tennis after school."),
          en("I play tennises after school.")
        ],
        answer: 1,
        explain: [
          "「スポーツをする」と言うときは、スポーツの名前に " + en("a / an") + " をつけず、複数形にもしません。",
          eibun("I play tennis after school.", "わたしは放課後テニスをします。"),
          "楽器のときは " + en("play the piano") + " のように " + en("the") + " をつけるので、区別して覚えます。"
        ]
      },
      {
        id: "f11",
        text: "正しい文はどれですか。",
        choices: [
          en("I drink a milk every morning."),
          en("I drink milks every morning."),
          en("I drink milk every morning."),
          en("I drink an milk every morning.")
        ],
        answer: 2,
        explain: [
          en("milk") + "(牛乳)は、1つ、2つと数えられない名詞です。",
          "数えられない名詞には " + en("a / an") + " をつけず、複数形にもしません。",
          "量を言うときは、" + en("a glass of milk") + "(コップ1ぱいの牛乳)のように表します。"
        ]
      },
      {
        id: "f12",
        text: "空所に入る語はどれですか。",
        material: eibun("I want two " + blank() + " of water.", "わたしは水がコップ2はいほしいです。"),
        choices: ["glass", "glassies", "glasss", "glasses"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          en("water") + " は数えられないので、入れ物の " + en("glass") + "(コップ)のほうを数えます。",
          en("two") + " のあとなので " + en("glass") + " を複数形にします。" + en("s") + " で終わる語には " + en("es") + " をつけます。",
          henka("a glass of water", "two glasses of water")
        ]
      },
      {
        id: "f13",
        text: "誤りのある文はどれですか。",
        choices: [
          en("She has many friend."),
          en("I have a cat and two dogs."),
          en("These are my pencils."),
          en("He wants an orange.")
        ],
        answer: 0,
        explain: [
          en("many") + "(たくさんの)のあとには、数えられる名詞の複数形を置きます。",
          seigo("She has many friend.", "She has many friend" + key("s") + "."),
          "ほかの3つは、1つのものに " + en("a / an") + "、2つ以上のものに複数形を使っていて正しい文です。"
        ]
      },
      {
        id: "f14",
        text: "空所に入る語はどれですか。",
        material: eibun("I see three " + blank() + " in the park.", "公園に男の人が3人見えます。"),
        choices: ["mans", "men", "man", "mens"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          en("three") + " のあとなので複数形にします。",
          en("man") + " の複数形は、" + en("s") + " をつけずに " + en("men") + " と形を変えます。",
          henka("man", "men") + " 同じように、" + henka("woman", "women") + " と変わります。"
        ]
      },
      {
        id: "f15",
        text: "「わたしは宿題がたくさんあります。」を表す文はどれですか。",
        choices: [
          en("I have a lot of homeworks."),
          en("I have many homeworks."),
          en("I have a lot of homework."),
          en("I have a homework a lot.")
        ],
        answer: 2,
        explain: [
          en("homework") + "(宿題)は数えられない名詞なので、複数形にしません。",
          en("a lot of") + "(たくさんの)は、数えられない名詞にも使えます。",
          en("many") + " は数えられる名詞の複数形に使う語なので、" + en("homework") + " には使いません。"
        ]
      }
    ]
  });

  // =====================================================================
  // 1-11 代名詞
  // =====================================================================
  JHE.register("g1-pronouns", {
    points: [
      "代名詞は、文の中でのはたらきによって形が変わります。" + rule("「〜は」(主語)") + " " + en("I") + "、" + rule("「〜の」") + " " + en("my") + "、" + rule("「〜を・〜に」") + " " + en("me") + "、" + rule("「〜のもの」") + " " + en("mine") + " の4つの形を、表で覚えます。" + en("you") + " は「あなたたち」のときも同じ形です。",
      "「〜の」の形は、必ず名詞の前に置きます(" + en("my book") + ")。「〜のもの」の形は、1語で「〜の + 名詞」の代わりをします。" + en("This book is mine.") + "(この本はわたしのものです。)",
      "動詞のあとと、" + en("with") + " や " + en("for") + " などの前置詞のあとには、「〜を・〜に」の形を置きます。" + en("I know him.") + "(わたしは彼を知っています。)" + en("with me") + "(わたしといっしょに)",
      "近くのものは " + en("this") + "(これ)、遠くのものは " + en("that") + "(あれ)でさします。複数のときは " + en("these") + "(これら)、" + en("those") + "(あれら)です。一度話に出たものは、" + en("it") + " や " + en("they") + " でうけます。",
      "人の名前で「〜の」「〜のもの」と言うときは、名前に " + en("'s") + " をつけます。" + en("Ken's bag") + "(ケンのかばん)、" + en("This bag is Ken's.") + "(このかばんはケンのものです。)"
    ],
    chart: hyo({
      caption: "人称代名詞",
      head: ["", "〜は", "〜の", "〜を", "〜のもの"],
      rows: [
        ["私", "I", "my", "me", "mine"],
        ["あなた", "you", "your", "you", "yours"],
        ["彼", "he", "his", "him", "his"],
        ["彼女", "she", "her", "her", "hers"],
        ["それ", "it", "its", "it", { ja: "—" }],
        ["私たち", "we", "our", "us", "ours"],
        ["彼ら", "they", "their", "them", "theirs"]
      ],
      compact: true
    }),
    example: {
      title: "①と②に、" + en("he") + " を正しい形に変えて入れなさい。" + eibun([
        ["I know " + blank("①") + ".", "わたしは彼を知っています。"],
        [blank("②") + " name is Ken.", "彼の名前はケンです。"]
      ]),
      steps: [
        "①は動詞 " + en("know") + " のあとで、「彼を」にあたります。「〜を」の形は " + en("him") + " です。",
        "②は名詞 " + en("name") + " の前で、「彼の」にあたります。「〜の」の形は " + en("his") + " です。",
        "②は文の最初なので、大文字で始めます。"
      ],
      result: "① " + en("him") + "　② " + en("His")
    },
    fixed: [
      {
        id: "f1",
        text: "空所に入る語はどれですか。",
        material: eibun([
          ["This is Emi.", "こちらはエミです。"],
          [blank() + " is my sister.", "彼女はわたしの姉です。"]
        ]),
        choices: ["She", "Her", "Hers", "He"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "空所は文の主語(〜は)です。「彼女は」は " + en("She") + " です。",
          en("Her") + " は「彼女の・彼女を」、" + en("Hers") + " は「彼女のもの」で、主語には使えません。",
          en("He") + " は「彼は」で、男の人をさします。"
        ]
      },
      {
        id: "f2",
        text: "空所に入る語はどれですか。",
        material: eibun("This is " + blank() + " pen.", "これはわたしのペンです。"),
        choices: ["I", "my", "me", "mine"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          "空所は名詞 " + en("pen") + " の前で、「わたしの」にあたります。「〜の」の形は " + en("my") + " です。",
          eibun("This is " + fill("my") + " pen."),
          en("mine") + " は「わたしのもの」という意味で、あとに名詞を置きません。" + en("This pen is mine.") + " なら正しい文です。"
        ]
      },
      {
        id: "f3",
        text: "空所に入る語はどれですか。",
        material: eibun("Please help " + blank() + ".", "わたしを手伝ってください。"),
        choices: ["I", "my", "me", "we"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          "空所は動詞 " + en("help") + " のあとで、「わたしを」にあたります。「〜を」の形は " + en("me") + " です。",
          eibun("Please help " + fill("me") + "."),
          en("I") + " と " + en("we") + " は主語の形、" + en("my") + " は名詞の前に置く形です。"
        ]
      },
      {
        id: "f4",
        text: "空所に入る語はどれですか。",
        material: eibun("This bike is " + blank() + ".", "この自転車は彼女のものです。"),
        choices: ["her", "she", "they", "hers"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          "「彼女のもの」は " + en("hers") + " です。1語で " + en("her bike") + " の代わりをします。",
          eibun("This bike is " + fill("hers") + "."),
          en("her") + " は「彼女の」で、あとに名詞が必要です。" + en("she") + " と " + en("they") + " は主語の形です。"
        ]
      },
      {
        id: "f5",
        text: "空所に入る語はどれですか。",
        material: eibun("I play tennis with " + blank() + " on Sundays.", "わたしは日曜日に彼とテニスをします。"),
        choices: ["him", "he", "his", "they"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("with") + " などの前置詞のあとには、「〜を・〜に」の形を置きます。",
          "「彼」の「〜を」の形は " + en("him") + " です。",
          en("he") + " と " + en("they") + " は主語の形、" + en("his") + " は「彼の・彼のもの」です。"
        ]
      },
      {
        id: "f6",
        text: "空所に入る語はどれですか。",
        material: eibun("Mr. Sato is " + blank() + " teacher.", "佐藤先生はわたしたちの先生です。"),
        choices: ["we", "our", "us", "ours"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          "空所は名詞 " + en("teacher") + " の前で、「わたしたちの」にあたります。「〜の」の形は " + en("our") + " です。",
          en("we") + " は「わたしたちは」、" + en("us") + " は「わたしたちを」、" + en("ours") + " は「わたしたちのもの」です。"
        ]
      },
      {
        id: "f7",
        text: "空所に入る語はどれですか。",
        material: eibun([
          ["I have two dogs.", "わたしは犬を2ひき飼っています。"],
          ["I like " + blank() + " very much.", "わたしは(その犬たち)が大好きです。"]
        ]),
        choices: ["they", "their", "them", "it"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          en("two dogs") + " は複数なので、" + en("they") + " のなかまでうけます。",
          "空所は動詞 " + en("like") + " のあとなので、「〜を」の形の " + en("them") + " にします。",
          en("they") + " は主語の形、" + en("their") + " は名詞の前に置く形です。" + en("it") + " は1つのものをさします。"
        ]
      },
      {
        id: "f8",
        text: "空所に入る語はどれですか。",
        material: eibun([
          ["Look at that cat.", "あのネコを見て。"],
          [blank() + " eyes are blue.", "(そのネコの)目は青いです。"]
        ]),
        choices: ["It", "It's", "They", "Its"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          "空所は名詞 " + en("eyes") + " の前で、「それの」にあたります。" + en("it") + " の「〜の」の形は " + en("its") + " です。",
          en("It's") + " は " + en("It is") + " を短くした形で、「それの」という意味ではありません。アポストロフィのあるなしで区別します。",
          en("It") + " と " + en("They") + " は主語の形なので、名詞の前には置けません。"
        ]
      },
      {
        id: "f9",
        text: "空所に入る語はどれですか。",
        material: eibun(blank() + " are my notebooks.", "(　　)はわたしのノートです。"),
        choices: ["These", "This", "That", "It"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "be動詞が " + en("are") + " で、" + en("notebooks") + " も複数形です。主語も複数の形にします。",
          en("this") + "(これ)の複数の形が " + en("these") + "(これら)です。",
          en("This") + "、" + en("That") + "、" + en("It") + " は1つのものをさすので、be動詞は " + en("is") + " になります。"
        ]
      },
      {
        id: "f10",
        text: "空所に入る語はどれですか。",
        material: kaiwa([
          ["A", "Is that your bag?", "あれはあなたのかばんですか。"],
          ["B", "Yes, " + blank() + " is."]
        ]),
        choices: ["he", "it", "she", "they"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          en("this") + " や " + en("that") + " でたずねられたものは、答えの文では " + en("it") + " でうけます。",
          eibun("Yes, " + fill("it") + " is.", "はい、そうです。"),
          en("he") + " と " + en("she") + " は人をさします。" + en("they") + " は複数をさし、be動詞が " + en("are") + " になります。"
        ]
      },
      {
        id: "f11",
        text: "「これはケンのかばんです。」を表す文はどれですか。",
        choices: [
          en("This is Ken bag."),
          en("This is bag Ken."),
          en("This is Ken's bag."),
          en("This is he bag.")
        ],
        answer: 2,
        explain: [
          "人の名前で「〜の」と言うときは、名前に " + en("'s") + " をつけて、名詞の前に置きます。",
          eibun("This is Ken's bag."),
          en("he") + " は主語の形です。代名詞で言うなら " + en("This is his bag.") + " になります。"
        ]
      },
      {
        id: "f12",
        text: "空所に入る答えとして正しいものはどれですか。",
        material: kaiwa([
          ["A", "Whose umbrella is this?", "これはだれのかさですか。"],
          ["B", blank()]
        ]),
        choices: [
          en("It's me."),
          en("It's my."),
          en("It's I."),
          en("It's mine.")
        ],
        answer: 3,
        explain: [
          en("Whose 〜?") + " には、「〜のもの」の形で持ち主を答えます。「わたしのもの」は " + en("mine") + " です。",
          eibun("It's mine.", "わたしのものです。"),
          en("my") + " はあとに名詞が必要で、" + en("It's my umbrella.") + " なら正しい文です。" + en("me") + " や " + en("I") + " では持ち主を表せません。"
        ]
      },
      {
        id: "f13",
        text: "誤りのある文はどれですか。",
        choices: [
          en("Him is my friend."),
          en("I know her."),
          en("That is their house."),
          en("This book is yours.")
        ],
        answer: 0,
        explain: [
          "文の主語には「〜は」の形を使います。" + en("him") + " は「彼を」の形です。",
          seigo("Him is my friend.", key("He") + " is my friend."),
          "ほかの3つは、動詞のあとに " + en("her") + "、名詞の前に " + en("their") + "、「あなたのもの」に " + en("yours") + " を使っていて正しい文です。"
        ]
      },
      {
        id: "f14",
        text: "2つの文がほぼ同じ意味になるように、空所に入る語を選びなさい。",
        material: eibun([
          ["This is my book."],
          ["This book is " + blank() + "."]
        ]),
        choices: ["my", "mine", "me", "I"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          "1文めは「これはわたしの本です」、2文めは「この本はわたしのものです」という意味にします。",
          "「わたしのもの」は " + en("mine") + " です。" + en("mine") + " 1語で " + en("my book") + " の代わりをします。",
          en("my") + " はあとに名詞が必要なので、文の終わりには置けません。"
        ]
      },
      {
        id: "f15",
        text: "次の英文の意味として正しいものはどれですか。",
        material: eibun("Those are our bikes."),
        choices: [
          "これらはわたしたちの自転車です。",
          "あれはわたしたちの自転車です。",
          "あれらはわたしたちの自転車です。",
          "あれらは彼らの自転車です。"
        ],
        answer: 2,
        explain: [
          en("those") + " は " + en("that") + " の複数の形で、「あれら」という意味です。" + en("our") + " は「わたしたちの」です。",
          "「これら」は " + en("these") + "、「あれ」(1つ)は " + en("that") + "、「彼らの」は " + en("their") + " です。"
        ]
      }
    ]
  });

  // =====================================================================
  // 1-12 前置詞
  // =====================================================================
  JHE.register("g1-prepositions", {
    points: [
      "前置詞は、" + rule("名詞や代名詞の前") + "に置いて、時や場所などを表します。前置詞のあとの代名詞は「〜を・〜に」の形です(" + en("with me") + "、" + en("for him") + ")。",
      "時を表すときは、" + rule(en("at") + " + 時刻") + "(" + en("at seven") + ")、" + rule(en("on") + " + 曜日・日付") + "(" + en("on Sunday") + "、" + en("on May 5") + ")、" + rule(en("in") + " + 月・季節・年") + "(" + en("in April") + "、" + en("in summer") + ")と使い分けます。" + en("in the morning") + "(午前に)、" + en("at night") + "(夜に)は、そのまま覚えます。",
      "場所を表す語: " + en("in") + "(〜の中に)、" + en("on") + "(〜の上に。面に接している)、" + en("under") + "(〜の下に)、" + en("by") + "(〜のそばに)、" + en("near") + "(〜の近くに)。" + en("on the wall") + "(壁に)のように、上でなくても接していれば " + en("on") + " です。",
      "そのほかの語: " + en("to") + "(〜へ)、" + en("from") + "(〜から。" + en("be from") + " で「〜の出身」)、" + en("with") + "(〜といっしょに)、" + en("for") + "(〜のために)、" + en("before") + "(〜の前に)、" + en("after") + "(〜のあとに)、" + en("by") + " + 乗り物(〜で)。",
      "動詞とセットで覚える言い方があります。" + en("go to school") + "(学校へ行く)、" + en("listen to music") + "(音楽を聞く)、" + en("look at the picture") + "(その絵を見る)。"
    ],
    chart: hyo({
      caption: "時を表す前置詞",
      head: ["", "前置詞"],
      rows: [
        ["時刻", "at"],
        ["曜日", "on"],
        ["日付", "on"],
        ["月", "in"],
        ["季節", "in"],
        ["年", "in"]
      ]
    }),
    example: {
      title: "①と②に入る前置詞を答えなさい。" + eibun("I get up " + blank("①") + " six " + blank("②") + " Sundays.", "わたしは日曜日には6時に起きます。"),
      steps: [
        "①のあとの " + en("six") + " は時刻です。時刻の前には " + en("at") + " を置きます。",
        "②のあとの " + en("Sundays") + " は曜日です。曜日の前には " + en("on") + " を置きます。",
        eibun("I get up " + fill("at") + " six " + fill("on") + " Sundays.")
      ],
      result: "① " + en("at") + "　② " + en("on")
    },
    fixed: [
      {
        id: "f1",
        text: "空所に入る語はどれですか。",
        material: eibun("I get up " + blank() + " six thirty every morning.", "わたしは毎朝6時30分に起きます。"),
        choices: ["at", "on", "in", "to"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("six thirty") + "(6時30分)は時刻です。時刻の前には " + en("at") + " を置きます。",
          eibun("I get up " + fill("at") + " six thirty every morning."),
          en("on") + " は曜日や日付、" + en("in") + " は月や季節の前に使います。" + en("to") + " は「〜へ」と行き先を表す語です。"
        ]
      },
      {
        id: "f2",
        text: "空所に入る語はどれですか。",
        material: eibun("We have a math test " + blank() + " Monday.", "月曜日に数学のテストがあります。"),
        choices: ["at", "on", "in", "of"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          en("Monday") + "(月曜日)は曜日です。曜日の前には " + en("on") + " を置きます。",
          eibun("We have a math test " + fill("on") + " Monday."),
          en("at") + " は時刻、" + en("in") + " は月や季節の前に使います。" + en("of") + " は「〜の」という意味で、時は表しません。"
        ]
      },
      {
        id: "f3",
        text: "空所に入る語はどれですか。",
        material: eibun("School starts " + blank() + " April.", "学校は4月に始まります。"),
        choices: ["on", "at", "in", "to"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          en("April") + "(4月)は月です。月の前には " + en("in") + " を置きます。",
          eibun("School starts " + fill("in") + " April."),
          en("on") + " は曜日や日付、" + en("at") + " は時刻の前に使います。" + en("on April 8") + " のように日がつくと " + en("on") + " になります。"
        ]
      },
      {
        id: "f4",
        text: "空所に入る語はどれですか。",
        material: eibun("My birthday is " + blank() + " July 7.", "わたしの誕生日は7月7日です。"),
        choices: ["in", "at", "with", "on"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          en("July 7") + "(7月7日)は日付です。日付の前には " + en("on") + " を置きます。",
          "月だけなら " + en("in July") + " ですが、日がつくと " + en("on July 7") + " になります。",
          en("at") + " は時刻の前に使います。" + en("with") + " は「〜といっしょに」という意味です。"
        ]
      },
      {
        id: "f5",
        text: "日本語の文に合うように、空所に入る語を選びなさい。",
        material: eibun("My cat is " + blank() + " the table.", "わたしのネコはテーブルの下にいます。"),
        choices: ["under", "on", "in", "to"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "「〜の下に」は " + en("under") + " で表します。",
          en("on the table") + " は「テーブルの上に」という意味になります。",
          en("in") + " は「〜の中に」、" + en("to") + " は「〜へ」という意味です。"
        ]
      },
      {
        id: "f6",
        text: "日本語の文に合うように、空所に入る語を選びなさい。",
        material: eibun("The clock is " + blank() + " the wall.", "時計は壁にかかっています。"),
        choices: ["in", "on", "under", "to"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          en("on") + " は、ものが面に接していることを表します。上にのっていなくても、壁にかかっていれば " + en("on") + " です。",
          eibun("The clock is " + fill("on") + " the wall."),
          en("in the wall") + " は「壁の中に」、" + en("under the wall") + " は「壁の下に」という意味になってしまいます。"
        ]
      },
      {
        id: "f7",
        text: "日本語の文に合うように、空所に入る語を選びなさい。",
        material: eibun("Your cap is " + blank() + " the box.", "あなたのぼうしは箱の中にあります。"),
        choices: ["on", "under", "in", "by"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          "「〜の中に」は " + en("in") + " で表します。",
          en("on the box") + " は「箱の上に」、" + en("under the box") + " は「箱の下に」、" + en("by the box") + " は「箱のそばに」という意味です。"
        ]
      },
      {
        id: "f8",
        text: "空所に入る語はどれですか。",
        material: eibun("I go " + blank() + " school by bike.", "わたしは自転車で学校へ行きます。"),
        choices: ["at", "in", "on", "to"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          "「〜へ行く」は " + en("go to 〜") + " で表します。" + en("to") + " は行き先を表す語です。",
          eibun("I go " + fill("to") + " school by bike."),
          en("at") + "、" + en("in") + "、" + en("on") + " は「〜で・〜に」と場所を表す語で、" + en("go") + " の行き先には使いません。"
        ]
      },
      {
        id: "f9",
        text: "空所に入る語はどれですか。",
        material: eibun("My father goes to work " + blank() + " car.", "父は車で仕事に行きます。"),
        choices: ["by", "in", "on", "with"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "「乗り物で」と交通手段を言うときは、" + en("by") + " + 乗り物の名前で表します。",
          "このとき、乗り物の名前には " + en("a") + " や " + en("the") + " をつけません。" + en("by bus") + "(バスで)、" + en("by train") + "(電車で)も同じです。",
          en("a") + " や " + en("the") + " のない " + en("car") + " の前に、" + en("in") + "、" + en("on") + "、" + en("with") + " は置けません。"
        ]
      },
      {
        id: "f10",
        text: "日本語の文に合うように、空所に入る語を選びなさい。",
        material: eibun("I play soccer " + blank() + " my friends after school.", "わたしは放課後、友だちといっしょにサッカーをします。"),
        choices: ["to", "with", "at", "in"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          "「〜といっしょに」は " + en("with") + " で表します。",
          eibun("I play soccer " + fill("with") + " my friends after school."),
          en("to") + " は「〜へ」、" + en("at") + " と " + en("in") + " は場所や時を表す語で、「いっしょに」の意味はありません。"
        ]
      },
      {
        id: "f11",
        text: "日本語の文に合うように、空所に入る語を選びなさい。",
        material: eibun("Ms. Green is " + blank() + " Canada.", "グリーン先生はカナダの出身です。"),
        choices: ["to", "on", "from", "at"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          "「〜の出身です」は、be動詞 + " + en("from") + " で表します。" + en("from") + " は「〜から」という意味です。",
          eibun("Ms. Green is " + fill("from") + " Canada."),
          en("to") + " は「〜へ」という行き先を表す語です。国の名前の前に " + en("on") + " や " + en("at") + " は置きません。"
        ]
      },
      {
        id: "f12",
        text: "日本語の文に合うように、空所に入る語を選びなさい。",
        material: eibun("I wash my hands " + blank() + " lunch.", "わたしは昼食の前に手を洗います。"),
        choices: ["after", "under", "from", "before"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          "「〜の前に」(時)は " + en("before") + " で表します。",
          en("after lunch") + " は「昼食のあとに」という意味で、反対になります。",
          en("under") + " は「〜の下に」、" + en("from") + " は「〜から」という意味です。"
        ]
      },
      {
        id: "f13",
        text: "「わたしは彼といっしょに学校へ行きます。」を表す文はどれですか。",
        choices: [
          en("I go to school with him."),
          en("I go to school with he."),
          en("I go school with him."),
          en("I go to school to him.")
        ],
        answer: 0,
        explain: [
          "「学校へ行く」は " + en("go to school") + "、「彼といっしょに」は " + en("with him") + " です。",
          "前置詞のあとの代名詞は「〜を・〜に」の形なので、" + en("with he") + " は誤りです。",
          en("go") + " のあとの " + en("to") + " は省けません。" + en("to him") + " は「彼のところへ」という意味になります。"
        ]
      },
      {
        id: "f14",
        text: "誤りのある文はどれですか。",
        choices: [
          en("I watch TV after dinner."),
          en("She listens music every day."),
          en("He is from Australia."),
          en("We play tennis on Saturdays.")
        ],
        answer: 1,
        explain: [
          "「〜を聞く」は " + en("listen to 〜") + " で表します。" + en("to") + " が必要です。",
          seigo("She listens music every day.", "She listens " + key("to") + " music every day."),
          "ほかの3つは、" + en("after") + "(〜のあとに)、" + en("from") + "(〜の出身)、" + en("on") + " + 曜日を正しく使っています。"
        ]
      },
      {
        id: "f15",
        text: "次の英文の意味として正しいものはどれですか。",
        material: eibun("The bookstore is near the station."),
        choices: [
          "その本屋は駅の中にあります。",
          "その本屋は駅から遠いです。",
          "その本屋は駅の近くにあります。",
          "その本屋は駅の上にあります。"
        ],
        answer: 2,
        explain: [
          en("near") + " は「〜の近くに」という意味です。",
          "「駅の中に」は " + en("in the station") + "、「駅の上に」は " + en("on the station") + " で表します。",
          "「駅から遠い」は、「近くに」と反対の意味です。"
        ]
      }
    ]
  });

  // =====================================================================
  // 1-13 数・曜日・月
  // =====================================================================
  JHE.register("g1-numbers-dates", {
    points: [
      "数を表すのが" + rule("基数") + "(" + en("one, two, three") + " …)、順番や日付を表すのが" + rule("序数") + "(" + en("first, second, third") + " …)です。序数は、4番目からはふつう基数に " + en("th") + " をつけます。つづりが変わるものは表で覚えます(ほかに " + en("twelfth") + "、" + en("twentieth") + ")。",
      "13から19は " + en("teen") + "、20、30 … は " + en("ty") + " で終わります。" + en("twelve") + "(12)、" + en("thirteen") + "(13)、" + en("fifteen") + "(15)、" + en("forty") + "(40)はつづりに注意します。21は " + en("twenty-one") + " のようにハイフンでつなぎます。",
      "曜日は " + en("Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday") + "。月は " + en("January, February, March, April, May, June, July, August, September, October, November, December") + "。どちらも、文の途中でも" + rule("大文字で始めます") + "。",
      "日付は「月 + 日」の順で " + en("May 5") + " のように書き、日は序数で読みます(" + en("May fifth") + ")。曜日は " + en("What day is it today?") + "、日付は " + en("What's the date today?") + " でたずねます。",
      "時刻は「時 + 分」の順に数を並べます(" + en("It's seven thirty.") + ")。ちょうどのときは " + en("o'clock") + " をつけます。時刻・曜日・日付を言う文の主語は " + en("it") + " で、「それは」とは訳しません。"
    ],
    chart: hyo({
      caption: "基数と序数(つづりに注意するもの)",
      head: ["", "基数", "序数"],
      rows: [
        ["1", "one", "first"],
        ["2", "two", "second"],
        ["3", "three", "third"],
        ["4", "four", "fourth"],
        ["5", "five", "fifth"],
        ["8", "eight", "eighth"],
        ["9", "nine", "ninth"]
      ]
    }),
    example: {
      title: "「5月3日」を英語で表しなさい。",
      steps: [
        "日付は「月 + 日」の順に並べます。5月は " + en("May") + " で、大文字で始めます。",
        "日は序数で読みます。3の序数は " + en("three") + " に " + en("th") + " をつけるのではなく、" + en("third") + " です。",
        "書くときは、数字を使って " + en("May 3") + " とします。"
      ],
      result: en("May 3") + "(読み方は " + en("May third") + ")"
    },
    fixed: [
      {
        id: "f1",
        text: "「12」を表す語はどれですか。",
        choices: ["twelve", "twenty", "eleven", "thirteen"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "12は " + en("twelve") + " です。",
          en("twenty") + " は20、" + en("eleven") + " は11、" + en("thirteen") + " は13です。",
          "11と12は " + en("teen") + " がつかない、特別な形です。"
        ]
      },
      {
        id: "f2",
        text: "「40」のつづりとして正しいものはどれですか。",
        choices: ["fourty", "forty", "fourteen", "fourth"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          "40は " + en("forty") + " です。" + en("four") + " の " + en("u") + " がなくなることに注意します。",
          henka("four", "forty"),
          en("fourteen") + " は14、" + en("fourth") + " は「4番目」です。この2つは " + en("u") + " が残ります。"
        ]
      },
      {
        id: "f3",
        text: "「15」のつづりとして正しいものはどれですか。",
        choices: ["fiveteen", "fifty", "fifteen", "fifth"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          "15は " + en("fifteen") + " です。" + en("five") + " の " + en("ve") + " が " + en("f") + " に変わります。",
          henka("five", "fifteen"),
          en("fifty") + " は50、" + en("fifth") + " は「5番目」です。"
        ]
      },
      {
        id: "f4",
        text: "「2番目」を表す語はどれですか。",
        choices: ["twoth", "third", "first", "second"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          en("two") + " の序数は、" + en("th") + " をつけるのではなく " + en("second") + " です。",
          en("first") + " は「1番目」、" + en("third") + " は「3番目」です。",
          "1番目から3番目までは、基数とまったくちがう形になります。"
        ]
      },
      {
        id: "f5",
        text: "空所に入る語はどれですか。",
        material: eibun("March is the " + blank() + " month of the year.", "3月は1年の(　　)番目の月です。"),
        choices: ["third", "three", "thirty", "thirteen"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          en("March") + "(3月)は、1年の3番目の月です。順番を表すので序数を使います。",
          "3の序数は " + en("third") + " です。",
          en("three") + " は数の3、" + en("thirty") + " は30、" + en("thirteen") + " は13で、どれも順番は表しません。"
        ]
      },
      {
        id: "f6",
        text: "「火曜日」を表す語はどれですか。",
        choices: ["Thursday", "Tuesday", "Wednesday", "Saturday"],
        answer: 1,
        choiceLayout: "grid",
        explain: [
          "火曜日は " + en("Tuesday") + " です。",
          en("Thursday") + " は木曜日、" + en("Wednesday") + " は水曜日、" + en("Saturday") + " は土曜日です。",
          en("Tuesday") + " と " + en("Thursday") + " は、どちらも " + en("T") + " で始まるので、まちがえやすい組です。"
        ]
      },
      {
        id: "f7",
        text: en("Wednesday") + " の次の日はどれですか。",
        choices: ["Tuesday", "Friday", "Thursday", "Monday"],
        answer: 2,
        choiceLayout: "grid",
        explain: [
          en("Wednesday") + " は水曜日です。次の日は木曜日で、" + en("Thursday") + " です。",
          en("Tuesday") + " は火曜日で、水曜日の前の日です。",
          en("Friday") + " は金曜日、" + en("Monday") + " は月曜日です。"
        ]
      },
      {
        id: "f8",
        text: "「8月」を表す語はどれですか。",
        choices: ["April", "October", "July", "August"],
        answer: 3,
        choiceLayout: "grid",
        explain: [
          "8月は " + en("August") + " です。",
          en("April") + " は4月、" + en("October") + " は10月、" + en("July") + " は7月です。",
          en("April") + " と " + en("August") + " は、どちらも " + en("A") + " で始まるので区別します。"
        ]
      },
      {
        id: "f9",
        text: "「2月」のつづりとして正しいものはどれですか。",
        choices: ["February", "Febuary", "Feburary", "Februaly"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "2月は " + en("February") + " です。",
          en("b") + " のあとに " + en("r") + " があること、終わりが " + en("ary") + " であることに注意します。",
          en("January") + "(1月)と終わりの形が同じです。"
        ]
      },
      {
        id: "f10",
        text: "次の問いへの答えとして正しいものはどれですか。",
        material: eibun("What day is it today?"),
        choices: [
          en("It's May 10."),
          en("It's Friday."),
          en("It's ten o'clock."),
          en("It's sunny.")
        ],
        answer: 1,
        explain: [
          en("What day is it today?") + " は「今日は何曜日ですか」と、曜日をたずねる文です。",
          "曜日を答えている " + en("It's Friday.") + "(金曜日です)が正解です。",
          en("It's May 10.") + " は日付、" + en("It's ten o'clock.") + " は時刻、" + en("It's sunny.") + " は天気の答えです。"
        ]
      },
      {
        id: "f11",
        text: "「7時30分です。」を表す文はどれですか。",
        choices: [
          en("It's seven thirteen."),
          en("It's thirty seven."),
          en("It's seven thirty."),
          en("It's seventh thirty.")
        ],
        answer: 2,
        explain: [
          "時刻は「時 + 分」の順に、基数を並べて言います。",
          "7時は " + en("seven") + "、30分は " + en("thirty") + " なので、" + en("It's seven thirty.") + " です。",
          en("thirteen") + " は13なので、7時13分になります。時刻に序数(" + en("seventh") + ")は使いません。"
        ]
      },
      {
        id: "f12",
        text: "空所に入る答えとして正しいものはどれですか。",
        material: kaiwa([
          ["A", "What time is it now?"],
          ["B", blank()]
        ]),
        choices: [
          en("It's Monday."),
          en("It's June 8."),
          en("It's eight years old."),
          en("It's eight o'clock.")
        ],
        answer: 3,
        explain: [
          en("What time is it now?") + " は「今、何時ですか」と、時刻をたずねる文です。",
          en("It's eight o'clock.") + "(8時です)が正解です。" + en("o'clock") + " は、ちょうどの時刻につけます。",
          en("It's Monday.") + " は曜日、" + en("It's June 8.") + " は日付の答えです。" + en("eight years old") + " は「8歳」という年齢です。"
        ]
      },
      {
        id: "f13",
        text: "下線の部分の読み方として正しいものはどれですか。",
        material: eibun("My birthday is October " + u("1") + ".", "わたしの誕生日は10月1日です。"),
        choices: ["first", "one", "ones", "oneth"],
        answer: 0,
        choiceLayout: "grid",
        explain: [
          "日付の「日」は、序数で読みます。",
          "1の序数は " + en("first") + " なので、" + en("October first") + " と読みます。",
          en("one") + " は数の1で、日付の読み方には使いません。" + en("oneth") + " という語はありません。"
        ]
      },
      {
        id: "f14",
        text: "誤りのある文はどれですか。",
        choices: [
          en("We have English on Monday."),
          en("I play tennis on sunday."),
          en("My birthday is in May."),
          en("It's Saturday today.")
        ],
        answer: 1,
        explain: [
          "曜日と月の名前は、文の途中でも大文字で始めます。",
          seigo("I play tennis on sunday.", "I play tennis on " + key("S") + "unday."),
          "ほかの3つは、" + en("Monday") + "、" + en("May") + "、" + en("Saturday") + " を大文字で始めていて正しい文です。"
        ]
      },
      {
        id: "f15",
        text: "次の英文の意味として正しいものはどれですか。",
        material: eibun("What's the date today?"),
        choices: [
          "今日は何曜日ですか。",
          "今、何時ですか。",
          "今日は何月何日ですか。",
          "今日の天気はどうですか。"
        ],
        answer: 2,
        explain: [
          en("date") + " は「日付」という意味です。" + en("What's the date today?") + " は日付をたずねる文で、" + en("It's May 5.") + " のように答えます。",
          "「何曜日ですか」は " + en("What day is it today?") + "、「何時ですか」は " + en("What time is it?") + " でたずねます。"
        ]
      }
    ]
  });
})();
