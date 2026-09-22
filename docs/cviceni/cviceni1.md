---
icon: material/numeric-1-box
title: Cvičení 1
---

# Úvod do ArcGIS Pro, prostorová data a datové zdroje

## Cíle cvičení

<div class="grid cards grid_icon_info smaller_padding" markdown>

-   :material-monitor-dashboard:{ .xl }

    __základní orientace__ v prostředí ArcGIS Pro a v projektu GIS

-   :material-vector-polyline:{ .xl }

    rozlišení __vektorových__ a __rastrových__ dat

-   :material-table:{ .xl }

    práce s __atributovou tabulkou__ a návrh atributů

-   :material-server-network:{ .xl }

    rozlišení __lokálních dat__, dat ke stažení a __webových mapových služeb__

-   :material-database-plus:{ .xl }

    práce s __Catalogem__, vytvoření geodatabáze a uspořádání vlastních dat

</div>

<hr class="level-1">

## GIS projekt: mapa, vrstvy a data

V tomto kurzu budeme pracovat především v programu **ArcGIS Pro**. GIS projekt si lze představit jako pracovní prostor, ve kterém jsou uspořádány mapy, vrstvy, tabulky, rozvržení map a odkazy na data. Projekt tedy obvykle **neobsahuje všechna data**, ale ví, kde jsou data uložena nebo odkud jsou dostupná.

V prostředí ArcGIS Pro budeme rozlišovat zejména tyto pojmy:

<div class="table_headerless table_small_padding table_centered" markdown>
| | |
| - | - |
| __Projekt__ | soubor a pracovní prostředí ArcGIS Pro; uchovává mapy, seznam vrstev, symbologii a připojení k datům |
| __Mapa__ | 2D pohled, ve kterém kombinujeme vrstvy nad společným územím |
| __Vrstva__ | způsob, jakým jsou konkrétní data zobrazena v mapě; určuje například symboliku, viditelnost a pop-up |
| __Dataset__ | organizovaná sada dat uložená v souboru, geodatabázi nebo na serveru |
| __Prvek__ | jednotlivý objekt ve vektorové vrstvě, například strom, komunikace nebo parcela |
| __Atribut__ | vlastnost prvku uložená v atributové tabulce, například název, typ, plocha nebo datum |
</div>

!!! note-grey "Důležité"

    **Uložení projektu není totéž jako uložení dat.** Uložení projektu zachová například mapu, její vrstvy a jejich vzhled. Úpravy atributů nebo geometrie je nutné ukládat zvlášť na kartě _:material-tab: Edit_ → _:material-button-cursor: Save_.

## Základní orientace v ArcGIS Pro

Uživatelské prostředí programu se skládá zejména z těchto částí:

<div class="table_headerless table_small_padding table_centered" markdown>
| | |
| - | - |
| __Ribbon__ | pás karet s nástroji; nabídka se mění podle aktuální činnosti |
| __Contents Pane__ | obsah aktivní mapy: vrstvy, jejich pořadí, viditelnost a vlastnosti |
| __Catalog Pane__ | přehled projektu a připojených složek, geodatabází, serverů a dalších zdrojů |
| __Map View__ | mapové okno pro práci s 2D mapou |
| __Pane__ | dokovatelný panel pro vlastnosti vrstev, symbologii, geoprocessing aj. |
</div>

![](../assets/cviceni1/img_02.png)
![](../assets/cviceni1/img_03.png)
{: .process_container}

<figcaption>Panely ArcGIS Pro lze libovolně přemisťovat a přichytávat k okrajům programu.</figcaption>

### Ovládání mapy

Pro základní pohyb v mapě slouží nástroj _:material-cursor-default-click: Explore_. Umožňuje posun, změnu měřítka, identifikaci prvků a otevření pop-upu po kliknutí na prvek. V panelu _Contents_ lze měnit pořadí vrstev, jejich viditelnost a průhlednost.

!!! tip "Zásada pro čitelnost mapy"

    Rastrové podklady a plochy obvykle patří níže v pořadí vrstev. Linie, body a popisky bývají nad nimi. Změna pořadí vrstev nemění data, pouze jejich vykreslení v mapě.

<hr class="level-1">

## Prostorová data

Prostorová data popisují objekty nebo jevy, které mají polohu. Poloha může být vyjádřena souřadnicemi, adresou nebo vazbou na jiný prostorový objekt. K poloze obvykle připojujeme další informace — **atributy**.

Dvě základní reprezentace prostorových dat jsou **vektor** a **rastr**.

<div class="grid cards" markdown>

-   :material-vector-polyline:{ .lg .middle } __Vektorová data__

    ---

    Reprezentují jednotlivé objekty pomocí **bodů, linií a polygonů**.

    - body: stromy, zastávky, měřicí stanice;
    - linie: komunikace, vodní toky, inženýrské sítě;
    - polygony: parcely, budovy, plochy zeleně, chráněná území.

    Vhodná jsou zejména pro diskrétní objekty, jejich evidenci, kartografii a měření délky nebo plochy.

-   :material-grid:{ .lg .middle } __Rastrová data__

    ---

    Reprezentují území pravidelnou mřížkou buněk — **pixelů**. Každá buňka nese jednu nebo více hodnot.

    - ortofoto a satelitní snímky;
    - digitální model reliéfu;
    - teplota, srážky nebo znečištění ovzduší;
    - klasifikace pokryvu krajiny.

    Klíčovým parametrem je **prostorové rozlišení**, tedy velikost jedné buňky v terénu.

</div>

<figure markdown>
![Rozdíl v grafické reprezentaci vektorových a rastrových dat](../assets/cviceni1/VectorVsRaster.png "Rozdíl v grafické reprezentaci vektorových a rastrových dat"){ width=450px }
<figcaption>Vektor reprezentuje objekty geometrií, rastr pravidelnou mřížkou hodnot.</figcaption>
</figure>

!!! note-grey "Souřadnicové systémy"

    Aby bylo možné kombinovat data z více zdrojů, musí GIS znát jejich polohu a souřadnicový systém. Souřadnicovým systémům, transformacím a jejich praktickému využití se bude věnovat následující cvičení.

## Atributová tabulka

Atributová tabulka propojuje geometrii prvku s jeho popisem. Ve vektorové vrstvě zpravidla odpovídá jeden **řádek** tabulky jednomu prvku v mapě. **Sloupce** tabulky jsou atributová pole.

![](../assets/cviceni1/img_37.png)
{: .process_container}

<figcaption>Atributová tabulka v ArcGIS Pro.</figcaption>

Atributovou tabulku otevřete v panelu _Contents_ kliknutím pravým tlačítkem na vrstvu → _:material-form-dropdown: Attribute Table_. Výběr prvku v mapě se okamžitě projeví i v tabulce a naopak.

### Datové typy atributů

Datový typ určuje, jaké hodnoty lze do pole ukládat. Typ pole je vhodné zvolit před zahájením editace; změna datového typu již existujícího pole nebývá možná přímo.

<div class="table_headerless table_small_padding table_centered" markdown>
| Datový typ | Použití | Příklad |
| - | - | - |
| __Short__ | menší celé číslo | počet podlaží, kód kategorie |
| __Long__ | celé číslo ve větším rozsahu | počet obyvatel, identifikátor |
| __Float__ | desetinné číslo s běžnou přesností | orientační sklon, index |
| __Double__ | desetinné číslo s vyšší přesností | výměra, výška, souřadnicová hodnota |
| __Text__ | textový řetězec | název, adresa, poznámka |
| __Date__ | datum a případně čas | datum měření, datum aktualizace |
</div>

Pro hodnotu typu **ano / ne** se často používá pole typu _Short_ s hodnotami `0` a `1`, případně doména povolených hodnot. Podrobnější nastavení datové integrity, domén a subtypů budeme řešit později.

!!! note-grey "Systémová pole"

    Pole jako `OBJECTID`, `Shape` nebo `Shape_Length` mají zvláštní význam pro databázi a program je spravuje automaticky. Běžně je nelze odstranit ani ručně upravovat.

### Pop-up: rychlé čtení atributů v mapě

Kliknutím na prvek nástrojem _:material-cursor-default-click: Explore_ se otevře **pop-up**. Ve výchozím nastavení nabízí přehled atributů vybraného prvku. Pop-up je vhodný pro rychlou orientaci; atributová tabulka pak pro systematickou práci s více záznamy.

<hr class="level-1">

## Kde jsou data uložena a jak je získat

Data v GIS nemusí být vždy souborem uloženým na počítači. Stejnou vrstvu lze přidat z lokálního disku, síťového úložiště, otevřeného datového portálu nebo přímo z webové služby.

<div class="table_headerless table_small_padding table_centered" markdown>
| Způsob přístupu | Co připojujeme | Příklady | Kdy je vhodný |
| - | - | - | - |
| __Lokální data__ | cestu k souboru nebo geodatabázi | GeoPackage, Shapefile, file geodatabase, GeoTIFF | vlastní editace, analýza, archivace |
| __Data ke stažení__ | nejprve soubor stáhneme, pak s ním pracujeme lokálně | otevřená data obce, AOPK, ČSÚ | práce s konkrétní verzí dat, offline práce |
| __Webová služba__ | URL služby; data zůstávají na serveru poskytovatele | ArcGIS REST, WMS, WFS | aktuální referenční vrstvy, sdílení, rychlé přidání dat |
</div>

### Lokální data a běžné formáty

- **Souborová geodatabáze (`.gdb`)** — doporučený pracovní formát ArcGIS Pro. Do jedné geodatabáze lze ukládat více vrstev, tabulek a dalších datasetů.
- **Shapefile** — starší vektorový formát tvořený několika soubory. Při kopírování nebo přesouvání je nutné zachovat všechny soubory se stejným názvem.
- **GeoPackage (`.gpkg`)** — otevřený databázový formát, který může obsahovat vektorová i rastrová data v jednom souboru.
- **GeoJSON / KML / GML** — běžné výměnné formáty pro vektorová data.
- **GeoTIFF** — častý formát rastrových dat, například ortofota či digitálního modelu reliéfu.
- **CSV / XLSX** — tabulkové soubory. Mohou obsahovat souřadnice nebo adresy, ze kterých lze později vytvořit prostorové prvky.

!!! warning "Pozor při kopírování dat"

    Nezaměňujte soubor s jeho zobrazením v mapě. Vrstva v projektu může odkazovat na data na disku, na fakultním síťovém úložišti nebo na serveru. Před přesunem či odevzdáním projektu vždy ověřte, zda budou zdrojová data na cílovém místě dostupná.

### Webové mapové služby

Webová mapová služba zpřístupňuje data ze serveru prostřednictvím internetu. ArcGIS Pro je v tomto vztahu **klient**: odešle požadavek na URL služby a přijme data nebo mapový obraz pro zobrazení.

```text
poskytovatel dat → server → mapová služba (URL) → ArcGIS Pro → vrstva v mapě
```

V prostředí Esri se často setkáte se službami publikovanými přes **ArcGIS Server** nebo ArcGIS Online. V praxi je užitečné rozlišovat zejména:

- **Feature service** — poskytuje vektorové prvky a jejich atributy; podle oprávnění je lze prohlížet, dotazovat nebo editovat.
- **Map image service** — poskytuje serverem vykreslený mapový obraz; hodí se pro rychlé prohlížení kartograficky připravených map.
- **Image service** — zpřístupňuje rastrová data, například snímky nebo model reliéfu.
- **WMS** — otevřený standard pro poskytování mapového obrazu.
- **WFS** — otevřený standard pro poskytování vektorových prvků a atributů.

!!! note-grey "Služba není zdroj dat"

    ArcGIS Online nebo ArcGIS Pro jsou aplikace, ve kterých data vyhledáváme a zobrazujeme. Při práci s daty vždy zjišťujeme jejich **poskytovatele, název vrstvy, datum aktualizace, licenci a metadata**. Tyto informace jsou důležité pro posouzení použitelnosti dat i pro uvedení zdroje ve výstupech projektu.

### Kde hledat data

- [Geoportál ČÚZK](https://geoportal.cuzk.cz/){: target="_blank"}
- [Národní geoportál INSPIRE](https://geoportal.gov.cz/web/guest/home/){: target="_blank"}
- [Otevřená data AOPK ČR](https://gis-aopkcr.opendata.arcgis.com/){: target="_blank"}
- [Geoportál ČSÚ](https://geodata.statistika.cz/){: target="_blank"}
- [Geoportál Praha](https://geoportalpraha.cz/){: target="_blank"}
- [Otevřená data města Brna](https://data.brno.cz/){: target="_blank"} 

<hr class="level-1">

## Catalog: uspořádání a příprava vlastních dat

Panel _Catalog_ slouží k procházení a správě zdrojů, se kterými projekt pracuje. Najdeme zde mimo jiné připojené složky, geodatabáze, nástroje a připojení k serverům.

### Připojení složky

Adresář s daty je vhodné k projektu připojit. V _Catalog Pane_ klikněte pravým tlačítkem na _Folders_ → _:material-form-dropdown: Add Folder Connection_ a vyberte složku s daty. Připojení usnadní opakované přidávání dat do mapy.

![](../assets/cviceni1/img_05.png)
![](../assets/cviceni1/arrow.svg){: .off-glb .process_icon}
![](../assets/cviceni1/img_04.png)
{: .process_container}

### Vytvoření souborové geodatabáze

1. V _Catalog Pane_ otevřete _Databases_.
2. Klikněte pravým tlačítkem → _:material-database-plus: New File Geodatabase_.
3. Geodatabázi pojmenujte stručně a bez mezer či diakritiky, například `projekt_prijmeni.gdb`.
4. Geodatabázi připojte k projektu a používejte ji jako hlavní pracovní úložiště vlastních dat.

### Feature dataset

**Feature dataset** je kontejner uvnitř geodatabáze pro související vektorové vrstvy. Vrstvy v jednom feature datasetu musí používat stejný souřadnicový systém. Tato vlastnost je důvodem, proč se k jeho založení vrátíme i v následujícím cvičení.

Pro vytvoření feature datasetu klikněte pravým tlačítkem na geodatabázi → _:material-folder-plus: New_ → _:material-folder: Feature Dataset_. Do dialogu zadejte název a převezměte nebo zvolte souřadnicový systém referenčních dat použitých ve cvičení.

!!! tip "Doporučená struktura"

    ```text
    projekt_prijmeni.gdb
    └── zakladni_data
        ├── zajmove_uzemi
        ├── komunikace
        └── body_zajmu
    ```

### Export dat do geodatabáze

Data z externího souboru nebo služby lze uložit do vlastní geodatabáze. V _Contents Pane_ klikněte pravým tlačítkem na vrstvu → _:material-export: Data_ → _:material-export: Export Features_. Jako výstupní umístění vyberte vytvořenou geodatabázi, případně konkrétní feature dataset.

Před exportem ověřte:

- zda exportujete správný rozsah prvků;
- zda vrstva obsahuje očekávané atributy;
- zda je vhodné zachovat všechny atributy;
- kam budou data uložena a jak se bude výstupní vrstva jmenovat;
- zda je u dat dovoleno vytvářet lokální kopii podle jejich licence.

<hr class="level-1">

## Shrnutí

Po tomto cvičení byste měli umět:

- rozlišit projekt, mapu, vrstvu, dataset, prvek a atribut;
- orientovat se v základních částech ArcGIS Pro;
- určit, zda jsou data vektorová nebo rastrová;
- otevřít atributovou tabulku, číst ji a zvolit vhodný základní datový typ;
- vysvětlit rozdíl mezi lokálně uloženým souborem a webovou mapovou službou;
- připojit složku v Catalogu, vytvořit file geodatabase a exportovat do ní vrstvu;
- dohledat poskytovatele a metadata použité datové vrstvy.

---

__Doplňkové zdroje:__
{: align=center }

[<span>pro.arcgis.com</span><br>Introduction to ArcGIS Pro](https://pro.arcgis.com/en/pro-app/latest/get-started/get-started.htm){ .md-button .md-button--primary .server_name .external_link_icon_small target="_blank"}
[<span>pro.arcgis.com</span><br>ArcGIS field data types](https://pro.arcgis.com/en/pro-app/latest/help/data/geodatabases/overview/arcgis-field-data-types.htm){ .md-button .md-button--primary .server_name .external_link_icon_small target="_blank"}
[<span>pro.arcgis.com</span><br>Connect to a folder](https://pro.arcgis.com/en/pro-app/latest/help/projects/connect-to-a-folder.htm){ .md-button .md-button--primary .server_name .external_link_icon_small target="_blank"}
[<span>pro.arcgis.com</span><br>What is a feature dataset?](https://pro.arcgis.com/en/pro-app/latest/help/data/geodatabases/overview/feature-dataset-basics.htm){ .md-button .md-button--primary .server_name .external_link_icon_small target="_blank"}
{: .button_array}
