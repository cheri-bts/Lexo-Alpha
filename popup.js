// ==========================================
// 0. MENU EXPANDER LOGIC
// ==========================================
document.getElementById("toggles-header").addEventListener("click", () => {
  const container = document.getElementById("toggles-container");
  const header = document.getElementById("toggles-header");

  if (container.style.display === "none") {
    container.style.display = "flex";
    header.innerHTML = "Toggles &#9652;"; // Arrow Up
  } else {
    container.style.display = "none";
    header.innerHTML = "Toggles &#9662;"; // Arrow Down
  }
});

// ==========================================
// 1. DYSLEXIA MODE (Button: apply-btn)
// ==========================================
document.getElementById("apply-btn").addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab.url.startsWith("chrome://") || tab.url.startsWith("edge://")) return; 
// ---> THE NEW GUARD CLAUSE <---
  // Wikipedia edit URLs always contain "action=edit" or "veaction=edit"
  if (tab.url.includes("action=edit") || tab.url.includes("veaction=edit")) {
    alert("Lexo Alpha is optimized for Reading Mode! Please save your edits and return to the main article to use accessibility features.");
    return; // Stops the code from running and breaking the editor!
  }
  // ---> THE NEW UX TEXT TOGGLE <---
  const btn = document.getElementById("apply-btn");
  
  // If the button currently says "Enable", switch it to "Disable"
  if (btn.innerText.includes("Enable")) {
    btn.innerText = "Disable Dyslexia Mode";
    btn.style.backgroundColor = "#8b3d2d"; // Changes the button to a darker "Off" color
    btn.style.color = "white";
  } else {
    // If it says "Disable", switch it back to "Enable"
    btn.innerText = "Enable Dyslexia Mode";
    btn.style.backgroundColor = ""; // Resets the color back to normal
    btn.style.color = "";
  }
  const safeFontUrl = chrome.runtime.getURL("OpenDyslexic-Regular.otf");

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: toggleLexoStyles,
    args: [safeFontUrl]
  });
});

function toggleLexoStyles(safeFontUrl) {
  const id = "lexo-dyslexia-style";
  const existing = document.getElementById(id);

  if (existing) {
    existing.remove();
  } else {
    const style = document.createElement('style');
    style.id = id;
    
    style.innerHTML = `
      @font-face {
        font-family: 'LexoFont';
        src: url('${safeFontUrl}') format('opentype');
      }
      
      /* FIX: Added :not(#lexo-reading-ruler) so it doesn't paint the ruler white! */
      body, p, div:not(#lexo-reading-ruler), span, article, main, h1, h2, h3, li, b, strong {
        background-color: #FDF5E6 !important; 
        color: #222222 !important;
        line-height: 1.8 !important;
        letter-spacing: 0.12em !important;
        text-align: left !important; 
        text-justify: none !important; 
        word-spacing: normal !important; 
        font-family: 'LexoFont', Arial, sans-serif !important; 
      }
    `;
    document.head.appendChild(style);
  }
}

// ==========================================
// 2. BIONIC READING TOGGLE 
// ==========================================
document.getElementById("bionicToggle").addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab.url.startsWith("chrome://") || tab.url.startsWith("edge://")) return; 
const btn = document.getElementById("bionicToggle");
  if (btn.innerText.includes("Disable")) {
    btn.innerText = "Enable Bionic Reading";
    btn.style.backgroundColor = ""; 
    btn.style.color = "";
  } else {
    btn.innerText = "Disable Bionic Reading";
    btn.style.backgroundColor = "#8b3d2d"; 
    btn.style.color = "white";
  }
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: toggleBionicReading
  });
});

function toggleBionicReading() {
  if (document.body.dataset.bionicEnabled === "true") {
    document.querySelectorAll('b.lexo-bionic').forEach(boldTag => {
      const normalText = document.createTextNode(boldTag.textContent);
      boldTag.parentNode.replaceChild(normalText, boldTag);
    });
    document.body.normalize();
    document.body.dataset.bionicEnabled = "false";
    return;
  }

  document.body.dataset.bionicEnabled = "true";

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: function(node) {
      const parentName = node.parentNode.nodeName.toLowerCase();
      if (['script', 'style', 'noscript', 'button'].includes(parentName)) {
        return NodeFilter.FILTER_REJECT;
      }
      return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });

  const nodesToProcess = [];
  while (walker.nextNode()) nodesToProcess.push(walker.currentNode);

  nodesToProcess.forEach(node => {
    const words = node.nodeValue.split(/(\s+)/);
    const fragment = document.createDocumentFragment();

    words.forEach(word => {
      if (/\s+/.test(word)) {
        fragment.appendChild(document.createTextNode(word));
      } else if (word.length > 0) {
        const boldLength = Math.ceil(word.length / 2);
        const bTag = document.createElement('b');
        bTag.className = 'lexo-bionic';
        bTag.textContent = word.substring(0, boldLength);
        bTag.style.fontWeight = 'bold'; 
        fragment.appendChild(bTag);
        if (word.substring(boldLength).length > 0) {
          fragment.appendChild(document.createTextNode(word.substring(boldLength)));
        }
      }
    });
    node.parentNode.replaceChild(fragment, node);
  });
}

// ==========================================
// 3. READING RULER (Fixed)
// ==========================================
document.getElementById("rulerToggle").addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab.url.startsWith("chrome://") || tab.url.startsWith("edge://")) return; 
const btn = document.getElementById("rulerToggle");
  if (btn.innerText.includes("Disable")) {
    btn.innerText = "Enable Reading Ruler";
    btn.style.backgroundColor = ""; 
    btn.style.color = "";
  } else {
    btn.innerText = "Disable Reading Ruler";
    btn.style.backgroundColor = "#8b3d2d"; 
    btn.style.color = "white";
  }
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: toggleReadingRuler
  });
});

function toggleReadingRuler() {
  const rulerId = "lexo-reading-ruler";
  let existingRuler = document.getElementById(rulerId);

  if (existingRuler) {
    existingRuler.remove();
    document.removeEventListener("mousemove", window.lexoRulerMove);
    return;
  }

  const ruler = document.createElement("div");
  ruler.id = rulerId;

  Object.assign(ruler.style, {
    position: "fixed", left: "0", width: "100%", height: "100px",
    pointerEvents: "none", zIndex: "999999",
    boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.72)", 
    background: "transparent",
    borderTop: "2px solid #c56e56", borderBottom: "2px solid #c56e56",
    transition: "top 0.05s ease-out" 
  });

  document.body.appendChild(ruler);

  window.lexoRulerMove = function(e) {
    ruler.style.top = (e.clientY - 60) + "px"; 
  };
  document.addEventListener("mousemove", window.lexoRulerMove);
}

// ==========================================
// 4. HOVER TO HEAR (Fixed Crash)
// ==========================================
document.getElementById("hoverHearToggle").addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab.url.startsWith("chrome://") || tab.url.startsWith("edge://")) return; 
const btn = document.getElementById("hoverHearToggle");
  if (btn.innerText.includes("Disable")) {
    btn.innerText = "Enable Hover to Hear";
    btn.style.backgroundColor = ""; 
    btn.style.color = "";
  } else {
    btn.innerText = "Disable Hover to Hear";
    btn.style.backgroundColor = "#8b3d2d"; 
    btn.style.color = "white";
  }
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: toggleHoverToHear
  });
});

function toggleHoverToHear() {
  const statusAttr = "data-hover-hear-enabled";
  
  if (document.body.getAttribute(statusAttr) === "true") {
    document.body.setAttribute(statusAttr, "false");
    window.speechSynthesis.cancel();
    document.querySelectorAll('.lexo-sentence').forEach(span => {
      const parent = span.parentNode;
      if(parent) {
        parent.replaceChild(document.createTextNode(span.textContent), span);
        parent.normalize();
      }
    });
    return;
  }

  document.body.setAttribute(statusAttr, "true");
  alert("Hover over a sentence to hear it.");

  const paragraphs = document.querySelectorAll('p, li, article p');
  paragraphs.forEach(p => {
    const text = p.innerText;
    // FIX: This stops the code from crashing if it finds an empty paragraph!
    if (!text || text.trim() === '') return; 

    const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
    p.innerHTML = ''; 
    
    sentences.forEach(s => {
      const span = document.createElement('span');
      span.className = 'lexo-sentence';
      span.textContent = s + ' ';
      span.style.cursor = 'help'; 
      
      span.addEventListener('mouseenter', (e) => {
        if (document.body.getAttribute(statusAttr) !== "true") return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(e.target.textContent);
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
        e.target.style.backgroundColor = 'rgba(197, 110, 86, 0.2)';
      });

      span.addEventListener('mouseleave', (e) => {
        e.target.style.backgroundColor = 'transparent';
        window.speechSynthesis.cancel();
      });

      p.appendChild(span);
    });
  });
}
// ==========================================
// 5. AI MAGIC MENU (Drawer Expander & Logic)
// ==========================================
document.getElementById("magic-header").addEventListener("click", () => {
  const container = document.getElementById("magic-container");
  const header = document.getElementById("magic-header");

  if (container.style.display === "none") {
    container.style.display = "flex";
    header.innerHTML = "AI Magic Menu &#9652;"; 
  } else {
    container.style.display = "none";
    header.innerHTML = "AI Magic Menu &#9662;"; 
  }
});

document.getElementById("magicToggle").addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab.url.startsWith("chrome://") || tab.url.startsWith("edge://")) return; 
const btn = document.getElementById("magicToggle");
  if (btn.innerText.includes("Disable")) {
    btn.innerText = "Enable AI Magic Menu";
    btn.style.backgroundColor = ""; 
    btn.style.color = "";
  } else {
    btn.innerText = "Disable AI Magic Menu";
    btn.style.backgroundColor = "#8b3d2d"; 
    btn.style.color = "white";
  }
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: toggleMagicMenu
  });
});

function toggleMagicMenu() {
  // TURN OFF logic
  if (window.lexoMagicEnabled) {
    window.lexoMagicEnabled = false;
    document.removeEventListener("mouseup", window.lexoShowMenu);
    document.removeEventListener("mousedown", window.lexoHideMenu);
    const oldMenu = document.getElementById("lexo-magic-menu");
    if (oldMenu) oldMenu.remove();
    alert("AI Magic Menu disabled.");
    return;
  }

  // TURN ON logic
  window.lexoMagicEnabled = true;
  alert("AI Magic Menu Enabled! Highlight some text on this page.");

  // 1. Inject the CSS for the floating menu
  // 1. Inject the CSS for the floating menu
  if (!document.getElementById("lexo-magic-css")) {
    const style = document.createElement("style");
    style.id = "lexo-magic-css";
    
    // --> THIS IS THE PART THAT CHANGED! <--
    style.innerHTML = `
      #lexo-magic-menu {
        position: absolute !important; 
        display: flex !important; 
        gap: 8px !important; 
        background-color: #a6523d !important; 
        padding: 8px !important;
        border-radius: 8px !important; 
        box-shadow: 0px 6px 20px rgba(0,0,0,0.5) !important; 
        z-index: 2147483647 !important; /* Max z-index to stay on top! */
      }
      
      #lexo-magic-menu button {
        background-color: white !important; 
        color: #a6523d !important; 
        border: none !important; 
        padding: 8px 14px !important;
        border-radius: 5px !important; 
        font-size: 13px !important; 
        font-weight: bold !important; 
        font-family: Arial, sans-serif !important; 
        cursor: pointer !important;
        box-shadow: 0px 2px 4px rgba(0,0,0,0.2) !important;
      }
      
      #lexo-magic-menu button:hover { 
        background-color: #f8aeb0 !important; 
        color: #222222 !important;
      }
    `;
    
    document.head.appendChild(style);
  }

// 2. The function that shows the menu when you highlight text
  window.lexoShowMenu = function(event) {
    if (!window.lexoMagicEnabled) return;

    // THE SHIELD: If you click inside the menu, don't trigger a reset
    const existingMenu = document.getElementById("lexo-magic-menu");
    if (existingMenu && existingMenu.contains(event.target)) {
      return; 
    }

    setTimeout(() => {
      const selectedText = window.getSelection().toString().trim();
      let menu = document.getElementById("lexo-magic-menu");
      
      if (selectedText.length > 0) {
        
        // If menu doesn't exist, build it once!
        if (!menu) {
          menu = document.createElement("div");
          menu.id = "lexo-magic-menu";
          
          menu.innerHTML = `
            <div style="display: flex; gap: 5px; margin-bottom: 5px;">
              <button id="lexo-sum">Summarize</button>
              <button id="lexo-simp">Simplify</button>
              <button id="lexo-bullet">Bullets</button>
              <button id="lexo-turn-off" style="background-color: #8b3d2d !important; color: white !important; padding: 8px 10px !important;" title="Turn off AI">✖</button>
            </div>
            <div id="lexo-result-box" style="display:none; background:white; color:black; padding:10px; border-radius:5px; font-size:12px; max-width:250px; border:1px solid #ccc; font-family: Arial, sans-serif;"></div>
          `;
          document.body.appendChild(menu);

          // THE KILL SWITCH
          document.getElementById("lexo-turn-off").onclick = () => {
            window.lexoMagicEnabled = false; // Turn off the master switch
            document.getElementById("lexo-magic-menu").remove(); // Hide the menu
            window.getSelection().removeAllRanges(); // Un-highlight the text to be clean!
          };

          // THE BRAIN 
          window.lexoCallGemini = async (promptText) => {
            const resultBox = document.getElementById("lexo-result-box");
            resultBox.style.display = "block";
            resultBox.innerHTML = "Thinking... 🧠";

            // !!! PASTE YOUR KEY HERE !!!
            const apiKey = "AIzaSyBd6dZU5wP17HHR35yQSbZdBaeuGweTuUY"; 
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

            try {
              const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
              });
              
              const data = await response.json();
              if (!response.ok) throw new Error(data.error ? data.error.message : "Unknown Error");

              let aiResponse = data.candidates[0].content.parts[0].text;
              aiResponse = aiResponse.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
              aiResponse = aiResponse.replace(/\n/g, '<br>');
              
              resultBox.innerHTML = aiResponse;
            } catch (error) {
              resultBox.innerHTML = "<b style='color: red;'>API Error:</b> " + error.message;
            }
          };
        }

        // We update the buttons EVERY time you highlight, so they always use the newest text
        document.getElementById("lexo-sum").onclick = () => window.lexoCallGemini("Summarize this text simply for someone with dyslexia: " + selectedText);
        document.getElementById("lexo-simp").onclick = () => window.lexoCallGemini("Rewrite this text using very simple words and synonyms: " + selectedText);
        document.getElementById("lexo-bullet").onclick = () => window.lexoCallGemini("Break this text down into simple bullet points: " + selectedText);

        // Hide the old reply box when you highlight new text
        const replyBox = document.getElementById("lexo-result-box");
        if (replyBox) {
           replyBox.style.display = "none";
           replyBox.innerHTML = "";
        }

        // Show the menu at the mouse pointer
        menu.style.left = event.pageX + "px";
        menu.style.top = (event.pageY - 50) + "px";
        menu.style.display = "block";

      } else {
        // If they click empty space, hide the menu
        if (menu) menu.remove();
      }
    }, 50);
  };
  // 3. The function that hides the menu if you click somewhere else
  window.lexoHideMenu = function(event) {
    const menu = document.getElementById("lexo-magic-menu");
    if (menu && !menu.contains(event.target)) {
      menu.remove();
    }
  };

  // Turn on the mouse listeners
  document.addEventListener("mouseup", window.lexoShowMenu);
  document.addEventListener("mousedown", window.lexoHideMenu);
}