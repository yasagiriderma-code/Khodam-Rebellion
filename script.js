var CHARS=[];

/* ── TRANSLATIONS ── */
var LANGS={
  id:{
    pickHero:'Pilih Karakter',pickHint:'Tap = pilih | 2x tap = preview video',
    startBtn:'MULAI PERTEMPURAN',flee:'Keluar',skip:'SKIP',
    rpsPrompt:'Tentukan Giliran',rpsHint:'Pilih salah satu',
    win:'MENANG!',lose:'KALAH',
    pickAgain:'Pilih Ulang',playAgain:'Main Lagi',
    roundStart:'Ronde',energyGain:'+50 energy',
    yourTurn:'Giliran Kamu',botTurn:'Giliran Bot...',rpsDulu:'RPS dulu!',
    youUsed:'Kamu pakai',botUsed:'Bot pakai',damage:'damage',
    youSkip:'Kamu skip giliran (energy tidak cukup)',botSkip:'Bot skip giliran (energy tidak cukup)',
    rpsYou:'Kamu',rpsBot:'Bot',rpsFirst:'duluan',
    rpsYouWin:'Kamu menang! Kamu duluan.',rpsBotWin:'Bot menang! Bot duluan.',rpsDraw:'Seri! Kamu duluan.',
    youWinLog:'Kamu menang di ronde',botWinLog:'Bot menang di ronde',
    youWinSub:'mengalahkan',
    confirmFlee:'Yakin keluar dari pertempuran?',
    fleeTitle:'Keluar Pertempuran?',
    fleeMessage:'Progress ronde ini akan berakhir kalau kamu keluar sekarang.',
    notEnoughEnergyTitle:'Energy Tidak Cukup',
    notEnoughEnergyMessage:'Energy kamu belum cukup untuk memakai skill ini.',
    confirmYes:'Keluar',
    confirmNo:'Batal',
    okText:'Oke',
    loadingTitle:'Mempersiapkan Arena',
    loadingSubtitle:'Mengunduh asset penting agar game lebih lancar.',
    loadingStarting:'Memulai...',
    loadingReady:'Semua asset siap!',
    loadingAsset:'Memuat {name}',
    langTitle:'Bahasa / Language',volTitle:'Volume Suara',
    sfxLabel:'Sound FX',bgmLabel:'Backsound',bgmTitle:'Backsound In-Game',
    uploadBtn:'Upload File Audio',uploadHint:'MP3, OGG, WAV — akan diplay saat in-game\nDrag & drop atau tap untuk pilih file',
    bgmLoaded:'Backsound siap',bgmRemoved:'Backsound dihapus',
    preview:'Preview',remove:'Hapus',backMenu:'Kembali ke Menu',
    settingsBtn:'PENGATURAN',mainMenu:'Menu Utama',
    rock:'Batu',paper:'Kertas',scissors:'Gunting',
    roleNames:{tank:'Tank',mage:'Penyihir',fighter:'Pejuang',summoner:'Pemanggil'}
  },
  en:{
    pickHero:'Choose Character',pickHint:'Tap = select | Double tap = video preview',
    startBtn:'START BATTLE',flee:'Exit',skip:'SKIP',
    rpsPrompt:'Determine Turn',rpsHint:'Choose one',
    win:'VICTORY!',lose:'DEFEAT',
    pickAgain:'Pick Again',playAgain:'Play Again',
    roundStart:'Round',energyGain:'+50 energy',
    yourTurn:'Your Turn',botTurn:'Bot Turn...',rpsDulu:'RPS first!',
    youUsed:'You used',botUsed:'Bot used',damage:'damage',
    youSkip:'You skip turn (not enough energy)',botSkip:'Bot skips turn (not enough energy)',
    rpsYou:'You',rpsBot:'Bot',rpsFirst:'goes first',
    rpsYouWin:'You win! You go first.',rpsBotWin:'Bot wins! Bot goes first.',rpsDraw:'Draw! You go first.',
    youWinLog:'You won in round',botWinLog:'Bot won in round',
    youWinSub:'defeated',
    confirmFlee:'Sure you want to exit the battle?',
    fleeTitle:'Leave Battle?',
    fleeMessage:'Your current battle progress will end if you leave now.',
    notEnoughEnergyTitle:'Not Enough Energy',
    notEnoughEnergyMessage:'Your energy is not enough to use this skill yet.',
    confirmYes:'Leave',
    confirmNo:'Cancel',
    okText:'OK',
    loadingTitle:'Preparing The Arena',
    loadingSubtitle:'Downloading essential assets for smoother gameplay.',
    loadingStarting:'Starting...',
    loadingReady:'All assets are ready!',
    loadingAsset:'Loading {name}',
    langTitle:'Language / Bahasa',volTitle:'Sound Volume',
    sfxLabel:'Sound FX',bgmLabel:'Backsound',bgmTitle:'In-Game Backsound',
    uploadBtn:'Upload Audio File',uploadHint:'MP3, OGG, WAV — plays during battle\nDrag & drop or tap to select file',
    bgmLoaded:'Backsound ready',bgmRemoved:'Backsound removed',
    preview:'Preview',remove:'Remove',backMenu:'Back to Menu',
    settingsBtn:'SETTINGS',mainMenu:'Main Menu',
    rock:'Rock',paper:'Paper',scissors:'Scissors',
    roleNames:{tank:'Tank',mage:'Mage',fighter:'Fighter',summoner:'Summoner'}
  }
};
var lang='id';
function T(k){return LANGS[lang][k]||LANGS.id[k]||k}
var LANGUAGE_OPTIONS=[
  {code:'id',label:'Indonesia',native:'Bahasa Indonesia'},
  {code:'en',label:'English',native:'English'},
  {code:'es',label:'Spanish',native:'Espanol'},
  {code:'fr',label:'French',native:'Francais'},
  {code:'zh',label:'Chinese',native:'中文'},
  {code:'ja',label:'Japanese',native:'日本語'},
  {code:'pt',label:'Portuguese',native:'Portugues (Brasil)'}
];
var CHAR_I18N={
  1:{skill:{id:"Amarah Naga",en:"Dragon's Wrath",es:"Ira del Dragon",fr:"Colere du Dragon",zh:"巨龙之怒",ja:"竜の怒り",pt:"Furia do Dragao"}},
  2:{skill:{id:"Raungan Grizzly",en:"Grizzly's Roar",es:"Rugido de Grizzly",fr:"Rugissement de Grizzly",zh:"灰熊咆哮",ja:"グリズリーの咆哮",pt:"Rugido do Grizzly"}},
  3:{skill:{id:"Dash Rubah",en:"Fox's Dash",es:"Carrera del Zorro",fr:"Ruade du Renard",zh:"灵狐突袭",ja:"狐の疾走",pt:"Arranque da Raposa"}},
  4:{skill:{id:"Kawanan Crow",en:"Crow's Swarm",es:"Enjambre del Cuervo",fr:"Nuee du Corbeau",zh:"乌鸦群袭",ja:"カラスの群れ",pt:"Enxame do Corvo"}},
  5:{skill:{id:"Ledakan Energi",en:"Energy Blast",es:"Explosion de Energia",fr:"Explosion d'Energie",zh:"能量爆裂",ja:"エネルギーブラスト",pt:"Explosao de Energia"}},
  6:{skill:{id:"Domain Si Kembar",en:"Twins' Domain",es:"Dominio Gemelo",fr:"Domaine des Jumeaux",zh:"双子领域",ja:"双子の領域",pt:"Dominio dos Gemeos"}}
};
Object.assign(LANGS.id,{
  pageLang:'id',titleTagline:'Pilih juaramu',titleStart:'MULAI GAME',chooseLanguage:'Pilih bahasa',
  searchLanguage:'Cari bahasa...',noLanguageResult:'Bahasa tidak ditemukan',settingsTitle:'Pengaturan',
  selected:'DIPILIH',doubleTapPreview:'2x tap = preview',playerSide:'KAMU',botSide:'BOT',
  victorySub:'{winner} mengalahkan {loser}!',defeatSub:'{winner} mengalahkan kamu di ronde {round}.',
  rpsLog:'RPS: {player} {playerChoice} vs {bot} {botChoice} > {winner} {first}',
  skillCost:'EN: {current}/{max} ({cost})',skillCostInitial:'EN: {cost} / {max}',
  statHp:'HP {value}',statDmg:'DMG {value}',statEn:'EN {value}',
  uploadHint:'MP3, OGG, WAV - akan diputar saat in-game\nDrag & drop atau tap untuk pilih file'
});
Object.assign(LANGS.en,{
  pageLang:'en',titleTagline:'Choose your champion',titleStart:'START GAME',chooseLanguage:'Choose language',
  searchLanguage:'Search language...',noLanguageResult:'No languages found',settingsTitle:'Settings',
  selected:'SELECTED',doubleTapPreview:'Double tap = preview',playerSide:'YOU',botSide:'BOT',
  victorySub:'{winner} defeated {loser}!',defeatSub:'{winner} defeated you in round {round}.',
  rpsLog:'RPS: {player} {playerChoice} vs {bot} {botChoice} > {winner} {first}',
  skillCost:'EN: {current}/{max} ({cost})',skillCostInitial:'EN: {cost} / {max}',
  statHp:'HP {value}',statDmg:'DMG {value}',statEn:'EN {value}',
  uploadHint:'MP3, OGG, WAV - plays during battle\nDrag & drop or tap to select file'
});
LANGS.es={
  pageLang:'es',titleTagline:'Elige a tu campeon',titleStart:'INICIAR JUEGO',
  pickHero:'Elegir Personaje',pickHint:'Toque = seleccionar | Doble toque = vista previa',
  startBtn:'INICIAR BATALLA',flee:'Salir',skip:'PASAR',
  rpsPrompt:'Decide el turno',rpsHint:'Elige una opcion',
  win:'VICTORIA!',lose:'DERROTA',pickAgain:'Elegir de nuevo',playAgain:'Jugar otra vez',
  roundStart:'Ronda',energyGain:'+50 energia',yourTurn:'Tu turno',botTurn:'Turno del bot...',rpsDulu:'Primero RPS!',
  youUsed:'Usaste',botUsed:'El bot uso',damage:'de dano',youSkip:'Pasas el turno (energia insuficiente)',botSkip:'El bot pasa el turno (energia insuficiente)',
  rpsYou:'Tu',rpsBot:'Bot',rpsFirst:'va primero',rpsYouWin:'Ganaste! Vas primero.',rpsBotWin:'El bot gana! Va primero.',rpsDraw:'Empate! Vas primero.',
  youWinLog:'Ganaste en la ronda',botWinLog:'El bot gano en la ronda',confirmFlee:'Seguro que quieres salir de la batalla?',
  langTitle:'Idioma / Language',volTitle:'Volumen',chooseLanguage:'Elegir idioma',searchLanguage:'Buscar idioma...',noLanguageResult:'No se encontro ningun idioma',
  sfxLabel:'Efectos',bgmLabel:'Musica',bgmTitle:'Musica In-Game',uploadBtn:'Subir Audio',uploadHint:'MP3, OGG, WAV - se reproduce durante la batalla\nArrastra o toca para elegir un archivo',
  bgmLoaded:'Musica lista',bgmRemoved:'Musica eliminada',preview:'Vista previa',remove:'Eliminar',backMenu:'Volver al menu',
  settingsBtn:'AJUSTES',settingsTitle:'Ajustes',mainMenu:'Menu Principal',selected:'SELECCIONADO',doubleTapPreview:'Doble toque = vista previa',
  playerSide:'TU',botSide:'BOT',victorySub:'{winner} derroto a {loser}!',defeatSub:'{winner} te derroto en la ronda {round}.',
  rpsLog:'RPS: {player} {playerChoice} vs {bot} {botChoice} > {winner} {first}',skillCost:'EN: {current}/{max} ({cost})',skillCostInitial:'EN: {cost} / {max}',
  statHp:'HP {value}',statDmg:'DMG {value}',statEn:'EN {value}',rock:'Piedra',paper:'Papel',scissors:'Tijeras',
  roleNames:{tank:'Tanque',mage:'Mago',fighter:'Luchador',summoner:'Invocador'}
};
LANGS.fr={
  pageLang:'fr',titleTagline:'Choisissez votre champion',titleStart:'LANCER LE JEU',
  pickHero:'Choisir un Personnage',pickHint:'Tap = choisir | Double tap = apercu video',
  startBtn:'LANCER LE COMBAT',flee:'Quitter',skip:'PASSER',
  rpsPrompt:'Determiner le tour',rpsHint:'Choisissez une option',
  win:'VICTOIRE!',lose:'DEFAITE',pickAgain:'Rechoisir',playAgain:'Rejouer',
  roundStart:'Manche',energyGain:'+50 energie',yourTurn:'Votre tour',botTurn:'Tour du bot...',rpsDulu:'RPS d abord!',
  youUsed:'Vous avez utilise',botUsed:'Le bot a utilise',damage:'de degats',youSkip:'Vous passez votre tour (energie insuffisante)',botSkip:'Le bot passe son tour (energie insuffisante)',
  rpsYou:'Vous',rpsBot:'Bot',rpsFirst:'commence',rpsYouWin:'Vous gagnez! Vous commencez.',rpsBotWin:'Le bot gagne! Il commence.',rpsDraw:'Egalite! Vous commencez.',
  youWinLog:'Vous avez gagne a la manche',botWinLog:'Le bot a gagne a la manche',confirmFlee:'Voulez-vous vraiment quitter le combat?',
  langTitle:'Langue / Language',volTitle:'Volume',chooseLanguage:'Choisir la langue',searchLanguage:'Rechercher une langue...',noLanguageResult:'Aucune langue trouvee',
  sfxLabel:'Effets sonores',bgmLabel:'Musique',bgmTitle:'Musique En Jeu',uploadBtn:'Importer un audio',uploadHint:'MP3, OGG, WAV - joue pendant le combat\nGlissez-deposez ou touchez pour choisir un fichier',
  bgmLoaded:'Musique prete',bgmRemoved:'Musique supprimee',preview:'Apercu',remove:'Supprimer',backMenu:'Retour au menu',
  settingsBtn:'PARAMETRES',settingsTitle:'Parametres',mainMenu:'Menu Principal',selected:'SELECTIONNE',doubleTapPreview:'Double tap = apercu',
  playerSide:'VOUS',botSide:'BOT',victorySub:'{winner} a vaincu {loser}!',defeatSub:'{winner} vous a vaincu a la manche {round}.',
  rpsLog:'RPS: {player} {playerChoice} vs {bot} {botChoice} > {winner} {first}',skillCost:'EN: {current}/{max} ({cost})',skillCostInitial:'EN: {cost} / {max}',
  statHp:'HP {value}',statDmg:'DMG {value}',statEn:'EN {value}',rock:'Pierre',paper:'Papier',scissors:'Ciseaux',
  roleNames:{tank:'Tank',mage:'Mage',fighter:'Combattant',summoner:'Invocateur'}
};
LANGS.zh={
  pageLang:'zh',titleTagline:'选择你的冠军',titleStart:'开始游戏',
  pickHero:'选择角色',pickHint:'点击 = 选择 | 双击 = 视频预览',
  startBtn:'开始战斗',flee:'退出',skip:'跳过',
  rpsPrompt:'决定出手顺序',rpsHint:'请选择一个',
  win:'胜利!',lose:'失败',pickAgain:'重新选择',playAgain:'再来一局',
  roundStart:'回合',energyGain:'+50 能量',yourTurn:'你的回合',botTurn:'机器人回合...',rpsDulu:'先来猜拳!',
  youUsed:'你使用了',botUsed:'机器人使用了',damage:'伤害',youSkip:'你的能量不足，跳过回合',botSkip:'机器人能量不足，跳过回合',
  rpsYou:'你',rpsBot:'机器人',rpsFirst:'先手',rpsYouWin:'你赢了! 你先手。',rpsBotWin:'机器人赢了! 机器人先手。',rpsDraw:'平局! 你先手。',
  youWinLog:'你在回合中获胜',botWinLog:'机器人在回合中获胜',confirmFlee:'确定要退出战斗吗?',
  langTitle:'语言 / Language',volTitle:'音量',chooseLanguage:'选择语言',searchLanguage:'搜索语言...',noLanguageResult:'未找到语言',
  sfxLabel:'音效',bgmLabel:'背景音乐',bgmTitle:'游戏内背景音乐',uploadBtn:'上传音频文件',uploadHint:'MP3, OGG, WAV - 将在战斗中播放\n拖放文件或点击选择文件',
  bgmLoaded:'背景音乐已就绪',bgmRemoved:'背景音乐已删除',preview:'预览',remove:'删除',backMenu:'返回菜单',
  settingsBtn:'设置',settingsTitle:'设置',mainMenu:'主菜单',selected:'已选择',doubleTapPreview:'双击 = 预览',
  playerSide:'你',botSide:'机器人',victorySub:'{winner} 击败了 {loser}!',defeatSub:'{winner} 在第 {round} 回合击败了你。',
  rpsLog:'RPS: {player} {playerChoice} vs {bot} {botChoice} > {winner} {first}',skillCost:'EN: {current}/{max} ({cost})',skillCostInitial:'EN: {cost} / {max}',
  statHp:'HP {value}',statDmg:'DMG {value}',statEn:'EN {value}',rock:'石头',paper:'布',scissors:'剪刀',
  roleNames:{tank:'坦克',mage:'法师',fighter:'战士',summoner:'召唤师'}
};
LANGS.ja={
  pageLang:'ja',titleTagline:'チャンピオンを選ぼう',titleStart:'ゲーム開始',
  pickHero:'キャラクターを選択',pickHint:'タップ = 選択 | ダブルタップ = 動画プレビュー',
  startBtn:'バトル開始',flee:'退出',skip:'スキップ',
  rpsPrompt:'行動順を決めよう',rpsHint:'ひとつ選んでください',
  win:'勝利!',lose:'敗北',pickAgain:'選び直す',playAgain:'もう一度',
  roundStart:'ラウンド',energyGain:'+50 エネルギー',yourTurn:'あなたのターン',botTurn:'ボットのターン...',rpsDulu:'まずはRPS!',
  youUsed:'あなたは使った',botUsed:'ボットは使った',damage:'ダメージ',youSkip:'エネルギー不足のためターンをスキップ',botSkip:'ボットはエネルギー不足でスキップ',
  rpsYou:'あなた',rpsBot:'ボット',rpsFirst:'先攻',rpsYouWin:'あなたの勝ち! あなたが先攻です。',rpsBotWin:'ボットの勝ち! ボットが先攻です。',rpsDraw:'引き分け! あなたが先攻です。',
  youWinLog:'あなたはラウンドで勝利',botWinLog:'ボットはラウンドで勝利',confirmFlee:'バトルを終了しますか?',
  langTitle:'言語 / Language',volTitle:'音量',chooseLanguage:'言語を選択',searchLanguage:'言語を検索...',noLanguageResult:'言語が見つかりません',
  sfxLabel:'効果音',bgmLabel:'BGM',bgmTitle:'ゲーム内BGM',uploadBtn:'音声ファイルをアップロード',uploadHint:'MP3, OGG, WAV - バトル中に再生されます\nドラッグ&ドロップ またはタップしてファイルを選択',
  bgmLoaded:'BGM準備完了',bgmRemoved:'BGMを削除しました',preview:'プレビュー',remove:'削除',backMenu:'メニューに戻る',
  settingsBtn:'設定',settingsTitle:'設定',mainMenu:'メインメニュー',selected:'選択中',doubleTapPreview:'ダブルタップ = プレビュー',
  playerSide:'あなた',botSide:'ボット',victorySub:'{winner} が {loser} を倒した!',defeatSub:'{winner} がラウンド {round} であなたを倒した。',
  rpsLog:'RPS: {player} {playerChoice} vs {bot} {botChoice} > {winner} {first}',skillCost:'EN: {current}/{max} ({cost})',skillCostInitial:'EN: {cost} / {max}',
  statHp:'HP {value}',statDmg:'DMG {value}',statEn:'EN {value}',rock:'グー',paper:'パー',scissors:'チョキ',
  roleNames:{tank:'タンク',mage:'メイジ',fighter:'ファイター',summoner:'サモナー'}
};
LANGS.pt={
  pageLang:'pt',titleTagline:'Escolha seu campeao',titleStart:'INICIAR JOGO',
  pickHero:'Escolher Personagem',pickHint:'Toque = selecionar | Toque duplo = preview do video',
  startBtn:'INICIAR BATALHA',flee:'Sair',skip:'PULAR',
  rpsPrompt:'Definir turno',rpsHint:'Escolha uma opcao',
  win:'VITORIA!',lose:'DERROTA',pickAgain:'Escolher novamente',playAgain:'Jogar novamente',
  roundStart:'Rodada',energyGain:'+50 energia',yourTurn:'Seu turno',botTurn:'Turno do bot...',rpsDulu:'RPS primeiro!',
  youUsed:'Voce usou',botUsed:'Bot usou',damage:'de dano',youSkip:'Voce pulou o turno (energia insuficiente)',botSkip:'Bot pulou o turno (energia insuficiente)',
  rpsYou:'Voce',rpsBot:'Bot',rpsFirst:'joga primeiro',rpsYouWin:'Voce venceu! Joga primeiro.',rpsBotWin:'Bot venceu! Joga primeiro.',rpsDraw:'Empate! Voce joga primeiro.',
  youWinLog:'Voce venceu na rodada',botWinLog:'Bot venceu na rodada',confirmFlee:'Tem certeza que deseja sair da batalha?',
  langTitle:'Idioma / Language',volTitle:'Volume de Som',chooseLanguage:'Escolher idioma',searchLanguage:'Buscar idioma...',noLanguageResult:'Nenhum idioma encontrado',
  sfxLabel:'Efeitos Sonoros',bgmLabel:'Musica',bgmTitle:'Musica In-Game',uploadBtn:'Enviar Audio',uploadHint:'MP3, OGG, WAV - toca durante a batalha\nArraste e solte ou toque para selecionar um arquivo',
  bgmLoaded:'Musica pronta',bgmRemoved:'Musica removida',preview:'Preview',remove:'Remover',backMenu:'Voltar ao menu',
  settingsBtn:'CONFIGURACOES',settingsTitle:'Configuracoes',mainMenu:'Menu Principal',selected:'SELECIONADO',doubleTapPreview:'Toque duplo = preview',
  playerSide:'VOCE',botSide:'BOT',victorySub:'{winner} derrotou {loser}!',defeatSub:'{winner} derrotou voce na rodada {round}.',
  rpsLog:'RPS: {player} {playerChoice} vs {bot} {botChoice} > {winner} {first}',skillCost:'EN: {current}/{max} ({cost})',skillCostInitial:'EN: {cost} / {max}',
  statHp:'HP {value}',statDmg:'DMG {value}',statEn:'EN {value}',rock:'Pedra',paper:'Papel',scissors:'Tesoura',
  roleNames:{tank:'Tanque',mage:'Mago',fighter:'Lutador',summoner:'Invocador'}
};
Object.assign(LANGS.es,{
  fleeTitle:'Salir de la batalla?',
  fleeMessage:'El progreso de esta batalla terminara si sales ahora.',
  notEnoughEnergyTitle:'Energia insuficiente',
  notEnoughEnergyMessage:'Tu energia aun no es suficiente para usar esta habilidad.',
  confirmYes:'Salir',
  confirmNo:'Cancelar',
  okText:'OK'
});
Object.assign(LANGS.fr,{
  fleeTitle:'Quitter le combat ?',
  fleeMessage:'La progression de ce combat sera perdue si vous quittez maintenant.',
  notEnoughEnergyTitle:'Energie insuffisante',
  notEnoughEnergyMessage:'Votre energie n est pas encore suffisante pour utiliser cette competence.',
  confirmYes:'Quitter',
  confirmNo:'Annuler',
  okText:'OK'
});
Object.assign(LANGS.zh,{
  fleeTitle:'退出战斗？',
  fleeMessage:'如果你现在离开，本场战斗进度将会结束。',
  notEnoughEnergyTitle:'能量不足',
  notEnoughEnergyMessage:'你的能量还不足以使用这个技能。',
  confirmYes:'退出',
  confirmNo:'取消',
  okText:'确定'
});
Object.assign(LANGS.ja,{
  fleeTitle:'バトルを終了しますか？',
  fleeMessage:'今退出すると、このバトルの進行は終了します。',
  notEnoughEnergyTitle:'エネルギー不足',
  notEnoughEnergyMessage:'このスキルを使うにはエネルギーが足りません。',
  confirmYes:'終了',
  confirmNo:'キャンセル',
  okText:'OK'
});
Object.assign(LANGS.pt,{
  fleeTitle:'Sair da batalha?',
  fleeMessage:'O progresso desta batalha sera encerrado se voce sair agora.',
  notEnoughEnergyTitle:'Energia insuficiente',
  notEnoughEnergyMessage:'Sua energia ainda nao e suficiente para usar esta habilidade.',
  confirmYes:'Sair',
  confirmNo:'Cancelar',
  okText:'OK'
});
lang=localStorage.getItem('realmClashLang')||lang;
if(!LANGS[lang])lang='id';
function F(k,vars){
  return T(k).replace(/\{(\w+)\}/g,function(_,name){
    return vars&&vars[name]!=null?vars[name]:'';
  });
}
function getLangOption(code){
  return LANGUAGE_OPTIONS.filter(function(item){return item.code===code})[0]||LANGUAGE_OPTIONS[0];
}
function getCharSkillName(c){
  return c&&c.skill&&c.skill.name?c.skill.name:'Skill';
}
function getCharDisplayName(c){return c.name}
function normalizeCharacter(raw,index){
  var skill=(raw.skills&&raw.skills[0])||raw.skill||{};
  var maxEn=raw.maxEn!=null?raw.maxEn:(raw.max_energy!=null?raw.max_energy:300);
  return {
    id:raw.id!=null?raw.id:(index+1),
    name:raw.name||('Character '+(index+1)),
    role:raw.role||'fighter',
    hp:raw.hp!=null?raw.hp:1800,
    maxEn:maxEn,
    preview:raw.preview||raw.idle||'',
    skill:{
      name:skill.name||'Skill',
      damage:skill.damage!=null?skill.damage:0,
      cost:skill.cost!=null?skill.cost:(skill.energy_cost!=null?skill.energy_cost:0),
      animation:skill.animation||''
    }
  };
}
function normalizeCharacters(payload){
  var list=Array.isArray(payload)?payload:(payload&&Array.isArray(payload.characters)?payload.characters:[]);
  return list.map(normalizeCharacter).filter(function(c){
    return c.id!=null&&c.name&&c.preview&&c.skill&&c.skill.animation;
  });
}
async function loadCharacters(){
  var response=await fetch('characters.json',{cache:'no-store'});
  if(!response.ok)throw new Error('Failed to load characters.json');
  var payload=await response.json();
  var chars=normalizeCharacters(payload);
  if(!chars.length)throw new Error('No valid characters found in characters.json');
  CHARS=chars;
}

/* ── STATE ── */
var selectedId=null,battle=null,phase='rps';
var round=0,battleEnded=false,lastSelectedId=null;
var ultCallback=null,ultEnded=false,ultWho=null;
var tapTimer=null,tapCount=0;
var prevScreen='screen-select';
var gameDialogAction=null;
var charGridBuilt=false;
var pendingDamageTimeout=null;

/* ── SETTINGS STATE ── */
var volSfx=0.8,volBgm=0.6;
var bgmAudio=null,bgmBlobUrl=null,bgmPreviewing=false,bgmFileName='';

/* ── AUDIO CONTEXT for SFX ── */
var audioCtx=null;
function getAudioCtx(){
  if(!audioCtx){try{audioCtx=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}}
  return audioCtx;
}
function sfx(type){
  var ctx=getAudioCtx();if(!ctx||volSfx===0)return;
  if(ctx.state==='suspended')ctx.resume();
  var osc=ctx.createOscillator(),gain=ctx.createGain();
  osc.connect(gain);gain.connect(ctx.destination);
  var now=ctx.currentTime,v=volSfx;
  if(type==='tap'){
    osc.type='sine';osc.frequency.setValueAtTime(880,now);osc.frequency.exponentialRampToValueAtTime(440,now+.06);
    gain.gain.setValueAtTime(.18*v,now);gain.gain.exponentialRampToValueAtTime(.001,now+.08);
    osc.start(now);osc.stop(now+.09);
  }else if(type==='confirm'){
    osc.type='triangle';osc.frequency.setValueAtTime(600,now);osc.frequency.setValueAtTime(900,now+.08);
    gain.gain.setValueAtTime(.22*v,now);gain.gain.exponentialRampToValueAtTime(.001,now+.22);
    osc.start(now);osc.stop(now+.23);
  }else if(type==='back'){
    osc.type='sine';osc.frequency.setValueAtTime(700,now);osc.frequency.exponentialRampToValueAtTime(300,now+.12);
    gain.gain.setValueAtTime(.15*v,now);gain.gain.exponentialRampToValueAtTime(.001,now+.14);
    osc.start(now);osc.stop(now+.15);
  }else if(type==='select'){
    osc.type='triangle';osc.frequency.setValueAtTime(1200,now);osc.frequency.exponentialRampToValueAtTime(800,now+.1);
    gain.gain.setValueAtTime(.2*v,now);gain.gain.exponentialRampToValueAtTime(.001,now+.12);
    osc.start(now);osc.stop(now+.13);
  }else if(type==='rps'){
    osc.type='sawtooth';osc.frequency.setValueAtTime(200,now);osc.frequency.exponentialRampToValueAtTime(80,now+.1);
    gain.gain.setValueAtTime(.25*v,now);gain.gain.exponentialRampToValueAtTime(.001,now+.12);
    osc.start(now);osc.stop(now+.13);
  }else if(type==='skill'){
    osc.type='sawtooth';osc.frequency.setValueAtTime(120,now);osc.frequency.exponentialRampToValueAtTime(1400,now+.18);
    gain.gain.setValueAtTime(.3*v,now);gain.gain.exponentialRampToValueAtTime(.001,now+.22);
    osc.start(now);osc.stop(now+.23);
  }else if(type==='hit'){
    osc.type='square';osc.frequency.setValueAtTime(300,now);osc.frequency.exponentialRampToValueAtTime(60,now+.08);
    gain.gain.setValueAtTime(.28*v,now);gain.gain.exponentialRampToValueAtTime(.001,now+.1);
    osc.start(now);osc.stop(now+.11);
  }else if(type==='win'){
    var freqs=[523,659,784];
    freqs.forEach(function(f,i){
      var o2=ctx.createOscillator(),g2=ctx.createGain();
      o2.connect(g2);g2.connect(ctx.destination);
      o2.type='triangle';o2.frequency.value=f;
      g2.gain.setValueAtTime(0,now+i*.13);g2.gain.linearRampToValueAtTime(.25*v,now+i*.13+.02);
      g2.gain.exponentialRampToValueAtTime(.001,now+i*.13+.2);
      o2.start(now+i*.13);o2.stop(now+i*.13+.22);
    });
    osc.disconnect();return;
  }else if(type==='lose'){
    osc.type='sine';osc.frequency.setValueAtTime(500,now);osc.frequency.exponentialRampToValueAtTime(150,now+.4);
    gain.gain.setValueAtTime(.2*v,now);gain.gain.exponentialRampToValueAtTime(.001,now+.45);
    osc.start(now);osc.stop(now+.46);
  }else if(type==='newround'){
    osc.type='sine';osc.frequency.setValueAtTime(1046,now);osc.frequency.exponentialRampToValueAtTime(900,now+.3);
    gain.gain.setValueAtTime(.2*v,now);gain.gain.exponentialRampToValueAtTime(.001,now+.35);
    osc.start(now);osc.stop(now+.36);
  }
}

/* ── BGM ── */
function startBgm(){
  if(!bgmAudio||!bgmBlobUrl)return;
  bgmAudio.currentTime=0;
  bgmAudio.volume=volBgm;
  bgmAudio.loop=true;
  bgmAudio.play().catch(function(){});
}
function stopBgm(){
  if(!bgmAudio)return;
  bgmAudio.pause();
  bgmAudio.currentTime=0;
}
function updateBgmVol(){
  if(bgmAudio)bgmAudio.volume=volBgm;
}

function handleBgmFile(file){
  if(!file)return;
  if(bgmBlobUrl)URL.revokeObjectURL(bgmBlobUrl);
  bgmBlobUrl=URL.createObjectURL(file);
  if(!bgmAudio)bgmAudio=new Audio();
  bgmAudio.src=bgmBlobUrl;
  bgmAudio.volume=volBgm;
  bgmAudio.loop=true;
  document.getElementById('bgm-status').textContent=T('bgmLoaded')+': '+file.name;
  document.getElementById('bgm-controls').classList.remove('hidden');
  document.getElementById('bgm-play-pause').textContent='\u25B6 '+T('preview');
  bgmPreviewing=false;
}
function handleBgmDrop(e){
  e.preventDefault();
  document.getElementById('upload-area').classList.remove('dragover');
  var f=e.dataTransfer.files[0];
  if(f&&f.type.startsWith('audio'))handleBgmFile(f);
}
function toggleBgmPreview(){
  if(!bgmAudio)return;
  if(bgmPreviewing){
    bgmAudio.pause();bgmPreviewing=false;
    document.getElementById('bgm-play-pause').textContent='\u25B6 '+T('preview');
  }else{
    bgmAudio.play().catch(function(){});bgmPreviewing=true;
    document.getElementById('bgm-play-pause').textContent='\u23F8 '+T('preview');
  }
}
function removeBgm(){
  stopBgm();bgmPreviewing=false;
  if(bgmBlobUrl){URL.revokeObjectURL(bgmBlobUrl);bgmBlobUrl=null;}
  bgmAudio=null;
  document.getElementById('bgm-status').textContent=T('bgmRemoved');
  document.getElementById('bgm-controls').classList.add('hidden');
  document.getElementById('bgm-play-pause').textContent='\u25B6 '+T('preview');
}

/* ── VOLUME CONTROLS ── */
function updateVol(which,val){
  val=parseInt(val);
  if(which==='sfx'){
    volSfx=val/100;
    document.getElementById('vol-sfx-val').textContent=val;
  }else{
    volBgm=val/100;
    document.getElementById('vol-bgm-val').textContent=val;
    updateBgmVol();
  }
}

/* ── LANGUAGE ── */
function setLang(l){
  if(!LANGS[l])return;
  lang=l;
  localStorage.setItem('realmClashLang',lang);
  applyLang();
  closeLangDropdown();
  sfx('select');
}
function toggleLangDropdown(){
  document.getElementById('lang-dropdown').classList.toggle('hidden');
  if(!document.getElementById('lang-dropdown').classList.contains('hidden')){
    renderLanguageOptions();
    document.getElementById('lang-search').focus();
  }
}
function closeLangDropdown(){
  document.getElementById('lang-dropdown').classList.add('hidden');
}
function filterLangOptions(term){
  renderLanguageOptions(term);
}
function renderLanguageOptions(term){
  var q=(term||'').toLowerCase().trim();
  var items=LANGUAGE_OPTIONS.filter(function(item){
    var hay=(item.label+' '+item.native+' '+item.code).toLowerCase();
    return !q||hay.indexOf(q)!==-1;
  });
  var wrap=document.getElementById('lang-options');
  var empty=document.getElementById('lang-empty');
  wrap.innerHTML=items.map(function(item){
    var active=item.code===lang?' active':'';
    return '<button type="button" class="lang-option'+active+'" onclick="setLang(\''+item.code+'\')">'
      +'<span>'+item.native+'<small>'+item.label.toUpperCase()+' - '+item.code.toUpperCase()+'</small></span>'
      +(item.code===lang?'<strong>'+T('selected')+'</strong>':'')
    +'</button>';
  }).join('');
  empty.textContent=T('noLanguageResult');
  empty.classList.toggle('hidden',items.length>0);
}
function applyLang(){
  document.documentElement.lang=T('pageLang');
  updateLoadingTexts();
  document.getElementById('title-tagline').textContent=T('titleTagline');
  document.getElementById('btn-title-start').textContent=T('titleStart');
  document.getElementById('btn-title-settings').textContent='\u2699 '+T('settingsBtn');
  document.getElementById('lbl-pick-hero').textContent=T('pickHero');
  document.getElementById('lbl-pick-hint').textContent=T('pickHint');
  document.getElementById('btn-select-back').textContent='\u2190 '+T('mainMenu');
  document.getElementById('btn-start').textContent='\u2694 '+T('startBtn');
  document.getElementById('settings-title').textContent='\u2699 '+T('settingsTitle');
  document.getElementById('lbl-lang-title').textContent=T('langTitle');
  document.getElementById('lbl-lang-select').textContent=T('chooseLanguage');
  document.getElementById('lang-search').placeholder=T('searchLanguage');
  document.getElementById('lang-current-label').textContent=getLangOption(lang).native;
  document.getElementById('lbl-vol-title').textContent=T('volTitle');
  document.getElementById('lbl-sfx').textContent=T('sfxLabel');
  document.getElementById('lbl-bgm').textContent=T('bgmLabel');
  document.getElementById('lbl-bgm-title').textContent=T('bgmTitle');
  document.getElementById('lbl-upload-btn').textContent='\u266C '+T('uploadBtn');
  document.getElementById('lbl-upload-hint').innerHTML=T('uploadHint').replace('\n','<br>');
  document.getElementById('bgm-play-pause').textContent=(bgmPreviewing?'\u23F8 ':'\u25B6 ')+T('preview');
  document.getElementById('btn-bgm-remove').textContent='\u2715 '+T('remove');
  document.getElementById('btn-settings-back').textContent='\u2190 '+T('backMenu');
  document.getElementById('btn-flee').textContent=T('flee');
  document.getElementById('lbl-player-side').textContent=T('playerSide');
  document.getElementById('lbl-bot-side').textContent=T('botSide');
  document.getElementById('btn-skip').textContent=T('skip');
  document.getElementById('btn-pick-again').textContent=T('pickAgain');
  document.getElementById('btn-play-again').textContent=T('playAgain');
  document.getElementById('ult-skip').textContent=T('skip')+' \u25B6\u25B6';
  renderLanguageOptions(document.getElementById('lang-search').value);
  refreshDynamicTexts();
  renderGrid();
}
function refreshDynamicTexts(){
  if(battle){
    document.getElementById('pname').textContent=getCharDisplayName(battle.player);
    document.getElementById('bname').textContent=getCharDisplayName(battle.bot);
    document.getElementById('skill-label').textContent=getCharSkillName(battle.player);
    updateSkillButton();
    updateBars();
  }
}

/* ── NAVIGATION ── */
function showScreen(id){
  document.querySelectorAll('.screen').forEach(function(s){
    s.classList.toggle('hidden',s.id!==id);
  });
}
function goToTitle(){
  stopAllBattleAudio();
  closeGameDialog();
  showScreen('screen-title');
}
function goToSelect(){
  stopAllBattleAudio();
  closeGameDialog();
  selectedId=null;
  renderGrid();
  document.getElementById('btn-start').classList.remove('ready');
  showScreen('screen-select');
}
function goToSettings(){showScreen('screen-settings')}

/* Stop all in-battle audio when leaving battle or going to select/title */
function stopAllBattleAudio(){
  stopBgm();
  if(pendingDamageTimeout){clearTimeout(pendingDamageTimeout);pendingDamageTimeout=null;}
  /* mute both fighter videos */
  var vp=document.getElementById('vid-player');
  var vb=document.getElementById('vid-bot');
  if(vp){vp.pause();vp.src='';}
  if(vb){vb.pause();vb.src='';}
  /* stop fullvid too if playing */
  var fv=document.getElementById('fullvid-player');
  if(fv){fv.pause();fv.src='';}
}

function closeFullvid(){
  var v=document.getElementById('fullvid-player');
  v.pause();v.src='';
  showScreen(prevScreen);
}

function updateLoadingTexts(){
  document.getElementById('loading-title').textContent=T('loadingTitle');
  document.getElementById('loading-subtitle').textContent=T('loadingSubtitle');
}

function setLoadingProgress(done,total,label){
  var safeTotal=Math.max(1,total||1);
  var percent=Math.max(0,Math.min(100,Math.round((done/safeTotal)*100)));
  document.getElementById('loading-fill').style.width=percent+'%';
  document.getElementById('loading-percent').textContent=percent+'%';
  document.getElementById('loading-status').textContent=label||T('loadingStarting');
}

function showLoadingScreen(){
  updateLoadingTexts();
  setLoadingProgress(0,1,T('loadingStarting'));
  document.getElementById('loading-screen').classList.remove('hidden');
}

function hideLoadingScreen(){
  document.getElementById('loading-screen').classList.add('hidden');
}

function collectPreloadAssets(chars){
  var map={};
  chars.forEach(function(c){
    if(c.preview)map[c.preview]=c.name;
    if(c.skill&&c.skill.animation)map[c.skill.animation]=c.skill.name||c.name;
  });
  return Object.keys(map).map(function(url){
    return {url:url,label:map[url]};
  });
}

function preloadAsset(item){
  return fetch(item.url,{cache:'force-cache'}).then(function(response){
    if(!response.ok)throw new Error('Failed to preload '+item.url);
    return response.blob();
  });
}

function preloadGameAssets(chars){
  var assets=collectPreloadAssets(chars);
  if(!assets.length){
    setLoadingProgress(1,1,T('loadingReady'));
    return Promise.resolve();
  }
  var done=0;
  setLoadingProgress(0,assets.length,T('loadingStarting'));
  var jobs=assets.map(function(item){
    setLoadingProgress(done,assets.length,F('loadingAsset',{name:item.label||item.url}));
    return preloadAsset(item).catch(function(){return null;}).then(function(){
      done++;
      var label=done===assets.length?T('loadingReady'):F('loadingAsset',{name:item.label||item.url});
      setLoadingProgress(done,assets.length,label);
    });
  });
  return Promise.all(jobs).then(function(){
    localStorage.setItem('realmClashAssetsReady','1');
  });
}

function openGameDialog(opts){
  var dialog=document.getElementById('game-dialog');
  var cancelBtn=document.getElementById('game-dialog-cancel');
  var confirmBtn=document.getElementById('game-dialog-confirm');
  document.getElementById('game-dialog-title').textContent=opts.title||'';
  document.getElementById('game-dialog-text').textContent=opts.message||'';
  cancelBtn.textContent=opts.cancelText||T('confirmNo');
  confirmBtn.textContent=opts.confirmText||T('okText');
  cancelBtn.classList.toggle('hidden',!opts.showCancel);
  gameDialogAction=typeof opts.onConfirm==='function'?opts.onConfirm:null;
  dialog.classList.add('show');
}

function closeGameDialog(){
  document.getElementById('game-dialog').classList.remove('show');
  gameDialogAction=null;
}

function confirmGameDialog(){
  var action=gameDialogAction;
  closeGameDialog();
  if(action)action();
}

function showInfoDialog(title,message){
  openGameDialog({title:title,message:message,confirmText:T('okText'),showCancel:false});
}

function showConfirmDialog(title,message,onConfirm){
  openGameDialog({
    title:title,
    message:message,
    confirmText:T('confirmYes'),
    cancelText:T('confirmNo'),
    showCancel:true,
    onConfirm:onConfirm
  });
}

/* ── SELECT ── */
function buildCharGrid(){
  var g=document.getElementById('char-grid');
  g.innerHTML='';
  CHARS.forEach(function(c){
    var card=document.createElement('div');
    card.className='char-card';
    card.id='cc-'+c.id;
    card.dataset.id=String(c.id);
    card.onclick=function(){selectChar(c.id)};

    var badge=document.createElement('div');
    badge.className='selected-badge hidden';
    badge.innerHTML='&#10003; <span class="selected-text"></span>';

    var videoWrap=document.createElement('div');
    videoWrap.className='char-video-wrap';

    var video=document.createElement('video');
    video.src=c.preview;
    video.autoplay=true;
    video.loop=true;
    video.muted=true;
    video.playsInline=true;
    video.style.width='100%';
    video.style.height='100%';
    video.style.objectFit='cover';
    video.onerror=function(){video.style.display='none';};

    var hint=document.createElement('span');
    hint.className='char-tap-hint';

    var info=document.createElement('div');
    info.className='char-info';

    var name=document.createElement('div');
    name.className='char-info-name';

    var role=document.createElement('div');
    role.className='char-info-role';

    var stats=document.createElement('div');
    stats.className='char-stats';

    var hp=document.createElement('span');
    hp.className='stat-chip hp';

    var dmg=document.createElement('span');
    dmg.className='stat-chip dmg';

    var en=document.createElement('span');
    en.className='stat-chip';

    stats.appendChild(hp);
    stats.appendChild(dmg);
    stats.appendChild(en);
    info.appendChild(name);
    info.appendChild(role);
    info.appendChild(stats);
    videoWrap.appendChild(video);
    videoWrap.appendChild(hint);
    card.appendChild(badge);
    card.appendChild(videoWrap);
    card.appendChild(info);
    g.appendChild(card);
  });
  charGridBuilt=true;
}

function updateCharCard(c){
  var card=document.getElementById('cc-'+c.id);
  if(!card)return;
  var roleName=(LANGS[lang].roleNames&&LANGS[lang].roleNames[c.role])||c.role;
  var selected=selectedId===c.id;
  card.classList.toggle('selected',selected);
  var badge=card.querySelector('.selected-badge');
  badge.classList.toggle('hidden',!selected);
  badge.querySelector('.selected-text').textContent=T('selected');
  card.querySelector('.char-tap-hint').textContent=T('doubleTapPreview');
  card.querySelector('.char-info-name').textContent=getCharDisplayName(c);
  card.querySelector('.char-info-role').textContent=roleName;
  card.querySelector('.stat-chip.hp').textContent=F('statHp',{value:c.hp});
  card.querySelector('.stat-chip.dmg').textContent=F('statDmg',{value:c.skill.damage});
  card.querySelectorAll('.stat-chip')[2].textContent=F('statEn',{value:c.skill.cost});
}

function renderGrid(){
  if(!charGridBuilt||document.getElementById('char-grid').children.length!==CHARS.length)buildCharGrid();
  CHARS.forEach(updateCharCard);
}

function selectChar(id){
  tapCount++;
  if(tapCount===1){
    tapTimer=setTimeout(function(){
      tapCount=0;sfx('select');
      selectedId=id;renderGrid();
      document.getElementById('btn-start').classList.add('ready');
    },260);
  }else{
    clearTimeout(tapTimer);tapCount=0;sfx('confirm');
    var c=CHARS.filter(function(x){return x.id===id})[0];
    /* 2x tap from select → fullscreen WITH audio */
    if(c)openFullvidSrc(c.preview,true,getCharDisplayName(c),'screen-select');
  }
}

function openFullvidSrc(src,withSound,charName,fromScreen){
  prevScreen=fromScreen||'screen-select';
  var v=document.getElementById('fullvid-player');
  var nameEl=document.getElementById('fullvid-charname');
  nameEl.textContent=charName||'';
  /* Audio: only when withSound=true (double-tap preview or in-battle 1x tap) */
  v.muted=!withSound;
  v.src=src;
  v.play().catch(function(){v.muted=true;v.play().catch(function(){})});
  showScreen('screen-fullvid');
}

function openFighterVid(who){
  if(!battle)return;
  var src=who==='player'?battle.player.preview:battle.bot.preview;
  var name=who==='player'?getCharDisplayName(battle.player):getCharDisplayName(battle.bot);
  /* 1x tap in-battle → fullscreen WITH audio */
  openFullvidSrc(src,true,name,'screen-battle');
}

/* ── BATTLE SETUP ── */
function startBattle(){
  if(!selectedId)return;
  var pc=CHARS.filter(function(c){return c.id===selectedId})[0];
  var others=CHARS.filter(function(c){return c.id!==selectedId});
  var bc=others[Math.floor(Math.random()*others.length)];
  lastSelectedId=selectedId;
  battle={
    player:JSON.parse(JSON.stringify(pc)),
    bot:JSON.parse(JSON.stringify(bc))
  };
  battle.player.curHp=pc.hp;battle.player.curEn=0;
  battle.bot.curHp=bc.hp;battle.bot.curEn=0;
  round=0;battleEnded=false;phase='rps';

  /* Fighter panel videos: always MUTED — audio only in fullscreen overlay */
  setVidMuted('vid-player',pc.preview);
  setVidMuted('vid-bot',bc.preview);

  document.getElementById('pname').textContent=getCharDisplayName(pc);
  document.getElementById('bname').textContent=getCharDisplayName(bc);
  document.getElementById('skill-label').textContent=getCharSkillName(pc);
  document.getElementById('skill-cost-label').textContent=F('skillCostInitial',{cost:pc.skill.cost,max:pc.maxEn});

  clearLog();updateBars();
  document.getElementById('result-overlay').classList.remove('show');
  document.getElementById('fp-player').classList.remove('active-turn');
  document.getElementById('fp-bot').classList.remove('active-turn');
  showPhase('rps');
  showScreen('screen-battle');
  startBgm();
  newRound();
}

function replayBattle(){selectedId=lastSelectedId;startBattle()}

/* setVidMuted: in-battle panels are ALWAYS muted — visual only */
function setVidMuted(id,src){
  var v=document.getElementById(id);
  if(!src)return;
  v.muted=true;
  v.src=src;
  v.play().catch(function(){});
}

function confirmFlee(){
  showConfirmDialog(T('fleeTitle'),T('fleeMessage'),function(){
    stopAllBattleAudio();
    goToSelect();
  });
}

/* ── PHASES ── */
function showPhase(p){
  var rps=document.getElementById('rps-area');
  var act=document.getElementById('action-area');
  if(p==='rps'){rps.classList.remove('hidden');act.classList.add('hidden');}
  else{rps.classList.add('hidden');act.classList.remove('hidden');}
}

function newRound(){
  if(battleEnded)return;
  round++;sfx('newround');
  document.getElementById('round-label').textContent=T('roundStart')+' '+round;
  document.getElementById('turn-label').textContent=T('rpsDulu');
  battle.player.curEn=Math.min(battle.player.maxEn,battle.player.curEn+50);
  battle.bot.curEn=Math.min(battle.bot.maxEn,battle.bot.curEn+50);
  updateBars();
  addLog('-- '+T('roundStart')+' '+round+' | '+T('energyGain')+' --','turn');
  showPhase('rps');
  document.getElementById('rps-prompt').innerHTML=T('rpsPrompt')+' '+round+'!<small>'+T('rpsHint')+'</small>';
  document.getElementById('rps-result').textContent='';
  setRpsDisabled(false);
  document.getElementById('fp-player').classList.remove('active-turn');
  document.getElementById('fp-bot').classList.remove('active-turn');
}

function setRpsDisabled(off){
  document.querySelectorAll('.rps-btn').forEach(function(b){b.disabled=off});
}

function playerRPS(choice){
  setRpsDisabled(true);
  var choices=['rock','paper','scissors'];
  var botChoice=choices[Math.floor(Math.random()*3)];
  var RPS_WIN={rock:'scissors',paper:'rock',scissors:'paper'};
  var res=document.getElementById('rps-result');
  var winner,msg;
  var ce=T(choice),be=T(botChoice);
  if(choice===botChoice){msg=ce+' vs '+be+' — '+T('rpsDraw');winner='player';}
  else if(RPS_WIN[choice]===botChoice){msg=ce+' vs '+be+' — '+T('rpsYouWin');winner='player';}
  else{msg=ce+' vs '+be+' — '+T('rpsBotWin');winner='bot';}
  res.textContent=msg;
  addLog('RPS: '+T('rpsYou')+' '+choice+' vs '+T('rpsBot')+' '+botChoice+' > '+(winner==='player'?T('rpsYou'):T('rpsBot'))+' '+T('rpsFirst'),'system');
  setTimeout(function(){startTurn(winner)},900);
}

function startTurn(who){
  if(battleEnded)return;
  phase=who;
  if(who==='player'){
    document.getElementById('fp-player').classList.add('active-turn');
    document.getElementById('fp-bot').classList.remove('active-turn');
    document.getElementById('turn-label').textContent=T('yourTurn');
    showPhase('action');updateSkillButton();
  }else{
    document.getElementById('fp-bot').classList.add('active-turn');
    document.getElementById('fp-player').classList.remove('active-turn');
    document.getElementById('turn-label').textContent=T('botTurn');
    showPhase('action');
    updateSkillButton();
    setTimeout(botAction,1000);
  }
}

function updateSkillButton(){
  var btn=document.getElementById('btn-skill');
  btn.disabled=battle.player.curEn<battle.player.skill.cost;
  document.getElementById('skill-cost-label').textContent=
    'EN: '+battle.player.curEn+'/'+battle.player.maxEn+' ('+battle.player.skill.cost+')';
}

function useSkill(){
  if(phase!=='player'||battleEnded)return;
  if(battle.player.curEn<battle.player.skill.cost)return;
  battle.player.curEn-=battle.player.skill.cost;
  var dmg=battle.player.skill.damage;
  battle.bot.curHp=Math.max(0,battle.bot.curHp-dmg);
  addLog(T('youUsed')+' '+battle.player.skill.name+' > '+dmg+' '+T('damage')+'!','skill');
  sfx('hit');showHit(dmg,'bot');flashPanel('fp-bot');updateBars();
  var dead=battle.bot.curHp<=0;
  playUltimate('player',function(){if(dead)endBattle('player');else endPlayerTurn();});
}

function skipTurn(){
  if(battleEnded)return;
  addLog(T('youSkip'),'system');endPlayerTurn();
}

function endPlayerTurn(){
  phase='bot-turn';
  document.getElementById('fp-player').classList.remove('active-turn');
  document.getElementById('turn-label').textContent=T('botTurn');
  setTimeout(botAction,800);
}

function botAction(){
  if(battleEnded)return;
  var bot=battle.bot;
  if(bot.curEn>=bot.skill.cost){
    bot.curEn-=bot.skill.cost;
    var dmg=bot.skill.damage;
    battle.player.curHp=Math.max(0,battle.player.curHp-dmg);
    addLog(T('botUsed')+' '+bot.skill.name+' > '+dmg+' '+T('damage')+'!','dmg');
    sfx('hit');showHit(dmg,'player');flashPanel('fp-player');updateBars();
    var dead=battle.player.curHp<=0;
    playUltimate('bot',function(){if(dead)endBattle('bot');else endBotTurn();});
  }else{
    addLog(T('botSkip'),'system');updateBars();endBotTurn();
  }
}

function endBotTurn(){
  document.getElementById('fp-bot').classList.remove('active-turn');
  setTimeout(newRound,400);
}

function endBattle(winner){
  battleEnded=true;
  stopBgm();
  var win=winner==='player';sfx(win?'win':'lose');
  document.getElementById('result-title').textContent=win?T('win'):T('lose');
  document.getElementById('result-sub').textContent=win
    ?battle.player.name+' '+T('youWinSub')+' '+battle.bot.name+'!'
    :battle.bot.name+' '+T('youWinSub')+' '+T('rpsYou').toLowerCase()+' di ronde '+round+'.';
  addLog(win?T('youWinLog')+' '+round+'!':T('botWinLog')+' '+round+'.','win');
  setTimeout(function(){document.getElementById('result-overlay').classList.add('show')},500);
}

/* ── ULTIMATE OVERLAY (video WITH audio) ── */
function playUltimate(who,cb){
  var src=who==='player'?battle.player.skill.animation:battle.bot.skill.animation;
  if(!src){cb();return;}
  ultCallback=cb;ultEnded=false;ultWho=who;
  var overlay=document.getElementById('ult-overlay');
  var vid=document.getElementById('ult-video');
  /* Ultimate animation: WITH audio */
  vid.muted=false;
  vid.src=src;vid.currentTime=0;
  overlay.classList.add('show');
  vid.onended=function(){finishUltimate()};
  vid.play().catch(function(){vid.muted=true;vid.play().catch(function(){})});
  vid._safeTimer=setTimeout(finishUltimate,12000);
}

function skipUltimate(){finishUltimate()}

function finishUltimate(){
  if(ultEnded)return;ultEnded=true;
  var overlay=document.getElementById('ult-overlay');
  var vid=document.getElementById('ult-video');
  clearTimeout(vid._safeTimer);vid.onended=null;vid.pause();
  overlay.classList.remove('show');
  if(battle&&ultWho){
    var idle=ultWho==='player'?battle.player.preview:battle.bot.preview;
    setVidMuted(ultWho==='player'?'vid-player':'vid-bot',idle);
  }
  var cb=ultCallback;ultCallback=null;ultWho=null;
  if(cb)cb();
}

function setHpBarState(id,current,max){
  var ratio=max>0?current/max:0;
  var bar=document.getElementById(id);
  bar.classList.remove('hp-mid','hp-low');
  if(ratio<0.3)bar.classList.add('hp-low');
  else if(ratio<0.6)bar.classList.add('hp-mid');
}

function applyBattleDamage(targetSide,dmg,done){
  if(pendingDamageTimeout)clearTimeout(pendingDamageTimeout);
  pendingDamageTimeout=setTimeout(function(){
    pendingDamageTimeout=null;
    var actor=targetSide==='player'?battle.player:battle.bot;
    actor.curHp=Math.max(0,actor.curHp-dmg);
    sfx('hit');
    showHit(dmg,targetSide);
    flashPanel(targetSide==='player'?'fp-player':'fp-bot');
    updateBars();
    setTimeout(function(){
      if(done)done(actor.curHp<=0);
    },520);
  },120);
}

/* ── BARS & LOG ── */
function updateBars(){
  var p=battle.player,b=battle.bot;
  document.getElementById('php-bar').style.width=Math.max(0,p.curHp/p.hp*100)+'%';
  document.getElementById('bhp-bar').style.width=Math.max(0,b.curHp/b.hp*100)+'%';
  setHpBarState('php-bar',p.curHp,p.hp);
  setHpBarState('bhp-bar',b.curHp,b.hp);
  document.getElementById('pen-bar').style.width=(p.curEn/p.maxEn*100)+'%';
  document.getElementById('ben-bar').style.width=(b.curEn/b.maxEn*100)+'%';
  document.getElementById('php-txt').textContent=Math.max(0,p.curHp)+'/'+p.hp;
  document.getElementById('bhp-txt').textContent=Math.max(0,b.curHp)+'/'+b.hp;
  document.getElementById('pen-txt').textContent=p.curEn+'/'+p.maxEn;
  document.getElementById('ben-txt').textContent=b.curEn+'/'+b.maxEn;
  if(phase==='player')updateSkillButton();
}
function addLog(msg,cls){
  var lb=document.getElementById('log-box');
  var d=document.createElement('div');d.className='log-line '+(cls||'');
  d.textContent=msg;lb.appendChild(d);lb.scrollTop=lb.scrollHeight;
}
function clearLog(){document.getElementById('log-box').innerHTML=''}
function showHit(dmg,who){
  var panel=document.getElementById(who==='player'?'fp-player':'fp-bot');
  var el=document.createElement('div');el.className='hit-number';
  el.textContent='-'+dmg;el.style.cssText='top:30%;left:50%;transform:translateX(-50%)';
  panel.appendChild(el);setTimeout(function(){el.remove()},1100);
}
function flashPanel(id){
  var el=document.getElementById(id);el.classList.add('flash-dmg');
  setTimeout(function(){el.classList.remove('flash-dmg')},350);
}

/* ── INIT ── */
renderGrid();
showScreen('screen-title');

document.addEventListener('click',function(e){
  var picker=document.getElementById('lang-picker');
  if(picker&&!picker.contains(e.target))closeLangDropdown();
});

handleBgmFile=function(file){
  if(!file)return;
  bgmFileName=file.name;
  if(bgmBlobUrl)URL.revokeObjectURL(bgmBlobUrl);
  bgmBlobUrl=URL.createObjectURL(file);
  if(!bgmAudio)bgmAudio=new Audio();
  bgmAudio.src=bgmBlobUrl;
  bgmAudio.volume=volBgm;
  bgmAudio.loop=true;
  document.getElementById('bgm-status').textContent=T('bgmLoaded')+': '+bgmFileName;
  document.getElementById('bgm-controls').classList.remove('hidden');
  document.getElementById('bgm-play-pause').textContent='\u25B6 '+T('preview');
  bgmPreviewing=false;
};

removeBgm=function(){
  stopBgm();bgmPreviewing=false;bgmFileName='';
  if(bgmBlobUrl){URL.revokeObjectURL(bgmBlobUrl);bgmBlobUrl=null;}
  bgmAudio=null;
  document.getElementById('bgm-status').textContent=T('bgmRemoved');
  document.getElementById('bgm-controls').classList.add('hidden');
  document.getElementById('bgm-play-pause').textContent='\u25B6 '+T('preview');
};

renderGrid=function(){
  if(!charGridBuilt||document.getElementById('char-grid').children.length!==CHARS.length)buildCharGrid();
  CHARS.forEach(updateCharCard);
};

openFighterVid=function(who){
  if(!battle)return;
  var src=who==='player'?battle.player.preview:battle.bot.preview;
  var name=who==='player'?getCharDisplayName(battle.player):getCharDisplayName(battle.bot);
  openFullvidSrc(src,true,name,'screen-battle');
};

startBattle=function(){
  if(!selectedId)return;
  var pc=CHARS.filter(function(c){return c.id===selectedId})[0];
  var others=CHARS.filter(function(c){return c.id!==selectedId});
  if(!pc||!others.length)return;
  closeGameDialog();
  var bc=others[Math.floor(Math.random()*others.length)];
  lastSelectedId=selectedId;
  battle={player:JSON.parse(JSON.stringify(pc)),bot:JSON.parse(JSON.stringify(bc))};
  battle.player.curHp=pc.hp;battle.player.curEn=0;
  battle.bot.curHp=bc.hp;battle.bot.curEn=0;
  round=0;battleEnded=false;phase='rps';
  setVidMuted('vid-player',pc.preview);
  setVidMuted('vid-bot',bc.preview);
  document.getElementById('pname').textContent=getCharDisplayName(pc);
  document.getElementById('bname').textContent=getCharDisplayName(bc);
  document.getElementById('skill-label').textContent=getCharSkillName(pc);
  document.getElementById('skill-cost-label').textContent=F('skillCostInitial',{cost:pc.skill.cost,max:pc.maxEn});
  clearLog();updateBars();
  document.getElementById('result-overlay').classList.remove('show');
  document.getElementById('fp-player').classList.remove('active-turn');
  document.getElementById('fp-bot').classList.remove('active-turn');
  showPhase('rps');
  showScreen('screen-battle');
  startBgm();
  newRound();
};

playerRPS=function(choice){
  setRpsDisabled(true);
  var choices=['rock','paper','scissors'];
  var botChoice=choices[Math.floor(Math.random()*3)];
  var RPS_WIN={rock:'scissors',paper:'rock',scissors:'paper'};
  var res=document.getElementById('rps-result');
  var winner,msg;
  var ce=T(choice),be=T(botChoice);
  if(choice===botChoice){msg=ce+' vs '+be+' - '+T('rpsDraw');winner='player';}
  else if(RPS_WIN[choice]===botChoice){msg=ce+' vs '+be+' - '+T('rpsYouWin');winner='player';}
  else{msg=ce+' vs '+be+' - '+T('rpsBotWin');winner='bot';}
  res.textContent=msg;
  addLog(F('rpsLog',{player:T('rpsYou'),playerChoice:ce,bot:T('rpsBot'),botChoice:be,winner:winner==='player'?T('rpsYou'):T('rpsBot'),first:T('rpsFirst')}),'system');
  setTimeout(function(){startTurn(winner)},900);
};

updateSkillButton=function(){
  var btn=document.getElementById('btn-skill');
  var skipBtn=document.getElementById('btn-skip');
  var canAct=phase==='player'&&!battleEnded;
  var enoughEnergy=battle.player.curEn>=battle.player.skill.cost;
  btn.disabled=!canAct;
  skipBtn.disabled=!canAct;
  skipBtn.classList.toggle('alert',canAct&&!enoughEnergy);
  document.getElementById('skill-label').textContent=getCharSkillName(battle.player);
  document.getElementById('skill-cost-label').textContent=F('skillCost',{current:battle.player.curEn,max:battle.player.maxEn,cost:battle.player.skill.cost});
};

useSkill=function(){
  if(phase!=='player'||battleEnded)return;
  if(battle.player.curEn<battle.player.skill.cost){
    showInfoDialog(T('notEnoughEnergyTitle'),T('notEnoughEnergyMessage'));
    return;
  }
  battle.player.curEn-=battle.player.skill.cost;
  var dmg=battle.player.skill.damage;
  addLog(T('youUsed')+' '+getCharSkillName(battle.player)+' > '+dmg+' '+T('damage')+'!','skill');
  updateBars();
  playUltimate('player',function(){
    applyBattleDamage('bot',dmg,function(dead){
      if(dead)endBattle('player');
      else endPlayerTurn();
    });
  });
};

handleSkillPress=function(){
  if(phase!=='player'||battleEnded)return;
  if(battle.player.curEn<battle.player.skill.cost){sfx('back');}
  else{sfx('skill');}
  useSkill();
};

skipTurn=function(){
  if(phase!=='player'||battleEnded)return;
  addLog(T('youSkip'),'system');
  endPlayerTurn();
};

handleSkipPress=function(){
  if(phase!=='player'||battleEnded)return;
  sfx('tap');
  skipTurn();
};

endPlayerTurn=function(){
  phase='bot-turn';
  document.getElementById('fp-player').classList.remove('active-turn');
  document.getElementById('turn-label').textContent=T('botTurn');
  updateSkillButton();
  setTimeout(botAction,800);
};

botAction=function(){
  if(battleEnded)return;
  phase='bot-turn';
  updateSkillButton();
  var bot=battle.bot;
  if(bot.curEn>=bot.skill.cost){
    bot.curEn-=bot.skill.cost;
    var dmg=bot.skill.damage;
    addLog(T('botUsed')+' '+getCharSkillName(bot)+' > '+dmg+' '+T('damage')+'!','dmg');
    updateBars();
    playUltimate('bot',function(){
      applyBattleDamage('player',dmg,function(dead){
        if(dead)endBattle('bot');
        else endBotTurn();
      });
    });
  }else{
    addLog(T('botSkip'),'system');updateBars();endBotTurn();
  }
};

endBotTurn=function(){
  document.getElementById('fp-bot').classList.remove('active-turn');
  updateSkillButton();
  setTimeout(newRound,400);
};

endBattle=function(winner){
  battleEnded=true;
  stopBgm();
  var win=winner==='player';sfx(win?'win':'lose');
  document.getElementById('result-title').textContent=win?T('win'):T('lose');
  document.getElementById('result-sub').textContent=win
    ?F('victorySub',{winner:getCharDisplayName(battle.player),loser:getCharDisplayName(battle.bot)})
    :F('defeatSub',{winner:getCharDisplayName(battle.bot),round:round});
  addLog(win?T('youWinLog')+' '+round+'!':T('botWinLog')+' '+round+'.','win');
  setTimeout(function(){document.getElementById('result-overlay').classList.add('show')},500);
};

refreshDynamicTexts=function(){
  if(bgmBlobUrl){
    document.getElementById('bgm-status').textContent=(bgmFileName?T('bgmLoaded')+': '+bgmFileName:T('bgmLoaded'));
  }else if(!bgmAudio){
    document.getElementById('bgm-status').textContent='';
  }
  if(battle){
    document.getElementById('pname').textContent=getCharDisplayName(battle.player);
    document.getElementById('bname').textContent=getCharDisplayName(battle.bot);
    document.getElementById('skill-label').textContent=getCharSkillName(battle.player);
    document.getElementById('round-label').textContent=T('roundStart')+' '+round;
    updateSkillButton();
    updateBars();
  }
};

selectChar=function(id){
  tapCount++;
  if(tapCount===1){
    tapTimer=setTimeout(function(){
      tapCount=0;sfx('select');
      selectedId=id;renderGrid();
      document.getElementById('btn-start').classList.add('ready');
    },260);
  }else{
    clearTimeout(tapTimer);tapCount=0;sfx('confirm');
    var c=CHARS.filter(function(x){return x.id===id})[0];
    if(c)openFullvidSrc(c.preview,true,getCharDisplayName(c),'screen-select');
  }
};

async function initGame(){
  applyLang();
  showLoadingScreen();
  showScreen('screen-title');
  try{
    await loadCharacters();
    if(!localStorage.getItem('realmClashAssetsReady')){
      await preloadGameAssets(CHARS);
    }else{
      setLoadingProgress(1,1,T('loadingReady'));
    }
    renderGrid();
    setTimeout(hideLoadingScreen,250);
  }catch(err){
    console.error(err);
    document.getElementById('bgm-status').textContent='characters.json gagal dimuat';
    renderGrid();
    hideLoadingScreen();
  }
}

initGame();
