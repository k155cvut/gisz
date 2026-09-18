# Semestrální práce {: .page_title}
Semestrální práce je zaměřena aplikaci základních nástrojů vektorových a rastrových prostorových analýz v zadaném území, a je rozdělena do dvou částí:

- [**ČÁST I – ZÁKLADNÍ CHARAKTERISTIKA ÚZEMÍ**](/semestralka/#cast-i-zakladni-charakteristika-uzemi)

- [**ČÁST II – ANALÝZA ÚZEMÍ**](/semestralka/#cast-ii-analyza-uzemi)



Výsledky jednotlivých částí semestrální práce jsou odevzdány a prezentovány ve stanovených termínech (viz níže).


Dotazy či připomínky k semestrální práci směřujte sem: *petra.justova@fsv.cvut.cz*{.outlined} nebo *tomas.janata@fsv.cvut.cz*{.outlined}


<div class="grid cards" markdown>

-   :simple-maildotru: __Výběr zadání__ 
    
    ---
    1. Výběr katastrálního území dle [**této mapy**](https://arcg.is/1ePSnC)
    
    2. Zadání názvu vybraného katastrálního území do [**sdílené tabulky**](https://docs.google.com/spreadsheets/d/1g2wl-ERTO59lgwzLRXmvFsilolLZivnxeKEC8jEvaN0/) nejpozději do __XY__

-   :material-presentation-play: __Termíny odevzdání__
    
    ---
   - část I: __neděle 1. listopadu 2026, 23.59__{.outlined}
   - část II: __15.–18. prosince 2026__{.outlined}
</div>

<hr class="level-1">


## ČÁST I – ZÁKLADNÍ CHARAKTERISTIKA ÚZEMÍ

__Cíl__

- tvorba tematické geodatabáze pro zadané katastrální území,
- zjištění základních charakteristik o území,
- tvorba mapového výstupu.

__Výstupy__

- technická zpráva ve formátu PDF
- tematická geodatabáze  

Termín odevzdání: __neděle 1. listopadu 2026, 23.59__{.outlined}

Úloha je uznána, pokud výstupy obsahují __všechny požadované náležitosti__ (viz níže).

???+ note-grey "Požadované náležitosti technické zprávy :material-file:"
    - formát odevzdání __PDF__, název souboru __PrijmeniJmeno_NazevKU_KodKU.pdf__{.no-dec .outlined}, případně __PrijmeniJmeno_NazevKU_KodKU_oprava01.pdf__{.no-dec .outlined}
    - rozpiska se __jménem__, __názvem úlohy__, __individuálním číslem zadání__ a __názvem a kódem zadaného katastrálního území__
    - jsou uvedeny všechny požadované __charakteristiky__ a __odpovědi__ na otázky uvedené v zadání úlohy včetně __stručného postupu jejich řešení__ (použité nástroje apod.)
    - __tabulky, grafy a mapové vizualizace__ dle zadání
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

### __3. Struktura krajinného pokryvu__

__a. Vytvořte datovou vrstvu využití krajiny z dat RÚIAN dle následujícího postupu:__

- Zdroj dat: _:material-layers-triple: RÚIAN_{.bg}, _:material-layers: Parcela_{.bg}

- Pro urychlení výpočtu nejprve vyberte parcely na základě atributu _:material-table: Nadřazené katastrální území_{.bg}.

- Dle atributů v tabulce níže vypočítejte pro data nový sloupec _:material-table: TYP_VYUZITI_{.bg}, na základě kterého vrstvu následně vhodně vizualizujte. Číselníky pro přiřazení kódů: [Způsob využití pozemku](https://www.cuzk.cz/Katastr-nemovitosti/Poskytovani-udaju-z-KN/Ciselniky-ISKN/Ciselniky-k-nemovitosti/Zpusob-vyuziti-pozemku.aspx), [Kód druhu pozemku](https://www.cuzk.cz/Katastr-nemovitosti/Poskytovani-udaju-z-KN/Ciselniky-ISKN/Ciselniky-k-nemovitosti/Druh-pozemku.aspx).
- Závěrem proveďte *Dissolve* dle atributu _:material-table: TYP_VYUZITI_{.bg}.

!!! note "&nbsp;<span style="color:#448aff">Nápověda</span>"
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

<br>

__b. Určete rozlohu (v ha) a podíl zastoupení (v %) jednotlivých typů krajiny (viz výše) na celkové rozloze katastrálního území. Následně odpovězte na tyto otázky:__

- Který typ krajinného pokryvu na území převažuje?
- Jaký podíl území tvoří zemědělsky využívané plochy (= OP, TTP, zahrada)?
- Jaký podíl tvoří lesní a jiné přírodě blízké plochy?
- Jaký podíl území je zastavěný nebo jinak urbanizovaný?

Výsledky zpracujte do přehledné tabulky a grafu.

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

Výslednou mapovou vizualizaci exportujte ve formátu PDF, velikost A4 (orientace dle charakteru území) s rozlišením 150 dpi.

???+ note-grey "Výstupy Úlohy č. 3"
    - datové vrstvy v tematickém datasetu geodatabáze,
    - přehledná tabulka a graf využití krajiny + odpovědi na otázky,
    - mapa krajinného pokryvu (PDF, A4, 150 dpi).

<br>

<hr class="level-1">

## ČÁST II – ANALÝZA ÚZEMÍ

__Cíl__

- tvorba tematické geodatabáze pro zadané katastrální území,
- použití základních geoprocessingových nástrojů
- tvorba webové mapové aplikace.

__Výstupy__

- webová mapová aplikace
- tematická geodatabáze  

Termín odevzdání: __15.–18. prosince 2026__{.outlined}

Úloha je uznána, pokud výstupy obsahují __všechny požadované náležitosti__ (viz níže).

???+ note-grey "Požadované náležitosti webové mapové aplikace :material-file:"
    *- TBA*

???+ note-grey "Požadované náležitosti tematické geodatabáze :material-database:"
    - formát odevzdání __gdb__, název souboru __PrijmeniJmeno_NazevKU_KodKU.gdb__{.no-dec .outlined}, případně __PrijmeniJmeno_NazevKU_KodKU_oprava01.gdb__{.no-dec .outlined}
    - obsahuje dva tematické feature datasety s názvy __CharakteristikaUzemi__{.no-dec .outlined} a __AnalyzaUzemi__{.no-dec .outlined}
    - v datasetech jsou uloženy __vhodně pojmenované datové vrstvy__ dle zadání úlohy

---

### 5. Georeferencování císařských otisků

- Pro zadané katastrální území georeferencujte rastry Císařských otisků stabilního katastru (CO) z poloviny 19. století. Najdete je na sdíleném disku ```S:\K155\Public\data\GIS\SP2026_CO```. Vaše zadání si překopírujte na disk svého počítače.

- Pro georeferencování využívejte identické body (rohy budov, boží muka), polygony současných parcel či hranice katastrálních území (ta se však mohou lišit oproti stavu v 19. století). 

- Z georeferencovaných rastrů vytvořte mozaiku. Rastrovou mapu Císařských otisků stabilního katastru **neexportujte** do výsledné webové aplikace.

---

### 6. Vektorizace využití ploch CO
- Na podkladu CO vektorizujte **celé zadané katastrální území**. V případě změny v hranicích katastrálního území vektorizujte pouze prvky spadající do současného vymezení katastru dle  _:material-layers-triple: RÚIAN_{.bg}, _:material-layers: KatastralniUzemi_{.bg}. Tato data následně slučte na základě typů využití ploch (funkce *Dissolve*).  Není tedy nutné samostatně vektorizovat každou parcelu zvlášť, tudíž ideálně provádějte vektorizaci v rámci více sousedících parcel stejného využití.

- Rozlišujte následující typy využití ploch (stejně jako v bodě 5 pro data z RÚIAN): 

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

---

### 7. Kontrola topologie vektorizace
- Proveďte topologickou kontrolu vektorizovaných dat CO podle pravidel:

    - Must Not Have Gaps (Area) – nesmí být mezery mezi plochami.

    - Must Not Overlap With (Area-Area) – plochy se nesmí překrývat.

    - Must Not Overlap (Area) – jednotlivé třídy využití se nesmí překrývat.

---

### 8. Porovnání vývoje využití krajiny (19. století a současnost)

- Ve webové aplikaci porovnejte vývoj využití krajiny v polovině 19. století (vektorizace z CO) se současností (_:material-layers-triple: RÚIAN_{.bg}, _:material-layers: Parcela_{.bg}). Způsob porovnání zvolte dle vlastního uvážení (posuvník v aplikaci, nová vrstva s vypočtenými rozdíly apod.).

---

### 9. Přidání online mapové služby (WMS, WMTS, WFS)

- Přidejte jednu online mapovou službu dle vlastního výběru (např. historická mapa, ortofoto, katastrální mapa).

- Tato vrstva musí být součástí výsledné mapové aplikace.

---

### 10. Analýza nejvyššího a nejnižšího bodu obce

- Pomocí digitálního modelu reliéfu 5. generace (DMR5G) zjistěte body s nejnižší a nejvyšší nadmořskou výškou na území obce. Zjištěné hodnoty uveďte ve webové aplikaci.

---

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
{: .button_array}
