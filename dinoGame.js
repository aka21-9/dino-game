// 主な機能の仕組み
// 画像の読み込み
// ゲームの初期化
// 敵キャラクターの作成
// 敵キャラクターの移動
// 恐竜の動き
// 衝突判定
// キーイベント
//　ゲームオーバーの時のスコア表示
// ジャンプの高さや重力

// HTMLの中にある<canvas---->をjsで使えるようにしている
const canvas = document.getElementById('canvas');
// ctxはキャンバスの中に絵を描くための道具（2D用のペン）
//　キャンバスに図形や画像、テキストなどを自由に描ける
const ctx = canvas.getContext('2d');
// 画像の名前をまとめたリスト（配列）を作っている
const imageNames =['bird','cactus','dino'];

// ゲームの設定
// グローバルなgame オブジェクト
const game = {
  // 何フレーム目かを数えておく
  counter : 0,
  // 背景
  backGrounds: [],
  bgm1: new Audio('bgm_fieldSong.mp3'),
  bgm2: new Audio('bgm_jump.mp3'),
  // 敵キャラクタを配置
  enemys : [],
  // 敵キャラ出現までのカウントダウン用の変数
  enemyCountdown: 0,
  //　後で画像のデータをいれるために{}これで空のデータを作っている状態
  image : {},
   // ゲームオーバーかどうか判断するもので、falseは終わっていない、終了していないよという意味
  // isGameOver : true,
  // ゲームのスコアを数える
  score : 0,
  state:'loading',
  // タイマー管理
  timer : null
};
game.bgm1.loop = true;

// 複数画像読み込み 
// imageNamesをループさせて、各画像のロードをする。全て画像がロードされたら、init()で初期化をする
let imageLoadCounter = 0;
// imageNamesの要素を一つずつ取り出してループするという処理
for (const imageName of imageNames) {
   // 画像のフォルダとファイル名をくっつけ文字列にしてファイルパスを作っている
    const imagePath = `image/${imageName}.png`;
    // 後で取り出して使うので、画像の入れ物を作って保存している感じ
    game.image[imageName] = new Image();
    //　画像のデータを上の箱に流し込むみたいなイメージ
    game.image[imageName].src = imagePath;
    // 読み込み終わったら実行される処理
    game.image[imageName].onload = () => {
        // 画像が1枚読み込めたら、カウンターを1増やす
        imageLoadCounter += 1;
        // 全部の画像が読み込まれたら、
        if (imageLoadCounter === imageNames.length) {
            // ちゃんと全部読み込めたーっという処理をする
            console.log('画像のロードが完了しました。');
            // 読み込めたら、スタートの準備や画面表示の開始の合図になる
            init();
        }
    }
}

function init(){
  game.counter = 0;
  game.enemys = []
  game.enemyCountdown = 0;
  // game.isGameOver = false;
  game.score = 0;
  game.state = 'init';
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // 恐竜の登場
  createDino();
  drawDino();
  createBackGround();
  drawBackGrounds();
  ctx.fillStyle = 'black';
  ctx.font = 'bold 60px serif';
  ctx.fillText('Press Space key',60,150);
  ctx.fillText('to start.',150,230);
  // setIntervalというのは指定した関数を繰り返し実行するというもの
  // tickerが何かの処理を行うためのもの　チクタクチクタク時を刻むもの
  // 2番目の引数が0.03秒ごとに実行し続けるという意味
  // 動きをスムーズに見せるために更新する必要がある
  // game.timer = setInterval(ticker,30);
}

function start() {
  game.state = 'gaming';
  game.bgm1.play();
  game.timer = setInterval(ticker, 30);
}
// 空を作る　
// ゲームを一回更新する処理を全部まとめた関数
function ticker(){
  // 画面クリア　2D描画用のペンをきれいにするという処理
  // 左上から(0,0)から、canvas全体（横幅✖️高さ）を消すということ
  // ゲームやアニメって、キャラや背景が少しずつ動くから、残像がぐちゃぐちゃにならないために毎回全体を消してから書き直している。
  // イメージ的には、ctxの道具箱の中にclearRectという消しゴム機能をがあって、canvasで絵を描く場所を消すという感じ
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // 背景の作成
  // 背景オブジェクトの作成はticker関数が10回実行される度に一度作成する。
  if (game.counter % 10 === 0){
    createBackGround();
  }

  moveBackGrounds(); // 背景の移動
  moveDino(); //恐竜の移動
  moveEnemys(); //　敵キャラクタの移動

  drawBackGrounds(); //背景の絵
  drawDino(); // 恐竜の絵
  drawEnemys(); // 敵キャラクタの絵
  drawScore(); // スコアの絵

  hitCheck(); // 当たり判定　衝突した時に呼ぶ

  // 敵キャラクタの生成　math.random() = 0〜99までランダムで出てくる
  // 0.9999に100かけるから99.999になって小数点切り捨てして0〜99になる
  // サボテンが出てくる100分の1（1％）の確率
  // サボテンや鳥が出てくる回数を上げている。geme.scoreによってかわってくる。
  //　もし500点ならば、100割るので、-5してあげて0が出る確率（敵が出てくる確率）を上げている。
  //if(Math.floor(Math.random() * 100 - game.score / 100) === 0) {
  //createCactus();
// } //鳥が出てくる200分の1（0.5%）の確率
  //if(Math.floor(Math.random() * 200 - game.score / 100) === 0) {
    //createBird();
    // コメントアウトした部分はランダムででてくるものを手動で計算して作ったもの
    createEnemys();
      // カウンタの更新 1000000超えたらクリア的な感じ
  game.score += 1;
  game.counter = (game.counter + 1) % 1000000;
  game.enemyCountdown -= 1;

  }

// 画面の端に見えないところに作る
function createCactus(createX) {
  // サボテンの情報をゲームの中に追加するという命令
  // game.enemysが敵をまとめた場所　push()が新しいものを追加する
  // enemys = 敵
  game.enemys.push({
    // サボテンの画像の中央が画面の右端より少し外側に配置される位置になる
    //　サボテンがどこから出てくるか　canvas.widthなので画面の右端のこと
    // ちょっとだけ足しているから、画面の外からサボテンが出てくるとなっている
     // 前の処理
     // x: canvas.width + game.image.cactus.width / 2,
     x: createX,
    // 縦の位置（高さ）を表している。画面の下の方に地面の上に立っているイメージ
      y: canvas.height - game.image.cactus.height / 2,
      // サボテンの横幅と高さサボテンの画面の大きさを使っている
      width: game.image.cactus.width,
      height: game.image.cactus.height,
      // サボテンが左に動くスピードを表している　右から左に走っている
      moveX: -10,
      // サボテンの画像を教えている。
      image: game.image.cactus
  });
}

// 鳥の特徴の設定
function createBird() {
  // 鳥がどの高さに出てくるかを決めている
  // ランダムな数で150〜300の間のどこかに出てくる
  const birdY = Math.random() * (300 - game.image.bird.height) + 150;
  // 新しい敵を追加してねという命令　この場合は鳥になる
  game.enemys.push({
    // 画面の右の外側から飛んでくる
      x: canvas.width + game.image.bird.width / 2,
      // さっきのconstで定義した鳥の高さをもう一度読んでいる
      y: birdY,
      // 鳥の画像のサイズを合わせている
      // widthやheightは高さや横　gameはゲーム全体の情報が入っている箱
      // imageは画像をまとめた場所　ゲームの中の画像のグループ的なもの
      // birdは鳥の画像という事　ゲームの画像グループの中にある、鳥の画像
      //　.width.heightは鳥の横や縦の長さを取得という意味
      width: game.image.bird.width,
      height: game.image.bird.height,
      // 左に飛ぶ速さを指定。　サボテンよりもちょっと早くしている
      moveX: -15,
      // 鳥の絵を指定
      image: game.image.bird
  });
}

// ゲームに出てくる的（サボテンや鳥）を左に動かして、画面の外に出た敵を消すためのもの
// moveEnemysという名前のやる事リストをつくるという宣言
//　functionは、ゲームの中で敵を動かすときに呼ばれる
function moveEnemys() {
  // 敵たち一人一人について順番にやっていくよという意味 enemyは今見てる一人の敵って感じ
  // for文は何かを繰り返しやるときに使う命令
  for (const enemy of game.enemys) {
    // 今見ている敵のxの位置を、moveX分だけ動かす
    // enemy.xは敵がどこにいるか　enemy.moveXで横に動くか
      enemy.x += enemy.moveX;
  }
  // ここまでは敵を左にシューっと動かしている感じ
  // 画面の左の外に完全にでっちゃった敵は、もう消して良い。
  // filter()は「いるかいらないかを選ぶもの」条件に合わなかった敵を配列から除外するもの
  // enemy.x > -enemy.widthで敵の右の端がまだちょっとでもがめんにあるか？をチェックしている
  // widthで横幅からマイナスされたもの
  game.enemys = game.enemys.filter(enemy => enemy.x > -enemy.width);
}

// ゲームに出てくる敵を画面に描くための関数（箱）
function drawEnemys() {
  //　敵たち一人一人見ていくよ　上でやったのとほぼ一緒
  for (const enemy of game.enemys) {
    // ctx.drawImage(...) 絵をかく道具（ctx）で敵キャラの画像を画面に描くという命令
    // enemy.image　敵キャラの画像が入っている
    // enemy.x（敵の中心の場所） - enemy.width / 2 (敵の半分の横の長さ)　敵キャラの横の場所を計算している。
    // yも同じく縦の場所を表している
      ctx.drawImage(enemy.image, enemy.x - enemy.width / 2, enemy.y - enemy.height / 2);
  }
}

  // 敵キャラクタの移動
  function moveDino(){ // 恐竜の移動
    // 着地したら画面に合わせる 地面についたら上にも下にも行かないよ
    game.dino.y += game.dino.moveY;
    // 地面より下にいってしまったら中心座標で管理しているので、それより下に行ったら
    if (game.dino.y >= canvas.height - game.dino.height / 2){
      // 地面についてくださいという処理
      game.dino.y = canvas.height - game.dino.height / 2;
      game.dino.moveY = 0;
    } else { // 重力　もしまだ地面についていなかったら、3ずつ増やしていくよ
            // 飛んだら-41やっているので加速度-3ずつ増やしていくとめるよ
      game.dino.moveY += 3;
    }
  }

  // 描画　敵キャラクタの後にすると上に表示されるから
  // 恐竜の描画
  function drawDino(){ 
    ctx.drawImage(game.image.dino,
                  game.dino.x - game.dino.width / 2,
                  game.dino.y - game.dino.height / 2);
  } 

  // あたり判定
  function hitCheck() {
    //　ゲーム中のすべての敵キャラを一人ずつ見ていく
    for (const enemy of game.enemys) {
       // もし条件があったら、ゲームオーバにするという処理
        if (
          // 恐竜と敵キャラの位置の差を計算
          // game.dino.xは恐竜の横の位置　enemy.xは敵キャラの横の位置
          // math.abs()は絶対値を取る関数　どちらの位置が先でも、どれくらい離れているかを考える
          // だから、マイナスの位置にいたとしても絶対値なので、マイナスの数字を消して計算する
          // 横幅を半分にした合計で恐竜と敵キャラがぶつかるかどうかの距離の基準にしている
          // 恐竜の画像を少し小さくして、当たり判定を緩くしている
            Math.abs(game.dino.x - enemy.x) < game.dino.width * 0.8 / 2 + enemy.width * 0.9 / 2 &&
            //　これもおなじように、上下の位置の差を計算
            Math.abs(game.dino.y - enemy.y) < game.dino.height * 0.5 / 2 + enemy.height * 0.8 / 2
        ) {
          // もし恐竜と敵キャラがぶつかったら、ゲームオーバーにする
            // game.isGameOver = true;
            game.state = 'gameover';
            game.bgm1.pause();
            // 画面に大きな文字でゲームオーバを表示する
            //　文字を太く,100px、セリフ体のフォントにする
            ctx.font = 'bold 100px serif';
            // どこに描くかを指定している
            ctx.fillText(`Game Over!`, 150, 200);
            // タイマーを切る。
            clearInterval(game.timer);
        }
    }
}

// xやyで恐竜をどこにいるかを指定する。常に画像が変わっているので
function createDino(){
  // キャラクターの位置やサイズ、画像などの情報を格納
  game.dino = {
    //　画像を半分にして中央に配置されるように設定
    x: game.image.dino.width / 2,
    y: canvas.height - game.image.dino.height / 2,
    // 縦方向の移動速度の設定
    moveY: 0,
    // ゲームのあたり判定
    // 画像の幅を取得
    width: game.image.dino.width,
    // 画像の高さを取得
    height: game.image.dino.height,
    // 恐竜の絵そのものを設定
    image: game.image.dino
  }
}

// スペースキーを押したときの設定
document.onkeydown = function(e){
  if(e.key === ' ' && game.state === 'init') {
    start();
}
  // 　もしスペースキーが押された時、恐竜がジャンプしていない状態だったらジャンプさせていいよ
  // e.key === ' 'スペースキーを押したかどうか
  // game.dino.moveY === 0　恐竜が地面にいるかどうか
  // 地面に立っている時は動いていない = moveYが0の状態
  if(e.key === ' '&& game.dino.moveY === 0){
    // -41はどのくらい飛ぶか、
    game.dino.moveY = -41;
    game.bgm2.play();
  }
  //　もし押されたキーがエンターでゲームオーバだったら
  if (e.key === 'Enter'&& game.state === 'gameover'){
    // ゲームを最初の状態に戻して、リスタートする
    init();
  }
}

//　スコアを画面に表示する関数
function drawScore() {
  //　背景で茶色にしているんだけど、文字の色は黒にする
  ctx.fillStyle = 'black'
  // ctxはcanvasの2D絵を描く道具みたいなもの
  // fontでサイズやフォントの種類を決めている
  ctx.font = '24px serif';
  // fillText()でcanvasに文字を書く関数
  // 第一引数でscore: ◯○って表示　第二引数で左端から0px 第三引数で上から30px
  ctx.fillText(`score: ${game.score}`, 0, 30);
}

function createBackGround() {
  game.backGrounds = [];
  for (let x = 0; x <= canvas.width; x+=200) {
      game.backGrounds.push({
          x: x,
          y: canvas.height,
          width: 200,
          moveX: -20,
      });
  }
}

function moveBackGrounds() {
  for (const backGround of game.backGrounds) {
      backGround.x += backGround.moveX;
  }
}

function drawBackGrounds(){
  ctx.fillStyle = 'sienna';
  for (const backGround of game.backGrounds) {
      ctx.fillRect(backGround.x, backGround.y - 5, backGround.width, 5);
      ctx.fillRect(backGround.x+20, backGround.y - 10, backGround.width - 40, 5);
      ctx.fillRect(backGround.x+50, backGround.y - 15, backGround.width - 100, 5);
  }
}

// まず、ケース0の時に、サボテンを一つ出現、1の時に２つ出現、2の時に鳥を一つ出現する
function createEnemys(){
  // 敵が0になった時に次の敵を出していいよというもの
  if (game.enemyCountdown === 0){
    // スコアがでかくなるにつれて敵の出現頻度が上がる
    game.enemyCountdown = 60 - Math.floor(game.score / 100);
    // 出現頻度が高くなりすぎないように最低30フレームに設定
    if(game.enemyCountdown <= 30) game.enemyCountdown = 30;
        // ０〜２のどの種類の敵を出すか決めている
        switch(Math.floor(Math.random() * 3)) {
            case 0:
                createCactus(canvas.width + game.image.cactus.width / 2);
                break;
            case 1:
                createCactus(canvas.width + game.image.cactus.width / 2);
                createCactus(canvas.width + game.image.cactus.width * 3 / 2);
                break;
            case 2:
                createBird();
                break;
        }
    }
}