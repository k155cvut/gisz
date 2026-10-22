---
icon: material/numeric-4-box
title: Cvičení 4
---

```markdown
# Práce s vektorovými daty: dotazy, joiny a prostorové vztahy

Prostorová data jsou jakákoli data, která přímo nebo nepřímo odkazují na konkrétní geografické území nebo polohu. Poloha může být reprezentována nejen kombinací souřadnic (X + Y, zeměpisná šířka + zeměpisná délka apod.), ale například také adresou (s libovolnou úrovní podrobnosti). Dva nejčastější datové modely používané pro ukládání (geo)prostorových dat jsou **vektorový** a **rastrový**.

## Typy prostorových dat

### Vektorová data

- reprezentují prvky reálného světa pomocí základních geometrických prvků: **bodů, linií a ploch (polygonů)**,
- podrobnost dat je určena podrobností souřadnic vrcholů geometrických prvků,
- jsou vhodná pro modelování a analýzu diskrétních objektů (např. poloha bodů, kategorie krajinného pokryvu),
- jsou vhodná pro tvorbu map, měření délek a geometrické výpočty,
- mohou se u nich vyskytovat problémy s topologií (mezery a překryvy),
- mezi základní formáty vektorových dat patří **Esri Shapefile, GeoJSON, GeoPackage nebo KML/GML**.

### Rastrová data

- reprezentují prvky reálného světa pomocí pravidelné mřížky tvořené pixely (*pixel = picture element*),
- podrobnost dat je určena prostorovým rozlišením rastru, tedy velikostí hrany pixelu (v metrech),
- jsou vhodná pro modelování a analýzu spojitých jevů (např. nadmořská výška, teplota, srážky),
- používají se pro obrazová data (např. družicové snímky),
- rastrové datové sady mohou dosahovat velmi velkých objemů,
- mezi základní formáty rastrových dat patří **GeoTIFF, JPEG, PNG nebo GIF**.

<!-- Ponechte zde původní obrázek:
Difference in graphical representation of vector and raster data (Geletič et al. 2019)
-->

---

## Atributové dotazy

**Atributový dotaz** (*Attribute Query*) představuje způsob výběru / filtrování prvků na základě hodnot jejich atributů. Doplňuje interaktivní způsob výběru prvků, který byl představen v prvním cvičení.

Základem atributového dotazu je výběrové pravidlo – **výraz** (*Expression*). ArcGIS Pro umožňuje vytvářet výrazy interaktivně pomocí dialogového okna, pro plné využití možností atributových dotazů je však vhodné znát také základní zápis jazyka **SQL**.

Atributový dotaz nad mapovými daty spustíte pomocí:

**Map → Select By Attributes**

Následně nastavte podmínky výběru v dialogovém okně nástroje.

<!-- Ponechte zde původní obrázky Select By Attributes. -->

!!! note "Poznámka"
    Pole `Input Rows` je automaticky předvyplněno vrstvou, která je právě vybrána v obsahu mapy (*Contents*).

V dialogovém okně lze přepínat mezi interaktivním sestavením dotazu a zápisem výrazu pomocí SQL.

### Zdroje

- *Introduction to query expressions*
- *Construct and modify queries*

---

## Prostorové dotazy

**Prostorový dotaz** (*Spatial Query*) představuje způsob výběru / filtrování prvků jedné vrstvy na základě jejich prostorové polohy vůči prvkům jiné vrstvy.

Funkce používá jako vstup:

- `Input Features` – vrstvu, ze které budou prvky vybírány,
- `Selecting Features` – vrstvu použitou pro prostorový výběr,
- `Relationship` – prostorový vztah, na jehož základě bude výběr proveden.

ArcGIS Pro nabízí různé typy prostorových vztahů. Dostupnost jednotlivých vztahů závisí na typu geometrie vstupní a výběrové vrstvy.

Mezi nejčastěji používané prostorové vztahy patří:

- `Intersect` – prvky se vzájemně protínají,
- `Contains` – prvek obsahuje jiný prvek,
- `Within` – prvek leží uvnitř jiného prvku,
- `Completely within` – prvek leží zcela uvnitř jiného prvku,
- `Have their center in` – střed prvku leží uvnitř jiného prvku,
- `Boundary touches` – hranice prvků se dotýkají,
- `Are identical to` – prvky mají shodnou geometrii,
- `Share a line segment with` – prvky sdílejí liniový segment,
- `Crossed by the outline of` – hranice jednoho prvku protíná druhý prvek.

<!--
Ponechte zde původní grafické schéma podporovaných prostorových vztahů
pro kombinace POINTS / LINES / POLYGONS.
-->

### Zdroje

- *Select features by location*
- *Select Layer By Location (Data Management)*
- *Select By Location – graphic examples*

---

## Atributové a prostorové připojení dat

Pomocí společného atributového pole, které označujeme jako **klíč**, lze propojit záznamy jedné tabulky se záznamy v jiné tabulce. Například tabulku s informacemi o vlastnících parcel lze připojit k polygonové vrstvě parcel, pokud obě tabulky obsahují společný identifikátor parcely. Propojení tabulek lze provádět několika způsoby. Data je možné spojovat také na základě jejich prostorové polohy.

Informace o vytvořených joinech jsou uloženy ve vlastnostech vrstvy. Joiny je proto možné aplikovat pouze na tabulky otevřené v mapě nebo scéně. Informace o připojených tabulkách zobrazíte po kliknutí pravým talčítkem na danou vrstvu ve vlastnostech vrstvy *(Properties → Joins)*

### Připojení atributů z tabulky

Nejčastěji se tabulka připojuje k prostorové vrstvě pomocí hodnoty atributu, který je přítomen v obou tabulkách. Názvy propojovacích atributů nemusí být shodné, jejich **datový typ však musí být stejný** – číselné hodnoty se propojují s číselnými hodnotami, textové řetězce s textovými řetězci atd.

Atributové propojení lze vytvořit pomocí nástroje *Add Join* (dočasné připojení) nebo *Join Field* (trvalé připojení). Při atributovém joinu jsou pole připojené tabulky přidána k existující atributové tabulce vrstvy. Vlastnosti polí, například jejich aliasy, viditelnost nebo formát čísel, zůstávají při přidání či odebrání joinu zachovány.

<!-- Ponechte zde původní obrázek Add Join. -->

!!! note "Poznámka"
    Při spojování tabulek je ve výchozím stavu nastavena možnost *zachovat všechny vstupní prvky* z cílové tabulky *(Keep all input records)*. Pokud toto nastavení ponecháme, pro všechny záznamy, které v cílové tabulce nemají odpovídající záznam v připojované tabulce, budou hodnoty nově připojených atributů vyplněny hodnotou `NULL`.

<!-- Ponechte zde původní obrázek Keep all records. -->

Pokud zvolíte možnost zachovat *pouze odpovídající záznamy* (*Keep only matching records*), budou z výsledku odstraněny záznamy cílové tabulky, pro které nebyl nalezen odpovídající záznam v připojované tabulce. 

<!-- Ponechte zde původní obrázek Keep only matching records. -->

### Prostorové připojení dat

Pokud vrstvy nesdílejí společný atribut, lze je propojit na základě prostorové polohy pomocí nástroje:

**Spatial Join**

Nástroj `Spatial Join` připojuje atributy dvou vrstev na základě prostorového vztahu jejich prvků.

Prostorové připojení lze využít například pro následující úlohy:

- nalezení nejbližšího prvku,
- zjištění, které prvky se nacházejí uvnitř polygonu,
- zjištění, které prvky se vzájemně protínají.

Prostorový join využívá prostorové vztahy mezi vrstvami k připojení atributů jedné vrstvy k druhé.

V závislosti na typu vztahu lze k cílovým prvkům připojit:

- přímo atributy odpovídajícího prvku,
- agregované hodnoty číselných atributů, například minimum, maximum, průměr nebo součet.

Na rozdíl od běžného atributového joinu není `Spatial Join` ve výchozím nastavení dynamický. Výsledkem je **nová výstupní vrstva**, kterou je nutné uložit.

---

# Assignment 02

## Průzkum evropských regionů

### Zadání

Prozkoumejte statistická data regionů **NUTS 2** vybraného státu pomocí atributových a prostorových dotazů.

### 1. Tematická geodatabáze

Vytvořte tematickou geodatabázi:

`Prijmeni_NazevStatu_as03.gdb`

Geodatabáze bude obsahovat následující vrstvy a tabulky:

#### Regiony NUTS 2 vybraného státu

Vytvořte polygonovou vrstvu regionů NUTS 2 nacházejících se ve vybraném státě.

Povinné atributy:

- ID regionu NUTS 2,
- název regionu NUTS 2,
- kód státu,
- počet obyvatel,
- kategorie počtu obyvatel,
- míra nezaměstnanosti,
- kategorie míry nezaměstnanosti,
- HDP,
- kategorie HDP,
- počet letišť,
- hustota letišť (počet letišť na km²),
- rozloha,
- kategorie rozlohy.

#### Sousední regiony NUTS 2

Vytvořte polygonovou vrstvu regionů NUTS 2 sousedících s vybraným státem.

Povinné atributy:

- ID regionu NUTS 2,
- název regionu NUTS 2,
- kód státu,
- počet obyvatel,
- kategorie počtu obyvatel,
- míra nezaměstnanosti,
- kategorie míry nezaměstnanosti,
- HDP,
- kategorie HDP,
- počet letišť,
- hustota letišť (počet letišť na km²),
- rozloha,
- kategorie rozlohy.

#### Letiště ve vybraném státě

Vytvořte bodovou vrstvu letišť nacházejících se ve vybraném státě.

Povinné atributy:

- ID,
- typ,
- název,
- `lat_deg`,
- `long_deg`,
- `elevation_ft`,
- ID státu,
- ID regionu NUTS 2,
- název regionu NUTS 2.

#### Letiště v okolí hranice státu

Vytvořte bodovou vrstvu letišť nacházejících se do vzdálenosti **100 km od hranic vybraného státu**.

Povinné atributy:

- ID,
- typ,
- název,
- `lat_deg`,
- `long_deg`,
- `elevation_ft`,
- ID státu,
- ID regionu NUTS 2,
- název regionu NUTS 2.

#### Souhrnná statistická tabulka

Vytvořte tabulku shrnující následující číselné charakteristiky regionů NUTS 2 pro jednotlivé státy EU.

Názvy jednotlivých regionů nemusí být součástí tabulky.

Požadované atributy:

- `count`,
- `min_area`,
- `max_area`,
- `avg_area`,
- `min_pop`,
- `max_pop`,
- `avg_pop`,
- `min_ur`,
- `max_ur`,
- `avg_ur`,
- `min_gdp`,
- `max_gdp`,
- `avg_gdp`.

### 2. Mapový poster

Vytvořte mapový poster:

`Prijmeni_NazevStatu_as03.pdf`

Poster bude obsahovat:

#### Mapa letišť

Vytvořte mapu zobrazující letiště nacházející se ve vybraném státě.

- Letiště rozlište barvou podle jejich typu (**small / medium / large**).
- Jako podklad použijte stínovaný reliéf.
- Zobrazte hranice regionů NUTS 2.

#### Mapa statistického ukazatele

Vyberte jeden ze statistických ukazatelů:

- míra nezaměstnanosti,
- HDP na obyvatele.

Ukazatel zobrazte pomocí **kartogramu**.

Použijte dvě barvy pro rozlišení regionů NUTS 2 podle toho, zda je hodnota vybraného ukazatele:

- nad průměrem EU,
- pod průměrem EU.

#### Textová část

Do posteru doplňte odpovědi / komentáře k následujícím otázkám.

**Mapa letišť:**

1. Kolik letišť se nachází ve vybraném státě?
2. Kolik letišť se nachází do vzdálenosti 100 km od hranice státu?
3. Uveďte názvy regionů NUTS 2 ve vybraném státě s nejvyšší a nejnižší hustotou letišť.

**Mapa vybraného statistického ukazatele (míra nezaměstnanosti / HDP na obyvatele):**

1. Kolik regionů NUTS 2 sousedí s vybraným státem a ke kterým státům tyto regiony náleží?
2. Uveďte názvy regionů NUTS 2 ve vybraném státě s nejvyšší a nejnižší hodnotou zvoleného statistického ukazatele.

### Data

**DATA**

### Forma odevzdání

- geodatabáze (`.gdb`),
- mapový poster ve formátu PDF.

**Termín odevzdání: 25. 10.**

---
```