// Pictures for the Study Hub practice sets (original illustrations).
(function () {
  const K = window.SCENE_KIT, D = window.defScene;
  D('p_typing', 'An office. A woman sits at a desk and types on a laptop. A plant stands beside the desk and a window is behind her.',
    [K.office(), K.window(40, 40), K.desk(150, 140), K.laptop(200, 140), K.cup(260, 140), K.chair(110), K.person(130, 200, { pose: 'sit', arm: 'type', shirt: '#C2255C', long: true, skin: '#D9A06B' }), K.plant(340)]);
  D('p_ladder', 'A man in a hard hat stands on a ladder and reaches up to a light near the ceiling. A toolbox is on the floor.',
    [K.room('#EAE6DF', '#BFB3A0'), '<rect x="222" y="22" width="70" height="10" rx="3" fill="#F4F4F4" stroke="#999"/>', K.ladder(200, 200, 130), K.person(232, 168, { arm: 'up', shirt: '#F77F00', hat: '#FFD166', skin: '#A86B3C' }), K.box(80, 200, 50, 24, '#D04A4A')]);
  D('p_boxes', 'A warehouse. Boxes are stacked on a cart. Shelves full of goods stand in the background. No people are in the picture.',
    [K.warehouse(), K.shelf(20, 205, 130, 160), K.shelf(250, 205, 130, 160), K.cart(160, 205, 90), K.box(168, 183, 36, 28), K.box(206, 183, 36, 28), K.box(186, 155, 36, 28)]);
  D('p_meeting', 'A meeting room. Three people sit around a table with papers on it. A woman points at a whiteboard on the wall.',
    [K.office(), K.whiteboard(250, 40, 120, 70), K.table(60, 150, 170), K.papers(90, 150), K.papers(160, 150), K.person(80, 200, { pose: 'sit', arm: 'hold', shirt: '#3D5A80', skin: '#F2C8A0', face: 1 }), K.person(210, 200, { pose: 'sit', arm: 'hold', shirt: '#2A9D8F', face: -1, skin: '#7A4A2A' }), K.person(300, 200, { arm: 'point', shirt: '#6A4FB3', long: true, face: 1, skin: '#E8B98F' })]);
  D('p_watering', 'A garden. A man waters plants with a watering can. A bench and a tree are behind him.',
    [K.outdoor(), K.tree(330), K.bench(220), K.flowers(70, 200), K.flowers(130, 200), K.person(170, 210, { arm: 'forward', shirt: '#E63946', face: -1, skin: '#D9A06B' }), K.can(104, 142), '<g fill="#4A9BD0"><circle cx="158" cy="150" r="2"/><circle cx="152" cy="160" r="2"/><circle cx="160" cy="166" r="2"/><circle cx="154" cy="176" r="2"/></g>'.replace(/158|152|160|154/g,m=>String(+m-4))]);
  D('p_bus', 'A street. People wait at a bus stop while a bus arrives. One woman holds an umbrella.',
    [K.street(), K.sign(8, 40, 'BUS STOP'), '<line x1="18" y1="64" x2="18" y2="178" stroke="#555" stroke-width="4"/>', K.bus(200, 228), K.person(90, 180, { shirt: '#3D5A80', skin: '#F2C8A0', item: 'bag' }), K.person(145, 180, { arm: 'up', shirt: '#C2255C', long: true, skin: '#A86B3C' }), K.umbrella(156, 44, '#4A7BD0')]);
  D('p_shop', 'A shop counter. A customer hands a bag to a cashier. Shelves with products are on the wall behind them.',
    [K.room('#F5EDE0', '#C9B79C'), K.shelf(20, 150, 130, 110, 2), K.person(170, 200, { shirt: '#2A9D8F', arm: 'forward', face: 1, skin: '#E8B98F' }), K.counter(110, 140, 150), K.person(320, 200, { arm: 'forward', face: -1, shirt: '#E8A33D', long: true, skin: '#7A4A2A' }), '<rect x="262" y="102" width="22" height="24" rx="3" fill="#8B5A2B"/><path d="M266 102 Q273 92 280 102" fill="none" stroke="#5E3C1C" stroke-width="2"/>']);
})();
