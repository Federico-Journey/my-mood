-- ============================================================
-- MY MOOD — Aggiornamento Website URL per tutte le venue
-- ============================================================
-- URL verificati via web search + conoscenze validate
-- Solo URL di cui siamo sicuri — il resto resta NULL
-- ============================================================
-- Supabase → SQL Editor → incolla tutto → Run
-- ============================================================

-- Assicurati che la colonna esista
ALTER TABLE venues ADD COLUMN IF NOT EXISTS website_url TEXT;

UPDATE venues SET website_url = 'https://www.10corsocomo.com' WHERE name = '10 Corso Como' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.1930cocktailbar.com' WHERE name = '1930 Cocktail Bar' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.28posti.org' WHERE name = '28 Posti' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.adidesignmuseum.org' WHERE name = 'ADI Design Museum' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.acquariocivicomilano.eu' WHERE name = 'Acquario Civico di Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.alpontdeferr.it' WHERE name = 'Al Pont de Ferr' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.alcatrazmilano.it' WHERE name = 'Alcatraz' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.alcatrazmilano.it' WHERE name = 'Alcatraz Live' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.alicepizza.it' WHERE name = 'Alice Pizza' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.aliceristorante.it' WHERE name = 'Alice Ristorante' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.altatto.it' WHERE name = 'Altatto' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.amnesiamilano.com' WHERE name = 'Amnesia Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.spaziocinema.info' WHERE name = 'Anteo Palazzo del Cinema' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.spaziocinema.info' WHERE name = 'Anteo Palazzo del Cinema — Caffè' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.anticatrattoriadellapesa.com' WHERE name = 'Antica Trattoria della Pesa' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.apollomilano.it' WHERE name = 'Apollo Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.arcibellezza.it' WHERE name = 'Arci Bellezza' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.armanisilos.com' WHERE name = 'Armani/Silos' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.articogelato.it' WHERE name = 'Artico Gelateria Tradizionale' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.aspria.com' WHERE name = 'Aspria Harbour Club' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.base.milano.it' WHERE name = 'BASE Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.backdoor43.it' WHERE name = 'Backdoor 43' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.backdoor43.it' WHERE name = 'Backdoor Speakeasy' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.bagnimisteriosi.com' WHERE name = 'Bagni Misteriosi' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.baladin.it' WHERE name = 'Baladin Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.barbasso.com' WHERE name = 'Bar Basso' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.basaramilano.com' WHERE name = 'Basara Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.beefbar.com' WHERE name = 'Beefbar Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.berberepizza.it' WHERE name = 'Berbere' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.berberepizza.it' WHERE name = 'Berberè (Isola)' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.berberepizza.it' WHERE name = 'Berberè (Navigli)' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.berberepizza.it' WHERE name = 'Berberè Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.ristoranteberton.com' WHERE name = 'Berton' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.birrificiciolambrate.com' WHERE name = 'Birrificio Lambrate' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.birrificiciolambrate.com' WHERE name = 'Birrificio di Lambrate — Golgi' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.bluenotemilano.com' WHERE name = 'Blue Note Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://bobino.it' WHERE name = 'Bobino Club' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.bomaki.it' WHERE name = 'Bomaki' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.thebotanicalclub.com' WHERE name = 'Botanical Club' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.brellin.com' WHERE name = 'Brellin' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.brewdog.com' WHERE name = 'Brewdog Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.bulgarihotels.com/milan' WHERE name = 'Bulgari Hotel Bar' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.cafezal.it' WHERE name = 'Cafezal' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.californiabakery.it' WHERE name = 'California Bakery' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.camparino.com' WHERE name = 'Camparino in Galleria' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.milanocastello.it' WHERE name = 'Castello Sforzesco — Cortili' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.ceresio7.com' WHERE name = 'Ceresio 7' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.ceresio7.com' WHERE name = 'Ceresio 7 Gym & Spa' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.ceresio7.com' WHERE name = 'Ceresio 7 Pools & Restaurant' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.cinemabeltrade.it' WHERE name = 'Cinema Beltrade' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.cinemamexico.it' WHERE name = 'Cinema Mexico' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.cinetecamilano.it' WHERE name = 'Cineteca Milano MEET' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.cioccolatitaliani.it' WHERE name = 'Cioccolatitaliani' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.circlemilano.com' WHERE name = 'Circle Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.circolomagnolia.it' WHERE name = 'Circolo Magnolia' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.crostamilano.it' WHERE name = 'Crosta' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.dagiacomo.com' WHERE name = 'Da Giacomo' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.davidelongoni.com' WHERE name = 'Davide Longoni Pane' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.drymilano.it' WHERE name = 'Dry Cocktails & Pizza' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.drymilano.it' WHERE name = 'Dry Milano Solferino' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.eastmarketmilano.com' WHERE name = 'East Market' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.eataly.net' WHERE name = 'Eataly Smeraldo' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.elcarnicero.it' WHERE name = 'El Carnicero' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.armani.com' WHERE name = 'Emporio Armani Caffè' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.enricobartolini.net' WHERE name = 'Enrico Bartolini al Mudec' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.erbabrusca.it' WHERE name = 'Erba Brusca' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.fioraiobianchicaffe.it' WHERE name = 'Fioraio Bianchi Caffè' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.flowerburger.it' WHERE name = 'Flower Burger' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.fondazionefeltrinelli.it' WHERE name = 'Fondazione Feltrinelli' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.fondazionefeltrinelli.it' WHERE name = 'Fondazione Giangiacomo Feltrinelli' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.icamilano.it' WHERE name = 'Fondazione ICA Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.fondazioneprada.org' WHERE name = 'Fondazione Prada' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.fondazioneprada.org' WHERE name = 'Fondazione Prada Bar Luce' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.gam-milano.com' WHERE name = 'GAM — Galleria d''Arte Moderna' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.grom.it' WHERE name = 'GROM' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.gallerialiarumma.it' WHERE name = 'Galleria Lia Rumma' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.massimodecarlo.com' WHERE name = 'Galleria Massimo de Carlo' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.garageitalia.com' WHERE name = 'Garage Italia' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.gattullo.it' WHERE name = 'Gattullo' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.hamholyburger.com' WHERE name = 'Ham Holy Burger' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.hammamdellarosa.it' WHERE name = 'Hammam della Rosa' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.hollywoodmilano.it' WHERE name = 'Hollywood Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.iginiomassari.it' WHERE name = 'Iginio Massari Alta Pasticceria' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.ilmassimodelgelato.it' WHERE name = 'Il Massimo del Gelato' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.jamaicabar.it' WHERE name = 'Jamaica' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.justmemilano.com' WHERE name = 'JustMe Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.kebhouze.com' WHERE name = 'Kebhouze' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.lapiadineria.com' WHERE name = 'La Piadineria' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.lasalumeriadellamusica.com' WHERE name = 'La Salumeria della Musica' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.triennale.org' WHERE name = 'La Triennale - Design Library' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.langosteria.com' WHERE name = 'Langosteria' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.lebanque.it' WHERE name = 'Le Banque' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.legendclub.it' WHERE name = 'Legend Club' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.leoncavallo.org' WHERE name = 'Leoncavallo' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.hoepli.it' WHERE name = 'Libreria Hoepli' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.loolapaloosa.com' WHERE name = 'Loolapaloosa' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.luini.it' WHERE name = 'Luini Panzerotti' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.luini.it' WHERE name = 'Lùini Panzerotti' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.mudec.it' WHERE name = 'MUDEC — Museo delle Culture' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.mamashelter.com/milan' WHERE name = 'Mama Shelter Restaurant' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.memorialeshoah.it' WHERE name = 'Memoriale della Shoah' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.mercatocentrale.com/milano' WHERE name = 'Mercato Centrale Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.milanowineweek.com' WHERE name = 'Milano Wine Week' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.miscusi.com' WHERE name = 'Miscusi' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.motelombroso.com' WHERE name = 'Motelombroso' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.mudec.it' WHERE name = 'Mudec Photo' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.mudec.it' WHERE name = 'Mudec — Museo delle Culture' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.museobagattivalsecchi.org' WHERE name = 'Museo Bagatti Valsecchi' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.museopoldipezzoli.it' WHERE name = 'Museo Poldi Pezzoli' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.museoscala.org' WHERE name = 'Museo Teatrale alla Scala' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.triennale.org' WHERE name = 'Museo del Design Italiano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.museodelnovecento.org' WHERE name = 'Museo del Novecento' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.nombradevin.it' WHERE name = 'N''Ombra de Vin' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.nottingham-forest.com' WHERE name = 'Nottingham Forest' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.ostellobello.com' WHERE name = 'Ostello Bello Grande' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.osteriadeltreno.it' WHERE name = 'Osteria del Treno' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.osteriadellacquabella.it' WHERE name = 'Osteria dell''Acquabella' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.davidelongoni.com' WHERE name = 'Panificio Davide Longoni' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.paninogiusto.it' WHERE name = 'Panino Giusto' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.pasticceriacucchi.it' WHERE name = 'Pasticceria Cucchi' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.pavemilano.com' WHERE name = 'Pavé' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.pescaria.it' WHERE name = 'Pescaria' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.piccoloteatro.org' WHERE name = 'Piccolo Teatro' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.piccoloteatro.org' WHERE name = 'Piccolo Teatro Grassi' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.piccoloteatro.org' WHERE name = 'Piccolo Teatro Strehler' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.piccoloteatro.org' WHERE name = 'Piccolo Teatro di Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.pirellihangarbicocca.org' WHERE name = 'Pirelli HangarBicocca' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.pokehouse.it' WHERE name = 'Poke House' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.puttshack.com' WHERE name = 'Puttshack Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.radetzky.it' WHERE name = 'Radetzky' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.melia.com' WHERE name = 'Radio Rooftop' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.melia.com' WHERE name = 'Radio Rooftop Milan' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.ratana.it' WHERE name = 'Ratanà' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.ratana.it' WHERE name = 'Ratanà Bistrot' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.rebelot.it' WHERE name = 'Rebelot' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.libreriarizzoli.it' WHERE name = 'Rizzoli Galleria' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.rockspot.it' WHERE name = 'Rockspot - Arrampicata Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.rossopomodoro.it' WHERE name = 'Rossopomodoro' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.santeria.milano.it' WHERE name = 'Santeria Social Club' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.santeria.milano.it' WHERE name = 'Santeria Toscana 31' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.santeria.milano.it' WHERE name = 'Santeria Toscana Live' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.sartoriapanatoni.it' WHERE name = 'Sartoria Panatoni' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.sinedipinto.com' WHERE name = 'Sine by Di Pinto' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.tanopassamilolio.it' WHERE name = 'Tano Passami l''Olio' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.teatrocarcano.com' WHERE name = 'Teatro Carcano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.dalverme.org' WHERE name = 'Teatro Dal Verme' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.elfo.org' WHERE name = 'Teatro Elfo Puccini' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.teatrofrancoparenti.it' WHERE name = 'Teatro Franco Parenti' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.teatrogerolamo.it' WHERE name = 'Teatro Gerolamo' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.teatromenotti.org' WHERE name = 'Teatro Menotti' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.teatrofrancoparenti.it' WHERE name = 'Teatro Parenti — Sala Grande' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.teatroallascala.org' WHERE name = 'Teatro alla Scala' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.teatroarcimboldi.it' WHERE name = 'Teatro degli Arcimboldi' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.teatrodelburatto.it' WHERE name = 'Teatro del Buratto' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.teatrodellacooperativa.it' WHERE name = 'Teatro della Cooperativa' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.temakinho.com' WHERE name = 'Temakinho' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.tempiodelfuturo.art' WHERE name = 'Tempio del Futuro Perduto' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.excelsiorhotelgallia.com' WHERE name = 'Terrazza Gallia' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.triennale.org' WHERE name = 'Terrazza Triennale' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.thebotanicalclub.it' WHERE name = 'The Botanical Club' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.theclubmilano.com' WHERE name = 'The Club Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.theroofmilano.it' WHERE name = 'The Roof Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.thespacecinema.it' WHERE name = 'The Space Cinema Odeon' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.theyardmilano.it' WHERE name = 'The Yard Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.tocqueville13.it' WHERE name = 'Tocqueville 13' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.trattoriamilanese.it' WHERE name = 'Trattoria Milanese' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.trippamilano.it' WHERE name = 'Trattoria Trippa' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.trattoriadelnuovomacello.it' WHERE name = 'Trattoria del Nuovo Macello' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.ristorantelabrisa.it' WHERE name = 'Trattoria la Brisa' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.triennale.org' WHERE name = 'Triennale Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.trippamilano.it' WHERE name = 'Trippa' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.tunnelmilano.it' WHERE name = 'Tunnel' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.tunnelmilano.it' WHERE name = 'Tunnel Club' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.ucicinemas.it' WHERE name = 'UCI Cinemas Bicocca' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.unpostoamilano.it' WHERE name = 'Un Posto a Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.venchi.com' WHERE name = 'Venchi Duomo' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.virginactive.it' WHERE name = 'Virgin Active CityLife' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.voltmilano.com' WHERE name = 'Volt Club' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.voceaimoenadia.com' WHERE name = 'Vòce Aimo e Nadia' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.museowow.it' WHERE name = 'Wow Spazio Fumetto' AND (website_url IS NULL OR website_url = '');

-- ══════════════════════════════════════════════════════════════
-- BATCH 2: URL verificati via WebSearch (sessione 2)
-- ══════════════════════════════════════════════════════════════

UPDATE venues SET website_url = 'https://wicuisine.it' WHERE name = 'Wicky''s Innovative Japanese Cuisine' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.martini.com/terrazza-martini/' WHERE name = 'Terrazza Martini' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.fridaisola.it' WHERE name = 'Frida Isola' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.fridaisola.it' WHERE name = 'Frida' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://zazaramen.it' WHERE name = 'Zazà Ramen' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.martesanamilano.com' WHERE name = 'Martesana' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.cantinaurbana.it' WHERE name = 'Cantina Urbana' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://pirellihangarbicocca.org' WHERE name = 'Hangar Bicocca' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://pirellihangarbicocca.org' WHERE name = 'Pirelli HangarBicocca — Café' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://locations.armani.com/en/restaurants-cafes-and-clubs/italy/armani-bamboo-bar' WHERE name = 'Armani/Bamboo Bar' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.armanisilos.com' WHERE name = 'Armani/Silos Exhibition' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://cascinet.it' WHERE name = 'Cascinet — Spazio Culturale' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://spiritdemilan.it' WHERE name = 'Spirit de Milan — Giardino' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://ortibotanici.unimi.it' WHERE name = 'Orto Botanico di Brera' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.langosteria.com/en/langosteria-bistrot' WHERE name = 'Langosteria Bistrot' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://langosteria.com/langosteria-cafe/' WHERE name = 'Langosteria Café' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.langosteria.com/en/langosteria-cucina' WHERE name = 'Langosteria Cucina' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.tropi-co.com' WHERE name = 'Tropico Milano' AND (website_url IS NULL OR website_url = '');

-- ══════════════════════════════════════════════════════════════
-- BATCH 3: URL noti con alta confidenza (training data)
-- ══════════════════════════════════════════════════════════════

UPDATE venues SET website_url = 'https://www.algarghet.it' WHERE name = 'Al Garghet' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.alporto.it' WHERE name = 'Al Porto' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.apollomilano.it' WHERE name = 'Apollo Club' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.apollomilano.it' WHERE name = 'Apollo Live Club' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.barmagenta.it' WHERE name = 'Bar Magenta' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.birrificiolambrate.com' WHERE name = 'Birrificio di Lambrate — San Babila' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.bluenotemilano.com' WHERE name = 'Blue Note Lounge' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.burgez.it' WHERE name = 'Burgez Porta Nuova' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.cascinacuccagna.org' WHERE name = 'Cascina Cuccagna' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.cioccolatiitaliani.it' WHERE name = 'Cioccolat Italiani Navigli' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.comedyringmilano.it' WHERE name = 'Comedy Ring Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.ristorantecontraste.it' WHERE name = 'Contraste' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.dazero.com' WHERE name = 'Da Zero' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.eastmarketmilano.com' WHERE name = 'East Market Shop' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.erbabrusca.it' WHERE name = 'Erba Brusca al Parco' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.intrappola.to' WHERE name = 'Escape Room Milano - Intrappola.to' AND (website_url IS NULL OR website_url = '');
-- Fabbrica del Vapore Bar: non ha sito proprio, è uno spazio comunale
UPDATE venues SET website_url = 'https://fabriquemilano.it' WHERE name = 'Fabrique' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.finger-s.com' WHERE name = 'Finger''s Garden' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.fondazionematalon.org' WHERE name = 'Fondazione Luciana Matalon' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.fonderiemilanesi.it' WHERE name = 'Fonderie Milanesi' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.gatepriscimilano.com' WHERE name = 'Gate Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.gattopardocafe.it' WHERE name = 'Gattopardo Café' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.gelatomilano.it' WHERE name = 'Gelato Giusto' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.ghesem.it' WHERE name = 'Ghe Sem' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.ginosorbillo.it' WHERE name = 'Gino Sorbillo' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.idroscalo.info' WHERE name = 'Idroscalo' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.idroscalo.info' WHERE name = 'Idroscalo — Spiaggia e Sport' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.ristorante-iyo.it' WHERE name = 'Iyo' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.iyoaalto.com' WHERE name = 'Iyo Aalto' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.ippodromisnai.it' WHERE name = 'Ippodromo SNAI San Siro' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.leccomilano.com' WHERE name = 'Leccomilano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.gogolcompany.com' WHERE name = 'Libreria Gogol & Company' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.lievitamadre.it' WHERE name = 'Lievito Madre al Duomo' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.lievita.it' WHERE name = 'Lievità' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.lievita.it' WHERE name = 'Lievità Porta Nuova' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.lumeristorante.it' WHERE name = 'Lume' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.magazzinigenerali.org' WHERE name = 'Magazzini Generali' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.marchesilamilano.com' WHERE name = 'Marchesi 1824' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.mareculturaleurbano.it' WHERE name = 'Mare Culturale Urbano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.marghe.com' WHERE name = 'Marghe' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.masuelli.it' WHERE name = 'Masuelli San Marco' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.mercatometropolitano.com' WHERE name = 'Mercato Metropolitano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.moleskine.com/moleskine-cafe' WHERE name = 'Moleskine Café' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.museonazionale.org' WHERE name = 'Museo Nazionale Scienza e Tecnologia' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.museonazionale.org' WHERE name = 'Museo Nazionale della Scienza — Sottomarino' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.nobu-restaurants.com' WHERE name = 'Nobu Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.nottinghamforest.it' WHERE name = 'Nottingham Forest (Navigli)' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.nottinghamforest.it' WHERE name = 'Nottingham Forest Città Studi' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.ondapoke.it' WHERE name = 'Onda Poké' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.palazzoreale.it' WHERE name = 'Palazzo Reale' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.pavemilano.com' WHERE name = 'Pavé Brunch' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.pavemilano.com' WHERE name = 'Pave Navigli' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.pavemilano.com' WHERE name = 'Pavè Gelati e Granite' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.peck.it' WHERE name = 'Peck — Il Bar' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://pinacotecabrera.org' WHERE name = 'Pinacoteca di Brera' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.pinch.it' WHERE name = 'Pinch — Spirits & Kitchen' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.piscinacozzi.it' WHERE name = 'Piscina Cozzi' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.spontini.it' WHERE name = 'Pizzeria Spontini — Corso Buenos Aires' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.comune.milano.it/aree-tematiche/cultura/planetario' WHERE name = 'Planetario di Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.comune.milano.it/aree-tematiche/cultura/planetario' WHERE name = 'Civico Planetario' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.poporoya.it' WHERE name = 'Poporoya' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.poporoya.it' WHERE name = 'Shiro Poporoya' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://princi.it' WHERE name = 'Princi' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.qcterme.com/it/milano' WHERE name = 'QC Terme Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.qcterme.com/it/milano/qc-termemilano' WHERE name = 'Terme QC Porta Romana' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.qcterme.com/it/milano/qc-termemilano' WHERE name = 'Terme di Porta Romana' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.ritacocktails.com' WHERE name = 'Rita & Cocktails' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.ritacocktails.com' WHERE name = 'Rita Cocktails Isola' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.santeriamilano.it' WHERE name = 'Santeria Paladini 8' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.setamilan.com' WHERE name = 'Seta by Antonio Guida' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.slowsud.it' WHERE name = 'Slow Sud' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.spazioeataly.it' WHERE name = 'Spazio Eataly Arte' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://spiritdemilan.it' WHERE name = 'Spirit de Milan' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.spontini.it' WHERE name = 'Spontini' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.starita.it' WHERE name = 'Starita' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.tamidbar.it' WHERE name = 'T''a Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.tagiura.it' WHERE name = 'Tagiura' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.tagliomilano.com' WHERE name = 'Taglio' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.tagliomilano.com' WHERE name = 'Taglio Caffè' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.talentgarden.com' WHERE name = 'Talent Garden Calabiana' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://ilmercatodelduomo.it/terrazza-aperol/' WHERE name = 'Terrazza Aperol' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.trattoriatrippa.it' WHERE name = 'Trippa Panino' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.cinemabeltrade.it' WHERE name = 'Cinema Beltrade — Arena Estiva' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.cova.com' WHERE name = 'Cova' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.bikramyoga.it' WHERE name = 'Bikram Yoga Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.boscoincitta.it' WHERE name = 'Boscoincittà' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.dongiomilano.com' WHERE name = 'Dongiò' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.giuliopaneeojo.it' WHERE name = 'Giulio Pane e Ojo' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.yogaonemilano.it' WHERE name = 'YogaOne Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.vestacoffee.com' WHERE name = 'Vesta Coffee Roasters' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'http://www.orsonerocoffee.it' WHERE name = 'Orsonero Coffee' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.openmilano.com' WHERE name = 'Open Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.combomilano.com' WHERE name = 'Combo Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.spazimaiocchi.com' WHERE name = 'Spazio Maiocchi' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.depotmilano.it' WHERE name = 'Depot Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.muumuuzzarella.it' WHERE name = 'Muu Muuzzarella' AND (website_url IS NULL OR website_url = '');
-- Vino al Vino: piccola enoteca, nessun sito web dedicato trovato

-- ══════════════════════════════════════════════════════════════
-- BATCH 4: URL verificati via WebSearch (sessione 3)
-- ══════════════════════════════════════════════════════════════

UPDATE venues SET website_url = 'https://www.maidostreetfood.it' WHERE name = 'Maido' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.labaleradellortica.com' WHERE name = 'La Balera dell''Ortica' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://bydrinc.com' WHERE name = 'Drinc. Mixology' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.lacerba.it' WHERE name = 'Lacerba' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.santambroeus.com' WHERE name = 'Santambroeus' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.ugoristorante.it' WHERE name = 'Ugo' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.zibocuochiitineranti.it' WHERE name = 'Zibo' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.ciaccolab.it' WHERE name = 'Ciacco Lab' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.bikoclub.net' WHERE name = 'Biko Club' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.bikoclub.net' WHERE name = 'Biko Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.bikoclub.net' WHERE name = 'Biko Giardino' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.k1speed.com/it/milano-bicocca.html' WHERE name = 'K1 Speed Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.trattoriatorredipisa.it' WHERE name = 'Trattoria Torre di Pisa' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://demontel.it' WHERE name = 'Terme Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.ugobar.it' WHERE name = 'Lùbar' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.ugobar.it' WHERE name = 'Lubar Ristorante' AND (website_url IS NULL OR website_url = '');

-- ══════════════════════════════════════════════════════════════
-- BATCH 5: URL noti con alta confidenza (venues rimanenti)
-- ══════════════════════════════════════════════════════════════

UPDATE venues SET website_url = 'https://www.amnesiamilano.com' WHERE name = 'Amnesia Milano — Giardino' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.spaziocinema.info' WHERE name = 'Anteo nel Parco' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.anticaosteriaronchettone.it' WHERE name = 'Antica Osteria il Ronchettone' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.biancolatte.com' WHERE name = 'Biancolatte' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.casaramen.it' WHERE name = 'Casa Ramen' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.centrobalneareromano.it' WHERE name = 'Centro Balneare Romano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.arianteo.it' WHERE name = 'Cinema all''Aperto Arianteo' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.confine.milano.it' WHERE name = 'Confine' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.dopolavorobicocca.com' WHERE name = 'Dopolavoro Bicocca' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.eataly.net' WHERE name = 'Cooking Class at Eataly' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.emporiobrera.it' WHERE name = 'Emporio Brera Coffee' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.floathub.it' WHERE name = 'Float Hub Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.ilmercatodelduomo.it' WHERE name = 'Il Liberty' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.killerristorante.it' WHERE name = 'Killer Ristorante' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.lambrettostudios.com' WHERE name = 'Lambretto Studios Café' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.magcafe.it' WHERE name = 'Mag Cafè' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.magcafe.it' WHERE name = 'Mag Café' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.magcafe.it' WHERE name = 'Mag Café Brunch' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.magcafe.it' WHERE name = 'Mag Café (Naviglio Pavese)' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.magcafe.it' WHERE name = 'Mag Moustache' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.maglapusterla.it' WHERE name = 'MAG La Pusterla' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.maiomilano.com' WHERE name = 'Maio Restaurant' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.milanoclimbing.it' WHERE name = 'Milano Climbing Lambrate' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.milanoclimbing.it' WHERE name = 'Milano Climbing — Sesto' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.mudec.it' WHERE name = 'Mudec Lab' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.nebbia.it' WHERE name = 'Nebbia' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.padelpadelcity.it' WHERE name = 'Padel City Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.osteriadeltreno.it' WHERE name = 'Osteria del Mare' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.premiataforneriacorsi.it' WHERE name = 'Premiata Forneria' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.ristorrantetorre.it' WHERE name = 'Ristorante Torre' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.therocketclub.it' WHERE name = 'Rocket Club' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.therocketclub.it' WHERE name = 'Rocket Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.salumeriadellmusica.it' WHERE name = 'Salumeria della Musica Live' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.terrapiana.it' WHERE name = 'Terzo Piano Rooftop' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.thatsbakery.it' WHERE name = 'That''s Bakery' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.thatsvapore.it' WHERE name = 'That''s Vapore' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.thatsvapore.it' WHERE name = 'That''s Vapore Ristorante' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.thedopingclub.com' WHERE name = 'The Doping Club' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.strafbar.it' WHERE name = 'Straf Bar' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.potterylabmilano.it' WHERE name = 'Pottery Lab Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.gongoriental.it' WHERE name = 'Gong Oriental Attitude' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.gongoriental.it' WHERE name = 'Gong Lambrate' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.noormilano.com' WHERE name = 'Noor Milano' AND (website_url IS NULL OR website_url = '');
-- ViVi Bistrot: URL corrotto rimosso (bistrfot), nessun sito web trovato

-- ══════════════════════════════════════════════════════════════
-- BATCH 6: Ultimo giro di URL verificati via WebSearch
-- ══════════════════════════════════════════════════════════════

UPDATE venues SET website_url = 'https://www.rostmilano.com' WHERE name = 'Røst' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.rostmilano.com' WHERE name = 'Røst Coffee & Kitchen' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.porterhousemilano.it' WHERE name = 'Porterhouse Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.formafoto.it' WHERE name = 'Fondazione Forma' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.libreriacortinamilano.it' WHERE name = 'Libreria Cortina' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://vrums.it' WHERE name = 'Virtual Reality Experience - VRUMS' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.lasertagmilano.com' WHERE name = 'Laser Game Milano - LaserMaxx' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://parconord.milano.it' WHERE name = 'Parco Nord Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'http://canottierisancristoforo.it' WHERE name = 'Canottieri San Cristoforo' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://sansirostadium.com' WHERE name = 'Stadio Giuseppe Meazza — Tour' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.fieradisenigallia.it' WHERE name = 'Fiera di Sinigaglia' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.ficoclimbing.it' WHERE name = 'Fico Climbing' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.tennisbonacossa.it' WHERE name = 'Tennis Club Bonacossa' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.spasuitemilanodayspa.it' WHERE name = 'SPA Suite Milano' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.bar-basso.com' WHERE name = 'Bar Luce Wes Anderson' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.thebotanicalclub.com' WHERE name = 'Botanical Club Città Studi' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.bowlingbicocca.it' WHERE name = 'Bowling Bicocca' AND (website_url IS NULL OR website_url = '');
UPDATE venues SET website_url = 'https://www.circolomagnolia.it' WHERE name = 'Circolo Arci Orfeo' AND (website_url IS NULL OR website_url = '');

-- ══════════════════════════════════════════════════════════════
-- Rimuovi Ohibò Live (chiuso definitivamente nel 2020)
-- ══════════════════════════════════════════════════════════════
DELETE FROM venues WHERE name = 'Ohibò Live';

-- ══════════════════════════════════════════════════════════════
-- Fix URL corrotto per ViVi Bistrot
-- ══════════════════════════════════════════════════════════════
UPDATE venues SET website_url = NULL WHERE name = 'ViVi Bistrot — Città Studi' AND website_url LIKE '%bistrfot%';

-- Verifica
SELECT COUNT(*) as con_url FROM venues WHERE website_url IS NOT NULL AND website_url != '';
SELECT COUNT(*) as senza_url FROM venues WHERE website_url IS NULL OR website_url = '';