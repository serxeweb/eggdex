const totalEggs = 100;
let currentFilter = "all";
let eggData = JSON.parse(localStorage.getItem("eggInventory")) || {};
let userData = JSON.parse(localStorage.getItem("eggUserData")) || { name: "" };
let isDarkMode = localStorage.getItem("darkMode") === "true";

// Initialize Theme
if (isDarkMode) document.body.classList.add("dark-mode");

for (let i = 1; i <= totalEggs; i++) {
  if (eggData[i] === undefined) eggData[i] = 0;
}

function toggleDarkMode() {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", isDarkMode);
  const icon = document.getElementById("themeToggle");
  icon.className = isDarkMode
    ? "fas fa-sun theme-toggle"
    : "fas fa-moon theme-toggle";
}

async function checkFirstTime() {
  if (!userData.name) {
    const { value: name } = await Swal.fire({
      title: "Welcome to EggDex!",
      input: "text",
      inputPlaceholder: "Enter your name",
      confirmButtonColor: "#ffb7ce",
      allowOutsideClick: false,
    });
    if (name) {
      userData = { name: name };
      localStorage.setItem("eggUserData", JSON.stringify(userData));
      updateProfileUI();
    }
  } else {
    updateProfileUI();
  }
}

function updateProfileUI() {
  document.getElementById("displayUser").innerText = userData.name;
  
  const displayPic = document.getElementById("displayPic");
 
  const localPhoto = "./assets/img/user_profile.png";
  
 
  const apiAvatar = `https://ui-avatars.com/api/?background=ffb7ce&color=fff&bold=true&name=${encodeURIComponent(userData.name)}`;

 
  const finalSrc = userData.photo || localPhoto;

  displayPic.innerHTML = `<img src="${finalSrc}" alt="Profile" onerror="this.src='${apiAvatar}'">`;
}

function updateProgress() {
  const collectedCount = Object.values(eggData).filter(
    (count) => count > 0,
  ).length;
  const percent = Math.round((collectedCount / totalEggs) * 100);
  document.getElementById("progressBar").style.width = percent + "%";
  document.getElementById("progressPercent").innerText = percent + "%";
}

function render() {
  const grid = document.getElementById("eggGrid");
  grid.innerHTML = "";
  for (let i = 1; i <= totalEggs; i++) {
    const count = eggData[i];
    if (currentFilter === "collected" && count === 0) continue;
    if (currentFilter === "missing" && count > 0) continue;
    const hue = (i * 137.5) % 360;
    const card = document.createElement("div");
    card.className = `egg-card ${count > 0 ? "has-any" : "is-missing"}`;
    card.innerHTML = `
                <span style="font-size:0.7rem; font-weight:700;">#${i}</span>
                <div class="egg-icon" style="--hue: ${hue}deg">🥚</div>
                <div class="qty-controls">
                    <button class="qty-btn" onclick="update(${i}, -1)">-</button>
                    <span style="font-weight:800">${count}</span>
                    <button class="qty-btn" onclick="update(${i}, 1)">+</button>
                </div>`;
    grid.appendChild(card);
  }
  updateProgress();
  localStorage.setItem("eggInventory", JSON.stringify(eggData));
}

function update(id, change) {
  eggData[id] = Math.max(0, eggData[id] + change);
  render();
}

function takeScreenshot() {
  const element = document.getElementById("captureZone");
  Swal.fire({
    title: "Snapping Photo...",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  html2canvas(element, {
    backgroundColor: getComputedStyle(document.body).backgroundColor,
    scale: 2,
    useCORS: true,
  }).then((canvas) => {
    const link = document.createElement("a");
    link.download = `EggDex_${userData.name}.png`;
    link.href = canvas.toDataURL();
    link.click();
    Swal.fire("Saved!", "Screenshot downloaded.", "success");
  });
}

async function openAssistant() {
  const res = await Swal.fire({
    title: "EggDex Assistant",
    text: "How can I help you today?",
    showDenyButton: true,
    confirmButtonText: "About EggDex",
    denyButtonText: "Privacy & Safety",
    confirmButtonColor: "#ffb7ce",
    denyButtonColor: "#b2e2f2",
  });

  if (res.isConfirmed) {
    Swal.fire({
      title: "About EggDex 2026",
      html: `
        <div style="text-align: left; font-size: 0.9rem; line-height: 1.5;">
          <p>Welcome to the ultimate <strong>Egg Hunt 2026</strong> collection tracker! This system is specifically designed for the upcoming <strong>Graal Online Classic</strong> Easter event.</p>
          <p>Our goal is to provide a seamless way for players to:</p>
          <ul style="padding-left: 20px;">
            <li>Track all 100 unique eggs in real-time.</li>
            <li>Manage duplicates for trading purposes.</li>
            <li>Visualize progress toward a 100% completion badge.</li>
            <li>Generate shareable snapshots of your collection.</li>
          </ul>
          <p>Get ready to dominate the 2026 season!</p>
        </div>
      `,
      icon: "info",
      confirmButtonColor: "#ffb7ce",
    });
  } else if (res.isDenied) {
    Swal.fire({
      title: "Safety & Privacy",
      html: `
        <div style="text-align: left; font-size: 0.9rem; line-height: 1.5;">
          <p>Your privacy is our top priority. Here is how your data is handled:</p>
          <ul style="padding-left: 20px;">
            <li><strong>Local Storage:</strong> All your inventory data and progress are stored strictly on your own device's browser memory.</li>
            <li><strong>No Accounts:</strong> We do not use servers, so no passwords or personal emails are ever collected.</li>
            <li><strong>Zero Tracking:</strong> There are no hidden trackers or third-party cookies watching your activity.</li>
          </ul>
          <p><em>Note: Clearing your browser cache or site data will reset your progress, so be careful!</em></p>
        </div>
      `,
      icon: "success",
      confirmButtonColor: "#b2e2f2",
    });
  }
}
async function openSettings() {
  const res = await Swal.fire({
    title: "Settings",
    showDenyButton: true,
    confirmButtonText: "Check All",
    denyButtonText: "Reset All",
    confirmButtonColor: "#b2e2f2",
    denyButtonColor: "#ffcf96",
  });
  if (res.isConfirmed) {
    for (let i = 1; i <= totalEggs; i++) if (eggData[i] === 0) eggData[i] = 1;
    render();
  } else if (res.isDenied) {
    for (let i = 1; i <= totalEggs; i++) eggData[i] = 0;
    render();
  }
}

function setFilter(f, btn) {
  currentFilter = f;
  document
    .querySelectorAll(".filter-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  render();
}

function copyTradeText() {
  let missing = [];
  let extras = [];
  for (let i = 1; i <= totalEggs; i++) {
    if (eggData[i] === 0) missing.push(`#${i}`);
    if (eggData[i] > 1) extras.push(`#${i}`);
  }
  const text = `NEED:${missing.join(",")} EXTRAS:${extras.join(",")}`;
  navigator.clipboard.writeText(text);
  Swal.fire({
    title: "Copied!",
    toast: true,
    position: "top-end",
    timer: 2000,
    showConfirmButton: false,
    icon: "success",
  });
}

checkFirstTime();
render();
