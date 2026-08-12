# Přehled vlastních stylů (extra stylesheet)

__STRÁNKA: Charakteristika předmětu__{style="font-size:200%;color:var(--md-primary-fg-color)"}

## Název předmětu

Třída `page_title` zarovnává na střed a mění váhu fontu.

``` md
# Nejlepší předmět {.page_title}
```

# Nejlepší předmět {.page_title}

<hr class=level-1>

## Mřížka s highlighty předmětu

Stručně vyjmenované nejzajímavější části vyučované v rámci předmětu

Vychází z [MkDocs Material – GRIDS](https://squidfunk.github.io/mkdocs-material/reference/grids/), jen přidává třídy `grid_icon_info` (kvůli vertikálnímu zarovnání ikony a textu) a `smaller_padding` (pro zmenšení místa kolem okraje).

Vždy 2 sloupce (na užších displejích pak jen 1), 1 ikona, __text max 3 řádky__ (kvůli vzhledu)

``` md
<div class="grid cards grid_icon_info smaller_padding" markdown>

-   :material-information:{ .xl }

    Text 1

-   :material-information-outline:{ .xl }

    Text 2

-   :material-information-box:{ .xl }

    Text 3

-   :material-information-box-outline:{ .xl }

    Text 4

</div>

```

<div class="grid cards grid_icon_info smaller_padding" markdown> <!-- specificky format gridu (trida "grid_icon_info") na miru uvodni strance predmetu -->

-   :material-information:{ .xl }

    Text 1

-   :material-information-outline:{ .xl }

    Text 2

-   :material-information-box:{ .xl }

    Text 3

-   :material-information-box-outline:{ .xl }

    Text 4

</div>

<hr class=level-1>

## Galerie předmětu

Nalákat/získat pozornost pomocí sexy obrázků

Třída `gallery_container` nastavuje uspořádání obrázků, třída `no-filter` vypíná stín pod obrázky (ten je jinak pod každým obrázkem na stránce)

Všechny obrázky musí mít __stejný poměr stran__ (lze případně do budoucna vyřešit jinak)

Mělo by to asi být něco, co se v předmětu dělá. Ale to zas nebude moc sexy...

``` md
<div class="gallery_container" markdown>
![](https://dummyimage.com/600x350/a6dad4/009485){: .no-filter }
![](https://dummyimage.com/600x350/009485/a6dad4){: .no-filter }
![](https://dummyimage.com/600x350/a6dad4/009485){: .no-filter }
![](https://dummyimage.com/600x350/009485/a6dad4){: .no-filter }
![](https://dummyimage.com/600x350/009485/a6dad4){: .no-filter }
![](https://dummyimage.com/600x350/a6dad4/009485){: .no-filter }
![](https://dummyimage.com/600x350/009485/a6dad4){: .no-filter }
![](https://dummyimage.com/600x350/a6dad4/009485){: .no-filter }
</div>
```

<div class="gallery_container" markdown>
![](https://dummyimage.com/600x350/a6dad4/009485){: .no-filter }
![](https://dummyimage.com/600x350/009485/a6dad4){: .no-filter }
![](https://dummyimage.com/600x350/a6dad4/009485){: .no-filter }
![](https://dummyimage.com/600x350/009485/a6dad4){: .no-filter }
![](https://dummyimage.com/600x350/009485/a6dad4){: .no-filter }
![](https://dummyimage.com/600x350/a6dad4/009485){: .no-filter }
![](https://dummyimage.com/600x350/009485/a6dad4){: .no-filter }
![](https://dummyimage.com/600x350/a6dad4/009485){: .no-filter }
</div>

<hr class=level-1>

<br><br>



__OSTATNÍ STRÁNKY__{style="font-size:200%;color:var(--md-primary-fg-color)"}

## Horizontální oddělovače

### Normální:

```
---
```

---

### S většími mezerami:

```
<hr class=level-2>
```

<hr class=level-2>

### S většími mezerami a jinou barvou:

```
<hr class=level-1>
```

<hr class=level-1>

## Tlačítka

### Normální tlačítko (podle MkDocs Material):

```
[Zajímavý zdroj](#){ .md-button }
[Zajímavý zdroj](#){ .md-button .md-button--primary }
```

[Zajímavý zdroj](#){ .md-button }
[Zajímavý zdroj](#){ .md-button .md-button--primary }

---

### Menší tlačítko:

Třída `button_smaller`

```
[Zajímavý zdroj](#){ .md-button .button_smaller}
[Zajímavý zdroj](#){ .md-button .md-button--primary .button_smaller}
```

[Zajímavý zdroj](#){ .md-button .button_smaller}
[Zajímavý zdroj](#){ .md-button .md-button--primary .button_smaller}

---

### Tlačítko s názvem domény:

Třída `server_name`. Horní řádek (doménu) je nutné zabalit do tagu `<span>` a za něj dát line break (`<br>`)

```
[<span>server.com</span><br>Zajímavý zdroj](#){ .md-button .server_name}
[<span>server.com</span><br>Zajímavý zdroj](#){ .md-button .md-button--primary .server_name}
```

[<span>server.com</span><br>Zajímavý zdroj](#){ .md-button .server_name}
[<span>server.com</span><br>Zajímavý zdroj](#){ .md-button .md-button--primary .server_name}

---

### Tlačítko s ikonou (vedoucí na cizí web):

Třída `external_link_icon`. Používá to třeba idnes.cz.

```
[Zajímavý zdroj](#){ .md-button .external_link_icon}
[Zajímavý zdroj](#){ .md-button .md-button--primary .external_link_icon}

[Zajímavý zdroj](#){ .md-button .button_smaller .external_link_icon}
[Zajímavý zdroj](#){ .md-button .md-button--primary .button_smaller .external_link_icon}
```

[Zajímavý zdroj](#){ .md-button .external_link_icon}
[Zajímavý zdroj](#){ .md-button .md-button--primary .external_link_icon}

[Zajímavý zdroj](#){ .md-button .button_smaller .external_link_icon}
[Zajímavý zdroj](#){ .md-button .md-button--primary .button_smaller .external_link_icon}

Při použití tlačítka s názvem domény je nutné použít třídu `external_link_icon_small` (kvůli velikosti ikony).

```
[<span>server.com</span><br>Zajímavý zdroj](#){ .md-button .server_name .external_link_icon_small}
[<span>server.com</span><br>Zajímavý zdroj](#){ .md-button .md-button--primary .server_name .external_link_icon_small}
```

[<span>server.com</span><br>Zajímavý zdroj](#){ .md-button .server_name .external_link_icon_small}
[<span>server.com</span><br>Zajímavý zdroj](#){ .md-button .md-button--primary .server_name .external_link_icon_small}

---

### Sada tlačítek

Pokud je __tlačítek více za sebou__, lze použít třídu `button_array`. Ta se musí přidat odstavci (nikoli prvku), takže je nutné ji __psát na řádek pod definici tlačítek__. Upravuje zarovnání (na střed) a velikost řádkování (pokud se řada nevejde na jeden řádek). Dá se použít, i když je tlačítko na řádku jen jedno.

```
[Zajímavý zdroj](#){ .md-button .button_smaller}
[Zajímavý zdroj](#){ .md-button .md-button--primary .button_smaller}
[Zajímavý zdroj](#){ .md-button .button_smaller .external_link_icon}
[Zajímavý zdroj](#){ .md-button .md-button--primary .button_smaller .external_link_icon}
[Zajímavý zdroj](#){ .md-button .md-button--primary}
[Zajímavý zdroj](#){ .md-button .button_smaller}
[Zajímavý zdroj](#){ .md-button .md-button--primary .button_smaller}
[Zajímavý zdroj](#){ .md-button .md-button--primary .button_smaller}
[Zajímavý zdroj](#){ .md-button .button_smaller}
[Zajímavý zdroj](#){ .md-button .md-button--primary .button_smaller}
[<span>server.com</span><br>Zajímavý zdroj](#){ .md-button .server_name}
[<span>server.com</span><br>Zajímavý zdroj](#){ .md-button .md-button--primary .server_name}
[<span>server.com</span><br>Zajímavý zdroj](#){ .md-button .server_name .external_link_icon_small}
[Zajímavý zdroj](#){ .md-button .button_smaller .external_link_icon}
[Zajímavý zdroj](#){ .md-button .md-button--primary .button_smaller .external_link_icon}
[<span>server.com</span><br>Zajímavý zdroj](#){ .md-button .md-button--primary .server_name .external_link_icon_small}
{.button_array}
```

[Zajímavý zdroj](#){ .md-button .button_smaller}
[Zajímavý zdroj](#){ .md-button .md-button--primary .button_smaller}
[Zajímavý zdroj](#){ .md-button .button_smaller .external_link_icon}
[Zajímavý zdroj](#){ .md-button .md-button--primary .button_smaller .external_link_icon}
[Zajímavý zdroj](#){ .md-button .md-button--primary}
[Zajímavý zdroj](#){ .md-button .button_smaller}
[Zajímavý zdroj](#){ .md-button .md-button--primary .button_smaller}
[Zajímavý zdroj](#){ .md-button .md-button--primary .button_smaller}
[Zajímavý zdroj](#){ .md-button .button_smaller}
[Zajímavý zdroj](#){ .md-button .md-button--primary .button_smaller}
[<span>server.com</span><br>Zajímavý zdroj](#){ .md-button .server_name}
[<span>server.com</span><br>Zajímavý zdroj](#){ .md-button .md-button--primary .server_name}
[<span>server.com</span><br>Zajímavý zdroj](#){ .md-button .server_name .external_link_icon_small}
[Zajímavý zdroj](#){ .md-button .button_smaller .external_link_icon}
[Zajímavý zdroj](#){ .md-button .md-button--primary .button_smaller .external_link_icon}
[<span>server.com</span><br>Zajímavý zdroj](#){ .md-button .md-button--primary .server_name .external_link_icon_small}
{.button_array}

<hr class="level-1">

## Tabulky

### Tabulka s kompaktnějším zobrazením

Třída `table_small_padding`

```
<div class="table_small_padding" markdown>
| Method      | Description                          |
| ----------- | ------------------------------------ |
| `GET`       | :material-check:     Fetch resource  |
| `PUT`       | :material-check-all: Update resource |
| `DELETE`    | :material-close:     Delete resource |
</div>
```

<div class="table_small_padding" markdown>
| Method      | Description                          |
| ----------- | ------------------------------------ |
| `GET`       | :material-check:     Fetch resource  |
| `PUT`       | :material-check-all: Update resource |
| `DELETE`    | :material-close:     Delete resource |
</div>

---

### Tabulka s ještě kompaktnějším zobrazením

Třída `table_no_padding`

```
<div class="table_no_padding" markdown>
| Method      | Description                          |
| ----------- | ------------------------------------ |
| `GET`       | :material-check:     Fetch resource  |
| `PUT`       | :material-check-all: Update resource |
| `DELETE`    | :material-close:     Delete resource |
</div>
```

<div class="table_no_padding" markdown>
| Method      | Description                          |
| ----------- | ------------------------------------ |
| `GET`       | :material-check:     Fetch resource  |
| `PUT`       | :material-check-all: Update resource |
| `DELETE`    | :material-close:     Delete resource |
</div>

---

### Tabulka bez záhlaví

Třída `table_headerless`, __záhlaví se přesto musí vyplnit__ (jinak se tabulka nevytvoří), lze ho nechat prázdné

```
<div class="table_headerless" markdown>
|             |                                      |
| ----------- | ------------------------------------ |
| `GET`       | :material-check:     Fetch resource  |
| `PUT`       | :material-check-all: Update resource |
| `DELETE`    | :material-close:     Delete resource |
</div>
```

<div class="table_headerless" markdown>
|             |                                      |
| ----------- | ------------------------------------ |
| `GET`       | :material-check:     Fetch resource  |
| `PUT`       | :material-check-all: Update resource |
| `DELETE`    | :material-close:     Delete resource |
</div>

---

### Tabulka zarovnaná na střed

Třída `table_centered`

```
<div class="table_centered" markdown>
| Method      | Description                          |
| ----------- | ------------------------------------ |
| `GET`       | :material-check:     Fetch resource  |
| `PUT`       | :material-check-all: Update resource |
| `DELETE`    | :material-close:     Delete resource |
</div>
```

<div class="table_centered" markdown>
| Method      | Description                          |
| ----------- | ------------------------------------ |
| `GET`       | :material-check:     Fetch resource  |
| `PUT`       | :material-check-all: Update resource |
| `DELETE`    | :material-close:     Delete resource |
</div>

<hr class="level-1">

## Obrázky

### Sada obrázků s ikonami

Třída `process_container`, obrázky jsou __vždy pouze na jednom řádku__ (na užším displeji se zmenší, ale nezalamují se), jejich __maximální velikost je 150 px__, mezery mezi nimi se mění v závislosti na šířce displeje.

```
![](https://dummyimage.com/600x350/a6dad4/009485)
![](https://dummyimage.com/600x350/009485/a6dad4)
![](https://dummyimage.com/600x350/a6dad4/009485)
{.process_container}
```

![](https://dummyimage.com/600x350/a6dad4/009485)
![](https://dummyimage.com/600x350/009485/a6dad4)
![](https://dummyimage.com/600x350/a6dad4/009485)
{.process_container}

Obrázky se třídou `process_icon` slouží jako __ikony mezi obrázky__. Lze tak vyjádřit např. proces pracovního postupu. Ikony mění barvu v tmavém režimu.

```
![](https://dummyimage.com/600x350/a6dad4/009485)
![](../assets/cviceni1/arrow.svg){.off-glb .process_icon}
![](https://dummyimage.com/600x350/009485/a6dad4)
![](../assets/cviceni1/arrow.svg){.off-glb .process_icon}
![](https://dummyimage.com/600x350/a6dad4/009485)
{.process_container}
```

![](https://dummyimage.com/600x350/a6dad4/009485)
![](../assets/cviceni1/arrow.svg){.off-glb .process_icon}
![](https://dummyimage.com/600x350/009485/a6dad4)
![](../assets/cviceni1/arrow.svg){.off-glb .process_icon}
![](https://dummyimage.com/600x350/a6dad4/009485)
{.process_container}

Třída `off-glb` vypíná efekt "GLightBox", třída `no-filter` vypíná stín pod obrázky (ten je jinak pod každým obrázkem na stránce)

<hr class="level-1">

## Zvýraznění textu

### Změna barvy

Třída `primary_color` __změní barvu textu na primární barvu webu__. Třídu lze použít pouze na text uzavřený mezi tagy. Aby bylo kódu méně, dá se použít oddělení používané pro tučné písmo či kurzívu a následně efekt tučného písma či kurzívy potlačit třídou `no-dec`.

```
Katedra geomatiky se zabývá 
_:material-globe-model: geografickými informačními systémy_{.primary_color}, 
__:material-satellite-variant: dálkovým průzkumem Země__{.primary_color}, 
_:octicons-device-camera-video-16: geodetickými přístroji_{.no-dec .primary_color}, 
__:material-map-outline: katastrem nemovitostí__{.no-dec .primary_color} a podobně.
```

Katedra geomatiky se zabývá _:material-globe-model: geografickými informačními systémy_{.primary_color}, __:material-satellite-variant: dálkovým průzkumem Země__{.primary_color}, _:octicons-device-camera-video-16: geodetickými přístroji_{.no-dec .primary_color}, __:material-map-outline: katastrem nemovitostí__{.no-dec .primary_color} a podobně.

---

### Podtržení textu s šedým pozadím

Třída `underlined` nastaví __spodní podtržení__ v primární barvě webu. Třídu lze použít pouze na text uzavřený mezi tagy. Aby bylo kódu méně, dá se použít oddělení používané pro tučné písmo či kurzívu a následně efekt tučného písma či kurzívy potlačit třídou `no-dec`. Zvýrazněný text se nezalamuje.

```
Katedra geomatiky se zabývá
_:material-globe-model: geografickými informačními systémy_{.underlined}, 
__:material-satellite-variant: dálkovým průzkumem Země__{.underlined}, 
_:octicons-device-camera-video-16: geodetickými přístroji_{.no-dec .underlined}, 
__:material-map-outline: katastrem nemovitostí__{.no-dec .underlined} a podobně.
```

Katedra geomatiky se zabývá _:material-globe-model: geografickými informačními systémy_{.underlined} __:material-satellite-variant: dálkovým průzkumem Země__{.underlined} _:octicons-device-camera-video-16: geodetickými přístroji_{.no-dec .underlined} __:material-map-outline: katastrem nemovitostí__{.no-dec .underlined} a podobně.

---

### Obtažení textu s šedým pozadím

Třída `outlined` nastaví __celkové ohraničení__ v primární barvě webu. Třídu lze použít pouze na text uzavřený mezi tagy. Aby bylo kódu méně, dá se použít oddělení používané pro tučné písmo či kurzívu a následně efekt tučného písma či kurzívy potlačit třídou `no-dec`. Zvýrazněný text se nezalamuje.

```
Katedra geomatiky se zabývá
_:material-globe-model: geografickými informačními systémy_{.outlined}, 
__:material-satellite-variant: dálkovým průzkumem Země__{.outlined}, 
_:octicons-device-camera-video-16: geodetickými přístroji_{.no-dec .outlined}, 
__:material-map-outline: katastrem nemovitostí__{.no-dec .outlined} a podobně.
```

Katedra geomatiky se zabývá _:material-globe-model: geografickými informačními systémy_{.outlined} __:material-satellite-variant: dálkovým průzkumem Země__{.outlined} _:octicons-device-camera-video-16: geodetickými přístroji_{.no-dec .outlined} __:material-map-outline: katastrem nemovitostí__{.no-dec .outlined} a podobně.

---

### Obtažení textu s šedým pozadím a fontem kódu

Třída `outlined_code` nastaví __celkové ohraničení__ v primární barvě webu a font ve stylu `Code Blocks`. Třídu lze použít pouze na text uzavřený mezi tagy. Aby bylo kódu méně, dá se použít oddělení používané pro tučné písmo či kurzívu. Zde není nutné přidávat třídu `no-dec` potlačující efekty tučného písma či kurzívy, to proběhne automaticky. Zvýrazněný text se nezalamuje.

```
Katedra geomatiky se zabývá 
_:material-globe-model: geografickými informačními systémy_{.outlined_code} 
__:material-satellite-variant: dálkovým průzkumem Země__{.outlined_code} 
_:octicons-device-camera-video-16: geodetickými přístroji_{.outlined_code} 
__:material-map-outline: katastrem nemovitostí__{.outlined_code} a podobně.
```

Katedra geomatiky se zabývá _:material-globe-model: geografickými informačními systémy_{.outlined_code} __:material-satellite-variant: dálkovým průzkumem Země__{.outlined_code} _:octicons-device-camera-video-16: geodetickými přístroji_{.outlined_code} __:material-map-outline: katastrem nemovitostí__{.outlined_code} a podobně.

---

### Ikona před textem

Pro některá častá slova lze použít zvýraznění ikonou. Třídu lze použít pouze na text uzavřený mezi tagy. Aby bylo kódu méně, dá se použít oddělení používané pro tučné písmo či kurzívu a následně efekt tučného písma či kurzívy potlačit třídou `no-dec`. Efekt je možné podpořit i např. změnou barvy (viz výše).

- __např.__ (třída `icon-example`):

```
_např._{.primary_color .icon-example .no-dec}
```

_např._{.primary_color .icon-example .no-dec}

- __pozor__ (třída `icon-exclm`):

```
__pozor__{style="color:#c22521;" .icon-exclm .no-dec}
```

__pozor__{style="color:#c22521;" .icon-exclm .no-dec}


<hr class="level-1">

## Záložky (Tabs)

### Záložky zarovnané na střed

Třída `centered_tab_labels`

```
<div class="centered_tab_labels" markdown>
=== "Záložka 1"

    ![](https://dummyimage.com/600x350/a6dad4/009485)
    ![](https://dummyimage.com/600x350/009485/a6dad4)
    ![](https://dummyimage.com/600x350/a6dad4/009485)
    {.process_container}

    <figcaption>Popisek obrázku</figcaption>

=== "Záložka 2"
    
    ![](https://dummyimage.com/600x350/a6dad4/009485)
    ![](https://dummyimage.com/600x350/009485/a6dad4)
    {.process_container}

    <figcaption>Popisek obrázku</figcaption>

=== "Záložka 3"

    ![](https://dummyimage.com/600x350/a6dad4/009485)
    {.process_container}

    <figcaption>Popisek obrázku</figcaption>
</div>
```

<div class="centered_tab_labels" markdown>
=== "Záložka 1"

    ![](https://dummyimage.com/600x350/a6dad4/009485)
    ![](https://dummyimage.com/600x350/009485/a6dad4)
    ![](https://dummyimage.com/600x350/a6dad4/009485)
    {.process_container}

    <figcaption>Popisek obrázku</figcaption>

=== "Záložka 2"
    
    ![](https://dummyimage.com/600x350/a6dad4/009485)
    ![](https://dummyimage.com/600x350/009485/a6dad4)
    {.process_container}

    <figcaption>Popisek obrázku</figcaption>

=== "Záložka 3"

    ![](https://dummyimage.com/600x350/a6dad4/009485)
    {.process_container}

    <figcaption>Popisek obrázku</figcaption>
</div>


<hr class="level-1">

## Admonitions (custom)

### Poznámka (note-grey)

```
<div class="table_centered table_no_padding" markdown>
???+ note-grey "Poznámka"

    Libovolný text, _např._{.primary_color .icon-example .no-dec} __tučné písmo__, _kurzíva_, `kód`, _:material-format-color-highlight: zvýraznění_{.no-dec .outlined} obrázek

    ![](https://dummyimage.com/600x350/a6dad4/009485)
    {.process_container}

    Tabulka (výše zmíněné úpravy se musí použít v `div` o úroveň výše!)

    | záhlaví |    záhlaví    |
    | ------- | ------------- |
    | obsah   | obsah tabulky |
    | obsah   | obsah tabulky |
</div>
```

<div class="table_centered table_no_padding" markdown>
???+ note-grey "Poznámka"

    Libovolný text, _např._{.primary_color .icon-example .no-dec} __tučné písmo__, _kurzíva_, `kód`, _:material-format-color-highlight: zvýraznění_{.no-dec .outlined} obrázek

    ![](https://dummyimage.com/600x350/a6dad4/009485)
    {.process_container}

    Tabulka (výše zmíněné úpravy se musí použít v `div` o úroveň výše!)

    | záhlaví |    záhlaví    |
    | ------- | ------------- |
    | obsah   | obsah tabulky |
    | obsah   | obsah tabulky |
</div>

---

### Admonition v primární barvě webu (task-fg-color)

```
???+ task-fg-color "Úkol"

    Obsah úkolu
```

???+ task-fg-color "Úkol"

    Obsah úkolu

[více o admonitions](https://squidfunk.github.io/mkdocs-material/reference/admonitions/)

<br><br><br><br>