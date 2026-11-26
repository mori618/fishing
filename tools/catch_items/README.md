# 釣れるもの（魚以外）の追加

| ファイル | 役割 |
|---|---|
| `list.csv` | シート「釣れるもの 追加一覧」の内容（系統・名前・状態・番号）。ここを直して再生成する |
| `build.js` | `node tools/catch_items/build.js` で `data/catchItems.js` と `gpt_prompts.md` を作り直す |
| `gpt_prompts.md` | ChatGPTで作る分（状態が「ChatGPT〜」のもの）のプロンプト |
| `import_images.py` | 画像の取り込み。`python3 tools/catch_items/import_images.py <画像フォルダ>` |

## ルール
- **画像ID** = 番号。同じ番号が2つ目以降に出てくる行は `b, c, d…` を付ける（例: 巨大ロボの体 = `c02_19b`、金の斧 = `c07_05b`）
- **ランク** = 番号の下2桁: 00〜05→D / 06〜09→C / 10〜13→B / 14〜17→A / 18〜19→S。パワー・売値・釣れやすさもここから自動で決まる
- 「不採用」の行は入れない。タイ・マグロは既存の魚と同じなので、画像だけ既存の魚（fish_b1 / fish_a1）に使う
- 画像は `images/catch/<画像ID>.webp`（256px・透過）。`data/catchImages.js` に載っているIDだけ画像を表示し、ほかは系統アイコンの仮画像を出す
- 画像ファイル名は先頭が画像IDならOK（`c00_00_B.png` のような案の印が付いていても読める）
