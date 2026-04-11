-- ============================================================
-- MY MOOD — Seed v2
-- ============================================================
-- Contiene:
-- 1. UPDATE website_url per venue già esistenti
-- 2. INSERT ~35 nuovi venue a Milano
--
-- Come usarlo:
-- Vai su Supabase → SQL Editor → incolla tutto → Run
-- ============================================================


-- ============================================================
-- PARTE 1 — Fix website_url venue esistenti
-- ============================================================

UPDATE venues SET website_url = 'https://langosteria.com'        WHERE name ILIKE '%langosteria%';
UPDATE venues SET website_url = 'https://ceresio7.com'           WHERE name ILIKE '%ceresio%';
UPDATE venues SET website_url = 'https://nottinghamforest.it'    WHERE name ILIKE '%nottingham%';
UPDATE venues SET website_url = 'https://drymilano.it'           WHERE name ILIKE '%dry%';
UPDATE venues SET website_url = 'https://lacerba.it'             WHERE name ILIKE '%lacerba%';
UPDATE venues SET website_url = 'https://bluenote.it'            WHERE name ILIKE '%blue note%';
UPDATE venues SET website_url = 'https://berberemilano.it'       WHERE name ILIKE '%berber%';
UPDATE venues SET website_url = 'https://fondazioneprada.org'    WHERE name ILIKE '%prada%';
UPDATE venues SET website_url = 'https://hangarbicocca.org'      WHERE name ILIKE '%bicocca%';
UPDATE venues SET website_url = 'https://teatroallascala.org'    WHERE name ILIKE '%scala%';
UPDATE venues SET website_url = 'https://tripadvisor.it'         WHERE website_url IS NULL AND name ILIKE '%trippa%';


-- ============================================================
-- PARTE 2 — Nuovi venue
-- ============================================================

INSERT INTO venues (name, address, type, price_range, compatible_moods, description, tips, emoji, website_url) VALUES

-- ── COCKTAIL BAR ──────────────────────────────────────────────

('Nottingham Forest',
 'Via Piave 1',
 'cocktail_bar', 'mid',
 ARRAY['alternativo','misterioso','social','esclusivo'],
 'Un''istituzione milanese: decine di cocktail rari, atmosfera da collector vecchio stile, nessuna pretesa ma tanta sostanza. Ogni bottiglia ha una storia.',
 'Non guardare il menu: digli solo cosa vuoi, ci pensano loro.',
 '🌲', 'https://nottinghamforest.it'),

('The Botanical Club',
 'Via Tortona 33',
 'cocktail_bar', 'mid',
 ARRAY['creativo','alternativo','social','aperitivo'],
 'Cocktail botanici con ingredienti selezionati, distillati artigianali e un''estetica da laboratorio vintage. Isola che non ti aspetti a Tortona.',
 'I gin tonic sono il loro punto di forza — chiedi quello della stagione.',
 '🌿', 'https://thebotanicalclub.it'),

('Rita & Cocktails',
 'Via Angelo Fumagalli 1',
 'cocktail_bar', 'mid',
 ARRAY['social','aperitivo','misterioso','alternativo'],
 'Piccolo e sempre pieno, è uno dei posti più amati da chi abita il Naviglio Grande. Cocktail creativi a prezzi onesti, niente pose.',
 'Arriva entro le 19:30 se vuoi trovare posto seduto.',
 '🍹', 'https://ritamilano.com'),

('1930 Cocktail Bar',
 'Via Tivoli 2',
 'cocktail_bar', 'high',
 ARRAY['misterioso','elegante','esclusivo','romantico'],
 'Speakeasy nascosto dietro una porta senza insegna. Prenotazione obbligatoria, cocktail da maestri, atmosfera anni ''30. Una delle esperienze più particolari di Milano.',
 'Non si trova su Google Maps — cerca la porta nera in Via Tivoli e suona.',
 '🕰️', 'https://1930cocktailbar.com'),

('Mag Café',
 'Ripa di Porta Ticinese 43',
 'bar', 'low',
 ARRAY['rilassato','social','alternativo','aperitivo'],
 'Bar storico sul Naviglio Pavese con un''atmosfera genuina e senza filtri. Frequentato da artisti, studenti e chi vuole un drink buono senza spendere.',
 'L''aperitivo con buffet libero è una delle migliori offerte dei Navigli.',
 '📖', NULL),

('Lacerba',
 'Via Orti 4',
 'bar', 'mid',
 ARRAY['alternativo','creativo','culturale','social'],
 'Libreria di giorno, cocktail bar di sera. Uno spazio ibrido nel cuore di Porta Romana dove design, cultura e drink si mescolano perfettamente.',
 'Controlla il loro profilo Instagram per gli eventi serali — spesso ci sono dj set o presentazioni.',
 '📚', 'https://lacerba.it'),

-- ── ROOFTOP / LOUNGE ──────────────────────────────────────────

('Terrazza Triennale',
 'Viale Emilio Alemagna 6',
 'rooftop', 'mid',
 ARRAY['culturale','romantico','elegante','creativo'],
 'La terrazza della Triennale offre una delle viste più belle su Parco Sempione e il Castello Sforzesco. Aperitivi curati in un contesto d''eccezione.',
 'Combina la visita a una mostra dentro la Triennale con l''aperitivo in terrazza.',
 '🎨', 'https://triennale.org'),

('Radio Rooftop Milan',
 'Piazza della Repubblica 13',
 'rooftop', 'high',
 ARRAY['elegante','esclusivo','romantico','social'],
 'Il rooftop dell''hotel ME Milan offre una vista a 360° sul panorama milanese. Cocktail di alto livello, dress code informale ma curato.',
 'Prenota un tavolo sul bordo esterno per la vista migliore — sono i primi ad esaurirsi.',
 '🌆', 'https://melia.com/it/hotels/italia/milan/me-milan-il-duca'),

('Ceresio 7',
 'Via Ceresio 7',
 'rooftop', 'high',
 ARRAY['elegante','esclusivo','romantico','social'],
 'Due piscine e un rooftop bar nel cuore di Milano. L''indirizzo più chic per un aperitivo estivo, con una delle viste migliori sulla città.',
 'In estate prenota settimane prima — è sempre esaurito. In inverno il bar interno è più tranquillo.',
 '🏊', 'https://ceresio7.com'),

-- ── RISTORANTI ────────────────────────────────────────────────

('Trippa',
 'Via Giorgio Vasari 1',
 'trattoria', 'mid',
 ARRAY['foodie','romantico','social','vintage'],
 'La trattoria moderna più amata di Milano. Menu che cambia con le stagioni, vini naturali, atmosfera calda e familiare. Impossibile uscire delusi.',
 'Prenota con settimane di anticipo — è uno dei locali più richiesti della città.',
 '🍖', 'https://trippamilano.it'),

('Ratanà',
 'Via Gaetano de Castillia 28',
 'trattoria', 'mid',
 ARRAY['foodie','social','rilassato','culturale'],
 'Trattoria contemporanea che celebra la cucina lombarda con ingredienti selezionati. Adiacente alla Biblioteca degli Alberi, è perfetta per una cena con vista sul parco.',
 'In estate, punta al tavolo nel dehors sul parco.',
 '🌾', 'https://ratana.it'),

('Contraste',
 'Via Meda 2',
 'ristorante', 'luxury',
 ARRAY['esclusivo','romantico','foodie','elegante'],
 'Una stella Michelin e un''esperienza gastronomica unica: menu degustazione che mescola tradizione italiana e tecnica contemporanea in modo sorprendente.',
 'Solo menu degustazione, prenotazione obbligatoria con settimane di anticipo.',
 '⭐', 'https://contrastemilano.it'),

('Da Giacomo',
 'Via Pasquale Sottocorno 6',
 'ristorante', 'high',
 ARRAY['elegante','romantico','foodie','esclusivo'],
 'Istituzione milanese per il pesce fresco e i risotti. Frequentato da volti noti della città, è un classico per una cena importante in un contesto senza eccessi.',
 'Il risotto al nero di seppia e il fritto misto sono i must.',
 '🐟', 'https://giacomomilano.com'),

('Osteria dell''Acquabella',
 'Via San Rocco 11',
 'trattoria', 'mid',
 ARRAY['foodie','romantico','rilassato','vintage'],
 'Piccola osteria nel quartiere di Porta Romana con una cucina milanese autentica: cassoela, ossobuco, risotto. L''ambiente è caldo e accogliente.',
 'Il menù cambia con le stagioni — fidati di ciò che consigliano.',
 '🍲', NULL),

('Berton',
 'Via Mike Bongiorno 13',
 'ristorante', 'luxury',
 ARRAY['esclusivo','elegante','foodie','romantico'],
 'Una stella Michelin nell''avanguardia di CityLife. Cucina di ricerca con ingredienti italiani d''eccellenza e un''estetica minimalista che lascia spazio al sapore.',
 'Ideale per occasioni speciali — l''esperienza è curata in ogni dettaglio.',
 '🌟', 'https://ristoranteberton.com'),

('Carlo e Camilla in Segheria',
 'Via Giuseppe Meda 24',
 'ristorante', 'high',
 ARRAY['esclusivo','romantico','elegante','creativo'],
 'Un''antica segheria trasformata in uno dei ristoranti più scenografici di Milano. Tavoli lunghi condivisi, soffitti alti, luci warm e cucina italiana contemporanea.',
 'L''ambiente è spettacolare di notte con i candelabri accesi — vacci per cena.',
 '🕯️', 'https://carloecarillainsegheriagroup.it'),

-- ── PIZZERIE ──────────────────────────────────────────────────

('Berberè Milano',
 'Via Vigevano 8',
 'pizzeria', 'low',
 ARRAY['social','godereccio','alternativo','foodie'],
 'Pizza a fermentazione naturale con ingredienti biologici. Una delle migliori pizzerie gourmet di Milano, con un''atmosfera giovane e informale ai Navigli.',
 'Prova la pizza del mese — usano sempre ingredienti stagionali di qualità.',
 '🍕', 'https://berberepizza.it'),

('Confine',
 'Piazza Felice Cavallotti 1',
 'pizzeria', 'mid',
 ARRAY['social','godereccio','foodie','aperitivo'],
 'Pizza napoletana contemporanea in uno dei locali più vivaci di Porta Venezia. Grande selezione di vini naturali e atmosfera sempre energica.',
 'Ottimo anche per l''aperitivo — hanno stuzzichini di qualità.',
 '🍕', 'https://confineristorante.com'),

-- ── CLUB ──────────────────────────────────────────────────────

('Plastic',
 'Viale Umbria 120',
 'club', 'mid',
 ARRAY['alternativo','nottambulo','festivo','musicale'],
 'Il club più iconico di Milano per la scena queer e alternativa. Dal 1980 è punto di riferimento per chi cerca qualcosa di diverso — musica eclettica, nessun giudizio.',
 'Niente dress code rigido ma l''originalità è apprezzata. Si entra tardi — non prima di mezzanotte.',
 '💜', 'https://plasticmilano.com'),

('Volt Club',
 'Via Molino delle Armi 4',
 'club', 'mid',
 ARRAY['nottambulo','festivo','alternativo','musicale'],
 'Club sotterraneo nella zona dei Navigli con una programmazione che spazia da techno a hip hop. Spazio piccolo ma con un sistema audio eccellente.',
 'Controlla la programmazione settimanale — il sabato è il giorno più forte.',
 '⚡', 'https://voltmilano.com'),

('Apollo Milano',
 'Via Giosue Borsi 9',
 'club', 'mid',
 ARRAY['nottambulo','festivo','musicale','social'],
 'Club e live venue nel quartiere Navigli. Una delle migliori programmazioni musicali della città, tra concerti indie e notti dance di qualità.',
 'Il giovedì è dedicato ai concerti live — vale la pena seguirli.',
 '🎵', 'https://apollomilano.it'),

('Gattopardo Café',
 'Via Piero della Francesca 47',
 'club', 'mid',
 ARRAY['nottambulo','elegante','festivo','vintage'],
 'Club ricavato in una chiesa sconsacrata nel quartiere Arco della Pace. L''architettura è spettacolare — soffitti altissimi, affreschi e una pista da ballo unica.',
 'L''ambiente è più elegante degli altri club — curate l''outfit.',
 '⛪', 'https://gattopardocafe.com'),

-- ── PARCHI / OUTDOOR ──────────────────────────────────────────

('Parco Sempione',
 'Piazza Sempione',
 'parco', 'low',
 ARRAY['rilassato','zen','romantico','sportivo','avventuroso'],
 'Il polmone verde di Milano alle spalle del Castello Sforzesco. Perfetto per una passeggiata lenta, un pic-nic, o semplicemente staccare dalla città.',
 'Al tramonto la vista sul Castello è imperdibile. Il weekend è più affollato — vai nei giorni feriali per godertelo in pace.',
 '🌳', NULL),

('Idroscalo',
 'Via dei Salici 27, Segrate',
 'parco', 'low',
 ARRAY['sportivo','avventuroso','rilassato','social'],
 'Il "mare di Milano" — un lago artificiale con spiagge, piste ciclabili e attività acquatiche. Ottimo per una giornata diversa, soprattutto d''estate.',
 'Noleggia una bici sul posto per girare tutto il perimetro del lago.',
 '🏊', 'https://idroscalo.it'),

('Naviglio Grande',
 'Alzaia Naviglio Grande',
 'parco', 'low',
 ARRAY['romantico','social','aperitivo','rilassato','avventuroso'],
 'Il canale più famoso di Milano è perfetto per una passeggiata serale prima dell''aperitivo. I locali si susseguono per chilometri e l''atmosfera è sempre vivace.',
 'Cammina dal Ponte di Via Corsico fino a Piazza XXIV Maggio per vedere tutta l''anima dei Navigli.',
 '🚤', NULL),

('Parco Biblioteca degli Alberi',
 'Piazza Gae Aulenti',
 'parco', 'low',
 ARRAY['zen','rilassato','romantico','culturale'],
 'Il parco più moderno di Milano, disegnato da Piet Oudolf nel cuore di Porta Nuova. Installazioni botaniche, aiuole tematiche e un''atmosfera sorprendentemente tranquilla in piena città.',
 'Di sera con le luci è particolarmente suggestivo — ottimo per una passeggiata dopo cena.',
 '🌸', NULL),

-- ── MUSEI / CULTURA ───────────────────────────────────────────

('Pinacoteca di Brera',
 'Via Brera 28',
 'museo', 'mid',
 ARRAY['culturale','romantico','creativo','elegante'],
 'Una delle pinacoteche più importanti d''Italia nel cuore del quartiere degli artisti. Capolavori di Raffaello, Mantegna, Caravaggio in un palazzo storico del''700.',
 'Evita il weekend — vai di mattina nei giorni feriali per godertela senza folla.',
 '🖼️', 'https://pinacotecabrera.org'),

('Fondazione Prada',
 'Largo Isarco 2',
 'museo', 'mid',
 ARRAY['culturale','creativo','alternativo','esclusivo'],
 'Un ex complesso industriale trasformato da Rem Koolhaas in uno dei più importanti spazi d''arte contemporanea al mondo. Le mostre sono sempre di livello altissimo.',
 'Il bar Luce, progettato da Wes Anderson, merita una sosta anche solo per l''estetica.',
 '🏛️', 'https://fondazioneprada.org'),

('Hangar Bicocca',
 'Via Chiese 2',
 'museo', 'low',
 ARRAY['culturale','creativo','alternativo'],
 'Un''enorme fabbrica dismessa trasformata in spazio espositivo. Ospita installazioni di arte contemporanea di scala monumentale — incluse le Sette Palazze Celesti di Kiefer.',
 'L''ingresso è gratuito. Le installazioni permanenti valgono il viaggio fino in Bicocca.',
 '🏗️', 'https://hangarbicocca.org'),

('Mudec — Museo delle Culture',
 'Via Tortona 56',
 'museo', 'mid',
 ARRAY['culturale','creativo','elegante','alternativo'],
 'Il Museo delle Culture nel cuore del Tortona design district. Mostre temporanee di altissimo livello — spesso dedicate a icone dell''arte, della moda e della cultura pop.',
 'Controlla le mostre temporanee — di solito ci sono grandi nomi. Il ristorante Mudec è ottimo per dopo.',
 '🌍', 'https://mudec.it'),

('Palazzo Reale',
 'Piazza del Duomo 12',
 'museo', 'mid',
 ARRAY['culturale','elegante','romantico','esclusivo'],
 'Le sale dell''ex residenza reale di Milano ospitano alcune delle mostre temporanee più importanti della città. Architettura neoclassica e posizione unica in piazza Duomo.',
 'Acquista il biglietto online — le mostre principali fanno spesso lunghe code.',
 '👑', 'https://palazzorealemilano.it'),

-- ── TEATRO / CINEMA ───────────────────────────────────────────

('Teatro alla Scala',
 'Piazza della Scala',
 'teatro', 'high',
 ARRAY['culturale','elegante','esclusivo','musicale','romantico'],
 'Il teatro lirico più famoso al mondo. Un''esperienza unica nel suo genere — anche solo sedersi in platea o in un palco è qualcosa che non si dimentica.',
 'I biglietti vanno a ruba — acquistali sul sito ufficiale non appena aprono le vendite stagionali.',
 '🎭', 'https://teatroallascala.org'),

('Piccolo Teatro di Milano',
 'Via Rovello 2',
 'teatro', 'mid',
 ARRAY['culturale','alternativo','creativo','romantico'],
 'Fondato da Giorgio Strehler nel 1947, è uno dei teatri di prosa più importanti d''Europa. Tre sale, programmazione di qualità elevatissima.',
 'Controlla la stagione su piccoloteatro.org — ci sono sempre titoli imperdibili.',
 '🎪', 'https://piccoloteatro.org'),

('Anteo Palazzo del Cinema',
 'Piazza XXV Aprile 8',
 'cinema', 'low',
 ARRAY['culturale','alternativo','rilassato','creativo'],
 'Il cinema d''essai più amato di Milano. Film originali in lingua originale, cicli tematici, rassegne internazionali. Un rifugio per chi il cinema lo ama davvero.',
 'Il mercoledì il biglietto è ridotto. Le proiezioni in lingua originale con sottotitoli sono segnalate in programma.',
 '🎬', 'https://spazioanteo.it'),

-- ── ATTIVITÀ ──────────────────────────────────────────────────

('BASE Milano',
 'Via Bergognone 34',
 'attivita', 'low',
 ARRAY['creativo','alternativo','culturale','sociale'],
 'Un ex complesso industriale delle Ferrovie diventato hub creativo multidisciplinare. Concerti, performance, mostre, workshop, mercati. Sempre qualcosa di inaspettato.',
 'Segui i loro canali social — la programmazione cambia ogni settimana.',
 '🏭', 'https://base.milano.it'),

('Pista Brera — Ice Rink',
 'Viale della Liberazione 15',
 'attivita', 'mid',
 ARRAY['sportivo','social','festivo','romantico'],
 'La pista di pattinaggio sul ghiaccio nel cuore di Milano, vicino alla Biblioteca degli Alberi. Un''attività invernale perfetta in coppia o con amici.',
 'Disponibile principalmente in inverno — controlla le date di apertura stagionale.',
 '⛸️', 'https://pistabrera.it');
