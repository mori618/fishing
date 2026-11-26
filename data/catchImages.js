// ========================================
// 釣れるものの画像がそろっているかの一覧
// 画像は images/catch/<画像ID>.webp に置き、ここにIDを足すと図鑑・釣果カードに表示される。
// ここに無いIDは、系統アイコンの仮画像で表示される（404を出さないため）。
// 画像の取り込みは tools/catch_items/import_images.py が自動でここを書き換える。
// ========================================
window.CATCH_IMAGE_DIR = 'images/catch/';
window.CATCH_IMAGE_EXT = '.webp';
window.CATCH_IMAGE_READY = [
];
