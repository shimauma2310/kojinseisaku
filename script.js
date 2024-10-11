// スタートボタンがクリックされたときにstartGame関数を呼び出すイベントリスナーを追加
document.getElementById('startButton').addEventListener('click', startGame);

function startGame() {
    // 開始ボタンを非表示にする
    document.getElementById('startButton').style.display = 'none';

    // ユーザーが入力した桁数と制限時間を取得
    const digits = parseInt(document.getElementById('digits').value);
    const timeLimit = parseInt(document.getElementById('timeLimit').value);

    // エラーチェック
    if (isNaN(digits) || digits <= 0 || digits > 10) {
        alert('桁数は1から10の間で入力してください。');
        return;
    }
    if (isNaN(timeLimit) || timeLimit <= 0) {
        alert('制限時間は1秒以上で入力してください。');
        return;
    }

    // 秘密の数字を生成
    const secretNumber = generateSecretNumber(digits);
    let startTime = Date.now();
    let timerInterval;

    // ゲームエリアを表示し、ヒントや入力エリア、結果表示を初期化
    document.getElementById('gameArea').style.display = 'block';
    document.getElementById('hints').innerHTML = '';
    document.getElementById('inputArea').innerHTML = '';
    document.getElementById('result').innerHTML = '';

    // 入力フィールドを生成
    createInputFields(digits);

    // タイマーを1秒ごとに更新
    timerInterval = setInterval(() => {
        updateTimer(timeLimit, startTime, timerInterval, secretNumber);
    }, 1000);

    // 送信ボタンがクリックされたときにcheckGuess関数を呼び出すイベントリスナーを追加
    document.getElementById('submitButton').addEventListener('click', () => {
        checkGuess(digits, secretNumber, timerInterval);
    });
}

function createInputFields(digits) {
    // 指定された桁数分の入力フィールドを生成
    for (let i = 0; i < digits; i++) {
        const input = document.createElement('input');
        input.type = 'number';
        input.min = 0;
        input.max = 9;
        input.id = `input${i}`;
         input.value = 0; // デフォルト値を0に設定

        // keydownイベントリスナーを追加
        input.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowDown') {
                if (input.value === '0') {
                    input.value = '9';
                } else {
                    input.value = (parseInt(input.value) - 1 + 10) % 10;
                }
                event.preventDefault(); // デフォルトの動作を防ぐ
            } 
            else if (event.key === 'ArrowUp') {
                if (input.value === '9') {
                    input.value = '0';
                } else {
                    input.value = (parseInt(input.value) + 1) % 10;
                }
                event.preventDefault(); // デフォルトの動作を防ぐ
            }
        });
        
        document.getElementById('inputArea').appendChild(input);
    }
}
document.getElementById('retryButton').addEventListener('click', () => {
    // ゲームエリアを非表示にして初期状態に戻す
    document.getElementById('gameArea').style.display = 'none';
    document.getElementById('retryButton').style.display = 'none';
    document.getElementById('startButton').style.display = 'block';
    // submitButtonを再表示して有効にする
    document.getElementById('submitButton').style.display = 'block';
    document.getElementById('submitButton').disabled = false; // ボタンを有効にする
    // submitButtonのスタイルを再設定
    submitButton.style.margin = '10px auto 0 auto'; // 上に20pxのマージンを追加
    submitButton.style.textAlign = 'center';
    // submitButtonのイベントリスナーを再設定
    document.getElementById('submitButton').removeEventListener('click', checkGuessHandler); // 古いイベントリスナーを削除
    document.getElementById('submitButton').addEventListener('click', checkGuessHandler); // 新しいイベントリスナーを追加
});

function updateTimer(timeLimit, startTime, timerInterval, secretNumber) {
    // 経過時間と残り時間を計算
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    const remainingTime = timeLimit - elapsedTime;
    document.getElementById('timer').textContent = `Time limit: ${remainingTime}seconds`;

    // 制限時間を超えた場合の処理
    if (remainingTime <= 0) {
        clearInterval(timerInterval);
        document.getElementById('result').textContent = "Time's up! Game over!";
        document.getElementById('submitButton').disabled = true;
        document.getElementById('submitButton').style.display = 'none'; // submitButtonを非表示にする
        document.getElementById('retryButton').style.display = 'block'; // もう一度プレイするボタンを表示
    }

    // ヒントを表示
    displayHints(remainingTime, secretNumber);
}

function displayHints(remainingTime, secretNumber) {
    const hints = document.getElementById('hints');
    hints.innerHTML = '';
    const digits = secretNumber.length;
    const timeLimit = parseInt(document.getElementById('timeLimit').value);
    const hintInterval = Math.floor(timeLimit / digits); // ヒントを出す間隔を計算し、切り捨て

    // 残り時間に応じてヒントを表示
    for (let i = 0; i < digits; i++) {
        const hintTime = timeLimit - hintInterval * (i + 1);
        if (remainingTime <= hintTime) {
            hints.innerHTML += `Tip.${i + 1}: ${secretNumber[i]} (No.${i + 1} of digits)<br>`;
        }
    }
}

function checkGuess(digits, secretNumber, timerInterval) {
    const userGuess = [];
    // ユーザーの入力を取得
    for (let i = 0; i < digits; i++) {
        userGuess.push(parseInt(document.getElementById(`input${i}`).value));
    }

    let hitCount = 0;
    let blowCount = 0;

    // ユーザーの入力と秘密の数字を比較
    for (let i = 0; i < digits; i++) {
        if (userGuess[i] === secretNumber[i]) {
            hitCount++;
        } else if (secretNumber.includes(userGuess[i])) {
            blowCount++;
        }
    }

    // 結果を表示
    if (hitCount === digits) {
        clearInterval(timerInterval);
        document.getElementById('result').textContent = 'すべての数字が合致しました！ゲームクリア！';
        document.getElementById('submitButton').style.display = 'none'; // submitButtonを非表示にする
        document.getElementById('retryButton').style.display = 'block';
    } else if (hitCount >= 1) {
        document.getElementById('result').textContent = `${hitCount}個の数字が順番も含めて当たったよ！`;
    } else if (blowCount >= 1) {
        document.getElementById('result').textContent = `惜しい！順番が違うけど数字は合ってるのが${blowCount}個あるよ！`;
    } else {
        document.getElementById('result').textContent = "あってる数字がなかったよ、";
    }
}

function generateSecretNumber(digits) {
    const numbers = [];
    // 指定された桁数分のランダムな数字を生成
    while (numbers.length < digits) {
        const rand = Math.floor(Math.random() * 10);
        if (!numbers.includes(rand)) {
            numbers.push(rand);
        }
    }
    return numbers;
}
const bgm = document.getElementById('bgm');
        const playButton = document.getElementById('play');
        const pauseButton = document.getElementById('pause');

        playButton.addEventListener('click', () => {
            bgm.play();
        });

        pauseButton.addEventListener('click', () => {
            bgm.pause();
        });
document.getElementById('volumeControl').addEventListener('input', function(event) {
    var audio = document.getElementById('bgm');
    audio.volume = event.target.value / 100; // 音量を0から1の範囲に変換
});
document.getElementById('volumeControl').addEventListener('change', function(event) {
    var audio = document.getElementById('bgm');
    audio.volume = event.target.value / 100; // 音量を0から1の範囲に変換
});

