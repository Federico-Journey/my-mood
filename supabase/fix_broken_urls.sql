-- ============================================================
-- MY MOOD — Fix URL Rotti / Sbagliati
-- ============================================================
-- 58 venue avevano URL che puntavano al sito di un'altra venue
-- o contenevano 'france' nel mezzo del dominio (errore di generazione)
-- ============================================================
-- Supabase → SQL Editor → incolla tutto → Run
-- ============================================================

-- ══════════════════════════════════════════════════════════════
-- STEP 1: Rimuovi URL sbagliati (puntano al sito di un'altra venue)
-- ══════════════════════════════════════════════════════════════

UPDATE venues SET website_url = NULL WHERE name = 'Al Fresco' AND website_url LIKE '%rost%';
UPDATE venues SET website_url = NULL WHERE name = 'Ba Asian Mood' AND website_url LIKE '%zazaramen%';
UPDATE venues SET website_url = NULL WHERE name = 'Bowling Rozzano' AND website_url LIKE '%intrappola%';
UPDATE venues SET website_url = NULL WHERE name = 'Cinema Arlecchino' AND website_url LIKE '%ucicinemas%';
UPDATE venues SET website_url = NULL WHERE name = 'Cinema Mexico' AND website_url LIKE '%beltrade%';
UPDATE venues SET website_url = NULL WHERE name = 'CityLife Park' AND website_url LIKE '%rockspot%';
UPDATE venues SET website_url = NULL WHERE name = 'Dim Sum' AND website_url LIKE '%berberepizza%';
UPDATE venues SET website_url = NULL WHERE name LIKE 'El Porteño%' AND website_url LIKE '%mamashelter%';
UPDATE venues SET website_url = NULL WHERE name = 'Hop Stuff Brew Pub' AND website_url LIKE '%terrazzaaperol%';
UPDATE venues SET website_url = NULL WHERE name = 'Tagiura' AND website_url LIKE '%bomaki%';
UPDATE venues SET website_url = NULL WHERE name = 'Taglio' AND website_url LIKE '%iyo%';
UPDATE venues SET website_url = NULL WHERE name LIKE 'Taqueria%' AND website_url LIKE '%berberepizza%';
UPDATE venues SET website_url = NULL WHERE name = 'Trattoria Milanese' AND website_url LIKE '%osteriadeltreno%';
UPDATE venues SET website_url = NULL WHERE name = 'Trattoria Trippa' AND website_url LIKE '%ratana%';
UPDATE venues SET website_url = NULL WHERE name = 'Artico Gelateria Tradizionale' AND website_url LIKE '%iginiomassari%';
UPDATE venues SET website_url = NULL WHERE name = 'Champagneria Giulia' AND website_url LIKE '%luini%';
UPDATE venues SET website_url = NULL WHERE name LIKE 'Da Giannino%' AND website_url LIKE '%pescaria%';
UPDATE venues SET website_url = NULL WHERE name LIKE 'Emporio Armani%' AND website_url LIKE '%longoni%';
UPDATE venues SET website_url = NULL WHERE name = 'Enoteca Naturale' AND website_url LIKE '%drymilano%';
UPDATE venues SET website_url = NULL WHERE name = 'Gattullo' AND website_url LIKE '%grom%';
UPDATE venues SET website_url = NULL WHERE name = 'Hug Milano' AND website_url LIKE '%eastmarket%';
UPDATE venues SET website_url = NULL WHERE name = 'Jamaica' AND website_url LIKE '%nottinghamforest%';
UPDATE venues SET website_url = NULL WHERE name = 'Cantine Isola' AND website_url LIKE '%cantinaurbana%';
UPDATE venues SET website_url = NULL WHERE name = 'La Salumeria della Musica' AND website_url LIKE '%beefbar%';
UPDATE venues SET website_url = NULL WHERE name LIKE 'Mag Café (Naviglio%' AND website_url LIKE '%cuccagna%';
UPDATE venues SET website_url = NULL WHERE name LIKE 'Mercato Comunale%' AND website_url LIKE '%eataly%';
UPDATE venues SET website_url = NULL WHERE name LIKE 'Naviglio Grande - Mercatone%' AND website_url LIKE '%hammam%';
UPDATE venues SET website_url = NULL WHERE name = 'Serraglio Jazz Club' AND website_url LIKE '%santeria%';
UPDATE venues SET website_url = NULL WHERE name = 'Spazio Maiocchi' AND website_url LIKE '%triennale%';
UPDATE venues SET website_url = NULL WHERE name = 'Stork Milano' AND website_url LIKE '%luini%';
UPDATE venues SET website_url = NULL WHERE name LIKE 'That''s Vapore' AND website_url LIKE '%bluenote%';
UPDATE venues SET website_url = NULL WHERE name = 'Trippa' AND website_url LIKE '%28posti%';
UPDATE venues SET website_url = NULL WHERE name LIKE 'Vòce Aimo%' AND website_url LIKE '%vivianavarese%';
UPDATE venues SET website_url = NULL WHERE name = 'Kebhouze' AND website_url LIKE '%berberepizza%';
UPDATE venues SET website_url = NULL WHERE name = 'Alice Pizza' AND website_url LIKE '%rossopomodoro%';
UPDATE venues SET website_url = NULL WHERE name = 'Bok' AND website_url LIKE '%ostellobello%';
UPDATE venues SET website_url = NULL WHERE name LIKE 'Colibrì%' AND website_url LIKE '%moleskine%';
UPDATE venues SET website_url = NULL WHERE name = 'Escape Room Milano' AND website_url LIKE '%puttshack%';
UPDATE venues SET website_url = NULL WHERE name = 'Forno del Mastro' AND website_url LIKE '%fondazioneprada%';
UPDATE venues SET website_url = NULL WHERE name = 'Kebab de Milan' AND website_url LIKE '%oldfashion%';
UPDATE venues SET website_url = NULL WHERE name = 'Libreria Utopia' AND website_url LIKE '%mudec%';
UPDATE venues SET website_url = NULL WHERE name LIKE 'Open — Care%' AND website_url LIKE '%hoepli%';
UPDATE venues SET website_url = NULL WHERE name = 'Ravioleria Sarpi' AND website_url LIKE '%gong%';
UPDATE venues SET website_url = NULL WHERE name = 'Sakeya' AND website_url LIKE '%massimodecarlo%';
UPDATE venues SET website_url = NULL WHERE name = 'Sushi Daily Bar' AND website_url LIKE '%nobu%';
UPDATE venues SET website_url = NULL WHERE name = 'Tocqueville 13' AND website_url LIKE '%birrificiolambrate%';
UPDATE venues SET website_url = NULL WHERE name = 'Trattoria del Nuovo Macello' AND website_url LIKE '%santeria%';
UPDATE venues SET website_url = NULL WHERE name = 'Chic Noodle Bar' AND website_url LIKE '%alcatraz%';
UPDATE venues SET website_url = NULL WHERE name LIKE 'Erba Brusca al%' AND website_url LIKE '%lievita%';
UPDATE venues SET website_url = NULL WHERE name = 'Frida Isola' AND website_url LIKE '%lume%';
UPDATE venues SET website_url = NULL WHERE name LIKE 'GAM%' AND website_url LIKE '%adidesign%';
UPDATE venues SET website_url = NULL WHERE name LIKE 'Jazz Café' AND website_url LIKE '%venchi%';
UPDATE venues SET website_url = NULL WHERE name LIKE 'Museo Nazionale della Scienza%Sottomarino' AND website_url LIKE '%armani%';
UPDATE venues SET website_url = NULL WHERE name = 'Pasticceria Cucchi' AND website_url LIKE '%peck%';
UPDATE venues SET website_url = NULL WHERE name = 'Starita' AND website_url LIKE '%memoriale%';
UPDATE venues SET website_url = NULL WHERE name LIKE 'Amnesia Milano%Giardino' AND website_url LIKE '%excelsior%';
UPDATE venues SET website_url = NULL WHERE name = 'Terrazza 12' AND website_url LIKE '%ceresio%';
UPDATE venues SET website_url = NULL WHERE name = 'Terrazza Martini' AND website_url LIKE '%langosteria%';

-- ══════════════════════════════════════════════════════════════
-- STEP 2: Fix URL con 'france' nel dominio (corrotti)
-- ══════════════════════════════════════════════════════════════

UPDATE venues SET website_url = REPLACE(website_url, 'france', '')
WHERE website_url LIKE '%france%';

-- ══════════════════════════════════════════════════════════════
-- STEP 3: Fix domini corrotti dopo rimozione 'france'
-- (la rimozione ha mangiato lettere che facevano parte del nome reale)
-- ══════════════════════════════════════════════════════════════

UPDATE venues SET website_url = NULL WHERE website_url LIKE '%birificiolambrate%';
UPDATE venues SET website_url = NULL WHERE website_url LIKE '%paronord.milano%';
UPDATE venues SET website_url = NULL WHERE website_url LIKE '%antocinema%';
UPDATE venues SET website_url = NULL WHERE website_url LIKE '%birrificiolambrate%';

-- ══════════════════════════════════════════════════════════════
-- Verifica: mostra venue con URL ancora contenenti 'france'
-- ══════════════════════════════════════════════════════════════
SELECT name, website_url FROM venues WHERE website_url LIKE '%france%';
-- Dovrebbe restituire 0 righe

-- Verifica: mostra quante venue hanno un URL
SELECT COUNT(*) as venues_with_url FROM venues WHERE website_url IS NOT NULL;
SELECT COUNT(*) as venues_without_url FROM venues WHERE website_url IS NULL;
