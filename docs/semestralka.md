# Semestrální práce {: .page_title}
Semestrální práce je zaměřena na aplikaci základních nástrojů vektorových a rastrových prostorových analýz v zadaném území, a je rozdělena do dvou částí:

- [**ČÁST I – ZÁKLADNÍ CHARAKTERISTIKA ÚZEMÍ**](/semestralka/#cast-i-zakladni-charakteristika-uzemi)

- [**ČÁST II – ANALÝZA ÚZEMÍ**](/semestralka/#cast-ii-analyza-uzemi)



Výsledky jednotlivých částí semestrální práce jsou odevzdány a prezentovány ve stanovených termínech (viz níže).


Dotazy či připomínky k semestrální práci směřujte k vyučujícím Vaší paralelky.


<div class="grid cards" markdown>

-   :material-map-marker-radius: __Výběr území__ 
    
    ---
    1. **Výběr** katastrálního území dle [**této mapy**](https://arcg.is/1ePSnC)
    
    2. **Zadání** názvu vybraného katastrálního území do [**sdílené tabulky**](https://docs.google.com/spreadsheets/d/1g2wl-ERTO59lgwzLRXmvFsilolLZivnxeKEC8jEvaN0/) nejpozději __do neděle 4. října 2026, 23.59hod__{.outlined}

-   :material-calendar-text: __Termíny odevzdání__
    
    ---
   - __část I:__ __neděle 1. listopadu 2026, 23.59hod__{.outlined}
   - __část II:__ __15.–18. prosince 2026__{.outlined}
</div>

<hr class="level-1">


## ČÁST I – ZÁKLADNÍ CHARAKTERISTIKA ÚZEMÍ

__Cíl__

- tvorba tematické geodatabáze pro zadané katastrální území,
- zjištění základních charakteristik o území.
<!--- tvorba mapového výstupu.-->

__Výstupy__

- technická zpráva ve formátu PDF
- tematická geodatabáze  

Termín odevzdání: __neděle 1. listopadu 2026, 23.59hod__{.outlined}

Úloha je uznána, pokud výstupy obsahují __všechny požadované náležitosti__ (viz níže).

???+ note-grey "Požadované náležitosti technické zprávy :material-file:"
    - formát odevzdání __PDF__, název souboru __PrijmeniJmeno_NazevKU_KodKU.pdf__{.no-dec .outlined}, případně __PrijmeniJmeno_NazevKU_KodKU_oprava01.pdf__{.no-dec .outlined}
    - rozpiska se __jménem__, __názvem úlohy__, __individuálním číslem zadání__ a __názvem a kódem zadaného katastrálního území__
    - jsou uvedeny všechny požadované __charakteristiky__ a __odpovědi__ na otázky uvedené v zadání úlohy včetně __stručného postupu jejich řešení__ (použité nástroje apod.)
    - __tabulky a grafy__ dle zadání
    - __závěr__ s krátkým (3 až 6 vět) objektivním hodnocením výsledků úlohy. Lze např. zhodnotit, proč jsou některé výsledky takové, jaké jsou. Nebo zmínit využití podobné úlohy ve vašem oboru.

???+ note-grey "Požadované náležitosti tematické geodatabáze :material-database:"
    - formát odevzdání __gdb__, název souboru __PrijmeniJmeno_NazevKU_KodKU.gdb__{.no-dec .outlined}, případně __PrijmeniJmeno_NazevKU_KodKU_oprava01.gdb__{.no-dec .outlined}
    - obsahuje dva tematické feature datasety s názvy __CharakteristikaUzemi__{.no-dec .outlined} a __AnalyzaUzemi__{.no-dec .outlined}
    - v datasetech jsou uloženy __vhodně pojmenované datové vrstvy__ dle zadání úlohy


---

### __1. Správa dat__

 __Vytvořte souborovou geodatabázi__ s názvem `NazevKU_KodKU_PrijmeniJmeno.gdb`, v rámci které budete ukládat a spravovat vektorová a rastrová data v souřadnicovém systému JTSK za zvolené katastrální území. V rámci geodatabáze __vytvořte dva tematické feature datasety__ s názvy `CharakteristikaUzemi` a `AnalyzaUzemi`, do kterých budete ukládat vstupní data, resp. výsledky jednotlivých analýz (viz zadání jednotlivých úloh). 

---

### __2. Základní charakteristika území__

__a. Pro zadané území vyhledejte následující datové vrstvy:__

- polygonové vymezení katastrálního území,
- stavební objekty,
- parcely,
- vodní toky,
- vodní plochy,
- povodí,
- silnice,
- železnice,
- kótované body,
- geologické podloží.

Vybrané datové vrstvy exportujte pouze v rozsahu zadaného katastrálního území do tematického datasetu `CharakteristikaUzemi`. Do datasetu uložte také liniovou hranici katastrálního území. V technické zprávě vytvořte přehlednou tabulku s informacemi o datových vrstvách *(název vrstvy – poskytovatel / zdroj dat – CRS – URL)*.


- **Podmínka:** Minimálně jedna datová vrstva bude extrahována z mapové služby.

- **Doporučené datové zdroje:** RÚIAN, ZABAGED, DIBAVOD, ČGS

<br>

__b. Z datových vrstev zjistěte následující charakteristiky území:__

- rozloha katastrálního území v km²,
- příslušnost k obci,
- počet stavebních objektů,
- příslušnost k povodí,
- hustota vodní sítě v km/km²,
- celková plocha rybníků v km²,
- celková délka silnic a železnic v km,
- průměrná výška kótovaných bodů v m n. m.,
- převažující typ horniny (% plochy k. ú.).

V technické zprávě uveďte zjištěné chrakteristiky území a uveďte stručný postup jejich řešení (použité nástroje apod.).


???+ note-grey "Výstupy Úlohy č. 2"
    - datové vrstvy v tematickém datasetu geodatabáze,
    - přehledná tabulka s informacemi o datových vrstvách *(vrstva – poskytovatel / zdroj dat – CRS – URL)*,
    - základní charakteristiky území + stručný postup zjištění dané charakteristiky *(použité nástroje, printscreen)*.


---

### __3. Současný stav využití krajiny__

__a. Vytvořte datovou vrstvu využití krajiny dle následujícího postupu:__

- Zdroj dat: _:material-layers-triple: RÚIAN_{.bg}, _:material-layers: Parcela_{.bg}

- Pro urychlení výpočtu nejprve vyberte parcely na základě atributu _:material-table: Nadřazené katastrální území_{.bg}.

- Dle atributů v tabulce níže vypočítejte pro data nový sloupec _:material-table: TYP_VYUZITI_{.bg}, na základě kterého vrstvu následně vhodně vizualizujte. Číselníky pro přiřazení kódů: [Způsob využití pozemku](https://www.cuzk.cz/Katastr-nemovitosti/Poskytovani-udaju-z-KN/Ciselniky-ISKN/Ciselniky-k-nemovitosti/Zpusob-vyuziti-pozemku.aspx), [Kód druhu pozemku](https://www.cuzk.cz/Katastr-nemovitosti/Poskytovani-udaju-z-KN/Ciselniky-ISKN/Ciselniky-k-nemovitosti/Druh-pozemku.aspx).
- Závěrem proveďte *Dissolve* dle atributu _:material-table: TYP_VYUZITI_{.bg}.

??? task-fg-color "Jak na to?"
      Data se vhodně protřídí dle kódů níže pomocí funkce *Select by attributes* (využití spojky AND pro určení kódů z obou sloupců *SC_D_POZEMKU* a *SC_ZP_VYUZITI_POZ* najednou). Takto vybraným plochám se následně přiřadí nový atribut. 
      
      Například pro určení orné půdy vybereme *SC_D_POZEMKU* = 2. Pro určení zastavěné plochy už budeme muset využít oba sloupce s kódy pozemků, a tedy musíme vybrat *SC_D_POZEMKU* = 13 a *SC_ZP_VYUZITI_POZ*  *is Null*

      V případě určování typu využití pozemku (sloupec *TYP_VYUZITI*) pro atributy *ostatní* a *komunikace* musí platit výběr prvků ze sloupců *Kód druhu pozemku* a *Způsob využití pozemku* zároveň (tedy využití *AND* ve funkci *Select by attributes*).


|  Typ využití pozemku *TYP_VYUZITI* (vypočtené)       | Kód druhu pozemku *SC_D_POZEMKU*        | Způsob využití pozemku *SC_ZP_VYUZITI_POZ*            
| ------------ | ------------------------- |----------------|
| orná půda    | 2 | -|
| lesní půda | 10 |  -|
| trvalý travní porost   | 7, 8 | -|
| zahrada    | 5, 6 | -|
| vodstvo   | 11 | -|
| zastavěná plocha     |  13  | *Null* |
| nádvoří     |  13  | *Not Null* |
| komunikace   | 3, 4 , 14 | 14, 15, 16, 17|
| ostatní   | 3, 4 , 14 | vše kromě 14, 15, 16, 17|


Výslednou datovou vrstvu exportujte do tematického datasetu `AnalyzaUzemi`.



__b. Určete rozlohu (v ha) a podíl zastoupení (v %) jednotlivých typů krajiny (viz výše) na celkové rozloze katastrálního území. Následně odpovězte na tyto otázky:__

- Který typ krajinného pokryvu na území převažuje?
- Jaký podíl území tvoří zemědělsky využívané plochy (= OP, TTP, zahrada)?
- Jaký podíl tvoří lesní a jiné přírodě blízké plochy?
- Jaký podíl území je zastavěný nebo jinak urbanizovaný?

Výsledky zpracujte do přehledné tabulky a grafu.
<!--
<br>

__c. Vytvořte jednoduchou mapovou vizualizaci, která bude povinně obsahovat tyto části:__


- __Mapový obsah__

    - hranice katastrálního území,
    - vhodně barevně rozlišené typy krajinného pokryvu,
    - geografické názvy základních sídelních útvarů.

- __Základní kompoziční prvky__

    - název,
    - legendu,
    - grafické měřítko,
    - severku,
    - zdroj dat,
    - tiráž (jméno a příjmení autora, afiliace, rok)

Výslednou mapovou vizualizaci exportujte ve formátu PDF, velikost A4 (orientace dle charakteru území) s rozlišením 150 dpi. -->


???+ note-grey "Výstupy Úlohy č. 3"
    - datové vrstvy v tematickém datasetu geodatabáze,
    - přehledná tabulka a graf využití krajiny + odpovědi na otázky.
    <!-- - mapa krajinného pokryvu (PDF, A4, 150 dpi). -->

<br>

<hr class="level-1">

## ČÁST II – ANALÝZA ÚZEMÍ

__Cíl__

- použití základních geoprocessingových nástrojů,
- tvorba webové mapové aplikace.

__Výstupy__

- webová mapová aplikace

Termín odevzdání: __15.–18. prosince 2026__{.outlined}

Úloha je uznána, pokud výstupy obsahují __všechny požadované náležitosti__ (viz níže).

???+ note-grey "Požadované náležitosti webové mapové aplikace :material-map:"
    - název aplikace __PrijmeniJmeno_NazevKU_KodKU_GISZ_2026__{.no-dec .outlined},
    - webová aplikace obsahuje všechny povinné tematické sekce,
    - ve webové aplikaci jsou všechny webové mapy a zadané charakteristiky (ve formě tabulek, grafů či slovního komentáře),
    - podkladová mapa v S-JTSK – Základní topografická mapa nebo Ortofoto od Zeměměřického úřadu,
    - sdílení webových map i webové aplikace je nastaveno jako __"v rámci organizace"__, __bez správného nastavení sdílení nemá vyučující přístup k mapě__{style="color:#c22521;" .icon-exclm .no-dec}.


---

### __4. Historický stav využití krajiny__

__a. Pro zadané katastrální území georeferencujte rastry Císařských otisků stabilního katastru (CO) z poloviny 19. století:__

- Rastry najdete na sdíleném disku `S:\K155\Public\data\GISZ\SP2026_CO`. Vaše zadání si překopírujte na disk svého počítače.

- Pro georeferencování využívejte identické body (rohy budov, boží muka), polygony současných parcel či hranice katastrálních území (ta se však mohou lišit oproti stavu v 19. století).

- Z georeferencovaných rastrů vytvořte mozaiku.



__b. Na podkladu CO vektorizujte celé zadané katastrální území:__

- V případě změny v hranicích katastrálního území vektorizujte pouze prvky spadající do současného vymezení katastru (dle  _:material-layers-triple: RÚIAN_{.bg}, _:material-layers: KatastralniUzemi_{.bg}).

- Rozlišujte následující typy využití ploch (stejně jako v Úloze č. 3 pro data z RÚIAN): 

    - orná půda

    - lesní půda

    - trvalý travní porosty (louky, pastviny)

    - zahrada

    - vodstvo (řeky, potoky, rybníky), nevektorizujte malé vodní toky vyznačené pouze liniově

    - zastavěná plocha

    - nádvoří (okolí domů, neoznačené zahrady, veřejné prostory v intravilánu)

    - komunikace (cesty, silnice, železnice)

    - ostatní lomy, neúrodná půda apod.

<figure markdown>
![CO_legenda](../assets/sempr/legenda-stabilni-katastr.jpg){ width="1000" }
    <figcaption>Značkový klíč Císařských otisků stabilního katastru</figcaption>
</figure>

- Vektorizované polygony následně slučte na základě typů využití ploch (funkce *Dissolve*). Není tedy nutné vektorizovat každou parcelu zvlášť, ale postačí jako jeden polygon zvektorizovat více sousedících parcel stejného typu využití krajiny.



__c. Proveďte topologickou kontrolu vektorizovaných dat CO podle pravidel:__

- *Must Not Have Gaps (Area) *– nesmí být mezery mezi plochami.

- *Must Not Overlap With (Area-Area) *– plochy se nesmí překrývat.

- *Must Not Overlap (Area)* – jednotlivé třídy využití se nesmí překrývat.



__d. Určete rozlohu (v ha) a podíl zastoupení (v %) jednotlivých typů krajiny (viz výše) na celkové rozloze katastrálního území. Následně odpovězte na tyto otázky:__

- Který typ krajinného pokryvu na území převažuje?
- Jaký podíl území tvoří zemědělsky využívané plochy (= OP, TTP, zahrada)?
- Jaký podíl tvoří lesní a jiné přírodě blízké plochy?
- Jaký podíl území je zastavěný nebo jinak urbanizovaný?

Výsledky zpracujte do přehledné tabulky a grafu.

???+ note-grey "Výstupy Úlohy č. 4"
    - vektorová vrstva historického stavu využití krajiny,
    - přehledná tabulka a graf využití krajiny + odpovědi na otázky.

---

### __5. Charakteristiky reliéfu__

__a. Vytvořte digitální model reliéfu zadaného území a určete následující výškové charakteristiky:__

- minimální nadmořská výška,

- maximální nadmořskou výšku,

- průměrnou nadmořskou výšku,

- výškový rozdíl mezi nejnižším a nejvyšším bodem území.


__b. Z digitálního modelu terénu vytvořte rastr sklonitosti a orientace svahů. Na základě těchto rastrů určete následující charakteristiky:__

- průměrný sklon vybraných typů krajinného pokryvu (orná půda, les, TTP),

- rozlohu (v ha) a podíl zastoupení (v %) 4 základních kategorií orientace svahů na celkové rozloze zadaného území.


??? task-fg-color "Kategorie orientace svahů"
    Při analýze uvažujte tyto 4 základní kategorie orientace svahů:

    - azimut 45°–135° *(SV-V-JV)*
    - azimut 135°–225° *(JV-J-JZ)*
    - azimut 225°–315° *(JZ-Z-SZ)*
    - azimut 315°–360° a 0°–45° *(SZ-S-SV)*

???+ note-grey "Výstupy Úlohy č. 5"
    - rastry DMT, sklonitosti a orientace,
    - vybrané charakteristiky reliéfu.

---

### __6. Viditelnost__

__a. Vytvořte rastr viditelnosti z rozhledny umístěné na nejvyšším bodě zadaného území:__ 

- Jako nejvyšší bod zvolte kótovaný bod s nejvyšší nadmořskou výškou


??? task-fg-color "Parametry analýzy"
    Při analýze uvažujte následující parametry rozhledny:

    - výška stavby (35 m),
    - výška pozorovacího ochozu rozhledny (32 m),
    - průměrná výška pozorovatele (1,8 m).

__b. Určete, jaké procento všech stavebních objektů na zadaném území, je viditelné alespoň z 20 %.__

__c. Vhodným nastavením symbologie vizualizujte SO dle procenta viditelnosti.__

???+ note-grey "Výstupy Úlohy č. 6"
    - rastr viditelnosti,
    - vybraný kótovaný bod,
    - slovní odpověď,
    - vektorová vrstva SO barevně odlišených dle procenta viditelnosti.

---

### __7. tvorba mapové aplikace__

__a. Do prostředí ArcGIS Online vypublikujte následující datové vrstvy:__

- současný stav využití krajiny [*(viz Úloha č. 3)*](/semestralka/#3-soucasny-stav-vyuziti-krajiny)

- historický stav využití krajiny v pol. 19. století [*(viz Úloha č. 4)*](/semestralka/#4-historicky-stav-vyuziti-krajiny)

- rastry DMT, sklonitosti a orientace [*(viz Úloha č. 5)*](/semestralka/#5-charakteristiky-reliefu)

- rastr viditelnosti [*(viz Úloha č. 6)*](/semestralka/#6-viditelnost)

- vybraný kótovaný bod a SO rozlišené dle procenta viditelnosti [*(viz Úloha č. 6)*](/semestralka/#6-viditelnost)

__b. Vytvořte webovou mapovou aplikaci, která bude obsahovat 4 tematické části:__

- __Obecné informace o území__

- __Vývoj využití krajiny__

    - ve webové mapě 1 zobrazte historický stav využití krajiny,
    
    - ve webové mapě 2 zobrazte současný stav využití krajiny,

    - pro oba časové řezy vždy pod webovou mapou uveďte přehlednou tabulku a graf podílu zastoupení (v %) jednotlivých typů krajiny na celkové rozloze zadaného území a slovně okomentujte zadané otázky ,
    
    - ve webové mapě 3 porovnejte vývoj využití krajiny v pol. 19. století se současným stavem využití krajiny *(způsob srovnání mapových vrstev zvolte dle vlastního uvážení, např. posuvník v aplikaci, nová vrstva s vypočtenými rozdíly apod.)*,

    - uveďte graf zachycující změnu v podílu zastoupení (v %) jednotlivých typů krajiny mezi oběma časovými řezy.

- __Charakteristiky reliéfu__

    - ve webové mapě 4 zobrazte rastry DMT, sklonitosti a orientace,

    - vhodnou formou uveďte vybrané charakteristiky reliéfu (tabulky, grafy, slovní popis).

- __Analýza viditelnosti__

    - ve webové mapě 5 zobrazte rastr viditelnosti, vybraný kótovaný bod a SO rozlišené dle procenta viditelnosti,

    - uveďte, jaké procento všech stavebních objektů na zadaném území, je viditelné alespoň z 20 %.

- __Zdroje dat__


Pro všechny mapy ve webové aplikaci použijte podkladovou mapu s názvem **Základní topografické mapy ČR (S-JTSK)**, která je k dispozici na ArcGIS Online od uživatele *Zeměměřický úřad*. Nastavením podkladové mapy v systému S-JTSK se eliminuje posun některých připojených vrstev (např. Stavebních objektů). Podkladové mapě lze nastavit průhlednost pro lepší čitelnost ostatních mapových vrstev.

<figure markdown>
![AGOL_basemap](../assets/sempr/nastaveni-bm.png){ width="600" }
    <figcaption>Změna podkladové mapy v ArcGIS Online</figcaption>
</figure>

- Mapová aplikace včetně využitých vrstev musí mít nastavené sdílení v ArcGIS Online "v rámci organizace". Název mapové aplikace musí být ve formátu __PrijmeniJmeno_NazevKU_KodKU_GISZ_2026__{.outlined}

- Součástí webové aplikace musí být seznam použitých datových zdrojů.


<!--
### 11. Tvorba webové mapové aplikace

- Vytvořte webovou mapovou aplikaci a vyexportujte do ní požadované vrstvy.

- Na začátek storymapy přidejte obecné informace o obci, např. popis lokality, vývoj počtu obyvatel či zajímavost/památka.

- Pro všechny mapy ve webové aplikaci použijte podkladovou mapu s názvem **Základní topografické mapy ČR (S-JTSK)**, která je k dispozici na ArcGIS Online od uživatele *Zeměměřický úřad*. Nastavením podkladové mapy v systému S-JTSK se eliminuje posun některých připojených vrstev (např. Stavebních objektů). Podkladové mapě lze nastavit průhlednost pro lepší čitelnost ostatních mapových vrstev.

<figure markdown>
![SMO5_legenda](../assets/sempr/nastaveni-bm.png){ width="600" }
    <figcaption>Změna podkladové mapy v ArcGIS Online</figcaption>
</figure>

- Mapová aplikace včetně využitých vrstev musí mít nastavené veřejné sdílení v ArcGIS Online. Název mapové aplikace musí být ve formátu __Prijmeni_Jmeno_GIS1_2026_SP__{.outlined} (tedy například Muzik_Frantisek_GIS1_2026_SP).

- Součástí webové aplikace musí být seznam použitých datových zdrojů.

---

[Ukázková aplikace](https://arcg.is/1SenW80){ .md-button .md-button--primary }
{: .button_array} -->
