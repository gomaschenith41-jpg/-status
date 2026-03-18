// YouTube Data API Key
var API_KEY = 'AIzaSyBTDUosPUGMI6pFHXz_VDLFkv-BPI4_eKI';

var CHANNEL_HANDLE   = '_dkking_';
var CHANNEL_DIRECT_ID = '';
var MAX_RESULTS      = 20;
var REFRESH_MS       = 30 * 60 * 1000;

var grid      = document.getElementById('feedGrid');
var statsBar  = document.getElementById('statsBar');
var statCount = document.getElementById('statCount');
var statTime  = document.getElementById('statTime');
var lastUpd   = document.getElementById('lastUpd');
var setupBox  = document.getElementById('setupBox');

// modal refs
var overlay    = document.getElementById('modalOverlay');
var modalTitle = document.getElementById('modalTitle');
var modalIframe= document.getElementById('modalIframe');
var modalStats = document.getElementById('modalStats');
var modalMeta  = document.getElementById('modalMeta');
var modalYtBtn = document.getElementById('modalYtBtn');
var prevBtn    = document.getElementById('prevBtn');
var nextBtn    = document.getElementById('nextBtn');

var allVideos  = [];
var currentIdx = 0;

function fmtNum(n) {
  n = parseInt(n) || 0;
  if (n >= 1e9) return (n/1e9).toFixed(1)+'B';
  if (n >= 1e6) return (n/1e6).toFixed(1)+'M';
  if (n >= 1e3) return (n/1e3).toFixed(1)+'K';
  return n.toLocaleString();
}
function esc(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'});
}

function openModal(idx) {
  currentIdx = idx;
  var v = allVideos[idx];
  if (!v) return;

  var videoId = v.id;
  var title   = v.snippet.title || 'YouTube Short';
  var views   = (v.statistics && v.statistics.viewCount) ? fmtNum(v.statistics.viewCount) : '';
  var likes   = (v.statistics && v.statistics.likeCount) ? fmtNum(v.statistics.likeCount) : '';
  var date    = fmtDate(v.snippet.publishedAt);
  var ytUrl   = 'https://www.youtube.com/shorts/' + videoId;

  modalTitle.textContent = title;
  var embedParams = '?autoplay=1&mute=0&rel=0&playsinline=1&enablejsapi=1&modestbranding=1&fs=1';
  modalIframe.src = 'https://www.youtube-nocookie.com/embed/' + videoId + embedParams;
  modalYtBtn.href = ytUrl;

  var statsHtml = '';
  if (views) statsHtml += '<span class="modal-stat"><svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>'+views+' views</span>';
  if (likes) statsHtml += '<span class="modal-stat"><svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>'+likes+'</span>';
  modalStats.innerHTML = statsHtml;
  modalMeta.textContent = date;

  prevBtn.disabled = (idx === 0);
  nextBtn.disabled = (idx === allVideos.length - 1);

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  overlay.classList.remove('open');
  modalIframe.src = '';
  document.body.style.overflow = '';
}

function handleOverlayClick(e) {
  if (e.target === overlay) closeModal();
}

function navigateModal(dir) {
  var next = currentIdx + dir;
  if (next >= 0 && next < allVideos.length) openModal(next);
}

document.addEventListener('keydown', function(e) {
  if (!overlay.classList.contains('open')) return;
  if (e.key === 'Escape') closeModal();
  if (e.key === 'ArrowLeft') navigateModal(-1);
  if (e.key === 'ArrowRight') navigateModal(1);
});

function buildCard(v, i) {
  var thumb = v.snippet.thumbnails.high || v.snippet.thumbnails.medium || v.snippet.thumbnails.default || {};
  var title = v.snippet.title || 'Watch Short';
  var views = (v.statistics && v.statistics.viewCount) ? fmtNum(v.statistics.viewCount) : '';
  var likes = (v.statistics && v.statistics.likeCount) ? fmtNum(v.statistics.likeCount) : '';
  var date  = fmtDate(v.snippet.publishedAt);

  return '<div class="card" style="animation-delay:'+(i*.04)+'s;cursor:pointer;" onclick="openModal('+i+')">'+
    '<div class="thumb">'+
      (thumb.url ? '<img src="'+esc(thumb.url)+'" alt="" loading="lazy" />' : '')+
      '<div class="thumb-grad"></div>'+
      '<span class="shorts-badge">SHORTS</span>'+
      '<div class="play-ring"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>'+
      '<div class="thumb-stats">'+
        (views ? '<span class="ts"><svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>'+views+'</span>' : '')+
        (likes ? '<span class="ts"><svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>'+likes+'</span>' : '')+
      '</div>'+
    '</div>'+
    '<div class="card-body">'+
      '<p class="desc">'+esc(title)+'</p>'+
      '<p class="meta">'+esc(date)+'</p>'+
    '</div>'+
  '</div>';
}

function showError(msg, detail) {
  grid.innerHTML = '<div class="err-box">'+
    '<span class="ei">&#9888;</span>'+
    '<h3>'+esc(msg)+'</h3>'+
    '<p>'+esc(detail||'')+'</p>'+
    '<button class="retry-btn" onclick="init()">&#x21BA; &nbsp;Retry</button>'+
  '</div>';
}

function getChannelId() {
  if (CHANNEL_DIRECT_ID) return Promise.resolve({ id: CHANNEL_DIRECT_ID });
  var url = 'https://www.googleapis.com/youtube/v3/channels'
    +'?part=id,contentDetails'
    +'&forHandle='+encodeURIComponent(CHANNEL_HANDLE)
    +'&key='+API_KEY;
  return fetch(url)
    .then(function(r){ return r.json(); })
    .then(function(d){
      if (d.error) throw new Error(d.error.message);
      if (!d.items || d.items.length === 0) throw new Error('Channel not found: @'+CHANNEL_HANDLE);
      CHANNEL_DIRECT_ID = d.items[0].id;
      return d.items[0];
    });
}

function getShortsFromChannel(channel) {
  var uploadsId;
  if (channel.contentDetails && channel.contentDetails.relatedPlaylists) {
    uploadsId = channel.contentDetails.relatedPlaylists.uploads;
  }
  if (!uploadsId) uploadsId = 'UU' + CHANNEL_DIRECT_ID.slice(2);

  var playlistUrl = 'https://www.googleapis.com/youtube/v3/playlistItems'
    +'?part=snippet,contentDetails'
    +'&playlistId='+encodeURIComponent(uploadsId)
    +'&maxResults=50'
    +'&key='+API_KEY;

  return fetch(playlistUrl)
    .then(function(r){ return r.json(); })
    .then(function(d){
      if (d.error) throw new Error(d.error.message);
      var ids = (d.items||[]).map(function(item){
        return item.contentDetails.videoId || item.snippet.resourceId.videoId;
      }).filter(Boolean);
      if (ids.length === 0) throw new Error('No videos found');
      return ids;
    })
    .then(function(ids){
      var vUrl = 'https://www.googleapis.com/youtube/v3/videos'
        +'?part=snippet,contentDetails,statistics'
        +'&id='+ids.join(',')
        +'&key='+API_KEY;
      return fetch(vUrl).then(function(r){ return r.json(); });
    })
    .then(function(d){
      if (d.error) throw new Error(d.error.message);
      var items = d.items || [];
      var shorts = items.filter(function(v){
        var dur  = v.contentDetails && v.contentDetails.duration || '';
        var secs = parseDuration(dur);
        return secs > 0 && secs <= 180;
      });
      if (shorts.length === 0) shorts = items;
      return shorts.slice(0, MAX_RESULTS);
    });
}

function parseDuration(dur) {
  if (!dur) return 0;
  var m = dur.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return ((parseInt(m[1])||0)*3600) + ((parseInt(m[2])||0)*60) + (parseInt(m[3])||0);
}

function renderVideos(videos) {
  if (!videos || videos.length === 0) {
    showError('Videos load වුනේ නෑ', 'Channel එකේ public Shorts නැති වෙන්න පුළුවන්.');
    return;
  }
  allVideos = videos;
  var html = '';
  videos.forEach(function(v,i){ html += buildCard(v,i); });
  grid.innerHTML = html;

  statsBar.style.display = 'flex';
  statCount.textContent = videos.length;
  var now = new Date();
  var t = now.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
  statTime.textContent = t;
  lastUpd.textContent = 'Last updated: '+now.toLocaleDateString('en-US',{month:'short',day:'numeric'})+' · '+t;
}

function init() {
  if (API_KEY === 'YOUR_YOUTUBE_API_KEY') {
    setupBox.style.display = 'block';
    showError('API Key set කරලා නෑ', 'JS file එකේ API_KEY එක paste කරන්න.');
    return;
  }
  setupBox.style.display = 'none';
  grid.innerHTML = '<div class="skel"><div class="skel-thumb"></div><div class="skel-body"><div class="skel-line"></div><div class="skel-line w70"></div><div class="skel-line w45"></div></div></div>'.repeat(6);

  getChannelId()
    .then(function(ch){ return getShortsFromChannel(ch); })
    .then(renderVideos)
    .catch(function(err){
      console.error('YouTube feed error:', err);
      showError('Feed load කරන්ට බෑ', err.message);
    });
}

init();
setInterval(init, REFRESH_MS);