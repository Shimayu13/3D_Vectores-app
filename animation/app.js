// created by kotori

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// xyz軸を表示するためのAxesHelper
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

let vectors = [];
let vectorIndex = 0;
let arrowHelper;
const vectorInfo = document.getElementById('vector-info');

camera.position.z = 14;

// ローカルストレージから選択されたCSVファイル名を取得
const selectedCSV = localStorage.getItem('selectedCSV');

if (!selectedCSV) {
  console.error('CSVファイルが選択されていません');
  alert('CSVファイルが選択されていません。トップページに戻ります。');
  window.location.href = 'index.html'; // トップページにリダイレクト
} else {
  console.log('選択されたCSVファイル:', selectedCSV);

  // CSVファイルを読み込む
  fetch(selectedCSV)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status}`);
      }
      return response.text();
    })
    .then(data => {
      // CSVデータをパース
      vectors = data.split('\n').map(line => {
        const [t, x, y, z] = line.split(',').map(Number);
        return { t, vector: new THREE.Vector3(x, y, z-9.8) };
      });

      // 最初のベクトルを表示
      if (vectors.length > 0) {
        arrowHelper = new THREE.ArrowHelper(
          vectors[vectorIndex].vector.clone().normalize(),
          new THREE.Vector3(0, 0, 0),
          vectors[vectorIndex].vector.length(),
          0xffff00
        );
        scene.add(arrowHelper);
      }

      // アニメーション開始
      animate();
    })
    .catch(error => {
      console.error('CSVファイルの読み込み中にエラーが発生しました:', error);
      alert('データの読み込みに失敗しました。トップページに戻ります。');
      window.location.href = '../index.html';
    });
}

// ベクトル情報を表示する関数
function updateVectorInfo(vector) {
  const magnitude = Math.sqrt(vector.vector.x ** 2 + vector.vector.y ** 2 + vector.vector.z ** 2);
  vectorInfo.innerText = `t: ${vector.t}\nx: ${vector.vector.x}\ny: ${vector.vector.y}\nz: ${vector.vector.z}\nMagnitude: ${magnitude}`;
}

// レンダリングループ
function animate() {
  requestAnimationFrame(animate);

  // ベクトルの更新
  if (vectors.length > 0) {
    vectorIndex = (vectorIndex + 1) % vectors.length;
    arrowHelper.setDirection(vectors[vectorIndex].vector.clone().normalize());
    arrowHelper.setLength(vectors[vectorIndex].vector.length());

    // ベクトル情報を更新
    updateVectorInfo(vectors[vectorIndex]);
  }

  renderer.render(scene, camera);
}

// 0.1秒ごとにベクトルを更新
setInterval(() => {
  if (vectors.length > 0) {
    vectorIndex = (vectorIndex + 1) % vectors.length;
    arrowHelper.setDirection(vectors[vectorIndex].vector.clone().normalize());
    arrowHelper.setLength(vectors[vectorIndex].vector.length());

    // ベクトル情報を更新
    updateVectorInfo(vectors[vectorIndex]);
  }
}, 2000);

animate();