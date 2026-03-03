// Sample images (portrait oriented via query params)
// overlay helpers
function showOverlay(item){
  const overlay = document.getElementById('overlay');
  const overlayImg = document.getElementById('overlayImg');
  const overlayVideo = document.getElementById('overlayVideo');
  if(!overlay) return;

  // Build animation video path from caption (lowercase)
  const videoPath = `./asset/Animation/${item.caption.toLowerCase()}.mp4`;

  // Try video first
  if(overlayVideo){
    overlayVideo.src = videoPath;
    overlayVideo.onerror = () => {
      // Video load failed, show image instead
      overlayVideo.style.display = 'none';
      overlayImg.src = item.src;
      overlayImg.alt = item.caption || 'Photo';
      overlayImg.style.display = 'block';
    };
    overlayVideo.onloadedmetadata = () => {
      // Video loaded successfully
      overlayVideo.style.display = 'block';
      overlayImg.style.display = 'none';
    };
  } else {
    // Fallback: no video element, show image
    overlayImg.src = item.src;
    overlayImg.style.display = 'block';
  }

  overlay.setAttribute('aria-hidden','false');
}

function closeOverlay(){
  const overlay = document.getElementById('overlay');
  if(!overlay) return;
  overlay.setAttribute('aria-hidden','true');
  const overlayImg = document.getElementById('overlayImg');
  const overlayVideo = document.getElementById('overlayVideo');
  if(overlayImg) overlayImg.src = '';
  if(overlayVideo){
    overlayVideo.pause();
    overlayVideo.src = '';
  }
}

// attach close button once DOM loaded
function initOverlay(){
  const closeBtn = document.getElementById('overlayClose');
  if(closeBtn) closeBtn.addEventListener('click', closeOverlay);
  // also close when clicking outside image
  const overlay = document.getElementById('overlay');
  if(overlay) overlay.addEventListener('click', e => {
    if(e.target === overlay) closeOverlay();
  });
}

// Sample images (portrait oriented via query params)
const images = [
  {src: './asset/Characters/bara.jpeg', star:'💪' , caption:'Bara'},
  {src: './asset/Characters/elfie.jpeg', star:'🏹' , caption:'Elfie'},
  {src: './asset/Characters/onyx.jpeg', star:'☠️' , caption:'Onyx'},
  {src: './asset/Characters/yume.jpeg', star:'🥕' , caption:'Yume'},
  {src: './asset/Characters/kaiju.jpeg', star:'🐲' , caption:'Kaiju'},
  {src: './asset/Characters/nimrod.jpeg', star:'🌊' , caption:'Nimrod'},
  {src: './asset/Characters/rook.jpeg', star:'🗡️' , caption:'Rook'},
  {src: './asset/Characters/wage.jpeg', star:'🔮' , caption:'Wage'},
  {src: './asset/Characters/lyn.jpeg', star:'🎀' , caption:'Lyn'},
  {src: './asset/Characters/renard.jpeg', star:'⭐' , caption:'Renard'},
  {src: './asset/Characters/hera.jpeg', star:'🤖' , caption:'Hera'},
  {src: './asset/Characters/ferin.jpeg', star:'🍁' , caption:'Ferin'},
  {src: './asset/Characters/val.jpeg', star:'🕯️' , caption:'Val'},
  {src: './asset/Characters/fedz.jpeg', star:'♠️' , caption:'Fedz'},
  {src: './asset/Characters/nia.jpeg', star:'🌷' , caption:'Nia'}
];

function makeCard(item){
  const card = document.createElement('div');
  card.className = 'card';

  const img = document.createElement('img');
  img.src = item.src;
  img.alt = item.caption || 'Photo';
  img.loading = 'lazy';

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.innerHTML = `<div class="likes"><span class="heart">${item.star}</span></div><div class="caption">${item.caption}</div>`;

  card.appendChild(img);
  card.appendChild(meta);

  // open overlay when clicking card
  card.addEventListener('click', () => showOverlay(item));

  return card;
}

function renderGallery(){
  const gallery = document.getElementById('gallery');
  if(!gallery) return;
  images.forEach(img => gallery.appendChild(makeCard(img)));
}

document.addEventListener('DOMContentLoaded', () => {
  renderGallery();
  initOverlay();
});

