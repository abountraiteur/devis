/**
 * Aboun Traiteur – Devis guidé du site
 * Remplace les scénarios Make 8 (disponibilités) et 9 (demandes du site).
 *
 *  GET  → disponibilités en direct depuis l'agenda (guinguette + absences + RDV)
 *  POST → reçoit une demande du site (devis guidé, rappel, rendez-vous) :
 *         - ligne dans l'onglet « Demandes site » du tableau Aboun Connect
 *         - ligne dans « À contacter » (rappel et rendez-vous)
 *         - événement jaune « RDV à confirmer – … » dans l'agenda (rendez-vous)
 *         - e-mail récapitulatif à abountraiteur@gmail.com (répondre = répondre au client)
 */

const CONFIG = {
  SHEET_ID: '1FNH0lrP_JZXt7nSrOAZ7XE_nrPzznsOtRuAOURZ_jTY', // Aboun Connect
  ONGLET_DEMANDES: 'Demandes site',
  ONGLET_CONTACTER: 'À contacter',
  EMAIL_NOTIF: 'abountraiteur@gmail.com',
  TZ: 'Europe/Paris',
  MOIS_DISPO: 18,           // horizon des disponibilités
  CACHE_MIN: 10,            // les disponibilités sont recalculées au plus toutes les 10 min
  COULEUR_RDV: '5'          // jaune (banane)
};

/* ───────────── Disponibilités (GET) ───────────── */

function doGet(e) {
  if (e && e.parameter && e.parameter.test === 'ping') return texte_('ok');
  const cache = CacheService.getScriptCache();
  let csv = cache.get('dispo');
  if (!csv) {
    csv = calculerDispo_();
    if (csv.length < 95000) cache.put('dispo', csv, CONFIG.CACHE_MIN * 60);
  }
  return texte_(csv);
}

function calculerDispo_() {
  const cal = CalendarApp.getDefaultCalendar();
  const debut = new Date(); debut.setHours(0, 0, 0, 0);
  const fin = new Date(debut); fin.setMonth(fin.getMonth() + CONFIG.MOIS_DISPO);
  const lignes = [];
  cal.getEvents(debut, fin).forEach(ev => {
    const titre = ev.getTitle() || '';
    const bas = titre.toLowerCase();
    const tout = (titre + ' ' + (ev.getLocation() || '') + ' ' + (ev.getDescription() || '')).toLowerCase();
    const couleur = String(ev.getColor() || '');
    const test = titre.indexOf('TEST') !== -1;
    let type = '';
    try { type = String(ev.getEventType()); } catch (err) {}

    const guinguette = /^(10|11|6|9)$/.test(couleur) && !test && tout.indexOf('guinguette') !== -1;
    const occupe = type === 'OUT_OF_OFFICE' || (/^(absen|cong|rdv)/.test(bas) && !test) || titre.indexOf('and Aboun Traiteur') !== -1;
    if (!guinguette && !occupe) return;

    const journee = ev.isAllDayEvent();
    const d0 = journee ? ev.getAllDayStartDate() : ev.getStartTime();
    const d1 = journee ? new Date(ev.getAllDayEndDate().getTime() - 86400000) : ev.getEndTime();
    const jour = fmt_(d0, 'yyyy-MM-dd');

    if (guinguette) {
      let moment;
      if (journee) moment = bas.indexOf('soir') !== -1 ? 'soir' : bas.indexOf('midi') !== -1 ? 'jour' : 'journee';
      else if (+fmt_(d0, 'H') >= 17) moment = 'soir';
      else if (+fmt_(ev.getEndTime(), 'HHmm') <= 1800 && fmt_(ev.getEndTime(), 'yyyy-MM-dd') === jour) moment = 'jour';
      else moment = 'journee';
      const statut = (couleur === '11' || bas.indexOf('option') !== -1) ? 'option' : 'reserve';
      lignes.push([jour, moment, statut].join(','));
    } else {
      lignes.push(['busy', jour, journee ? '00:00' : fmt_(d0, 'HH:mm'),
        fmt_(d1, 'yyyy-MM-dd'), journee ? '23:59' : fmt_(d1, 'HH:mm')].join(','));
    }
  });
  return lignes.join('\n');
}

/* ───────────── Demandes du site (POST) ───────────── */

function doPost(e) {
  const p = (e && e.parameter) || {};
  if (!p.source || !p.email || !p.prenom) return texte_('ignore');
  if (p.website) return texte_('ok'); // champ piège anti-robots

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const maintenant = new Date();
    const client = [p.prenom, p.nom].filter(String).join(' ');
    const motif = p.source === 'rdv' ? 'Rendez-vous' : p.source === 'rappel' ? 'Rappel' : 'Devis guidé';
    let lienAgenda = '';
    let alerte = '';

    // 1. Rendez-vous → événement jaune à valider
    if (p.source === 'rdv' && p.rdv_date && p.rdv_heure) {
      const debut = heureParis_(p.rdv_date, p.rdv_heure);
      const fin = heureParis_(p.rdv_date, p.rdv_fin || p.rdv_heure);
      const cal = CalendarApp.getDefaultCalendar();
      const conflits = cal.getEvents(debut, fin).filter(ev => ev.getTitle().indexOf('TEST') === -1);
      if (conflits.length) alerte = '⚠ Créneau déjà occupé : ' + conflits.map(ev => ev.getTitle()).join(', ');
      const ev = cal.createEvent(court_(p.titre || ('RDV à confirmer – ' + client), 200), debut, fin, {
        description: [
          alerte,
          'Demande de rendez-vous ' + (p.rdv_format || '') + ' via le site.',
          'Client : ' + client + (p.societe ? ' (' + p.societe + ')' : ''),
          'Téléphone : ' + (p.tel || ''),
          'E-mail : ' + (p.email || ''),
          p.type_label ? 'Événement : ' + p.type_label + (p.date ? ' le ' + p.date : '') : '',
          p.message ? 'Message : ' + p.message : '',
          '',
          'Pour valider : enlever « à confirmer » du titre et prévenir le client. Pour refuser : supprimer l\'événement et rappeler le client.'
        ].filter(String).join('\n')
      });
      ev.setColor(CONFIG.COULEUR_RDV);
      lienAgenda = 'https://calendar.google.com/calendar/r/day/' + p.rdv_date.replace(/-/g, '/');
      CacheService.getScriptCache().remove('dispo'); // le créneau disparaît tout de suite du site
    }

    // 2. Journal de toutes les demandes
    const demandes = onglet_(ss, CONFIG.ONGLET_DEMANDES, ['Reçu le', 'Motif', 'Client', 'Société', 'SIRET', 'Téléphone', 'E-mail',
      'Type', 'Statut client', 'Date événement', 'Horaires', 'Adultes', 'Enfants', 'Mode', 'Adresse', 'Distance km',
      'Menu', 'Options', 'Régimes / allergies', 'Total HT', 'Total TTC', 'Créneau / RDV', 'Message', 'Récapitulatif', 'Suivi']);
    demandes.appendRow([maintenant, motif, client, p.societe || '', p.siret || '', "'" + (p.tel || ''), p.email,
      p.type_label || '', p.statut || '', p.date || '', p.horaires || '', p.adultes || '', p.enfants || '', p.lieu_mode || '',
      p.adresse || '', p.distance_km || '', p.menu_souhaite || '', p.options_demandees || '', p.particularites || '',
      nombre_(p.total_ht), nombre_(p.total_ttc), p.creneau || '', court_(p.message, 3000), court_(sansHtml_(p.recap), 30000),
      alerte || 'Nouveau']);

    // 3. À contacter (rappel et rendez-vous)
    if (p.source === 'rdv' || p.source === 'rappel') {
      const contacter = ss.getSheetByName(CONFIG.ONGLET_CONTACTER);
      if (contacter) contacter.appendRow([maintenant, client, "'" + (p.tel || ''), motif,
        p.type_label || '', p.date || '', p.creneau || '', nombre_(p.total_ttc), p.source === 'rdv' ? 'RDV à valider' : 'À rappeler', lienAgenda]);
    }

    // 4. E-mail récapitulatif
    const sujet = '[Site] ' + motif + ' – ' + client + (p.date ? ' – ' + p.date : '') + (alerte ? ' ⚠' : '');
    const corps = [
      alerte,
      '<b>' + motif + '</b> reçu(e) depuis le site le ' + fmt_(maintenant, 'dd/MM/yyyy à HH:mm'),
      'Client : ' + echap_(client) + (p.societe ? ' – ' + echap_(p.societe) : '') + (p.siret ? ' (SIRET ' + echap_(p.siret) + ')' : ''),
      'Téléphone : ' + echap_(p.tel || '') + ' – E-mail : ' + echap_(p.email),
      p.creneau ? 'Créneau : ' + echap_(p.creneau) : '',
      p.type_label ? 'Événement : ' + echap_(p.type_label) + (p.date ? ' le ' + p.date : '') : '',
      p.recap ? '<br>' + sanitise_(p.recap).replace(/\n/g, '<br>') : '',
      (!p.recap && p.message) ? 'Message : ' + echap_(p.message) : '',
      '<br><i>Répondre à cet e-mail répond directement au client.</i>'
    ].filter(String).join('<br>');
    MailApp.sendEmail({ to: CONFIG.EMAIL_NOTIF, replyTo: p.email, subject: court_(sujet, 200), htmlBody: corps, name: 'Site Aboun Traiteur' });

    return texte_('ok');
  } catch (err) {
    MailApp.sendEmail(CONFIG.EMAIL_NOTIF, '[Site] Erreur demande à traiter', 'Erreur : ' + err + '\n\nDonnées reçues :\n' + JSON.stringify(p, null, 2));
    return texte_('erreur');
  } finally {
    lock.releaseLock();
  }
}

/* ───────────── Outils ───────────── */

function texte_(s) { return ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.TEXT); }
function fmt_(d, f) { return Utilities.formatDate(d, CONFIG.TZ, f); }
function heureParis_(jour, hm) {
  const approx = new Date(jour + 'T' + hm + ':00Z');
  return new Date(jour + 'T' + hm + ':00' + Utilities.formatDate(approx, CONFIG.TZ, 'XXX'));
}
function onglet_(ss, nom, entetes) {
  let sh = ss.getSheetByName(nom);
  if (!sh) { sh = ss.insertSheet(nom); sh.appendRow(entetes); sh.setFrozenRows(1); sh.getRange(1, 1, 1, entetes.length).setFontWeight('bold'); }
  return sh;
}
function nombre_(v) { const n = parseFloat(String(v || '').replace(',', '.')); return isNaN(n) ? '' : n; }
function court_(s, n) { s = String(s || ''); return s.length > n ? s.slice(0, n) + '…' : s; }
function echap_(s) { return String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function sansHtml_(s) { return String(s || '').replace(/<[^>]+>/g, ''); }
function sanitise_(s) { return echap_(s).replace(/&lt;(\/?)b&gt;/g, '<$1b>'); } // garde seulement le gras

/** À lancer une fois à la main (bouton ▶) pour donner les autorisations et vérifier. */
function verifier() {
  Logger.log(calculerDispo_().split('\n').slice(0, 15).join('\n'));
  Logger.log('Tableau : ' + SpreadsheetApp.openById(CONFIG.SHEET_ID).getName());
}
