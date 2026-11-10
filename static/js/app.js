const recordBtn = document.getElementById('recordBtn');
const waveform = document.getElementById('waveform');
const status = document.getElementById('status');
const soundList = document.getElementById('soundList');
const emptyMsg = document.getElementById('emptyMsg');

let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let currentStream = null;

for (let i = 0; i < 9; i++) {
    const bar = document.createElement('div');
    waveform.appendChild(bar);
}

recordBtn.addEventListener('click', async () => {
    if (!isRecording) {
        await startRecording();
    } else {
        stopRecording();
    }
});

async function startRecording() {
    try {
        currentStream = await navigator.mediaDevices.getUserMedia({audio: true});
        mediaRecorder = new MediaRecorder(currentStream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunks.push(e.data);
        };

        mediaRecorder.onstop = async () => {
            const blob = new Blob(audioChunks, {type: 'audio/webm'});
            await uploadSound(blob);
            currentStream.getTracks().forEach(t => t.stop());
        };

        mediaRecorder.start();
        isRecording = true;
        recordBtn.classList.add('recording');
        waveform.classList.add('active');
        status.textContent = 'در حال ضبط... (برای توقف دوباره بزن)';
    } catch (err) {
        status.textContent = 'دسترسی به میکروفون داده نشد: ' + err.message;
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }
    isRecording = false;
    recordBtn.classList.remove('recording');
    waveform.classList.remove('active');
    status.textContent = 'صدا ذخیره شد';
}

async function uploadSound(blob) {
    const formData = new FormData();
    formData.append('audio', blob, 'sound-' + Date.now() + '.webm');
    formData.append('title', 'صدا ' + new Date().toLocaleTimeString('fa-IR'));

    try {
        const res = await fetch('/api/upload/', {
            method: 'POST',
            body: formData,
        });
        const data = await res.json();
        if (data.id) {
            await loadSounds();
        }
    } catch (err) {
        status.textContent = 'خطا در آپلود: ' + err.message;
    }
}

async function loadSounds() {
    try {
        const res = await fetch('/api/sounds/');
        const data = await res.json();
        renderSounds(data.sounds);
    } catch (err) {
        console.error(err);
    }
}

function renderSounds(sounds) {
    soundList.innerHTML = '';
    if (sounds.length === 0) {
        emptyMsg.style.display = 'block';
        return;
    }
    emptyMsg.style.display = 'none';

    sounds.forEach(sound => {
        const li = document.createElement('li');
        li.className = 'sound-item';
        li.innerHTML = `
            <button class="play-btn" data-url="${sound.url}">▶</button>
            <div class="info">
                <div class="title">${sound.title}</div>
                <div class="date">${sound.created_at}</div>
            </div>
            <button class="delete-btn" data-id="${sound.id}">🗑</button>
        `;
        soundList.appendChild(li);
    });

    soundList.querySelectorAll('.play-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const audio = new Audio(btn.dataset.url);
            audio.play();
        });
    });

    soundList.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            if (!confirm('این صدا حذف بشه؟')) return;
            await fetch(`/api/sounds/${id}/delete/`, {method: 'DELETE'});
            await loadSounds();
        });
    });
}

loadSounds();