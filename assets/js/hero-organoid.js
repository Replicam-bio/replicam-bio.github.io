/* Replicam — living organoid hero (WebGL)
   A brain-organoid slice, gradient-mapped on Event Horizon. data-mode on the hero section:
   · calm:    breathing + living shimmer
   · alive:   + sparse cells firing and periodic network bursts across the slice
   · insight: + a symbolic data layer (connectivity map, signal trace, focus brackets) on .org-data
   Shows a still placeholder on the first paint, pauses off-screen, still frame for reduced motion,
   falls back to the plain image without WebGL. */
(function () {
  var hero = document.querySelector('[data-organoid]');
  if (!hero) return;
  var glc = hero.querySelector('.org-gl'), dtc = hero.querySelector('.org-data'), fallback = hero.querySelector('.org-fallback');
  // still frame for reduced motion, and inside the page-switch preview card (the real page animates once it arrives)
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('pt-preview');
  var DPR = Math.min(window.devicePixelRatio || 1, 1.75);
  var IMG_ASPECT = 1321 / 1189;                // updated from the image itself once loaded
  /* bright cell bodies picked from the slice: [x, y, neighbour indices], image-relative */
  var NODES = [[0.0818,0.7306,[178,58,53]],[0.5758,0.202,[170,132,12,26]],[0.3818,0.5017,[110,80,102,8]],[0.4394,0.1852,[60,175,23,133]],[0.6909,0.1886,[30,20,31,11]],[0.2636,0.1987,[117,121,24,156]],[0.1182,0.5758,[29,57,67,81]],[0.4636,0.1077,[23,210,35,43]],[0.3485,0.4545,[136,89,80,2]],[0.1909,0.4781,[55,95,61,28]],[0.297,0.1414,[59,62,24,179]],[0.6636,0.1481,[30,104,4,12]],[0.6152,0.1751,[26,30,1,69]],[0.7424,0.2727,[86,78,109,20]],[0.1394,0.4478,[28,189,55,141]],[0.1212,0.5084,[57,28,48,141]],[0.397,0.1044,[35,17,7,23]],[0.3576,0.1077,[16,59,35,10]],[0.7848,0.3064,[64,78,188,13]],[0.3667,0.2189,[207,164,143,27]],[0.7121,0.229,[31,86,4,85]],[0.3333,0.3131,[46,42,171,143]],[0.4333,0.468,[94,150,80,102]],[0.4545,0.1448,[7,3,175,133]],[0.2606,0.1481,[115,10,131,5]],[0.5455,0.1515,[170,54,69,186]],[0.6242,0.202,[12,30,132,1]],[0.3182,0.2088,[62,40,117,19]],[0.1394,0.4781,[14,15,95,141]],[0.0909,0.5892,[6,144,36,57]],[0.6515,0.1852,[26,11,12,4]],[0.7333,0.2054,[20,86,4,49]],[0.5242,0.2761,[50,99,63,77]],[0.1909,0.2862,[138,56,39,73]],[0.1818,0.404,[75,125,55,162]],[0.4182,0.0774,[16,7,17,23]],[0.103,0.6397,[82,53,52,29]],[0.6636,0.6734,[72,92,38,112]],[0.6606,0.7205,[112,37,151,92]],[0.2121,0.2424,[116,121,138,33]],[0.3061,0.2458,[117,27,41,46]],[0.2727,0.266,[157,87,117,40]],[0.3576,0.3333,[21,190,51,171]],[0.5212,0.0909,[54,210,7,25]],[0.6576,0.2593,[85,124,126,109]],[0.4515,0.2626,[79,99,71,164]],[0.3152,0.2896,[21,157,40,171]],[0.3273,0.532,[89,204,134,2]],[0.1545,0.5387,[81,95,57,15]],[0.7333,0.1549,[70,31,4,142]],[0.5242,0.2424,[32,186,99,77]],[0.3848,0.367,[190,42,91,74]],[0.1424,0.6599,[82,36,111,58]],[0.0697,0.6667,[178,36,58,0]],[0.5242,0.1212,[43,25,133,210]],[0.1788,0.4478,[9,14,34,61]],[0.2152,0.3232,[73,33,87,125]],[0.1121,0.5387,[15,6,48,114]],[0.1152,0.7037,[0,52,193,178]],[0.3152,0.1111,[10,179,17,62]],[0.4091,0.1818,[3,207,19,164]],[0.2212,0.4411,[162,55,9,34]],[0.3121,0.1785,[27,10,5,117]],[0.5,0.3199,[88,65,99,32]],[0.7576,0.3266,[188,18,120,13]],[0.4667,0.3401,[66,79,63,74]],[0.4606,0.3704,[65,74,88,79]],[0.1485,0.596,[81,82,6,111]],[0.197,0.1111,[131,123,194,127]],[0.5818,0.1279,[152,25,12,54]],[0.7667,0.1549,[49,84,31,142]],[0.4091,0.2727,[164,45,190,143]],[0.6727,0.6431,[37,92,184,201]],[0.1758,0.3367,[75,56,33,125]],[0.4273,0.3401,[190,79,65,66]],[0.1727,0.3737,[34,73,125,90]],[0.5879,0.4276,[183,105,173,167]],[0.5697,0.2559,[93,132,126,50]],[0.7818,0.2694,[18,86,13,64]],[0.4515,0.3064,[65,74,45,99]],[0.4,0.4714,[2,22,136,8]],[0.1576,0.569,[67,48,6,82]],[0.1394,0.6229,[67,52,36,111]],[0.5394,0.7374,[169,203]],[0.7848,0.1886,[70,31,86,49]],[0.6667,0.2323,[44,30,20,4]],[0.7515,0.2424,[13,31,78,20]],[0.2485,0.2896,[157,41,160,56]],[0.5091,0.3603,[135,63,65,66]],[0.3212,0.4949,[47,118,8,2]],[0.1364,0.3704,[75,189,73,34]],[0.4091,0.4108,[136,51,94,80]],[0.6939,0.6667,[98,72,37,112]],[0.5818,0.2828,[77,126,146,132]],[0.4485,0.4411,[22,150,91,80]],[0.1697,0.5017,[9,48,28,15]],[0.4939,0.5185,[174,187,107,150]],[0.4636,0.6195,[119,108,203,174]],[0.7182,0.6835,[92,103,112,201]],[0.4909,0.2761,[32,63,45,50]],[0.6394,0.4074,[101,182,183,106]],[0.6576,0.3838,[100,161,182,106]],[0.4212,0.5286,[110,2,150,174]],[0.7455,0.7003,[98,176,112,92]],[0.6485,0.1077,[152,11,159,69]],[0.5545,0.4007,[173,76,135,128]],[0.6758,0.4276,[165,100,101,198]],[0.5364,0.5354,[200,155,205,213]],[0.4424,0.6633,[119,97,192,203]],[0.703,0.2997,[147,13,124,120]],[0.3909,0.532,[2,102,204,80]],[0.1788,0.6263,[82,67,52,163]],[0.6939,0.7104,[98,38,92,37]],[0.3303,0.3906,[140,171,136,42]],[0.0758,0.5118,[57,141,15,144]],[0.2273,0.1616,[156,127,24,131]],[0.1879,0.2256,[39,181,138,206]],[0.2758,0.229,[5,41,121,40]],[0.2848,0.4747,[89,199,8,47]],[0.4758,0.6465,[97,108,203]],[0.7242,0.3535,[139,64,149,147]],[0.2424,0.2357,[39,117,5,41]],[0.2576,0.3872,[162,140,125,160]],[0.1576,0.138,[127,68,181,115]],[0.6576,0.2896,[44,147,148,109]],[0.2091,0.3771,[162,75,34,56]],[0.6091,0.2761,[93,132,77,146]],[0.1939,0.165,[156,115,181,123]],[0.5788,0.3502,[135,146,182,105]],[0.7303,0.596,[201,208,211,184]],[0.7758,0.4242,[149,166,172,188]],[0.2303,0.1145,[180,68,115,24]],[0.597,0.2357,[77,1,126,26]],[0.4939,0.165,[175,23,186,54]],[0.2788,0.569,[199,202,47,163]],[0.5455,0.3502,[128,88,146,105]],[0.3758,0.4242,[91,8,80,51]],[0.6303,0.6061,[185,184,158,72]],[0.1697,0.2525,[206,116,33,39]],[0.7061,0.3805,[120,101,149,165]],[0.2939,0.4007,[113,122,171,162]],[0.097,0.468,[28,15,114,14]],[0.7273,0.0943,[159,49,70]],[0.3606,0.2727,[21,46,71,19]],[0.0727,0.5623,[29,57,114,6]],[0.2606,0.6397,[163,177,134]],[0.5758,0.3131,[93,128,135,126]],[0.6818,0.3199,[109,161,124,148]],[0.6424,0.3266,[161,124,147,182]],[0.7545,0.3872,[188,130,120,139]],[0.4545,0.4916,[22,174,94,96]],[0.6121,0.6835,[169,37,38,72]],[0.6152,0.1111,[104,69,12,11]],[0.6818,0.4815,[212,168,198,165]],[0.7939,0.5421,[208,172]],[0.5667,0.5488,[205,107,209,213]],[0.2182,0.1886,[115,127,116,5]],[0.2758,0.2963,[160,41,87,46]],[0.6364,0.5724,[137,195,184,209]],[0.7,0.0774,[142,104,11]],[0.2758,0.3266,[157,171,87,46]],[0.6636,0.3468,[148,147,101,182]],[0.2333,0.404,[122,125,61,34]],[0.2303,0.6162,[145,202,111,134]],[0.4061,0.2424,[71,19,45,143]],[0.7091,0.4377,[166,106,196,153]],[0.7364,0.4444,[165,196,172,130]],[0.6121,0.4781,[191,198,183,213]],[0.6939,0.5253,[195,212,153,196]],[0.5667,0.7071,[83,151,203]],[0.5485,0.1852,[186,25,1,50]],[0.3121,0.3401,[21,160,46,42]],[0.7697,0.4747,[196,166,130,154]],[0.5394,0.4343,[105,76,187,88]],[0.4697,0.5354,[96,150,102,200]],[0.4727,0.1852,[133,3,23,186]],[0.7758,0.6667,[211,103,98,201]],[0.2424,0.6869,[145,163]],[0.0606,0.7104,[0,53,58,36]],[0.2879,0.0842,[180,59,10,131]],[0.2545,0.0909,[131,179,194,24]],[0.1667,0.202,[116,206,127,138]],[0.6242,0.3737,[100,101,148,161]],[0.6152,0.4377,[76,198,100,167]],[0.6606,0.5993,[137,158,72,195]],[0.6,0.6027,[137,158,209,205]],[0.5273,0.2054,[170,50,1,133]],[0.5091,0.4781,[96,173,150,107]],[0.7788,0.3535,[64,149,18,120]],[0.1273,0.4108,[14,90,34,75]],[0.3939,0.3232,[74,42,51,71]],[0.6242,0.5118,[212,167,209,198]],[0.4152,0.7172,[108]],[0.1606,0.7306,[58,52]],[0.2242,0.0673,[180,131,68,179]],[0.6636,0.5522,[158,212,168,184]],[0.7303,0.4848,[166,172,165,153]],[0.3576,0.6094,[204,47]],[0.6394,0.4579,[183,167,106,100]],[0.2515,0.5253,[202,134,118,9]],[0.5242,0.5657,[205,107,155,96]],[0.7121,0.6263,[129,92,72,98]],[0.2273,0.5589,[199,163,134,81]],[0.5061,0.6734,[119,108,97,83]],[0.3545,0.5657,[197,47,110,2]],[0.5515,0.5724,[155,200,107,209]],[0.1485,0.2323,[138,181,116,39]],[0.3758,0.1886,[19,60,164,27]],[0.7788,0.5758,[154,211,129]],[0.6,0.5455,[155,191,213,158]],[0.4909,0.0774,[43,7,54,23]],[0.7818,0.633,[176,208,129,201]],[0.6545,0.5152,[191,195,168,153]],[0.5727,0.5084,[155,209,107,167]]];
  /* slice outline: [x, y, outward-normal-x, outward-normal-y], image-relative */
  var EDGE = [[0.3227,0.0202,-0.11,-0.994],[0.3364,0.0202,-0.0,-1.0],[0.35,0.0202,0.055,-0.998],[0.3864,0.0202,-0.174,-0.985],[0.4,0.0202,-0.055,-0.998],[0.4136,0.0202,0.217,-0.976],[0.2727,0.0253,-0.156,-0.988],[0.2864,0.0253,-0.105,-0.995],[0.3,0.0253,-0.053,-0.999],[0.3136,0.0253,-0.156,-0.988],[0.35,0.0253,0.1,-0.995],[0.3636,0.0253,0.05,-0.999],[0.3773,0.0253,-0.148,-0.989],[0.4318,0.0253,0.243,-0.97],[0.2591,0.0303,-0.232,-0.973],[0.2727,0.0303,-0.141,-0.99],[0.4455,0.0303,0.222,-0.975],[0.4591,0.0303,0.148,-0.989],[0.2409,0.0354,-0.291,-0.957],[0.2545,0.0354,-0.204,-0.979],[0.4727,0.0354,0.087,-0.996],[0.4864,0.0354,0.091,-0.996],[0.5,0.0354,0.048,-0.999],[0.2273,0.0404,-0.385,-0.923],[0.5091,0.0404,0.135,-0.991],[0.5227,0.0404,0.254,-0.967],[0.2182,0.0455,-0.431,-0.902],[0.5273,0.0455,0.33,-0.944],[0.5409,0.0455,0.381,-0.925],[0.5409,0.0505,0.388,-0.922],[0.5545,0.0505,0.298,-0.954],[0.6182,0.0505,-0.0,-1.0],[0.2,0.0556,-0.555,-0.832],[0.5545,0.0556,0.254,-0.967],[0.5682,0.0556,0.105,-0.995],[0.5818,0.0556,-0.05,-0.999],[0.5955,0.0556,-0.135,-0.991],[0.6091,0.0556,-0.124,-0.992],[0.6364,0.0556,0.233,-0.972],[0.1955,0.0606,-0.563,-0.826],[0.65,0.0606,0.27,-0.963],[0.6636,0.0606,0.179,-0.984],[0.6864,0.0606,-0.048,-0.999],[0.7,0.0606,-0.0,-1.0],[0.1909,0.0657,-0.611,-0.791],[0.6727,0.0657,0.043,-0.999],[0.7091,0.0657,0.124,-0.992],[0.7227,0.0657,0.303,-0.953],[0.1864,0.0707,-0.654,-0.757],[0.7318,0.0707,0.342,-0.94],[0.1773,0.0758,-0.648,-0.762],[0.7455,0.0758,0.447,-0.894],[0.1773,0.0808,-0.69,-0.724],[0.7591,0.0808,0.507,-0.862],[0.7591,0.0859,0.521,-0.853],[0.1682,0.0909,-0.707,-0.707],[0.7727,0.0909,0.543,-0.84],[0.7727,0.096,0.555,-0.832],[0.1591,0.101,-0.74,-0.673],[0.7864,0.101,0.486,-0.874],[0.7864,0.1061,0.482,-0.876],[0.15,0.1111,-0.759,-0.651],[0.8045,0.1111,0.388,-0.922],[0.8045,0.1162,0.342,-0.94],[0.8182,0.1162,0.33,-0.944],[0.8182,0.1212,0.303,-0.953],[0.8318,0.1212,0.287,-0.958],[0.1409,0.1263,-0.854,-0.52],[0.8455,0.1263,0.316,-0.949],[0.85,0.1313,0.362,-0.932],[0.8636,0.1313,0.351,-0.936],[0.8636,0.1364,0.333,-0.943],[0.1318,0.1414,-0.917,-0.399],[0.8818,0.1414,0.401,-0.916],[0.8864,0.1465,0.362,-0.932],[0.1273,0.1515,-0.931,-0.364],[0.9,0.1515,0.346,-0.938],[0.1273,0.1566,-0.923,-0.385],[0.9182,0.1566,0.287,-0.958],[0.1227,0.1616,-0.919,-0.394],[0.1227,0.1667,-0.926,-0.379],[0.1182,0.1768,-0.919,-0.394],[0.1182,0.1869,-0.94,-0.342],[0.1136,0.197,-0.973,-0.232],[0.1091,0.2121,-0.999,-0.05],[0.1091,0.2273,-0.999,0.053],[0.1091,0.2424,-0.998,-0.055],[0.1091,0.2576,-0.993,-0.117],[0.1091,0.2677,-0.983,-0.184],[0.1045,0.2828,-0.949,-0.316],[0.1,0.2929,-0.919,-0.394],[0.0955,0.303,-0.906,-0.423],[0.0955,0.3131,-0.936,-0.351],[0.0909,0.3232,-0.959,-0.282],[0.0864,0.3384,-0.973,-0.229],[0.0818,0.3485,-0.983,-0.184],[0.0818,0.3636,-0.973,-0.229],[0.0773,0.3737,-0.949,-0.316],[0.0773,0.3838,-0.954,-0.298],[0.0727,0.3939,-0.936,-0.351],[0.0636,0.4091,-0.919,-0.394],[0.0591,0.4192,-0.919,-0.394],[0.0545,0.4293,-0.906,-0.423],[0.05,0.4394,-0.936,-0.351],[0.05,0.4495,-0.925,-0.381],[0.0455,0.4596,-0.916,-0.401],[0.0409,0.4697,-0.894,-0.447],[0.0409,0.4798,-0.894,-0.447],[0.0364,0.4899,-0.904,-0.428],[0.0318,0.5,-0.922,-0.388],[0.0273,0.5101,-0.938,-0.346],[0.0227,0.5253,-0.958,-0.287],[0.0182,0.5354,-0.967,-0.254],[0.0182,0.5505,-0.982,-0.187],[0.0136,0.5606,-0.964,-0.268],[0.0136,0.5707,-0.949,-0.316],[0.0091,0.7121,-0.959,0.282],[0.0091,0.7273,-0.959,0.282],[0.0136,0.7374,-0.973,0.232],[0.0182,0.7475,-0.968,0.252],[0.0182,0.7626,-0.958,0.287],[0.0227,0.7727,-0.94,0.342],[0.0273,0.7828,-0.931,0.364],[0.0318,0.7929,-0.931,0.364],[0.0364,0.803,-0.923,0.385],[0.0364,0.8182,-0.928,0.371],[0.0409,0.8283,-0.949,0.316],[0.0455,0.8384,-0.944,0.33],[0.05,0.8485,-0.934,0.356],[0.0545,0.8586,-0.926,0.379],[0.0545,0.8737,-0.894,0.447],[0.0636,0.8788,-0.878,0.479],[0.0682,0.8889,-0.861,0.509],[0.0727,0.899,-0.871,0.492],[0.0773,0.9091,-0.879,0.476],[0.0818,0.9192,-0.844,0.537],[0.0864,0.9293,-0.832,0.555]];

  // ---------- mode (fixed per page) ----------
  var mode = hero.getAttribute('data-mode') || 'calm';
  var alive = mode === 'calm' ? 0 : 1, insight = mode === 'insight' ? 1 : 0;

  // ---------- still placeholder: the same image, placed, dimmed and feathered like the shader's first frame,
  // shown instantly so the hero never blanks while WebGL loads (e.g. when a page switch hands over) ----------
  var shown = false;                       // true while the live canvas is what the visitor sees
  function placeStill() {
    if (!fallback || shown) return;
    var st = fallback.style;
    st.left = rect.x + 'px'; st.top = rect.y + 'px'; st.width = rect.w + 'px'; st.height = rect.h + 'px';
    st.right = 'auto'; st.bottom = 'auto'; st.objectFit = 'fill'; st.opacity = '0.72';
    fallback.classList.add('is-still'); fallback.hidden = false;
    // the page ships a tiny inline copy that paints on the first frame; swap in the full image once decoded
    var full = fallback.getAttribute('data-full');
    if (full && !fallback.__full) {
      fallback.__full = true;
      var big = new Image(); big.src = full;
      (big.decode ? big.decode() : Promise.reject()).then(function () { fallback.src = full; }, function () { fallback.src = full; });
    }
  }
  function reveal() {                      // first WebGL frame is on the canvas: swap the still for the live hero
    if (shown) return; shown = true;
    hero.classList.add('is-ready');
    setTimeout(function () { if (fallback && shown) fallback.hidden = true; }, 320);
  }

  // ---------- layout: where the slice sits on screen ----------
  var W, H, rect = { x: 0, y: 0, w: 0, h: 0 };
  function layout() {
    W = hero.clientWidth; H = hero.clientHeight;
    var h, w, x, y;
    if (W >= 900) { h = H * 0.9; w = h * IMG_ASPECT; x = Math.max(W * 0.44, W - w * 0.88); y = H * 0.07; }  // right side, on black
    else { w = W * 1.15; h = w / IMG_ASPECT; x = W * 0.08; y = H * 0.09; }                                  // phone: top
    rect = { x: x, y: y, w: w, h: h };
    placeStill();
    [glc, dtc].forEach(function (c) { if (c) { c.width = Math.round(W * DPR); c.height = Math.round(H * DPR); } });
    if (dt) dt.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (gl) gl.viewport(0, 0, glc.width, glc.height);
  }

  // ---------- WebGL tissue ----------
  // inside the page-switch preview card the still image is enough: no WebGL work while the stack is moving
  var root = document.documentElement, preview = root.classList.contains('pt-preview');
  var gl = preview ? null : glc.getContext('webgl', { antialias: false, premultipliedAlpha: false, alpha: false });
  var dt = dtc ? dtc.getContext('2d') : null;
  // keep (or bring back) the still image whenever the live canvas can't be trusted
  function showStill() { shown = false; ready = false; hero.classList.remove('is-ready'); if (fallback) fallback.hidden = false; placeStill(); }
  function giveUp() { showStill(); glc.remove(); if (dtc) dtc.remove(); }
  layout();
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { layout(); if (reduce) draw(performance.now()); }, 120); });
  if (!gl) { giveUp(); return; }
  // the browser can drop the WebGL context (common on phones after backgrounding): fall back to the still image
  glc.addEventListener('webglcontextlost', function (e) {
    e.preventDefault(); showStill();
    if (dt) dt.clearRect(0, 0, W, H);
  });

  var VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var FS = [
    'precision highp float;',
    'uniform sampler2D T;uniform vec2 R;uniform vec4 Q;uniform float t,A,B,dpr;uniform vec2 O;',
    'const vec3 INK=vec3(31.,31.,31.)/255.;const vec3 CRYO=vec3(142.,238.,255.)/255.;',
    'float h1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
    'float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
    ' return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x),f.y);}',
    'float L(vec3 c){return dot(c,vec3(.299,.587,.114));}',
    'void main(){',
    ' vec2 px=vec2(gl_FragCoord.x,R.y-gl_FragCoord.y)/dpr;',
    ' float br=sin(t*6.28318/7.5);',                                   // breathing, 7.5 s cycle
    ' vec2 uv=(px-Q.xy)/Q.zw; uv=(uv-.5)/(1.+.011*br)+.5;',
    ' vec2 w=vec2(n2(uv*4.5+vec2(t*.05,0.)),n2(uv*4.5+vec2(5.2,t*.045)))-.5;',   // slow tissue drift
    ' vec2 w2=vec2(n2(uv*22.+vec2(t*.18,1.7)),n2(uv*22.+vec2(8.3,t*.16)))-.5;',  // cytoplasmic shimmer
    ' uv+=w*.0045+w2*.0011;',
    ' if(uv.x<0.||uv.y<0.||uv.x>1.||uv.y>1.){gl_FragColor=vec4(INK,1.);return;}',
    ' vec3 c=texture2D(T,uv).rgb; float d=clamp((L(c)-.16)/.55,0.,1.);',
    ' c=mix(INK,c,.72+.07*br);',
    // network burst: a soft wavefront travelling across the slice
    ' float band=0.; if(B<1.){vec2 q=(uv-O)*vec2(1.111,1.);float r=B*.95;',
    '  band=exp(-pow((length(q)-r)/.075,2.))*(1.-B);band+=.18*smoothstep(r,r-.35,length(q))*(1.-B)*(1.-B);}',
    ' c+=band*d*vec3(.5,.38,.43)*A;',
    // sparse cells firing (calcium-imaging style flicker)
    ' vec2 g=uv*vec2(118.,106.);vec2 id=floor(g);float h=h1(id),h2=h1(id+17.3);',
    ' vec2 j=vec2(h1(id+3.1),h1(id+9.7))*.5+.25;vec2 f=fract(g)-j;',
    ' float spike=pow(max(0.,sin(t*(.45+h*1.1)+h*61.)),70.)*step(.80,h2);',
    ' spike=max(spike,band*step(.7,h2)*1.1);',
    ' float dc=clamp((L(texture2D(T,(id+j)/vec2(118.,106.)).rgb)-.2)/.5,0.,1.);',
    ' float spot=(exp(-dot(f,f)*24.)+.25*exp(-dot(f,f)*11.))*spike*dc;',
    ' c+=spot*mix(CRYO,vec3(1.),h1(id+5.)*.5)*1.6*A;',
    // feather the outer border into the ground
    ' float e=smoothstep(0.,.035,uv.x)*smoothstep(0.,.035,uv.y)*(1.-smoothstep(.78,1.,uv.x))*(1.-smoothstep(.72,1.,uv.y));',
    ' e*=1.-smoothstep(.55,1.15,length((uv-vec2(.38,.4))*vec2(1.,1.1)));',
    ' gl_FragColor=vec4(mix(INK,c,e),1.);',
    '}'
  ].join('\n');

  function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
  var prog = gl.createProgram();
  try { gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog); }
  catch (err) { console.error(err); giveUp(); return; }
  gl.useProgram(prog);
  var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  var U = {}; ['T', 'R', 'Q', 't', 'A', 'B', 'O', 'dpr'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });

  var ready = false, tex = null, checks = 0;
  // upload the picture; WebGL reports a refused image as an error instead of throwing (Safari: "bad image data")
  function upload(src) {
    if (!src) return false;
    if (!tex) tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    while (gl.getError()) {}
    try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, src); } catch (err) { return false; }
    if (gl.getError()) return false;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(U.T, 0); return true;
  }
  function viaCanvas() {                   // second route: draw the image to a 2D canvas and upload that
    try { var c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight; c.getContext('2d').drawImage(img, 0, 0); return c; }
    catch (err) { return null; }
  }
  // is the slice really on the canvas? (reads a small block at its centre, right after drawing)
  function pictureDrawn() {
    if (gl.isContextLost()) return false;
    var n = 48, px = new Uint8Array(n * n * 4);
    var x = Math.round((rect.x + rect.w * .4) * DPR - n / 2), y = Math.round(glc.height - (rect.y + rect.h * .4) * DPR - n / 2);
    gl.readPixels(Math.max(0, Math.min(glc.width - n, x)), Math.max(0, Math.min(glc.height - n, y)), n, n, gl.RGBA, gl.UNSIGNED_BYTE, px);
    for (var i = 0; i < px.length; i += 4) if (px[i] > 56 || px[i + 1] > 56 || px[i + 2] > 56) return true;   // brighter than the ground
    return false;
  }
  var img = new Image();
  img.onload = function () {
    if (img.naturalWidth) { IMG_ASPECT = img.naturalWidth / img.naturalHeight; layout(); }
    function go() {
      if (!upload(img) && !upload(viaCanvas())) { giveUp(); return; }
      ready = true;
      if (reduce) draw(performance.now());
    }
    if (img.decode) img.decode().then(go, go); else go();   // fully decoded before WebGL reads it
  };
  // Opened from a folder (file://), browsers won't hand an image file to WebGL: load the bundled copy
  // (a large script, so only then, and after the still placeholder has painted)
  var key = hero.getAttribute('data-organoid-var') || 'ORGANOID_SLICE';
  if (location.protocol === 'file:' && !window[key] && hero.getAttribute('data-organoid-js')) {
    var sc = document.createElement('script'); sc.src = hero.getAttribute('data-organoid-js');
    sc.onload = function () { img.src = window[key] || hero.getAttribute('data-organoid'); };
    sc.onerror = function () { img.src = hero.getAttribute('data-organoid'); };
    document.body.appendChild(sc);
  } else img.src = (location.protocol === 'file:' && window[key]) || hero.getAttribute('data-organoid');

  // ---------- network bursts ----------
  var burst = { start: -1, o: [0.5, 0.5], next: 1800 };
  function scheduleBurst(now) {
    var e = EDGE[Math.floor(Math.random() * EDGE.length)];
    burst.o = [e[0] - e[2] * 0.22, e[1] - e[3] * 0.22];      // start just inside the rim
    burst.start = now; burst.next = now + 9000 + Math.random() * 5000;
  }

  // ---------- insight layer: symbolic data drawn from the tissue (no figures) ----------
  //   connectivity map: cells reached by a burst link up with neighbours, then fade
  //   signal trace: a line under the slice that spikes where the burst wave crosses it
  //   focus brackets: a marker locks onto one cell at a time, with a short leader to a square
  var act = new Float32Array(NODES.length).fill(-1e9), links = [], lastPair = 0;
  var focus = { i: -1, born: -1e9, next: 1200 };
  function nodeXY(i, s) { var n = NODES[i]; var u = (n[0] - .5) * s + .5, v = (n[1] - .5) * s + .5; return [rect.x + u * rect.w, rect.y + v * rect.h]; }
  function bandAt(u, v, B) {
    if (B >= 1) return 0;
    var qx = (u - burst.o[0]) * 1.111, qy = v - burst.o[1], d = Math.sqrt(qx * qx + qy * qy) - B * .95;
    return Math.exp(-(d * d) / (.075 * .075)) * (1 - B);
  }
  function fire(i, now) {
    if (W < 900 && i % 2) return;                 // phones: half the cells, so the map stays legible
    if (now - act[i] < 900) return;
    act[i] = now;
    var nb = NODES[i][2];
    for (var k = 0; k < nb.length; k++) {
      var j = nb[k];
      if (now - act[j] < 700 && !(W < 900 && j % 2)) links.push({ a: i, b: j, born: now });
    }
  }
  function drawData(now, t, s, B, k) {
    dt.clearRect(0, 0, W, H);
    if (k <= 0.01 || reduce && k < 0.5) { links.length = 0; return; }
    // activation: burst wavefront + sparse co-firing pairs between bursts
    for (var i = 0; i < NODES.length; i++) if (bandAt(NODES[i][0], NODES[i][1], B) > .55) fire(i, now);
    if (now - lastPair > 380) {
      lastPair = now; var i0 = Math.floor(Math.random() * NODES.length), nb0 = NODES[i0][2];
      if (nb0.length) { act[i0] = now - 200; fire(nb0[Math.floor(Math.random() * nb0.length)], now); }
    }
    // links
    dt.lineCap = 'round';
    for (var l = links.length - 1; l >= 0; l--) {
      var L = links[l], age = (now - L.born) / 2200;
      if (age >= 1) { links.splice(l, 1); continue; }
      var a = nodeXY(L.a, s), b = nodeXY(L.b, s);
      var grow = Math.min(1, age * 6), fade = (1 - age) * (1 - age);
      var ex = a[0] + (b[0] - a[0]) * grow, ey = a[1] + (b[1] - a[1]) * grow;
      dt.strokeStyle = 'rgba(20,20,20,' + (.55 * fade * k).toFixed(3) + ')'; dt.lineWidth = 3.2;
      dt.beginPath(); dt.moveTo(a[0], a[1]); dt.lineTo(ex, ey); dt.stroke();
      dt.strokeStyle = 'rgba(160,242,255,' + (.95 * fade * k).toFixed(3) + ')'; dt.lineWidth = 1.3;
      dt.beginPath(); dt.moveTo(a[0], a[1]); dt.lineTo(ex, ey); dt.stroke();
    }
    // active nodes as small rings
    for (var n = 0; n < NODES.length; n++) {
      var ag = (now - act[n]) / 1600; if (ag < 0 || ag >= 1) continue;
      var p = nodeXY(n, s), f = (1 - ag);
      dt.fillStyle = 'rgba(255,255,255,' + (.9 * f * k).toFixed(3) + ')';
      dt.beginPath(); dt.arc(p[0], p[1], 2.4, 0, 6.2832); dt.fill();
      dt.strokeStyle = 'rgba(160,242,255,' + (.7 * f * k).toFixed(3) + ')'; dt.lineWidth = 1.2;
      dt.beginPath(); dt.arc(p[0], p[1], 3 + ag * 9, 0, 6.2832); dt.stroke();
    }
    // signal trace across the lower slice
    var ty = rect.y + rect.h * (W >= 900 ? .86 : .9), x0 = Math.max(rect.x + rect.w * .06, 0), x1 = W - (W >= 900 ? 40 : 16);
    var vTrace = ((ty - rect.y) / rect.h - .5) / s + .5;
    for (var tr = 0; tr < (W >= 900 ? 2 : 0); tr++) {   // phones: no trace, it would cross the headline
      var off = tr * 16;
      dt.strokeStyle = 'rgba(160,242,255,' + ((tr ? .45 : .95) * k).toFixed(3) + ')'; dt.lineWidth = tr ? 1 : 1.5;
      dt.shadowColor = 'rgba(142,238,255,.6)'; dt.shadowBlur = tr ? 0 : 8;
      dt.beginPath();
      for (var x = x0; x <= x1; x += 2) {
        var u = ((x - rect.x) / rect.w - .5) / s + .5;
        var bnd = bandAt(u, vTrace, B);
        var noise = Math.sin(x * .09 + t * 7 + tr * 3) * .6 + Math.sin(x * .23 - t * 11 + tr) * .5 + Math.sin(x * .031 + t * 2.3) * .7;
        var spike = bnd * Math.sin(x * .55 - t * 26 + tr * 1.7) * 22 * Math.min(1, bnd * 2.2);
        var y = ty + off - (noise + spike);
        if (x === x0) dt.moveTo(x, y); else dt.lineTo(x, y);
      }
      dt.stroke();
    }
    dt.shadowBlur = 0;
    // focus brackets
    if (now > focus.next) {
      var tries = 0, cand;
      do { cand = Math.floor(Math.random() * NODES.length); tries++; }
      while (tries < 20 && (NODES[cand][0] > .7 || NODES[cand][1] > .66 || NODES[cand][1] < .12));
      focus.i = cand; focus.born = now; focus.next = now + 3800 + Math.random() * 1800;
    }
    if (focus.i >= 0) {
      var fa = (now - focus.born) / 3400;
      if (fa < 1) {
        var fp = nodeXY(focus.i, s);
        var lock = Math.min(1, fa / .18), e1 = 1 - Math.pow(1 - lock, 3);
        var al = Math.min(1, fa / .1) * (fa > .8 ? (1 - fa) / .2 : 1) * k;
        var size = 40 + (1 - e1) * 44, c = 10;
        dt.strokeStyle = 'rgba(255,255,255,' + (.95 * al).toFixed(3) + ')'; dt.lineWidth = 2;
        [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (q) {
          var cx = fp[0] + q[0] * size / 2, cy = fp[1] + q[1] * size / 2;
          dt.beginPath(); dt.moveTo(cx, cy - q[1] * c); dt.lineTo(cx, cy); dt.lineTo(cx - q[0] * c, cy); dt.stroke();
        });
        var lead = Math.max(0, Math.min(1, (fa - .2) / .2));
        if (lead > 0) {
          var sx = fp[0] + size / 2, sy = fp[1] - size / 2, ex2 = sx + 60 * lead, ey2 = sy - 60 * lead, hx = ex2 + 56 * Math.max(0, (lead - .5) * 2);
          dt.strokeStyle = 'rgba(255,255,255,' + (.8 * al).toFixed(3) + ')'; dt.lineWidth = 1.2;
          dt.beginPath(); dt.moveTo(sx, sy); dt.lineTo(ex2, ey2); dt.lineTo(hx, ey2); dt.stroke();
          if (lead >= 1) { dt.fillStyle = 'rgba(253,146,163,' + al.toFixed(3) + ')'; dt.fillRect(hx + 5, ey2 - 4.5, 9, 9); }
        }
      }
    }
  }

  // ---------- loop ----------
  var raf = null, visible = true, t0 = performance.now();
  function draw(now) {
    if (!ready) return;
    var t = (now - t0) / 1000;
    if (burst.next < now && alive > 0.05) scheduleBurst(now);
    var B = burst.start < 0 ? 2 : (now - burst.start) / 3200;
    gl.uniform2f(U.R, glc.width, glc.height); gl.uniform1f(U.dpr, DPR);
    gl.uniform4f(U.Q, rect.x, rect.y, rect.w, rect.h);
    gl.uniform1f(U.t, t); gl.uniform1f(U.A, alive); gl.uniform1f(U.B, B); gl.uniform2f(U.O, burst.o[0], burst.o[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // only swap the still for the canvas once the picture is verifiably there; otherwise keep the still
    if (!shown) { if (pictureDrawn()) reveal(); else if (++checks > 90) { giveUp(); return; } }
    var s = 1 + 0.011 * Math.sin(t * 6.28318 / 7.5);
    if (dt) drawData(now, t, s, B, insight);
  }
  // while a page switch is running the hero holds its frame (leaving) or its still (arriving), so the
  // transition never competes with the canvas for frames
  function loop(now) { if (!root.classList.contains('pt-active') && !root.classList.contains('pt-entering')) draw(now); raf = visible ? requestAnimationFrame(loop) : null; }

  if (!reduce) {
    raf = requestAnimationFrame(loop);
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible && !raf) raf = requestAnimationFrame(loop); }).observe(hero);
    document.addEventListener('visibilitychange', function () { if (!document.hidden && visible && !raf) raf = requestAnimationFrame(loop); });
  }
})();
