(function chatLogic(){
      const endpoint = '/api/chat'; // <<< ajuste aqui para sua API (rota POST)
      const messagesEl = document.getElementById('chatMessages');
      const inputEl = document.getElementById('chatInput');
      const sendBtn = document.getElementById('sendBtn');

      /** Estado simples de histórico que você pode enviar para a API. */
      const history = []; // { role: 'user'|'assistant', content: string }[]

      function appendMessage(role, content, className) {
        const div = document.createElement('div');
        div.className = `msg ${className || (role === 'user' ? 'user' : 'bot')}`;
        div.textContent = content;
        messagesEl.appendChild(div);
        messagesEl.scrollTop = messagesEl.scrollHeight;
        return div;
      }

      function appendTyping() {
        const div = document.createElement('div');
        div.className = 'msg bot';
        const span = document.createElement('span');
        span.className = 'typing';
        span.textContent = 'digitando…';
        div.appendChild(span);
        messagesEl.appendChild(div);
        messagesEl.scrollTop = messagesEl.scrollHeight;
        return div;
      }

      async function sendMessage() {
        const text = inputEl.value.trim();
        if (!text) return;
        inputEl.value = '';

        history.push({ role: 'user', content: text });
        appendMessage('user', text);
        const typing = appendTyping();

        try {
          const resp = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, history })
          });

          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          const data = await resp.json(); // esperado: { reply: string }
          const reply = (data && (data.reply || data.answer || data.text)) || 'Sem resposta.';

          typing.remove();
          history.push({ role: 'assistant', content: reply });
          appendMessage('assistant', reply);
        } catch (err) {
          typing.remove();
          console.error('Erro na chamada da API', err);
          appendMessage('assistant', 'Desculpa, houve um problema ao falar com a IA. Tente novamente.', 'error');
        }
      }

      // Autosize simples do textarea
      function autoSize() {
        inputEl.style.height = 'auto';
        inputEl.style.height = Math.min(inputEl.scrollHeight, 160) + 'px';
      }

      inputEl.addEventListener('input', autoSize);
      autoSize();

      // Enter envia / Shift+Enter quebra linha
      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      });
      sendBtn.addEventListener('click', sendMessage);
    })();