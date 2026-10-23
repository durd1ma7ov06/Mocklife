// IELTIX Live Call Mini App Client
(function () {
  // Telegram WebApp initialization
  if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
  }

  // Parse session parameters
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token') || '';
  const userId = parseInt(params.get('user_id') || '0', 10);
  const userLocale = params.get('locale') || 'uz';
  const apiBase = params.get('api_base') || window.location.origin;

  // DOM Elements
  const statusLabel = document.getElementById('statusLabel');
  const partBadge = document.getElementById('partBadge');
  const avatarWrapper = document.getElementById('avatarWrapper');
  const transcriptList = document.getElementById('transcriptList');
  const transcriptViewport = document.getElementById('transcriptViewport');
  const micBtn = document.getElementById('micBtn');
  const interruptBtn = document.getElementById('interruptBtn');
  const toggleKeyboardBtn = document.getElementById('toggleKeyboardBtn');
  const textInputPanel = document.getElementById('textInputPanel');
  const manualTextInput = document.getElementById('manualTextInput');
  const sendTextBtn = document.getElementById('sendTextBtn');
  const dockHint = document.getElementById('dockHint');
  const examinerAudio = document.getElementById('examinerAudio');
  const waveformCanvas = document.getElementById('waveformCanvas');
  const reportModal = document.getElementById('reportModal');
  const reportBand = document.getElementById('reportBand');
  const criteriaGrid = document.getElementById('criteriaGrid');
  const recommendationsList = document.getElementById('recommendationsList');
  const closeReportBtn = document.getElementById('closeReportBtn');
  const endCallBtn = document.getElementById('endCallBtn');

  // State
  let mediaRecorder = null;
  let audioChunks = [];
  let isRecording = false;
  let audioContext = null;
  let analyser = null;
  let animFrameId = null;

  // Canvas visualizer
  const canvasCtx = waveformCanvas.getContext('2d');

  function drawIdleWaveform() {
    canvasCtx.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);
    canvasCtx.beginPath();
    canvasCtx.moveTo(0, waveformCanvas.height / 2);
    canvasCtx.lineTo(waveformCanvas.width, waveformCanvas.height / 2);
    canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    canvasCtx.lineWidth = 2;
    canvasCtx.stroke();
  }
  drawIdleWaveform();

  function startVisualizer(stream) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      function render() {
        if (!isRecording) {
          drawIdleWaveform();
          return;
        }
        animFrameId = requestAnimationFrame(render);
        analyser.getByteFrequencyData(dataArray);

        canvasCtx.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);
        const barWidth = (waveformCanvas.width / bufferLength) * 1.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * waveformCanvas.height * 0.9;
          const gradient = canvasCtx.createLinearGradient(0, waveformCanvas.height, 0, 0);
          gradient.addColorStop(0, '#06b6d4');
          gradient.addColorStop(1, '#6366f1');

          canvasCtx.fillStyle = gradient;
          canvasCtx.fillRect(x, waveformCanvas.height - barHeight, barWidth - 2, barHeight);
          x += barWidth;
        }
      }
      render();
    } catch (e) {
      console.warn('AudioContext not started:', e);
    }
  }

  function appendBubble(sender, text, lang) {
    const bubble = document.createElement('div');
    bubble.className = `bubble bubble-${sender}`;

    const meta = document.createElement('div');
    meta.className = 'bubble-meta';
    meta.innerHTML = `<span>${sender === 'examiner' ? 'Examiner 🦊' : 'Siz / You'}</span><span>${(lang || 'en').toUpperCase()}</span>`;

    const content = document.createElement('div');
    content.textContent = text;

    bubble.appendChild(meta);
    bubble.appendChild(content);
    transcriptList.appendChild(bubble);
    transcriptViewport.scrollTop = transcriptViewport.scrollHeight;
  }

  function setExaminerState(state, text) {
    avatarWrapper.classList.remove('speaking', 'listening');
    if (state === 'speaking') {
      avatarWrapper.classList.add('speaking');
      statusLabel.textContent = text || 'Examiner gapirmoqda...';
    } else if (state === 'listening') {
      avatarWrapper.classList.add('listening');
      statusLabel.textContent = text || 'Sizni tinglamoqda... / Listening...';
    } else if (state === 'thinking') {
      statusLabel.textContent = text || 'Tahlil qilinmoqda... / Processing...';
    } else {
      statusLabel.textContent = text || 'Tayyor / Ready';
    }
  }

  // Interruption / Barge-in
  function stopExaminerAudio() {
    if (!examinerAudio.paused) {
      examinerAudio.pause();
      examinerAudio.currentTime = 0;
    }
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    setExaminerState('idle', 'Tayyor / Ready');
  }

  interruptBtn.addEventListener('click', stopExaminerAudio);

  // Play examiner speech
  function playExaminerTurn(turn) {
    appendBubble('examiner', turn.examiner_text, turn.detected_language);
    if (turn.part) {
      partBadge.textContent = `Part ${turn.part}`;
    }

    if (turn.completed && turn.report) {
      showReport(turn.report);
      return;
    }

    if (turn.audio_base64 && turn.audio_mime_type) {
      setExaminerState('speaking', 'Examiner gapirmoqda...');
      examinerAudio.src = `data:${turn.audio_mime_type};base64,${turn.audio_base64}`;
      examinerAudio.play().catch(e => console.warn('Autoplay prevented:', e));
      examinerAudio.onended = () => {
        setExaminerState('listening', 'Sizning navbatingiz / Your turn');
      };
    } else if ('speechSynthesis' in window) {
      // Fallback to browser SpeechSynthesis
      setExaminerState('speaking', 'Examiner gapirmoqda...');
      const utterance = new SpeechSynthesisUtterance(turn.examiner_text);
      utterance.lang = turn.detected_language === 'uz' ? 'uz-UZ' : 'en-US';
      utterance.onend = () => {
        setExaminerState('listening', 'Sizning navbatingiz / Your turn');
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setExaminerState('listening', 'Sizning navbatingiz / Your turn');
    }
  }

  // Toggle keyboard / text input fallback
  toggleKeyboardBtn.addEventListener('click', () => {
    const isVisible = textInputPanel.style.display !== 'none';
    textInputPanel.style.display = isVisible ? 'none' : 'flex';
    if (!isVisible) {
      manualTextInput.focus();
    }
  });

  // Send typed text turn
  async function submitTextTurn(text) {
    if (!text.trim()) return;
    stopExaminerAudio();
    appendBubble('user', text, userLocale);
    setExaminerState('thinking', 'Tahlil qilinmoqda...');
    manualTextInput.value = '';

    try {
      const res = await fetch(`${apiBase}/api/live-call/turns/text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, user_id: userId, text })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to submit response');
      }
      const data = await res.json();
      playExaminerTurn(data);
    } catch (err) {
      statusLabel.textContent = `Xatolik: ${err.message}`;
    }
  }

  sendTextBtn.addEventListener('click', () => submitTextTurn(manualTextInput.value));
  manualTextInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitTextTurn(manualTextInput.value);
  });

  // Audio recording & STT Turn
  async function startRecording() {
    stopExaminerAudio();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      startVisualizer(stream);

      audioChunks = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        isRecording = false;
        micBtn.classList.remove('recording');
        dockHint.textContent = 'Javob tahlil qilinmoqda...';
        setExaminerState('thinking', 'Ovoz tahlil qilinmoqda...');

        const audioBlob = new Blob(audioChunks, { type: mimeType });
        const formData = new FormData();
        formData.append('token', token);
        formData.append('user_id', userId.toString());
        formData.append('audio', audioBlob, 'turn.webm');

        try {
          const res = await fetch(`${apiBase}/api/live-call/turns/audio`, {
            method: 'POST',
            body: formData,
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Audio submission failed');
          }
          const data = await res.json();
          appendBubble('user', data.transcript, data.detected_language);
          dockHint.textContent = 'Mikrofonni bosing va gapiring';
          playExaminerTurn(data);
        } catch (err) {
          dockHint.textContent = 'Yozma rejimdan foydalanishingiz mumkin';
          statusLabel.textContent = `Ovoz xatosi: ${err.message}`;
        }
      };

      mediaRecorder.start();
      isRecording = true;
      micBtn.classList.add('recording');
      dockHint.textContent = 'Gapiring... Tugatish uchun mikrofonni yana bosing';
      setExaminerState('listening', 'Siz gapiryapsiz...');
    } catch (err) {
      console.warn('Microphone error:', err);
      dockHint.textContent = 'Mikrofonga ruxsat berilmadi. Klaviatura orqali yozing.';
      textInputPanel.style.display = 'flex';
    }
  }

  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  }

  micBtn.addEventListener('click', () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  });

  // End Call & Show Report
  function showReport(report) {
    reportBand.textContent = (report.band || 6.5).toFixed(1);
    criteriaGrid.innerHTML = `
      <div class="criterion-card"><div class="crit-name">Fluency & Coherence</div><div class="crit-band">${report.fluency || 6.5}</div></div>
      <div class="criterion-card"><div class="crit-name">Lexical Resource</div><div class="crit-band">${report.vocabulary || 6.5}</div></div>
      <div class="criterion-card"><div class="crit-name">Grammar Accuracy</div><div class="crit-band">${report.grammar || 6.5}</div></div>
      <div class="criterion-card"><div class="crit-name">Pronunciation</div><div class="crit-band">${report.pronunciation || 6.5}</div></div>
    `;

    recommendationsList.innerHTML = `
      <li>IELTS talablariga muvofiq javoblarni qisqa emas, ko'proq sabab va misollar bilan kengaytiring.</li>
      <li>Turli xil linking words (furthermore, on the other hand, consequently) dan faol foydalaning.</li>
    `;
    reportModal.style.display = 'flex';
  }

  closeReportBtn.addEventListener('click', () => {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.close();
    } else {
      reportModal.style.display = 'none';
    }
  });

  endCallBtn.addEventListener('click', () => {
    if (confirm('Suhbatni yakunlamoqchimisiz?')) {
      if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.close();
      } else {
        window.close();
      }
    }
  });

  // Initial welcome greeting
  const initialGreeting = userLocale === 'uz'
    ? "Salom! Men IELTIX AI Speaking Examineriman. Tayyor bo'lsangiz, birinchi savolim: What do you like most about your hometown?"
    : "Hello! I am your IELTIX AI Speaking Examiner. Let's begin Part 1: What do you like most about your hometown?";
  
  playExaminerTurn({
    examiner_text: initialGreeting,
    detected_language: userLocale,
    part: 1
  });
})();
