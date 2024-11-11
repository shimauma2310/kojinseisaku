// スタートボタンがクリックされたときにstartGame関数を呼び出すイベントリスナーを追加
document.getElementById('startButton').addEventListener('click', startGame);

let startTime;
let hintTypes = []; // 各桁ごとのヒントの種類を保持する配列
let sumHintDisplayed = false; // 合計ヒントが表示されたかどうかを保持するフラグ
let hintDisplayed = []; // 各桁ごとのヒントが表示されたかどうかを保持する配列
/**
 * ゲームを開始する関数
 * ユーザーが入力した桁数と制限時間を取得し、ゲームを初期化する
 */
function startGame() {
    // ユーザーが入力した桁数と制限時間を取得
    const digits = parseInt(document.getElementById('digits').value);
    const timeLimit = parseInt(document.getElementById('timeLimit').value);

    // エラーチェック
    if (isNaN(digits) || digits <= 0 || digits > 10) {
        alert('桁数は1から10の間で入力してください。');
        return;
    }
     if (isNaN(timeLimit) || timeLimit <= 0 || timeLimit >300) {
        alert('制限時間は1秒以上且つ300秒以下で入力してください。');
        return;
    }
   
    // 開始ボタンを非表示にする
    document.getElementById('startButton').style.display = 'none';

    // 秘密の数字を生成
    const secretNumber = generateSecretNumber(digits);
    startTime = Date.now(); // ゲームの開始時間を記録

    // デバッグ用に秘密の数字をコンソールに表示
    console.log(`Secret Number: ${secretNumber.join('')}`);

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

    // ヒントの種類を初期化
    hintTypes = new Array(digits).fill(null);
    hintDisplayed = new Array(digits).fill(false);
    sumHintDisplayed = false; // 合計ヒント表示フラグを初期化
    
    // 合計ヒントを表示
    const sumHint = displaySumHint(secretNumber);
    document.getElementById('hints').innerHTML += `${sumHint}<br>`;
    sumHintDisplayed = true; // 合計ヒント表示フラグを更新
 

    // エンターキーが押されたときにsubmitButtonをクリックするイベントリスナーを追加
    document.addEventListener('keydown', function(event) {
        if (event.code === 'Enter') {
            event.preventDefault(); // デフォルトのスペースキーの動作を防ぐ
            document.getElementById('submitButton').click(); // submitButtonをクリック
        }
    });
}

/**
 * 指定された桁数分の入力フィールドを生成する関数
 * @param {number} digits - 入力フィールドの数
 */
function createInputFields(digits) {
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
            } else if (event.key === 'ArrowUp') {
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
// もう一度プレイするボタンがクリックされたときの処理
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

/**
 * タイマーを更新し、制限時間を超えた場合の処理を行う関数
 * @param {number} timeLimit - 制限時間
 * @param {number} startTime - ゲームの開始時間
 * @param {number} timerInterval - タイマーのインターバルID
 * @param {Array} secretNumber - 秘密の数字の配列
 */
function updateTimer(timeLimit, startTime, timerInterval, secretNumber) {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    const remainingTime = timeLimit - elapsedTime;
    document.getElementById('timer').textContent = `Time limit: ${remainingTime} seconds`;

    if (remainingTime <= 0) {
        clearInterval(timerInterval);
        document.getElementById('result').textContent = "Time's up! Game over!";
        document.getElementById('submitButton').disabled = true;
        document.getElementById('submitButton').style.display = 'none';
        document.getElementById('retryButton').style.display = 'block';
    }

    displayHints(remainingTime, secretNumber);
}
/**
 * 指定された桁の数字が特定の範囲内にあることを示すヒントを生成する関数
 * @param {Array} secretNumber - 秘密の数字の配列
 * @param {number} index - ヒントを生成する桁のインデックス
 * @returns {string} - 数字が特定の範囲内にあることを示すヒントの文字列
 */
function displayRangeHint(secretNumber, index) {
    const rangeStart = Math.max(0, secretNumber[index] - 2);
    const rangeEnd = Math.min(9, secretNumber[index] + 2);
    return `ヒント${index + 1}: この桁の数字は${rangeStart}から${rangeEnd}の間です`;
}

/**
 * 指定された桁の数字が偶数か奇数かを示すヒントを生成する関数
 * @param {Array} secretNumber - 秘密の数字の配列
 * @param {number} index - ヒントを生成する桁のインデックス
 * @returns {string} - 偶数か奇数かを示すヒントの文字列
 */
function displayEvenOddHint(secretNumber, index) {
    const isEven = secretNumber[index] % 2 === 0;
    return `ヒント${index + 1}: この桁の数字は${isEven ? '偶数' : '奇数'}です`;
}

/**
 * 秘密の数字全体の合計を示すヒントを生成する関数
 * @param {Array} secretNumber - 秘密の数字の配列
 * @returns {string} - 数字の合計を示すヒントの文字列
 */
function displaySumHint(secretNumber) {
    const sum = secretNumber.reduce((acc, num) => acc + num, 0);
    return `全ての桁の数字の合計は${sum}です`;
}

/**
 * 残り時間に応じてヒントを表示する関数
 * @param {number} remainingTime - 残り時間
 * @param {Array} secretNumber - 秘密の数字の配列
 */
function displayHints(remainingTime, secretNumber) {
    const hints = document.getElementById('hints');
    
    const digits = secretNumber.length;
    const timeLimit = parseInt(document.getElementById('timeLimit').value);
    const hintInterval = Math.floor(timeLimit / digits);

    for (let i = 0; i < digits; i++) {
        const hintTime = timeLimit - hintInterval * (i + 1);
        if (remainingTime <= hintTime && !hintDisplayed[i]) {
            if (hintTypes[i] === null) {
                // ヒントの種類をランダムに選択し、配列に保存
                hintTypes[i] = Math.floor(Math.random() * 2); // 合計ヒントは一度だけ表示するので、ランダム選択の範囲を2に変更
            }
            let hint;
            switch(hintTypes[i]) {
                case 0:
                    hint = displayRangeHint(secretNumber, i);
                    break;
                case 1:
                    hint = displayEvenOddHint(secretNumber, i);
                    break;
            }
            hints.innerHTML += `${hint}<br>`;
            hintDisplayed[i] = true; // ヒントが表示されたことを記録
        }
    }
}


/**
 * ユーザーの入力をチェックし、結果を表示する関数
 * @param {number} digits - 入力フィールドの数
 * @param {Array} secretNumber - 秘密の数字の配列
 * @param {number} timerInterval - タイマーのインターバルID
 */
function checkGuess(digits, secretNumber, timerInterval) {
    const userGuess = [];
    // ユーザーの入力を取得
    for (let i = 0; i < digits; i++) {
        userGuess.push(parseInt(document.getElementById(`input${i}`).value));
    }

    console.log(`User guess: ${userGuess}`);

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

    console.log(`Hit count: ${hitCount}, Blow count: ${blowCount}`);

    // 結果を表示
    if (hitCount === digits) {
        clearInterval(timerInterval);
        const endTime = Date.now(); // ゲームクリア時にタイマーを停止
        const clearTime = (endTime - startTime) / 1000; // クリアタイムを計算
        console.log(`Game ended at: ${endTime}`);
        console.log(`Clear time: ${clearTime.toFixed(2)} seconds`);
        document.getElementById('result').textContent = `すべての数字が合致しました！ゲームクリア！クリアタイム: ${clearTime.toFixed(2)} 秒`; // クリアタイムを表示
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

/**
 * 指定された桁数分のランダムな秘密の数字を生成する関数
 * @param {number} digits - 秘密の数字の桁数
 * @returns {Array} - 生成された秘密の数字の配列
 */
function generateSecretNumber(digits) {
    const numbers = [];
    // 指定された桁数分のランダムな数字を生成
    while (numbers.length < digits) {
        const rand = Math.floor(Math.random() * 10);
        numbers.push(rand);
    }
    return numbers;
}
const bgm = document.getElementById('bgm');
const playButton = document.getElementById('play');
const pauseButton = document.getElementById('pause');

// BGMの再生ボタンがクリックされたときの処理
playButton.addEventListener('click', () => {
    bgm.play();
});

// BGMの一時停止ボタンがクリックされたときの処理
pauseButton.addEventListener('click', () => {
    bgm.pause();
});

// 音量コントロールの変更時の処理
document.getElementById('volumeControl').addEventListener('input', function (event) {
    var audio = document.getElementById('bgm');
    audio.volume = event.target.value / 100;
});

