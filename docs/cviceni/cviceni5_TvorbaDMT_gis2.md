---
icon: material/numeric-5-box
title: Cvičení 5
---

# Tvorba digitálního modelu terénu

Ve cvičení se naučíte
{: align=center style="font-size: 1.25rem; font-weight: bold; margin-bottom: 10px;"}

<style>
    .smaller_padding li {padding:.4rem .8rem !important;}
    .primary_color {color:var(--md-primary-fg-color);}
</style>

<div class="grid cards smaller_padding" markdown>

-   :material-terrain:{ .xxxl .middle }
    {.middle style="display:table-cell;min-width:40px;padding-right:.8rem;"}

    vytvořit __digitální model terénu__ v GIS včetně úpravy __symbologie__
    {.middle style="display:table-cell;line-height:normal;"}

-   :material-elevation-rise:{ .xxxl .middle }
    {.middle style="display:table-cell;min-width:40px;padding-right:.8rem;"}
    
    zpracovat __LiDARová data__{: .primary_colorx} a následně je vizualizovat nebo použít v analýzách
    {.middle style="display:table-cell;line-height:normal;"}
</div>

<hr class="level-1">

## Základní pojmy
- **digitální model terénu (DMT)** – digitální reprezentace prostorových objektů (obecný pojem obsahující různé způsoby vyjádření terénního reiéfu nebo povrchu)
- **digitální model reliéfu (DMR)** – digitální reprezentace zemského povrchu (NEbsahuje vegetaci a lidské stavby)
- **digitální model povrchu (DMP)** – digitální reprezentace zemského povrchu (obsahuje vegetaci a lidské stavby, které jsou pevně spojené s reliéfem)
- [**TIN**](https://pro.arcgis.com/en/pro-app/3.1/help/data/tin/tin-in-arcgis-pro.htm) – trojúhelníková nepravidelná síť, která nejlépe reprezentuje povrch jako celek

???+ note "&nbsp;<span style="color:#448aff">Digitální modely terénu České republiky</span>"
     - **DMP 1G** – Digitální model povrchu České republiky 1. generace (DMP 1G) představuje zobrazení území včetně staveb a rostlinného pokryvu ve formě nepravidelné sítě výškových bodů (TIN) s úplnou střední chybou výšky **0,4 m** pro přesně vymezené objekty (budovy) a **0,7 m** pro objekty přesně neohraničené (lesy a další prvky rostlinného pokryvu). Model vznikl z dat pořízených metodou leteckého laserového skenování výškopisu území České republiky v letech 2009 až 2013. 
     - **DMR 4G** – Digitální model reliéfu České republiky 4. generace (DMR 4G) představuje zobrazení přirozeného nebo lidskou činností upraveného zemského povrchu v digitálním tvaru ve formě výšek diskrétních bodů v pravidelné síti (5 x 5 m) bodů o souřadnicích X,Y,H, kde H reprezentuje nadmořskou výšku ve výškovém referenčním systému Balt po vyrovnání (Bpv) s úplnou střední chybou výšky **0,3 m** v odkrytém terénu a **1 m** v zalesněném terénu. Model vznikl z dat pořízených metodou leteckého laserového skenování výškopisu území České republiky v letech 2009 až 2013.
     - **DMR 5G** – Digitální model reliéfu České republiky 5. generace (DMR 5G) představuje zobrazení přirozeného nebo lidskou činností upraveného zemského povrchu v digitálním tvaru ve formě výšek diskrétních bodů v nepravidelné trojúhelníkové síti (TIN) bodů o souřadnicích X,Y,H, kde H reprezentuje nadmořskou výšku ve výškovém referenčním systému Balt po vyrovnání (Bpv) s úplnou střední chybou výšky **0,18 m** v odkrytém terénu a **0,3 m** v zalesněném terénu. Model vznikl z dat pořízených metodou leteckého laserového skenování výškopisu území České republiky v letech 2009 až 2013. Dokončen byl k 30. 6. 2016 na celém území ČR. (Zdroj: ČÚZK)

## Aplikace Analýzy výškopisu 
Pro analýzu výškopisu ve webovém prostředí slouží mapová aplikace Analýzy výškopisu od Českého úřadu zeměměřického a katastrálního. Aplikace umožňuje provádějí základních výškových analýz nad daty DMP 1G, DMR 4G a DMR 5G. Pro každou datovou sadu nabízí několik rastrových funkcí (Stínovaný reliéf, Z-faktor apod.). Do rozhraní je možné přidat i vlastní data, a tedy zefektivnit používání aplikace v reálné praxi.

[<span></span>https://ags.cuzk.cz/av/<br>Analýzy výškopisu ČÚZK](https://ags.cuzk.cz/av/){ .md-button .md-button--primary .button_larger .external_link_icon target="_blank"}
{: .button_array}

<figure markdown>
  ![Analýzy výškopisu](../assets/cviceni2/av_cuzk.png){ width="900"}
  <figcaption>Analýza pole viditelnosti ze zadaného bodu vypočteného nad DMR 5G</figcaption>
</figure>

## Vybrané zdroje výškopisných dat
- [ČÚZK Geoprohlížeč](https://ags.cuzk.cz/geoprohlizec/)
    * ZABAGED – [vrstevnice](https://ags.cuzk.cz/arcgis/rest/services/ZABAGED_VRSTEVNICE/MapServer), [DMP 1G](https://ags.cuzk.cz/arcgis2/rest/services/dmp1g/ImageServer), [DMR 4G](https://ags.cuzk.cz/arcgis2/rest/services/dmr4g/ImageServer),  [DMR 5G](https://ags.cuzk.cz/arcgis2/rest/services/dmr5g/ImageServer)
    * INSPIRE – [nadmořská výška (grid)](https://ags.cuzk.cz/arcgis2/rest/services/INSPIRE_Nadmorska_vyska/ImageServer), [nadmořská výška (TIN)](https://ags.cuzk.cz/arcgis2/rest/services/INSPIRE_Nadmorska_vyska_TIN/MapServer)
    * Geoportál Praha – [vrstevnice](https://geoportalpraha.cz/vyhledavani?topic=data&type=[opendata])

## Použité datové podklady
- Vrstevnice zdůrazněná, Vodní toky, Vodní plochy ([ZABAGED](../../data/#zabaged))
- Okres ([RÚIAN](../../data/#ruian))

## Náplň cvičení
Úkolem bude vytvořit TIN z vrstevnic a hydrologicky exaktní model terénu.

???+ note "&nbsp;<span style="color:#448aff">Druhy reprezentace digitálního modelu terénu v GIS</span>"
     - **vektor**
        * možnost pokročilejšího modelování vstupních dat
        * dobře vystihují tvar terénu, ale nereprezentují povrch jako celek
        * vhodné pro využití v kartografii

     - **TIN**
        * nejlépe reprezentuje povrch jako celek
        * složitý výpočet

     - **rastr**
        * poskytuje vlivem vzorkování horší celkovou reprezentaci povrchu
        * pro analýzy lze využít jednoduché algoritmy

## Postup

### Tvorba TIN
???+ note "&nbsp;<span style="color:#448aff">Pozn.</span>"
     TIN vzniká na základě Delaunayho triangulace. Ta rozdělí vstupní body do tzv. Thiessenových polygonů (také Voroniovy diagramy), pro které platí, že z každého místa polygonu je vzdálenost k danému bodu uvnitř polygonu menší než k jakémukoliv jinému bodu ze zadané množiny. Další krok spočívá v propojení bodů v sousedících polygonech.

<figure markdown>
  ![Tvorba triangulace](../assets/cviceni2/triang.png){ width="900"}
  <figcaption>Postup tvorby Delaunayho triangulace (vpravo) na základě Thiessenových polygonů (vlevo)</figcaption>
</figure>

**1.** Nejprve vybereme vhodný zdroj výškopisných dat, která pro výpočet použijeme. V tomto případě se bude jednat o vrstevnice ze ZABAGED, konkrétně využijeme vrstvu *Vrstevnice zdůrazněná*.

**2.** Většinou není potřeba vytvářet DMT pro celou republiku, což je výpočetně a časově náročné. Pro začátek je tedy vhodné vrstvu vrstevnic oříznout vybraným polygonem pomocí funkce [*Clip*](https://pro.arcgis.com/en/pro-app/latest/tool-reference/analysis/clip.htm).

**3.** Dále je nutné vytvořit TIN pomocí funkce [*Create TIN*](https://pro.arcgis.com/en/pro-app/latest/tool-reference/3d-analyst/create-tin.htm). Ve funkci určíme zázev a místo uložení výsledného TINu včetně jeho součadnicového systému (dle mapy). Následně vyplníme zdrojovou vrstvu výškových dat *Input Features*, tedy vrstevnice oříznuté dle určeného polygonu (v tomto případě zvýrazněné vrstevnice v Klatovském okresu). 

**4.** Podle zvolených dat je potřeba nastavit další parametry funkce. Atribut výšky *Height Field* se nastaví automaticky, je potřeba jej ale zkontrolovat. *Type* určuje typ vstupní vrstvy. Jestliže jsou vstupní vrstvou výškové kóty, zvolíme *Mass_Points*. V případě vrstevnic se vybere buď *Hard_Line* či *Soft_Line*.

???+ note "&nbsp;<span style="color:#448aff">Pozn.</span>"
     Při vytváření TIN lze kombinovat několik vrstev, tudíž je možné na příklad použít vrstevnice, které budou zpřesněny bodovou vrstvnou výškových kót.

<figure markdown>
  ![Tvorba TIN](../assets/cviceni2/create_tin.png)
  <figcaption>Tvorba TIN z vrstevnic</figcaption>
</figure>

**5.** Podle rozsahu a detailu vstupních dat může výpočet trvat i několik minut. Výsledkem je terén ve formě TINu a případně vrstva vstupních vrstevnic, kterou lze skrýt.

<figure markdown>
  ![TIN KT okres](../assets/cviceni2/tin_kt.png){width="400"}
  <figcaption>Vypočtený TIN pro Klatovský okres</figcaption>
</figure>

**6.** Pokud je potřeba, můžeme TIN následně upravovat/zpřesňovat dalšími výpočty ve funkci [*Edit TIN*](https://pro.arcgis.com/en/pro-app/latest/tool-reference/3d-analyst/edit-tin.htm).

### Převod TIN to Raster
**1.** Jestliže máme vytvořený TIN, můžeme pokračovat jeho převedením na rastr pomocí funkce [*TIN to Raster*](https://pro.arcgis.com/en/pro-app/latest/tool-reference/3d-analyst/tin-to-raster.htm) (lze převést také rastr do TINu inverzní funkcí).

**2.** Ve funkci je potřeba opět určit parametry výpočtu. *Output Data Type* určuje datový typ rastru, tedy zda mohou mít jeho pixely hodnoty desetinných čísel *Floating Point* nebo se hodnoty zaokrouhlí na celá čísla *Integer*. Dále je potřeba určit metodu interpolace dat *Linear* nebo *Natural Neighbors*. Poslední parametr definuje velikost pixelu výstupního rastru.

<figure markdown>
  ![TIN to Raster](../assets/cviceni2/tin_tor.png)
  <figcaption>Hodnoty funkce TIN to Raster</figcaption>
</figure>

**3.** Parametr *Cell size* definující velikost pixelu rastru, je potřeba navolit na základě přesnosti vstupních dat a požadované přesnosti právě výstupního rastru. Vyšší přesnost bude znamenat větší velikost rastru na disku.

**4.** Takto vypočtený TIN a rastr obsahují také hodnoty mimo zájmové území (ořezový polygon). Tyto hodnoty byly dopočteny na základě triangulace a v ideálním případě je vhodné je smazat. To se provede funkcí [*Extract by Mask*](https://pro.arcgis.com/en/pro-app/latest/tool-reference/spatial-analyst/extract-by-mask.htm). Jako ořezovou masku nastavíme v tomto případě opět vrstvu Klatovského okresu. 

???+ note "&nbsp;<span style="color:#448aff">Pozn.</span>"
     Ořez je možné provést již pro TIN použitím funkce *Edit TIN*.

<figure markdown>
  ![DMT KT](../assets/cviceni2/dmt_kt.png){width="400"}
  <figcaption>Výsledný digitální model terénu Klatovského okresu s velikostí pixelu 100 m</figcaption>
</figure>

### Tvorba hydrologicky korektního rastrového modelu terénu
???+ note "&nbsp;<span style="color:#448aff">Pozn.</span>"
     Pro některé úlohy potřebujeme hydrologicky korektní model terénu, ve kterém budou respektovány spádnice a voda tedy teoreticky "nepoteče do kopce". Pro takové analýzy není vhodný klasický DMT, protože kvůli výpočetnímu procesu nesplňuje podmínky hydrologické korektnosti.

     Téma využití GIS pro hydrologické analýzy je jednou z náplní volitelného předmětu [GIS v krajinném inženýrství](https://storm.fsv.cvut.cz/pro-studenty/predmety/magisterske-studijni-programy/geodezie-a-kartografie-mgr/gis-v-krajinnem-inzenyrstvi/?lang=cz).

**1.** Hydrologicky korektní model se vypočte funkcí [*Topo To Raster*](https://pro.arcgis.com/en/pro-app/latest/tool-reference/3d-analyst/topo-to-raster.htm), kterou najdeme v rozšíření *3D Analyst*.

**2.** Do této funkce je možné přidat více vstupních dat než v případě *Create TIN*. Veškerá vstupní data je potřeba oříznout dle okresu, jinak by byla počítána nadbytečná data, což by mohlo výrazně zvýšit čas výpočtu. Základní vrstvou bude opět *Vrstevnice zdůrazněná* s typem *Contour*. 

**3.** Dále přidáme tři pomocné vrstvy (ty nemusejí být nutnou součástí funkce, slouží ke zpřesnění výsledku). První z nich budou tvořit vodní toky ze ZABAGED. Pro výpočet je zásadní, aby byla vrstva vodních toků správně orientovaná, tedy po proudu. Vizuální kontrolu lze provést změnou symbologie vrstvy, přičemž nahradíme obyčejnou linii za linii se šipkou na konci. Důležité je pro výpočet vyfiltrovat pouze nadzemní toky. Nastavíme typ *Stream*.

<figure markdown>
  ![Vodni toky](../assets/cviceni2/vt.png){width="900"}
  <figcaption>Ukázka správného směru vodních toků</figcaption>
</figure>

**4.** Druhou pomocnou vrstvu budou tvořit vodní plochy opět ze ZABAGED. Té přiřadíme typ *Lake*. Jako třetí přidáme polygon okresu, čímž docílíme oříznutí výstupního rastru. Pro okres nastavíme typ *Boundary*.

**5.** Opět je potřeba nastavit velikost buňky, tedy *Output cell size*, která se zvolí obdobně jako v předchozích případech.

**6.** Další parametry funkce ponecháme ve výchozím nastavení. Jedná se o pokročilé parametry, jejichž úprava souvisí s následným dalším využitím rastru. Pokud bychom je v budoucnu potřebovali, získáme více informací v dokumentaci.

<figure markdown>
  ![Topo To Raster](../assets/cviceni2/topotor.png)
  <figcaption>Hodnoty funkce Topo To Raster</figcaption>
</figure>

???+ note "&nbsp;<span style="color:#448aff">Úprava symbologie rastru</span>"
     Po vybrání rastrové vrstvy můžeme v horní liště *Raster Layer* měnit její symbologii, viditelnost či způsob převzorkování (*Resampling Type*). Díky úpravě těchto parametrů lze z rastrových digitálních modelů terénu vyčíst informace, které nejsou na první pohled zřejmé. Například změna *Resapling Type* z *Nearest Neighbor* na *Bilinear* naprosto vizuálně odstraní pixelování rastru. 

     V horní liště *Data* je možné pro některé rastry vybrat předpřipravené *Processing Templates*, díky čemuž lze změnit hodnoty rastru. Ku příkladu při importu služby DMR 5G ze ZABAGED se zobrazují hodnoty rastru od 0 do 255. Pro zjištění přesných výšek je potřeba nastavit *Processing Template* na *None*.

     Díky těmto úpravám můžeme DMT používat jako podkladovou vrstvu pro řadu vizualizací.

<figure markdown>
  ![DMT symbologie](../assets/cviceni2/dmt_sym.png)
  <figcaption>Ukázky různých možností symbologie totožného rastru</figcaption>
</figure>


## Zpracování LAS


## Základní pojmy
- **[LiDAR](https://www.geosken.cz/co-je-lidar-a-jak-funguje/)** – metoda dálkového měření vzdálenosti na základě výpočtu doby šíření pulsu laserového paprsku odraženého od snímaného objektu

- **[LAS](https://pro.arcgis.com/en/pro-app/3.1/help/data/las-dataset/las-dataset-in-arcgis-pro.htm)** – datový formát mračna bodů (point cloud) získaných laserovým skenováním

## Použité datové podklady
- [DMR 5G](../../data/#dmr-5g)

- [ortofoto ČÚZK](https://ags.cuzk.cz/arcgis1/rest/services/ORTOFOTO/MapServer)


### Stažení dat z ČÚZK
Z [Geoprohlížeče ČÚZK](https://ags.cuzk.cz/geoprohlizec/) lze stáhnout data laserového skenování (mračno bodů) pro Česko. Získání dat DMR 5G, DMR 4G či DMP 1G lze provést přes výběr daného podkladu v záložce *Produkty*. Dále po rozkliknutí ikony tří teček příslušné vrstvy v záložce *Seznam vrstev* je možné vybrat buď možnost   *Exportovat data* nebo *Stáhnout data (předpřipravené jednotky)*.

???+ note "&nbsp;<span style="color:#448aff">Možnosti stažení laserových dat z ČÚZK</span>"
     - **Exportovat data** – Touto možností lze data zaslat přímo na email. Zároveň je takto možné stáhnout více kladů dat najednou vlastním výběrem (nakreslením polygonu či nahráním vlastní vrstvy k výběru). Stažená data jsou ve formátu *LAS*.

     - **Stáhnout data (předpřipravené jednotky)** – Takto lze data stáhnout postupně dle předpřipravených kladů. Stažená data jsou ve formátu *LAZ*.

### Převod LAZ do LAS
**1.** Jestliže získáme data ve formátu *ZLAS* nebo *LAZ*, je nutné mračno bodů v ArcGIS Pro konvertovat do formátu *LAS* pomocí funkce [*Convert LAS*](https://pro.arcgis.com/en/pro-app/latest/tool-reference/conversion/convert-las.htm). Takto převedná data již dokáže ArcGIS načíst.

**2.** Do parametru *Input LAS* vložíme z disku vstupní soubor, který chceme převést. Zvolíme adresář výstupních dat *Target Folder* a případně nastavíme parametry převodu.

**3.** Ve druhé části funkce určíme souřadnicový systém mračna bodů. 

<figure markdown>
  ![Convert LAS](../assets/cviceni2/convert_las.png)
  <figcaption>Hodnoty funkce Convert LAS</figcaption>
</figure>

### Vizualizace LAS
**1.** LAS data je možné zobrazit 2D v mapě nebo 3D ve scéně (ideálně v lokální scéně). Novou scénu vytvoříme v záložce *Insert* – *New Map* – *New Local Scene*.

<figure markdown>
  ![Porovnání mapy a scény](../assets/cviceni2/map_sc.png){ width="900"}
  <figcaption>Porovnání zobrazení LAS dat ve 2D mapě (vlevo) a ve 3D scéně (vpravo)</figcaption>
</figure>

**2.** Různé možnosti vizualizace LAS jsou dostupné po vybrání vrstvy mračna bodů v záložce *LAS Dataset Layer*. Pod ikonou *Symbology* 

<figure markdown>
  ![Symbologie LAS](../assets/cviceni2/las_s.png){ width="900"}
  <figcaption>Symbologie LAS</figcaption>
</figure>

**3.** Výše zmíněné možnosti symbologie se dělí na tři typy: Vizualizace dle bodů, terénem či liniově. Bodové vizualizace nabízejí zobrazení barvy mračna bodů na základě jeho nadmořské výšky (*Elevation*) nebo klasifikace dat (*Class*). Mračno bodů je dále možné symbolizovat jako terén, přičemž barva může být určená nadmořskou výškou (*Elevation*), sklonem terénu (*Slope*) nebo sklonem ke světové straně (*Aspect*). Třetí možnost, vizualizace vrstvy pomocí linií, nabízí zobrazení vrstevnic (*Contour*) a hran (*Edges*).

???+ note "&nbsp;<span style="color:#448aff">Zobrazení LAS Dataset Layer</span>"
     V záložce *LAS Dataset Layer* (po vybrání příslušného mračna bodů v *Contents*) lze nejen nastavovat možnosti symbologie, ale také je možné určit hustotu zobrazovaných bodů (sekce *Point Thinning*) nebo filtrovat body (sekce *Filters*).

### Texturovaný LAS
**1.** V některých případech je výhodné mračno bodů obarvit (pokud již texturu neobsahuje v základním nastavení). Stažený LAS z ČÚZK lze otexturovat pomocí ortofota, které se stáhne podobně jako laserová data z [Geoprohlížeče ČÚZK](https://ags.cuzk.cz/geoprohlizec/). Důležité je stáhnout data se stejným kladem, což pro zmíněná data platí.

**2.** Po stažení ortofota vyhledáme v *Geoprocessingu* funkci [*Colorize LAS*](https://pro.arcgis.com/en/pro-app/latest/tool-reference/3d-analyst/colorize-las.htm). Jako *Input Dataset* určímě mračno bodů. Do parametru *Input Image* vložíme vybrané ortofoto a zkontrolujeme přiřazení pásem snímku.

**3.** Dále zvolíme výstupní adresář *Target Folder* a případně specifikujeme název výsledného mračna bodů či jeho kompresi.

<figure markdown>
  ![Colorize LAS](../assets/cviceni2/col_las.png)
  <figcaption>Hodnoty funkce Colorize LAS</figcaption>
</figure>

**4.** Po provedení tohoto výpočtu se v nabídce *Symbology*, kterou jsme využívali při vizualizaci, zobrazí další možnost vizualizace mračna bodů – *RGB*. Po jejím zvolení se body obarví dle vstupního ortofota.

<figure markdown>
  ![Texturovaný LAS](../assets/cviceni2/text_las.png){ width="900"}
  <figcaption>Texturovaný LAS</figcaption>
</figure>

### Vytvoření digitálního modelu terénu
**1.** Data LiDARového skenování slouží jako podklad pro vytvoření digitálního modelu terénu. V ArcGISu Pro je možné převést LAS do rastru pomocí funkce [*LAS Dataset To Raster*](https://pro.arcgis.com/en/pro-app/latest/tool-reference/conversion/las-dataset-to-raster.htm).

**2.** Vstupními daty *Input LAS Dataset* jsou lasetová data ve formátu LAS. *Value Field* určuje hodnotu, na základě které se vypočte výstupní rastr. Jeho umístění určímě v parametru *Output Raster*. 

**3.** Následně je nutné určit způsob interpolace (viz [cvičení 5](https://k155cvut.github.io/gis-2/cviceni/cviceni5/)). Důležitým parametrem je *Cell Size*, která určuje velikost pixelu (buňky) výstupního rastru. *Z factor* určuje hodnotu zploštění/zvýšení hodnot rastru. V základním nastavení jej ponecháme rovný 1.

<figure markdown>
  ![LAS Dataset To Raster](../assets/cviceni2/las_tr.png)
  <figcaption>Hodnoty funkce LAS Dataset To Raster</figcaption>
</figure>

<figure markdown>
  ![DMT z LAS](../assets/cviceni2/las_r.png){ width="900"}
  <figcaption>Digitální model terénu vypočtený na základě laserových dat</figcaption>
</figure>


## Úlohy k procvičení

!!! task-fg-color "Úlohy"

    K řešení následujích úloh použijte datovou sadu [ArcČR
    500](../../data/#arccr-500) verzi 3.3 dostupnou na disku *S* ve složče
    ``K155\Public\data\GIS\ArcCR500 3.3``. Zde také najdete souboru s
    popisem dat ve formátu PDF.

    1. Vytvořte digitální model reliéfu/povrchu z bodových Lidarových dat.

    2. Vytvořte digitální model terénu ve vektorové (TIN) a rastrové
       (GRID, prostorové rozlišení 90m) reprezentaci na základě vrstevnic
       pro okres Litoměřice. Jaká je průměrná nadmořská výška takto
       vytvořeného DMT?

    3. Vypočítejte DMT s využitím výškových kót, vrstevnic, vodních toků,
       vodních ploch a státní hranice ČR. Dále vypočítejte DMT pouze s
       využitím výškových kót, vrstevnic a státní hranice ČR. Oba rastry
       vytvořte s prostorovým rozlišením 1km. Minimální Z hodnotu nastavte
       na 0. Jaké jsou průměrné nadmořské výšky takto vytvořených DMT?

    4. Pro území Ústeckého kraje vytvořte rastr s prostorovým rozlišením
       100m, jehož buňky mají hodnoty s normálním rozdělením.
