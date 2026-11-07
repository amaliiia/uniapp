/* App: estado, navegação, eventos e render */
const NAV = [["inicio", "🏠", "Início"], ["horarios", "🕒", "Horários"], ["disciplinas", "📚", "Acadêmico"], ["agenda", "📅", "Agenda"], ["perfil", "👤", "Perfil"]];
const T = { inicio: "Início", horarios: "Quadro de horários", disciplinas: "Acadêmico", calendario: "Calendário do semestre", grade: "Grade curricular", complementares: "Horas complementares", plano: "Planos de aula", materiais: "Material das aulas", atividades: "Atividades", notas: "Notas", faltas: "Faltas", agenda: "Agenda", perfil: "Meu perfil" };
let dia = "Seg", selP = "mob", fil = "all", aberta = null, logado = false;
let agD = TODAY;
let F = { m: "all", a: "all", s: "2026.2" };
let pdfZ = 1;
document.addEventListener("click", e => { const t = e.target.closest("[data-ag]"); if (t) { agD = t.dataset.ag; render() } });
document.addEventListener("change", e => { if (e.target.id === "agdt" && e.target.value) { agD = e.target.value; render() } });
document.addEventListener("change", e => { const k = e.target.dataset && e.target.dataset.sel; if (k) { F[k] = e.target.value; render() } });
document.addEventListener("click", e => { if (e.target.closest("[data-hc]")) hcSheet() });
document.addEventListener("click", e => { const t = e.target.closest("[data-pdf]"); if (t) { pdfZ = Math.max(.8, Math.min(2, pdfZ + (t.dataset.pdf === "in" ? .2 : -.2))); render() } });
function render() {
    document.body.classList.toggle("lg", !logado); if (!logado) { m.innerHTML = loginHTML(); return }
    let h = (location.hash || "#inicio").slice(1); if (!V[h]) h = "inicio";
    const hub = ["calendario", "complementares", "grade", "plano", "materiais", "atividades", "notas", "faltas"].includes(h);
    $("#ttl").textContent = T[h];
    m.innerHTML = (hub ? `<button class="back" data-go="disciplinas">‹ Acadêmico</button>` : "") + V[h]();
    $("#nv").innerHTML = NAV.map(n => `<a href="#${n[0]}" class="${n[0] === h || (hub && n[0] === "disciplinas") ? "on" : ""}"><span>${I(n[0])}</span>${n[2]}</a>`).join(""); window.scrollTo(0, 0)
}
document.addEventListener("click", e => {
    const t = e.target.closest("[data-dia],[data-go],[data-p],[data-f],[data-at],[data-dl]"); if (!t) return; const d = t.dataset;
    if (d.dia) { dia = d.dia; render() } else if (d.go) { location.hash = d.go } else if (d.p) { selP = d.p; render() } else if (d.f) { fil = d.f; render() } else if (d.at) { sheet(ATV.find(x => x.id == d.at)) } else if (d.dl) { alert("Download simulado: " + d.dl) }
});
$("#th").onclick = () => { const r = document.documentElement, dk = getComputedStyle(r).getPropertyValue("--bg").trim() === "#081022"; r.dataset.theme = dk ? "light" : "dark" };
function entrar() {
    const u = $("#lm").value.trim(), s = $("#ls").value, e = $("#le");
    if (!u || !s) { e.textContent = "Informe matrícula e senha."; return }
    if (!/^\d{4,}$/.test(u)) { e.textContent = "A matrícula deve conter apenas números."; return }
    if (s.length < 4) { e.textContent = "A senha deve ter ao menos 4 caracteres."; return }
    logado = true; location.hash = "inicio"; render()
}
document.addEventListener("click", e => {
    const t = e.target.closest("[data-act]"); if (!t) return; const a = t.dataset.act;
    if (a === "entrar") entrar(); else if (a === "sair") { logado = false; location.hash = ""; render() }
    else if (a === "ver") { const i = $("#ls"); i.type = i.type === "password" ? "text" : "password" }
    else if (a === "esqueci") alert("Simulação: enviamos um link de redefinição para o seu e-mail institucional.")
});
document.addEventListener("keydown", e => { if (e.key === "Enter" && !logado) entrar() });
addEventListener("hashchange", render); render();
